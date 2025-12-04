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
    requireTL,
    authorize
} = require('../../middleware/user.middleware');

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboard statistics and analytics endpoints
 */

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get comprehensive admin dashboard statistics
 *     description: |
 *       Returns detailed statistics for admin dashboard including:
 *       - User statistics (total, active, pending, roles)
 *       - Lead statistics (total, today, pending, completed)
 *       - Financial statistics (balance, earnings, withdrawals)
 *       - KYC statistics (pending, approved)
 *       - Query statistics (open, replied)
 *       - Attendance statistics
 *       - Recent activities
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Admin dashboard data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                         totalTLs:
 *                           type: number
 *                         totalActiveUsers:
 *                           type: number
 *                         totalLeads:
 *                           type: number
 *                         totalCompletedLeads:
 *                           type: number
 *                         totalPendingLeads:
 *                           type: number
 *                         totalWithdrawals:
 *                           type: number
 *                         conversionRate:
 *                           type: number
 *                     todayStats:
 *                       type: object
 *                       properties:
 *                         newUsers:
 *                           type: number
 *                         newLeads:
 *                           type: number
 *                         withdrawals:
 *                           type: number
 *                     pendingActions:
 *                       type: object
 *                       properties:
 *                         kycApprovals:
 *                           type: number
 *                         withdrawalApprovals:
 *                           type: number
 *                     userStats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         active:
 *                           type: number
 *                         pendingApproval:
 *                           type: number
 *                         hold:
 *                           type: number
 *                         blocked:
 *                           type: number
 *                         ex:
 *                           type: number
 *                         roles:
 *                           type: object
 *                           properties:
 *                             admin:
 *                               type: number
 *                             tl:
 *                               type: number
 *                             user:
 *                               type: number
 *                     leadStats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         today:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         assigned:
 *                           type: number
 *                         completed:
 *                           type: number
 *                     financialStats:
 *                       type: object
 *                       properties:
 *                         totalBalance:
 *                           type: number
 *                         totalEarned:
 *                           type: number
 *                         totalWithdrawn:
 *                           type: number
 *                         pendingWithdrawals:
 *                           type: number
 *                         totalWithdrawals:
 *                           type: number
 *                     kycStats:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: number
 *                         approved:
 *                           type: number
 *                     queryStats:
 *                       type: object
 *                       properties:
 *                         open:
 *                           type: number
 *                         replied:
 *                           type: number
 *                     attendanceStats:
 *                       type: object
 *                       properties:
 *                         presentToday:
 *                           type: number
 *                         absentToday:
 *                           type: number
 *                     recentActivities:
 *                       type: object
 *                       properties:
 *                         registrations:
 *                           type: number
 *                         leads:
 *                           type: number
 *                         recentUsers:
 *                           type: array
 *                     recentUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/admin', authenticateToken, requireAdmin, getAdminDashboard);

/**
 * @swagger
 * /api/dashboard/tl:
 *   get:
 *     summary: Get TL dashboard statistics with team insights
 *     description: |
 *       Returns team leader dashboard statistics including:
 *       - Team overview and performance metrics
 *       - Lead statistics for the team
 *       - Financial statistics and earnings
 *       - Team member performance data
 *       - Attendance tracking
 *       - Recent team activities
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: TL dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "TL dashboard data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     teamStats:
 *                       type: object
 *                       properties:
 *                         totalMembers:
 *                           type: number
 *                         activeMembers:
 *                           type: number
 *                         totalLeads:
 *                           type: number
 *                         completedLeads:
 *                           type: number
 *                         pendingLeads:
 *                           type: number
 *                         totalEarnings:
 *                           type: number
 *                         todayLeads:
 *                           type: number
 *                         todayEarnings:
 *                           type: number
 *                     teamInfo:
 *                       type: object
 *                       properties:
 *                         size:
 *                           type: number
 *                         activeMembers:
 *                           type: number
 *                         presentToday:
 *                           type: number
 *                     leadStats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         completed:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         today:
 *                           type: number
 *                         pendingCurrent:
 *                           type: number
 *                         tlAssigned:
 *                           type: number
 *                     financialStats:
 *                       type: object
 *                       properties:
 *                         totalEarnings:
 *                           type: number
 *                         todayEarnings:
 *                           type: number
 *                         averagePerLead:
 *                           type: number
 *                     performance:
 *                       type: object
 *                       properties:
 *                         conversionRate:
 *                           type: number
 *                         averageCompletion:
 *                           type: number
 *                     conversionRate:
 *                       type: number
 *                     recentActivities:
 *                       type: object
 *                       properties:
 *                         leads:
 *                           type: number
 *                     topPerformers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           totalLeads:
 *                             type: number
 *                           completedLeads:
 *                             type: number
 *                           pendingLeads:
 *                             type: number
 *                           todayLeads:
 *                             type: number
 *                           totalEarnings:
 *                             type: number
 *                           conversionRate:
 *                             type: number
 *                           attendance:
 *                             type: string
 *                     recentTeamLeads:
 *                       type: array
 *                       items:
 *                         type: object
 *                     teamMembers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           attendance:
 *                             type: string
 *                           leads:
 *                             type: object
 *                             properties:
 *                               total:
 *                                 type: number
 *                               completed:
 *                                 type: number
 *                               pending:
 *                                 type: number
 *                               today:
 *                                 type: number
 *                           earnings:
 *                             type: number
 *       403:
 *         description: TL access required
 *       500:
 *         description: Internal server error
 */
