const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Offer name is required'],
      trim: true,
      maxlength: [200, 'Offer name cannot exceed 200 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    latestStage: {
      type: String,
      enum: ['Upload', 'Number', 'Pending', 'Completed'],
      default: 'Pending'
    },
    commission1: {
      type: String,
      trim: true
    },
    commission1Comment: {
      type: String,
      trim: true
    },
    commission2: {
      type: String,
      trim: true
    },
    commission2Comment: {
      type: String,
      trim: true
    },
    link: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true,
      default: ''
    },
    video: {
      type: String,
      trim: true,
      default: ''
    },
    videoLink: {
      type: String,
      trim: true,
      default: ''
    },
    termsAndConditions: {
      type: String,
      trim: true,
      maxlength: [5000, 'Terms and conditions cannot exceed 5000 characters']
    },
    // Approval fields
    isApproved: {
      type: Boolean,
      default: false,
      index: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    // Lead information
    leadId: {
      type: String,
      trim: true
    },
    // Status field for better filtering
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
      index: true
    },
    // Unique Offer ID (auto-generated)
    offersId: {
      type: String,
      unique: true,
      trim: true,
      index: true
    },
    // Additional fields for better tracking
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    // Expiry date for offers
    expiryDate: {
      type: Date
    },
    // Tags for better categorization
    tags: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== VIRTUAL FIELDS ====================

// Virtual for leads associated with this offer
offerSchema.virtual('leads', {
  ref: 'Lead',
  localField: '_id',
  foreignField: 'offerId'
});

// Virtual for category details
offerSchema.virtual('categoryDetails', {
  ref: 'Category',
  localField: 'category',
  foreignField: 'name',
  justOne: true
});

// Virtual for approved by user details
offerSchema.virtual('approvedByUser', {
  ref: 'User',
  localField: 'approvedBy',
  foreignField: '_id',
  justOne: true
});

// Virtual for formatted date
offerSchema.virtual('formattedDate').get(function() {
  return this.createdAt ? this.createdAt.toLocaleDateString('en-IN') : 'N/A';
});

// Virtual for conversion rate
offerSchema.virtual('conversionRate').get(function() {
  if (this.clicks === 0) return 0;
  return ((this.conversions / this.clicks) * 100).toFixed(2);
});

// Virtual for isExpired
offerSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// ==================== METHODS ====================

// Function to generate unique Offers ID
function generateOffersId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `OFF-${timestamp}-${randomStr}`;
}

// Pre-save middleware to auto-generate offersId
offerSchema.pre('save', async function(next) {
  // Only generate offersId if it's a new document and offersId is not already set
  if (this.isNew && !this.offersId) {
    let isUnique = false;
    let newOffersId;
    
    // Keep generating until we get a unique ID
    while (!isUnique) {
      newOffersId = generateOffersId();
      const existingOffer = await mongoose.model('Offer').findOne({ offersId: newOffersId });
      if (!existingOffer) {
        isUnique = true;
      }
    }
    
    this.offersId = newOffersId;
  }
  next();
});

// Method to approve offer
offerSchema.methods.approve = function(approvedByUserId) {
  this.isApproved = true;
  this.approvedBy = approvedByUserId;
  this.approvedAt = new Date();
  this.status = 'active';
};

// Method to reject offer
offerSchema.methods.reject = function(reason) {
  this.isApproved = false;
  this.rejectionReason = reason;
  this.status = 'inactive';
};

// Method to increment views
offerSchema.methods.incrementView = function() {
  this.views += 1;
};

// Method to increment clicks
offerSchema.methods.incrementClick = function() {
  this.clicks += 1;
};

// Method to increment conversions
offerSchema.methods.incrementConversion = function() {
  this.conversions += 1;
};

// ==================== STATICS ====================

// Static method to find active offers
offerSchema.statics.findActive = function() {
  return this.find({ 
    isApproved: true, 
    status: 'active',
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  });
};

// Static method to find offers by category
offerSchema.statics.findByCategory = function(category) {
  return this.find({ category, isApproved: true, status: 'active' });
};

// Static method to get offer statistics
offerSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalClicks: { $sum: '$clicks' },
        totalConversions: { $sum: '$conversions' }
      }
    }
  ]);

  return {
    total: stats.reduce((sum, stat) => sum + stat.count, 0),
    active: stats.find(stat => stat._id === 'active')?.count || 0,
    inactive: stats.find(stat => stat._id === 'inactive')?.count || 0,
    draft: stats.find(stat => stat._id === 'draft')?.count || 0,
    totalViews: stats.reduce((sum, stat) => sum + stat.totalViews, 0),
    totalClicks: stats.reduce((sum, stat) => sum + stat.totalClicks, 0),
    totalConversions: stats.reduce((sum, stat) => sum + stat.totalConversions, 0)
  };
};

// ==================== INDEXES ====================

offerSchema.index({ category: 1 });
offerSchema.index({ status: 1 });
offerSchema.index({ isApproved: 1 });
offerSchema.index({ createdAt: -1 });
offerSchema.index({ offersId: 1 });
offerSchema.index({ expiryDate: 1 });
offerSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search

// Compound indexes for common queries
offerSchema.index({ category: 1, isApproved: 1, status: 1 });
offerSchema.index({ isApproved: 1, status: 1, createdAt: -1 });
offerSchema.index({ tags: 1, status: 1 });

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;