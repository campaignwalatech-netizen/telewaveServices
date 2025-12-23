const jwt = require('jsonwebtoken');
const User = require('./user.model');
const emailService = require('../../utils/emailService'); 
const excelParser = require('../../utils/excelParser');
const Lead = require('../leads/leads.model');
const Wallet = require('../wallet/wallet.model');
const ExcelJS = require('exceljs');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// ==================== AUTHENTICATION FUNCTIONS ====================

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

const getTeamUsersWithStats = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
        const loggedInUserId = req.user.id;
        
        // Build query - always filter by reportingTo for TLs
        const query = { 
            role: 'user',
            reportingTo: loggedInUserId  // Automatically filter by logged-in TL
        };
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (status !== 'all') {
            query.status = status;
        }
        
        const skip = (page - 1) * limit;
        const total = await User.countDocuments(query);
        
        // Fetch users with necessary population
        const users = await User.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('reportingTo', 'name email phoneNumber')
            .populate('attendance')
            .populate('rollback')
            .populate('financials')
            .populate('statistics')
            .populate('leadDistribution');
        
        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
        
    } catch (error) {
        console.error('Get team users with stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get team users with stats',
            error: error.message
        });
    }
};

// get all teamleaders with active status

const getTeamLeadersWithActiveStatus = async (req, res) => {
    try {
        const teamLeaders = await User.find({ role: 'TL', isActive: true }).select('name email phoneNumber role isActive');
        res.status(200).json({
            success: true,
            data: teamLeaders
        });
    } catch (error) {
        console.error('Get active team leaders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get active team leaders'
        });
    }
};


//get present users for admin
const getPresentUsers = async (req, res) => {
    try {
        const presentUsers = await User.find({ 'attendance.todayStatus': 'present', role: 'user'  }).select('name email phoneNumber role attendance');
        res.status(200).json({
            success: true,
            data: presentUsers
        });
    } catch (error) {
        console.error('Get present users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get present users'
        });
    }
};

//get approved user(not tl) which is approved by admin
const getApprovedUsers = async (req, res) => {
    try {
        const approvedUsers = await User.find({ isVerified: true, role: 'user', status:'approved'  }).select('name email phoneNumber role');
        res.status(200).json({
            success: true,
            data: approvedUsers
        });
    } catch (error) {
        console.error('Get approved users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get approved users'
        });
    }
};

// Update your backend route to use the new registrationStatus system
const getNotApprovedUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            sort = 'createdAt',
            order = 'desc',
            search = '',
            registrationStatus = ''
        } = req.query;

        // Build query for not approved users (NEW SYSTEM)
        const query = {
            registrationStatus: { 
                $in: ['email_verification_pending', 'admin_approval_pending', 'tl_assignment_pending', 'rejected'] 
            }
        };

        // Add search filter if provided
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by specific registration status if provided
        if (registrationStatus && registrationStatus !== 'all') {
            query.registrationStatus = registrationStatus;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count
        const total = await User.countDocuments(query);

        // Get users with pagination and sorting
        const users = await User.find(query)
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-password') // Exclude password
            .populate('approvedBy', 'name email')
            .populate('rejectedBy', 'name email')
            .populate('assignedTL', 'name email')
            .populate('reportingTo', 'name email');

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get not approved users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get not approved users',
            error: error.message
        });
    }
};

// Reject user registration
const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user._id;
    const { reason } = req.body;

    if (!reason) {
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

    // Reject user
    user.registrationStatus = 'rejected';
    user.rejectedAt = new Date();
    user.rejectedBy = adminId;
    user.rejectionReason = reason;
    user.isActive = false;
    
    await user.save();

    res.json({
      success: true,
      message: 'User registration rejected',
      data: { user: user.toJSON() }
    });

  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user'
    });
  }
};

// Add this combined approval + TL assignment function
const approveAndAssignTL = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user._id;
    const { tlId, tlName, notes = '' } = req.body;

    if (!tlId || !tlName) {
      return res.status(400).json({
        success: false,
        message: 'TL ID and TL Name are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.registrationStatus !== 'admin_approval_pending') {
      return res.status(400).json({
        success: false,
        message: `User is not pending admin approval. Current status: ${user.registrationStatus}`
      });
    }

    // Check if TL exists
    const tl = await User.findById(tlId);
    if (!tl || tl.role !== 'TL') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Team Leader'
      });
    }

    // Approve user and assign TL in one step
    user.registrationStatus = 'approved';
    user.reportingTo = tlId;
    user.assignedTL = tlId;
    user.approvedAt = new Date();
    user.approvedBy = adminId;
    user.isActive = true;
    user.status = 'active';
    
    // Add user to TL's team
    if (!tl.teamMembers.includes(userId)) {
      tl.teamMembers.push(userId);
      tl.tlDetails.totalTeamMembers = tl.teamMembers.length;
      await tl.save();
    }

    await user.save();

    res.json({
      success: true,
      message: `User approved and assigned to TL ${tlName} successfully`,
      data: { user: user.toJSON() }
    });

  } catch (error) {
    console.error('Approve and assign TL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve and assign TL'
    });
  }
};

// Assign TL to user
const assignUserToTL = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user._id;
    const { tlId, tlName, notes = '' } = req.body;

    if (!tlId || !tlName) {
      return res.status(400).json({
        success: false,
        message: 'TL ID and TL Name are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if TL exists
    const tl = await User.findById(tlId);
    if (!tl || tl.role !== 'TL') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Team Leader'
      });
    }

    // Assign TL to user
    user.assignedTL = tlId;
    user.reportingTo = tlId;
    user.registrationStatus = 'approved';
    user.approvedAt = new Date();
    user.approvedBy = adminId;
    user.isActive = true;
    
    // Add user to TL's team
    if (!tl.teamMembers.includes(userId)) {
      tl.teamMembers.push(userId);
      tl.tlDetails.totalTeamMembers = tl.teamMembers.length;
      await tl.save();
    }

    await user.save();

    res.json({
      success: true,
      message: `User assigned to TL ${tlName} successfully`,
      data: { user: user.toJSON() }
    });

  } catch (error) {
    console.error('Assign TL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign TL'
    });
  }
};

// Approve user (move from admin_approval_pending to tl_assignment_pending)
const approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.registrationStatus !== 'admin_approval_pending') {
            return res.status(400).json({
                success: false,
                message: `User is not pending admin approval. Current status: ${user.registrationStatus}`
            });
        }

        // Move to TL assignment pending
        user.registrationStatus = 'tl_assignment_pending';
        user.approvedAt = new Date();
        user.approvedBy = adminId;
        
        await user.save();

        res.json({
            success: true,
            message: 'User approved. Now pending TL assignment.',
            data: { 
                user: user.toJSON(),
                nextStep: 'assign_tl'
            }
        });

    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve user'
        });
    }
};

// Complete user activation (assign TL and make active)
const activateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user._id;
        const { tlId } = req.body;

        if (!tlId) {
            return res.status(400).json({
                success: false,
                message: 'TL ID is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.registrationStatus !== 'tl_assignment_pending') {
            return res.status(400).json({
                success: false,
                message: `User is not pending TL assignment. Current status: ${user.registrationStatus}`
            });
        }

        // Check if TL exists
        const tl = await User.findById(tlId);
        if (!tl || tl.role !== 'TL') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Team Leader'
            });
        }

        // Assign TL and activate user
        user.registrationStatus = 'approved';
        user.reportingTo = tlId;
        user.assignedTL = tlId;
        user.isActive = true;
        user.status = 'active';
        
        // Add user to TL's team
        if (!tl.teamMembers.includes(userId)) {
            tl.teamMembers.push(userId);
            tl.tlDetails.totalTeamMembers = tl.teamMembers.length;
            await tl.save();
        }

        await user.save();

        res.json({
            success: true,
            message: `User activated and assigned to TL ${tl.name}`,
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to activate user'
        });
    }
};

