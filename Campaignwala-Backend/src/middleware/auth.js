const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Please authenticate' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId || decoded._id);
        
        if (!user || !user.isActive) {
            return res.status(401).json({ 
                success: false,
                error: 'Please authenticate' 
            });
        }
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false,
            error: 'Please authenticate' 
        });
    }
};

// Make this consistent with user.middleware.js
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                error: 'Authentication required' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                error: `You do not have permission to perform this action. Required roles: ${roles.join(', ')}` 
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize };