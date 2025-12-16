const DataDistribution = require('../users/data.distribute');
console.log('DataDistribution schema assignedType enum:', DataDistribution.schema.path('assignedType').enumValues);
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