// Bulk approve users
const bulkApproveUsers = async (req, res) => {
  try {
    const { userIds, notes = '' } = req.body;
    const adminId = req.user._id;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs are required'
      });
    }

    const results = {
      approved: [],
      failed: []
    };

    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        if (!user) {
          results.failed.push({
            userId,
            error: 'User not found'
          });
          continue;
        }

        if (user.registrationStatus === 'approved') {
          results.failed.push({
            userId,
            error: 'User already approved'
          });
          continue;
        }

        // Approve user (move to TL assignment pending)
        user.registrationStatus = 'tl_assignment_pending';
        user.approvedAt = new Date();
        user.approvedBy = adminId;
        await user.save();

        results.approved.push({
          userId,
          email: user.email,
          name: user.name
        });

      } catch (error) {
        results.failed.push({
          userId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk approval completed: ${results.approved.length} approved, ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk approve users'
    });
  }
};

// Export pending users
const exportPendingUsers = async (req, res) => {
  try {
    const { format = 'excel', registrationStatus } = req.query;

    // Build query
    const query = {
      registrationStatus: { 
        $in: ['email_verification_pending', 'admin_approval_pending', 'tl_assignment_pending', 'rejected'] 
      }
    };

    if (registrationStatus && registrationStatus !== 'all') {
      query.registrationStatus = registrationStatus;
    }

    const users = await User.find(query)
      .select('name email phoneNumber role registrationStatus createdAt emailVerifiedAt')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('assignedTL', 'name email')
      .sort({ createdAt: -1 });

    // Format data for export
    const exportData = users.map(user => ({
      'User ID': user._id.toString(),
      'Name': user.name || 'N/A',
      'Email': user.email || 'N/A',
      'Phone': user.phoneNumber || 'N/A',
      'Role': user.role || 'user',
      'Registration Status': user.registrationStatus || 'N/A',
      'Email Verified': user.emailVerified ? 'Yes' : 'No',
      'Email Verified At': user.emailVerifiedAt ? 
        new Date(user.emailVerifiedAt).toLocaleDateString('en-IN') : 'N/A',
      'Registered At': user.createdAt.toLocaleDateString('en-IN'),
      'Assigned TL': user.assignedTL?.name || 'Not Assigned',
      'TL Email': user.assignedTL?.email || 'N/A',
      'Approved By': user.approvedBy?.name || 'N/A',
      'Rejected By': user.rejectedBy?.name || 'N/A',
      'Rejection Reason': user.rejectionReason || 'N/A'
    }));

    if (format === 'excel') {
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Pending Users');

      // Add headers
      const headers = Object.keys(exportData[0] || {});
      worksheet.addRow(headers);

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE6B3' } // Light yellow
      };

      // Add data
      exportData.forEach(user => {
        worksheet.addRow(Object.values(user));
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=pending-users-${new Date().toISOString().split('T')[0]}.xlsx`);

      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } else {
      // JSON format
      res.json({
        success: true,
        message: 'Pending users exported successfully',
        data: exportData
      });
    }

  } catch (error) {
    console.error('Export pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export pending users',
      error: error.message
    });
  }
};

// Register user - Step 1: Send OTP to email
const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phoneNumber, role } = req.body;

        console.log('📥 Registration request received:', {
            name: name || 'MISSING',
            email: email || 'MISSING',
            password: password ? '***' : 'MISSING',
            confirmPassword: confirmPassword ? '***' : 'MISSING',
            phoneNumber: phoneNumber || 'MISSING',
            role: role || 'user'
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

        // Validate role
        if (role && !['user', 'admin', 'TL'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be user, admin, or TL'
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

        // Check OTP rate limiting
        const existingTempUser = await User.findOne({ email, isVerified: false });
        if (existingTempUser && !existingTempUser.canSendOtp()) {
            return res.status(429).json({
                success: false,
                message: 'Too many OTP attempts. Please try again later.'
            });
        }

        // Create or update temporary user
        let user;
        if (existingTempUser) {
            // Update existing temporary user
            user = existingTempUser;
            user.name = name;
            user.password = password;
            user.phoneNumber = phoneNumber;
            if (role) user.role = role;
        } else {
            // Create new temporary user (not verified yet)
            user = new User({
                name,
                email,
                password,
                phoneNumber,
                role: role || 'user',
                isVerified: false,
                isActive: false, // Initially inactive
                registrationStatus: 'email_verification_pending',
                status: 'pending_approval' // For backward compatibility
            });
        }

        // Generate and set registration OTP
        const otp = user.setOtp('registration');
        user.incrementOtpAttempts();
        await user.save();

        console.log('📧 Sending registration OTP to:', email);
        console.log('🔑 Registration OTP:', otp);

        // Send OTP via email with improved error handling
        const emailResult = await emailService.sendOTPEmail(email, name, otp, 'registration');

        // Add detailed logging
          console.log('📊 REGISTRATION EMAIL RESULT:', {
          emailSent: emailResult.emailSent,
          developmentMode: emailResult.developmentMode,
          error: emailResult.resendError || emailResult.error,
          message: emailResult.message,
          success: emailResult.success
        });

       // Check if email failed due to specific issues
        if (!emailResult.emailSent && emailResult.resendError) {
         console.error('📋 RESEND ERROR DETAILS:', {
         name: emailResult.resendError.name,
         message: emailResult.resendError.message,
         statusCode: emailResult.resendError.statusCode
        });
    
       // Check for specific error types
       if (emailResult.resendError.message && 
        emailResult.resendError.message.includes('domain') ||
        emailResult.resendError.message.includes('sender') ||
        emailResult.resendError.message.includes('from')) {
        
        console.warn('⚠️ POSSIBLE DOMAIN/SENDER ISSUE DETECTED');
        console.warn('   Current FROM_EMAIL:', 'no-reply@freelancerwala.com');
        console.warn('   Verify this domain in Resend Dashboard');
         }
       }

        return res.json({
            success: true,
            message: emailResult.emailSent 
                ? 'OTP sent to your email successfully'
                : 'OTP generated. Please use the OTP below.',
            requireOTP: true,
            data: {
                  email: email,
                  name: name,
                  role: role || 'user',
                  registrationStatus: user.registrationStatus,
                  otp: otp,
                  emailSent: emailResult.emailSent || false,
                  developmentMode: !emailResult.emailSent,
                  emailErrorDetails: !emailResult.emailSent ? emailResult.resendError || emailResult.error : null,
                  timestamp: new Date().toISOString()
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

// Verify Registration OTP - Step 2: Complete registration (move to admin approval pending)
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

        // Mark user as verified and move to admin approval pending
        user.isVerified = true;
        user.registrationStatus = 'admin_approval_pending';
        user.clearOtp('registration');
        
        // Initialize TL details if TL
        if (user.role === 'TL') {
            user.tlDetails = {
                assignedTeam: [],
                totalTeamMembers: 0,
                teamPerformance: 0,
                assignedLeads: [],
                canAssignLeads: true,
                canApproveLeads: false,
                canViewReports: true,
                permissions: {
                    addUsers: false,
                    editUsers: false,
                    viewUsers: true,
                    assignLeads: true,
                    approveLeads: false,
                    viewReports: true,
                    manageTeam: true
                }
            };
        }
        
        await user.save();

        // Send welcome email (don't block registration if it fails)
        try {
            await emailService.sendWelcomeEmail(user.email, user.name);
        } catch (emailError) {
            console.error('❌ Failed to send welcome email:', emailError);
            // Continue registration even if welcome email fails
        }

        // Generate token (but user still needs admin approval)
        const token = generateToken(user._id);

        // Store session info
        user.activeSession = token;
        user.sessionDevice = req.headers['user-agent'] || 'Unknown Device';
        user.sessionIP = req.ip || req.connection.remoteAddress || 'Unknown IP';
        user.lastActivity = new Date();
        await user.save();

        console.log('✅ User registered and pending admin approval:', user.email);
        console.log('👤 Role:', user.role);
        console.log('📋 Registration Status:', user.registrationStatus);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Your account is pending admin approval.',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    isVerified: user.isVerified,
                    isActive: user.isActive,
                    registrationStatus: user.registrationStatus
                },
                token,
                requiresAdminApproval: true
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

        // Check if account is approved and active
        if (user.registrationStatus !== 'approved') {
            return res.status(401).json({
                success: false,
                message: 'Account is pending, Please wait for admin approval.',
                registrationStatus: user.registrationStatus,
                requiresAdminApproval: user.registrationStatus === 'admin_approval_pending',
                requiresTLAssignment: user.registrationStatus === 'tl_assignment_pending'
            });
        }

        // Check if account is active (admin can set isActive to false)
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
        // In the login function after sending OTP:
const emailResult = await emailService.sendOTPEmail(user.email, user.name || 'User', otp, 'login');

return res.json({
    success: true,
    message: emailResult.emailSent 
        ? 'OTP sent to your email'
        : 'OTP generated. Please use the OTP below.',
    requireOTP: true,
    data: {
        email: user.email,
        name: user.name,
        role: user.role,
        registrationStatus: user.registrationStatus,
        // Always include OTP in response
        otp: otp,
        emailSent: emailResult.emailSent || false,
        developmentMode: !emailResult.emailSent
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

        // Check if user is approved
        if (user.registrationStatus !== 'approved') {
            // Clear OTP
            user.clearOtp('login');
            await user.save();
            
            // Generate token for pending approval
            const token = generateToken(user._id);
            
            return res.json({
                success: true,
                message: 'Login successful but account requires admin approval',
                data: {
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        role: user.role,
                        isVerified: user.isVerified,
                        isActive: user.isActive,
                        registrationStatus: user.registrationStatus,
                        status: user.status
                    },
                    token,
                    requiresApproval: true
                }
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
                    isActive: user.isActive,
                    registrationStatus: user.registrationStatus,
                    status: user.status
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
        const emailResult = await emailService.sendOTPEmail(user.email, user.name || 'Admin', otp, 'login');

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

// TL Login - Special login for Team Leaders
const tlLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('📥 TL login request received for email:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email and check if TL
        const user = await User.findOne({ email, role: 'TL', isVerified: true });
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
                message: 'Team Leader account is deactivated.'
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

        console.log('📧 Sending TL login OTP to email:', user.email);
        console.log('🔑 TL Login OTP:', otp);

        // Send OTP via email with improved error handling
        const emailResult = await emailService.sendOTPEmail(user.email, user.name || 'Team Leader', otp, 'login');

        return res.json({
            success: true,
            message: emailResult.developmentMode
                ? 'OTP generated (Email service unavailable - check console)'
                : 'OTP sent to your email. Please verify to complete TL login.',
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
        console.error('TL login error:', error);
        res.status(500).json({
            success: false,
            message: 'TL login failed'
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
        const emailResult = await emailService.sendOTPEmail(user.email, user.name || 'User', otp, 'password-reset');

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

// ==================== ATTENDANCE FUNCTIONS ====================

const markAttendance = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Check if user is TL or Admin (they don't mark attendance)
        if (req.user.role !== 'user') {
            return res.status(400).json({
                success: false,
                message: 'Attendance marking is only for regular users'
            });
        }
        
        const { status = 'present' } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Mark attendance
        const result = user.markAttendance(status, {
            markedBy: userId,
            ipAddress: req.ip,
            deviceInfo: req.headers['user-agent'],
            notes: 'Marked via web dashboard'
        });
        
        await user.save();
        
        res.status(200).json({
            success: true,
            data: result,
            message: 'Attendance marked successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get today's attendance
const getTodayAttendance = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId).select('attendance');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                todayStatus: user.attendance.todayStatus || 'absent',
                todayMarkedAt: user.attendance.todayMarkedAt,
                streak: user.attendance.streak || 0,
                monthlyStats: user.attendance.monthlyStats || { present: 0, absent: 0, late: 0 }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get attendance history
const getAttendanceHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate, limit = 30 } = req.query;
        
        const user = await User.findById(userId).select('attendance.history');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        let history = user.attendance.history || [];
        
        // Filter by date range if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            history = history.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate >= start && recordDate <= end;
            });
        }
        
        // Sort by date descending and limit
        history.sort((a, b) => new Date(b.date) - new Date(a.date));
        history = history.slice(0, parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: history,
            count: history.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get attendance report for admin and TL
const getAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate && endDate) {
            query['attendance.history.date'] = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const users = await User.find(query).select('name email attendance');

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get attendance report'
        });
    }
};

// Get team attendance for TL
const getTeamAttendance = async (req, res) => {
    try {
        const tlId = req.user._id;
        const teamMembers = await User.find({ reportingTo: tlId, role: 'user' }).select('name email attendance');

        res.status(200).json({
            success: true,
            data: teamMembers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get team attendance'
        });
    }
};

// ==================== PROFILE MANAGEMENT ====================

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
        const emailResult = await emailService.sendOTPEmail(user.email, user.name || 'User', otp, purpose || 'verification');

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

// ==================== ADMIN USER MANAGEMENT ====================

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
        const adminId = req.user._id;
        const { newRole, reason } = req.body;

        if (!['user', 'TL'].includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Can only change between "user" and "TL"'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === newRole) {
            return res.status(400).json({
                success: false,
                message: `User is already a ${newRole}`
            });
        }

        user.changeRole(newRole, adminId, reason);
        await user.save();

        res.json({
            success: true,
            message: `User role changed to ${newRole} successfully`,
            data: { 
                user: user.toJSON(),
                roleHistory: user.roleHistory // Include role history in response
            }
        });

    } catch (error) {
        console.error('Change user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change user role'
        });
    }
};

// Admin: Update TL permissions
const updateTLPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { permissions } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'TL') {
            return res.status(400).json({
                success: false,
                message: 'User is not a Team Leader'
            });
        }

        // Update permissions
        if (permissions) {
            user.tlDetails.permissions = {
                ...user.tlDetails.permissions,
                ...permissions
            };
        }

        await user.save();

        res.json({
            success: true,
            message: 'TL permissions updated successfully',
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Update TL permissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update TL permissions'
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

// Approve user registration
const approveUserRegistration = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.status !== 'pending_approval') {
            return res.status(400).json({
                success: false,
                message: `User is already ${user.status}`
            });
        }

        // Approve user
        user.approveUser(adminId);
        await user.save();

        res.json({
            success: true,
            message: 'User approved successfully',
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve user'
        });
    }
};

// Mark user as Hold
const markUserHold = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user._id;
        const { reason, holdUntil } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.markHold(adminId, reason, holdUntil ? new Date(holdUntil) : null);
        await user.save();

        res.json({
            success: true,
            message: 'User marked as Hold',
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Mark user hold error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark user as Hold'
        });
    }
};

// Mark user as Active (from Hold)
const markUserActive = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user._id;
        const { reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.status !== 'hold') {
            return res.status(400).json({
                success: false,
                message: `User is not on Hold. Current status: ${user.status}`
            });
        }

        user.markActive(adminId, reason);
        await user.save();

        res.json({
            success: true,
            message: 'User marked as Active',
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Mark user active error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark user as Active'
        });
    }
};

// Block user
const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user._id;
        const { reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.blockUser(adminId, reason);
        await user.save();

        res.json({
            success: true,
            message: 'User blocked successfully',
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to block user'
        });
    }
};

// Change user role (User ↔ TL)
const changeUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user._id;
        const { newRole, reason } = req.body;

        if (!['user', 'TL'].includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Can only change between "user" and "TL"'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === newRole) {
            return res.status(400).json({
                success: false,
                message: `User is already a ${newRole}`
            });
        }

        user.changeRole(newRole, adminId, reason);
        await user.save();

        res.json({
            success: true,
            message: `User role changed to ${newRole} successfully`,
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Change user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change user role'
        });
    }
};

// Get users by status (for admin dashboard)
const getUsersByStatus = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        let query = {};
        
        switch(status) {
            case 'active':
                query.status = 'active';
                query.isEx = false;
                break;
            case 'inactive':
                query.status = 'inactive';
                query.isEx = false;
                break;
            case 'hold':
                query.status = 'hold';
                break;
            case 'blocked':
                query.status = 'blocked';
                break;
            case 'pending':
                query.status = 'pending_approval';
                break;
            case 'ex':
                query.isEx = true;
                break;
            default:
                query = {};
        }

        const users = await User.find(query)
            .select('-password -otpAttempts -lastOtpSent -registrationOtp -registrationOtpExpires -loginOtp -loginOtpExpires -resetPasswordOtp -resetPasswordOtpExpires -emailOtp -emailOtpExpires -activeSession -sessionDevice -sessionIP -security')
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
        console.error('Get users by status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users'
        });
    }
};

// ==================== TL FUNCTIONS ====================

// TL: Get team members
const getTeamMembers = async (req, res) => {
    try {
        const tlId = req.user._id;

        const teamMembers = await User.find({ 
            reportingTo: tlId,
            role: 'user'
        }).select('-password -emailOtp -emailOtpExpires');

        // Get team statistics
        let teamTotalLeads = 0;
        let teamCompletedLeads = 0;
        let teamTotalEarnings = 0;

        teamMembers.forEach(member => {
            teamTotalLeads += member.statistics.totalLeads || 0;
            teamCompletedLeads += member.statistics.completedLeads || 0;
            teamTotalEarnings += member.statistics.totalEarnings || 0;
        });

        res.json({
            success: true,
            message: 'Team members retrieved successfully',
            data: {
                teamMembers,
                teamStats: {
                    totalMembers: teamMembers.length,
                    totalLeads: teamTotalLeads,
                    completedLeads: teamCompletedLeads,
                    totalEarnings: teamTotalEarnings,
                    conversionRate: teamTotalLeads > 0 ? (teamCompletedLeads / teamTotalLeads * 100) : 0
                }
            }
        });

    } catch (error) {
        console.error('Get team members error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get team members'
        });
    }
};

// TL: Add team member
const addTeamMember = async (req, res) => {
    try {
        const tlId = req.user._id;
        const { memberId } = req.body;

        if (!memberId) {
            return res.status(400).json({
                success: false,
                message: 'Member ID is required'
            });
        }

        const tl = await User.findById(tlId);
        if (!tl || tl.role !== 'TL') {
            return res.status(403).json({
                success: false,
                message: 'Only Team Leaders can add team members'
            });
        }

        const member = await User.findById(memberId);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        if (member.role !== 'user') {
            return res.status(400).json({
                success: false,
                message: 'Only regular users can be added to team'
            });
        }

        // Check if member already in team
        if (tl.teamMembers.includes(memberId)) {
            return res.status(400).json({
                success: false,
                message: 'User is already in your team'
            });
        }

        // Add to TL's team
        tl.teamMembers.push(memberId);
        tl.tlDetails.totalTeamMembers = tl.teamMembers.length;

        // Update member's reportingTo
        member.reportingTo = tlId;

        await Promise.all([tl.save(), member.save()]);

        res.json({
            success: true,
            message: 'Team member added successfully',
            data: {
                teamMember: member,
                teamSize: tl.tlDetails.totalTeamMembers
            }
        });

    } catch (error) {
        console.error('Add team member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add team member'
        });
    }
};

// TL: Remove team member
const removeTeamMember = async (req, res) => {
    try {
        const tlId = req.user._id;
        const { memberId } = req.params;

        const tl = await User.findById(tlId);
        if (!tl || tl.role !== 'TL') {
            return res.status(403).json({
                success: false,
                message: 'Only Team Leaders can remove team members'
            });
        }

        // Check if member is in team
        if (!tl.teamMembers.includes(memberId)) {
            return res.status(400).json({
                success: false,
                message: 'User is not in your team'
            });
        }

        // Remove from TL's team
        tl.teamMembers = tl.teamMembers.filter(id => id.toString() !== memberId);
        tl.tlDetails.totalTeamMembers = tl.teamMembers.length;

        // Update member's reportingTo
        const member = await User.findById(memberId);
        if (member) {
            member.reportingTo = null;
            await member.save();
        }

        await tl.save();

        res.json({
            success: true,
            message: 'Team member removed successfully',
            data: {
                teamSize: tl.tlDetails.totalTeamMembers
            }
        });

    } catch (error) {
        console.error('Remove team member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove team member'
        });
    }
};

// TL: Get team performance report
const getTeamPerformance = async (req, res) => {
    try {
        const tlId = req.user._id;

        const teamMembers = await User.find({ 
            reportingTo: tlId,
            role: 'user'
        }).select('name email phoneNumber statistics performance createdAt');

        // Calculate team performance metrics
        let teamPerformance = {
            totalMembers: teamMembers.length,
            activeMembers: 0,
            totalLeads: 0,
            completedLeads: 0,
            pendingLeads: 0,
            totalEarnings: 0,
            averageRating: 0,
            members: []
        };

        let totalRating = 0;
        let membersWithRating = 0;

        teamMembers.forEach(member => {
            const stats = member.statistics || {};
            const perf = member.performance || {};
            
            teamPerformance.totalLeads += stats.totalLeads || 0;
            teamPerformance.completedLeads += stats.completedLeads || 0;
            teamPerformance.pendingLeads += stats.pendingLeads || 0;
            teamPerformance.totalEarnings += stats.totalEarnings || 0;

            if (perf.rating && perf.rating > 0) {
                totalRating += perf.rating;
                membersWithRating++;
            }

            if ((stats.totalLeads || 0) > 0) {
                teamPerformance.activeMembers++;
            }

            teamPerformance.members.push({
                _id: member._id,
                name: member.name,
                email: member.email,
                phoneNumber: member.phoneNumber,
                leads: {
                    total: stats.totalLeads || 0,
                    completed: stats.completedLeads || 0,
                    pending: stats.pendingLeads || 0,
                    conversionRate: stats.totalLeads > 0 ? (stats.completedLeads / stats.totalLeads * 100) : 0
                },
                earnings: stats.totalEarnings || 0,
                rating: perf.rating || 0,
                joinDate: member.createdAt
            });
        });

        teamPerformance.averageRating = membersWithRating > 0 ? (totalRating / membersWithRating) : 0;
        teamPerformance.conversionRate = teamPerformance.totalLeads > 0 
            ? (teamPerformance.completedLeads / teamPerformance.totalLeads * 100) 
            : 0;

        res.json({
            success: true,
            message: 'Team performance report retrieved successfully',
            data: teamPerformance
        });

    } catch (error) {
        console.error('Get team performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get team performance report'
        });
    }
};

// ==================== LEAD DISTRIBUTION CONTROLLERS ====================

// Admin: Distribute leads to users
const distributeLeads = async (req, res) => {
    try {
        const adminId = req.user._id;
        const {
            distributionType,
            leadIds,
            userIds = [],
            tlId,
            dailyQuota
        } = req.body;

        // Validate distribution type
        const validTypes = [
            'all_users',
            'active_users',
            'present_users',
            'without_leads',
            'specific_user',
            'team_leader'
        ];

        if (!validTypes.includes(distributionType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid distribution type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Lead IDs are required'
            });
        }

        // Get target users based on distribution type
        let targetUsers = [];

        switch(distributionType) {
            case 'all_users':
                targetUsers = await User.find({ 
                    role: 'user', 
                    status: 'active',
                    isActive: true,
                    isEx: false 
                });
                break;

            case 'active_users':
                targetUsers = await User.find({ 
                    role: 'user', 
                    status: 'active',
                    isActive: true,
                    isEx: false 
                });
                break;

            case 'present_users':
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                targetUsers = await User.find({ 
                    role: 'user', 
                    status: 'active',
                    isActive: true,
                    isEx: false,
                    'attendance.todayStatus': 'present',
                    'attendance.todayMarkedAt': { $gte: today }
                });
                break;

            case 'without_leads':
                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);
                
                targetUsers = await User.find({ 
                    role: 'user', 
                    status: 'active',
                    isActive: true,
                    isEx: false,
                    $or: [
                        { 'leadDistribution.lastLeadDistributionDate': { $lt: todayDate } },
                        { 'leadDistribution.lastLeadDistributionDate': { $exists: false } }
                    ]
                });
                break;

            case 'specific_user':
                if (!userIds || userIds.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'User IDs are required for specific user distribution'
                    });
                }
                targetUsers = await User.find({ 
                    _id: { $in: userIds },
                    role: 'user',
                    status: 'active'
                });
                break;

            case 'team_leader':
                if (!tlId) {
                    return res.status(400).json({
                        success: false,
                        message: 'TL ID is required for team leader distribution'
                    });
                }
                const tl = await User.findById(tlId);
                if (!tl || tl.role !== 'TL') {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid Team Leader ID'
                    });
                }
                targetUsers = await User.find({ 
                    _id: { $in: tl.teamMembers },
                    role: 'user',
                    status: 'active'
                });
                break;
        }

        if (targetUsers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No eligible users found for distribution'
            });
        }

        // Distribute leads evenly among target users
        const results = {
            success: [],
            failed: [],
            summary: {
                totalLeads: leadIds.length,
                totalUsers: targetUsers.length,
                leadsPerUser: Math.floor(leadIds.length / targetUsers.length),
                extraLeads: leadIds.length % targetUsers.length
            }
        };

        let leadIndex = 0;

        for (const user of targetUsers) {
            if (leadIndex >= leadIds.length) break;

            const userLeads = [];
            const userLeadCount = Math.floor(leadIds.length / targetUsers.length) + 
                                (leadIndex < leadIds.length % targetUsers.length ? 1 : 0);

            for (let i = 0; i < userLeadCount && leadIndex < leadIds.length; i++) {
                const leadId = leadIds[leadIndex];
                
                try {
                    // Find lead
                    const lead = await Lead.findById(leadId);
                    if (!lead) {
                        results.failed.push({
                            leadId,
                            userId: user._id,
                            error: 'Lead not found'
                        });
                        leadIndex++;
                        continue;
                    }

                    // Assign lead to user
                    lead.assign(
                        user._id,
                        adminId,
                        req.user.name,
                        'admin',
                        distributionType
                    );

                    // Add to user's today leads
                    user.assignLead(lead._id);

                    // Set daily quota if provided
                    if (dailyQuota) {
                        user.leadDistribution.dailyLeadQuota = dailyQuota;
                    }

                    await Promise.all([lead.save(), user.save()]);

                    userLeads.push(leadId);
                    results.success.push({
                        leadId,
                        userId: user._id,
                        userName: user.name
                    });

                } catch (error) {
                    results.failed.push({
                        leadId,
                        userId: user._id,
                        error: error.message
                    });
                }

                leadIndex++;
            }

            console.log(`✅ Distributed ${userLeads.length} leads to ${user.name}`);
        }

        res.json({
            success: true,
            message: 'Leads distributed successfully',
            data: {
                ...results,
                distributionType,
                distributedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Distribute leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to distribute leads'
        });
    }
};

// Admin/TL: Withdraw leads from user
const withdrawLeads = async (req, res) => {
    try {
        const { userId } = req.params;
        const { leadIds } = req.body;
        const withdrawnBy = req.user._id;
        const withdrawnByName = req.user.name;

        if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Lead IDs are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if current user has permission to withdraw leads
        if (req.user.role === 'TL') {
            // TL can only withdraw from their team members
            if (!req.user.teamMembers.includes(userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only withdraw leads from your team members'
                });
            }

            if (!req.user.tlDetails?.canWithdrawLeads) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to withdraw leads'
                });
            }
        }

        const results = {
            success: [],
            failed: []
        };

        for (const leadId of leadIds) {
            try {
                const lead = await Lead.findById(leadId);
                if (!lead) {
                    results.failed.push({
                        leadId,
                        error: 'Lead not found'
                    });
                    continue;
                }

                // Check if lead is assigned to this user
                if (lead.assignedTo?.toString() !== userId) {
                    results.failed.push({
                        leadId,
                        error: 'Lead is not assigned to this user'
                    });
                    continue;
                }

                // Withdraw lead
                lead.withdraw(withdrawnBy, withdrawnByName, 'Withdrawn by admin/TL');
                user.withdrawLead(leadId);

                await Promise.all([lead.save(), user.save()]);

                results.success.push({
                    leadId,
                    leadName: lead.offerName
                });

            } catch (error) {
                results.failed.push({
                    leadId,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: 'Leads withdrawal completed',
            data: results
        });

    } catch (error) {
        console.error('Withdraw leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to withdraw leads'
        });
    }
};

// ==================== TL LEAD DISTRIBUTION ====================

// TL: Distribute leads to team members
const distributeLeadsToTeam = async (req, res) => {
    try {
        const tlId = req.user._id;
        const {
            leadIds,
            memberId, // Optional: specific member
            dailyQuota
        } = req.body;

        if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Lead IDs are required'
            });
        }

        // Check TL permissions
        if (!req.user.tlDetails?.canAssignLeads) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to assign leads'
            });
        }

        let targetMembers = [];

        if (memberId) {
            // Assign to specific member
            if (!req.user.teamMembers.includes(memberId)) {
                return res.status(400).json({
                    success: false,
                    message: 'User is not in your team'
                });
            }
            const member = await User.findById(memberId);
            if (member) {
                targetMembers = [member];
            }
        } else {
            // Assign to all active team members (present today)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            targetMembers = await User.find({
                _id: { $in: req.user.teamMembers },
                role: 'user',
                status: 'active',
                'attendance.todayStatus': 'present',
                'attendance.todayMarkedAt': { $gte: today }
            });
        }

        if (targetMembers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No eligible team members found'
            });
        }

        const results = {
            success: [],
            failed: [],
            summary: {
                totalLeads: leadIds.length,
                totalMembers: targetMembers.length,
                leadsPerMember: Math.floor(leadIds.length / targetMembers.length)
            }
        };

        let leadIndex = 0;

        for (const member of targetMembers) {
            if (leadIndex >= leadIds.length) break;

            const memberLeads = [];
            const memberLeadCount = Math.floor(leadIds.length / targetMembers.length) + 
                                  (leadIndex < leadIds.length % targetMembers.length ? 1 : 0);

            for (let i = 0; i < memberLeadCount && leadIndex < leadIds.length; i++) {
                const leadId = leadIds[leadIndex];
                
                try {
                    const lead = await Lead.findById(leadId);
                    if (!lead) {
                        results.failed.push({
                            leadId,
                            memberId: member._id,
                            error: 'Lead not found'
                        });
                        leadIndex++;
                        continue;
                    }

                    // Assign lead to team member
                    lead.assign(
                        member._id,
                        tlId,
                        req.user.name,
                        'tl',
                        'team_member'
                    );

                    // Add to member's today leads
                    member.assignLead(lead._id);

                    // Set daily quota if provided
                    if (dailyQuota) {
                        member.leadDistribution.dailyLeadQuota = dailyQuota;
                    }

                    // Add to TL's assigned leads
                    if (!req.user.tlDetails.assignedLeads.includes(leadId)) {
                        req.user.tlDetails.assignedLeads.push(leadId);
                    }

                    await Promise.all([lead.save(), member.save(), req.user.save()]);

                    memberLeads.push(leadId);
                    results.success.push({
                        leadId,
                        memberId: member._id,
                        memberName: member.name
                    });

                } catch (error) {
                    results.failed.push({
                        leadId,
                        memberId: member._id,
                        error: error.message
                    });
                }

                leadIndex++;
            }

            console.log(`✅ TL distributed ${memberLeads.length} leads to ${member.name}`);
        }

        res.json({
            success: true,
            message: 'Leads distributed to team successfully',
            data: {
                ...results,
                distributedBy: req.user.name,
                distributedAt: new Date()
            }
        });

    } catch (error) {
        console.error('TL distribute leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to distribute leads to team'
        });
    }
};

// ==================== USER LEAD MANAGEMENT ====================

// User: Get today's leads
const getUserTodaysLeads = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's assigned leads
        const todaysLeads = await Lead.find({
            assignedTo: userId,
            assignedAt: { $gte: today },
            status: { $in: ['assigned', 'in_progress'] },
            isTodayLead: true
        }).populate('offerId', 'name category image');

        // Get yesterday's pending leads
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const yesterdaysPending = await Lead.find({
            assignedTo: userId,
            assignedAt: { $gte: yesterday, $lt: today },
            status: { $in: ['assigned', 'in_progress'] },
            isYesterdayPending: true
        }).populate('offerId', 'name category image');

        // Get closed/completed leads
        const closedLeads = await Lead.find({
            assignedTo: userId,
            status: { $in: ['completed', 'closed', 'rejected'] }
        })
        .populate('offerId', 'name category image')
        .sort({ completedAt: -1 })
        .limit(10);

        // Get user's lead distribution info
        const user = await User.findById(userId).select('leadDistribution statistics');

        res.json({
            success: true,
            message: 'User leads retrieved successfully',
            data: {
                todaysLeads,
                yesterdaysPending,
                closedLeads: closedLeads || [],
                leadStats: {
                    todaysCount: user?.leadDistribution?.todaysLeadCount || 0,
                    todaysCompleted: user?.leadDistribution?.todaysCompletedLeads || 0,
                    todaysPending: user?.leadDistribution?.todaysPendingLeads || 0,
                    dailyQuota: user?.leadDistribution?.dailyLeadQuota || 0,
                    lastDistribution: user?.leadDistribution?.lastLeadDistributionDate
                }
            }
        });

    } catch (error) {
        console.error('Get user leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user leads'
        });
    }
};

// User: Start working on lead
const startLead = async (req, res) => {
    try {
        const { leadId } = req.params;
        const userId = req.user._id;

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        // Check if lead is assigned to this user
        if (lead.assignedTo?.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this lead'
            });
        }

        if (lead.status !== 'assigned') {
            return res.status(400).json({
                success: false,
                message: `Lead is already ${lead.status}`
            });
        }

        // Start working on lead
        lead.start();
        await lead.save();

        res.json({
            success: true,
            message: 'Lead started successfully',
            data: { lead }
        });

    } catch (error) {
        console.error('Start lead error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start lead'
        });
    }
};

// User: Complete lead
const completeLead = async (req, res) => {
    try {
        const { leadId } = req.params;
        const { remarks } = req.body;
        const userId = req.user._id;

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        // Check if lead is assigned to this user
        if (lead.assignedTo?.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this lead'
            });
        }

        if (lead.status !== 'in_progress') {
            return res.status(400).json({
                success: false,
                message: `Lead is not in progress. Current status: ${lead.status}`
            });
        }

        // Complete lead
        lead.complete(remarks);
        
        // Update user statistics
        const user = await User.findById(userId);
        if (user) {
            user.completeLead(leadId);
            await user.save();
        }

        await lead.save();

        res.json({
            success: true,
            message: 'Lead completed successfully',
            data: { lead }
        });

    } catch (error) {
        console.error('Complete lead error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete lead'
        });
    }
};

// ==================== KYC MANAGEMENT ====================

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

// User: Request KYC (manual approval)
const requestKYCApproval = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if KYC is already submitted
        if (user.kycDetails.kycStatus === 'pending') {
            return res.status(400).json({
                success: false,
                message: 'KYC is already pending approval'
            });
        }

        if (user.kycDetails.kycStatus === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'KYC is already approved'
            });
        }

        // Validate that all required fields are filled
        const requiredFields = [
            user.firstName,
            user.lastName,
            user.kycDetails.panNumber,
            user.kycDetails.aadhaarNumber,
            user.bankDetails.accountNumber
        ];

        if (requiredFields.some(field => !field || field.trim() === '')) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all KYC fields before submission',
                missingFields: {
                    firstName: !user.firstName,
                    lastName: !user.lastName,
                    panNumber: !user.kycDetails.panNumber,
                    aadhaarNumber: !user.kycDetails.aadhaarNumber,
                    accountNumber: !user.bankDetails.accountNumber
                }
            });
        }

        // Submit KYC for approval
        user.kycDetails.kycStatus = 'pending';
        user.kycDetails.kycSubmittedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'KYC submitted for approval successfully',
            data: {
                kycStatus: user.kycDetails.kycStatus,
                submittedAt: user.kycDetails.kycSubmittedAt
            }
        });

    } catch (error) {
        console.error('Request KYC approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit KYC for approval'
        });
    }
};

// User: Submit KYC
const submitKYC = async (req, res) => {
    try {
        const userId = req.user._id;
        const kycData = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Submit KYC
        user.submitKYC(kycData);
        await user.save();

        res.json({
            success: true,
            message: 'KYC submitted successfully and pending approval',
            data: {
                kycStatus: user.kycDetails.kycStatus,
                submittedAt: user.kycDetails.kycSubmittedAt
            }
        });

    } catch (error) {
        console.error('Submit KYC error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit KYC'
        });
    }
};

// ==================== WALLET MANAGEMENT ====================

// User: Get wallet balance
const getWalletBalance = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            // Create wallet if doesn't exist
            const newWallet = new Wallet({ userId });
            await newWallet.save();
            
            return res.json({
                success: true,
                message: 'Wallet created successfully',
                data: newWallet.getBalanceSnapshot()
            });
        }

        res.json({
            success: true,
            message: 'Wallet balance retrieved successfully',
            data: wallet.getBalanceSnapshot()
        });

    } catch (error) {
        console.error('Get wallet balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get wallet balance'
        });
    }
};

// ==================== DASHBOARD STATS ====================

// Get dashboard stats (Admin/TL)
const getDashboardStats = async (req, res) => {
    try {
        const user = req.user;
        
        if (user.role === 'admin') {
            // Admin dashboard stats
            const totalUsers = await User.countDocuments();
            const verifiedUsers = await User.countDocuments({ isVerified: true });
            const adminUsers = await User.countDocuments({ role: 'admin' });
            const tlUsers = await User.countDocuments({ role: 'TL' });
            const activeUsers = await User.countDocuments({ isActive: true });

            // Get recent registrations (last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const recentRegistrations = await User.countDocuments({
                createdAt: { $gte: weekAgo }
            });

            res.json({
                success: true,
                message: 'Admin dashboard stats retrieved successfully',
                data: {
                    totalUsers,
                    verifiedUsers,
                    adminUsers,
                    tlUsers,
                    activeUsers,
                    recentRegistrations,
                    unverifiedUsers: totalUsers - verifiedUsers,
                    inactiveUsers: totalUsers - activeUsers
                }
            });
        } else if (user.role === 'TL') {
            // TL dashboard stats
            const teamMembers = await User.find({ reportingTo: user._id, role: 'user' });
            const teamSize = teamMembers.length;
            
            let teamTotalLeads = 0;
            let teamCompletedLeads = 0;
            let teamTotalEarnings = 0;
            let activeTeamMembers = 0;

            teamMembers.forEach(member => {
                teamTotalLeads += member.statistics.totalLeads || 0;
                teamCompletedLeads += member.statistics.completedLeads || 0;
                teamTotalEarnings += member.statistics.totalEarnings || 0;
                
                if ((member.statistics.totalLeads || 0) > 0) {
                    activeTeamMembers++;
                }
            });

            // Get recent team activity (last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const recentTeamActivity = await User.countDocuments({
                reportingTo: user._id,
                role: 'user',
                'statistics.lastLeadDate': { $gte: weekAgo }
            });

            res.json({
                success: true,
                message: 'TL dashboard stats retrieved successfully',
                data: {
                    teamSize,
                    activeTeamMembers,
                    teamTotalLeads,
                    teamCompletedLeads,
                    teamTotalEarnings,
                    teamConversionRate: teamTotalLeads > 0 ? (teamCompletedLeads / teamTotalLeads * 100) : 0,
                    recentTeamActivity
                }
            });
        } else {
            // User dashboard stats
            res.json({
                success: true,
                message: 'User dashboard stats retrieved successfully',
                data: {
                    totalLeads: user.statistics.totalLeads || 0,
                    completedLeads: user.statistics.completedLeads || 0,
                    pendingLeads: user.statistics.pendingLeads || 0,
                    totalEarnings: user.statistics.totalEarnings || 0,
                    currentBalance: user.statistics.currentBalance || 0,
                    conversionRate: user.statistics.conversionRate || 0,
                    lastLeadDate: user.statistics.lastLeadDate
                }
            });
        }

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard stats'
        });
    }
};

// ==================== QUERY MANAGEMENT ====================

// User: Rise query
const riseQuery = async (req, res) => {
    try {
        const userId = req.user._id;
        const { subject, message, category = 'General', priority = 'Medium' } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Subject and message are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Here you would typically create a query in the Query model
        // For now, we'll return a success response
        res.json({
            success: true,
            message: 'Query submitted successfully',
            data: {
                queryId: `QRY-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                userId,
                userName: user.name,
                userEmail: user.email,
                subject,
                message,
                category,
                priority,
                status: 'Open',
                submittedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Rise query error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit query'
        });
    }
};

