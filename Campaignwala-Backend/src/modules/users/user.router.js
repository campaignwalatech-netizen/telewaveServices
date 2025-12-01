const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload.middleware');
const {
    register,
    verifyRegistrationOTP,
    login,
    verifyLoginOTP,
    adminLogin,
    tlLogin, // NEW
    logout,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    getAllUsers,
    getUserById,
    updateUserRole,
    updateTLPermissions, // NEW
    toggleUserStatus,
    markUserAsEx,
    deleteUser,
    getDashboardStats,
    updateKYCDetails,
    getKYCDetails,
    getPendingKYCRequests,
    approveKYC,
    rejectKYC,
    getKYCDetailsByUserId,
    sendEmailOTP,
    verifyEmailOTP,
    bulkUploadUsers,
    sendOTP,
    // New enhanced methods
    getAllUsersWithStats,
    getUserStats,
    exportUsers,
    updateUser,
    // TL Methods
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    getTeamPerformance
} = require('./user.controller');

const {
    authenticateToken,
    requireAdmin,
    requireTL,
    requireAdminOrTL,
    requireVerified,
    requireTLTeamAccess,
    requireLeadAssignmentPermission,
    requireLeadApprovalPermission
} = require('../../middleware/user.middleware');


// Add this to your user.routes.js
router.get('/test-email', async (req, res) => {
    try {
        const { sendOTPEmail } = require('../../utils/emailService');
        const result = await sendOTPEmail('rajyogi1811@gmail.com', 'Test User', '1234', 'test');
        
        res.json({
            success: true,
            emailService: result.developmentMode ? 'DEVELOPMENT MODE' : 'PRODUCTION MODE',
            details: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 *   - name: User Profile
 *     description: User profile management endpoints
 *   - name: Admin
 *     description: Admin-only endpoints for user management
 *   - name: TL
 *     description: Team Leader endpoints
 *   - name: KYC
 *     description: KYC management endpoints
 */

// ==================== AUTHENTICATION ROUTES ====================

router.get('/', getAllUsers);

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user - Step 1 Send OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *               - phoneNumber
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: Password (minimum 6 characters)
 *                 example: "password123"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm password
 *                 example: "password123"
 *               phoneNumber:
 *                 type: string
 *                 description: 10-digit phone number
 *                 example: "9876543210"
 *               role:
 *                 type: string
 *                 description: User role (user/admin/TL)
 *                 example: "user"
 *     responses:
 *       200:
 *         description: OTP sent to email for verification
 */
router.post('/register', register);

router.post('/verify-registration', verifyRegistrationOTP);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user - Step 1 Send OTP to email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Registered email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: OTP sent to email successfully
 */
router.post('/login', login);

router.post('/verify-login', verifyLoginOTP);

/**
 * @swagger
 * /api/users/admin-login:
 *   post:
 *     summary: Login admin - sends OTP to email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Admin email address
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 description: Admin password
 *                 example: "admin123"
 *     responses:
 *       200:
 *         description: OTP sent to admin email successfully
 */
router.post('/admin-login', adminLogin);

/**
 * @swagger
 * /api/users/tl-login:
 *   post:
 *     summary: Login Team Leader - sends OTP to email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Team Leader email address
 *                 example: "tl@example.com"
 *               password:
 *                 type: string
 *                 description: Team Leader password
 *                 example: "tl123456"
 *     responses:
 *       200:
 *         description: OTP sent to Team Leader email successfully
 */
router.post('/tl-login', tlLogin); // NEW

router.post('/verify-otp', verifyLoginOTP);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', authenticateToken, logout);

// ==================== USER PROFILE ROUTES ====================

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.post('/send-email-otp', authenticateToken, sendEmailOTP);
router.post('/verify-email-otp', authenticateToken, verifyEmailOTP);

// ==================== KYC ROUTES ====================

router.get('/kyc', authenticateToken, getKYCDetails);
router.put('/kyc', authenticateToken, updateKYCDetails);

// ==================== ADMIN ROUTES ====================

router.get('/admin/users', authenticateToken, requireAdmin, getAllUsers);
router.get('/admin/users-with-stats', authenticateToken, requireAdmin, getAllUsersWithStats);
router.get('/admin/export-users', authenticateToken, requireAdmin, exportUsers);
router.get('/admin/users/:userId/stats', authenticateToken, requireAdmin, getUserStats);
router.get('/admin/users/:userId', authenticateToken, requireAdmin, getUserById);
router.put('/admin/users/:userId', authenticateToken, requireAdmin, updateUser);
router.put('/admin/users/:userId/role', authenticateToken, requireAdmin, updateUserRole);
router.put('/admin/users/:userId/tl-permissions', authenticateToken, requireAdmin, updateTLPermissions); // NEW
router.put('/admin/users/:userId/toggle-status', authenticateToken, requireAdmin, toggleUserStatus);
router.put('/admin/users/:userId/mark-ex', authenticateToken, requireAdmin, markUserAsEx);
router.delete('/admin/users/:userId', authenticateToken, requireAdmin, deleteUser);
router.get('/admin/dashboard-stats', authenticateToken, requireAdmin, getDashboardStats);
router.post('/admin/bulk-upload', authenticateToken, requireAdmin, upload.single('file'), bulkUploadUsers);

// ==================== ADMIN KYC ROUTES ====================

router.get('/admin/kyc/pending', authenticateToken, requireAdmin, getPendingKYCRequests);
router.get('/admin/kyc/:userId', authenticateToken, requireAdmin, getKYCDetailsByUserId);
router.put('/admin/kyc/:userId/approve', authenticateToken, requireAdmin, approveKYC);
router.put('/admin/kyc/:userId/reject', authenticateToken, requireAdmin, rejectKYC);

// ==================== TL ROUTES ====================

/**
 * @swagger
 * /api/users/tl/team-members:
 *   get:
 *     summary: Get TL's team members
 *     tags: [TL]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team members retrieved successfully
 */
router.get('/tl/team-members', authenticateToken, requireTL, getTeamMembers);

/**
 * @swagger
 * /api/users/tl/team-members:
 *   post:
 *     summary: Add member to TL's team
 *     tags: [TL]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId:
 *                 type: string
 *                 description: User ID to add to team
 *     responses:
 *       200:
 *         description: Team member added successfully
 */
router.post('/tl/team-members', authenticateToken, requireTL, addTeamMember);

/**
 * @swagger
 * /api/users/tl/team-members/{memberId}:
 *   delete:
 *     summary: Remove member from TL's team
 *     tags: [TL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team member removed successfully
 */
router.delete('/tl/team-members/:memberId', authenticateToken, requireTL, removeTeamMember);

/**
 * @swagger
 * /api/users/tl/team-performance:
 *   get:
 *     summary: Get team performance report
 *     tags: [TL]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team performance report retrieved successfully
 */
router.get('/tl/team-performance', authenticateToken, requireTL, getTeamPerformance);

/**
 * @swagger
 * /api/users/tl/dashboard-stats:
 *   get:
 *     summary: Get TL dashboard statistics
 *     tags: [TL]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: TL dashboard stats retrieved successfully
 */
router.get('/tl/dashboard-stats', authenticateToken, requireTL, getDashboardStats);

// ==================== LEGACY ROUTES ====================

router.post('/send-otp', sendOTP);

// User management
router.get('/admin/users', authenticateToken, requireAdmin, getAllUsers);
router.get('/admin/users-with-stats', authenticateToken, requireAdmin, getAllUsersWithStats);
router.get('/admin/export-users', authenticateToken, requireAdmin, exportUsers);
router.get('/admin/users/:userId/stats', authenticateToken, requireAdmin, getUserStats);
router.put('/admin/users/:userId', authenticateToken, requireAdmin, updateUser);
router.get('/admin/users/:userId', authenticateToken, requireAdmin, getUserById);
router.put('/admin/users/:userId/role', authenticateToken, requireAdmin, updateUserRole);
router.put('/admin/users/:userId/toggle-status', authenticateToken, requireAdmin, toggleUserStatus);
router.put('/admin/users/:userId/mark-ex', authenticateToken, requireAdmin, markUserAsEx);
router.delete('/admin/users/:userId', authenticateToken, requireAdmin, deleteUser);

module.exports = router;