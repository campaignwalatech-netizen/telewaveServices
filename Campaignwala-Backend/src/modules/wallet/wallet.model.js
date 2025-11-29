const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      default: ''
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    },
    withdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Withdrawal'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    referenceId: {
      type: String,
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== VIRTUAL FIELDS ====================

// Virtual for user details
walletSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for available balance (balance - pending withdrawals)
walletSchema.virtual('availableBalance').get(function() {
  return this.balance;
});

// Virtual for total transactions count
walletSchema.virtual('transactionCount').get(function() {
  return this.transactions.length;
});

// Virtual for credit transactions
walletSchema.virtual('creditTransactions').get(function() {
  return this.transactions.filter(t => t.type === 'credit');
});

// Virtual for debit transactions
walletSchema.virtual('debitTransactions').get(function() {
  return this.transactions.filter(t => t.type === 'debit');
});

// ==================== METHODS ====================

// Method to add credit
walletSchema.methods.addCredit = function(amount, description = '', leadId = null, metadata = {}) {
  this.balance += amount;
  this.totalEarned += amount;
  
  this.transactions.push({
    type: 'credit',
    amount,
    description,
    leadId,
    status: 'completed',
    metadata,
    createdAt: new Date()
  });
};

// Method to add debit
walletSchema.methods.addDebit = function(amount, description = '', withdrawalId = null, metadata = {}) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  this.balance -= amount;
  this.totalWithdrawn += amount;
  
  this.transactions.push({
    type: 'debit',
    amount,
    description,
    withdrawalId,
    status: 'completed',
    metadata,
    createdAt: new Date()
  });
};

// Method to get transaction history with pagination
walletSchema.methods.getTransactionHistory = function(page = 1, limit = 10) {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const transactions = this.transactions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(startIndex, endIndex);
  
  return {
    transactions,
    currentPage: page,
    totalPages: Math.ceil(this.transactions.length / limit),
    totalTransactions: this.transactions.length
  };
};

// Method to get balance snapshot
walletSchema.methods.getBalanceSnapshot = function() {
  return {
    currentBalance: this.balance,
    totalEarned: this.totalEarned,
    totalWithdrawn: this.totalWithdrawn,
    availableBalance: this.availableBalance,
    lastUpdated: this.updatedAt
  };
};

// ==================== STATICS ====================

// Static method to find wallet by user ID with populated user
walletSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('user', 'name email phoneNumber');
};

// Static method to get total platform stats
walletSchema.statics.getPlatformStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalBalance: { $sum: '$balance' },
        totalEarned: { $sum: '$totalEarned' },
        totalWithdrawn: { $sum: '$totalWithdrawn' },
        userCount: { $sum: 1 }
      }
    }
  ]);

  return stats[0] || {
    totalBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    userCount: 0
  };
};

// ==================== INDEXES ====================

walletSchema.index({ userId: 1 });
walletSchema.index({ 'transactions.createdAt': -1 });
walletSchema.index({ 'transactions.leadId': 1 });
walletSchema.index({ 'transactions.withdrawalId': 1 });
walletSchema.index({ balance: -1 });
walletSchema.index({ updatedAt: -1 });

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;