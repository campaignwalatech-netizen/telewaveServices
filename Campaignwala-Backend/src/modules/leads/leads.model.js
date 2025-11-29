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
  // HR Details (Person who shared the link)
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
    enum: ['pending', 'approved', 'completed', 'rejected'],
    default: 'pending',
    index: true
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
  // Tracking fields
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  // Timestamps for status changes
  approvedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== VIRTUAL FIELDS ====================

// Virtual for HR user details
leadSchema.virtual('hrUser', {
  ref: 'User',
  localField: 'hrUserId',
  foreignField: '_id',
  justOne: true
});

// Virtual for offer details
leadSchema.virtual('offerDetails', {
  ref: 'Offer',
  localField: 'offerId',
  foreignField: '_id',
  justOne: true
});

// Virtual for formatted dates
leadSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt ? this.createdAt.toLocaleDateString('en-IN') : 'N/A';
});

leadSchema.virtual('formattedUpdatedAt').get(function() {
  return this.updatedAt ? this.updatedAt.toLocaleDateString('en-IN') : 'N/A';
});

// Virtual for total commission
leadSchema.virtual('totalCommission').get(function() {
  return (this.commission1 || 0) + (this.commission2 || 0);
});

// Virtual for status badge color
leadSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'warning',
    approved: 'info',
    completed: 'success',
    rejected: 'error'
  };
  return colors[this.status] || 'default';
});

// ==================== METHODS ====================

// Pre-save hook to generate leadId
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

// Method to approve lead
leadSchema.methods.approve = function(remarks = '') {
  this.status = 'approved';
  this.approvedAt = new Date();
  this.remarks = remarks;
};

// Method to complete lead
leadSchema.methods.complete = function(remarks = '') {
  this.status = 'completed';
  this.completedAt = new Date();
  this.remarks = remarks;
};

// Method to reject lead
leadSchema.methods.reject = function(reason = '') {
  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
};

// Method to check if commission is paid
leadSchema.methods.isCommissionPaid = function() {
  return this.commission1Paid && this.commission2Paid;
};

// ==================== STATICS ====================

// Static method to find leads by HR user
leadSchema.statics.findByHrUser = function(hrUserId, status = null) {
  const query = { hrUserId };
  if (status) query.status = status;
  return this.find(query).populate('offerDetails');
};

// Static method to find leads by status
leadSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('hrUser', 'name email phoneNumber');
};

// Static method to get lead statistics
leadSchema.statics.getStats = async function(hrUserId = null) {
  const matchStage = hrUserId ? { hrUserId } : {};
  
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
    approved: 0,
    completed: 0,
    rejected: 0,
    totalCommission: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
    result.totalCommission += stat.totalCommission || 0;
  });

  return result;
};

// Static method to get recent leads
leadSchema.statics.findRecent = function(limit = 10) {
  return this.find()
    .populate('hrUser', 'name email')
    .populate('offerDetails', 'name category')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// ==================== INDEXES ====================

leadSchema.index({ leadId: 1 });
leadSchema.index({ hrUserId: 1, status: 1 });
leadSchema.index({ offerId: 1, status: 1 });
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ customerContact: 1 });
leadSchema.index({ customerEmail: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ 
  customerName: 'text', 
  customerContact: 'text', 
  offerName: 'text' 
}); // Text search

// Compound indexes for common queries
leadSchema.index({ hrUserId: 1, createdAt: -1 });
leadSchema.index({ category: 1, status: 1 });
leadSchema.index({ status: 1, approvedAt: -1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;