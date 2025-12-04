const Lead = require('./leads.model');
const Offer = require('../offers/offers.model');
const User = require('../users/user.model');
const Wallet = require('../wallet/wallet.model');
const { parseExcelFile, deleteFile, validateRequiredFields } = require('../../utils/excelParser');
const ExcelJS = require('exceljs');

// ==================== ORIGINAL FUNCTIONS (Maintenance) ====================

// Get all leads with filters
const getAllLeads = async (req, res) => {
  try {
    const { 
      status, 
      search, 
      hrUserId,
      page = 1, 
      limit = 100,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }

    if (hrUserId) {
      filter.hrUserId = hrUserId;
    }

    if (search) {
      filter.$or = [
        { leadId: { $regex: search, $options: 'i' } },
        { offerName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { hrName: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerContact: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    // Get leads with pagination
    const leads = await Lead.find(filter)
      .populate('offerId', 'name category commission1 image')
      .populate('hrUserId', 'name email phone')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Leads retrieved successfully',
      data: {
        leads,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error.message
    });
  }
};

// Get lead by ID
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('offerId')
      .populate('hrUserId', 'name email phone');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead retrieved successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lead',
      error: error.message
    });
  }
};

// Create new lead (from shared link)
const createLead = async (req, res) => {
  try {
    const {
      offerId,
      hrUserId,
      customerName,
      customerContact
    } = req.body;

    // Validate required fields
    if (!offerId || !hrUserId || !customerName || !customerContact) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: offerId, hrUserId, customerName, customerContact'
      });
    }

    // Get offer details
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Get HR user details automatically
    const hrUser = await User.findById(hrUserId);
    if (!hrUser) {
      return res.status(404).json({
        success: false,
        message: 'HR User not found'
      });
    }

    console.log('🔍 HR User Details:', {
      id: hrUser._id,
      name: hrUser.name,
      phone: hrUser.phoneNumber,
      email: hrUser.email
    });

    // Create new lead with auto-fetched HR details
    const newLead = new Lead({
      offerId: offer._id,
      offerName: offer.name,
      category: offer.category,
      hrUserId: hrUser._id,
      hrName: hrUser.name || 'User',
      hrContact: hrUser.phoneNumber || hrUser.phone || 'N/A',
      customerName,
      customerContact,
      offer: offer.commission1 || '',
      commission1: offer.commission1 || 0,
      commission2: offer.commission2 || 0,
      status: 'pending'
    });

    await newLead.save();

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: newLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating lead',
      error: error.message
    });
  }
};

// Update lead status
const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, rejectionReason } = req.body;

    const validStatuses = ['pending', 'approved', 'completed', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, completed, rejected'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (remarks) updateData.remarks = remarks;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;

    const lead = await Lead.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating lead',
      error: error.message
    });
  }
};

// Delete lead
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lead',
      error: error.message
    });
  }
};

// Get lead statistics
const getLeadStats = async (req, res) => {
  try {
    const { hrUserId } = req.query;
    const filter = hrUserId ? { hrUserId } : {};

    const stats = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Lead.countDocuments(filter);

    const formattedStats = {
      total,
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      message: 'Lead statistics retrieved successfully',
      data: formattedStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lead statistics',
      error: error.message
    });
  }
};

