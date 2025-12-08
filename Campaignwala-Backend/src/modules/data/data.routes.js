const express = require('express');
const router = express.Router();
const DataController = require('./data.controller');
const { authenticate, authorize } = require('../../middleware/auth');

// ==================== ADMIN ROUTES ====================

// Add bulk data
router.post('/admin/bulk-add', 
    authenticate, 
    authorize(['admin']), 
    DataController.addBulkData
);

// Assign data to TL
router.post('/admin/assign-to-tl', 
    authenticate, 
    authorize(['admin']), 
    DataController.assignToTL
);

// Assign data to user
router.post('/admin/assign-to-user', 
    authenticate, 
    authorize(['admin']), 
    DataController.assignToUser
);

// Get pending data
router.get('/admin/pending-data', 
    authenticate, 
    authorize(['admin']), 
    DataController.getPendingData
);

// Get batch statistics
router.get('/admin/batch-stats/:batchNumber', 
    authenticate, 
    authorize(['admin']), 
    DataController.getBatchStats
);

// ==================== TL ROUTES ====================

// Get TL's assigned data
router.get('/tl/data', 
    authenticate, 
    authorize(['TL']), 
    DataController.getTLData
);

// TL distributes data to team
router.post('/tl/distribute', 
    authenticate, 
    authorize(['TL']), 
    DataController.tlDistributeData
);

// TL withdraws data from team
router.post('/tl/withdraw', 
    authenticate, 
    authorize(['TL']), 
    DataController.tlWithdrawData
);

// Get TL statistics
router.get('/tl/statistics', 
    authenticate, 
    authorize(['TL']), 
    DataController.getTLStatistics
);

// Get TL's withdrawn data
router.get('/tl/withdrawn-data', 
    authenticate, 
    authorize(['TL']), 
    DataController.getWithdrawnData
);

// ==================== USER ROUTES ====================

// Get user's assigned data
router.get('/user/data', 
    authenticate, 
    authorize(['user']), 
    DataController.getUserData
);

// Update data status
router.put('/user/update-status', 
    authenticate, 
    authorize(['user']), 
    DataController.updateDataStatus
);

// Get user statistics
router.get('/user/statistics', 
    authenticate, 
    authorize(['user']), 
    DataController.getUserStats
);

// ==================== COMMON ROUTES ====================

// Get data by ID
router.get('/:id', 
    authenticate, 
    DataController.getDataById
);

// Search data
router.get('/search', 
    authenticate, 
    DataController.searchData
);

// Export data
router.get('/export/csv', 
    authenticate, 
    DataController.exportData
);

// Import data
router.post('/import/csv', 
    authenticate, 
    authorize(['admin']), 
    DataController.importData
);

// Get analytics
router.get('/analytics', 
    authenticate, 
    DataController.getAnalytics
);

// Batch operations
router.get('/batches', 
    authenticate, 
    authorize(['admin']), 
    DataController.getAllBatches
);

router.get('/batches/:id', 
    authenticate, 
    authorize(['admin']), 
    DataController.getBatchDetails
);

router.post('/batches', 
    authenticate, 
    authorize(['admin']), 
    DataController.createBatch
);

router.put('/batches/:id', 
    authenticate, 
    authorize(['admin']), 
    DataController.updateBatch
);

router.delete('/batches/:id', 
    authenticate, 
    authorize(['admin']), 
    DataController.deleteBatch
);

module.exports = router;