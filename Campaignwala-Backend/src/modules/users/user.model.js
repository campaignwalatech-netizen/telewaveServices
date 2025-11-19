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
        }
    }
}, {
    timestamps: true
});

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

// Remove sensitive fields from JSON output
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
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;