const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const swaggerSetup = require('./src/config/swagger');
const routes = require('./src/router/index');

// ✅ Load env ONLY in local/dev
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Create Express app
const app = express();

/* =====================================================
   DATABASE
===================================================== */

/* =====================================================
   CORS CONFIG (Express 5 compatible)
===================================================== */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://leads.freelancerwala.com',
  'https://campaignwala-seven.vercel.app',
  'http://localhost:3000',
  'https://campaign-backend-production.up.railway.app',
  'https://telewaveservices.onrender.com',
  'http://freelancer-backend.ap-south-1.elasticbeanstalk.com',
  process.env.FRONTEND_URL
].filter(Boolean);

// Create CORS middleware function
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('🔒 CORS BLOCKED:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// ✅ Handle OPTIONS preflight - FIXED for Express 5
app.options(/.*/, cors(corsOptions)); // Use regex instead of '*'

/* =====================================================
DIAGNOSTIC MIDDLEWARE
===================================================== */
app.use((req, res, next) => {
  console.log(
    'DIAG:',
    new Date().toISOString(),
    req.method,
    req.originalUrl,
    'Origin:',
    req.headers.origin || 'none',
    'IP:',
    req.ip
  );
  next();
});

app.get('/test-probe', (req, res) => {
  return res.status(200).json({ diag: 'express-reached' });
});

/* =====================================================
BODY PARSERS
===================================================== */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* =====================================================
REQUEST LOGGER
===================================================== */
app.use((req, res, next) => {
  console.log('🟢 ===== INCOMING REQUEST =====');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Auth:', req.headers.authorization ? 'YES' : 'NO');
  console.log('🟢 ==============================');
  next();
});

/* =====================================================
SECURITY HEADERS
===================================================== */
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

/* =====================================================
SWAGGER DOCS
===================================================== */
swaggerSetup(app);

/* =====================================================
ROUTES
===================================================== */
app.use('/api', routes);

/* =====================================================
ROOT
===================================================== */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Freelancerwala Backend API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    documentation: '/api-docs',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform
  });
});

/* =====================================================
STATUS
===================================================== */
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: '✅ API Server is operational',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

/* =====================================================
ERROR HANDLER
===================================================== */
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.message);
  console.error('Stack:', err.stack);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy: Request not allowed'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // Default
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

/* =====================================================
404 HANDLER
===================================================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '🔍 Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

/* =====================================================
SERVER START (RAILWAY / RENDER SAFE)
===================================================== */
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`📦 Node Version: ${process.version}`);
  console.log(`🏗️  Platform: ${process.platform}`);
  connectDB();
});

module.exports = app;