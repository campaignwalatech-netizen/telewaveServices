const express = require('express');
const multer = require('multer');
const fs = require('fs'); // Add this
const path = require('path'); // Add this
const router = express.Router();
const DataController = require('./data.controller');
const { authenticateToken, authorize } = require('../../middleware/user.middleware');
const { authenticate } = require('../../middleware/auth');

// ==================== ADMIN ROUTES ====================

// Ensure uploads directory exists
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

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
    const allowedMimeTypes = ['text/csv', 'application/csv'];
    const allowedExtensions = ['.csv'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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

// Add debug middleware
router.use('/import/csv', (req, res, next) => {
  console.log('📁 [DEBUG] Import route hit');
  console.log('📁 [DEBUG] Headers:', req.headers);
  console.log('📁 [DEBUG] Method:', req.method);
  next();
});

// Import data
router.post('/import/csv', 
    authenticateToken, 
    authorize('admin'),
    (req, res, next) => {
      console.log('📁 [DEBUG] Before multer middleware');
      console.log('📁 [DEBUG] Request body keys:', Object.keys(req.body));
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