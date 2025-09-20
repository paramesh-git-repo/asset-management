const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireRole } = require('../middleware/auth');

// Validation middleware
const validateLogin = [
  body('email').trim().isLength({ min: 1 }).withMessage('Email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
];

const validateRegister = [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required and must be less than 50 characters'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required and must be less than 50 characters'),
  body('role').optional().isIn(['Admin', 'Manager', 'Employee']).withMessage('Invalid role')
];

// Login endpoint
router.post('/login', validateLogin, async (req, res) => {
  try {
    console.log("🔍 Login attempt:", req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation errors:", errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email });
    console.log("🔍 Found user:", user ? `${user.email} (${user.role})` : 'No user found');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    console.log("🔍 Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      console.log("❌ Invalid password for user:", user.email);
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log("✅ Login successful for user:", user.email, "Role:", user.role);

    // Return user data without password
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      department: user.department,
      position: user.position
    };

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: userData
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Register endpoint
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password, firstName, lastName, role = 'Employee' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      permissions: getDefaultPermissions(role)
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions
    };

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        token,
        user: userData
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, department, position } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (department) user.department = department;
    if (position) user.position = position;

    await user.save();

    // Return updated user data without password
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      department: user.department,
      position: user.position
    };

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user: userData }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get all users (Admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password');
    
    res.json({
      status: 'success',
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update user role (Admin only)
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!['Admin', 'Manager', 'Employee'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    user.role = role;
    user.permissions = getDefaultPermissions(role);
    await user.save();

    res.json({
      status: 'success',
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Deactivate user (Admin only)
router.put('/users/:id/deactivate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      status: 'success',
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Helper function to get default permissions based on role
function getDefaultPermissions(role) {
  switch (role) {
    case 'Admin':
      return [
        'view_assets',
        'create_assets',
        'edit_assets',
        'delete_assets',
        'view_employees',
        'create_employees',
        'edit_employees',
        'delete_employees',
        'view_reports',
        'manage_users',
        'system_settings'
      ];
    case 'Manager':
      return [
        'view_assets',
        'create_assets',
        'edit_assets',
        'view_employees',
        'create_employees',
        'edit_employees',
        'view_reports'
      ];
    case 'Employee':
    default:
      return [
        'view_assets',
        'view_employees'
      ];
  }
}

module.exports = router;
