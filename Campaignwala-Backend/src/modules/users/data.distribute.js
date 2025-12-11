const mongoose = require('mongoose');

const dataDistributionSchema = new mongoose.Schema({
    // Basic Data Information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    contact: {
        type: String,
        required: [true, 'Contact number is required'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Contact number must be 10 digits'
        }
    },
    
    // Batch Information
    batchNumber: {
        type: String,
        required: true,
        index: true
    },
    
    // Primary Distribution Status
    distributionStatus: {
        type: String,
        enum: [
            'pending',         // Not yet assigned
            'assigned',        // Assigned to TL/User
            'distributed',     // Distributed by TL to team members
            'withdrawn',       // Withdrawn from user
            'expired',         // Expired/old data
            'archived'         // Archived/completed
        ],
        default: 'pending'
    },
    
    // Assignment Information (from Admin to TL/User)
    assignedType: {
        type: String,
        enum: [
            'direct_user',    // Directly to a user
            'tl',             // To a TL
            'all_active',     // To all active users (bulk)
            'present_today',  // To users present today (bulk)
            'without_data'    // To users without data today (bulk)
        ]
    },
    
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    assignedAt: {
        type: Date
    },
    
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // TL Distribution Information (when TL distributes to team)
    tlDistribution: {
        distributedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        distributedAt: {
            type: Date
        },
        distributionMethod: {
            type: String,
            enum: ['manual', 'auto', 'equal', 'performance_based'],
            default: 'manual'
        }
    },
    
    // Team Member Assignment Details
    teamAssignments: [{
        teamMember: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        assignedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['assigned', 'contacted', 'converted', 'rejected', 'not_reachable', 'pending'],
            default: 'pending'
        },
        statusUpdatedAt: {
            type: Date
        },
        notes: {
            type: String,
            trim: true
        },
        contactedAt: {
            type: Date
        },
        convertedAt: {
            type: Date
        },
        // Withdrawal Information
        withdrawn: {
            type: Boolean,
            default: false
        },
        withdrawnAt: {
            type: Date
        },
        withdrawnBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        withdrawalReason: {
            type: String,
            trim: true
        },
        // Performance Tracking
        callAttempts: {
            type: Number,
            default: 0
        },
        lastCallAt: {
            type: Date
        },
        followUpDate: {
            type: Date
        }
    }],
    
    // Withdrawal History
    withdrawalHistory: [{
        teamMember: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        withdrawnAt: {
            type: Date,
            default: Date.now
        },
        withdrawnBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        }
    }],
    
    // Tracking
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    },
    
    archivedAt: {
        type: Date
    },
    
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Metadata
    source: {
        type: String,
        default: 'manual'
    },
    
    tags: [{
        type: String,
        trim: true
    }],
    
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, {
    timestamps: true
});

// ==================== VIRTUAL FIELDS ====================

dataDistributionSchema.virtual('assignedToInfo', {
    ref: 'User',
    localField: 'assignedTo',
    foreignField: '_id',
    justOne: true
});

dataDistributionSchema.virtual('assignedByInfo', {
    ref: 'User',
    localField: 'assignedBy',
    foreignField: '_id',
    justOne: true
});

dataDistributionSchema.virtual('currentAssignee').get(function() {
    if (this.assignedType === 'direct_user') {
        return this.assignedTo;
    } else if (this.assignedType === 'tl' && this.teamAssignments.length > 0) {
        const currentAssignment = this.teamAssignments.find(ta => !ta.withdrawn);
        return currentAssignment ? currentAssignment.teamMember : null;
    }
    return null;
});

dataDistributionSchema.virtual('isWithdrawn').get(function() {
    return this.distributionStatus === 'withdrawn';
});

dataDistributionSchema.virtual('canBeReassigned').get(function() {
    return ['withdrawn', 'pending', 'expired'].includes(this.distributionStatus);
});

