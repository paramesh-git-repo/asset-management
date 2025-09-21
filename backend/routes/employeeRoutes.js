const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Asset = require('../models/Asset');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requirePermission, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/employees';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'employee-' + uniqueSuffix + path.extname(file.originalname));
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

// Validation middleware
const validateEmployee = [
  body('employeeId').trim().isLength({ min: 1 }).withMessage('Employee ID is required'),
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required and must be less than 50 characters'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required and must be less than 50 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department').trim().isLength({ min: 1 }).withMessage('Department is required'),
  body('position').trim().isLength({ min: 1 }).withMessage('Position is required'),
  body('hireDate').isISO8601().withMessage('Valid hire date is required'),
  body('phone').optional().matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number')
];

// GET all employees with pagination, search, and filtering
router.get('/', authenticateToken, requirePermission('view_employees'), async (req, res) => {
  try {
    // Check database connection first
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected. State:', mongoose.connection.readyState);
      return res.status(500).json({
        status: 'error',
        message: 'Database not connected',
        error: `Connection state: ${mongoose.connection.readyState}`
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.manager) filter.manager = req.query.manager;
    
    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { employeeId: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { department: { $regex: req.query.search, $options: 'i' } },
        { position: { $regex: req.query.search, $options: 'i' } }
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
    
    const employees = await Employee.find(filter)
      .populate('manager', 'firstName lastName employeeId')
      .populate('subordinates', 'firstName lastName employeeId department')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Employee.countDocuments(filter);
    
    res.json({
      status: 'success',
      data: employees,
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
      message: 'Error fetching employees',
      error: error.message
    });
  }
});

// GET employee by ID
router.get('/:id', authenticateToken, requirePermission('view_employees'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('manager', 'firstName lastName employeeId department email')
      .populate('subordinates', 'firstName lastName employeeId department position');
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    // Get assigned assets
    const assignedAssets = await Asset.find({ assignedTo: req.params.id, isActive: true })
      .select('name assetId category status location');
    
    res.json({
      status: 'success',
      data: {
        ...employee.toObject(),
        assignedAssets
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching employee',
      error: error.message
    });
  }
});

// POST create new employee
router.post('/', authenticateToken, requirePermission('create_employees'), upload.single('profileImage'), validateEmployee, async (req, res) => {
  try {
    console.log('🔍 POST /employees - Request body:', JSON.stringify(req.body, null, 2));
    
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
    
    // Check if employee ID already exists
    if (req.body.employeeId) {
      const existingEmployee = await Employee.findOne({ employeeId: req.body.employeeId });
      if (existingEmployee) {
        return res.status(400).json({
          status: 'error',
          message: 'Employee ID already exists'
        });
      }
    }
    
    // Check if email already exists
    const existingEmail = await Employee.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists'
      });
    }
    
    // Handle file upload
    if (req.file) {
      req.body.profileImage = `/uploads/employees/${req.file.filename}`;
    }
    
    console.log('🔍 Creating Employee model with data:', JSON.stringify(req.body, null, 2));
    
    const employee = new Employee(req.body);
    console.log('🔍 Employee model created:', employee);
    
    console.log('🔍 Attempting to save employee to MongoDB...');
    await employee.save();
    console.log('✅ Employee saved successfully to MongoDB');
    
    console.log('🔍 Fetching populated employee...');
    const populatedEmployee = await Employee.findById(employee._id)
      .populate('manager', 'firstName lastName employeeId')
      .populate('subordinates', 'firstName lastName employeeId department');
    console.log('✅ Employee populated successfully:', populatedEmployee);
    
    res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      data: populatedEmployee
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating employee',
      error: error.message
    });
  }
});

