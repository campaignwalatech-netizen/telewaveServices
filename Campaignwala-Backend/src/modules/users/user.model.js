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
    // Status Management
    status: {
        type: String,
        enum: ['active', 'inactive', 'hold', 'blocked', 'pending_approval'],
        default: 'pending_approval'
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['active', 'inactive', 'hold', 'blocked', 'pending_approval']
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        reason: {
            type: String,
            trim: true
        }
    }],
    approvedAt: {
        type: Date
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    holdUntil: {
        type: Date
    },
    blockedAt: {
        type: Date
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    blockReason: {
        type: String,
        trim: true
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deleteReason: {
        type: String,
        trim: true
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
        dailyLeadQuota: {
            type: Number,
            default: 0
        },
        canAssignLeads: {
            type: Boolean,
            default: true
        },
        canWithdrawLeads: {
            type: Boolean,
            default: true
        },
        canMarkHold: {
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
            withdrawLeads: {
                type: Boolean,
                default: true
            },
            markHold: {
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
    
    // ==================== ATTENDANCE SECTION ====================
    attendance: {
        todayStatus: {
            type: String,
            enum: ['present', 'absent', 'late', 'half-day'],
            default: 'absent'
        },
        todayMarkedAt: {
            type: Date
        },
        todayMarkedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        streak: {
            type: Number,
            default: 0
        },
        lastMarkedDate: {
            type: Date
        },
        monthlyStats: {
            present: {
                type: Number,
                default: 0
            },
            absent: {
                type: Number,
                default: 0
            },
            late: {
                type: Number,
                default: 0
            }
        },
        yearlyStats: {
            present: {
                type: Number,
                default: 0
            },
            absent: {
                type: Number,
                default: 0
            },
            late: {
                type: Number,
                default: 0
            }
        },
        history: [{
            date: {
                type: Date,
                required: true
            },
            status: {
                type: String,
                enum: ['present', 'absent', 'late', 'half-day', 'holiday', 'leave'],
                required: true
            },
            markedAt: {
                type: Date,
                required: true
            },
            markedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            ipAddress: {
                type: String
            },
            deviceInfo: {
                type: String
            },
            notes: {
                type: String
            }
        }]
    },
    // ==================== END ATTENDANCE SECTION ====================
    
    // ==================== LEAD DISTRIBUTION TRACKING ====================
    leadDistribution: {
        todaysLeads: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lead'
        }],
        todaysLeadCount: {
            type: Number,
            default: 0
        },
        todaysCompletedLeads: {
            type: Number,
            default: 0
        },
        todaysPendingLeads: {
            type: Number,
            default: 0
        },
        lastLeadDistributionDate: {
            type: Date
        },
        dailyLeadQuota: {
            type: Number,
            default: 0
        }
    },
    // ==================== END LEAD DISTRIBUTION ====================
    
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
    registrationOtp: {
        type: String
    },
    registrationOtpExpires: {
        type: Date
    },
    loginOtp: {
        type: String
    },
    loginOtpExpires: {
        type: Date
    },
    resetPasswordOtp: {
        type: String
    },
    resetPasswordOtpExpires: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: false // Initially false until approved by admin
    },
    isEx: {
        type: Boolean,
        default: false
    },
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
        aadhaarFrontImage: {
            type: String,
            default: ''
        },
        aadhaarBackImage: {
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
        kycApprovedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        kycRejectedAt: {
            type: Date
        },
        kycRejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
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
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
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
        },
        todaysLeads: {
            type: Number,
            default: 0
        },
        yesterdaysPendingLeads: {
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
            type: Number,
            default: 0
        }
    },
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
            type: Number,
            default: 0
        },
        education: {
            type: String,
            default: ''
        }
    },
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
        },
        attendanceReminders: {
            type: Boolean,
            default: true
        }
    },
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

userSchema.virtual('leads', {
    ref: 'Lead',
    localField: '_id',
    foreignField: 'hrUserId'
});