dataDistributionSchema.virtual('teamMemberStatus').get(function() {
    const statusCount = {
        pending: 0,
        contacted: 0,
        converted: 0,
        rejected: 0,
        not_reachable: 0,
        withdrawn: 0
    };
    
    this.teamAssignments.forEach(assignment => {
        if (assignment.withdrawn) {
            statusCount.withdrawn++;
        } else {
            statusCount[assignment.status] = (statusCount[assignment.status] || 0) + 1;
        }
    });
    
    return statusCount;
});

// ==================== METHODS ====================

// Assign data to TL or User
dataDistributionSchema.methods.assignData = function(assignedToId, assignedType, assignedById, notes = '') {
    this.assignedTo = assignedToId;
    this.assignedType = assignedType;
    this.assignedBy = assignedById;
    this.assignedAt = new Date();
    this.distributionStatus = 'assigned';
    
    // If assigned directly to user, add to teamAssignments
    if (assignedType === 'direct_user') {
        this.teamAssignments.push({
            teamMember: assignedToId,
            assignedBy: assignedById,
            status: 'pending',
            assignedAt: new Date()
        });
    }
    
    return this;
};

// TL distributes to team member
dataDistributionSchema.methods.distributeToTeamMember = async function(teamMemberId, tlId, distributionMethod = 'manual') {
    // Verify this is TL's data
    if (this.assignedTo.toString() !== tlId.toString() || this.assignedType !== 'tl') {
        throw new Error('Not authorized to distribute this data');
    }
    
    // Check if already assigned to this team member and not withdrawn
    const existingAssignment = this.teamAssignments.find(ta => 
        ta.teamMember.toString() === teamMemberId.toString() && !ta.withdrawn
    );
    
    if (existingAssignment) {
        throw new Error('Data already assigned to this team member');
    }
    
    // Add new assignment
    this.teamAssignments.push({
        teamMember: teamMemberId,
        assignedBy: tlId,
        status: 'pending',
        assignedAt: new Date()
    });
    
    // Update TL distribution info
    this.tlDistribution = {
        distributedBy: tlId,
        distributedAt: new Date(),
        distributionMethod: distributionMethod
    };
    
    this.distributionStatus = 'distributed';
    this.updatedAt = new Date();
    
    await this.save();
    
    // Update team member's statistics
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(teamMemberId, {
        $inc: { 
            'leadDistribution.todaysLeadCount': 1,
            'leadDistribution.todaysPendingLeads': 1,
            'statistics.totalLeads': 1,
            'statistics.pendingLeads': 1,
            'statistics.todaysLeads': 1
        },
        $set: { 'leadDistribution.lastLeadDistributionDate': new Date() }
    });
    
    return {
        success: true,
        dataId: this._id,
        teamMemberId: teamMemberId,
        assignedAt: new Date()
    };
};


// Add this method to the methods section
dataDistributionSchema.methods.withdrawData = async function(withdrawnById, reason = '', notes = '') {
    // Check if data is currently assigned to someone
    if (this.distributionStatus === 'pending') {
        throw new Error('Data is not assigned to anyone');
    }
    
    const withdrawnFrom = this.assignedTo;
    const assignedType = this.assignedType;
    
    // If data was assigned directly to a user, remove from teamAssignments
    if (assignedType === 'direct_user') {
        const userAssignment = this.teamAssignments.find(ta => 
            ta.teamMember.toString() === this.assignedTo.toString() && !ta.withdrawn
        );
        
        if (userAssignment) {
            userAssignment.withdrawn = true;
            userAssignment.withdrawnAt = new Date();
            userAssignment.withdrawnBy = withdrawnById;
            userAssignment.withdrawalReason = reason;
        }
    }
    
    // Add to withdrawal history
    this.withdrawalHistory.push({
        withdrawnFrom: this.assignedTo,
        withdrawnAt: new Date(),
        withdrawnBy: withdrawnById,
        reason: reason,
        notes: notes
    });
    
    // Reset assignment fields
    this.assignedTo = undefined;
    this.assignedType = undefined;
    this.assignedAt = undefined;
    this.distributionStatus = 'withdrawn';
    this.updatedAt = new Date();
    
    // If TL was distributing to team, update TL distribution info
    if (this.tlDistribution && this.tlDistribution.distributedBy) {
        // Keep the distribution history but mark as withdrawn
        this.tlDistribution.withdrawn = true;
        this.tlDistribution.withdrawnAt = new Date();
        this.tlDistribution.withdrawnBy = withdrawnById;
    }
    
    await this.save();
    
    // Update user statistics if it was a direct user assignment
    if (assignedType === 'direct_user') {
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(withdrawnFrom, {
            $inc: { 
                'statistics.totalLeads': -1,
                'statistics.pendingLeads': -1,
                'statistics.todaysLeads': -1
            }
        });
    }
    
    return {
        success: true,
        dataId: this._id,
        withdrawnFrom: withdrawnFrom,
        withdrawnAt: new Date(),
        reason: reason
    };
};

