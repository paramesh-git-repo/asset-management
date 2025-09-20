const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    if (user.isLocked) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Add user info to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
};

// Middleware to check user roles
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions. Required roles: ' + allowedRoles.join(', ')
      });
    }

    next();
  };
};

// Middleware to check specific permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        status: 'error',
        message: `Permission required: ${permission}`
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }

  next();
};

// Middleware to check if user is manager or admin
const requireManagerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  if (!['Manager', 'Admin'].includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'Manager or Admin access required'
    });
  }

  next();
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireAdmin,
  requireManagerOrAdmin,
  optionalAuth
};