userSchema.virtual('assignedLeads', {
    ref: 'Lead',
    localField: '_id',
    foreignField: 'assignedTo'
});

userSchema.virtual('withdrawnLeads', {
    ref: 'Lead',
    localField: '_id',
    foreignField: 'withdrawnBy'
});

userSchema.virtual('wallet', {
    ref: 'Wallet',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

userSchema.virtual('withdrawals', {
    ref: 'Withdrawal',
    localField: '_id',
    foreignField: 'userId'
});

userSchema.virtual('queries', {
    ref: 'Query',
    localField: '_id',
    foreignField: 'userId'
});

userSchema.virtual('adminLogs', {
    ref: 'AdminLog',
    localField: '_id',
    foreignField: 'adminId'
});

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

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim() || this.name;
});

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

userSchema.virtual('leadStats').get(function () {
    return {
        total: this.statistics.totalLeads || 0,
        completed: this.statistics.completedLeads || 0,
        pending: this.statistics.pendingLeads || 0,
        rejected: this.statistics.rejectedLeads || 0,
        conversionRate: this.statistics.conversionRate || 0
    };
});

userSchema.virtual('todaysAttendance').get(function () {
    return this.attendance.todayStatus || 'absent';
});

userSchema.virtual('attendanceStreak').get(function () {
    return this.attendance.streak || 0;
});

userSchema.virtual('monthlyAttendance').get(function () {
    return {
        present: this.attendance.monthlyStats?.present || 0,
        absent: this.attendance.monthlyStats?.absent || 0,
        late: this.attendance.monthlyStats?.late || 0,
        total: (this.attendance.monthlyStats?.present || 0) + 
               (this.attendance.monthlyStats?.absent || 0) + 
               (this.attendance.monthlyStats?.late || 0)
    };
});

// Check if user can receive leads today
userSchema.virtual('canReceiveLeads').get(function () {
    // Check if user is active and not on hold
    if (this.status !== 'active') return false;
    
    // Check if user is present today (only for regular users, not TLs)
    if (this.role === 'user' && this.attendance.todayStatus !== 'present') {
        return false;
    }
    
    // Check if user already received leads today
    const today = new Date();
    if (this.leadDistribution.lastLeadDistributionDate) {
        const lastDistDate = new Date(this.leadDistribution.lastLeadDistributionDate);
        if (lastDistDate.toDateString() === today.toDateString()) {
            return false;
        }
    }
    
    return true;
});

// ==================== METHODS ====================

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