// ==================== BULK OPERATIONS ====================

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
        const data = excelParser.parseExcelFile(filePath);

        if (!data || data.length === 0) {
            excelParser.deleteFile(filePath);
            return res.status(400).json({
                success: false,
                message: 'File is empty or contains no valid data'
            });
        }

        console.log(`📊 Found ${data.length} users in the file`);

        // Define required fields for users
        const requiredFields = ['phoneNumber', 'name', 'email', 'password'];

        // Validate required fields
        const validation = excelParser.validateRequiredFields(data, requiredFields);

        if (!validation.isValid) {
            excelParser.deleteFile(filePath);
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
            role: row.role?.toString().toLowerCase() === 'admin' ? 'admin' : 
                  row.role?.toString().toLowerCase() === 'tl' ? 'TL' : 'user',
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
                        await emailService.sendWelcomeEmail(user.email, user.name);
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
        excelParser.deleteFile(filePath);

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
            excelParser.deleteFile(filePath);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to process bulk upload',
            error: error.message
        });
    }
};

// ==================== ADVANCED USER MANAGEMENT ====================

const getAllUsersWithStats = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            role, 
            status, 
            search, 
            sort = 'createdAt',
            order = 'desc' 
        } = req.query;

        const query = {};

        // Role filter
        if (role && role !== 'all') query.role = role;

        // Status filter
        if (status && status !== 'all') {
            if (status === 'ex') {
                query.isEx = true;
            } else if (status === 'active') {
                query.isActive = true;
                query.isEx = false;
            } else if (status === 'inactive') {
                query.isActive = false;
                query.isEx = false;
            } else if (status === 'hold') {
                query.status = 'hold';
                return; // Exit function early, or handle as needed
            } else if (status === 'blocked') {
                query.status = 'blocked';
                return; // Exit function early, or handle as needed
            } else if (status === 'pending') {
                query.status = 'pending_approval';
            }
        }

        // Search filter
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ];
        }

        // Sort configuration
        const sortConfig = {};
        sortConfig[sort] = order === 'desc' ? -1 : 1;

        const users = await User.find(query)
            .select('-password -otpAttempts -lastOtpSent -registrationOtp -registrationOtpExpires -loginOtp -loginOtpExpires -resetPasswordOtp -resetPasswordOtpExpires -emailOtp -emailOtpExpires -activeSession -sessionDevice -sessionIP -security')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sortConfig);

        const total = await User.countDocuments(query);

        // Enhanced users with statistics
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                try {
                    // Get leads statistics
                    const leads = await Lead.find({ 
                        hrUserId: user._id 
                    });
                    
                    const totalLeads = leads.length;
                    const completedLeads = leads.filter(lead => lead.status === 'completed').length;
                    const pendingLeads = leads.filter(lead => lead.status === 'pending').length;
                    const rejectedLeads = leads.filter(lead => lead.status === 'rejected').length;
                    const approvedLeads = leads.filter(lead => lead.status === 'approved').length;

                    // Get wallet statistics
                    const wallet = await Wallet.findOne({ userId: user._id }) || {
                        balance: 0,
                        totalEarned: 0,
                        totalWithdrawn: 0
                    };

                    return {
                        ...user.toObject(),
                        totalLeads,
                        completedLeads,
                        pendingLeads,
                        rejectedLeads,
                        approvedLeads,
                        totalEarnings: wallet.totalEarned,
                        currentBalance: wallet.balance,
                        totalWithdrawals: wallet.totalWithdrawn,
                        joinDate: user.createdAt.toISOString().split('T')[0],
                        lastActive: user.lastActivity ? user.lastActivity.toISOString().split('T')[0] : 'Never'
                    };
                } catch (error) {
                    console.error(`Error getting stats for user ${user._id}:`, error);
                    return {
                        ...user.toObject(),
                        totalLeads: 0,
                        completedLeads: 0,
                        pendingLeads: 0,
                        rejectedLeads: 0,
                        approvedLeads: 0,
                        totalEarnings: 0,
                        currentBalance: 0,
                        totalWithdrawals: 0,
                        joinDate: user.createdAt.toISOString().split('T')[0],
                        lastActive: user.lastActivity ? user.lastActivity.toISOString().split('T')[0] : 'Never'
                    };
                }
            })
        );

        res.json({
            success: true,
            message: 'Users with statistics retrieved successfully',
            data: {
                users: usersWithStats,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get all users with stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users with statistics',
            error: error.message
        });
    }
};