router.get('/tl', authenticateToken, requireTL, getTLDashboard);

/**
 * @swagger
 * /api/dashboard/user:
 *   get:
 *     summary: Get user dashboard statistics with personal analytics
 *     description: |
 *       Returns user dashboard statistics including:
 *       - Personal overview and KYC status
 *       - Lead statistics and conversion rates
 *       - Wallet and earnings information
 *       - Daily goals and quota progress
 *       - Attendance and streak information
 *       - Recent completed leads
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User dashboard data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     # Old version structure
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalLeads:
 *                           type: number
 *                         completedLeads:
 *                           type: number
 *                         pendingLeads:
 *                           type: number
 *                         rejectedLeads:
 *                           type: number
 *                         totalEarnings:
 *                           type: number
 *                         currentBalance:
 *                           type: number
 *                         conversionRate:
 *                           type: number
 *                         pendingWithdrawals:
 *                           type: number
 *                     todayStats:
 *                       type: object
 *                       properties:
 *                         leads:
 *                           type: number
 *                     recentLeads:
 *                       type: array
 *                       items:
 *                         type: object
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         balance:
 *                           type: number
 *                         totalEarned:
 *                           type: number
 *                         totalWithdrawn:
 *                           type: number
 *                     
 *                     # New version structure
 *                     userInfo:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         role:
 *                           type: string
 *                         kycStatus:
 *                           type: string
 *                         attendance:
 *                           type: object
 *                           properties:
 *                             today:
 *                               type: string
 *                             streak:
 *                               type: number
 *                             monthly:
 *                               type: object
 *                               properties:
 *                                 present:
 *                                   type: number
 *                                 absent:
 *                                   type: number
 *                                 late:
 *                                   type: number
 *                     leadStats:
 *                       type: object
 *                       properties:
 *                         todaysLeads:
 *                           type: number
 *                         yesterdaysPending:
 *                           type: number
 *                         inProgress:
 *                           type: number
 *                         completedToday:
 *                           type: number
 *                         totalCompleted:
 *                           type: number
 *                         totalEarnings:
 *                           type: number
 *                         conversionRate:
 *                           type: number
 *                     walletNew:
 *                       type: object
 *                       properties:
 *                         currentBalance:
 *                           type: number
 *                         totalEarned:
 *                           type: number
 *                         totalWithdrawn:
 *                           type: number
 *                         availableBalance:
 *                           type: number
 *                     dailyGoals:
 *                       type: object
 *                       properties:
 *                         quota:
 *                           type: number
 *                         completed:
 *                           type: number
 *                         progress:
 *                           type: number
 *                         remaining:
 *                           type: number
 *                     recentCompleted:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           leadId:
 *                             type: string
 *                           offerName:
 *                             type: string
 *                           category:
 *                             type: string
 *                           completedAt:
 *                             type: string
 *                             format: date-time
 *                           earnings:
 *                             type: number
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/user', authenticateToken, authorize('user'), getUserDashboard);

/**
 * @swagger
 * /api/dashboard/me:
 *   get:
 *     summary: Get dashboard based on user role (auto-detected)
 *     description: |
 *       Automatically detects user role and returns appropriate dashboard.
 *       - Admins get admin dashboard
 *       - TLs get TL dashboard
 *       - Regular users get user dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully based on role
 *       403:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
router.get('/me', authenticateToken, (req, res, next) => {
    const userRole = req.user.role;
    
    switch (userRole) {
        case 'admin':
            return getAdminDashboard(req, res, next);
        case 'TL':
            return getTLDashboard(req, res, next);
        case 'user':
            return getUserDashboard(req, res, next);
        default:
            return res.status(403).json({
                success: false,
                message: 'Invalid user role'
            });
    }
});

module.exports = router;