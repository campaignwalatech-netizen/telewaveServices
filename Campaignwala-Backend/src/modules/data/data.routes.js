const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DataController = require('./data.controller');
const { protect, authorize, requireAdmin, requireTL } = require('../../middleware/user.middleware');
// const { authenticate } = require('../../middleware/auth');


// ==================== ADMIN ROUTES ====================

// Ensure uploads directory exists
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Update this section in data.routes.js:

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Ensure directory exists for each upload
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'text/csv', 
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // Increase to 10MB for Excel files
  }
});

// Add these routes:

// Get distribution counts
router.get('/admin/distribution-counts', 
  protect, 
  authorize('admin'), 
  DataController.getDistributionCounts
);

router.get('/admin/batches', 
  protect,
  authorize('admin'), 
  DataController.getAllBatches
);

// Export data to Excel
router.get('/export/excel', 
    protect,
    DataController.exportDataExcel
);

// Download Excel template
router.get('/download-template',
    protect,
    DataController.downloadTemplate
);

// Add this route after other admin routes
router.post('/admin/bulk-assign', 
    // authenticateToken,
    protect, 
    requireAdmin,   
    DataController.bulkAssignData
);

// Admin withdraws data from anyone
router.post('/admin/withdraw-data', 
    protect, 
    authorize('admin'), 
    DataController.adminWithdrawData
);
// Add bulk data
router.post('/admin/bulk-add', 
    protect, 
    authorize('admin'), 
    DataController.addBulkData
);

// Assign data to TL
router.post('/admin/assign-to-tl', 
    protect, 
    authorize('admin'), 
    DataController.assignToTL
);

// Assign data to user
router.post('/admin/assign-to-user', 
    protect, 
    authorize('admin'), 
    DataController.assignToUser
);

// Get pending data
router.get('/admin/pending-data',
    protect,
    requireAdmin,
    DataController.getPendingData);

// Get batch statistics
router.get('/admin/batch-stats/:batchNumber', 
    protect, 
    authorize('admin'), 
    DataController.getBatchStats
);

// ==================== TL ROUTES ====================

// Get TL's assigned data
router.get('/tl/data', 
    protect,
    authorize('TL'), 
    DataController.getTLData
);

// TL distributes data to team
router.post('/tl/distribute', 
    protect, 
    authorize('TL'), 
    DataController.tlDistributeData
);

// TL withdraws data from team
router.post('/tl/withdraw', 
    protect, 
    authorize('TL'), 
    DataController.tlWithdrawData
);

// Get TL statistics
router.get('/tl/statistics', 
    protect,
    authorize('TL'), 
    DataController.getTLStatistics
);

// Get TL's withdrawn data
router.get('/tl/withdrawn-data', 
    protect, 
    authorize('TL'), 
    DataController.getWithdrawnData
);

// ==================== USER ROUTES ====================

// Get user's assigned data
router.get('/user/data', 
    protect, 
    authorize('user'), 
    DataController.getUserData
);

// Update data status
router.put('/user/update-status', 
    protect, 
    authorize('user'), 
    DataController.updateDataStatus
);

// Get user statistics
router.get('/user/statistics', 
    protect, 
    authorize('user'), 
    DataController.getUserStats
);

// ==================== COMMON ROUTES ====================

// Get data by ID
router.get('/:id', 
    protect,
    DataController.getDataById
);

// Search data
router.get('/search', 
    protect, 
    DataController.searchData
);

// Export data
router.get('/export/csv', 
    protect, 
    DataController.exportData
);

// Add debug middleware
// router.use('/import/csv', (req, res, next) => {
//   console.log('📁 [DEBUG] Import route hit');
//   console.log('📁 [DEBUG] Headers:', req.headers);
//   console.log('📁 [DEBUG] Method:', req.method);
//   next();
// });

// Import data
router.post('/import/csv', 
    protect, 
    authorize('admin'),
    (req, res, next) => {
      console.log('📁 [DEBUG] Before multer middleware');
      console.log('📁 [DEBUG] Request headers:', req.headers['content-type']);
      console.log('📁 [DEBUG] Has body:', !!req.body);
      next();
    },
    upload.single('csv'),
    (req, res, next) => {
      console.log('📁 [DEBUG] After multer middleware');
      console.log('📁 [DEBUG] File received:', req.file);
      console.log('📁 [DEBUG] Body fields:', req.body);
      next();
    },
    DataController.importData
);

// Test endpoint
router.post('/test-upload', 
    upload.single('csv'),
    (req, res) => {
        try {
            console.log('✅ Test upload - File:', req.file);
            console.log('✅ Test upload - Body:', req.body);
            
            // Check if file exists
            const fs = require('fs');
            if (req.file && fs.existsSync(req.file.path)) {
                const content = fs.readFileSync(req.file.path, 'utf8');
                console.log('✅ File content (first 200 chars):', content.substring(0, 200));
                
                // Clean up
                fs.unlinkSync(req.file.path);
            }
            
            res.json({
                success: true,
                message: 'File received successfully',
                file: req.file ? {
                    originalname: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                } : null,
                body: req.body
            });
        } catch (error) {
            console.error('❌ Test upload error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);

// Get analytics
router.get('/analytics', 
    protect, 
    DataController.getAnalytics
);

// Batch operations
router.get('/batches', 
    protect, 
    authorize('admin'), 
    DataController.getAllBatches
);

router.get('/batches/:id', 
    protect, 
    authorize('admin'), 
    DataController.getBatchDetails
);

router.post('/batches', 
    protect, 
    authorize('admin'), 
    DataController.createBatch
);

router.put('/batches/:id', 
    protect, 
    authorize('admin'), 
    DataController.updateBatch
);

router.delete('/batches/:id', 
    protect, 
    authorize('admin'), 
    DataController.deleteBatch
);

module.exports = router;