// Get user statistics
const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password -otpAttempts -lastOtpSent -registrationOtp -registrationOtpExpires -loginOtp -loginOtpExpires -resetPasswordOtp -resetPasswordOtpExpires -emailOtp -emailOtpExpires -activeSession -sessionDevice -sessionIP -security');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get leads statistics
        const leads = await Lead.find({ hrUserId: userId });
        const totalLeads = leads.length;
        const completedLeads = leads.filter(lead => lead.status === 'completed').length;
        const pendingLeads = leads.filter(lead => lead.status === 'pending').length;
        const rejectedLeads = leads.filter(lead => lead.status === 'rejected').length;
        const approvedLeads = leads.filter(lead => lead.status === 'approved').length;

        // Get wallet statistics
        const wallet = await Wallet.findOne({ userId }) || {
            balance: 0,
            totalEarned: 0,
            totalWithdrawn: 0
        };

        const stats = {
            user: user.toObject(),
            leads: {
                total: totalLeads,
                completed: completedLeads,
                pending: pendingLeads,
                rejected: rejectedLeads,
                approved: approvedLeads,
                conversionRate: totalLeads > 0 ? (completedLeads / totalLeads * 100).toFixed(2) : 0
            },
            wallet: {
                currentBalance: wallet.balance,
                totalEarned: wallet.totalEarned,
                totalWithdrawn: wallet.totalWithdrawn,
                availableBalance: wallet.balance
            },
            performance: {
                rating: user.performance?.rating || 0,
                completedTasks: user.performance?.completedTasks || 0,
                averageCompletionTime: user.performance?.averageCompletionTime || 0
            }
        };

        res.json({
            success: true,
            message: 'User statistics retrieved successfully',
            data: stats
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user statistics',
            error: error.message
        });
    }
};