userSchema.pre('save', function (next) {
    // Reset daily attendance at midnight
    if (this.attendance.lastMarkedDate) {
        const today = new Date();
        const lastMarked = new Date(this.attendance.lastMarkedDate);
        
        if (today.toDateString() !== lastMarked.toDateString()) {
            if (!this.attendance.todayMarkedAt || 
                new Date(this.attendance.todayMarkedAt).toDateString() !== today.toDateString()) {
                this.attendance.todayStatus = 'absent';
                this.attendance.todayMarkedAt = null;
                this.attendance.todayMarkedBy = null;
            }
        }
    }
    
    // Reset daily leads at midnight
    const today = new Date();
    if (this.leadDistribution.lastLeadDistributionDate) {
        const lastDistDate = new Date(this.leadDistribution.lastLeadDistributionDate);
        if (lastDistDate.toDateString() !== today.toDateString()) {
            this.leadDistribution.todaysLeads = [];
            this.leadDistribution.todaysLeadCount = 0;
            this.leadDistribution.todaysCompletedLeads = 0;
            this.leadDistribution.todaysPendingLeads = 0;
            this.statistics.todaysLeads = 0;
        }
    }
    
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateOTP = function () {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

userSchema.methods.canSendOtp = function () {
    const now = new Date();
    const lastOtp = this.lastOtpSent;

    if (lastOtp && (now - lastOtp) > 15 * 60 * 1000) {
        this.otpAttempts = 0;
    }

    return this.otpAttempts < 20;
};

userSchema.methods.incrementOtpAttempts = function () {
    this.otpAttempts += 1;
    this.lastOtpSent = new Date();
};

userSchema.methods.setOtp = function (type) {
    const otp = this.generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    
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
        return false;
    }

    return storedOtp === otp;
};

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
    this.otpAttempts = 0;
};

// Status Management Methods
userSchema.methods.approveUser = function(adminId) {
    this.status = 'active';
    this.isActive = true;
    this.approvedAt = new Date();
    this.approvedBy = adminId;
    
    this.statusHistory.push({
        status: 'active',
        changedBy: adminId,
        reason: 'Approved by admin'
    });
};

userSchema.methods.markHold = function(adminId, reason = '', holdUntil = null) {
    this.status = 'hold';
    this.holdUntil = holdUntil;
    
    this.statusHistory.push({
        status: 'hold',
        changedBy: adminId,
        reason: reason
    });
};

userSchema.methods.markActive = function(adminId, reason = '') {
    this.status = 'active';
    this.holdUntil = null;
    
    this.statusHistory.push({
        status: 'active',
        changedBy: adminId,
        reason: reason
    });
};

userSchema.methods.blockUser = function(adminId, reason = '') {
    this.status = 'blocked';
    this.blockedAt = new Date();
    this.blockedBy = adminId;
    this.blockReason = reason;
    this.isEx = true;
    
    this.statusHistory.push({
        status: 'blocked',
        changedBy: adminId,
        reason: reason
    });
};

userSchema.methods.deleteUser = function(adminId, reason = '') {
    this.deletedAt = new Date();
    this.deletedBy = adminId;
    this.deleteReason = reason;
    this.isEx = true;
    
    this.statusHistory.push({
        status: 'deleted',
        changedBy: adminId,
        reason: reason
    });
};

userSchema.methods.changeRole = function(newRole, adminId, reason = '') {
    const oldRole = this.role;
    this.role = newRole;
    
    // Clear TL-specific fields if changing from TL to user
    if (oldRole === 'TL' && newRole === 'user') {
        this.tlDetails = {
            assignedTeam: [],
            totalTeamMembers: 0,
            teamPerformance: 0,
            assignedLeads: [],
            dailyLeadQuota: 0,
            canAssignLeads: false,
            canWithdrawLeads: false,
            canMarkHold: false,
            canApproveLeads: false,
            canViewReports: false,
            permissions: {
                addUsers: false,
                editUsers: false,
                viewUsers: false,
                assignLeads: false,
                withdrawLeads: false,
                markHold: false,
                approveLeads: false,
                viewReports: false,
                manageTeam: false
            }
        };
        this.teamMembers = [];
    }
    
    this.statusHistory.push({
        status: `role_changed_${newRole}`,
        changedBy: adminId,
        reason: `Role changed from ${oldRole} to ${newRole}. ${reason}`
    });
};

// Lead Distribution Methods
userSchema.methods.assignLead = function(leadId) {
    const today = new Date();
    
    // Check if this is first lead assignment today
    if (!this.leadDistribution.lastLeadDistributionDate || 
        new Date(this.leadDistribution.lastLeadDistributionDate).toDateString() !== today.toDateString()) {
        this.leadDistribution.todaysLeads = [];
        this.leadDistribution.todaysLeadCount = 0;
        this.leadDistribution.todaysCompletedLeads = 0;
        this.leadDistribution.todaysPendingLeads = 0;
    }
    
    if (!this.leadDistribution.todaysLeads.includes(leadId)) {
        this.leadDistribution.todaysLeads.push(leadId);
        this.leadDistribution.todaysLeadCount += 1;
        this.leadDistribution.todaysPendingLeads += 1;
        this.leadDistribution.lastLeadDistributionDate = today;
        this.statistics.todaysLeads += 1;
    }
};

userSchema.methods.completeLead = function(leadId) {
    if (this.leadDistribution.todaysLeads.includes(leadId)) {
        this.leadDistribution.todaysCompletedLeads += 1;
        this.leadDistribution.todaysPendingLeads -= 1;
        this.statistics.completedLeads += 1;
        this.statistics.pendingLeads -= 1;
    }
};

userSchema.methods.withdrawLead = function(leadId) {
    const index = this.leadDistribution.todaysLeads.indexOf(leadId);
    if (index > -1) {
        this.leadDistribution.todaysLeads.splice(index, 1);
        this.leadDistribution.todaysLeadCount -= 1;
        this.leadDistribution.todaysPendingLeads -= 1;
        this.statistics.todaysLeads -= 1;
        this.statistics.pendingLeads -= 1;
    }
};

// Attendance Methods (Only for users, not TLs)
userSchema.methods.canMarkAttendance = function () {
    // TLs don't mark attendance
    if (this.role === 'TL' || this.role === 'admin') {
        return {
            canMark: false,
            message: 'Attendance marking is not required for TLs/Admins'
        };
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (this.attendance.todayMarkedAt) {
        const markedDate = new Date(this.attendance.todayMarkedAt);
        if (markedDate.toDateString() === now.toDateString()) {
            return {
                canMark: false,
                message: 'Attendance already marked for today'
            };
        }
    }
    
    const startHour = 9;
    const endHour = 10;
    
    if (currentHour < startHour || (currentHour === endHour && currentMinute > 0) || currentHour > endHour) {
        return {
            canMark: false,
            message: `Attendance can only be marked between ${startHour}:00 AM and ${endHour}:00 AM IST`
        };
    }
    
    return {
        canMark: true,
        message: 'You can mark attendance now'
    };
};

userSchema.methods.markAttendance = function (status = 'present', options = {}) {
    // TLs and Admins don't mark attendance
    if (this.role === 'TL' || this.role === 'admin') {
        throw new Error('Attendance marking is not required for TLs/Admins');
    }
    
    const canMark = this.canMarkAttendance();
    
    if (!canMark.canMark) {
        throw new Error(canMark.message);
    }
    
    const validStatuses = ['present', 'absent', 'late', 'half-day'];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid attendance status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const now = new Date();
    
    this.attendance.todayStatus = status;
    this.attendance.todayMarkedAt = now;
    this.attendance.todayMarkedBy = options.markedBy || this._id;
    this.attendance.lastMarkedDate = now;
    
    if (status === 'present') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (this.attendance.lastMarkedDate) {
            const lastMarked = new Date(this.attendance.lastMarkedDate);
            if (lastMarked.toDateString() === yesterday.toDateString()) {
                this.attendance.streak = (this.attendance.streak || 0) + 1;
            } else {
                this.attendance.streak = 1;
            }
        } else {
            this.attendance.streak = 1;
        }
    } else {
        this.attendance.streak = 0;
    }
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    if (!this.attendance.monthlyStats) {
        this.attendance.monthlyStats = {
            present: 0,
            absent: 0,
            late: 0
        };
    }
    
    if (!this.attendance.yearlyStats) {
        this.attendance.yearlyStats = {
            present: 0,
            absent: 0,
            late: 0
        };
    }
    
    if (status === 'present') {
        this.attendance.monthlyStats.present += 1;
        this.attendance.yearlyStats.present += 1;
    } else if (status === 'absent') {
        this.attendance.monthlyStats.absent += 1;
        this.attendance.yearlyStats.absent += 1;
    } else if (status === 'late') {
        this.attendance.monthlyStats.late += 1;
        this.attendance.yearlyStats.late += 1;
    }
    
    const attendanceRecord = {
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        status: status,
        markedAt: now,
        markedBy: options.markedBy || this._id,
        ipAddress: options.ipAddress || '',
        deviceInfo: options.deviceInfo || '',
        notes: options.notes || ''
    };
    
    if (!this.attendance.history) {
        this.attendance.history = [];
    }
    
    this.attendance.history = this.attendance.history.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() !== now.toDateString();
    });
    
    this.attendance.history.push(attendanceRecord);
    
    if (this.attendance.history.length > 365) {
        this.attendance.history = this.attendance.history.slice(-365);
    }
    
    return {
        success: true,
        status: status,
        markedAt: now,
        streak: this.attendance.streak,
        message: `Attendance marked as ${status}`
    };
};

