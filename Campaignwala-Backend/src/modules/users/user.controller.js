const jwt = require('jsonwebtoken');
const User = require('./user.model');
const { sendOTPEmail, sendWelcomeEmail } = require('../../utils/emailService');
const { parseExcelFile, deleteFile, validateRequiredFields } = require('../../utils/excelParser');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Legacy function - kept for backward compatibility
const sendOTP = async (req, res) => {
    try {
        return res.status(410).json({
            success: false,
            message: 'This endpoint is deprecated. Please use email-based authentication instead.',
            deprecated: true,
            alternative: 'Use /api/users/login with email and password'
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP'
        });
    }
};

// Register user - Step 1: Send OTP to email
const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phoneNumber } = req.body;

        console.log('📥 Registration request received:', {
            name: name || 'MISSING',
            email: email || 'MISSING',
            password: password ? '***' : 'MISSING',
            confirmPassword: confirmPassword ? '***' : 'MISSING',
            phoneNumber: phoneNumber || 'MISSING'
        });

        // Validation
        if (!name || !email || !password || !confirmPassword || !phoneNumber) {
            console.log('❌ Validation failed - missing fields');
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, confirm password, and phone number are required'
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate phone number format
        if (!/^[0-9]{10}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format. Must be 10 digits'
            });
        }

        // Check if user already exists with email
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if user already exists with phone number
        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            return res.status(409).json({
                success: false,
                message: 'Phone number already registered'
            });
        }

        // Check if temporary user exists (for OTP verification)
        let user = await User.findOne({ email, isVerified: false });
        
        if (user) {
            // Update existing temporary user
            user.name = name;
            user.password = password;
            user.phoneNumber = phoneNumber;
        } else {
            // Create new temporary user (not verified yet)
            user = new User({
                name,
                email,
                password,
                phoneNumber,
                isVerified: false
            });
        }

        // Check OTP rate limiting
        if (!user.canSendOtp()) {
            return res.status(429).json({
                success: false,
                message: 'Too many OTP attempts. Please try again later.'
            });
        }

        // Generate and set registration OTP
        const otp = user.setOtp('registration');
        user.incrementOtpAttempts();
        await user.save();

        console.log('📧 Sending registration OTP to:', email);
        console.log('🔑 Registration OTP:', otp);

        // Send OTP via email with improved error handling
        const emailResult = await sendOTPEmail(email, name, otp, 'registration');

        return res.json({
            success: true,
            message: emailResult.developmentMode 
                ? 'OTP generated (Email service unavailable - check console)' 
                : 'OTP sent to your email. Please verify to complete registration.',
            requireOTP: true,
            data: {
                email: email,
                name: name,
                otpSent: !emailResult.developmentMode,
                otp: otp, // Always include OTP for development/Render
                developmentMode: emailResult.developmentMode || false
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const message = field === 'email' 
                ? 'Email already registered' 
                : 'Phone number already registered';
            return res.status(409).json({
                success: false,
                message
            });
        }

        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errorMessages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
};

// Verify Registration OTP - Step 2: Complete registration
const verifyRegistrationOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Find temporary user
        const user = await User.findOne({ email, isVerified: false });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Registration session not found. Please start registration again.'
            });
        }

        // Verify OTP
        if (!user.verifyOtp(otp, 'registration')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Mark user as verified and complete registration
        user.isVerified = true;
        user.clearOtp('registration');
        await user.save();

        // Send welcome email (don't block registration if it fails)
        try {
            await sendWelcomeEmail(user.email, user.name);
        } catch (emailError) {
            console.error('❌ Failed to send welcome email:', emailError);
            // Continue registration even if welcome email fails
        }

        // Generate token
        const token = generateToken(user._id);

        // Store session info
        user.activeSession = token;
        user.sessionDevice = req.headers['user-agent'] || 'Unknown Device';
        user.sessionIP = req.ip || req.connection.remoteAddress || 'Unknown IP';
        user.lastActivity = new Date();
        await user.save();

        console.log('✅ User registered successfully:', user.email);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Welcome to our platform.',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    isVerified: user.isVerified,
                    isActive: user.isActive
                },
                token
            }
        });

    } catch (error) {
        console.error('Verify registration OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration verification failed'
        });
    }
};

