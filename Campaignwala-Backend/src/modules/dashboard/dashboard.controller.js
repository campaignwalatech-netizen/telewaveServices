const User = require('../users/user.model');
const Lead = require('../leads/leads.model');
const Wallet = require('../wallet/wallet.model');
const Withdrawal = require('../withdrawal/withdrawal.model');

// Admin Dashboard Stats
const getAdminDashboard = async (req, res) => {
    try {
        const [
            totalUsers,
            totalTLs,
            totalActiveUsers,
            totalLeads,
            totalCompletedLeads,
            totalPendingLeads,
            totalWithdrawals,
            recentUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'TL', isActive: true }),
            User.countDocuments({ isActive: true, isEx: false }),
            Lead.countDocuments(),
            Lead.countDocuments({ status: 'completed' }),
            Lead.countDocuments({ status: 'pending' }),
            Withdrawal.countDocuments({ status: 'approved' }),
            User.find()
                .select('name email role createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            todayUsers,
            todayLeads,
            todayWithdrawals
        ] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            Lead.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            Withdrawal.countDocuments({ 
                status: 'approved',
                createdAt: { $gte: today, $lt: tomorrow } 
            })
        ]);

        // Get pending actions
        const pendingKYCs = await User.countDocuments({ 'kycDetails.kycStatus': 'pending' });
        const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            message: 'Admin dashboard data retrieved successfully',
            data: {
                overview: {
                    totalUsers,
                    totalTLs,
                    totalActiveUsers,
                    totalLeads,
                    totalCompletedLeads,
                    totalPendingLeads,
                    totalWithdrawals,
                    conversionRate: totalLeads > 0 ? (totalCompletedLeads / totalLeads * 100).toFixed(2) : 0
                },
                todayStats: {
                    newUsers: todayUsers,
                    newLeads: todayLeads,
                    withdrawals: todayWithdrawals
                },
                pendingActions: {
                    kycApprovals: pendingKYCs,
                    withdrawalApprovals: pendingWithdrawals
                },
                recentUsers
            }
        });

    } catch (error) {
        console.error('Get admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get admin dashboard data',
            error: error.message
        });
    }
};

// TL Dashboard Stats
const getTLDashboard = async (req, res) => {
    try {
        const tlId = req.user._id;

        // Get team members
        const teamMembers = await User.find({ 
            reportingTo: tlId,
            role: 'user',
            isActive: true 
        }).select('name email phoneNumber statistics');

        // Get team leads
        const teamMemberIds = teamMembers.map(member => member._id);
        const teamLeads = await Lead.find({ hrUserId: { $in: teamMemberIds } });

        // Calculate team stats
        let teamStats = {
            totalMembers: teamMembers.length,
            activeMembers: 0,
            totalLeads: teamLeads.length,
            completedLeads: 0,
            pendingLeads: 0,
            totalEarnings: 0,
            todayLeads: 0,
            todayEarnings: 0
        };

        // Today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        teamMembers.forEach(member => {
            const stats = member.statistics || {};
            teamStats.totalEarnings += stats.totalEarnings || 0;
            
            if ((stats.totalLeads || 0) > 0) {
                teamStats.activeMembers++;
            }
        });

        teamLeads.forEach(lead => {
            if (lead.status === 'completed') teamStats.completedLeads++;
            if (lead.status === 'pending') teamStats.pendingLeads++;
            
            if (lead.createdAt >= today && lead.createdAt < tomorrow) {
                teamStats.todayLeads++;
            }
            
            // Calculate today's earnings (assuming lead has amount field)
            if (lead.status === 'completed' && lead.amount) {
                teamStats.todayEarnings += lead.amount;
            }
        });

        // Get top performers
        const topPerformers = teamMembers
            .map(member => ({
                _id: member._id,
                name: member.name,
                email: member.email,
                totalLeads: member.statistics?.totalLeads || 0,
                completedLeads: member.statistics?.completedLeads || 0,
                totalEarnings: member.statistics?.totalEarnings || 0,
                conversionRate: (member.statistics?.totalLeads || 0) > 0 
                    ? ((member.statistics?.completedLeads || 0) / (member.statistics?.totalLeads || 0) * 100).toFixed(2)
                    : 0
            }))
            .sort((a, b) => b.completedLeads - a.completedLeads)
            .slice(0, 5);

        // Get recent team activity
        const recentTeamLeads = await Lead.find({ 
            hrUserId: { $in: teamMemberIds } 
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('hrUserId', 'name');

        res.json({
            success: true,
            message: 'TL dashboard data retrieved successfully',
            data: {
                teamStats,
                topPerformers,
                recentTeamLeads,
                conversionRate: teamStats.totalLeads > 0 
                    ? (teamStats.completedLeads / teamStats.totalLeads * 100).toFixed(2) 
                    : 0
            }
        });

    } catch (error) {
        console.error('Get TL dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get TL dashboard data',
            error: error.message
        });
    }
};

// User Dashboard Stats
const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        const [
            userLeads,
            userWallet,
            recentLeads,
            pendingWithdrawals
        ] = await Promise.all([
            Lead.find({ hrUserId: userId }),
            Wallet.findOne({ userId }) || { balance: 0, totalEarned: 0, totalWithdrawn: 0 },
            Lead.find({ hrUserId: userId })
                .sort({ createdAt: -1 })
                .limit(5),
            Withdrawal.find({ 
                userId, 
                status: 'pending' 
            }).countDocuments()
        ]);

        const stats = {
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

        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayLeads = userLeads.filter(lead => 
            lead.createdAt >= today && lead.createdAt < tomorrow
        ).length;

        res.json({
            success: true,
            message: 'User dashboard data retrieved successfully',
            data: {
                overview: stats,
                todayStats: {
                    leads: todayLeads
                },
                recentLeads,
                wallet: {
                    balance: userWallet.balance || 0,
                    totalEarned: userWallet.totalEarned || 0,
                    totalWithdrawn: userWallet.totalWithdrawn || 0
                }
            }
        });

    } catch (error) {
        console.error('Get user dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user dashboard data',
            error: error.message
        });
    }
};

module.exports = {
    getAdminDashboard,
    getTLDashboard,
    getUserDashboard
};