const DataDistribution = require('../users/data.distribute');
console.log('DataDistribution schema assignedType enum:', DataDistribution.schema.path('assignedType').enumValues);
const BulkDataOperations = require('../users/bulk.operations');
const User = require('../users/user.model');


async function updateUserStatistics(userId, oldStatus, newStatus) {
    try {
        const User = mongoose.model('User');
        const updateObj = {};
        
        // Decrement old status
        if (oldStatus === 'pending') {
            updateObj.$inc = { ...updateObj.$inc, 'statistics.pendingLeads': -1 };
        } else if (oldStatus === 'contacted') {
            updateObj.$inc = { ...updateObj.$inc, 'statistics.contactedLeads': -1 };
        }
        
        // Increment new status
        if (newStatus === 'pending') {
            updateObj.$inc = { ...updateObj.$inc, 'statistics.pendingLeads': 1 };
        } else if (newStatus === 'contacted') {
            updateObj.$inc = { ...updateObj.$inc, 'statistics.contactedLeads': 1 };
        } else if (newStatus === 'converted') {
            updateObj.$inc = { ...updateObj.$inc, 'statistics.convertedLeads': 1 };
        } else if (newStatus === 'rejected') {
            updateObj.$inc = { ...updateObj.$inc, 'statistics.rejectedLeads': 1 };
        } else if (newStatus === 'not_reachable') {
            updateObj.$inc = { ...updateObj.$inc, 'statistics.notReachableLeads': 1 };
        }
        
        // Update today's counts
        updateObj.$inc = { 
            ...updateObj.$inc,
            'leadDistribution.todaysPendingLeads': (newStatus === 'pending' ? 1 : oldStatus === 'pending' ? -1 : 0),
            'leadDistribution.todaysCalledLeads': (newStatus === 'contacted' ? 1 : oldStatus === 'contacted' ? -1 : 0),
            'leadDistribution.todaysConvertedLeads': (newStatus === 'converted' ? 1 : 0)
        };
        
        if (updateObj.$inc) {
            await User.findByIdAndUpdate(userId, updateObj);
        }
    } catch (error) {
        console.error('Error updating user statistics:', error);
    }
}

class DataController {
    
    // ==================== ADMIN CONTROLLERS ====================
    
    /**
     * Add bulk data (Admin only)
     */
    static async addBulkData(req, res) {
        try {
            const { dataArray, batchName } = req.body;
            const adminId = req.user._id;
            
            if (!Array.isArray(dataArray) || dataArray.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Data array is required and must not be empty'
                });
            }
            
            const result = await BulkDataOperations.addBulkData(dataArray, adminId, batchName);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Assign data to TL (Admin only)
     */
    static async assignToTL(req, res) {
        try {
            const { count, tlId } = req.body;
            const adminId = req.user._id;
            
            if (!count || !tlId) {
                return res.status(400).json({
                    success: false,
                    error: 'Count and TL ID are required'
                });
            }
            
            if (count <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Count must be greater than 0'
                });
            }
            