// Login user with email and password, then send OTP to email
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('📥 Login request received for email:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email (must be verified)
        const user = await User.findOne({ email, isVerified: true });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password, or account not verified'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check OTP rate limiting
        if (!user.canSendOtp()) {
            return res.status(429).json({
                success: false,
                message: 'Too many OTP attempts. Please try again later.'
            });
        }

        // Generate and set login OTP
        const otp = user.setOtp('login');
        user.incrementOtpAttempts();
        await user.save();

        console.log('📧 Sending login OTP to email:', user.email);
        console.log('🔑 Login OTP:', otp);

        // Send OTP via email with improved error handling
        const emailResult = await sendOTPEmail(user.email, user.name || 'User', otp, 'login');

        return res.json({
            success: true,
            message: emailResult.developmentMode
                ? 'OTP generated (Email service unavailable - check console)'
                : 'OTP sent to your email. Please verify to complete login.',
            requireOTP: true,
            data: {
                email: user.email,
                name: user.name,
                role: user.role,
                otpSent: !emailResult.developmentMode,
                otp: otp, // Always include OTP
                developmentMode: emailResult.developmentMode || false
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

// Verify Login OTP
const verifyLoginOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email, isVerified: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found or account not verified'
            });
        }

        // Verify OTP
        if (!user.verifyOtp(otp, 'login')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Clear OTP after successful verification
        user.clearOtp('login');

        // Generate token
        const token = generateToken(user._id);

        // Store session info for single device login
        user.activeSession = token;
        user.sessionDevice = req.headers['user-agent'] || 'Unknown Device';
        user.sessionIP = req.ip || req.connection.remoteAddress || 'Unknown IP';
        user.lastActivity = new Date();
        
        await user.save();

        console.log('✅ User logged in successfully:', user.email);
        console.log('👤 Role:', user.role);
        console.log('📱 Device:', user.sessionDevice);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    isVerified: user.isVerified,
                    isActive: user.isActive
                },
                token
            }
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed'
        });
    }
};

// Admin Login - Same as user login but checks for admin role
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('📥 Admin login request received for email:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email and check if admin
        const user = await User.findOne({ email, role: 'admin', isVerified: true });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password, or insufficient permissions'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Admin account is deactivated.'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check OTP rate limiting
        if (!user.canSendOtp()) {
            return res.status(429).json({
                success: false,
                message: 'Too many OTP attempts. Please try again later.'
            });
        }

        // Generate and set login OTP
        const otp = user.setOtp('login');
        user.incrementOtpAttempts();
        await user.save();

        console.log('📧 Sending admin login OTP to email:', user.email);
        console.log('🔑 Admin Login OTP:', otp);

        // Send OTP via email with improved error handling
        const emailResult = await sendOTPEmail(user.email, user.name || 'Admin', otp, 'login');

        return res.json({
            success: true,
            message: emailResult.developmentMode
                ? 'OTP generated (Email service unavailable - check console)'
                : 'OTP sent to your email. Please verify to complete admin login.',
            requireOTP: true,
            data: {
                email: user.email,
                name: user.name,
                role: user.role,
                otpSent: !emailResult.developmentMode,
                otp: otp,
                developmentMode: emailResult.developmentMode || false
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Admin login failed'
        });
    }
};

// Forgot Password - Send OTP to email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists and is verified
        const user = await User.findOne({ email, isVerified: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No verified account found with this email'
            });
        }

        // Check OTP rate limiting
        if (!user.canSendOtp()) {
            return res.status(429).json({
                success: false,
                message: 'Too many OTP attempts. Please try again later.'
            });
        }

        // Generate and set reset password OTP
        const otp = user.setOtp('reset');
        user.incrementOtpAttempts();
        await user.save();

        console.log('📧 Sending password reset OTP to:', user.email);
        console.log('🔑 Reset OTP:', otp);

        // Send OTP via email with improved error handling
        const emailResult = await sendOTPEmail(user.email, user.name || 'User', otp, 'password-reset');

        return res.json({
            success: true,
            message: emailResult.developmentMode
                ? 'Password reset OTP generated (Email service unavailable - check console)'
                : 'Password reset OTP sent to your email',
            data: {
                email: user.email,
                otp: otp, // Always include OTP
                developmentMode: emailResult.developmentMode || false
            }
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send reset OTP'
        });
    }
};

