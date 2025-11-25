const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const swaggerSetup = require('./src/config/swagger');
const routes = require('./src/router/index');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// DIAGNOSTIC: add at top after `const app = express();`
app.use((req, res, next) => {
  console.log('DIAG: incoming', new Date().toISOString(), req.method, req.originalUrl, 'Host:', req.headers.host, 'IP:', req.ip);
  next();
});

app.get('/test-probe', (req, res) => {
  console.log('DIAG: /test-probe served');
  return res.status(200).json({ diag: 'express-reached' });
});

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://telewave-services.vercel.app',
      'http://localhost:5173',
      "https://campaignwala-seven.vercel.app",
      'https://telewaveservices.onrender.com',
      'https://campaign-backend-production-8262.up.railway.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🔒 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));

// Increase payload limit for base64 images (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log('🟢 ===== INCOMING REQUEST =====');
    console.log(`🟢 [${timestamp}] ${req.method} ${req.path}`);
    console.log('🟢 Full URL:', req.originalUrl);
    console.log('🟢 Headers:', req.headers.authorization ? '✅ Has Token' : '❌ No Token');
    console.log('🟢 ==============================');
    next();
});

// Security headers middleware
app.use((req, res, next) => {
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
});

// Swagger Documentation
swaggerSetup(app);

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 Campaignwala Backend API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        documentation: '/api-docs',
        endpoints: {
            auth: '/api/users',
            categories: '/api/categories',
            offers: '/api/offers',
            leads: '/api/leads',
            wallet: '/api/wallet',
            withdrawals: '/api/withdrawals'
        }
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: '✅ API Server is operational',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        database: 'Connected', // You can add DB status check here
        features: {
            emailAuth: true,
            kycSystem: true,
            walletSystem: true,
            adminPanel: true
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error Stack:', err.stack);
    
    // CORS error handling
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy: Request not allowed from this origin'
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler - MUST be last middleware
// FIXED: Use proper path syntax instead of '*'
app.use((req, res) => {
    console.log('❌ 404 - Route not found:', req.originalUrl);
    res.status(404).json({
        success: false,
        message: '🔍 Route not found',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: {
            documentation: '/api-docs',
            health: '/api/health',
            status: '/api/status',
            users: '/api/users',
            categories: '/api/categories',
            offers: '/api/offers'
        }
    });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`✅ Status Check: http://localhost:${PORT}/api/status`);
    
    // Log important environment variables (without sensitive data)
    console.log(`📧 Email Service: ${process.env.EMAIL_USER ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
    console.log(`🗄️ Database: ${process.env.MONGODB_URI ? '✅ Connected' : '❌ Not configured'}`);
});


module.exports = app;

