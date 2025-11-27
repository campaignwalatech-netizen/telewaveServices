const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload.middleware');
const {
    register,
    verifyRegistrationOTP, // NEW
    login,
    verifyLoginOTP, // NEW
    adminLogin,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    getAllUsers,
    getUserById,
    updateUserRole,
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
    sendOTP, // Legacy function
    // New enhanced methods
    getAllUsersWithStats,
    getUserStats,
    exportUsers,
    updateUser
} = require('./user.controller');

const {
    authenticateToken,
    requireAdmin,
    requireVerified
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
 *   - name: KYC
 *     description: KYC management endpoints
 */

// ==================== AUTHENTICATION ROUTES ====================

/**
 * 
 * @swagger
 * /api/users:
 *   get:
 *     summary: API Health Check
 *    tags: [Authentication]
 *    responses:
 *     200:
 *      description: API is healthy
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *       properties:
 *        success:
 *        type: boolean
 *       example: true
 *       message:
 *       type: string
 *      example: "API is healthy"
 *     timestamp:
 *    type: string
 *   example: "2024-06-01T12:00:00.000Z"
 *   uptime:
 *  type: number
 *  example: 12345.67
 * version:
 * type: string
 * example: "1.0.0"
 */
router.get('/', getAllUsers);

 /* 
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
 *     responses:
 *       200:
 *         description: OTP sent to email for verification
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
 *                   example: "OTP sent to your email. Please verify to complete registration."
 *                 requireOTP:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     otpSent:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - Invalid input
 *       409:
 *         description: User already exists
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
 *                 description: Email address used for registration
 *                 example: "john@example.com"
 *               otp:
 *                 type: string
 *                 description: OTP received via email
 *                 example: "1234"
 *     responses:
 *       201:
 *         description: Registration completed successfully
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
 *                   example: "Registration successful! Welcome to our platform."
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT access token
 *       400:
 *         description: Bad request - Invalid or expired OTP
 */
router.post('/verify-registration', verifyRegistrationOTP); // NEW

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
 *                   example: "OTP sent to your email. Please verify to complete login."
 *                 requireOTP:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     role:
 *                       type: string
 *                       example: "user"
 *                     otpSent:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized - Invalid credentials
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
 *                 description: Email address used for login
 *                 example: "john@example.com"
 *               otp:
 *                 type: string
 *                 description: OTP received via email
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT access token
 *       400:
 *         description: Bad request - Invalid or expired OTP
 */
router.post('/verify-login', verifyLoginOTP); // NEW

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
 *       401:
 *         description: Unauthorized - Invalid credentials or not admin
 */
router.post('/admin-login', adminLogin);

/**
 * @swagger
 * /api/users/verify-otp:
 *   post:
 *     summary: Verify OTP and complete login - Legacy endpoint
 *     tags: [Authentication]
 *     deprecated: true
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
 *                 description: Email address used for login
 *                 example: "john@example.com"
 *               otp:
 *                 type: string
 *                 description: OTP received via email
 *                 example: "1006"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request - Invalid or expired OTP
 */
router.post('/verify-otp', verifyLoginOTP); // Map to new function

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Request password reset OTP via email
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
 *       404:
 *         description: User not found
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
 *                 description: Registered email address
 *                 example: "john@example.com"
 *               otp:
 *                 type: string
 *                 description: OTP received via email
 *                 example: "1006"
 *               newPassword:
 *                 type: string
 *                 description: New password (minimum 6 characters)
 *                 example: "newpassword123"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm new password
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request - Invalid OTP or passwords don't match
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user - clear active session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
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
 *                   example: "Profile retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
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
 *                 description: User's full name
 *                 example: "John Smith"
 *               phoneNumber:
 *                 type: string
 *                 description: 10-digit phone number
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request - Invalid phone number format
 *       409:
 *         description: Phone number already registered
 */
router.put('/profile', authenticateToken, updateProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
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
 *                 description: Current password
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 description: New password (minimum 6 characters)
 *                 example: "newpassword123"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm new password
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Bad request - Invalid current password or passwords don't match
 */
router.put('/change-password', authenticateToken, changePassword);

// Email OTP routes for profile updates
router.post('/send-email-otp', authenticateToken, sendEmailOTP);
router.post('/verify-email-otp', authenticateToken, verifyEmailOTP);

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
 *     summary: Update KYC details - Personal Documents Bank
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: ['Male', 'Female', 'Other']
 *               address1:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
 *               country:
 *                 type: string
 *               panNumber:
 *                 type: string
 *               aadhaarNumber:
 *                 type: string
 *               panImage:
 *                 type: string
 *               aadhaarImage:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountHolderName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *               branchAddress:
 *                 type: string
 *               upiId:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC details updated successfully
 */
router.put('/kyc', authenticateToken, updateKYCDetails);

// ==================== ADMIN ROUTES ====================

/**
 * @swagger
 * /api/users/admin/users:
 *   get:
 *     summary: Get all users - Admin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filter by user role
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email, name, or phone number
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Forbidden - Admin access required
 */
// router.get('/admin/users', authenticateToken, requireAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/admin/users/{userId}:
 *   get:
 *     summary: Get user by ID - Admin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/admin/users/:userId', authenticateToken, requireAdmin, getUserById);

/**
 * @swagger
 * /api/users/admin/users/{userId}/role:
 *   put:
 *     summary: Update user role - Admin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *                 enum: [user, admin]
 *                 description: New role for the user
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Bad request - Invalid role
 */
router.put('/admin/users/:userId/role', authenticateToken, requireAdmin, updateUserRole);

/**
 * @swagger
 * /api/users/admin/users/{userId}/toggle-status:
 *   put:
 *     summary: Toggle user active status - Admin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User status updated successfully
 */
router.put('/admin/users/:userId/toggle-status', authenticateToken, requireAdmin, toggleUserStatus);

/**
 * @swagger
 * /api/users/admin/users/{userId}/mark-ex:
 *   put:
 *     summary: Mark user as Ex - Admin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User marked as Ex successfully
 */
router.put('/admin/users/:userId/mark-ex', authenticateToken, requireAdmin, markUserAsEx);

/**
 * @swagger
 * /api/users/admin/users/{userId}:
 *   delete:
 *     summary: Delete user - Admin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/admin/users/:userId', authenticateToken, requireAdmin, deleteUser);

/**
 * @swagger
 * /api/users/admin/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics - Admin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get('/admin/dashboard-stats', authenticateToken, requireAdmin, getDashboardStats);

/**
 * @swagger
 * /api/users/admin/bulk-upload:
 *   post:
 *     summary: Bulk upload users from Excel/CSV file - Admin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel or CSV file with users data
 *     responses:
 *       201:
 *         description: Bulk upload completed successfully
 *       400:
 *         description: Invalid file format or validation error
 */
router.post('/admin/bulk-upload', authenticateToken, requireAdmin, upload.single('file'), bulkUploadUsers);

// ==================== ADMIN KYC ROUTES ====================

/**
 * @swagger
 * /api/users/admin/kyc/pending:
 *   get:
 *     summary: Get all pending KYC requests - Admin only
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: kycDetails.kycSubmittedAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Pending KYC requests retrieved successfully
 */
router.get('/admin/kyc/pending', authenticateToken, requireAdmin, getPendingKYCRequests);

/**
 * @swagger
 * /api/users/admin/kyc/{userId}:
 *   get:
 *     summary: Get user's KYC details by user ID - Admin only
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
 *     summary: Approve user's KYC - Admin only
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
 *     summary: Reject user's KYC - Admin only
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
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: KYC rejected successfully
 */
router.put('/admin/kyc/:userId/reject', authenticateToken, requireAdmin, rejectKYC);

// ==================== LEGACY ROUTES (for backward compatibility) ====================

/**
 * @swagger
 * /api/users/send-otp:
 *   post:
 *     summary: Send OTP to phone number - Legacy endpoint
 *     tags: [Authentication]
 *     deprecated: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: 10-digit phone number
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/send-otp', sendOTP);

// User management
router.get('/admin/users', authenticateToken, requireAdmin, getAllUsers);
router.get('/admin/users-with-stats', authenticateToken, requireAdmin, getAllUsersWithStats); // NEW
router.get('/admin/export-users', authenticateToken, requireAdmin, exportUsers); // NEW
router.get('/admin/users/:userId/stats', authenticateToken, requireAdmin, getUserStats); // NEW
router.put('/admin/users/:userId', authenticateToken, requireAdmin, updateUser); // NEW
router.get('/admin/users/:userId', authenticateToken, requireAdmin, getUserById);
router.put('/admin/users/:userId/role', authenticateToken, requireAdmin, updateUserRole);
router.put('/admin/users/:userId/toggle-status', authenticateToken, requireAdmin, toggleUserStatus);
router.put('/admin/users/:userId/mark-ex', authenticateToken, requireAdmin, markUserAsEx);
router.delete('/admin/users/:userId', authenticateToken, requireAdmin, deleteUser);


module.exports = router;