const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Phone number must be 10 digits'
        }
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Invalid email format'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'TL'],
        default: 'user'
    },
    // TL specific fields
    tlDetails: {
        assignedTeam: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        totalTeamMembers: {
            type: Number,
            default: 0
        },
        teamPerformance: {
            type: Number,
            default: 0
        },
        assignedLeads: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lead'
        }],
        canAssignLeads: {
            type: Boolean,
            default: true
        },
        canApproveLeads: {
            type: Boolean,
            default: false
        },
        canViewReports: {
            type: Boolean,
            default: true
        },
        permissions: {
            addUsers: {
                type: Boolean,
                default: false
            },
            editUsers: {
                type: Boolean,
                default: false
            },
            viewUsers: {
                type: Boolean,
                default: true
            },
            assignLeads: {
                type: Boolean,
                default: true
            },
            approveLeads: {
                type: Boolean,
                default: false
            },
            viewReports: {
                type: Boolean,
                default: true
            },
            manageTeam: {
                type: Boolean,
                default: true
            }
        }
    },
    // Team Leader hierarchy
    reportingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    isVerified: {
        type: Boolean,
        default: false
    },
    otpAttempts: {
        type: Number,
        default: 0
    },
    lastOtpSent: {
        type: Date
    },
    // Registration OTP
    registrationOtp: {
        type: String
    },
    registrationOtpExpires: {
        type: Date
    },
    // Login OTP
    loginOtp: {
        type: String
    },
    loginOtpExpires: {
        type: Date
    },
    // Password Reset OTP
    resetPasswordOtp: {
        type: String
    },
    resetPasswordOtpExpires: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEx: {
        type: Boolean,
        default: false
    },
    // Session Management - Single Device Login
    activeSession: {
        type: String,
        default: null
    },
    sessionDevice: {
        type: String,
        default: null
    },
    sessionIP: {
        type: String,
        default: null
    },
    lastActivity: {
        type: Date,
        default: null
    },
    // Personal Details
    firstName: {
        type: String,
        trim: true,
        default: ''
    },
    lastName: {
        type: String,
        trim: true,
        default: ''
    },
    dob: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['', 'Male', 'Female', 'Other'],
        default: ''
    },
    address1: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        trim: true,
        default: ''
    },
    state: {
        type: String,
        trim: true,
        default: ''
    },
    zip: {
        type: String,
        trim: true,
        default: ''
    },
    country: {
        type: String,
        trim: true,
        default: 'India'
    },
    // KYC Documents
    kycDetails: {
        panNumber: {
            type: String,
            trim: true,
            uppercase: true,
            default: ''
        },
        aadhaarNumber: {
            type: String,
            trim: true,
            default: ''
        },
        panImage: {
            type: String,
            default: ''
        },
        aadhaarImage: {
            type: String,
            default: ''
        },
        kycStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'not_submitted'],
            default: 'not_submitted'
        },
        kycSubmittedAt: {
            type: Date
        },
        kycApprovedAt: {
            type: Date
        },
        kycRejectedAt: {
            type: Date
        },
        kycRejectionReason: {
            type: String,
            trim: true,
            default: ''
        }
    },
    // Bank Details
    bankDetails: {
        bankName: {
            type: String,
            trim: true,
            default: ''
        },
        accountHolderName: {
            type: String,
            trim: true,
            default: ''
        },
        accountNumber: {
            type: String,
            trim: true,
            default: ''
        },
        ifscCode: {
            type: String,
            trim: true,
            uppercase: true,
            default: ''
        },
        branchAddress: {
            type: String,
            trim: true,
            default: ''
        },
        upiId: {
            type: String,
            trim: true,
            default: ''
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verifiedAt: {
            type: Date
        }
    },
    // Statistics Fields
    statistics: {
        totalLeads: {
            type: Number,
            default: 0
        },
        completedLeads: {
            type: Number,
            default: 0
        },
        pendingLeads: {
            type: Number,
            default: 0
        },
        rejectedLeads: {
            type: Number,
            default: 0
        },
        totalEarnings: {
            type: Number,
            default: 0
        },
        currentBalance: {
            type: Number,
            default: 0
        },
        totalWithdrawals: {
            type: Number,
            default: 0
        },
        lastLeadDate: {
            type: Date
        },
        conversionRate: {
            type: Number,
            default: 0
        }
    },
    // Performance Metrics
    performance: {
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        completedTasks: {
            type: Number,
            default: 0
        },
        pendingTasks: {
            type: Number,
            default: 0
        },
        averageCompletionTime: {
            type: Number, // in hours
            default: 0
        }
    },
    // Additional Profile Information
    profile: {
        avatar: {
            type: String,
            default: ''
        },
        bio: {
            type: String,
            maxlength: 500,
            default: ''
        },
        skills: [{
            type: String,
            trim: true
        }],
        experience: {
            type: Number, // in years
            default: 0
        },
        education: {
            type: String,
            default: ''
        }
    },
    // Notification Preferences
    notifications: {
        email: {
            type: Boolean,
            default: true
        },
        sms: {
            type: Boolean,
            default: true
        },
        push: {
            type: Boolean,
            default: true
        },
        leadUpdates: {
            type: Boolean,
            default: true
        },
        paymentUpdates: {
            type: Boolean,
            default: true
        },
        promotional: {
            type: Boolean,
            default: false
        }
    },
    // Security Settings
    security: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        lastPasswordChange: {
            type: Date,
            default: Date.now
        },
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: {
            type: Date
        }
    },
    // Metadata
    metadata: {
        signupSource: {
            type: String,
            default: 'web'
        },
        referrer: {
            type: String,
            default: ''
        },
        campaign: {
            type: String,
            default: ''
        },
        deviceInfo: {
            type: Object,
            default: {}
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==================== VIRTUAL FIELDS ====================

// Virtual for leads created by this user (as HR)
userSchema.virtual('leads', {
    ref: 'Lead',
    localField: '_id',
    foreignField: 'hrUserId'
});

// Virtual for wallet
userSchema.virtual('wallet', {
    ref: 'Wallet',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

// Virtual for withdrawals
userSchema.virtual('withdrawals', {
    ref: 'Withdrawal',
    localField: '_id',
    foreignField: 'userId'
});

// Virtual for queries submitted
userSchema.virtual('queries', {
    ref: 'Query',
    localField: '_id',
    foreignField: 'userId'
});

// Virtual for admin logs
userSchema.virtual('adminLogs', {
    ref: 'AdminLog',
    localField: '_id',
    foreignField: 'adminId'
});

// Virtual for team statistics (for TL)
userSchema.virtual('teamStats').get(async function() {
    if (this.role !== 'TL') return null;
    
    const teamMembers = await User.find({ _id: { $in: this.teamMembers } });
    let teamTotalLeads = 0;
    let teamCompletedLeads = 0;
    let teamTotalEarnings = 0;
    
    teamMembers.forEach(member => {
        teamTotalLeads += member.statistics.totalLeads || 0;
        teamCompletedLeads += member.statistics.completedLeads || 0;
        teamTotalEarnings += member.statistics.totalEarnings || 0;
    });
    
    return {
        teamSize: teamMembers.length,
        teamTotalLeads,
        teamCompletedLeads,
        teamTotalEarnings,
        teamConversionRate: teamTotalLeads > 0 ? (teamCompletedLeads / teamTotalLeads * 100) : 0
    };
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim() || this.name;
});

// Virtual for age
userSchema.virtual('age').get(function () {
    if (!this.dob) return null;
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
});

// Virtual for lead statistics (computed)
userSchema.virtual('leadStats').get(function () {
    return {
        total: this.statistics.totalLeads || 0,
        completed: this.statistics.completedLeads || 0,
        pending: this.statistics.pendingLeads || 0,
        rejected: this.statistics.rejectedLeads || 0,
        conversionRate: this.statistics.conversionRate || 0
    };
});

// ==================== METHODS ====================

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate random 4-digit OTP
userSchema.methods.generateOTP = function () {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Check if OTP attempts exceeded
userSchema.methods.canSendOtp = function () {
    const now = new Date();
    const lastOtp = this.lastOtpSent;

    // Reset attempts if more than 15 minutes passed
    if (lastOtp && (now - lastOtp) > 15 * 60 * 1000) {
        this.otpAttempts = 0;
    }

    return this.otpAttempts < 20; // Max 20 attempts per 15 minutes
};

// Increment OTP attempts
userSchema.methods.incrementOtpAttempts = function () {
    this.otpAttempts += 1;
    this.lastOtpSent = new Date();
};

// Set OTP with expiry (10 minutes)
userSchema.methods.setOtp = function (type) {
    const otp = this.generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    if (type === 'registration') {
        this.registrationOtp = otp;
        this.registrationOtpExpires = expires;
    } else if (type === 'login') {
        this.loginOtp = otp;
        this.loginOtpExpires = expires;
    } else if (type === 'reset') {
        this.resetPasswordOtp = otp;
        this.resetPasswordOtpExpires = expires;
    }
    
    return otp;
};

// Verify OTP
userSchema.methods.verifyOtp = function (otp, type) {
    let storedOtp, storedExpiry;

    if (type === 'registration') {
        storedOtp = this.registrationOtp;
        storedExpiry = this.registrationOtpExpires;
    } else if (type === 'login') {
        storedOtp = this.loginOtp;
        storedExpiry = this.loginOtpExpires;
    } else if (type === 'reset') {
        storedOtp = this.resetPasswordOtp;
        storedExpiry = this.resetPasswordOtpExpires;
    }

    if (!storedOtp || !storedExpiry) {
        return false;
    }

    if (storedExpiry < new Date()) {
        return false; // OTP expired
    }

    return storedOtp === otp;
};

// Clear OTP after verification
userSchema.methods.clearOtp = function (type) {
    if (type === 'registration') {
        this.registrationOtp = undefined;
        this.registrationOtpExpires = undefined;
    } else if (type === 'login') {
        this.loginOtp = undefined;
        this.loginOtpExpires = undefined;
    } else if (type === 'reset') {
        this.resetPasswordOtp = undefined;
        this.resetPasswordOtpExpires = undefined;
    }
    this.otpAttempts = 0; // Reset attempts on successful verification
};

// Update statistics method
userSchema.methods.updateStatistics = function (leadData, walletData) {
    if (leadData) {
        this.statistics.totalLeads = leadData.total || 0;
        this.statistics.completedLeads = leadData.completed || 0;
        this.statistics.pendingLeads = leadData.pending || 0;
        this.statistics.rejectedLeads = leadData.rejected || 0;
        
        // Calculate conversion rate
        if (leadData.total > 0) {
            this.statistics.conversionRate = (leadData.completed / leadData.total) * 100;
        }
        
        this.statistics.lastLeadDate = new Date();
    }
    
    if (walletData) {
        this.statistics.totalEarnings = walletData.totalEarned || 0;
        this.statistics.currentBalance = walletData.currentBalance || 0;
        this.statistics.totalWithdrawals = walletData.totalWithdrawn || 0;
    }
};

// Check if account is locked
userSchema.methods.isLocked = function () {
    return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = function () {
    this.security.loginAttempts += 1;
    
    if (this.security.loginAttempts >= 5) {
        this.security.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
    }
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function () {
    this.security.loginAttempts = 0;
    this.security.lockUntil = undefined;
};

// TL Methods
userSchema.methods.addTeamMember = async function (memberId) {
    if (this.role !== 'TL') {
        throw new Error('Only TL can add team members');
    }
    
    if (!this.teamMembers.includes(memberId)) {
        this.teamMembers.push(memberId);
        this.tlDetails.totalTeamMembers = this.teamMembers.length;
        await this.save();
    }
};

userSchema.methods.removeTeamMember = async function (memberId) {
    if (this.role !== 'TL') {
        throw new Error('Only TL can remove team members');
    }
    
    this.teamMembers = this.teamMembers.filter(id => id.toString() !== memberId.toString());
    this.tlDetails.totalTeamMembers = this.teamMembers.length;
    await this.save();
};

userSchema.methods.assignLeadToTeam = async function (leadId, memberId = null) {
    if (this.role !== 'TL') {
        throw new Error('Only TL can assign leads');
    }
    
    if (memberId && !this.teamMembers.includes(memberId)) {
        throw new Error('Cannot assign to non-team member');
    }
    
    this.tlDetails.assignedLeads.push(leadId);
    await this.save();
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    
    // Remove sensitive fields
    delete userObject.password;
    delete userObject.otpAttempts;
    delete userObject.lastOtpSent;
    delete userObject.activeSession;
    delete userObject.registrationOtp;
    delete userObject.registrationOtpExpires;
    delete userObject.loginOtp;
    delete userObject.loginOtpExpires;
    delete userObject.resetPasswordOtp;
    delete userObject.resetPasswordOtpExpires;
    delete userObject.security;
    
    return userObject;
};

// ==================== STATICS ====================

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
    return this.find({ isActive: true, isEx: false });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
    return this.find({ role, isActive: true });
};

// Static method to get TLs with their teams
userSchema.statics.findTLsWithTeams = function() {
    return this.find({ role: 'TL' })
        .populate('teamMembers', 'name email phoneNumber statistics')
        .populate('reportingTo', 'name email');
};

// Static method to get team members of a TL
userSchema.statics.findTeamMembers = function(tlId) {
    return this.find({ reportingTo: tlId, role: 'user' })
        .populate('leads')
        .populate('wallet');
};

// Static method to get users with pending KYC
userSchema.statics.findPendingKYC = function() {
    return this.find({ 'kycDetails.kycStatus': 'pending' });
};

// ==================== INDEXES ====================

userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isEx: 1 });
userSchema.index({ 'kycDetails.kycStatus': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'statistics.totalLeads': -1 });
userSchema.index({ 'statistics.totalEarnings': -1 });
userSchema.index({ name: 'text', email: 'text' }); // Text search
userSchema.index({ reportingTo: 1 }); // For TL hierarchy
userSchema.index({ 'tlDetails.assignedLeads': 1 }); // For TL leads assignment

const User = mongoose.model('User', userSchema);

module.exports = User;