// Update user (comprehensive update)
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update allowed fields
        const allowedFields = [
            'name', 'firstName', 'lastName', 'phoneNumber', 'role', 
            'isActive', 'isEx', 'dob', 'gender', 'address1', 'city', 
            'state', 'zip', 'country', 'profile', 'notifications'
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                user[field] = updateData[field];
            }
        });

        // Update nested objects
        if (updateData.kycDetails) {
            Object.keys(updateData.kycDetails).forEach(key => {
                if (updateData.kycDetails[key] !== undefined) {
                    user.kycDetails[key] = updateData.kycDetails[key];
                }
            });
        }

        if (updateData.bankDetails) {
            Object.keys(updateData.bankDetails).forEach(key => {
                if (updateData.bankDetails[key] !== undefined) {
                    user.bankDetails[key] = updateData.bankDetails[key];
                }
            });
        }

        if (updateData.statistics) {
            Object.keys(updateData.statistics).forEach(key => {
                if (updateData.statistics[key] !== undefined) {
                    user.statistics[key] = updateData.statistics[key];
                }
            });
        }

        // Update TL specific fields
        if (updateData.tlDetails && user.role === 'TL') {
            Object.keys(updateData.tlDetails).forEach(key => {
                if (updateData.tlDetails[key] !== undefined) {
                    user.tlDetails[key] = updateData.tlDetails[key];
                }
            });
        }

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user: user.toJSON() }
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};

