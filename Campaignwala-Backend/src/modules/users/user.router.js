const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload.middleware');
const {
    // Authentication
    register,
    verifyRegistrationOTP,
    login,
    verifyLoginOTP,
    adminLogin,
    tlLogin,
    logout,
    forgotPassword,
    resetPassword,
    
    // Profile Management
    getProfile,
    updateProfile,
    changePassword,
    
    // Attendance
    markAttendance,
    getTodayAttendance,
    getAttendanceHistory,
    getAttendanceReport,
    getTeamAttendance,
    
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
    
    // Wallet
    getWalletBalance,
    
    // Dashboard Stats
    getDashboardStats,
    
    // Query Management
    riseQuery,
    
    // Bulk Operations
    bulkUploadUsers,
    
    // Legacy functions
    sendOTP,
    getAllUsersWithStats,
    getUserStats,
    exportUsers,
    updateUser
} = require('./user.controller');

const {
    protect,
    authorize,
    authenticateToken,
    requireAdmin,
    requireTL,
    requireAdminOrTL,
    requireVerified,
    canMarkAttendance,
    optionalAuth
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
 *   - name: Attendance
 *     description: User attendance management endpoints
 *   - name: Admin
 *     description: Admin-only endpoints for user management
 *   - name: TL
 *     description: Team Leader endpoints
 *   - name: KYC
 *     description: KYC management endpoints
 *   - name: Leads
 *     description: Lead management endpoints
 *   - name: Wallet
 *     description: Wallet management endpoints
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

/**
 * @swagger
 * /api/users/verify-registration:
 *   post:
 *     summary: Verify registration OTP - Step 2 Complete registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: "john@example.com"
 *               otp:
 *                 type: string
 *                 description: OTP received via email
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Registration completed successfully
 */
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

/**
 * @swagger
 * /api/users/verify-login:
 *   post:
 *     summary: Verify login OTP - Step 2 Complete login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: "john@example.com"
 *               otp:
 *                 type: string
 *                 description: OTP received via email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login completed successfully
 */
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
router.post('/tl-login', tlLogin);

/**
 * @swagger
 * /api/users/verify-otp:
 *   post:
 *     summary: Verify OTP (legacy endpoint, same as verify-login)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post('/verify-otp', verifyLoginOTP);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: Registered email address
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Password reset OTP sent to email
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Reset password with OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user (clear active session)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authenticateToken, logout);

// ==================== USER PROFILE ROUTES ====================

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', authenticateToken, updateProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change password
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.put('/change-password', authenticateToken, changePassword);

// ==================== ATTENDANCE ROUTES ====================

/**
 * @swagger
 * /api/users/mark-attendance:
 *   post:
 *     summary: Mark attendance (for regular users only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [present, absent, late]
 *                 default: "present"
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 */
router.post('/mark-attendance', authenticateToken, authorize('user'), canMarkAttendance, markAttendance);

/**
 * @swagger
 * /api/users/today-attendance:
 *   get:
 *     summary: Get today's attendance status
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's attendance retrieved successfully
 */
router.get('/today-attendance', authenticateToken, authorize('user'), getTodayAttendance);

/**
 * @swagger
 * /api/users/attendance-history:
 *   get:
 *     summary: Get attendance history
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: Attendance history retrieved successfully
 */
router.get('/attendance-history', authenticateToken, authorize('user'), getAttendanceHistory);

// ==================== EMAIL OTP ROUTES ====================

/**
 * @swagger
 * /api/users/send-email-otp:
 *   post:
 *     summary: Send OTP to email for verification
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               purpose:
 *                 type: string
 *                 description: Purpose of OTP (verification, update, etc.)
 *     responses:
 *       200:
 *         description: OTP sent to email successfully
 */
router.post('/send-email-otp', authenticateToken, sendEmailOTP);

/**
 * @swagger
 * /api/users/verify-email-otp:
 *   post:
 *     summary: Verify email OTP
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 description: OTP received via email
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post('/verify-email-otp', authenticateToken, verifyEmailOTP);

// ==================== USER LEAD MANAGEMENT ROUTES ====================

/**
 * @swagger
 * /api/users/my-leads/today:
 *   get:
 *     summary: Get today's assigned leads
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's leads retrieved successfully
 */
router.get('/my-leads/today', authenticateToken, authorize('user'), getUserTodaysLeads);

/**
 * @swagger
 * /api/users/my-leads/{leadId}/start:
 *   post:
 *     summary: Start working on a lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead started successfully
 */
router.post('/my-leads/:leadId/start', authenticateToken, authorize('user'), startLead);

/**
 * @swagger
 * /api/users/my-leads/{leadId}/complete:
 *   post:
 *     summary: Complete a lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 description: Completion remarks
 *     responses:
 *       200:
 *         description: Lead completed successfully
 */
router.post('/my-leads/:leadId/complete', authenticateToken, authorize('user'), completeLead);

// ==================== WALLET ROUTES ====================

/**
 * @swagger
 * /api/users/wallet:
 *   get:
 *     summary: Get wallet balance and details
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet details retrieved successfully
 */
router.get('/wallet', authenticateToken, getWalletBalance);

// ==================== KYC ROUTES ====================

/**
 * @swagger
 * /api/users/kyc:
 *   get:
 *     summary: Get user's KYC details
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC details retrieved successfully
 */
router.get('/kyc', authenticateToken, getKYCDetails);

/**
 * @swagger
 * /api/users/kyc:
 *   put:
 *     summary: Update KYC details
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personalDetails:
 *                 type: object
 *               kycDocuments:
 *                 type: object
 *               bankDetails:
 *                 type: object
 *     responses:
 *       200:
 *         description: KYC details updated successfully
 */
router.put('/kyc', authenticateToken, updateKYCDetails);

/**
 * @swagger
 * /api/users/kyc/submit:
 *   post:
 *     summary: Submit KYC for approval
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: KYC submitted for approval
 */
router.post('/kyc/submit', authenticateToken, submitKYC);

/**
 * @swagger
 * /api/users/kyc/request-approval:
 *   post:
 *     summary: Manually request KYC approval
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC approval requested successfully
 */
router.post('/kyc/request-approval', authenticateToken, requestKYCApproval);

// ==================== QUERY ROUTES ====================

/**
 * @swagger
 * /api/users/queries:
 *   post:
 *     summary: Submit a query
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               category:
 *                 type: string
 *                 default: "General"
 *               priority:
 *                 type: string
 *                 default: "Medium"
 *     responses:
 *       200:
 *         description: Query submitted successfully
 */
router.post('/queries', authenticateToken, riseQuery);

// ==================== ADMIN USER MANAGEMENT ROUTES ====================

/**
 * @swagger
 * /api/users/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/admin/users', authenticateToken, requireAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/admin/users/status/{status}:
 *   get:
 *     summary: Get users by status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [active, inactive, hold, blocked, pending, ex]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Users retrieved by status
 */
router.get('/admin/users/status/:status', authenticateToken, requireAdmin, getUsersByStatus);

/**
 * @swagger
 * /api/users/admin/users/{userId}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 */
router.get('/admin/users/:userId', authenticateToken, requireAdmin, getUserById);

/**
 * @swagger
 * /api/users/admin/users/{userId}/approve:
 *   post:
 *     summary: Approve user registration (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User approved successfully
 */
router.post('/admin/users/:userId/approve', authenticateToken, requireAdmin, approveUserRegistration);

/**
 * @swagger
 * /api/users/admin/users/{userId}/hold:
 *   post:
 *     summary: Mark user as Hold (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *               holdUntil:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: User marked as Hold
 */
router.post('/admin/users/:userId/hold', authenticateToken, requireAdmin, markUserHold);

/**
 * @swagger
 * /api/users/admin/users/{userId}/active:
 *   post:
 *     summary: Mark user as Active from Hold (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User marked as Active
 */
router.post('/admin/users/:userId/active', authenticateToken, requireAdmin, markUserActive);

/**
 * @swagger
 * /api/users/admin/users/{userId}/block:
 *   post:
 *     summary: Block user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User blocked successfully
 */
router.post('/admin/users/:userId/block', authenticateToken, requireAdmin, blockUser);

/**
 * @swagger
 * /api/users/admin/users/{userId}/change-role:
 *   post:
 *     summary: Change user role between user and TL (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newRole
 *             properties:
 *               newRole:
 *                 type: string
 *                 enum: [user, TL]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User role changed successfully
 */
router.post('/admin/users/:userId/change-role', authenticateToken, requireAdmin, changeUserRole);

/**
 * @swagger
 * /api/users/admin/users/{userId}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, TL]
 *     responses:
 *       200:
 *         description: User role updated successfully
 */
router.put('/admin/users/:userId/role', authenticateToken, requireAdmin, updateUserRole);

/**
 * @swagger
 * /api/users/admin/users/{userId}/tl-permissions:
 *   put:
 *     summary: Update TL permissions (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: object
 *     responses:
 *       200:
 *         description: TL permissions updated successfully
 */
router.put('/admin/users/:userId/tl-permissions', authenticateToken, requireAdmin, updateTLPermissions);

/**
 * @swagger
 * /api/users/admin/users/{userId}/toggle-status:
 *   put:
 *     summary: Toggle user active status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User status toggled successfully
 */
router.put('/admin/users/:userId/toggle-status', authenticateToken, requireAdmin, toggleUserStatus);

/**
 * @swagger
 * /api/users/admin/users/{userId}/mark-ex:
 *   put:
 *     summary: Mark user as Ex (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User marked as Ex successfully
 */
router.put('/admin/users/:userId/mark-ex', authenticateToken, requireAdmin, markUserAsEx);

/**
 * @swagger
 * /api/users/admin/users/{userId}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/admin/users/:userId', authenticateToken, requireAdmin, deleteUser);

/**
 * @swagger
 * /api/users/admin/dashboard-stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get('/admin/dashboard-stats', authenticateToken, requireAdmin, getDashboardStats);

// ==================== ADMIN LEAD DISTRIBUTION ROUTES ====================

/**
 * @swagger
 * /api/users/admin/leads/distribute:
 *   post:
 *     summary: Distribute leads to users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - distributionType
 *               - leadIds
 *             properties:
 *               distributionType:
 *                 type: string
 *                 enum: [all_users, active_users, present_users, without_leads, specific_user, team_leader]
 *               leadIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               tlId:
 *                 type: string
 *               dailyQuota:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Leads distributed successfully
 */
router.post('/admin/leads/distribute', authenticateToken, requireAdmin, distributeLeads);

/**
 * @swagger
 * /api/users/admin/users/{userId}/withdraw-leads:
 *   post:
 *     summary: Withdraw leads from user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leadIds
 *             properties:
 *               leadIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Leads withdrawn successfully
 */
router.post('/admin/users/:userId/withdraw-leads', authenticateToken, requireAdmin, withdrawLeads);

// ==================== ADMIN ATTENDANCE ROUTES ====================

/**
 * @swagger
 * /api/users/admin/attendance/report:
 *   get:
 *     summary: Get attendance report (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance report retrieved successfully
 */
router.get('/admin/attendance/report', authenticateToken, requireAdmin, getAttendanceReport);

// ==================== ADMIN KYC ROUTES ====================

/**
 * @swagger
 * /api/users/admin/kyc/pending:
 *   get:
 *     summary: Get all pending KYC requests (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pending KYC requests retrieved successfully
 */
router.get('/admin/kyc/pending', authenticateToken, requireAdmin, getPendingKYCRequests);

/**
 * @swagger
 * /api/users/admin/kyc/{userId}:
 *   get:
 *     summary: Get KYC details by user ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KYC details retrieved successfully
 */
router.get('/admin/kyc/:userId', authenticateToken, requireAdmin, getKYCDetailsByUserId);

/**
 * @swagger
 * /api/users/admin/kyc/{userId}/approve:
 *   put:
 *     summary: Approve KYC (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC approved successfully
 */
router.put('/admin/kyc/:userId/approve', authenticateToken, requireAdmin, approveKYC);

/**
 * @swagger
 * /api/users/admin/kyc/{userId}/reject:
 *   put:
 *     summary: Reject KYC (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC rejected successfully
 */
router.put('/admin/kyc/:userId/reject', authenticateToken, requireAdmin, rejectKYC);

// ==================== TL MANAGEMENT ROUTES ====================

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

// ==================== TL LEAD DISTRIBUTION ROUTES ====================

/**
 * @swagger
 * /api/users/tl/leads/distribute:
 *   post:
 *     summary: Distribute leads to team members (TL only)
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
 *               - leadIds
 *             properties:
 *               leadIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               memberId:
 *                 type: string
 *               dailyQuota:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Leads distributed to team successfully
 */
router.post('/tl/leads/distribute', authenticateToken, requireTL, distributeLeadsToTeam);

/**
 * @swagger
 * /api/users/tl/users/{userId}/withdraw-leads:
 *   post:
 *     summary: Withdraw leads from team member (TL only)
 *     tags: [TL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leadIds
 *             properties:
 *               leadIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Leads withdrawn successfully
 */
router.post('/tl/users/:userId/withdraw-leads', authenticateToken, requireTL, withdrawLeads);

// ==================== TL ATTENDANCE ROUTES ====================

/**
 * @swagger
 * /api/users/tl/team-attendance:
 *   get:
 *     summary: Get team attendance (TL only)
 *     tags: [TL]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team attendance retrieved successfully
 */
router.get('/tl/team-attendance', authenticateToken, requireTL, getTeamAttendance);

// ==================== BULK OPERATIONS ====================

/**
 * @swagger
 * /api/users/admin/bulk-upload:
 *   post:
 *     summary: Bulk upload users from Excel/CSV file (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Users bulk uploaded successfully
 */
router.post('/admin/bulk-upload', authenticateToken, requireAdmin, upload.single('file'), bulkUploadUsers);

// ==================== LEGACY & EXTRA ROUTES ====================

/**
 * @swagger
 * /api/users/send-otp:
 *   post:
 *     summary: Send OTP (Legacy endpoint - deprecated)
 *     tags: [Authentication]
 *     deprecated: true
 *     responses:
 *       410:
 *         description: This endpoint is deprecated
 */
router.post('/send-otp', sendOTP);

/**
 * @swagger
 * /api/users/admin/users-with-stats:
 *   get:
 *     summary: Get all users with detailed statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "createdAt"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *     responses:
 *       200:
 *         description: Users with statistics retrieved successfully
 */
router.get('/admin/users-with-stats', authenticateToken, requireAdmin, getAllUsersWithStats);

/**
 * @swagger
 * /api/users/admin/export-users:
 *   get:
 *     summary: Export users to Excel/JSON (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [excel, json]
 *           default: "excel"
 *     responses:
 *       200:
 *         description: Users exported successfully
 */
router.get('/admin/export-users', authenticateToken, requireAdmin, exportUsers);

/**
 * @swagger
 * /api/users/admin/users/{userId}/stats:
 *   get:
 *     summary: Get detailed statistics for a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 */
router.get('/admin/users/:userId/stats', authenticateToken, requireAdmin, getUserStats);

/**
 * @swagger
 * /api/users/admin/users/{userId}:
 *   put:
 *     summary: Update user details (Admin only - comprehensive update)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/admin/users/:userId', authenticateToken, requireAdmin, updateUser);

module.exports = router;