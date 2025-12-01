const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model');
const HTTP_STATUS = require('../constants/httpStatus');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
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
        const isTeamMember = req.user.teamMembers.includes(userId);
        
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

module.exports = {
    authenticateToken,
    requireAdmin,
    requireTL,
    requireAdminOrTL,
    requireVerified,
    requireTLTeamAccess,
    requireLeadAssignmentPermission,
    requireLeadApprovalPermission,
    optionalAuth
};