// Get analytics data (date-wise, category-wise, user-wise)
const getLeadAnalytics = async (req, res) => {
  try {
    console.log('📊 [ANALYTICS] Request received');
    console.log('📊 [ANALYTICS] Query params:', req.query);
    
    const { 
      startDate, 
      endDate, 
      category, 
      hrUserId 
    } = req.query;

    // First, check total leads in database
    const totalInDb = await Lead.countDocuments({});
    console.log('📊 [ANALYTICS] Total leads in database:', totalInDb);

    // Check leads created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Lead.countDocuments({ createdAt: { $gte: today } });
    console.log('📊 [ANALYTICS] Leads created today:', todayCount);

    // Get sample lead to check date format
    const sampleLead = await Lead.findOne().sort({ createdAt: -1 });
    console.log('📊 [ANALYTICS] Sample lead (latest):', {
      id: sampleLead?._id,
      createdAt: sampleLead?.createdAt,
      category: sampleLead?.category,
      status: sampleLead?.status
    });

    // Build filter - BY DEFAULT fetch all data if no date provided
    const filter = {};
    
    // Only apply date filter if BOTH dates are provided
    if (startDate && endDate) {
      filter.createdAt = {};
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Set time to beginning and end of day
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      filter.createdAt.$gte = start;
      filter.createdAt.$lte = end;
      
      console.log('📊 [ANALYTICS] Date filter applied:', {
        startDate: start,
        endDate: end,
        startISO: start.toISOString(),
        endISO: end.toISOString()
      });
    } else {
      console.log('📊 [ANALYTICS] No date filter - fetching ALL leads');
    }
    
    if (category && category !== 'All Categories') {
      filter.category = category;
      console.log('📊 [ANALYTICS] Category filter applied:', category);
    }
    
    if (hrUserId && hrUserId !== 'All Users') {
      filter.hrUserId = hrUserId;
      console.log('📊 [ANALYTICS] User filter applied:', hrUserId);
    }

    console.log('📊 [ANALYTICS] Final filter:', JSON.stringify(filter, null, 2));

    // Get date-wise count
    console.log('📊 [ANALYTICS] Fetching date-wise data...');
    const dateWiseData = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ]);
    console.log('📊 [ANALYTICS] Date-wise data count:', dateWiseData.length);

    // Get category distribution (by offer category)
    console.log('📊 [ANALYTICS] Fetching category distribution...');
    const categoryDistribution = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: 1
        }
      }
    ]);
    console.log('📊 [ANALYTICS] Category distribution count:', categoryDistribution.length);

    // Get pending by category
    console.log('📊 [ANALYTICS] Fetching pending by category...');
    const pendingByCategory = await Lead.aggregate([
      { $match: { ...filter, status: 'pending' } },
      {
        $group: {
          _id: '$category',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: 1
        }
      }
    ]);
    console.log('📊 [ANALYTICS] Pending by category count:', pendingByCategory.length);

    // Get approved by category
    console.log('📊 [ANALYTICS] Fetching approved by category...');
    const approvedByCategory = await Lead.aggregate([
      { $match: { ...filter, status: 'approved' } },
      {
        $group: {
          _id: '$category',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: 1
        }
      }
    ]);
    console.log('📊 [ANALYTICS] Approved by category count:', approvedByCategory.length);

    // Get user-wise stats
    console.log('📊 [ANALYTICS] Fetching user-wise stats...');
    const userStats = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            userId: '$hrUserId',
            userName: '$hrName'
          },
          totalCount: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          userId: '$_id.userId',
          userName: '$_id.userName',
          totalCount: 1,
          pending: 1,
          approved: 1,
          completed: 1,
          rejected: 1
        }
      }
    ]);
    console.log('📊 [ANALYTICS] User stats count:', userStats.length);

    // Get overall metrics
    console.log('📊 [ANALYTICS] Fetching overall metrics...');
    const totalLeads = await Lead.countDocuments(filter);
    const pendingLeads = await Lead.countDocuments({ ...filter, status: 'pending' });
    const approvedLeads = await Lead.countDocuments({ ...filter, status: 'approved' });
    const completedLeads = await Lead.countDocuments({ ...filter, status: 'completed' });
    const rejectedLeads = await Lead.countDocuments({ ...filter, status: 'rejected' });

    console.log('📊 [ANALYTICS] Metrics calculated:', {
      total: totalLeads,
      pending: pendingLeads,
      approved: approvedLeads,
      completed: completedLeads,
      rejected: rejectedLeads
    });

    // Calculate date-wise count - use totalLeads instead of recounting
    const dateWiseCount = totalLeads;

    const responseData = {
      success: true,
      message: 'Analytics data retrieved successfully',
      data: {
        metrics: {
          dateWiseCount,
          totalCount: totalLeads,
          pending: pendingLeads,
          approved: approvedLeads,
          completed: completedLeads,
          rejected: rejectedLeads
        },
        dateWiseData,
        categoryDistribution,
        pendingByCategory,
        approvedByCategory,
        userStats
      }
    };

    console.log('📊 [ANALYTICS] Sending response with metrics:', responseData.data.metrics);
    console.log('📊 [ANALYTICS] Response sent successfully ✅');

    res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ [ANALYTICS] Error fetching analytics:', error);
    console.error('❌ [ANALYTICS] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
};

