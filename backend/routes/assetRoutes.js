const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requirePermission, requireRole } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/assets';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'asset-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed!'));
    }
  }
});

// Validation for creating new assets
const validateAssetCreate = [
  body('assetId').notEmpty().withMessage('Asset ID is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('name').optional().trim().isLength({ max: 100 }).withMessage('Name must be less than 100 characters if provided'),
  body('category').optional().isIn(['Electronics', 'Furniture', 'Vehicles', 'Machinery', 'Software', 'Other', 'IT Equipment', 'Office Furniture']).withMessage('Invalid category if provided'),
  body('status').optional().isIn(['Active', 'Inactive', 'Maintenance', 'Retired', 'Lost', 'Available', 'Repaired']).withMessage('Invalid status if provided'),
  // Accept ANY other fields without validation
];

// Validation for updating assets (more lenient)
const validateAssetUpdate = [
  body('assetId').optional().notEmpty().withMessage('Asset ID cannot be empty if provided'),
  body('location').optional().notEmpty().withMessage('Location cannot be empty if provided'),
  body('name').optional().trim().isLength({ max: 100 }).withMessage('Name must be less than 100 characters if provided'),
  body('category').optional().isIn(['Electronics', 'Furniture', 'Vehicles', 'Machinery', 'Software', 'Other', 'IT Equipment', 'Office Furniture']).withMessage('Invalid category if provided'),
  body('status').optional().isIn(['Active', 'Inactive', 'Maintenance', 'Retired', 'Lost', 'Available', 'Repaired']).withMessage('Invalid status if provided'),
  // Accept ANY other fields without validation
];

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Asset route is working', timestamp: new Date().toISOString() });
});

// GET all assets with pagination, search, and filtering
router.get('/', authenticateToken, requirePermission('view_assets'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Only show active assets by default (exclude soft-deleted assets)
    filter.isActive = true;
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.location) filter.location = { $regex: req.query.location, $options: 'i' };
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    
    // Allow including inactive assets if explicitly requested
    if (req.query.includeInactive === 'true') {
      delete filter.isActive;
    }
    
    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { assetId: { $regex: req.query.search, $options: 'i' } },
        { serialNumber: { $regex: req.query.search, $options: 'i' } },
        { manufacturer: { $regex: req.query.search, $options: 'i' } },
        { model: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Sort options
    let sort = {};
    if (req.query.sortBy) {
      const order = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = order;
    } else {
      sort = { createdAt: -1 };
    }
    
    const assets = await Asset.find(filter)
      .populate('assignedTo', 'firstName lastName employeeId department')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Asset.countDocuments(filter);
    
    res.json({
      status: 'success',
      data: assets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching assets',
      error: error.message
    });
  }
});

// GET asset by ID
router.get('/:id', authenticateToken, requirePermission('view_assets'), async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName employeeId department email phone');
    
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset not found'
      });
    }
    
    res.json({
      status: 'success',
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching asset',
      error: error.message
    });
  }
});

// POST create new asset
router.post('/', authenticateToken, requirePermission('create_assets'), upload.single('image'), validateAssetCreate, async (req, res) => {
  try {
    console.log('🔍 POST /assets - Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Request headers:', req.headers);
    
    // Check database connection first
    const mongoose = require('mongoose');
    console.log('🔍 MongoDB connection state:', mongoose.connection.readyState);
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected. State:', mongoose.connection.readyState);
      return res.status(500).json({
        status: 'error',
        message: 'Database not connected',
        error: `Connection state: ${mongoose.connection.readyState}`
      });
    }
    
    console.log('🔍 MongoDB connection ready: true');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Check if asset ID already exists
    if (req.body.assetId) {
      const existingAsset = await Asset.findOne({ assetId: req.body.assetId });
      if (existingAsset) {
        return res.status(400).json({
          status: 'error',
          message: 'Asset ID already exists'
        });
      }
    }
    
    // Check if serial number already exists
    if (req.body.serialNumber) {
      const existingAsset = await Asset.findOne({ serialNumber: req.body.serialNumber });
      if (existingAsset) {
        return res.status(400).json({
          status: 'error',
          message: 'Serial number already exists'
        });
      }
    }
    
    // Handle file upload
    if (req.file) {
      req.body.image = `/uploads/assets/${req.file.filename}`;
    }
    
    console.log('🔍 Creating Asset model with data:', JSON.stringify(req.body, null, 2));
    
    const asset = new Asset(req.body);
    console.log('🔍 Asset model created:', asset);
    
    console.log('🔍 Attempting to save asset to MongoDB...');
    await asset.save();
    console.log('✅ Asset saved successfully to MongoDB');
    
    console.log('🔍 Fetching populated asset...');
    const populatedAsset = await Asset.findById(asset._id)
      .populate('assignedTo', 'firstName lastName employeeId department');
    console.log('✅ Asset populated successfully:', populatedAsset);
    
    res.status(201).json({
      status: 'success',
      message: 'Asset created successfully',
      data: populatedAsset
    });
  } catch (error) {
    console.error('❌ Error in asset creation:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Error creating asset',
      error: error.message
    });
  }
});