// Reset Password with OTP
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, new password, and confirm password are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Find user
        const user = await User.findOne({ email, isVerified: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify OTP
        if (!user.verifyOtp(otp, 'reset')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Update password and clear OTP
        user.password = newPassword;
        user.clearOtp('reset');
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password'
        });
    }
};

// Logout user (Clear active session)
const logout = async (req, res) => {
    try {
        const user = req.user;

        // Clear session info
        user.activeSession = null;
        user.sessionDevice = null;
        user.sessionIP = null;
        user.lastActivity = null;
        await user.save();

        console.log('✅ User logged out successfully:', user.email);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to logout'
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: { user: req.user }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, phoneNumber } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields if provided
        if (name !== undefined) user.name = name;
        if (phoneNumber !== undefined) {
            // Validate phone number format
            if (!/^[0-9]{10}$/.test(phoneNumber)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number format. Must be 10 digits'
                });
            }
            
            // Check if phone number is already taken by another user
            const existingUser = await User.findOne({ 
                phoneNumber, 
                _id: { $ne: userId } 
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone number already registered by another user'
                });
            }
            
            user.phoneNumber = phoneNumber;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password, new password, and confirm password are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get user with password
        const user = await User.findById(userId);

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        return res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

// Send Email OTP for verification (for profile updates)
const sendEmailOTP = async (req, res) => {
    try {
        const userId = req.user._id;
        const { purpose } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.email) {
            return res.status(400).json({
                success: false,
                message: 'No email associated with this account'
            });
        }

        // Check rate limiting
        if (!user.canSendOtp()) {
            return res.status(429).json({
                success: false,
                message: 'Too many OTP attempts. Please try again later'
            });
        }

        // Generate static OTP for development (always 1006)
        const otp = '1006';
        console.log('🔑 Generated Static OTP:', otp);

        // Store OTP in user document
        user.emailOtp = otp;
        user.emailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        user.incrementOtpAttempts();
        await user.save();

        // Try to send OTP to email
        console.log('📧 Sending OTP to email:', user.email);
        const emailResult = await sendOTPEmail(user.email, user.name || 'User', otp, purpose || 'verification');

        res.json({
            success: true,
            message: emailResult.developmentMode 
                ? 'OTP generated (Email service unavailable - check console)' 
                : 'OTP sent to your email successfully',
            data: {
                email: user.email,
                expiresIn: 600,
                otp: otp,
                developmentMode: emailResult.developmentMode || false
            }
        });

    } catch (error) {
        console.error('Send Email OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP'
        });
    }
};

// Verify Email OTP
const verifyEmailOTP = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'OTP is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if OTP exists and not expired
        if (!user.emailOtp || !user.emailOtpExpires) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found. Please request a new one'
            });
        }

        if (Date.now() > user.emailOtpExpires) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one'
            });
        }

        // Verify OTP
        if (user.emailOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Clear OTP after successful verification
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });

    } catch (error) {
        console.error('Verify Email OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP'
        });
    }
};


// Admin: Get all users
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, isVerified, search } = req.query;

        const query = {};

        if (role) query.role = role;
        if (isVerified !== undefined) query.isVerified = isVerified === 'true';
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password -emailOtp -emailOtpExpires')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users'
        });
    }
};

// Admin: Get user by ID
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password -emailOtp -emailOtpExpires');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User retrieved successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user'
        });
    }
};

// Admin: Update user role
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "user" or "admin"'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true }
        ).select('-password -emailOtp -emailOtpExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user role'
        });
    }
};

// Admin: Toggle user active status
const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
};

// Admin: Mark user as Ex
const markUserAsEx = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Mark user as Ex (inactive + isEx flag)
        user.isActive = false;
        user.isEx = true;
        await user.save();

        res.json({
            success: true,
            message: 'User marked as Ex successfully',
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Mark user as Ex error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark user as Ex'
        });
    }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};

// Get dashboard stats (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const activeUsers = await User.countDocuments({ isActive: true });

        // Get recent registrations (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentRegistrations = await User.countDocuments({
            createdAt: { $gte: weekAgo }
        });

        res.json({
            success: true,
            message: 'Dashboard stats retrieved successfully',
            data: {
                totalUsers,
                verifiedUsers,
                adminUsers,
                activeUsers,
                recentRegistrations,
                unverifiedUsers: totalUsers - verifiedUsers,
                inactiveUsers: totalUsers - activeUsers
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard stats'
        });
    }
};

