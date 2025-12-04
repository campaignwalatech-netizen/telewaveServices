const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload.middleware');
const {
  // Original functions
  getAllLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getLeadAnalytics,
  getAllUsers,
  approveLead,
  rejectLead,
  bulkUploadLeads,
  
  // New distribution functions
  getUsersForDistribution,
  getTeamLeadersForDistribution,
  getLeadsForDistribution,
  
  // User lead functions
  getUserLeadStats,
  getUserLeadDetails,
  
  // TL lead functions
  getTeamLeads,
  
  // Admin report functions
  getLeadDistributionReport
} = require('./leads.controller');

const {
  protect,
  authenticateToken,
  requireAdmin,
  requireTL,
  requireAdminOrTL,
  authorize
} = require('../../middleware/user.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Lead:
 *       type: object
 *       required:
 *         - offerId
 *         - hrUserId
 *         - hrName
 *         - hrContact
 *         - customerName
 *         - customerContact
 *       properties:
 *         _id:
 *           type: string
 *           description: Lead MongoDB ID
 *         leadId:
 *           type: string
 *           description: Auto-generated unique Lead ID
 *           example: LD-A3X8K9M2
 *           readOnly: true
 *         offerId:
 *           type: string
 *           description: Reference to Offer
 *         offerName:
 *           type: string
 *           description: Offer name
 *         category:
 *           type: string
 *           description: Offer category
 *         hrUserId:
 *           type: string
 *           description: HR User ID (who shared the link)
 *         hrName:
 *           type: string
 *           description: HR Name
 *         hrContact:
 *           type: string
 *           description: HR Contact Number
 *         customerName:
 *           type: string
 *           description: Customer Name (who filled the form)
 *         customerContact:
 *           type: string
 *           description: Customer Contact Number
 *         status:
 *           type: string
 *           enum: [pending, approved, completed, rejected, assigned, in_progress]
 *           default: pending
 *         assignedTo:
 *           type: string
 *           description: User ID to whom lead is assigned
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           description: When lead was assigned
 *         assignedBy:
 *           type: string
 *           description: Who assigned the lead
 *         assignedByName:
 *           type: string
 *           description: Name of person who assigned the lead
 *         distributionGroup:
 *           type: string
 *           description: Distribution group/category
 *         offer:
 *           type: string
 *           description: Commission/Offer amount
 *         commission1:
 *           type: number
 *           description: First commission amount
 *         commission2:
 *           type: number
 *           description: Second commission amount
 *         commission1Paid:
 *           type: boolean
 *           default: false
 *         commission2Paid:
 *           type: boolean
 *           default: false
 *         sharedLink:
 *           type: string
 *           description: Shared link URL
 *         remarks:
 *           type: string
 *           description: Additional remarks
 *         rejectionReason:
 *           type: string
 *           description: Reason for rejection
 *         isTodayLead:
 *           type: boolean
 *           description: If lead was assigned today
 *         isYesterdayPending:
 *           type: boolean
 *           description: If lead was pending from yesterday
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ==================== PUBLIC ROUTES ====================

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Create new lead (from shared link)
 *     tags: [Leads]
 *     description: Creates a new lead when a customer fills the form from a shared link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offerId
 *               - hrUserId
 *               - customerName
 *               - customerContact
 *             properties:
 *               offerId:
 *                 type: string
 *                 description: Offer ID
 *               hrUserId:
 *                 type: string
 *                 description: HR User ID (who shared the link)
 *               customerName:
 *                 type: string
 *                 description: Customer Full Name
 *               customerContact:
 *                 type: string
 *                 description: Customer Phone Number
 *     responses:
 *       201:
 *         description: Lead created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Lead'
 */
router.post('/', createLead);

// ==================== AUTHENTICATED ROUTES ====================

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Get all leads (with filters)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, approved, completed, rejected, assigned, in_progress]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in leadId, offerName, category, hrName, customerName, customerContact
 *       - in: query
 *         name: hrUserId
 *         schema:
 *           type: string
 *         description: Filter by HR User ID
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
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Leads retrieved successfully
 */
router.get('/', authenticateToken, getAllLeads);

/**
 * @swagger
 * /api/leads/stats:
 *   get:
 *     summary: Get lead statistics
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hrUserId
 *         schema:
 *           type: string
 *         description: Filter stats by HR User ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', authenticateToken, getLeadStats);

/**
 * @swagger
 * /api/leads/analytics:
 *   get:
 *     summary: Get lead analytics data
 *     tags: [Leads]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: hrUserId
 *         schema:
 *           type: string
 *         description: Filter by HR User ID
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 */
router.get('/analytics', authenticateToken, getLeadAnalytics);

/**
 * @swagger
 * /api/leads/users:
 *   get:
 *     summary: Get all users for dropdown
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/users', authenticateToken, getAllUsers);

/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     summary: Get lead by ID
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead retrieved successfully
 *       404:
 *         description: Lead not found
 */