// Get all users for dropdown
const getAllUsers = async (req, res) => {
  try {
    console.log('👥 [USERS] Fetching all users for dropdown...');
    const users = await User.find({ role: 'user' })
      .select('_id name phoneNumber email')
      .sort({ name: 1 });

    console.log('👥 [USERS] Found users count:', users.length);
    console.log('👥 [USERS] First user sample:', users[0]);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('❌ [USERS] Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Approve lead (change status to approved)
const approveLead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    let commissionToAdd = 0;
    let commissionMessage = '';
    let newStatus = lead.status;

    // Check current status and determine what commission to pay
    if (lead.status === 'pending' && !lead.commission1Paid) {
      // First approval - Pay Commission 1
      commissionToAdd = lead.commission1 || 0;
      lead.commission1Paid = true;
      
      // Check if Commission 2 exists
      if (lead.commission2 && lead.commission2 > 0) {
        // Has Commission 2, so move to "approved" status
        newStatus = 'approved';
        commissionMessage = `Commission 1 (₹${commissionToAdd}) credited. Approve again for Commission 2.`;
      } else {
        // No Commission 2, directly move to "completed"
        newStatus = 'completed';
        commissionMessage = `Commission 1 (₹${commissionToAdd}) credited. Lead completed.`;
      }
      
    } else if (lead.status === 'approved' && !lead.commission2Paid) {
      // Second approval - Pay Commission 2
      commissionToAdd = lead.commission2 || 0;
      lead.commission2Paid = true;
      newStatus = 'completed';
      commissionMessage = `Commission 2 (₹${commissionToAdd}) credited. Lead completed.`;
      
    } else {
      return res.status(400).json({
        success: false,
        message: 'Lead already fully approved or no commission pending'
      });
    }

    // Update lead status
    lead.status = newStatus;
    
    // Add commission to HR user's wallet
    if (commissionToAdd > 0) {
      let wallet = await Wallet.findOne({ userId: lead.hrUserId });
      
      // Create wallet if doesn't exist
      if (!wallet) {
        wallet = new Wallet({ userId: lead.hrUserId });
      }

      // Add commission as credit
      wallet.balance += commissionToAdd;
      wallet.totalEarned += commissionToAdd;
      wallet.transactions.push({
        type: 'credit',
        amount: commissionToAdd,
        description: `${lead.commission1Paid && !lead.commission2Paid ? 'Commission 1' : 'Commission 2'} from lead ${lead.leadId} - ${lead.offerName}`,
        leadId: lead._id
      });

      await wallet.save();

      console.log(`✅ Added ₹${commissionToAdd} to HR User ${lead.hrUserId} wallet`);
      console.log(`📊 New balance: ₹${wallet.balance}`);
    }

    // Save lead changes
    await lead.save();

    res.status(200).json({
      success: true,
      message: commissionMessage,
      data: {
        lead,
        commissionPaid: commissionToAdd,
        newStatus: newStatus,
        commission1Paid: lead.commission1Paid,
        commission2Paid: lead.commission2Paid
      }
    });
  } catch (error) {
    console.error('Error approving lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving lead',
      error: error.message
    });
  }
};

// Reject lead
const rejectLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      id,
      { 
        status: 'rejected',
        rejectionReason: rejectionReason || ''
      },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead rejected successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting lead',
      error: error.message
    });
  }
};