// Update KYC Details (Personal + Documents + Bank)
const updateKYCDetails = async (req, res) => {
    try {
        console.log('🔵 ===== UPDATE KYC DETAILS CALLED =====');
        console.log('🔵 User object:', req.user);
        console.log('🔵 User ID from token:', req.user?._id);
        console.log('🔵 Request body:', JSON.stringify(req.body, null, 2));
        
        const userId = req.user._id;
        
        // Extract data from nested objects or direct properties
        const personalDetails = req.body.personalDetails || {};
        const kycDocuments = req.body.kycDocuments || {};
        const bankDetails = req.body.bankDetails || {};
        
        // Personal Details - can come from personalDetails object or directly
        const firstName = req.body.firstName || personalDetails.firstName;
        const lastName = req.body.lastName || personalDetails.lastName;
        const dob = req.body.dob || personalDetails.dob;
        const gender = req.body.gender || personalDetails.gender;
        const address1 = req.body.address1 || personalDetails.address1;
        const city = req.body.city || personalDetails.city;
        const state = req.body.state || personalDetails.state;
        const zip = req.body.zip || personalDetails.zip;
        const country = req.body.country || personalDetails.country;
        
        // KYC Documents - can come from kycDocuments object or directly
        const panNumber = req.body.panNumber || kycDocuments.panNumber;
        const aadhaarNumber = req.body.aadhaarNumber || kycDocuments.aadhaarNumber;
        const panImage = req.body.panImage || kycDocuments.panImage;
        const aadhaarImage = req.body.aadhaarImage || kycDocuments.aadhaarImage;
        
        // Bank Details - can come from bankDetails object or directly
        const bankName = req.body.bankName || bankDetails.bankName;
        const accountHolderName = req.body.accountHolderName || bankDetails.accountHolderName;
        const accountNumber = req.body.accountNumber || bankDetails.accountNumber;
        const ifscCode = req.body.ifscCode || bankDetails.ifscCode;
        const branchAddress = req.body.branchAddress || bankDetails.branchAddress;
        const upiId = req.body.upiId || bankDetails.upiId;
        
        console.log('🟡 Extracted Bank Details:', { bankName, accountHolderName, accountNumber, ifscCode, branchAddress, upiId });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update Personal Details
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (dob !== undefined) user.dob = dob;
        if (gender !== undefined) user.gender = gender;
        if (address1 !== undefined) user.address1 = address1;
        if (city !== undefined) user.city = city;
        if (state !== undefined) user.state = state;
        if (zip !== undefined) user.zip = zip;
        if (country !== undefined) user.country = country;

        // Update KYC Documents
        if (panNumber !== undefined) user.kycDetails.panNumber = panNumber;
        if (aadhaarNumber !== undefined) user.kycDetails.aadhaarNumber = aadhaarNumber;
        if (panImage !== undefined) user.kycDetails.panImage = panImage;
        if (aadhaarImage !== undefined) user.kycDetails.aadhaarImage = aadhaarImage;

        // Update Bank Details
        if (bankName !== undefined) user.bankDetails.bankName = bankName;
        if (accountHolderName !== undefined) user.bankDetails.accountHolderName = accountHolderName;
        if (accountNumber !== undefined) user.bankDetails.accountNumber = accountNumber;
        if (ifscCode !== undefined) user.bankDetails.ifscCode = ifscCode;
        if (branchAddress !== undefined) user.bankDetails.branchAddress = branchAddress;
        if (upiId !== undefined) user.bankDetails.upiId = upiId;

        // Check if this is a full KYC submission (has all required fields)
        const hasAllRequiredFields = panNumber && aadhaarNumber && accountNumber && firstName && lastName;
        console.log('🔵 Has all required fields?', hasAllRequiredFields);
        console.log('🔵 Current KYC Status:', user.kycDetails.kycStatus);
        
        // If this is a full submission and status is not already approved, set to pending
        if (hasAllRequiredFields && user.kycDetails.kycStatus !== 'approved') {
            console.log('🟢 Setting KYC status to PENDING');
            user.kycDetails.kycStatus = 'pending';
            user.kycDetails.kycSubmittedAt = new Date();
            // Clear rejection reason when resubmitting
            user.kycDetails.kycRejectionReason = '';
            user.kycDetails.kycRejectedAt = null;
        }

        await user.save();
        console.log('🟢 User saved successfully. Final KYC Status:', user.kycDetails.kycStatus);

        res.json({
            success: true,
            message: 'KYC details updated successfully',
            data: user
        });

    } catch (error) {
        console.error('Update KYC details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update KYC details',
            error: error.message
        });
    }
};