// TL withdraws data from team member
dataDistributionSchema.methods.withdrawFromTeamMember = async function(teamMemberId, tlId, reason = '', notes = '') {
    // Verify this is TL's data
    if (this.assignedTo.toString() !== tlId.toString() || this.assignedType !== 'tl') {
        throw new Error('Not authorized to withdraw this data');
    }
    
    // Find the assignment
    const assignment = this.teamAssignments.find(ta => 
        ta.teamMember.toString() === teamMemberId.toString() && !ta.withdrawn
    );
    
    if (!assignment) {
        throw new Error('Data not assigned to this team member or already withdrawn');
    }
    
    // Mark as withdrawn
    assignment.withdrawn = true;
    assignment.withdrawnAt = new Date();
    assignment.withdrawnBy = tlId;
    assignment.withdrawalReason = reason;
    assignment.notes = notes ? `${assignment.notes || ''} ${notes}`.trim() : assignment.notes;
    
    // Add to withdrawal history
    this.withdrawalHistory.push({
        teamMember: teamMemberId,
        withdrawnAt: new Date(),
        withdrawnBy: tlId,
        reason: reason,
        notes: notes
    });
    
    this.distributionStatus = 'withdrawn';
    this.updatedAt = new Date();
    
    await this.save();
    
    // Update team member's statistics
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(teamMemberId, {
        $inc: { 
            'leadDistribution.todaysLeadCount': -1,
            'leadDistribution.todaysPendingLeads': -1,
            'statistics.totalLeads': -1,
            'statistics.pendingLeads': -1,
            'statistics.todaysLeads': -1
        }
    });
    
    return {
        success: true,
        dataId: this._id,
        teamMemberId: teamMemberId,
        withdrawnAt: new Date(),
        reason: reason
    };
};

// Reassign withdrawn data to another team member
dataDistributionSchema.methods.reassignData = async function(newTeamMemberId, tlId, reason = '') {
    if (this.distributionStatus !== 'withdrawn') {
        throw new Error('Only withdrawn data can be reassigned');
    }
    
    // Withdraw from current assignee if any
    const currentAssignment = this.teamAssignments.find(ta => !ta.withdrawn);
    if (currentAssignment) {
        await this.withdrawFromTeamMember(currentAssignment.teamMember, tlId, 'Reassigned to another team member');
    }
    
    // Assign to new team member
    return await this.distributeToTeamMember(newTeamMemberId, tlId, 'manual');
};

// Update data status by team member
dataDistributionSchema.methods.updateStatus = async function(teamMemberId, status, notes = '') {
    const assignment = this.teamAssignments.find(ta => 
        ta.teamMember.toString() === teamMemberId.toString() && !ta.withdrawn
    );
    
    if (!assignment) {
        throw new Error('Data not assigned to you or withdrawn');
    }
    
    const oldStatus = assignment.status;
    assignment.status = status;
    assignment.statusUpdatedAt = new Date();
    
    if (notes) {
        assignment.notes = assignment.notes ? `${assignment.notes}\n${notes}` : notes;
    }
    
    if (status === 'contacted') {
        assignment.contactedAt = new Date();
        assignment.callAttempts = (assignment.callAttempts || 0) + 1;
        assignment.lastCallAt = new Date();
    } else if (status === 'converted') {
        assignment.convertedAt = new Date();
    }
    
    this.updatedAt = new Date();
    await this.save();
    
    // Update user statistics if converted
    if (status === 'converted') {
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(teamMemberId, {
            $inc: { 
                'leadDistribution.todaysCompletedLeads': 1,
                'leadDistribution.todaysPendingLeads': -1,
                'statistics.completedLeads': 1,
                'statistics.pendingLeads': -1
            }
        });
    }
    
    return {
        success: true,
        dataId: this._id,
        oldStatus: oldStatus,
        newStatus: status,
        updatedAt: new Date()
    };
};

