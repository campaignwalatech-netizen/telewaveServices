const DataDistribution = require('../users/data.distribute');
const BulkDataOperations = require('../users/bulk.operations');
const User = require('../users/user.model');

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
            const { status, page = 1, limit = 50 } = req.query;
            const skip = (page - 1) * limit;
            
            let query = { 
                'teamAssignments.teamMember': userId,
                'teamAssignments.withdrawn': false,
                isActive: true
            };
            
            if (status) {
                query['teamAssignments.status'] = status;
            }
            
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
            
            const data = await DataDistribution.findById(dataId);
            
            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: 'Data not found'
                });
            }
            
            const result = await data.updateStatus(userId, status, notes);
            
            res.status(200).json({
                success: true,
                message: 'Data status updated successfully',
                result
            });
        } catch (error) {
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
            const { query, page = 1, limit = 50 } = req.query;
            const skip = (page - 1) * limit;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required'
                });
            }

            const searchRegex = new RegExp(query, 'i');

            const [data, total] = await Promise.all([
                DataDistribution.find({
                    $or: [
                        { 'dataField1': searchRegex },
                        { 'dataField2': searchRegex },
                        // Add more fields as necessary
                    ],
                    isActive: true
                })
                .populate('assignedBy', 'name email')
                .populate('assignedTo', 'name email')
                .populate('teamAssignments.teamMember', 'name email phoneNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
                DataDistribution.countDocuments({
                    $or: [
                        { 'dataField1': searchRegex },
                        { 'dataField2': searchRegex },
                        // Add more fields as necessary
                    ],
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

    static async importData(req, res) {
    try {
        console.log('📁 [CONTROLLER] ImportData called');
        console.log('📁 [CONTROLLER] File:', req.file);
        console.log('📁 [CONTROLLER] User:', req.user ? 'Yes' : 'No');
        console.log('📁 [CONTROLLER] User ID:', req.user?._id);
        
        if (!req.file) {
            console.log('❌ No file in request');
            return res.status(400).json({
                success: false,
                error: 'CSV file is required'
            });
        }

        // Log file details
        console.log('📁 File details:', {
            path: req.file.path,
            size: req.file.size,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype
        });

        // Check if file exists on disk
        const fs = require('fs');
        if (!fs.existsSync(req.file.path)) {
            console.log('❌ File does not exist on disk:', req.file.path);
            return res.status(500).json({
                success: false,
                error: 'File upload failed - file not found on server'
            });
        }

        const adminId = req.user._id;
        console.log('👤 Admin ID:', adminId);
        
        const result = await BulkDataOperations.importDataFromCSV(req.file.path, adminId);
        console.log('✅ Import result:', result);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('🔥 [CONTROLLER ERROR]', error);
        console.error('🔥 Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

    static async getAnalytics(req, res) {
        try {
            const analytics = await BulkDataOperations.generateAnalytics();

            res.status(200).json({
                success: true,
                analytics
            });
        } catch (error) {
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