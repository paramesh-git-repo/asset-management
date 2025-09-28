const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Database connection
require('./db');

const assetRoutes = require('./routes/assetRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const timelineRoutes = require('./routes/timelineRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet());
app.use(compression());

// ✅ CORS setup
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://asset-management-react-paramesh.s3-website-us-east-1.amazonaws.com",
    "https://asset-management-react-paramesh.s3-website-us-east-1.amazonaws.com",
    "https://d1yigrn7s04vaz.cloudfront.net",
    "https://d1yigrn7s04vaz.cloudfront.net"
    // Add future custom domains here
  ],
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Root health route
app.get("/", (req,res)=> res.json({ 
  message: "✅ Backend running on Elastic Beanstalk",
  uptime: process.uptime(),
  timestamp: new Date().toISOString()
}));

// ✅ API index
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

// Health
app.get('/api/health', (req, res)=> res.json({ status:"ok", timestamp: new Date(), uptime: process.uptime() }));

// Mount routes
app.use('/api/assets', assetRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/timeline', timelineRoutes);

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: (process.env.NODE_ENV === 'development') ? err.message : 'Something went wrong!'
  });
});

// ✅ 404 handler
app.use('*', (req, res)=> {
  res.status(404).json({ status:"error", message:"Route not found", path:req.originalUrl });
});

// Start
app.listen(PORT, "0.0.0.0", ()=>{
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;