// KYC Methods
userSchema.methods.submitKYC = function(kycData) {
    this.kycDetails = {
        ...this.kycDetails,
        ...kycData,
        kycStatus: 'pending',
        kycSubmittedAt: new Date()
    };
};

userSchema.methods.approveKYC = function(adminId) {
    this.kycDetails.kycStatus = 'approved';
    this.kycDetails.kycApprovedAt = new Date();
    this.kycDetails.kycApprovedBy = adminId;
};

userSchema.methods.rejectKYC = function(adminId, reason) {
    this.kycDetails.kycStatus = 'rejected';
    this.kycDetails.kycRejectedAt = new Date();
    this.kycDetails.kycRejectedBy = adminId;
    this.kycDetails.kycRejectionReason = reason;
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

userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    
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

userSchema.statics.findActiveUsers = function() {
    return this.find({ status: 'active', isActive: true, isEx: false });
};

userSchema.statics.findByRole = function(role) {
    return this.find({ role, status: 'active', isActive: true });
};

userSchema.statics.findTLsWithTeams = function() {
    return this.find({ role: 'TL', status: 'active' })
        .populate('teamMembers', 'name email phoneNumber statistics attendance.todayStatus')
        .populate('reportingTo', 'name email');
};

userSchema.statics.findTeamMembers = function(tlId) {
    return this.find({ reportingTo: tlId, role: 'user', status: 'active' })
        .populate('leads')
        .populate('wallet');
};

userSchema.statics.findPendingApproval = function() {
    return this.find({ status: 'pending_approval' });
};

userSchema.statics.findHoldUsers = function() {
    return this.find({ status: 'hold' });
};

userSchema.statics.findBlockedUsers = function() {
    return this.find({ status: 'blocked' });
};

userSchema.statics.findExUsers = function() {
    return this.find({ isEx: true });
};

userSchema.statics.findUsersWithAttendance = function(status = 'present') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.find({
        role: 'user',
        status: 'active',
        'attendance.todayStatus': status,
        'attendance.todayMarkedAt': { $gte: today }
    });
};

