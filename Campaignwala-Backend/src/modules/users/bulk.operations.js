const DataDistribution = require('./data.distribute');
const User = require('./user.model');

class BulkDataOperations {
    
    /**
     * Add bulk data with names and contacts
     */
    static async addBulkData(dataArray, adminId, batchName = null) {
        try {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            const batchNumber = batchName || `BATCH_${timestamp}_${random}`;
            
            const validatedData = dataArray.map((item, index) => {
                if (!item.name || !item.contact) {
                    throw new Error(`Invalid data at index ${index}: Name and contact are required`);
                }
                
                if (!/^[0-9]{10}$/.test(item.contact)) {
                    throw new Error(`Invalid contact at index ${index}: Must be 10 digits`);
                }
                
                return {
                    name: item.name.trim(),
                    contact: item.contact.trim(),
                    batchNumber: batchNumber,
                    assignedBy: adminId,
                    distributionStatus: 'pending'
                };
            });
            
            const result = await DataDistribution.insertMany(validatedData);
            
            return {
                success: true,
                batchNumber: batchNumber,
                count: result.length,
                message: `Successfully added ${result.length} data records in batch ${batchNumber}`
            };
            
        } catch (error) {
            console.error('Error adding bulk data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Assign bulk data to TL
     */
    static async assignDataToTL(count, tlId, adminId) {
        try {
            const tl = await User.findById(tlId);
            if (!tl || tl.role !== 'TL' || tl.status !== 'active') {
                throw new Error('Invalid or inactive TL');
            }
            
            const pendingData = await DataDistribution.find({ 
                distributionStatus: 'pending',
                isActive: true 
            }).limit(count);
            
            if (pendingData.length === 0) {
                throw new Error('No pending data available for assignment');
            }
            
            const dataIds = pendingData.map(data => data._id);
            const result = await DataDistribution.assignBulkData(dataIds, tlId, 'tl', adminId);
            
            return {
                success: true,
                assignedCount: result.nModified,
                tlName: tl.name,
                tlEmail: tl.email,
                message: `Assigned ${result.nModified} data records to TL: ${tl.name}`
            };
            
        } catch (error) {
            console.error('Error assigning data to TL:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Assign bulk data directly to user
     */
    static async assignDataToUser(count, userId, adminId) {
        try {
            const user = await User.findById(userId);
            if (!user || user.role !== 'user' || user.status !== 'active') {
                throw new Error('Invalid or inactive user');
            }
            
            if (user.attendance.todayStatus !== 'present') {
                throw new Error('User is not present today');
            }
            
            const pendingData = await DataDistribution.find({ 
                distributionStatus: 'pending',
                isActive: true 
            }).limit(count);
            
            if (pendingData.length === 0) {
                throw new Error('No pending data available for assignment');
            }
            
            const dataIds = pendingData.map(data => data._id);
            const result = await DataDistribution.assignBulkData(dataIds, userId, 'direct_user', adminId);
            
            return {
                success: true,
                assignedCount: result.nModified,
                userName: user.name,
                message: `Assigned ${result.nModified} data records to user: ${user.name}`
            };
            
        } catch (error) {
            console.error('Error assigning data to user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * TL distributes data to team members
     */
    static async tlDistributeDataToTeam(tlId, dataIds, teamMemberIds, distributionMethod = 'manual') {
        try {
            const tl = await User.findById(tlId);
            if (!tl || tl.role !== 'TL') {
                throw new Error('Invalid TL');
            }
            
            // Verify all team members belong to this TL
            const invalidMembers = teamMemberIds.filter(memberId => 
                !tl.teamMembers.includes(memberId)
            );
            
            if (invalidMembers.length > 0) {
                throw new Error('Some users are not in your team');
            }
            
            const results = [];
            const errors = [];
            
            // Distribute each data item
            for (const dataId of dataIds) {
                try {
                    const data = await DataDistribution.findById(dataId);
                    
                    if (!data) {
                        errors.push(`Data ${dataId} not found`);
                        continue;
                    }
                    
                    // Check if data belongs to this TL
                    if (data.assignedTo.toString() !== tlId.toString() || data.assignedType !== 'tl') {
                        errors.push(`Data ${dataId} is not assigned to you`);
                        continue;
                    }
                    
                    // Distribute to each team member
                    for (const teamMemberId of teamMemberIds) {
                        await data.distributeToTeamMember(teamMemberId, tlId, distributionMethod);
                    }
                    
                    results.push({
                        dataId: dataId,
                        distributedTo: teamMemberIds.length,
                        success: true
                    });
                    
                } catch (error) {
                    errors.push(`Data ${dataId}: ${error.message}`);
                }
            }
            
            return {
                success: errors.length === 0,
                distributedCount: results.length,
                totalDistributions: results.reduce((sum, r) => sum + r.distributedTo, 0),
                results: results,
                errors: errors.length > 0 ? errors : undefined
            };
            
        } catch (error) {
            console.error('Error in TL data distribution:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * TL withdraws data from team members
     */
    static async tlWithdrawDataFromTeam(tlId, dataIds, teamMemberIds, reason = '') {
        try {
            const tl = await User.findById(tlId);
            if (!tl || tl.role !== 'TL') {
                throw new Error('Invalid TL');
            }
            
            const results = [];
            const errors = [];
            
            // Withdraw each data item
            for (const dataId of dataIds) {
                try {
                    const data = await DataDistribution.findById(dataId);
                    
                    if (!data) {
                        errors.push(`Data ${dataId} not found`);
                        continue;
                    }
                    
                    // Check if data belongs to this TL
                    if (data.assignedTo.toString() !== tlId.toString() || data.assignedType !== 'tl') {
                        errors.push(`Data ${dataId} is not assigned to you`);
                        continue;
                    }
                    
                    // Withdraw from each team member
                    for (const teamMemberId of teamMemberIds) {
                        await data.withdrawFromTeamMember(teamMemberId, tlId, reason);
                    }
                    
                    results.push({
                        dataId: dataId,
                        withdrawnFrom: teamMemberIds.length,
                        success: true
                    });
                    
                } catch (error) {
                    errors.push(`Data ${dataId}: ${error.message}`);
                }
            }
            
            return {
                success: errors.length === 0,
                withdrawnCount: results.length,
                totalWithdrawals: results.reduce((sum, r) => sum + r.withdrawnFrom, 0),
                results: results,
                errors: errors.length > 0 ? errors : undefined
            };
            
        } catch (error) {
            console.error('Error in TL data withdrawal:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get TL data statistics
     */
    static async getTLStatistics(tlId) {
        try {
            const tl = await User.findById(tlId);
            if (!tl || tl.role !== 'TL') {
                throw new Error('Invalid TL');
            }
            
            const dataStats = await DataDistribution.getTLDataStats(tlId);
            const teamStats = await tl.getTeamDataStats();
            
            return {
                success: true,
                tlInfo: {
                    name: tl.name,
                    email: tl.email,
                    teamSize: tl.teamMembers.length
                },
                dataStatistics: dataStats,
                teamStatistics: teamStats
            };
            
        } catch (error) {
            console.error('Error getting TL statistics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get available pending data count
     */
    static async getPendingDataCount() {
        try {
            return await DataDistribution.countDocuments({
                distributionStatus: 'pending',
                isActive: true
            });
        } catch (error) {
            console.error('Error getting pending data count:', error);
            throw error;
        }
    }
    
    /**
     * Get batch statistics
     */
    static async getBatchStatistics(batchNumber) {
        try {
            return await DataDistribution.getBatchStats(batchNumber);
        } catch (error) {
            console.error('Error getting batch statistics:', error);
            throw error;
        }
    }
}

module.exports = BulkDataOperations;