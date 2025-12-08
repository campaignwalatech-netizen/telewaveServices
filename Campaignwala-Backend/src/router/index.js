const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('../modules/users/user.router');
const dashboardRoutes = require('../modules/dashboard/dashboard.router'); // NEW
const leadsRoutes = require('../modules/leads/leads.router');
const categoryRoutes = require('../modules/categories/categories.router');
const offerRoutes = require('../modules/offers/offers.router');
const slideRoutes = require('../modules/slides/slides.router');
const walletRoutes = require('../modules/wallet/wallet.router');
const withdrawalRoutes = require('../modules/withdrawal/withdrawal.router');
const notificationRoutes = require('../modules/notifications/notification.router');
const queryRoutes = require('../modules/queries/query.router');
const adminLogRoutes = require('../modules/adminlogs/adminlog.router');
const dataRoutes = require('../modules/data/data.routes');

// Health check for API
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    });
});

// API status endpoint
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'Campaignwala API Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// Mount route modules
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes); // NEW
router.use('/leads', leadsRoutes);
router.use('/categories', categoryRoutes);
router.use('/offers', offerRoutes);
router.use('/slides', slideRoutes);
router.use('/wallet', walletRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/notifications', notificationRoutes);
router.use('/queries', queryRoutes);
router.use('/adminlogs', adminLogRoutes);
router.use('/data', dataRoutes);

module.exports = router;