userSchema.statics.findUsersWithoutLeadsToday = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.find({
        role: 'user',
        status: 'active',
        $or: [
            { 'leadDistribution.lastLeadDistributionDate': { $lt: today } },
            { 'leadDistribution.lastLeadDistributionDate': { $exists: false } }
        ]
    });
};

userSchema.statics.findUsersForLeadDistribution = function(distributionType = 'all_active') {
    let query = { role: 'user', status: 'active' };
    
    switch(distributionType) {
        case 'all_active':
            break;
        case 'present_today':
            query['attendance.todayStatus'] = 'present';
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query['attendance.todayMarkedAt'] = { $gte: today };
            break;
        case 'without_leads_today':
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            query.$or = [
                { 'leadDistribution.lastLeadDistributionDate': { $lt: todayDate } },
                { 'leadDistribution.lastLeadDistributionDate': { $exists: false } }
            ];
            break;
    }
    
    return this.find(query);
};

// ==================== INDEXES ====================

userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isEx: 1 });
userSchema.index({ 'kycDetails.kycStatus': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'statistics.totalLeads': -1 });
userSchema.index({ 'statistics.totalEarnings': -1 });
userSchema.index({ name: 'text', email: 'text' });
userSchema.index({ reportingTo: 1 });
userSchema.index({ 'attendance.todayStatus': 1 });
userSchema.index({ 'attendance.todayMarkedAt': -1 });
userSchema.index({ 'leadDistribution.lastLeadDistributionDate': -1 });
userSchema.index({ approvedAt: -1 });
userSchema.index({ blockedAt: -1 });
userSchema.index({ deletedAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;