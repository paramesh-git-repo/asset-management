const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });
require('./db');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    database: 'Connected to MongoDB'
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const dbName = mongoose.connection.db ? mongoose.connection.db.databaseName : 'Not connected';
    
    res.json({
      message: 'Database test',
      connectionState: dbState,
      databaseName: dbName,
      collections: mongoose.connection.db ? await mongoose.connection.db.listCollections().toArray() : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/api/test`);
  console.log(`🗄️  DB Test URL: http://localhost:${PORT}/api/test-db`);
});
