const mongoose = require('mongoose');

// Function to generate unique Lead ID
function generateLeadId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let leadId = 'LD-';
  for (let i = 0; i < 8; i++) {
    leadId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return leadId;
}

const leadSchema = new mongoose.Schema({
  leadId: {
    type: String,
    unique: true,
    trim: true
  },
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true,
    index: true
  },
  offerName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  // Original HR Details (Person who shared the link)
  hrUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  hrName: {
    type: String,
    required: true,
    trim: true
  },
  hrContact: {
    type: String,
    required: true,
    trim: true
  },
  // Customer Details (Person who clicked the link and filled form)
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerContact: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  // Lead Status
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'rejected', 'withdrawn', 'closed'],
    default: 'pending',
    index: true
  },
  // Assignment tracking
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  assignedToName: {
    type: String,
    trim: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedByName: {
    type: String,
    trim: true
  },
  assignedAt: {
    type: Date
  },
  // Withdrawal tracking
  withdrawnBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  withdrawnByName: {
    type: String,
    trim: true
  },
  withdrawnAt: {
    type: Date
  },
  withdrawalReason: {
    type: String,
    trim: true
  },
  // Distribution type
  distributionType: {
    type: String,
    enum: ['admin', 'tl', 'system'],
    default: 'system'
  },
  distributionGroup: {
    type: String,
    enum: ['all_users', 'active_users', 'present_users', 'without_leads', 'specific_user', 'team_leader'],
    default: 'active_users'
  },
  // Commission/Offer amount
  offer: {
    type: String,
    default: '',
    trim: true
  },
  commission1: {
    type: Number,
    default: 0,
    min: 0
  },
  commission2: {
    type: Number,
    default: 0,
    min: 0
  },
  commission1Paid: {
    type: Boolean,
    default: false
  },
  commission2Paid: {
    type: Boolean,
    default: false
  },
  // Additional tracking
  sharedLink: {
    type: String,
    default: '',
    trim: true
  },
  remarks: {
    type: String,
    default: '',
    trim: true
  },
  rejectionReason: {
    type: String,
    default: '',
    trim: true
  },
  // User actions
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  },
  // Performance tracking
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  isTodayLead: {
    type: Boolean,
    default: true
  },
  isYesterdayPending: {
    type: Boolean,
    default: false
  },
  // Tracking fields
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== VIRTUAL FIELDS ====================

leadSchema.virtual('hrUser', {
  ref: 'User',
  localField: 'hrUserId',
  foreignField: '_id',
  justOne: true
});

leadSchema.virtual('assignedUser', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

leadSchema.virtual('offerDetails', {
  ref: 'Offer',
  localField: 'offerId',
  foreignField: '_id',
  justOne: true
});

leadSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt ? this.createdAt.toLocaleDateString('en-IN') : 'N/A';
});

leadSchema.virtual('formattedAssignedAt').get(function() {
  return this.assignedAt ? this.assignedAt.toLocaleDateString('en-IN') : 'N/A';
});

leadSchema.virtual('totalCommission').get(function() {
  return (this.commission1 || 0) + (this.commission2 || 0);
});

leadSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'warning',
    assigned: 'info',
    in_progress: 'primary',
    completed: 'success',
    rejected: 'error',
    withdrawn: 'secondary',
    closed: 'default'
  };
  return colors[this.status] || 'default';
});

leadSchema.virtual('isAssigned').get(function() {
  return this.status === 'assigned' || this.status === 'in_progress';
});

leadSchema.virtual('isActive').get(function() {
  return ['assigned', 'in_progress'].includes(this.status);
});

leadSchema.virtual('isCompleted').get(function() {
  return ['completed', 'closed'].includes(this.status);
});

// ==================== METHODS ====================

leadSchema.pre('save', async function(next) {
  if (!this.leadId) {
    let isUnique = false;
    while (!isUnique) {
      const newLeadId = generateLeadId();
      const existingLead = await mongoose.model('Lead').findOne({ leadId: newLeadId });
      if (!existingLead) {
        this.leadId = newLeadId;
        isUnique = true;
      }
    }
  }
  next();
});

// Method to assign lead to user/TL
leadSchema.methods.assign = function(assignedTo, assignedBy, assignedByName, distributionType = 'system', distributionGroup = 'active_users') {
  this.assignedTo = assignedTo;
  this.assignedBy = assignedBy;
  this.assignedByName = assignedByName;
  this.assignedAt = new Date();
  this.status = 'assigned';
  this.distributionType = distributionType;
  this.distributionGroup = distributionGroup;
};

// Method to start working on lead
leadSchema.methods.start = function() {
  this.status = 'in_progress';
  this.startedAt = new Date();
};

// Method to complete lead
leadSchema.methods.complete = function(remarks = '') {
  this.status = 'completed';
  this.completedAt = new Date();
  this.remarks = remarks;
  
  // Calculate time spent if started
  if (this.startedAt) {
    this.timeSpent = Math.round((new Date() - this.startedAt) / (1000 * 60)); // minutes
  }
};