// PUT update employee
router.put('/:id', authenticateToken, requirePermission('edit_employees'), upload.single('profileImage'), validateEmployee, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    // Check for duplicate employee ID
    if (req.body.employeeId && req.body.employeeId !== employee.employeeId) {
      const existingEmployee = await Employee.findOne({ employeeId: req.body.employeeId });
      if (existingEmployee) {
        return res.status(400).json({
          status: 'error',
          message: 'Employee ID already exists'
        });
      }
    }
    
    // Check for duplicate email
    if (req.body.email && req.body.email !== employee.email) {
      const existingEmail = await Employee.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists'
        });
      }
    }
    
    // Handle file upload
    if (req.file) {
      // Delete old image if exists
      if (employee.profileImage && employee.profileImage !== '/uploads/employees/default.png') {
        const oldImagePath = path.join(__dirname, '..', employee.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      req.body.profileImage = `/uploads/employees/${req.file.filename}`;
    }
    
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName employeeId')
     .populate('subordinates', 'firstName lastName employeeId department');
    
    res.json({
      status: 'success',
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating employee',
      error: error.message
    });
  }
});

// DELETE employee (soft delete)
router.delete('/:id', authenticateToken, requirePermission('delete_employees'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    // Check if employee has assigned assets
    const assignedAssets = await Asset.countDocuments({ assignedTo: req.params.id, isActive: true });
    if (assignedAssets > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete employee. They have ${assignedAssets} assigned assets.`
      });
    }
    
    // Soft delete
    employee.isActive = false;
    employee.status = 'Terminated';
    await employee.save();
    
    res.json({
      status: 'success',
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting employee',
      error: error.message
    });
  }
});

// PATCH update employee status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required'
      });
    }
    
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    await employee.updateStatus(status);
    
    const updatedEmployee = await Employee.findById(req.params.id)
      .populate('manager', 'firstName lastName employeeId')
      .populate('subordinates', 'firstName lastName employeeId department');
    
    res.json({
      status: 'success',
      message: 'Employee status updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating employee status',
      error: error.message
    });
  }
});

// PATCH add skill to employee
router.patch('/:id/skills', async (req, res) => {
  try {
    const { skill } = req.body;
    
    if (!skill) {
      return res.status(400).json({
        status: 'error',
        message: 'Skill is required'
      });
    }
    
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    await employee.addSkill(skill);
    
    res.json({
      status: 'success',
      message: 'Skill added successfully',
      data: employee.skills
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error adding skill',
      error: error.message
    });
  }
});

// PATCH add performance review
router.patch('/:id/reviews', async (req, res) => {
  try {
    const { reviewDate, reviewer, rating, comments, goals } = req.body;
    
    if (!reviewDate || !reviewer || !rating || !comments) {
      return res.status(400).json({
        status: 'error',
        message: 'Review date, reviewer, rating, and comments are required'
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    const review = {
      reviewDate: new Date(reviewDate),
      reviewer,
      rating: parseInt(rating),
      comments,
      goals: goals || []
    };
    
    await employee.addPerformanceReview(review);
    
    res.json({
      status: 'success',
      message: 'Performance review added successfully',
      data: employee.performanceReviews
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error adding performance review',
      error: error.message
    });
  }
});

// GET employee statistics
router.get('/stats/overview', authenticateToken, requirePermission('view_reports'), async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const activeEmployees = await Employee.countDocuments({ status: 'Active', isActive: true });
    const onLeaveEmployees = await Employee.countDocuments({ status: 'On Leave', isActive: true });
    const terminatedEmployees = await Employee.countDocuments({ status: 'Terminated', isActive: true });
    
    const departmentStats = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const avgSalary = await Employee.aggregate([
      { $match: { isActive: true, salary: { $exists: true, $ne: null } } },
      { $group: { _id: null, average: { $avg: '$salary' } } }
    ]);
    
    res.json({
      status: 'success',
      data: {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        terminatedEmployees,
        departmentStats,
        averageSalary: avgSalary[0]?.average || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching employee statistics',
      error: error.message
    });
  }
});

module.exports = router;