// Bulk upload leads from Excel/CSV file
const bulkUploadLeads = async (req, res) => {
  let filePath = null;
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an Excel or CSV file'
      });
    }

    filePath = req.file.path;
    console.log('📄 Processing leads file:', filePath);

    // Parse Excel/CSV file
    const data = parseExcelFile(filePath);

    if (!data || data.length === 0) {
      deleteFile(filePath);
      return res.status(400).json({
        success: false,
        message: 'File is empty or contains no valid data'
      });
    }

    console.log(`📊 Found ${data.length} leads in the file`);

    // Define required fields for leads
    const requiredFields = ['leadId', 'offerName', 'category', 'customerName', 'customerContact'];

    // Validate required fields
    const validation = validateRequiredFields(data, requiredFields);

    if (!validation.isValid) {
      deleteFile(filePath);
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Missing required fields',
        errors: {
          missingFields: validation.missingFields,
          invalidRows: validation.invalidRows.slice(0, 10)
        }
      });
    }

    // Transform and prepare leads data
    const leadsToCreate = data.map(row => ({
      leadId: row.leadId?.toString().trim(),
      offerName: row.offerName?.toString().trim(),
      category: row.category?.toString().trim(),
      customerName: row.customerName?.toString().trim(),
      customerContact: row.customerContact?.toString().trim(),
      customerEmail: row.customerEmail?.toString().trim() || '',
      hrName: row.hrName?.toString().trim() || '',
      hrContact: row.hrContact?.toString().trim() || '',
      status: row.status?.toString().toLowerCase() || 'pending',
      commission1: row.commission1 ? parseFloat(row.commission1) : 0,
      commission2: row.commission2 ? parseFloat(row.commission2) : 0,
      remarks: row.remarks?.toString().trim() || ''
    }));

    // Bulk insert with error handling
    const results = {
      success: [],
      failed: []
    };

    for (let i = 0; i < leadsToCreate.length; i++) {
      try {
        const lead = await Lead.create(leadsToCreate[i]);
        results.success.push({
          row: i + 2,
          leadId: lead.leadId,
          offerName: lead.offerName
        });
      } catch (error) {
        results.failed.push({
          row: i + 2,
          data: leadsToCreate[i],
          error: error.message
        });
      }
    }

    // Delete the uploaded file
    deleteFile(filePath);

    res.status(201).json({
      success: true,
      message: `Bulk upload completed: ${results.success.length} leads created, ${results.failed.length} failed`,
      data: {
        totalRows: data.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        successItems: results.success,
        failedItems: results.failed.slice(0, 20)
      }
    });

  } catch (error) {
    console.error('❌ Error in leads bulk upload:', error);
    
    if (filePath) {
      deleteFile(filePath);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process bulk upload',
      error: error.message
    });
  }
};

// ==================== ADMIN LEAD DISTRIBUTION METHODS ====================

// Get users for lead distribution (with filters)
const getUsersForDistribution = async (req, res) => {
  try {
    const { distributionType } = req.query;
    
    let users = [];
    let query = { role: 'user', status: 'active', isActive: true, isEx: false };

    switch(distributionType) {
      case 'all_active':
        // All active users
        users = await User.find(query)
          .select('_id name email phoneNumber statistics attendance.todayStatus')
          .sort({ name: 1 });
        break;

      case 'present_today':
        // Users present today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        query['attendance.todayStatus'] = 'present';
        query['attendance.todayMarkedAt'] = { $gte: today };
        
        users = await User.find(query)
          .select('_id name email phoneNumber statistics attendance.todayStatus attendance.todayMarkedAt')
          .sort({ name: 1 });
        break;

      case 'without_leads_today':
        // Users who haven't received leads today
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        
        query.$or = [
          { 'leadDistribution.lastLeadDistributionDate': { $lt: todayDate } },
          { 'leadDistribution.lastLeadDistributionDate': { $exists: false } }
        ];
        
        users = await User.find(query)
          .select('_id name email phoneNumber statistics leadDistribution.lastLeadDistributionDate')
          .sort({ name: 1 });
        break;

      default:
        // All users for dropdown
        users = await User.find({ role: 'user' })
          .select('_id name email phoneNumber')
          .sort({ name: 1 });
    }

    // Add lead distribution eligibility info
    const usersWithInfo = users.map(user => {
      const userObj = user.toObject();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const canReceiveLeads = 
        user.status === 'active' &&
        user.isActive === true &&
        user.isEx === false &&
        (user.role === 'user' ? 
          (user.attendance?.todayStatus === 'present' && 
           new Date(user.attendance?.todayMarkedAt || 0) >= today) : 
          true) &&
        (!user.leadDistribution?.lastLeadDistributionDate || 
         new Date(user.leadDistribution.lastLeadDistributionDate) < today);

      return {
        ...userObj,
        canReceiveLeads,
        lastLeadDistribution: user.leadDistribution?.lastLeadDistributionDate || null,
        todaysLeadCount: user.leadDistribution?.todaysLeadCount || 0,
        attendanceStatus: user.attendance?.todayStatus || 'absent'
      };
    });

    res.status(200).json({
      success: true,
      message: 'Users for distribution retrieved successfully',
      data: {
        users: usersWithInfo,
        totalCount: usersWithInfo.length,
        distributionType
      }
    });

  } catch (error) {
    console.error('Get users for distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users for distribution',
      error: error.message
    });
  }
};