// Archive data
dataDistributionSchema.methods.archiveData = function(archivedById) {
    this.distributionStatus = 'archived';
    this.archivedAt = new Date();
    this.updatedAt = new Date();
    this.isActive = false;
    
    return this;
};

// ==================== STATICS ====================

// Create bulk data
dataDistributionSchema.statics.createBulkData = async function(dataArray, assignedById, batchNumber) {
    const dataRecords = dataArray.map(item => ({
        name: item.name,
        contact: item.contact,
        batchNumber: batchNumber,
        assignedBy: assignedById,
        distributionStatus: 'pending'
    }));
    
    return await this.insertMany(dataRecords);
};

// Assign bulk data
dataDistributionSchema.statics.assignBulkData = async function(dataIds, assignedToId, assignedType, assignedById) {
    const updateData = {
        assignedTo: assignedToId,
        assignedType: assignedType,
        assignedBy: assignedById,
        assignedAt: new Date(),
        distributionStatus: 'assigned',
        updatedAt: new Date()
    };
    
    // If direct user assignment, we need to add to teamAssignments
    if (assignedType === 'direct_user') {
        // This requires individual updates or a bulk write with arrayFilters
        const bulkOps = dataIds.map(dataId => ({
            updateOne: {
                filter: { _id: dataId },
                update: {
                    ...updateData,
                    $push: {
                        teamAssignments: {
                            teamMember: assignedToId,
                            assignedBy: assignedById,
                            status: 'pending',
                            assignedAt: new Date()
                        }
                    }
                }
            }
        }));
        
        const result = await this.bulkWrite(bulkOps);
        return { nModified: result.modifiedCount };
    } else {
        // For TL assignments, just update the basic fields
        const result = await this.updateMany(
            { _id: { $in: dataIds } },
            { $set: updateData }
        );
        
        return { nModified: result.nModified };
    }
};

// Find data assigned to TL
dataDistributionSchema.statics.findDataAssignedToTL = function(tlId, status = 'assigned') {
    return this.find({ 
        assignedTo: tlId,
        assignedType: 'tl',
        distributionStatus: status,
        isActive: true
    })
    .populate('assignedByInfo', 'name email')
    .populate('teamAssignments.teamMember', 'name email phoneNumber')
    .sort({ assignedAt: -1 });
};

// Find data distributed to team member
dataDistributionSchema.statics.findDataForTeamMember = function(teamMemberId) {
    return this.find({ 
        'teamAssignments.teamMember': teamMemberId,
        'teamAssignments.withdrawn': false,
        isActive: true
    })
    .populate('assignedTo', 'name email')
    .populate('assignedByInfo', 'name email')
    .sort({ 'teamAssignments.assignedAt': -1 });
};

// Find withdrawn data for TL
dataDistributionSchema.statics.findWithdrawnDataForTL = function(tlId) {
    return this.find({ 
        assignedTo: tlId,
        assignedType: 'tl',
        distributionStatus: 'withdrawn',
        isActive: true
    })
    .populate('teamAssignments.teamMember', 'name email')
    .populate('withdrawalHistory.teamMember', 'name email')
    .sort({ updatedAt: -1 });
};

