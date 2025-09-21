const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Import database connection
require('./db');

// Import routes
const assetRoutes = require('./routes/assetRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const timelineRoutes = require('./routes/timelineRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || [
    'http://localhost:3000', 
    'https://your-frontend-domain.com',
    'http://asset-management-react-paramesh.s3-website-us-east-1.amazonaws.com',
    'https://asset-management-react-paramesh.s3-website-us-east-1.amazonaws.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: "API root is working 🚀",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      assets: "/api/assets", 
      employees: "/api/employees",
      dashboard: "/api/dashboard",
      health: "/api/health"
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  const mongoose = require('mongoose');
  const connectionState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };
  
  console.log('🔍 Database status check - State:', connectionState, states[connectionState]);
  
  res.json({
    status: connectionState === 1 ? 'connected' : 'disconnected',
    connectionState,
    stateName: states[connectionState],
    database: mongoose.connection.db ? mongoose.connection.db.databaseName : 'unknown',
    host: mongoose.connection.host || 'unknown',
    port: mongoose.connection.port || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to verify body parsing
app.post('/api/test-body', (req, res) => {
  console.log('🔍 Test body endpoint - Request body:', req.body);
  console.log('🔍 Test body endpoint - Request headers:', req.headers);
  res.json({
    message: 'Body parsing test',
    body: req.body,
    headers: req.headers
  });
});

// Test endpoint to verify database operations
app.get('/api/test-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    console.log('🔍 Testing database connection...');
    const connectionState = mongoose.connection.readyState;
    console.log('🔍 Connection state:', connectionState);
    if (connectionState !== 1) {
      return res.status(500).json({ 
        error: 'Database not connected', 
        state: connectionState 
      });
    }
    
    const Asset = require('./models/Asset');
    const count = await Asset.countDocuments();
    console.log('✅ Database operation successful. Asset count:', count);
    
    res.json({ 
      message: 'Database connection and operations working',
      connectionState,
      assetCount: count
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({ 
      error: 'Database test failed', 
      message: error.message 
    });
  }
});

// Test endpoint specifically for employees
app.get('/api/test-employees', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    console.log('🔍 Testing employee endpoint...');
    const connectionState = mongoose.connection.readyState;
    console.log('🔍 Connection state:', connectionState);
    
    if (connectionState !== 1) {
      return res.status(500).json({ 
        error: 'Database not connected', 
        state: connectionState 
      });
    }
    
    const Employee = require('./models/Employee');
    const employees = await Employee.find({}).limit(5);
    const count = await Employee.countDocuments();
    
    console.log('✅ Employee test successful. Count:', count);
    console.log('✅ Sample employees:', employees.map(e => ({ id: e._id, name: `${e.firstName} ${e.lastName}` })));
    
    res.json({ 
      message: 'Employee endpoint working',
      connectionState,
      employeeCount: count,
      sampleEmployees: employees.map(e => ({ id: e._id, name: `${e.firstName} ${e.lastName}`, email: e.email }))
    });
  } catch (error) {
    console.error('❌ Employee test failed:', error);
    res.status(500).json({ 
      error: 'Employee test failed', 
      message: error.message,
      stack: error.stack
    });
  }
});

// Mount API routes
app.use('/api/assets', assetRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/timeline', timelineRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({ 
    status: 'error', 
    message: err.message || 'Something went wrong!',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  const mongoose = require('mongoose');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  const mongoose = require('mongoose');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

module.exports = app;