// Get Team Leaders for distribution
const getTeamLeadersForDistribution = async (req, res) => {
  try {
    const teamLeaders = await User.find({ 
      role: 'TL', 
      status: 'active',
      isActive: true 
    })
    .select('_id name email phoneNumber tlDetails teamMembers')
    .populate('teamMembers', 'name email')
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: 'Team Leaders retrieved successfully',
      data: {
        teamLeaders,
        totalCount: teamLeaders.length
      }
    });

  } catch (error) {
    console.error('Get Team Leaders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Team Leaders',
      error: error.message
    });
  }
};

// Get leads available for distribution
const getLeadsForDistribution = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 50 } = req.query;

    // Find leads that are not assigned yet
    const query = {
      status: status,
      assignedTo: { $exists: false }
    };

    const leads = await Lead.find(query)
      .populate('offerId', 'name category image')
      .populate('hrUserId', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Lead.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Leads for distribution retrieved successfully',
      data: {
        leads,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get leads for distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leads for distribution',
      error: error.message
    });
  }
};

// ==================== USER LEAD METHODS ====================

// User: Get lead statistics
const getUserLeadStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's leads
    const todaysLeads = await Lead.countDocuments({
      assignedTo: userId,
      assignedAt: { $gte: today },
      isTodayLead: true
    });

    // Yesterday's pending leads
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdaysPending = await Lead.countDocuments({
      assignedTo: userId,
      assignedAt: { $gte: yesterday, $lt: today },
      status: { $in: ['assigned', 'in_progress'] },
      isYesterdayPending: true
    });

    // Completed leads
    const completedLeads = await Lead.countDocuments({
      assignedTo: userId,
      status: 'completed'
    });

    // In progress leads
    const inProgressLeads = await Lead.countDocuments({
      assignedTo: userId,
      status: 'in_progress'
    });

    // Total earnings from completed leads
    const earningsAggregation = await Lead.aggregate([
      {
        $match: {
          assignedTo: userId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: { $add: ['$commission1', '$commission2'] } }
        }
      }
    ]);

    const totalEarnings = earningsAggregation[0]?.totalEarnings || 0;

    // Get user's lead distribution info
    const user = await User.findById(userId).select('leadDistribution');

    res.status(200).json({
      success: true,
      message: 'User lead statistics retrieved successfully',
      data: {
        todaysLeads,
        yesterdaysPending,
        completedLeads,
        inProgressLeads,
        totalEarnings,
        leadDistribution: {
          todaysCount: user?.leadDistribution?.todaysLeadCount || 0,
          todaysCompleted: user?.leadDistribution?.todaysCompletedLeads || 0,
          todaysPending: user?.leadDistribution?.todaysPendingLeads || 0,
          dailyQuota: user?.leadDistribution?.dailyLeadQuota || 0
        }
      }
    });

  } catch (error) {
    console.error('Get user lead stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user lead statistics',
      error: error.message
    });
  }
};