// PUT update asset
router.put('/:id', authenticateToken, requirePermission('edit_assets'), upload.single('image'), validateAssetUpdate, async (req, res) => {
  try {
    console.log('🔍 PUT /assets/:id - Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 PUT /assets/:id - Asset ID:', req.params.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Try to find asset by MongoDB _id first, then by assetId field
    let asset = await Asset.findById(req.params.id);
    if (!asset) {
      // If not found by _id, try to find by assetId field
      console.log('🔍 Asset not found by _id, trying assetId field:', req.params.id);
      asset = await Asset.findOne({ assetId: req.params.id });
      if (asset) {
        console.log('✅ Asset found by assetId field:', asset.assetId);
      }
    } else {
      console.log('✅ Asset found by _id:', asset.assetId);
    }
    
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset not found'
      });
    }
    
    // Check for duplicate asset ID
    if (req.body.assetId && req.body.assetId !== asset.assetId) {
      const existingAsset = await Asset.findOne({ assetId: req.body.assetId });
      if (existingAsset) {
        return res.status(400).json({
          status: 'error',
          message: 'Asset ID already exists'
        });
      }
    }
    
    // Check for duplicate serial number
    if (req.body.serialNumber && req.body.serialNumber !== asset.serialNumber) {
      const existingAsset = await Asset.findOne({ serialNumber: req.body.serialNumber });
      if (existingAsset) {
        return res.status(400).json({
          status: 'error',
          message: 'Serial number already exists'
        });
      }
    }
    
    // Handle file upload
    if (req.file) {
      // Delete old image if exists
      if (asset.image && asset.image !== '/uploads/assets/default.png') {
        const oldImagePath = path.join(__dirname, '..', asset.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      req.body.image = `/uploads/assets/${req.file.filename}`;
    }
    
    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName employeeId department');
    
    res.json({
      status: 'success',
      message: 'Asset updated successfully',
      data: updatedAsset
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating asset',
      error: error.message
    });
  }
});

// DELETE asset (soft delete)
router.delete('/:id', authenticateToken, requirePermission('delete_assets'), async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset not found'
      });
    }
    
    // Soft delete
    asset.isActive = false;
    asset.status = 'Retired';
    await asset.save();
    
    res.json({
      status: 'success',
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting asset',
      error: error.message
    });
  }
});

// PATCH assign asset to employee
router.patch('/:id/assign', async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID is required'
      });
    }
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset not found'
      });
    }
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    asset.assignedTo = employeeId;
    await asset.save();
    
    const updatedAsset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName employeeId department');
    
    res.json({
      status: 'success',
      message: 'Asset assigned successfully',
      data: updatedAsset
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error assigning asset',
      error: error.message
    });
  }
});

// PATCH update asset status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required'
      });
    }
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset not found'
      });
    }
    
    await asset.updateStatus(status);
    
    const updatedAsset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName employeeId department');
    
    res.json({
      status: 'success',
      message: 'Asset status updated successfully',
      data: updatedAsset
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating asset status',
      error: error.message
    });
  }
});

// GET asset statistics
router.get('/stats/overview', authenticateToken, requirePermission('view_reports'), async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments({ isActive: true });
    const activeAssets = await Asset.countDocuments({ status: 'Active', isActive: true });
    const maintenanceAssets = await Asset.countDocuments({ status: 'Maintenance', isActive: true });
    const retiredAssets = await Asset.countDocuments({ status: 'Retired', isActive: true });
    
    const totalValue = await Asset.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$currentValue' } } }
    ]);
    
    const categoryStats = await Asset.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      status: 'success',
      data: {
        totalAssets,
        activeAssets,
        maintenanceAssets,
        retiredAssets,
        totalValue: totalValue[0]?.total || 0,
        categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching asset statistics',
      error: error.message
    });
  }
});

module.exports = router;
