const express = require('express');
const router = express.Router();
const {
    getAdminDashboard,
    getTLDashboard,
    getUserDashboard
} = require('./dashboard.controller');
const {
    authenticateToken,
    requireAdmin,
    requireTL
} = require('../../middleware/user.middleware');

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboard statistics endpoints
 */

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get('/admin', authenticateToken, requireAdmin, getAdminDashboard);

/**
 * @swagger
 * /api/dashboard/tl:
 *   get:
 *     summary: Get TL dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: TL dashboard data retrieved successfully
 *       403:
 *         description: TL access required
 */
router.get('/tl', authenticateToken, requireTL, getTLDashboard);

/**
 * @swagger
 * /api/dashboard/user:
 *   get:
 *     summary: Get user dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User dashboard data retrieved successfully
 */
router.get('/user', authenticateToken, getUserDashboard);

module.exports = router;