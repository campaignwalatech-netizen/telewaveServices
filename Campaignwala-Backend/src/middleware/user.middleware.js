const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model'); // Updated path based on your model location
const HTTP_STATUS = require('../constants/httpStatus');

// ==================== MAIN AUTHENTICATION MIDDLEWARE ====================

// Protect routes - verify JWT token (renamed from authenticateToken)
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Access token is required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password -emailOtp -emailOtpExpires');

        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid token - user not found'
            });
        }

        if (!user.isActive) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check if this is the active session (single device login)
        if (user.activeSession && user.activeSession !== token) {
            console.log('⚠️ Session mismatch detected for user:', user.email);
            console.log('🔒 User logged in from another device/location');
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Your account is logged in from another device. You have been logged out.',
                sessionExpired: true,
                reason: 'logged_in_elsewhere'
            });
        }

        // Update last activity
        user.lastActivity = new Date();
        await user.save();

        req.user = user;
        req.token = token; // Store token for logout functionality
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Token expired'
            });
        }

        console.error('Authentication error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// ==================== ROLE AUTHORIZATION MIDDLEWARE ====================

/**
 * Role-based authorization middleware
 * @param {...string} roles - Allowed roles (admin, TL, user)
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`,
                userRole: req.user.role,
                requiredRoles: roles
            });
        }

        next();
    };
};

// ==================== SPECIFIC ROLE MIDDLEWARES ====================

// Check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Check if user is TL
const requireTL = (req, res, next) => {
    if (req.user.role !== 'TL') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'Team Leader access required'
        });
    }
    next();
};

// Check if user is admin or TL
const requireAdminOrTL = (req, res, next) => {
    if (!['admin', 'TL'].includes(req.user.role)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'Admin or Team Leader access required'
        });
    }
    next();
};

// Check if user is verified
const requireVerified = (req, res, next) => {
    if (!req.user.isVerified) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'Account verification required'
        });
    }
    next();
};

// ==================== TL-SPECIFIC PERMISSIONS ====================

// Check TL permissions for team management
const requireTLTeamAccess = async (req, res, next) => {
    try {
        if (req.user.role === 'admin') {
            return next(); // Admin has full access
        }

        if (req.user.role !== 'TL') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Team Leader access required for team management'
            });
        }

        const { userId } = req.params;
        
        // TL can only manage their own team members
        const isTeamMember = req.user.teamMembers && req.user.teamMembers.includes(userId);
        
        if (!isTeamMember && userId !== req.user._id.toString()) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'You can only manage your own team members'
            });
        }

        next();
    } catch (error) {
        console.error('TL team access check error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Access check failed'
        });
    }
};

// Check lead assignment permissions
const requireLeadAssignmentPermission = (req, res, next) => {
    if (req.user.role === 'admin') {
        return next(); // Admin has full access
    }

    if (req.user.role === 'TL' && req.user.tlDetails?.permissions?.assignLeads) {
        return next(); // TL with assign permission
    }

    return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions to assign leads'
    });
};

// Check lead approval permissions
const requireLeadApprovalPermission = (req, res, next) => {
    if (req.user.role === 'admin') {
        return next(); // Admin has full access
    }

    if (req.user.role === 'TL' && req.user.tlDetails?.permissions?.approveLeads) {
        return next(); // TL with approval permission
    }

    return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions to approve leads'
    });
};

// ==================== PERMISSION-BASED AUTHORIZATION ====================

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check (e.g., 'view_reports', 'assign_leads')
 * @returns {Function} Express middleware
 */
const hasPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admin has all permissions
        if (req.user.role === 'admin') {
            return next();
        }

        // Check TL permissions
        if (req.user.role === 'TL') {
            const hasPerm = req.user.tlDetails?.permissions?.[permission];
            if (!hasPerm) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: `Insufficient permissions. Required: ${permission}`,
                    userRole: req.user.role
                });
            }
            return next();
        }

        // For regular users, you can define user permissions here
        const userPermissions = {
            'view_dashboard': true,
            'view_leads': true,
            'view_wallet': true,
            'update_profile': true,
            'mark_attendance': true,
            'create_leads': true
        };

        if (!userPermissions[permission]) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: `Insufficient permissions. Required: ${permission}`,
                userRole: req.user.role
            });
        }

        next();
    };
};

// ==================== ATTENDANCE SPECIFIC MIDDLEWARE ====================

/**
 * Get IST time components from UTC
 * IST is UTC+5:30
 */
const getISTTimeComponents = () => {
    const now = new Date();
    // Get UTC time components
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const utcSeconds = now.getUTCSeconds();
    
    // Convert to IST (UTC+5:30)
    let istHours = utcHours + 5;
    let istMinutes = utcMinutes + 30;
    
    // Handle minute overflow
    if (istMinutes >= 60) {
        istHours += 1;
        istMinutes -= 60;
    }
    
    // Handle hour overflow (next day)
    if (istHours >= 24) {
        istHours -= 24;
    }
    
    return { hours: istHours, minutes: istMinutes, seconds: utcSeconds };
};

/**
 * Check if user can mark attendance (only between 00:01 AM to 10:00 AM IST)
 * @returns {Function} Express middleware
 */
const canMarkAttendance = (req, res, next) => {
    const { hours: currentHour, minutes: currentMinute } = getISTTimeComponents();
    
    // Convert to minutes since midnight for easier comparison
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTimeInMinutes = 0 * 60 + 1; // 00:01 AM
    const endTimeInMinutes = 10 * 60 + 0; // 10:00 AM
    
    // Check if within 00:01 AM to 10:00 AM IST window
    if (currentTimeInMinutes < startTimeInMinutes || currentTimeInMinutes > endTimeInMinutes) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'Attendance can only be marked between 00:01 AM and 10:00 AM IST',
            currentIST: `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')} IST`
        });
    }

    // Check if already marked today
    if (req.user.attendance?.todayMarkedAt) {
        const markedDate = new Date(req.user.attendance.todayMarkedAt);
        const today = new Date();
        
        if (markedDate.toDateString() === today.toDateString()) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: 'Attendance already marked for today',
                markedAt: markedDate
            });
        }
    }

    next();
};

// ==================== OPTIONAL AUTHENTICATION ====================

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password -emailOtp -emailOtpExpires');

            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

const debugAuth = (req, res, next) => {
    console.log('🔐 [AUTH DEBUG] Route:', req.path);
    console.log('🔐 [AUTH DEBUG] Method:', req.method);
    console.log('🔐 [AUTH DEBUG] Headers:', req.headers.authorization ? 'Has Auth Header' : 'No Auth Header');
    if (req.user) {
        console.log('🔐 [AUTH DEBUG] User:', req.user._id, req.user.email, req.user.role);
    } else {
        console.log('🔐 [AUTH DEBUG] No user in request');
    }
    next();
};

// ==================== EXPORTS ====================

module.exports = {
    debugAuth,
    // Main authentication middleware
    protect,
    authenticateToken: protect, // Keep backward compatibility
    
    // Role authorization
    authorize,
    requireAdmin,
    requireTL,
    requireAdminOrTL,
    
    // Permission-based authorization
    hasPermission,
    requireVerified,
    requireTLTeamAccess,
    requireLeadAssignmentPermission,
    requireLeadApprovalPermission,
    
    // Attendance specific
    canMarkAttendance,
    
    // Optional authentication
    optionalAuth
};