router.get('/:id', authenticateToken, getLeadById);

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Update lead status
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, completed, rejected, assigned, in_progress]
 *               remarks:
 *                 type: string
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead updated successfully
 */
router.put('/:id', authenticateToken, updateLeadStatus);

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Delete lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead deleted successfully
 */
router.delete('/:id', authenticateToken, deleteLead);

/**
 * @swagger
 * /api/leads/{id}/approve:
 *   post:
 *     summary: Approve lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead approved successfully
 */
router.post('/:id/approve', authenticateToken, approveLead);

/**
 * @swagger
 * /api/leads/{id}/reject:
 *   post:
 *     summary: Reject lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead rejected successfully
 */
router.post('/:id/reject', authenticateToken, rejectLead);

/**
 * @swagger
 * /api/leads/bulk-upload:
 *   post:
 *     summary: Bulk upload leads from Excel/CSV file
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     description: Upload an Excel (.xlsx, .xls) or CSV file to create multiple leads at once. Maximum file size is 10MB.
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
 *                 description: Excel or CSV file with leads data. Required columns - leadId, offerName, category, customerName, customerContact. Optional columns - customerEmail, hrName, hrContact, status, commission1, commission2, remarks
 *     responses:
 *       201:
 *         description: Bulk upload completed successfully
 */
router.post('/bulk-upload', authenticateToken, upload.single('file'), bulkUploadLeads);

// ==================== USER LEAD ROUTES ====================

/**
 * @swagger
 * /api/leads/user/stats:
 *   get:
 *     summary: Get user's lead statistics
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User lead statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     todaysLeads:
 *                       type: number
 *                     yesterdaysPending:
 *                       type: number
 *                     completedLeads:
 *                       type: number
 *                     inProgressLeads:
 *                       type: number
 *                     totalEarnings:
 *                       type: number
 *                     leadDistribution:
 *                       type: object
 *                       properties:
 *                         todaysCount:
 *                           type: number
 *                         todaysCompleted:
 *                           type: number
 *                         todaysPending:
 *                           type: number
 *                         dailyQuota:
 *                           type: number
 */
router.get('/user/stats', authenticateToken, authorize('user'), getUserLeadStats);

/**
 * @swagger
 * /api/leads/user/{leadId}:
 *   get:
 *     summary: Get user's lead details
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
 *         description: Lead details retrieved successfully
 */
router.get('/user/:leadId', authenticateToken, authorize('user'), getUserLeadDetails);

// ==================== TL LEAD ROUTES ====================

/**
 * @swagger
 * /api/leads/tl/team:
 *   get:
 *     summary: Get team leads (TL only)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, assigned, in_progress, completed, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *         description: Filter by team member ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Team leads retrieved successfully
 */
router.get('/tl/team', authenticateToken, requireTL, getTeamLeads);

// ==================== ADMIN LEAD DISTRIBUTION ROUTES ====================

/**
 * @swagger
 * /api/leads/admin/distribution/users:
 *   get:
 *     summary: Get users for lead distribution (Admin only)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: distributionType
 *         schema:
 *           type: string
 *           enum: [all_active, present_today, without_leads_today]
 *           description: Type of users to get
 *     responses:
 *       200:
 *         description: Users for distribution retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
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
 *                           phoneNumber:
 *                             type: string
 *                           canReceiveLeads:
 *                             type: boolean
 *                           lastLeadDistribution:
 *                             type: string
 *                             format: date-time
 *                           todaysLeadCount:
 *                             type: number
 *                           attendanceStatus:
 *                             type: string
 */
router.get('/admin/distribution/users', authenticateToken, requireAdmin, getUsersForDistribution);

/**
 * @swagger
 * /api/leads/admin/distribution/tls:
 *   get:
 *     summary: Get Team Leaders for distribution (Admin only)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team Leaders retrieved successfully
 */
router.get('/admin/distribution/tls', authenticateToken, requireAdmin, getTeamLeadersForDistribution);

/**
 * @swagger
 * /api/leads/admin/distribution/available:
 *   get:
 *     summary: Get available leads for distribution (Admin only)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: pending
 *           enum: [pending, assigned, in_progress]
 *         description: Lead status to filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Available leads retrieved successfully
 */
router.get('/admin/distribution/available', authenticateToken, requireAdmin, getLeadsForDistribution);

/**
 * @swagger
 * /api/leads/admin/distribution/report:
 *   get:
 *     summary: Get lead distribution report (Admin only)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *       - in: query
 *         name: distributionType
 *         schema:
 *           type: string
 *         description: Filter by distribution type
 *     responses:
 *       200:
 *         description: Lead distribution report retrieved successfully
 */
router.get('/admin/distribution/report', authenticateToken, requireAdmin, getLeadDistributionReport);

module.exports = router;