// Get KYC Details
const getKYCDetails = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('-password -otpAttempts -lastOtpSent -emailOtp -emailOtpExpires');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'KYC details retrieved successfully',
            data: {
                // Personal Details
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                dob: user.dob || '',
                gender: user.gender || '',
                address1: user.address1 || '',
                city: user.city || '',
                state: user.state || '',
                zip: user.zip || '',
                country: user.country || 'India',
                // KYC Documents
                kycDetails: {
                    panNumber: user.kycDetails?.panNumber || '',
                    aadhaarNumber: user.kycDetails?.aadhaarNumber || '',
                    panImage: user.kycDetails?.panImage || '',
                    aadhaarImage: user.kycDetails?.aadhaarImage || '',
                    kycStatus: user.kycDetails?.kycStatus || 'not_submitted',
                    kycSubmittedAt: user.kycDetails?.kycSubmittedAt || null,
                    kycApprovedAt: user.kycDetails?.kycApprovedAt || null,
                    kycRejectedAt: user.kycDetails?.kycRejectedAt || null,
                    kycRejectionReason: user.kycDetails?.kycRejectionReason || ''
                },
                // Bank Details
                bankDetails: {
                    bankName: user.bankDetails?.bankName || '',
                    accountHolderName: user.bankDetails?.accountHolderName || '',
                    accountNumber: user.bankDetails?.accountNumber || '',
                    ifscCode: user.bankDetails?.ifscCode || '',
                    branchAddress: user.bankDetails?.branchAddress || '',
                    upiId: user.bankDetails?.upiId || ''
                }
            }
        });

    } catch (error) {
        console.error('Get KYC details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get KYC details',
            error: error.message
        });
    }
};

// Admin: Get all pending KYC requests
const getPendingKYCRequests = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 100,
            search = '',
            sortBy = 'kycDetails.kycSubmittedAt',
            order = 'desc'
        } = req.query;

        // Build filter
        const filter = {
            'kycDetails.kycStatus': 'pending'
        };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const sortOrder = order === 'desc' ? -1 : 1;

        const users = await User.find(filter)
            .select('-password -otpAttempts -lastOtpSent -emailOtp -emailOtpExpires')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);

        res.json({
            success: true,
            message: 'Pending KYC requests retrieved successfully',
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get pending KYC requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get pending KYC requests',
            error: error.message
        });
    }
};

// Admin: Approve KYC
const approveKYC = async (req, res) => {
    try {
        const { userId } = req.params;
        const { remarks } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.kycDetails.kycStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'KYC is not in pending status'
            });
        }

        user.kycDetails.kycStatus = 'approved';
        user.kycDetails.kycApprovedAt = new Date();
        user.kycDetails.kycRejectionReason = '';
        if (remarks) {
            user.kycDetails.remarks = remarks;
        }

        await user.save();

        res.json({
            success: true,
            message: 'KYC approved successfully',
            data: user
        });

    } catch (error) {
        console.error('Approve KYC error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve KYC',
            error: error.message
        });
    }
};

// Admin: Reject KYC
const rejectKYC = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.kycDetails.kycStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'KYC is not in pending status'
            });
        }

        user.kycDetails.kycStatus = 'rejected';
        user.kycDetails.kycRejectedAt = new Date();
        user.kycDetails.kycRejectionReason = reason;

        await user.save();

        res.json({
            success: true,
            message: 'KYC rejected successfully',
            data: user
        });

    } catch (error) {
        console.error('Reject KYC error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject KYC',
            error: error.message
        });
    }
};

// Admin: Get KYC details by user ID
const getKYCDetailsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password -otpAttempts -lastOtpSent -emailOtp -emailOtpExpires');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'KYC details retrieved successfully',
            data: user
        });

    } catch (error) {
        console.error('Get KYC details by user ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get KYC details',
            error: error.message
        });
    }
};

