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
  pendingWithdrawal: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ['credit', 'debit', 'withdrawal_request', 'withdrawal_approved', 'withdrawal_rejected'],
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
      enum: ['pending', 'completed', 'failed', 'approved', 'rejected'],
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
  }],
  // KYC requirement for withdrawal
  minKycForWithdrawal: {
    type: Boolean,
    default: false
  },
  minBalanceForWithdrawal: {
    type: Number,
    default: 100 // Minimum ₹100 for withdrawal
  },
  lastWithdrawalRequest: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== VIRTUAL FIELDS ====================

walletSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

walletSchema.virtual('availableBalance').get(function() {
  return this.balance - this.pendingWithdrawal;
});

walletSchema.virtual('transactionCount').get(function() {
  return this.transactions.length;
});

walletSchema.virtual('creditTransactions').get(function() {
  return this.transactions.filter(t => t.type === 'credit');
});

walletSchema.virtual('debitTransactions').get(function() {
  return this.transactions.filter(t => t.type === 'debit');
});

walletSchema.virtual('withdrawalRequests').get(function() {
  return this.transactions.filter(t => t.type.includes('withdrawal'));
});

// ==================== METHODS ====================

// Method to add credit from lead completion
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

// Method to request withdrawal
walletSchema.methods.requestWithdrawal = function(amount, description = '', metadata = {}) {
  // Check minimum balance
  if (amount < this.minBalanceForWithdrawal) {
    throw new Error(`Minimum withdrawal amount is ₹${this.minBalanceForWithdrawal}`);
  }
  
  // Check available balance
  if (amount > this.availableBalance) {
    throw new Error('Insufficient available balance');
  }
  
  // Check KYC requirement
  const user = this.user;
  if (this.minKycForWithdrawal && (!user || user.kycDetails.kycStatus !== 'approved')) {
    throw new Error('KYC approval required for withdrawal');
  }
  
  this.pendingWithdrawal += amount;
  
  this.transactions.push({
    type: 'withdrawal_request',
    amount,
    description,
    status: 'pending',
    metadata,
    createdAt: new Date()
  });
  
  this.lastWithdrawalRequest = new Date();
  
  return this.transactions[this.transactions.length - 1];
};

// Method to approve withdrawal
walletSchema.methods.approveWithdrawal = function(withdrawalId, amount, description = '', metadata = {}) {
  this.balance -= amount;
  this.pendingWithdrawal -= amount;
  this.totalWithdrawn += amount;
  
  this.transactions.push({
    type: 'withdrawal_approved',
    amount,
    description,
    withdrawalId,
    status: 'approved',
    metadata,
    createdAt: new Date()
  });
};

// Method to reject withdrawal
walletSchema.methods.rejectWithdrawal = function(withdrawalId, amount, description = '', metadata = {}) {
  this.pendingWithdrawal -= amount;
  
  this.transactions.push({
    type: 'withdrawal_rejected',
    amount,
    description,
    withdrawalId,
    status: 'rejected',
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
walletSchema.methods.getTransactionHistory = function(page = 1, limit = 10, type = null) {
  let transactions = this.transactions;
  
  if (type) {
    transactions = transactions.filter(t => t.type === type);
  }
  
  transactions = transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedTransactions = transactions.slice(startIndex, endIndex);
  
  return {
    transactions: paginatedTransactions,
    currentPage: page,
    totalPages: Math.ceil(transactions.length / limit),
    totalTransactions: transactions.length
  };
};

// Method to get balance snapshot
walletSchema.methods.getBalanceSnapshot = function() {
  return {
    currentBalance: this.balance,
    availableBalance: this.availableBalance,
    pendingWithdrawal: this.pendingWithdrawal,
    totalEarned: this.totalEarned,
    totalWithdrawn: this.totalWithdrawn,
    minWithdrawalAmount: this.minBalanceForWithdrawal,
    kycRequired: this.minKycForWithdrawal,
    lastUpdated: this.updatedAt
  };
};

// Method to check withdrawal eligibility
walletSchema.methods.canWithdraw = function(amount) {
  const user = this.user;
  
  // Check minimum amount
  if (amount < this.minBalanceForWithdrawal) {
    return {
      eligible: false,
      reason: `Minimum withdrawal amount is ₹${this.minBalanceForWithdrawal}`
    };
  }
  
  // Check available balance
  if (amount > this.availableBalance) {
    return {
      eligible: false,
      reason: 'Insufficient available balance'
    };
  }
  
  // Check KYC
  if (this.minKycForWithdrawal && (!user || user.kycDetails.kycStatus !== 'approved')) {
    return {
      eligible: false,
      reason: 'KYC approval required for withdrawal'
    };
  }
  
  return {
    eligible: true,
    reason: 'Eligible for withdrawal'
  };
};

// ==================== STATICS ====================

// Static method to find wallet by user ID with populated user
walletSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('user', 'name email phoneNumber kycDetails');
};

// Static method to get total platform stats
walletSchema.statics.getPlatformStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalBalance: { $sum: '$balance' },
        totalAvailableBalance: { $sum: { $subtract: ['$balance', '$pendingWithdrawal'] } },
        totalPendingWithdrawal: { $sum: '$pendingWithdrawal' },
        totalEarned: { $sum: '$totalEarned' },
        totalWithdrawn: { $sum: '$totalWithdrawn' },
        userCount: { $sum: 1 }
      }
    }
  ]);

  return stats[0] || {
    totalBalance: 0,
    totalAvailableBalance: 0,
    totalPendingWithdrawal: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    userCount: 0
  };
};

// Static method to find wallets with pending withdrawals
walletSchema.statics.findWithPendingWithdrawals = function() {
  return this.find({ pendingWithdrawal: { $gt: 0 } })
    .populate('user', 'name email phoneNumber bankDetails');
};

// ==================== INDEXES ====================

walletSchema.index({ userId: 1 });
walletSchema.index({ 'transactions.createdAt': -1 });
walletSchema.index({ 'transactions.leadId': 1 });
walletSchema.index({ 'transactions.withdrawalId': 1 });
walletSchema.index({ 'transactions.type': 1 });
walletSchema.index({ 'transactions.status': 1 });
walletSchema.index({ balance: -1 });
walletSchema.index({ pendingWithdrawal: -1 });
walletSchema.index({ updatedAt: -1 });

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;