// Get TL data statistics
dataDistributionSchema.statics.getTLDataStats = async function(tlId) {
    const stats = await this.aggregate([
        {
            $match: {
                assignedTo: mongoose.Types.ObjectId(tlId),
                assignedType: 'tl',
                isActive: true
            }
        },
        {
            $facet: {
                statusCounts: [
                    {
                        $group: {
                            _id: '$distributionStatus',
                            count: { $sum: 1 }
                        }
                    }
                ],
                teamStats: [
                    {
                        $unwind: {
                            path: '$teamAssignments',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $match: {
                            'teamAssignments.withdrawn': false
                        }
                    },
                    {
                        $group: {
                            _id: {
                                teamMember: '$teamAssignments.teamMember',
                                status: '$teamAssignments.status'
                            },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id.teamMember',
                            totalAssigned: { $sum: '$count' },
                            statuses: {
                                $push: {
                                    status: '$_id.status',
                                    count: '$count'
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'userInfo'
                        }
                    },
                    {
                        $unwind: '$userInfo'
                    },
                    {
                        $project: {
                            userId: '$_id',
                            userName: '$userInfo.name',
                            totalAssigned: 1,
                            pending: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: '$statuses',
                                            as: 'status',
                                            cond: { $eq: ['$$status.status', 'pending'] }
                                        }
                                    },
                                    0
                                ]
                            },
                            contacted: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: '$statuses',
                                            as: 'status',
                                            cond: { $eq: ['$$status.status', 'contacted'] }
                                        }
                                    },
                                    0
                                ]
                            },
                            converted: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: '$statuses',
                                            as: 'status',
                                            cond: { $eq: ['$$status.status', 'converted'] }
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    }
                ],
                withdrawalStats: [
                    {
                        $match: {
                            distributionStatus: 'withdrawn'
                        }
                    },
                    {
                        $project: {
                            withdrawalCount: { $size: '$withdrawalHistory' }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalWithdrawals: { $sum: '$withdrawalCount' }
                        }
                    }
                ]
            }
        }
    ]);
    
    const statusCounts = stats[0]?.statusCounts || [];
    const teamStats = stats[0]?.teamStats || [];
    const withdrawalStats = stats[0]?.withdrawalStats?.[0] || { totalWithdrawals: 0 };
    
    const totalData = statusCounts.reduce((sum, item) => sum + item.count, 0);
    
    return {
        totalData: totalData,
        statusBreakdown: statusCounts,
        teamDistribution: teamStats,
        totalWithdrawals: withdrawalStats.totalWithdrawals,
        availableForDistribution: statusCounts.find(s => s._id === 'assigned')?.count || 0,
        distributedCount: statusCounts.find(s => s._id === 'distributed')?.count || 0,
        withdrawnCount: statusCounts.find(s => s._id === 'withdrawn')?.count || 0
    };
};

// Get batch statistics
dataDistributionSchema.statics.getBatchStats = async function(batchNumber) {
    const stats = await this.aggregate([
        {
            $match: { batchNumber: batchNumber }
        },
        {
            $group: {
                _id: '$distributionStatus',
                count: { $sum: 1 },
                assignedTls: {
                    $addToSet: '$assignedTo'
                }
            }
        }
    ]);
    
    const total = await this.countDocuments({ batchNumber: batchNumber });
    
    return {
        batchNumber,
        total,
        statusBreakdown: stats,
        assignedTLCount: stats.reduce((count, item) => count + item.assignedTls.length, 0)
    };
};

// ==================== MIDDLEWARE ====================

dataDistributionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// ==================== INDEXES ====================

dataDistributionSchema.index({ contact: 1 });
dataDistributionSchema.index({ batchNumber: 1 });
dataDistributionSchema.index({ distributionStatus: 1 });
dataDistributionSchema.index({ assignedTo: 1 });
dataDistributionSchema.index({ assignedType: 1 });
dataDistributionSchema.index({ assignedBy: 1 });
dataDistributionSchema.index({ 'teamAssignments.teamMember': 1 });
dataDistributionSchema.index({ 'teamAssignments.status': 1 });
dataDistributionSchema.index({ 'teamAssignments.withdrawn': 1 });
dataDistributionSchema.index({ assignedAt: -1 });
dataDistributionSchema.index({ createdAt: -1 });
dataDistributionSchema.index({ batchNumber: 1, distributionStatus: 1 });
dataDistributionSchema.index({ assignedTo: 1, distributionStatus: 1 });

const DataDistribution = mongoose.model('DataDistribution', dataDistributionSchema);

module.exports = DataDistribution;