// User: Get lead details
const getUserLeadDetails = async (req, res) => {
  try {
    const { leadId } = req.params;
    const userId = req.user._id;

    const lead = await Lead.findOne({
      _id: leadId,
      assignedTo: userId
    })
    .populate('offerId', 'name category description termsAndConditions image videoLink')
    .populate('hrUserId', 'name email phoneNumber');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or you are not assigned to this lead'
      });
    }

    // Format lead data for user
    const leadData = {
      leadId: lead.leadId,
      offerName: lead.offerName,
      category: lead.category,
      customerName: lead.customerName,
      customerContact: lead.customerContact,
      status: lead.status,
      assignedAt: lead.assignedAt,
      startedAt: lead.startedAt,
      completedAt: lead.completedAt,
      timeSpent: lead.timeSpent,
      remarks: lead.remarks,
      isTodayLead: lead.isTodayLead,
      isYesterdayPending: lead.isYesterdayPending,
      offerDetails: lead.offerId ? {
        name: lead.offerId.name,
        category: lead.offerId.category,
        description: lead.offerId.description,
        termsAndConditions: lead.offerId.termsAndConditions,
        image: lead.offerId.image,
        videoLink: lead.offerId.videoLink
      } : null,
      hrDetails: lead.hrUserId ? {
        name: lead.hrUserId.name,
        email: lead.hrUserId.email,
        phone: lead.hrUserId.phoneNumber
      } : null
    };

    res.status(200).json({
      success: true,
      message: 'Lead details retrieved successfully',
      data: leadData
    });

  } catch (error) {
    console.error('Get user lead details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lead details',
      error: error.message
    });
  }
};

// ==================== TL LEAD MANAGEMENT ====================

// TL: Get team leads
const getTeamLeads = async (req, res) => {
  try {
    const tlId = req.user._id;
    const { status, memberId, page = 1, limit = 20 } = req.query;

    const tl = await User.findById(tlId);
    if (!tl || tl.role !== 'TL') {
      return res.status(403).json({
        success: false,
        message: 'Only Team Leaders can access team leads'
      });
    }

    // Build query for team leads
    let query = { assignedTo: { $in: tl.teamMembers } };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (memberId) {
      // Check if member is in TL's team
      if (!tl.teamMembers.includes(memberId)) {
        return res.status(400).json({
          success: false,
          message: 'User is not in your team'
        });
      }
      query.assignedTo = memberId;
    }

    const leads = await Lead.find(query)
      .populate('offerId', 'name category image')
      .populate('assignedTo', 'name email phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ assignedAt: -1 });

    const total = await Lead.countDocuments(query);

    // Get team statistics
    const teamStats = await Lead.aggregate([
      { $match: { assignedTo: { $in: tl.teamMembers } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCommission: { $sum: { $add: ['$commission1', '$commission2'] } }
        }
      }
    ]);

    const stats = {
      total: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      totalCommission: 0
    };

    teamStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
      stats.totalCommission += stat.totalCommission || 0;
    });

    res.status(200).json({
      success: true,
      message: 'Team leads retrieved successfully',
      data: {
        leads,
        stats,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get team leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team leads',
      error: error.message
    });
  }
};

// ==================== ADMIN LEAD REPORTS ====================

// Get lead distribution report
const getLeadDistributionReport = async (req, res) => {
  try {
    const { startDate, endDate, distributionType } = req.query;

    const filter = {};
    
    if (startDate && endDate) {
      filter.assignedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (distributionType && distributionType !== 'all') {
      filter.distributionGroup = distributionType;
    }

    const report = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$assignedAt" } },
            distributionGroup: '$distributionGroup',
            assignedByName: '$assignedByName'
          },
          totalLeads: { $sum: 1 },
          uniqueUsers: { $addToSet: "$assignedTo" }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          distributionGroup: '$_id.distributionGroup',
          assignedBy: '$_id.assignedByName',
          totalLeads: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { date: -1 } }
    ]);

    // Summary statistics
    const summary = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$distributionGroup',
          totalLeads: { $sum: 1 },
          totalUsers: { $addToSet: "$assignedTo" }
        }
      },
      {
        $project: {
          _id: 0,
          distributionGroup: '$_id',
          totalLeads: 1,
          totalUsers: { $size: '$totalUsers' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Lead distribution report retrieved successfully',
      data: {
        report,
        summary,
        dateRange: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        }
      }
    });

  } catch (error) {
    console.error('Get lead distribution report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lead distribution report',
      error: error.message
    });
  }
};

// ==================== EXPORT ALL FUNCTIONS ====================

module.exports = {
  // ========== Original Functions ==========
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
  
  // ========== Admin Lead Distribution Functions ==========
  getUsersForDistribution,
  getTeamLeadersForDistribution,
  getLeadsForDistribution,
  getLeadDistributionReport,
  
  // ========== User Lead Functions ==========
  getUserLeadStats,
  getUserLeadDetails,
  
  // ========== TL Lead Functions ==========
  getTeamLeads
};