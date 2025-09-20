const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function debugToken() {
  try {
    console.log('JWT Secret exists:', !!process.env.JWT_SECRET);
    console.log('JWT Secret length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    const users = await User.find({}).select('_id username email role');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`  - ${user._id} | ${user.username} | ${user.email} | ${user.role}`);
    });
    
    // Test with a sample token
    const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzJkNmYyZjVhNjg1ZmY1ODllMThhNSIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGFzc2V0bWFuYWdlbWVudC5jb20iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NTc2MDAyMTYsImV4cCI6MTc1NzY4NjYxNn0.bbnXpu1GaFUprob1f708oYaUGVD0oxYUh445feQavVA';
    
    try {
      const decoded = jwt.verify(sampleToken, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      // Check if user exists
      const user = await User.findById(decoded.id);
      console.log('User found:', user ? 'Yes' : 'No');
      if (user) {
        console.log('User details:', {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        });
      }
    } catch (error) {
      console.log('Token verification failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugToken();