            const result = await BulkDataOperations.assignDataToTL(count, tlId, adminId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Assign data directly to user (Admin only)
     */
    static async assignToUser(req, res) {
        try {
            const { count, userId } = req.body;
            const adminId = req.user._id;
            
            if (!count || !userId) {
                return res.status(400).json({
                    success: false,
                    error: 'Count and User ID are required'
                });
            }
            
            const result = await BulkDataOperations.assignDataToUser(count, userId, adminId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get all pending data (Admin only)
     */
    static async getPendingData(req, res) {
        try {
            const { page = 1, limit = 50, batchNumber } = req.query;
            const skip = (page - 1) * limit;
            
            let query = { 
                distributionStatus: 'pending',
                isActive: true 
            };
            
            if (batchNumber) {
                query.batchNumber = batchNumber;
            }
            
            const [data, total] = await Promise.all([
                DataDistribution.find(query)
                    .populate('assignedBy', 'name email')
                    .sort({ createdAt: 1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                DataDistribution.countDocuments(query)
            ]);
            
            res.status(200).json({
                success: true,
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get batch statistics (Admin only)
     */
    static async getBatchStats(req, res) {
        try {
            const { batchNumber } = req.params;
            
            if (!batchNumber) {
                return res.status(400).json({
                    success: false,
                    error: 'Batch number is required'
                });
            }
            
            const stats = await BulkDataOperations.getBatchStatistics(batchNumber);
            
            res.status(200).json({
                success: true,
                stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get today's admin-assigned data (Admin only)
     */
    static async getTodayAdminAssignedData(req, res) {
        try {
            const { page = 1, limit = 50, search, batchNumber, assignedTo, assignedType, sortBy = 'assignedAt', sortOrder = 'desc' } = req.query;
            const skip = (page - 1) * limit;
            
            // Get today's date range (00:00:00 to 23:59:59)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Build query for data assigned today by admin
            // Admin assignments have assignedBy field set and assignedAt is today
            // OR teamAssignments have assignedBy (admin) and assignedAt is today
            let query = {
                isActive: true,
                $or: [
                    // Direct admin assignment (assignedBy exists and assignedAt is today)
                    {
                        assignedBy: { $exists: true, $ne: null },
                        assignedAt: {
                            $gte: today,
                            $lt: tomorrow
                        }
                    },
                    // Admin assignment through teamAssignments
                    {
                        'teamAssignments.assignedBy': { $exists: true, $ne: null },
                        'teamAssignments.assignedAt': {
                            $gte: today,
                            $lt: tomorrow
                        },
                        'teamAssignments.withdrawn': false
                    }
                ]
            };
            
            // Add search filter
            if (search && search.trim() !== '') {
                const searchRegex = new RegExp(search, 'i');
                query.$and = query.$and || [];
                query.$and.push({
                    $or: [
                        { name: searchRegex },
                        { contact: searchRegex },
                        { email: searchRegex },
                        { batchNumber: searchRegex },
                        { source: searchRegex }
                    ]
                });
            }
            
            // Add batch filter
            if (batchNumber && batchNumber.trim() !== '') {
                query.batchNumber = batchNumber;
            }
            
            // Add assignedTo filter
            if (assignedTo && assignedTo.trim() !== '') {
                query.$or = [
                    { assignedTo: assignedTo },
                    { 'teamAssignments.teamMember': assignedTo }
                ];
            }
            
            // Add assignedType filter
            if (assignedType && assignedType !== 'all') {
                query.assignedType = assignedType;
            }
            
            // Build sort object
            const sort = {};
            if (sortBy === 'assignedAt') {
                sort.assignedAt = sortOrder === 'asc' ? 1 : -1;
            } else if (sortBy === 'name') {
                sort.name = sortOrder === 'asc' ? 1 : -1;
            } else if (sortBy === 'createdAt') {
                sort.createdAt = sortOrder === 'asc' ? 1 : -1;
            } else if (sortBy === 'batchNumber') {
                sort.batchNumber = sortOrder === 'asc' ? 1 : -1;
            } else {
                sort.assignedAt = -1;
            }
            
            // First, get all matching documents
            const allData = await DataDistribution.find(query)
                .populate('assignedBy', 'name email role')
                .populate('assignedTo', 'name email phoneNumber')
                .populate('teamAssignments.teamMember', 'name email phoneNumber')
                .populate('teamAssignments.assignedBy', 'name email role')
                .sort(sort);
            
            // Filter in-memory to ensure we only get data assigned today BY ADMIN
            const todayAssignedData = allData.filter(item => {
                // Check direct assignment by admin
                if (item.assignedBy && item.assignedAt) {
                    // Ensure assignedBy is an admin (check role if populated)
                    const isAdmin = !item.assignedBy.role || item.assignedBy.role === 'admin';
                    if (isAdmin) {
                        const assignedDate = new Date(item.assignedAt);
                        if (assignedDate >= today && assignedDate < tomorrow) {
                            return true;
                        }
                    }
                }
                
                // Check teamAssignments assigned by admin
                if (item.teamAssignments && Array.isArray(item.teamAssignments)) {
                    const todayAssignments = item.teamAssignments.filter(ta => {
                        if (ta.withdrawn) return false;
                        if (ta.assignedBy && ta.assignedAt) {
                            // Ensure assignedBy is an admin (check role if populated)
                            const isAdmin = !ta.assignedBy.role || ta.assignedBy.role === 'admin';
                            if (isAdmin) {
                                const taDate = new Date(ta.assignedAt);
                                return taDate >= today && taDate < tomorrow;
                            }
                        }
                        return false;
                    });
                    return todayAssignments.length > 0;
                }
                
                return false;
            });
            
            // Apply pagination
            const paginatedData = todayAssignedData.slice(skip, skip + parseInt(limit));
            
            res.status(200).json({
                success: true,
                data: paginatedData,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: todayAssignedData.length,
                    pages: Math.ceil(todayAssignedData.length / limit) || 1
                }
            });
        } catch (error) {
            console.error('Get today admin assigned data error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // ==================== TL CONTROLLERS ====================
    
    /**
     * Get TL's assigned data
     */
    static async getTLData(req, res) {
        try {
            const tlId = req.user._id;
            const { status, page = 1, limit = 50 } = req.query;
            const skip = (page - 1) * limit;
            
            let query = { 
                assignedTo: tlId,
                assignedType: 'tl',
                isActive: true 
            };
            
            if (status) {
                query.distributionStatus = status;
            }
            
            const [data, total] = await Promise.all([
                DataDistribution.find(query)
                    .populate('assignedBy', 'name email')
                    .populate('teamAssignments.teamMember', 'name email phoneNumber')
                    .sort({ assignedAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                DataDistribution.countDocuments(query)
            ]);
            
            res.status(200).json({
                success: true,
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * TL distributes data to team members
     */
    static async tlDistributeData(req, res) {
        try {
            const tlId = req.user._id;
            const { dataIds, teamMemberIds, distributionMethod } = req.body;
            
            if (!Array.isArray(dataIds) || dataIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Data IDs array is required'
                });
            }
            
            if (!Array.isArray(teamMemberIds) || teamMemberIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Team member IDs array is required'
                });
            }
            
            const result = await BulkDataOperations.tlDistributeDataToTeam(
                tlId, 
                dataIds, 
                teamMemberIds, 
                distributionMethod || 'manual'
            );
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * TL withdraws data from team members
     */
    static async tlWithdrawData(req, res) {
        try {
            const tlId = req.user._id;
            const { dataIds, teamMemberIds, reason } = req.body;
            
            if (!Array.isArray(dataIds) || dataIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Data IDs array is required'
                });
            }
            
            if (!Array.isArray(teamMemberIds) || teamMemberIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Team member IDs array is required'
                });
            }
            
            const result = await BulkDataOperations.tlWithdrawDataFromTeam(
                tlId, 
                dataIds, 
                teamMemberIds, 
                reason || ''
            );
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get TL statistics
     */
    static async getTLStatistics(req, res) {
        try {
            const tlId = req.user._id;
            
            const result = await BulkDataOperations.getTLStatistics(tlId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get TL's withdrawn data
     */
    static async getWithdrawnData(req, res) {
        try {
            const tlId = req.user._id;
            const { page = 1, limit = 50 } = req.query;
            const skip = (page - 1) * limit;
            
            const [data, total] = await Promise.all([
                DataDistribution.find({ 
                    assignedTo: tlId,
                    assignedType: 'tl',
                    distributionStatus: 'withdrawn',
                    isActive: true
                })
                .populate('teamAssignments.teamMember', 'name email')
                .populate('withdrawalHistory.teamMember', 'name email')
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
                DataDistribution.countDocuments({ 
                    assignedTo: tlId,
                    assignedType: 'tl',
                    distributionStatus: 'withdrawn',
                    isActive: true
                })
            ]);
            
            res.status(200).json({
                success: true,
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // ==================== USER CONTROLLERS ====================
    
    /**
     * Get user's assigned data
     */
    static async getUserData(req, res) {
        try {
            const userId = req.user._id;
            const { status, page = 1, limit = 50, dateFilter = 'today' } = req.query;
            const skip = (page - 1) * limit;
            
            // Build base query with $elemMatch to ensure all conditions match the same array element
            const baseElemMatch = {
                teamMember: userId,
                withdrawn: false
            };
            
            // Filter by date based on dateFilter parameter
            if (dateFilter === 'today') {
                // Get today's date range (00:00:00 to 23:59:59)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                // Filter by teamAssignments.assignedAt for today
                baseElemMatch.assignedAt = {
                    $gte: today,
                    $lt: tomorrow
                };
            } else if (dateFilter === 'previous') {
                // Get today's start date
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Filter by teamAssignments.assignedAt before today
                baseElemMatch.assignedAt = {
                    $lt: today
                };
            }
            // If dateFilter is 'all' or not specified, no date filter is applied
            
            if (status) {
                baseElemMatch.status = status;
            }
            
            let query = { 
                teamAssignments: {
                    $elemMatch: baseElemMatch
                },
                isActive: true
            };
            
            const [data, total] = await Promise.all([
                DataDistribution.find(query)
                    .populate('assignedTo', 'name email')
                    .populate('assignedBy', 'name email')
                    .sort({ 'teamAssignments.assignedAt': -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                DataDistribution.countDocuments(query)
            ]);
            
            res.status(200).json({
                success: true,
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get user's previous data (assigned before today)
     */
    static async getUserPreviousData(req, res) {
        try {
            const userId = req.user._id;
            const { status, page = 1, limit = 50 } = req.query;
            const skip = (page - 1) * limit;
            
            // Get today's start date
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Build $elemMatch query to ensure all conditions match the same array element
            const baseElemMatch = {
                teamMember: userId,
                withdrawn: false,
                assignedAt: {
                    $lt: today
                }
            };
            
            if (status) {
                baseElemMatch.status = status;
            }
            
            let query = { 
                teamAssignments: {
                    $elemMatch: baseElemMatch
                },
                isActive: true
            };
            
            const [data, total] = await Promise.all([
                DataDistribution.find(query)
                    .populate('assignedTo', 'name email')
                    .populate('assignedBy', 'name email')
                    .sort({ 'teamAssignments.assignedAt': -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                DataDistribution.countDocuments(query)
            ]);
            
            res.status(200).json({
                success: true,
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get user's closed data (data closed by the user)
     */
    static async getUserClosedData(req, res) {
        try {
            const userId = req.user._id;
            const { closedType = 'all', page = 1, limit = 50, search = '' } = req.query;
            const skip = (page - 1) * limit;
            
            // Build $elemMatch query to ensure all conditions match the same array element
            const baseElemMatch = {
                teamMember: userId,
                withdrawn: false
            };
            
            // Filter by closed status
            if (closedType === 'all') {
                baseElemMatch.status = {
                    $in: ['converted', 'rejected', 'not_reachable']
                };
            } else {
                baseElemMatch.status = closedType;
            }
            
            let query = { 
                teamAssignments: {
                    $elemMatch: baseElemMatch
                },
                isActive: true
            };
            
            // Add search filter
            if (search && search.trim() !== '') {
                const searchRegex = new RegExp(search, 'i');
                query.$or = [
                    { name: searchRegex },
                    { contact: searchRegex },
                    { email: searchRegex },
                    { batchNumber: searchRegex },
                    { source: searchRegex }
                ];
            }
            
            const [data, total] = await Promise.all([
                DataDistribution.find(query)
                    .populate('assignedTo', 'name email')
                    .populate('assignedBy', 'name email')
                    .sort({ 'teamAssignments.statusUpdatedAt': -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                DataDistribution.countDocuments(query)
            ]);
            
            res.status(200).json({
                success: true,
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Update data status (for users)
     */

static async updateDataStatus(req, res) {
    try {
        const userId = req.user._id;
        const { dataId, status, notes } = req.body;
        
        if (!dataId || !status) {
            return res.status(400).json({
                success: false,
                error: 'Data ID and status are required'
            });
        }
        
        const validStatuses = ['pending', 'contacted', 'converted', 'rejected', 'not_reachable'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        
        // Find the data
        const data = await DataDistribution.findById(dataId);
        
        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Data not found'
            });
        }
        
        // Check if user is assigned to this data
        const assignment = data.teamAssignments.find(ta => 
            ta.teamMember.toString() === userId.toString() && !ta.withdrawn
        );
        
        if (!assignment) {
            return res.status(403).json({
                success: false,
                error: 'You are not assigned to this data or it has been withdrawn'
            });
        }
        
        // Map status to responseType if needed
        let responseType = null;
        if (status === 'converted') {
            responseType = 'interested';
        } else if (status === 'rejected') {
            responseType = 'rejected';
        } else if (status === 'not_reachable') {
            responseType = 'invalid_number';
        } else if (status === 'contacted') {
            responseType = null; // No response type for contacted
        }
        
        // Update assignment
        const oldStatus = assignment.status;
        assignment.status = status;
        assignment.statusUpdatedAt = new Date();
        
        // Set responseType if applicable
        if (responseType) {
            assignment.responseType = responseType;
        }
        
        // Set timestamps
        if (status === 'contacted' || status === 'converted') {
            if (status === 'contacted') {
                assignment.contactedAt = new Date();
                assignment.callAttempts = (assignment.callAttempts || 0) + 1;
                assignment.lastCallAt = new Date();
            } else if (status === 'converted') {
                assignment.convertedAt = new Date();
            }
        }
        
        // Update notes
        if (notes) {
            assignment.notes = assignment.notes ? `${assignment.notes}\n${notes}` : notes;
        }
        
        // Save the document
        data.updatedAt = new Date();
        await data.save();
        
        // Update user statistics
        await updateUserStatistics(userId, oldStatus, status);
        
        res.status(200).json({
            success: true,
            message: 'Data status updated successfully',
            data: {
                _id: data._id,
                status: assignment.status,
                responseType: assignment.responseType,
                contactedAt: assignment.contactedAt,
                convertedAt: assignment.convertedAt,
                statusUpdatedAt: assignment.statusUpdatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
// Helper function to update user statistics


// Update data status in bulk
static async bulkUpdateDataStatus(req, res) {
    try {
        const userId = req.user._id;
        const { dataIds, status, responseType, notes } = req.body;
        
        if (!dataIds || !Array.isArray(dataIds) || dataIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Data IDs array is required'
            });
        }
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }
        
        const validStatuses = ['pending', 'contacted', 'converted', 'rejected', 'not_reachable'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        
        const updateData = {
            status,
            notes: notes || '',
            lastUpdatedBy: userId,
            updatedAt: new Date(),
            assignee: {
                _id: userId,
                name: req.user.name,
                role: req.user.role
            }
        };
        
        // Add timestamp based on status
        if (status === 'contacted') {
            updateData.calledAt = new Date();
            updateData.calledBy = userId;
        } 
        
        if (['converted', 'rejected', 'not_reachable'].includes(status)) {
            updateData.closedAt = new Date();
            updateData.closedBy = userId;
            updateData.closedType = status;
        }
        
        // Add response type if provided
        if (responseType) {
            updateData.responseType = responseType;
        }
        
        // Bulk update
        const result = await DataDistribution.updateMany(
            {
                _id: { $in: dataIds },
                assignedTo: userId // Ensure user owns these records
            },
            updateData
        );
        
        // Update user stats
        if (status === 'converted') {
            await User.findByIdAndUpdate(userId, {
                $inc: { 'stats.convertedCount': result.modifiedCount }
            });
        }
        
        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} records updated successfully`,
            data: {
                modifiedCount: result.modifiedCount,
                matchedCount: result.matchedCount
            }
        });
    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
    
    /**
     * Get user data statistics
     */
    static async getUserStats(req, res) {
        try {
            const userId = req.user._id;
            const { startDate, endDate } = req.query;
            
            const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const end = endDate ? new Date(endDate) : new Date();
            
            const stats = await DataDistribution.getUserStats(userId, start, end);
            
            res.status(200).json({
                success: true,
                stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getDataById(req, res) {
        try {
            const dataId = req.params.id;

            const data = await DataDistribution.findById(dataId)
                .populate('assignedBy', 'name email')
                .populate('assignedTo', 'name email')
                .populate('teamAssignments.teamMember', 'name email phoneNumber');

            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: 'Data not found'
                });
            }

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async searchData(req, res) {
    try {
        const { 
            query = '', 
            page = 1, 
            limit = 50,
            status,
            batchNumber,
            assignedTo,
            startDate,
            endDate,
            sortBy = 'assignedAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {
            isActive: true
        };

        // Add search query filter
        if (query && query.trim() !== '') {
            const searchRegex = new RegExp(query, 'i');
            filter.$or = [
                { name: searchRegex },
                { contact: searchRegex },
                { email: { $regex: searchRegex } },
                { batchNumber: searchRegex }
            ];
        }

        // Add status filter
        if (status) {
            if (typeof status === 'string') {
                const statusArray = status.split(',');
                
                // Check if we need to filter by teamAssignments status
                if (statusArray.includes('contacted') || 
                    statusArray.includes('converted') || 
                    statusArray.includes('rejected') ||
                    statusArray.includes('not_reachable')) {
                    
                    // Filter by teamAssignments status
                    filter['teamAssignments.status'] = { $in: statusArray };
                    filter['teamAssignments.withdrawn'] = false;
                } else {
                    // Filter by distributionStatus
                    filter.distributionStatus = { $in: statusArray };
                }
            }
        }

        // Add batch filter
        if (batchNumber && batchNumber.trim() !== '') {
            filter.batchNumber = batchNumber;
        }

        // Add assignedTo filter
        if (assignedTo && assignedTo.trim() !== '') {
            filter['teamAssignments.teamMember'] = assignedTo;
        }

        // Add date range filter
        if (startDate || endDate) {
            filter.updatedAt = {};
            if (startDate) {
                filter.updatedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.updatedAt.$lte = new Date(endDate);
            }
        }

        // Build sort object
        const sort = {};
        if (sortBy === 'calledAt') {
            sort['teamAssignments.contactedAt'] = sortOrder === 'asc' ? 1 : -1;
        } else if (sortBy === 'closedAt') {
            sort['teamAssignments.statusUpdatedAt'] = sortOrder === 'asc' ? 1 : -1;
        } else {
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        }

        // First, get all matching documents
        const allData = await DataDistribution.find(filter)
            .populate('assignedBy', 'name email phoneNumber')
            .populate('assignedTo', 'name email phoneNumber')
            .populate('teamAssignments.teamMember', 'name email phoneNumber')
            .sort(sort);

        // Filter in-memory for specific teamAssignment statuses
        let filteredData = allData;
        if (status && typeof status === 'string') {
            const statusArray = status.split(',');
            
            if (statusArray.includes('contacted') || 
                statusArray.includes('converted') || 
                statusArray.includes('rejected') ||
                statusArray.includes('not_reachable')) {
                
                filteredData = allData.filter(data => {
                    const activeAssignments = data.teamAssignments.filter(ta => !ta.withdrawn);
                    return activeAssignments.some(ta => statusArray.includes(ta.status));
                });
            }
        }

        // Apply pagination
        const total = filteredData.length;
        const paginatedData = filteredData.slice(skip, skip + parseInt(limit));

        res.status(200).json({
            success: true,
            data: paginatedData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search data error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

    static async exportData(req, res) {
        try {
            const { format = 'csv' } = req.query;

            const data = await DataDistribution.find({ isActive: true })
                .populate('assignedBy', 'name email')
                .populate('assignedTo', 'name email')
                .populate('teamAssignments.teamMember', 'name email phoneNumber')
                .sort({ createdAt: -1 });

            // Convert data to desired format
            let exportedData;
            if (format === 'csv') {
                exportedData = BulkDataOperations.convertToCSV(data);
                res.setHeader('Content-Disposition', 'attachment; filename="data_export.csv"');
                res.setHeader('Content-Type', 'text/csv');
            } else if (format === 'json') {
                exportedData = JSON.stringify(data, null, 2);
                res.setHeader('Content-Disposition', 'attachment; filename="data_export.json"');
                res.setHeader('Content-Type', 'application/json');
            } else {
                return res.status(400).json({
                    success: false,
                    error: 'Unsupported export format'
                });
            }

            res.status(200).send(exportedData);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async exportDataExcel(req, res) {
    try {
        const { batchNumber, status, startDate, endDate } = req.query;
        
        let filter = { isActive: true };
        
        if (batchNumber) {
            filter.batchNumber = batchNumber;
        }
        
        if (status) {
            filter.distributionStatus = status;
        }
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }
        
        const result = await BulkDataOperations.exportDataToExcel(filter);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
        
        // Send the Excel file
        res.send(result.data);
        
    } catch (error) {
        console.error('🔥 [CONTROLLER ERROR] Export Excel:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

static async downloadTemplate(req, res) {
    try {
        const result = await BulkDataOperations.generateExcelTemplate();
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
        
        // Send the template file
        res.send(result.data);
        
    } catch (error) {
        console.error('🔥 [CONTROLLER ERROR] Download template:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

    // Update your importData method in data.controller.js
static async importData(req, res) {
    try {
        console.log('📁 [CONTROLLER] ImportData called');
        
        if (!req.file) {
            console.log('❌ No file in request');
            return res.status(400).json({
                success: false,
                error: 'File is required (CSV or Excel)'
            });
        }

        const adminId = req.user._id;
        const batchName = req.body.batchName;
        
        console.log('📁 [CONTROLLER] File path:', req.file.path);
        console.log('📁 [CONTROLLER] Original name:', req.file.originalname);
        console.log('📁 [CONTROLLER] Admin ID:', adminId);
        console.log('📁 [CONTROLLER] Batch name:', batchName);
        
        // Use the enhanced import method with detailed error reporting
        const result = await BulkDataOperations.importDataFromFile(
            req.file.path, 
            adminId, 
            { 
                batchName: batchName,
                detailedErrors: true // Enable detailed error reporting
            }
        );
        
        console.log('✅ Import result:', result);

        // Clean up file after processing
        try {
            const fs = require('fs');
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
                console.log('🗑️ Temp file deleted:', req.file.path);
            }
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
        }

        // Return the result with detailed error information
        res.status(result.success ? 200 : 400).json(result);
        
    } catch (error) {
        console.error('🔥 [CONTROLLER ERROR]', error);
        
        // Clean up file if it exists
        try {
            const fs = require('fs');
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
        }
        
        res.status(500).json({
            success: false,
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
// Add this new method for bulk assignment
static async bulkAssignData(req, res) {
    try {
        const adminId = req.user._id;
        const { assignmentType, dataPerUser } = req.body;
        
        if (!assignmentType) {
            return res.status(400).json({
                success: false,
                error: 'Assignment type is required'
            });
        }
        
        const result = await BulkDataOperations.bulkAssignData(
            assignmentType,
            adminId,
            { dataPerUser: dataPerUser || 5 }
        );
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

static async getDistributionCounts(req, res) {
    try {
        const counts = await BulkDataOperations.getDistributionCounts();
        
        res.status(200).json({
            success: true,
            counts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

/**
 * Admin withdraws data from anyone
 */
static async adminWithdrawData(req, res) {
    try {
        const adminId = req.user._id;
        const { dataIds, reason } = req.body;
        
        if (!Array.isArray(dataIds) || dataIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Data IDs array is required'
            });
        }
        
        const result = await BulkDataOperations.adminWithdrawData(dataIds, adminId, reason || '');
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

    static async getAnalytics(req, res) {
    try {
        const { 
            status,
            startDate,
            endDate,
            groupBy = 'day'
        } = req.query;

        // Build filter object
        const filter = {
            isActive: true
        };

        // Add date range filter
        if (startDate || endDate) {
            filter.updatedAt = {};
            if (startDate) {
                filter.updatedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.updatedAt.$lte = new Date(endDate);
            }
        }

        // Get all data
        const allData = await DataDistribution.find(filter)
            .populate('assignedTo', 'name email phoneNumber')
            .populate('teamAssignments.teamMember', 'name email phoneNumber');

        // Process analytics
        let stats = {
            totalData: allData.length,
            converted: 0,
            rejected: 0,
            notReachable: 0,
            contacted: 0,
            pending: 0
        };

        // Count by teamAssignment status
        allData.forEach(data => {
            const activeAssignments = data.teamAssignments.filter(ta => !ta.withdrawn);
            
            activeAssignments.forEach(ta => {
                switch (ta.status) {
                    case 'converted':
                        stats.converted++;
                        break;
                    case 'rejected':
                        stats.rejected++;
                        break;
                    case 'not_reachable':
                        stats.notReachable++;
                        break;
                    case 'contacted':
                        stats.contacted++;
                        break;
                    case 'pending':
                        stats.pending++;
                        break;
                }
            });
        });

        // Calculate conversion rate
        const totalClosed = stats.converted + stats.rejected + stats.notReachable;
        stats.totalClosed = totalClosed;
        stats.conversionRate = totalClosed > 0 ? (stats.converted / totalClosed * 100).toFixed(2) : 0;

        // Get top performers for conversions
        const userConversionMap = new Map();
        
        allData.forEach(data => {
            const activeAssignments = data.teamAssignments.filter(ta => !ta.withdrawn && ta.status === 'converted');
            
            activeAssignments.forEach(ta => {
                if (ta.teamMember && ta.teamMember._id) {
                    const userId = ta.teamMember._id.toString();
                    const userName = ta.teamMember.name || 'Unknown';
                    
                    if (userConversionMap.has(userId)) {
                        userConversionMap.get(userId).count++;
                    } else {
                        userConversionMap.set(userId, {
                            userId,
                            userName,
                            count: 1
                        });
                    }
                }
            });
        });

        const topConverters = Array.from(userConversionMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                ...stats,
                topConverters,
                trends: {
                    daily: [],
                    weekly: [],
                    monthly: []
                }
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

static async getCalledData(req, res) {
    try {
        const {
            page = 1,
            limit = 50,
            search = '',
            batchNumber = '',
            assignedTo = '',
            startDate = '',
            endDate = '',
            sortBy = 'teamAssignments.contactedAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;

        // Build filter object for contacted data
        const filter = {
            isActive: true,
            'teamAssignments.status': 'contacted',
            'teamAssignments.withdrawn': false
        };

        // Add search filter
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { name: searchRegex },
                { contact: searchRegex },
                { email: { $regex: searchRegex } },
                { batchNumber: searchRegex }
            ];
        }

        // Add batch filter
        if (batchNumber && batchNumber.trim() !== '') {
            filter.batchNumber = batchNumber;
        }

        // Add assignedTo filter
        if (assignedTo && assignedTo.trim() !== '') {
            filter['teamAssignments.teamMember'] = assignedTo;
        }

        // Add date range filter
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate) {
                dateFilter.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.$lte = new Date(endDate);
            }
            filter['teamAssignments.contactedAt'] = dateFilter;
        }

        // Build sort object
        const sort = {};
        if (sortBy.includes('teamAssignments.')) {
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        } else {
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        }

        // Get contacted data with pagination
        const [data, total] = await Promise.all([
            DataDistribution.find(filter)
                .populate('assignedBy', 'name email phoneNumber')
                .populate('assignedTo', 'name email phoneNumber')
                .populate('teamAssignments.teamMember', 'name email phoneNumber')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            DataDistribution.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get called data error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

static async getClosedData(req, res) {
    try {
        const {
            page = 1,
            limit = 50,
            search = '',
            batchNumber = '',
            closedType = 'all',
            assignedTo = '',
            startDate = '',
            endDate = '',
            sortBy = 'teamAssignments.statusUpdatedAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;

        // Build filter object for closed data
        const filter = {
            isActive: true,
            'teamAssignments.withdrawn': false
        };

        // Handle closed type filter
        if (closedType === 'all') {
            filter['teamAssignments.status'] = {
                $in: ['converted', 'rejected', 'not_reachable']
            };
        } else {
            filter['teamAssignments.status'] = closedType;
        }

        // Add search filter
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { name: searchRegex },
                { contact: searchRegex },
                { email: { $regex: searchRegex } },
                { batchNumber: searchRegex }
            ];
        }

        // Add batch filter
        if (batchNumber && batchNumber.trim() !== '') {
            filter.batchNumber = batchNumber;
        }

        // Add assignedTo filter
        if (assignedTo && assignedTo.trim() !== '') {
            filter['teamAssignments.teamMember'] = assignedTo;
        }

        // Add date range filter
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate) {
                dateFilter.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.$lte = new Date(endDate);
            }
            filter['teamAssignments.statusUpdatedAt'] = dateFilter;
        }

        // Build sort object
        const sort = {};
        if (sortBy.includes('teamAssignments.')) {
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        } else {
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        }

        // Get closed data with pagination
        const [data, total] = await Promise.all([
            DataDistribution.find(filter)
                .populate('assignedBy', 'name email phoneNumber')
                .populate('assignedTo', 'name email phoneNumber')
                .populate('teamAssignments.teamMember', 'name email phoneNumber')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            DataDistribution.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get closed data error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

static async getCalledStats(req, res) {
    try {
        const { startDate = '', endDate = '' } = req.query;

        // Build filter object for contacted data
        const filter = {
            isActive: true,
            'teamAssignments.status': 'contacted',
            'teamAssignments.withdrawn': false
        };

        // Add date range filter
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate) {
                dateFilter.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.$lte = new Date(endDate);
            }
            filter['teamAssignments.contactedAt'] = dateFilter;
        }

        // Get today's date for today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayFilter = {
            ...filter,
            'teamAssignments.contactedAt': {
                $gte: today,
                $lt: tomorrow
            }
        };

        // Get stats
        const [totalCalled, calledToday, data] = await Promise.all([
            DataDistribution.countDocuments(filter),
            DataDistribution.countDocuments(todayFilter),
            DataDistribution.find(filter)
                .populate('teamAssignments.teamMember', 'name')
        ]);

        // Calculate top performers (users with most calls)
        const userCallCounts = {};
        data.forEach(item => {
            item.teamAssignments.forEach(ta => {
                if (ta.status === 'contacted' && ta.teamMember && ta.teamMember._id) {
                    const userId = ta.teamMember._id.toString();
                    const userName = ta.teamMember.name || 'Unknown';
                    
                    if (!userCallCounts[userId]) {
                        userCallCounts[userId] = {
                            userId,
                            userName,
                            count: 0
                        };
                    }
                    userCallCounts[userId].count++;
                }
            });
        });

        const topPerformers = Object.values(userCallCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Calculate average calls per user
        const uniqueUsers = Object.keys(userCallCounts).length;
        const averageCallsPerUser = uniqueUsers > 0 ? (totalCalled / uniqueUsers).toFixed(1) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalCalled,
                calledToday,
                averageCallsPerUser: parseFloat(averageCallsPerUser),
                topPerformers
            }
        });
    } catch (error) {
        console.error('Get called stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

static async getClosedStats(req, res) {
    try {
        const { 
            startDate = '', 
            endDate = '',
            closedType = 'all'
        } = req.query;

        // Build filter object for closed data
        const filter = {
            isActive: true,
            'teamAssignments.withdrawn': false
        };

        // Handle closed type filter
        if (closedType === 'all') {
            filter['teamAssignments.status'] = {
                $in: ['converted', 'rejected', 'not_reachable']
            };
        } else {
            filter['teamAssignments.status'] = closedType;
        }

        // Add date range filter
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate) {
                dateFilter.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.$lte = new Date(endDate);
            }
            filter['teamAssignments.statusUpdatedAt'] = dateFilter;
        }

        // Get today's date for today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayFilter = {
            ...filter,
            'teamAssignments.statusUpdatedAt': {
                $gte: today,
                $lt: tomorrow
            }
        };

        // Get all closed data
        const [allData, todayData] = await Promise.all([
            DataDistribution.find(filter).populate('teamAssignments.teamMember', 'name'),
            DataDistribution.find(todayFilter).populate('teamAssignments.teamMember', 'name')
        ]);

        // Process stats
        let stats = {
            totalClosed: allData.length,
            converted: 0,
            rejected: 0,
            notReachable: 0,
            calledToday: todayData.length,
            todayConverted: 0,
            todayRejected: 0,
            todayNotReachable: 0
        };

        // Count by status for all time
        allData.forEach(data => {
            data.teamAssignments.forEach(ta => {
                if (!ta.withdrawn) {
                    switch (ta.status) {
                        case 'converted':
                            stats.converted++;
                            break;
                        case 'rejected':
                            stats.rejected++;
                            break;
                        case 'not_reachable':
                            stats.notReachable++;
                            break;
                    }
                }
            });
        });

        // Count by status for today
        todayData.forEach(data => {
            data.teamAssignments.forEach(ta => {
                if (!ta.withdrawn) {
                    switch (ta.status) {
                        case 'converted':
                            stats.todayConverted++;
                            break;
                        case 'rejected':
                            stats.todayRejected++;
                            break;
                        case 'not_reachable':
                            stats.todayNotReachable++;
                            break;
                    }
                }
            });
        });

        // Calculate conversion rate
        const totalClosed = stats.converted + stats.rejected + stats.notReachable;
        stats.conversionRate = totalClosed > 0 ? (stats.converted / totalClosed * 100).toFixed(1) : 0;

        // Calculate top converters
        const userConversionMap = new Map();
        allData.forEach(data => {
            data.teamAssignments.forEach(ta => {
                if (!ta.withdrawn && ta.status === 'converted' && ta.teamMember) {
                    const userId = ta.teamMember._id.toString();
                    const userName = ta.teamMember.name || 'Unknown';
                    
                    if (userConversionMap.has(userId)) {
                        userConversionMap.get(userId).count++;
                    } else {
                        userConversionMap.set(userId, {
                            userId,
                            userName,
                            count: 1
                        });
                    }
                }
            });
        });

        const topConverters = Array.from(userConversionMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                ...stats,
                topConverters
            }
        });
    } catch (error) {
        console.error('Get closed stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

    static async getAllBatches(req, res) {
        try {
            const batches = await BulkDataOperations.getAllBatches();

            res.status(200).json({
                success: true,
                batches
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getBatchDetails(req, res) {
        try {
            const batchId = req.params.id;

            const batchDetails = await BulkDataOperations.getBatchDetails(batchId);

            if (!batchDetails) {
                return res.status(404).json({
                    success: false,
                    error: 'Batch not found'
                });
            }

            res.status(200).json({
                success: true,
                batchDetails
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async createBatch(req, res) {
        try {
            const { batchName, description } = req.body;

            if (!batchName) {
                return res.status(400).json({
                    success: false,
                    error: 'Batch name is required'
                });
            }

            const newBatch = await BulkDataOperations.createBatch(batchName, description);

            res.status(201).json({
                success: true,
                batch: newBatch
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    static async updateBatch(req, res) {
        try {
            const batchId = req.params.id;
            const { batchName, description } = req.body;
            const updatedBatch = await BulkDataOperations.updateBatch(batchId, batchName, description);

            if (!updatedBatch) {
                return res.status(404).json({
                    success: false,
                    error: 'Batch not found'
                });
            }

            res.status(200).json({
                success: true,
                batch: updatedBatch
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async deleteBatch(req, res) {
        try {
            const batchId = req.params.id;
            const deleted = await BulkDataOperations.deleteBatch(batchId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Batch not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Batch deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = DataController;