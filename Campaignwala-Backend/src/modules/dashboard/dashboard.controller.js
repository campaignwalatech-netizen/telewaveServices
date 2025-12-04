const User = require('../users/user.model');
const Lead = require('../leads/leads.model');
const Wallet = require('../wallet/wallet.model');
const Withdrawal = require('../withdrawal/withdrawal.model');
const Query = require('../queries/query.model');

// ==================== ADMIN DASHBOARD ====================

const getAdminDashboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Execute all queries in parallel for better performance
        const [
            // User counts
            totalUsers,
            totalTLs,
            totalActiveUsers,
            activeUsers,
            pendingApprovalUsers,
            holdUsers,
            blockedUsers,
            exUsers,
            adminUsers,
            regularUsers,
            
            // Lead counts
            totalLeads,
            todayLeads,
            pendingLeads,
            assignedLeads,
            completedLeads,
            totalPendingLeads,
            
            // Withdrawal counts
            totalWithdrawals,
            pendingWithdrawals,
            todayWithdrawals,
            
            // Query counts
            openQueries,
            repliedQueries,
            
            // KYC counts
            pendingKYCs,
            approvedKYC,
            
            // Recent activities
            recentUsers,
            recentRegistrations,
            recentLeads,
            
            // Attendance
            presentToday,
            absentToday,
            
            // Platform stats
            platformStats
        ] = await Promise.all([
            // User queries
            User.countDocuments(),
            User.countDocuments({ role: 'TL', isActive: true }),
            User.countDocuments({ isActive: true, isEx: false }),
            User.countDocuments({ status: 'active', isActive: true, isEx: false }),
            User.countDocuments({ status: 'pending_approval' }),
            User.countDocuments({ status: 'hold' }),
            User.countDocuments({ status: 'blocked' }),
            User.countDocuments({ isEx: true }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'user' }),
            
            // Lead queries
            Lead.countDocuments(),
            Lead.countDocuments({ createdAt: { $gte: today } }),
            Lead.countDocuments({ status: 'pending' }),
            Lead.countDocuments({ status: { $in: ['assigned', 'in_progress'] } }),
            Lead.countDocuments({ status: 'completed' }),
            Lead.countDocuments({ status: 'pending' }),
            
            // Withdrawal queries
            Withdrawal.countDocuments({ status: 'approved' }),
            Withdrawal.countDocuments({ status: 'pending' }),
            Withdrawal.countDocuments({ 
                status: 'approved',
                createdAt: { $gte: today, $lt: tomorrow } 
            }),
            
            // Query queries
            Query.countDocuments({ status: 'Open' }),
            Query.countDocuments({ status: 'Replied' }),
            
            // KYC queries
            User.countDocuments({ 'kycDetails.kycStatus': 'pending' }),
            User.countDocuments({ 'kycDetails.kycStatus': 'approved' }),
            
            // Recent activities
            User.find()
                .select('name email role createdAt')
                .sort({ createdAt: -1 })
                .limit(5),
            User.countDocuments({ createdAt: { $gte: weekAgo } }),
            Lead.countDocuments({ createdAt: { $gte: weekAgo } }),
            
            // Attendance queries
            User.countDocuments({
                role: 'user',
                status: 'active',
                'attendance.todayStatus': 'present',
                'attendance.todayMarkedAt': { $gte: today }
            }),
            User.countDocuments({
                role: 'user',
                status: 'active',
                'attendance.todayStatus': 'absent'
            }),
            
            // Platform stats
            Wallet.getPlatformStats ? Wallet.getPlatformStats() : Promise.resolve({ 
                totalBalance: 0, 
                totalEarned: 0, 
                totalWithdrawn: 0 
            })
        ]);

        res.json({
            success: true,
            message: 'Admin dashboard data retrieved successfully',
            data: {
                overview: {
                    totalUsers,
                    totalTLs,
                    totalActiveUsers,
                    totalLeads,
                    totalCompletedLeads: completedLeads,
                    totalPendingLeads,
                    totalWithdrawals,
                    conversionRate: totalLeads > 0 ? (completedLeads / totalLeads * 100).toFixed(2) : 0
                },
                todayStats: {
                    newUsers: await User.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
                    newLeads: todayLeads,
                    withdrawals: todayWithdrawals
                },
                pendingActions: {
                    kycApprovals: pendingKYCs,
                    withdrawalApprovals: pendingWithdrawals
                },
                userStats: {
                    total: totalUsers,
                    active: activeUsers,
                    pendingApproval: pendingApprovalUsers,
                    hold: holdUsers,
                    blocked: blockedUsers,
                    ex: exUsers,
                    roles: {
                        admin: adminUsers,
                        tl: totalTLs,
                        user: regularUsers
                    }
                },
                leadStats: {
                    total: totalLeads,
                    today: todayLeads,
                    pending: pendingLeads,
                    assigned: assignedLeads,
                    completed: completedLeads
                },
                financialStats: {
                    totalBalance: platformStats.totalBalance || 0,
                    totalEarned: platformStats.totalEarned || 0,
                    totalWithdrawn: platformStats.totalWithdrawn || 0,
                    pendingWithdrawals,
                    totalWithdrawals
                },
                kycStats: {
                    pending: pendingKYCs,
                    approved: approvedKYC
                },
                queryStats: {
                    open: openQueries,
                    replied: repliedQueries
                },
                attendanceStats: {
                    presentToday,
                    absentToday
                },
                recentActivities: {
                    registrations: recentRegistrations,
                    leads: recentLeads,
                    recentUsers
                }
            }
        });

    } catch (error) {
        console.error('Get admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get admin dashboard data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== TL DASHBOARD ====================

const getTLDashboard = async (req, res) => {
    try {
        const tlId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Get TL details with team members
        const tl = await User.findById(tlId).populate('teamMembers', 'name email phoneNumber statistics attendance');
        
        if (!tl || tl.role !== 'TL') {
            return res.status(403).json({
                success: false,
                message: 'Only Team Leaders can access TL dashboard'
            });
        }

        const teamMembers = tl.teamMembers || [];
        const teamMemberIds = teamMembers.map(member => member._id);

        // Execute parallel queries for performance
        const [
            teamLeads,
            todayTeamLeads,
            pendingTeamLeads,
            recentTeamLeads,
            recentTeamLeadsDetails
        ] = await Promise.all([
            // All team leads
            Lead.find({ hrUserId: { $in: teamMemberIds } }),
            
            // Today's team leads
            Lead.countDocuments({
                $or: [
                    { hrUserId: { $in: teamMemberIds }, createdAt: { $gte: today, $lt: tomorrow } },
                    { assignedTo: { $in: teamMemberIds }, assignedAt: { $gte: today } }
                ]
            }),
            
            // Pending team leads
            Lead.countDocuments({
                $or: [
                    { hrUserId: { $in: teamMemberIds }, status: 'pending' },
                    { assignedTo: { $in: teamMemberIds }, status: { $in: ['assigned', 'in_progress'] } }
                ]
            }),
            
            // Recent team leads count
            Lead.countDocuments({
                $or: [
                    { hrUserId: { $in: teamMemberIds }, createdAt: { $gte: weekAgo } },
                    { assignedTo: { $in: teamMemberIds }, createdAt: { $gte: weekAgo } }
                ]
            }),
            
            // Recent team leads details for display
            Lead.find({ 
                $or: [
                    { hrUserId: { $in: teamMemberIds } },
                    { assignedTo: { $in: teamMemberIds } }
                ]
            })
            .populate('hrUserId', 'name')
            .sort({ createdAt: -1 })
            .limit(10)
        ]);

        // Calculate team stats
        let teamStats = {
            totalMembers: teamMembers.length,
            activeMembers: 0,
            totalLeads: teamLeads.length,
            completedLeads: 0,
            pendingLeads: 0,
            totalEarnings: 0,
            todayLeads: todayTeamLeads,
            todayEarnings: 0
        };

        // Team attendance (today)
        const presentTeamMembers = teamMembers.filter(member => 
            member.attendance?.todayStatus === 'present' &&
            member.attendance?.todayMarkedAt >= today
        ).length;

        // Process team members and leads
        teamMembers.forEach(member => {
            const stats = member.statistics || {};
            teamStats.totalEarnings += stats.totalEarnings || 0;
            
            if ((stats.totalLeads || 0) > 0) {
                teamStats.activeMembers++;
            }
        });

        teamLeads.forEach(lead => {
            if (lead.status === 'completed') {
                teamStats.completedLeads++;
                // Calculate today's earnings
                if (lead.completedAt >= today && lead.completedAt < tomorrow && lead.amount) {
                    teamStats.todayEarnings += lead.amount;
                }
            }
            if (lead.status === 'pending') teamStats.pendingLeads++;
        });

        // TL's assigned leads
        const tlAssignedLeads = tl.tlDetails?.assignedLeads?.length || 0;

        // Top performers
        const topPerformers = teamMembers
            .map(member => ({
                _id: member._id,
                name: member.name,
                email: member.email,
                phone: member.phoneNumber,
                totalLeads: member.statistics?.totalLeads || 0,
                completedLeads: member.statistics?.completedLeads || 0,
                pendingLeads: member.statistics?.pendingLeads || 0,
                todayLeads: member.statistics?.todaysLeads || 0,
                totalEarnings: member.statistics?.totalEarnings || 0,
                conversionRate: (member.statistics?.totalLeads || 0) > 0 
                    ? ((member.statistics?.completedLeads || 0) / (member.statistics?.totalLeads || 0) * 100).toFixed(2)
                    : 0,
                attendance: member.attendance?.todayStatus || 'absent'
            }))
            .sort((a, b) => b.completedLeads - a.completedLeads)
            .slice(0, 5);

        // Team performance metrics
        const teamPerformance = {
            conversionRate: teamStats.totalLeads > 0 ? (teamStats.completedLeads / teamStats.totalLeads * 100).toFixed(2) : 0,
            averageCompletion: teamStats.completedLeads > 0 ? (teamStats.totalEarnings / teamStats.completedLeads).toFixed(2) : 0
        };

        res.json({
            success: true,
            message: 'TL dashboard data retrieved successfully',
            data: {
                teamStats,
                teamInfo: {
                    size: teamMembers.length,
                    activeMembers: teamStats.activeMembers,
                    presentToday: presentTeamMembers
                },
                leadStats: {
                    total: teamStats.totalLeads,
                    completed: teamStats.completedLeads,
                    pending: teamStats.pendingLeads,
                    today: teamStats.todayLeads,
                    pendingCurrent: pendingTeamLeads,
                    tlAssigned: tlAssignedLeads
                },
                financialStats: {
                    totalEarnings: teamStats.totalEarnings,
                    todayEarnings: teamStats.todayEarnings,
                    averagePerLead: teamStats.totalLeads > 0 ? (teamStats.totalEarnings / teamStats.totalLeads).toFixed(2) : 0
                },
                performance: teamPerformance,
                conversionRate: teamStats.totalLeads > 0 
                    ? (teamStats.completedLeads / teamStats.totalLeads * 100).toFixed(2) 
                    : 0,
                recentActivities: {
                    leads: recentTeamLeads
                },
                topPerformers,
                recentTeamLeads: recentTeamLeadsDetails,
                teamMembers: teamMembers.map(member => ({
                    _id: member._id,
                    name: member.name,
                    email: member.email,
                    phone: member.phoneNumber,
                    attendance: member.attendance?.todayStatus || 'absent',
                    leads: {
                        total: member.statistics?.totalLeads || 0,
                        completed: member.statistics?.completedLeads || 0,
                        pending: member.statistics?.pendingLeads || 0,
                        today: member.statistics?.todaysLeads || 0
                    },
                    earnings: member.statistics?.totalEarnings || 0
                }))
            }
        });

    } catch (error) {
        console.error('Get TL dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get TL dashboard data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== USER DASHBOARD ====================

const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Execute all queries in parallel
        const [
            user,
            userLeads,
            userWallet,
            recentLeads,
            pendingWithdrawals,
            
            // New queries from updated version
            todaysLeads,
            yesterdaysPending,
            inProgressLeads,
            completedToday,
            earningsAggregation,
            recentCompleted,
            wallet
        ] = await Promise.all([
            // User details
            User.findById(userId)
                .select('name email phoneNumber role attendance statistics leadDistribution kycDetails'),
            
            // All user leads
            Lead.find({ hrUserId: userId }),
            
            // Wallet (fallback)
            Wallet.findOne({ userId }) || Promise.resolve({ balance: 0, totalEarned: 0, totalWithdrawn: 0 }),
            
            // Recent leads (for old version)
            Lead.find({ hrUserId: userId })
                .sort({ createdAt: -1 })
                .limit(5),
            
            // Pending withdrawals
            Withdrawal.countDocuments({ userId, status: 'pending' }),
            
            // New version queries
            // Today's leads
            Lead.countDocuments({
                $or: [
                    { hrUserId: userId, createdAt: { $gte: today } },
                    { assignedTo: userId, assignedAt: { $gte: today }, isTodayLead: true }
                ]
            }),
            
            // Yesterday's pending leads
            Lead.countDocuments({
                $or: [
                    { hrUserId: userId, createdAt: { $gte: yesterday, $lt: today }, status: 'pending' },
                    { assignedTo: userId, assignedAt: { $gte: yesterday, $lt: today }, 
                      status: { $in: ['assigned', 'in_progress'] }, isYesterdayPending: true }
                ]
            }),
            
            // In progress leads
            Lead.countDocuments({
                $or: [
                    { hrUserId: userId, status: 'in_progress' },
                    { assignedTo: userId, status: 'in_progress' }
                ]
            }),
            
            // Completed today
            Lead.countDocuments({
                $or: [
                    { hrUserId: userId, status: 'completed', completedAt: { $gte: today } },
                    { assignedTo: userId, status: 'completed', completedAt: { $gte: today } }
                ]
            }),
            
            // Earnings aggregation
            Lead.aggregate([
                {
                    $match: {
                        $or: [
                            { hrUserId: userId },
                            { assignedTo: userId }
                        ],
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalEarnings: { $sum: { $add: ['$commission1', '$commission2', '$amount'] } }
                    }
                }
            ]),
            
            // Recent completed leads
            Lead.find({
                $or: [
                    { hrUserId: userId },
                    { assignedTo: userId }
                ],
                status: 'completed'
            })
            .populate('offerId', 'name category image')
            .sort({ completedAt: -1 })
            .limit(5),
            
            // Wallet (new version)
            Wallet.findOne({ userId }).then(w => {
                if (!w) {
                    const newWallet = new Wallet({ userId });
                    return newWallet.save();
                }
                return w;
            })
        ]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate stats from old version
        const oldStats = {
            totalLeads: userLeads.length,
            completedLeads: userLeads.filter(lead => lead.status === 'completed').length,
            pendingLeads: userLeads.filter(lead => lead.status === 'pending').length,
            rejectedLeads: userLeads.filter(lead => lead.status === 'rejected').length,
            totalEarnings: userWallet.totalEarned || 0,
            currentBalance: userWallet.balance || 0,
            conversionRate: userLeads.length > 0 
                ? (userLeads.filter(lead => lead.status === 'completed').length / userLeads.length * 100).toFixed(2) 
                : 0,
            pendingWithdrawals
        };

        // Calculate stats from new version
        const totalEarnings = earningsAggregation[0]?.totalEarnings || 0;
        const dailyQuota = user.leadDistribution?.dailyLeadQuota || 0;
        const todaysLeadCount = user.leadDistribution?.todaysLeadCount || 0;
        const quotaProgress = dailyQuota > 0 ? (todaysLeadCount / dailyQuota * 100) : 0;

        // Today's stats (old version)
        const todayLeadsOld = userLeads.filter(lead => 
            lead.createdAt >= today && lead.createdAt < tomorrow
        ).length;

        // KYC status
        const kycStatus = user.kycDetails?.kycStatus || 'not_submitted';

        res.json({
            success: true,
            message: 'User dashboard data retrieved successfully',
            data: {
                // Old version structure
                overview: oldStats,
                todayStats: {
                    leads: todayLeadsOld
                },
                recentLeads,
                wallet: {
                    balance: userWallet.balance || 0,
                    totalEarned: userWallet.totalEarned || 0,
                    totalWithdrawn: userWallet.totalWithdrawn || 0
                },
                
                // New version structure
                userInfo: {
                    name: user.name,
                    email: user.email,
                    phone: user.phoneNumber,
                    role: user.role,
                    kycStatus,
                    attendance: {
                        today: user.attendance?.todayStatus || 'absent',
                        streak: user.attendance?.streak || 0,
                        monthly: user.attendance?.monthlyStats || { present: 0, absent: 0, late: 0 }
                    }
                },
                leadStats: {
                    todaysLeads,
                    yesterdaysPending,
                    inProgress: inProgressLeads,
                    completedToday,
                    totalCompleted: user.statistics?.completedLeads || 0,
                    totalEarnings,
                    conversionRate: user.statistics?.conversionRate || 0
                },
                walletNew: {
                    currentBalance: wallet.balance,
                    totalEarned: wallet.totalEarned,
                    totalWithdrawn: wallet.totalWithdrawn,
                    availableBalance: wallet.availableBalance
                },
                dailyGoals: {
                    quota: dailyQuota,
                    completed: todaysLeadCount,
                    progress: quotaProgress,
                    remaining: Math.max(0, dailyQuota - todaysLeadCount)
                },
                recentCompleted: recentCompleted.map(lead => ({
                    leadId: lead.leadId || lead._id,
                    offerName: lead.offerId?.name,
                    category: lead.offerId?.category,
                    completedAt: lead.completedAt,
                    earnings: (lead.commission1 || 0) + (lead.commission2 || lead.amount || 0)
                }))
            }
        });

    } catch (error) {
        console.error('Get user dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user dashboard data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAdminDashboard,
    getTLDashboard,
    getUserDashboard
};