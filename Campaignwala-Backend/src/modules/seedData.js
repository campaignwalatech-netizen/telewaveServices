const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection without deprecated options
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/campaignwala', {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Import models
const User = require('./users/user.model');
const Category = require('./categories/categories.model');
const Offer = require('./offers/offers.model');
const Lead = require('./leads/leads.model');
const AdminLog = require('./adminLogs/adminLog.model');
const Notification = require('./notifications/notification.model');
const Query = require('./queries/query.model');
// const Slide = require('./slides/slides.models');
const Wallet = require('./wallet/wallet.model');
const Withdrawal = require('./withdrawal/withdrawal.model');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    // await Promise.all([
    //   User.deleteMany({}),
    //   Category.deleteMany({}),
    //   Offer.deleteMany({}),
    //   Lead.deleteMany({}),
    //   AdminLog.deleteMany({}),
    //   Notification.deleteMany({}),
    //   Query.deleteMany({}),
    //   Slide.deleteMany({}),
    //   Wallet.deleteMany({}),
    //   Withdrawal.deleteMany({})
    // ]);

    console.log('✅ Cleared existing data');

    // Create demo users one by one to avoid timeout
    console.log('Creating users...');
    
    const demoUsers = [
      {
        phoneNumber: "9876543210",
        name: "Admin User",
        email: "admin@demo.com",
        password: await bcrypt.hash("admin123", 12),
        role: "admin",
        isVerified: true,
        isActive: true,
        isEx: false,
        firstName: "Admin",
        lastName: "User",
        gender: "Male",
        address1: "123 Admin Street",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400001",
        country: "India",
        kycDetails: {
          panNumber: "ABCDE1234F",
          aadhaarNumber: "123456789012",
          panImage: "/uploads/pan_admin.jpg",
          aadhaarImage: "/uploads/aadhaar_admin.jpg",
          kycStatus: "approved",
          kycSubmittedAt: new Date('2024-01-15'),
          kycApprovedAt: new Date('2024-01-20')
        },
        bankDetails: {
          bankName: "State Bank of India",
          accountHolderName: "Admin User",
          accountNumber: "12345678901",
          ifscCode: "SBIN0000123",
          branchAddress: "SBI Main Branch, Mumbai",
          upiId: "admin.user@oksbi",
          isVerified: true,
          verifiedAt: new Date('2024-01-25')
        },
        statistics: {
          totalLeads: 150,
          completedLeads: 120,
          pendingLeads: 15,
          rejectedLeads: 15,
          totalEarnings: 150000,
          currentBalance: 45000,
          totalWithdrawals: 105000,
          lastLeadDate: new Date('2024-11-25'),
          conversionRate: 80
        },
        performance: {
          rating: 4.5,
          completedTasks: 120,
          pendingTasks: 5,
          averageCompletionTime: 24
        },
        profile: {
          avatar: "/uploads/avatar_admin.jpg",
          bio: "Experienced admin with 5+ years in digital marketing",
          skills: ["Team Management", "Analytics", "Strategy", "Sales"],
          experience: 5,
          education: "MBA in Marketing"
        },
        notifications: {
          email: true,
          sms: true,
          push: true,
          leadUpdates: true,
          paymentUpdates: true,
          promotional: false
        },
        security: {
          twoFactorEnabled: true,
          lastPasswordChange: new Date('2024-11-01'),
          loginAttempts: 0
        },
        metadata: {
          signupSource: "web",
          referrer: "",
          campaign: "organic",
          deviceInfo: {
            browser: "Chrome",
            os: "Windows",
            device: "Desktop"
          }
        },
        activeSession: "demo_admin_session_token",
        sessionDevice: "Chrome/Windows/Desktop",
        sessionIP: "192.168.1.100",
        lastActivity: new Date(),
        lastOtpSent: new Date('2024-11-25')
      },
      {
        phoneNumber: "9876543211",
        name: "Team Lead User",
        email: "tl@demo.com",
        password: await bcrypt.hash("tl123456", 12),
        role: "TL",
        isVerified: true,
        isActive: true,
        isEx: false,
        firstName: "Team",
        lastName: "Lead",
        gender: "Female",
        address1: "456 TL Avenue",
        city: "Delhi",
        state: "Delhi",
        zip: "110001",
        country: "India",
        kycDetails: {
          panNumber: "FGHIJ5678K",
          aadhaarNumber: "987654321098",
          panImage: "/uploads/pan_tl.jpg",
          aadhaarImage: "/uploads/aadhaar_tl.jpg",
          kycStatus: "approved",
          kycSubmittedAt: new Date('2024-02-10'),
          kycApprovedAt: new Date('2024-02-15')
        },
        bankDetails: {
          bankName: "HDFC Bank",
          accountHolderName: "Team Lead",
          accountNumber: "23456789012",
          ifscCode: "HDFC0000456",
          branchAddress: "HDFC Bank, Connaught Place, Delhi",
          upiId: "team.lead@okhdfc",
          isVerified: true,
          verifiedAt: new Date('2024-02-20')
        },
        statistics: {
          totalLeads: 80,
          completedLeads: 65,
          pendingLeads: 10,
          rejectedLeads: 5,
          totalEarnings: 80000,
          currentBalance: 20000,
          totalWithdrawals: 60000,
          lastLeadDate: new Date('2024-11-24'),
          conversionRate: 81.25
        },
        performance: {
          rating: 4.2,
          completedTasks: 65,
          pendingTasks: 3,
          averageCompletionTime: 36
        },
        profile: {
          avatar: "/uploads/avatar_tl.jpg",
          bio: "Team Lead specializing in financial products",
          skills: ["Leadership", "Training", "Sales", "Communication"],
          experience: 3,
          education: "B.Com"
        },
        metadata: {
          signupSource: "referral",
          referrer: "admin@demo.com",
          campaign: "referral_program"
        }
      },
      {
        phoneNumber: "9876543212",
        name: "Regular User",
        email: "user@demo.com",
        password: await bcrypt.hash("user1234", 12),
        role: "user",
        isVerified: true,
        isActive: true,
        isEx: false,
        firstName: "Regular",
        lastName: "User",
        dob: new Date('1995-05-15'),
        gender: "Male",
        address1: "789 User Road",
        city: "Bangalore",
        state: "Karnataka",
        zip: "560001",
        country: "India",
        kycDetails: {
          panNumber: "KLMNO9012P",
          aadhaarNumber: "456789012345",
          panImage: "/uploads/pan_user.jpg",
          aadhaarImage: "/uploads/aadhaar_user.jpg",
          kycStatus: "approved",
          kycSubmittedAt: new Date('2024-03-05'),
          kycApprovedAt: new Date('2024-03-12')
        },
        bankDetails: {
          bankName: "ICICI Bank",
          accountHolderName: "Regular User",
          accountNumber: "34567890123",
          ifscCode: "ICIC0000789",
          branchAddress: "ICICI Bank, MG Road, Bangalore",
          upiId: "regular.user@okicici",
          isVerified: true,
          verifiedAt: new Date('2024-03-18')
        },
        statistics: {
          totalLeads: 45,
          completedLeads: 35,
          pendingLeads: 8,
          rejectedLeads: 2,
          totalEarnings: 45000,
          currentBalance: 12000,
          totalWithdrawals: 33000,
          lastLeadDate: new Date('2024-11-23'),
          conversionRate: 77.78
        },
        performance: {
          rating: 4.0,
          completedTasks: 35,
          pendingTasks: 2,
          averageCompletionTime: 48
        },
        profile: {
          avatar: "/uploads/avatar_user.jpg",
          bio: "Digital marketer focused on credit card promotions",
          skills: ["Digital Marketing", "Social Media", "Sales"],
          experience: 2,
          education: "BBA"
        },
        metadata: {
          signupSource: "social_media",
          referrer: "",
          campaign: "facebook_ads"
        }
      }
    ];

    // Insert users one by one
    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    console.log(`✅ Created ${createdUsers.length} users`);

    // Create categories
    console.log('Creating categories...');
    const categories = [
      {
        name: "Credit Card",
        description: "Various credit card offers from top banks",
        icon: "credit-card",
        iconImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDRINEMyLjg5IDQgMi4wMSA0Ljg5IDIuMDEgNkw0IDE4QzQgMTkuMTEgNC44OSAyMCA2IDIwSDIwQzIxLjExIDIwIDIyIDE5LjExIDIyIDE4VjZDMjIgNC44OSAyMS4xMSA0IDIwIDRaTTIwIDE4SDZWMTBIMjBWMThaTTIwIDZINlY4SDIwVjZaIiBmaWxsPSIjMzMzMzMzIi8+Cjwvc3ZnPgo=",
        status: "active",
        count: 45
      },
      {
        name: "Personal Loan",
        description: "Instant personal loans with quick approval",
        icon: "loan",
        iconImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMNCA1VjExQzQgMTYuNTUgNy44NCAyMS43NCAxMiAyM0MxNi4xNiAyMS43NCAyMCAxNi41NSAyMCAxMVY1TDEyIDJaTTEyIDQuMTdMMTguMTUgNi4xTDEyIDcuODJMNS44NSA2LjFMMTIgNC4xN1pNMTIgOUMyMCA5IDIwIDE1IDIwIDE1QzIwIDE1IDE2LjY0IDE2Ljg2IDEyIDE2Ljg2QzcuMzYgMTYuODYgNCAxNSA0IDE1QzQgMTUgNCA5IDEyIDlaIiBmaWxsPSIjMzMzMzMzIi8+Cjwvc3ZnPgo=",
        status: "active",
        count: 23
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create offers
    console.log('Creating offers...');
    const offers = [
      {
        name: "SBI Simply Click Credit Card",
        category: "Credit Card",
        description: "Get amazing rewards on online spends with SBI Simply Click Credit Card",
        latestStage: "Completed",
        commission1: "699",
        commission1Comment: "On successful card approval",
        commission2: "1299",
        commission2Comment: "On first transaction",
        link: "https://tracking.example.com/click?aff_id=605&offer_id=602&aff_sub1=demo",
        image: "/uploads/sbi_card.jpg",
        videoLink: "https://youtu.be/demo-sbi-card",
        termsAndConditions: "Minimum income requirement: ₹25,000 per month. Card approval subject to bank's discretion.",
        isApproved: true,
        approvedBy: createdUsers[0]._id,
        approvedAt: new Date('2024-11-20')
      },
      {
        name: "HDFC Personal Loan",
        category: "Personal Loan",
        description: "Instant personal loan up to ₹40 Lakhs with quick approval",
        latestStage: "Pending",
        commission1: "899",
        commission1Comment: "On loan application submission",
        commission2: "1999",
        commission2Comment: "On loan disbursement",
        link: "https://tracking.example.com/click?aff_id=606&offer_id=603&aff_sub1=demo",
        image: "/uploads/hdfc_loan.jpg",
        videoLink: "https://youtu.be/demo-hdfc-loan",
        termsAndConditions: "Interest rates start from 10.5% p.a. Processing fees applicable.",
        isApproved: true,
        approvedBy: createdUsers[0]._id,
        approvedAt: new Date('2024-11-18')
      }
    ];

    const createdOffers = await Offer.insertMany(offers);
    console.log(`✅ Created ${createdOffers.length} offers`);

    // Create leads
    console.log('Creating leads...');
    const leads = [
      {
        offerId: createdOffers[0]._id,
        offerName: "SBI Simply Click Credit Card",
        category: "Credit Card",
        hrUserId: createdUsers[2]._id,
        hrName: "Regular User",
        hrContact: "9876543212",
        customerName: "Amit Sharma",
        customerContact: "9876543220",
        status: "completed",
        offer: "699 + 1299",
        commission1: 699,
        commission2: 1299,
        commission1Paid: true,
        commission2Paid: true,
        sharedLink: "https://demo.link/sbi-card-001",
        remarks: "Customer satisfied with card features",
        rejectionReason: ""
      },
      {
        offerId: createdOffers[1]._id,
        offerName: "HDFC Personal Loan",
        category: "Personal Loan",
        hrUserId: createdUsers[1]._id,
        hrName: "Team Lead",
        hrContact: "9876543211",
        customerName: "Priya Patel",
        customerContact: "9876543221",
        status: "approved",
        offer: "899 + 1999",
        commission1: 899,
        commission2: 1999,
        commission1Paid: true,
        commission2Paid: false,
        sharedLink: "https://demo.link/hdfc-loan-001",
        remarks: "Loan approved, waiting for disbursement",
        rejectionReason: ""
      }
    ];

    const createdLeads = await Lead.insertMany(leads);
    console.log(`✅ Created ${createdLeads.length} leads`);

    // Create wallets
    console.log('Creating wallets...');
    const wallets = createdUsers.map(user => ({
      userId: user._id,
      balance: user.statistics.currentBalance,
      totalEarned: user.statistics.totalEarnings,
      totalWithdrawn: user.statistics.totalWithdrawals,
      transactions: [
        {
          type: 'credit',
          amount: user.statistics.totalEarnings,
          description: 'Lead commissions',
          createdAt: new Date()
        }
      ]
    }));

    await Wallet.insertMany(wallets);
    console.log(`✅ Created ${wallets.length} wallets`);

    // Create admin logs
    console.log('Creating admin logs...');
    const adminLogs = [
      {
        adminId: createdUsers[0]._id,
        adminName: "Admin User",
        adminRole: "admin",
        action: "Approved SBI Simply Click Credit Card offer",
        actionType: "approve",
        module: "offers",
        severity: "success",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: "Offer approved successfully",
        targetId: createdOffers[0]._id.toString(),
        targetType: "Offer",
        status: "success"
      }
    ];

    await AdminLog.insertMany(adminLogs);
    console.log(`✅ Created ${adminLogs.length} admin logs`);

    // Create notifications
    console.log('Creating notifications...');
    const notifications = [
      {
        type: "profile",
        title: "Complete Your Profile",
        message: "Complete your profile to unlock all features and get better opportunities.",
        recipients: [createdUsers[2]._id.toString()],
        recipientCount: 1,
        status: "sent",
        deliveryStats: {
          sent: 1,
          delivered: 1,
          failed: 0
        }
      }
    ];

    await Notification.insertMany(notifications);
    console.log(`✅ Created ${notifications.length} notifications`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('👨‍💼 Admin: admin@demo.com / admin123');
    console.log('👩‍💼 Team Lead: tl@demo.com / tl123456');
    console.log('👤 Regular User: user@demo.com / user1234');
    console.log('\n📊 Created Data Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`📁 Categories: ${createdCategories.length}`);
    console.log(`🎯 Offers: ${createdOffers.length}`);
    console.log(`📈 Leads: ${createdLeads.length}`);
    console.log(`💰 Wallets: ${wallets.length}`);
    console.log(`📝 Admin Logs: ${adminLogs.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n👋 Seed process interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

seedData();