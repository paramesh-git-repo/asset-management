const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// MongoDB connection options
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    w: 'majority'
};

const connectDB = async () => {
  try {
    console.log("🔍 Connection URI:", process.env.MONGODB_URI); // add this for debugging
    console.log('🔍 Attempting to connect to MongoDB...');
    console.log('🔍 Is local MongoDB?', process.env.MONGODB_URI?.includes('localhost'));
    
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log("✅ MongoDB connected successfully!");
    console.log("🔍 Database:", mongoose.connection.db.databaseName);
    console.log("🔍 Host:", mongoose.connection.host);
    console.log("🔍 Port:", mongoose.connection.port);
    console.log("🔍 Connection state:", mongoose.connection.readyState);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("❌ Error details:", err);
    process.exit(1);
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
  console.log('🔍 Database:', mongoose.connection.db.databaseName);
  console.log('🔍 Host:', mongoose.connection.host);
  console.log('🔍 Port:', mongoose.connection.port);
  console.log('🔍 Connection state:', mongoose.connection.readyState);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  console.error('🔍 Error details:', {
    name: err.name,
    message: err.message,
    code: err.code
  });
  
  // Try to reconnect after 5 seconds
  setTimeout(() => {
    console.log('🔄 Attempting to reconnect...');
    connectDB();
  }, 5000);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected — attempting reconnect...');
  console.log('🔍 Current connection state:', mongoose.connection.readyState);
  setTimeout(() => {
    console.log('🔄 Attempting to reconnect after disconnect...');
    connectDB();
  }, 5000);
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
  console.log('🔍 Connection state after reconnection:', mongoose.connection.readyState);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

// Call the connection function
connectDB();

module.exports = { connectDB, mongoose };