// Export users to Excel
const exportUsers = async (req, res) => {
    try {
        const { format = 'excel' } = req.query;

        // Get all users with statistics
        const users = await User.find({})
            .select('-password -otpAttempts -lastOtpSent -registrationOtp -registrationOtpExpires -loginOtp -loginOtpExpires -resetPasswordOtp -resetPasswordOtpExpires -emailOtp -emailOtpExpires -activeSession -sessionDevice -sessionIP -security')
            .sort({ createdAt: -1 });

        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const leads = await Lead.find({ hrUserId: user._id });
                const wallet = await Wallet.findOne({ userId: user._id }) || {
                    balance: 0,
                    totalEarned: 0,
                    totalWithdrawn: 0
                };

                return {
                    'User ID': user._id.toString(),
                    'Name': user.name || 'N/A',
                    'Email': user.email || 'N/A',
                    'Phone': user.phoneNumber || 'N/A',
                    'Role': user.role || 'user',
                    'Status': user.isEx ? 'Ex User' : (user.isActive ? 'Active' : 'Inactive'),
                    'KYC Status': user.kycDetails?.kycStatus || 'Not Submitted',
                    'Total Leads': leads.length,
                    'Completed Leads': leads.filter(l => l.status === 'completed').length,
                    'Pending Leads': leads.filter(l => l.status === 'pending').length,
                    'Rejected Leads': leads.filter(l => l.status === 'rejected').length,
                    'Total Earnings': `₹${wallet.totalEarned.toLocaleString('en-IN')}`,
                    'Current Balance': `₹${wallet.balance.toLocaleString('en-IN')}`,
                    'Join Date': user.createdAt.toLocaleDateString('en-IN'),
                    'Last Active': user.lastActivity ? user.lastActivity.toLocaleDateString('en-IN') : 'Never',
                    'City': user.city || 'N/A',
                    'State': user.state || 'N/A'
                };
            })
        );

        if (format === 'excel') {
            // Create Excel workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Users');

            // Add headers
            const headers = Object.keys(usersWithStats[0] || {});
            worksheet.addRow(headers);

            // Style headers
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE6E6FA' }
            };

            // Add data
            usersWithStats.forEach(user => {
                worksheet.addRow(Object.values(user));
            });

            // Auto-fit columns
            worksheet.columns.forEach(column => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, cell => {
                    const columnLength = cell.value ? cell.value.toString().length : 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = Math.min(Math.max(maxLength + 2, 10), 50);
            });

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=users-export.xlsx');

            // Write to response
            await workbook.xlsx.write(res);
            res.end();
        } else {
            // JSON format
            res.json({
                success: true,
                message: 'Users exported successfully',
                data: usersWithStats
            });
        }

    } catch (error) {
        console.error('Export users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export users',
            error: error.message
        });
    }
};