// Method to reject lead
leadSchema.methods.reject = function(reason = '') {
  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
};

// Method to close lead (by admin/TL)
leadSchema.methods.close = function() {
  this.status = 'closed';
  this.closedAt = new Date();
};

// Method to withdraw lead
leadSchema.methods.withdraw = function(withdrawnBy, withdrawnByName, reason = '') {
  this.withdrawnBy = withdrawnBy;
  this.withdrawnByName = withdrawnByName;
  this.withdrawnAt = new Date();
  this.withdrawalReason = reason;
  this.status = 'withdrawn';
  this.assignedTo = null;
  this.assignedBy = null;
  this.assignedAt = null;
};

// Method to check if commission is paid
leadSchema.methods.isCommissionPaid = function() {
  return this.commission1Paid && this.commission2Paid;
};

// Method to mark as yesterday's pending
leadSchema.methods.markAsYesterdayPending = function() {
  this.isTodayLead = false;
  this.isYesterdayPending = true;
};

// ==================== STATICS ====================

// Static method to find leads by HR user
leadSchema.statics.findByHrUser = function(hrUserId, status = null) {
  const query = { hrUserId };
  if (status) query.status = status;
  return this.find(query).populate('offerDetails').populate('assignedUser', 'name phoneNumber');
};

// Static method to find leads assigned to user
leadSchema.statics.findByAssignedUser = function(userId, status = null) {
  const query = { assignedTo: userId };
  if (status) query.status = status;
  return this.find(query).populate('offerDetails').populate('hrUser', 'name phoneNumber');
};

// Static method to find today's leads for a user
leadSchema.statics.findTodaysLeads = function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.find({
    assignedTo: userId,
    assignedAt: { $gte: today },
    status: { $in: ['assigned', 'in_progress'] },
    isTodayLead: true
  }).populate('offerDetails');
};

// Static method to find yesterday's pending leads for a user
leadSchema.statics.findYesterdaysPending = function(userId) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.find({
    assignedTo: userId,
    assignedAt: { $gte: yesterday, $lt: today },
    status: { $in: ['assigned', 'in_progress'] },
    isYesterdayPending: true
  }).populate('offerDetails');
};

// Static method to find closed leads for a user
leadSchema.statics.findClosedLeads = function(userId) {
  return this.find({
    assignedTo: userId,
    status: { $in: ['completed', 'closed'] }
  }).populate('offerDetails').sort({ completedAt: -1 });
};

// Static method to find leads by status
leadSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('hrUser', 'name email phoneNumber')
    .populate('assignedUser', 'name email phoneNumber');
};

// Static method to get lead statistics
leadSchema.statics.getStats = async function(userId = null, isHr = false) {
  const matchStage = {};
  
  if (userId) {
    if (isHr) {
      matchStage.hrUserId = userId;
    } else {
      matchStage.assignedTo = userId;
    }
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCommission: { 
          $sum: { $add: ['$commission1', '$commission2'] } 
        }
      }
    }
  ]);

  const result = {
    total: 0,
    pending: 0,
    assigned: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0,
    withdrawn: 0,
    closed: 0,
    totalCommission: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
    result.totalCommission += stat.totalCommission || 0;
  });

  return result;
};

// Static method to get distribution statistics
leadSchema.statics.getDistributionStats = async function(date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        assignedAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: '$distributionGroup',
        count: { $sum: 1 },
        users: { $addToSet: '$assignedTo' }
      }
    },
    {
      $project: {
        distributionGroup: '$_id',
        count: 1,
        uniqueUsers: { $size: '$users' }
      }
    }
  ]);
};

// Static method to get recent leads
leadSchema.statics.findRecent = function(limit = 10) {
  return this.find()
    .populate('hrUser', 'name email')
    .populate('assignedUser', 'name email')
    .populate('offerDetails', 'name category')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// ==================== INDEXES ====================

// Removed duplicate index - leadId already has unique: true which creates index
leadSchema.index({ hrUserId: 1, status: 1 });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ offerId: 1, status: 1 });
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ customerContact: 1 });
leadSchema.index({ customerEmail: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ assignedAt: -1 });
leadSchema.index({ isTodayLead: 1 });
leadSchema.index({ isYesterdayPending: 1 });
leadSchema.index({ distributionType: 1 });
leadSchema.index({ distributionGroup: 1 });
leadSchema.index({ 
  customerName: 'text', 
  customerContact: 'text', 
  offerName: 'text' 
});

// Compound indexes for common queries
leadSchema.index({ assignedTo: 1, assignedAt: -1 });
leadSchema.index({ hrUserId: 1, createdAt: -1 });
leadSchema.index({ category: 1, status: 1 });
leadSchema.index({ status: 1, completedAt: -1 });
leadSchema.index({ assignedTo: 1, isTodayLead: 1, status: 1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;