// Bulk upload users from Excel/CSV file
const bulkUploadUsers = async (req, res) => {
    let filePath = null;
    
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an Excel or CSV file'
            });
        }

        filePath = req.file.path;
        console.log('📄 Processing users file:', filePath);

        // Parse Excel/CSV file
        const data = parseExcelFile(filePath);

        if (!data || data.length === 0) {
            deleteFile(filePath);
            return res.status(400).json({
                success: false,
                message: 'File is empty or contains no valid data'
            });
        }

        console.log(`📊 Found ${data.length} users in the file`);

        // Define required fields for users
        const requiredFields = ['phoneNumber', 'name', 'email', 'password'];

        // Validate required fields
        const validation = validateRequiredFields(data, requiredFields);

        if (!validation.isValid) {
            deleteFile(filePath);
            return res.status(400).json({
                success: false,
                message: 'Validation failed: Missing required fields',
                errors: {
                    missingFields: validation.missingFields,
                    invalidRows: validation.invalidRows.slice(0, 10)
                }
            });
        }

        // Transform and prepare users data
        const usersToCreate = data.map(row => ({
            phoneNumber: row.phoneNumber?.toString().trim(),
            name: row.name?.toString().trim(),
            email: row.email?.toString().trim().toLowerCase(),
            password: row.password?.toString().trim(),
            role: row.role?.toString().toLowerCase() === 'admin' ? 'admin' : 'user',
            isVerified: row.isVerified === true || row.isVerified === 'true' || row.isVerified === 'TRUE' || true,
            isActive: row.isActive === false || row.isActive === 'false' || row.isActive === 'FALSE' ? false : true,
            firstName: row.firstName?.toString().trim() || '',
            lastName: row.lastName?.toString().trim() || '',
            city: row.city?.toString().trim() || '',
            state: row.state?.toString().trim() || ''
        }));

        // Bulk insert with error handling
        const results = {
            success: [],
            failed: []
        };

        for (let i = 0; i < usersToCreate.length; i++) {
            try {
                const user = await User.create(usersToCreate[i]);
                
                // Send welcome email (with error handling)
                if (user.email) {
                    try {
                        await sendWelcomeEmail(user.email, user.name);
                    } catch (emailError) {
                        console.log('Failed to send welcome email to:', user.email);
                    }
                }
                
                results.success.push({
                    row: i + 2,
                    phoneNumber: user.phoneNumber,
                    email: user.email,
                    name: user.name
                });
            } catch (error) {
                results.failed.push({
                    row: i + 2,
                    data: {
                        phoneNumber: usersToCreate[i].phoneNumber,
                        email: usersToCreate[i].email,
                        name: usersToCreate[i].name
                    },
                    error: error.code === 11000 ? 'Duplicate phone number or email' : error.message
                });
            }
        }

        // Delete the uploaded file
        deleteFile(filePath);

        res.status(201).json({
            success: true,
            message: `Bulk upload completed: ${results.success.length} users created, ${results.failed.length} failed`,
            data: {
                totalRows: data.length,
                successCount: results.success.length,
                failedCount: results.failed.length,
                successItems: results.success,
                failedItems: results.failed.slice(0, 20)
            }
        });

    } catch (error) {
        console.error('❌ Error in users bulk upload:', error);
        
        if (filePath) {
            deleteFile(filePath);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to process bulk upload',
            error: error.message
        });
    }
};

module.exports = {
    // Authentication
    register,
    verifyRegistrationOTP, // NEW
    login,
    verifyLoginOTP, // NEW
    adminLogin,
    verifyOTP: verifyLoginOTP, // Keep backward compatibility
    logout, // ADDED BACK
    
    // Profile Management
    getProfile,
    updateProfile,
    changePassword,
    
    // Password Recovery
    forgotPassword,
    resetPassword,
    
    // Admin Functions
    getAllUsers,
    getUserById,
    updateUserRole,
    toggleUserStatus,
    markUserAsEx,
    deleteUser,
    getDashboardStats,
    
    // KYC Management
    updateKYCDetails,
    getKYCDetails,
    getPendingKYCRequests,
    approveKYC,
    rejectKYC,
    getKYCDetailsByUserId,
    
    // Email OTP
    sendEmailOTP,
    verifyEmailOTP,
    
    // Bulk Operations
    bulkUploadUsers,
    
    // Legacy functions (kept for backward compatibility)
    sendOTP
};