// ==================== EXPORT ALL FUNCTIONS ====================

module.exports = {
    // Authentication
    register,
    verifyRegistrationOTP,
    approveUser,
    activateUser,
    login,
    verifyLoginOTP,
    adminLogin,
    tlLogin,
    verifyOTP: verifyLoginOTP,
    logout,
    markAttendance,
    getTodayAttendance,
    getAttendanceHistory,
    getAttendanceReport,
    getTeamAttendance,
    
    // Profile Management
    getProfile,
    updateProfile,
    changePassword,
    
    // Password Recovery
    forgotPassword,
    resetPassword,
    
    // Email OTP
    sendEmailOTP,
    verifyEmailOTP,
    
    // Admin User Management
    getAllUsers,
    getUserById,
    updateUserRole,
    updateTLPermissions,
    toggleUserStatus,
    markUserAsEx,
    deleteUser,
    approveUserRegistration,
    markUserHold,
    markUserActive,
    blockUser,
    changeUserRole,
    getUsersByStatus,
    
    // TL Functions
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    getTeamPerformance,
    
    // Lead Distribution
    distributeLeads,
    withdrawLeads,
    distributeLeadsToTeam,
    
    // User Lead Management
    getUserTodaysLeads,
    startLead,
    completeLead,
    
    // KYC Management
    updateKYCDetails,
    getKYCDetails,
    getPendingKYCRequests,
    approveKYC,
    rejectKYC,
    getKYCDetailsByUserId,
    requestKYCApproval,
    submitKYC,
    
    // Wallet Management
    getWalletBalance,
    
    // Query Management
    riseQuery,
    
    // Dashboard Stats
    getDashboardStats,
    
    // Bulk Operations
    bulkUploadUsers,
    
    // Advanced User Management
    getAllUsersWithStats,
    getUserStats,
    exportUsers,
    updateUser,
    getApprovedUsers,
    getPresentUsers,
    getNotApprovedUsers,
    rejectUser,
    assignUserToTL,
    bulkApproveUsers,
    exportPendingUsers,
    approveAndAssignTL,
    getTeamLeadersWithActiveStatus,
    getTeamUsersWithStats,
    
    // Legacy functions
    sendOTP
};