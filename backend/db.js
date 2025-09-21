const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// MongoDB Atlas connection string from environment variable
const mongoURI = process.env.MONGODB_URI;

console.log('🔍 Attempting to connect to MongoDB...');
console.log('🔍 Connection URI:', mongoURI);
console.log('🔍 Is local MongoDB?', mongoURI.includes('localhost'));

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

mongoose.connect(mongoURI, mongoOptions)
.then(() => {
    console.log("✅ MongoDB Atlas connected successfully!");
    console.log("🔍 Database:", mongoose.connection.db.databaseName);
    console.log("🔍 Host:", mongoose.connection.host);
    console.log("🔍 Port:", mongoose.connection.port);
    console.log("🔍 Connection state:", mongoose.connection.readyState);
})
.catch(err => {
    console.error('❌ Initial connection failed:', err.message);
    console.error("❌ MongoDB Atlas connection error:", err);
    console.error("❌ Error details:", err.message);
    console.error("❌ Error code:", err.code);
    console.error("❌ Error name:", err.name);
});

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
    mongoose.connect(mongoURI, mongoOptions);
  }, 5000);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected — attempting reconnect...');
  console.log('🔍 Current connection state:', mongoose.connection.readyState);
  setTimeout(() => {
    console.log('🔄 Attempting to reconnect after disconnect...');
    mongoose.connect(mongoURI, mongoOptions);
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

module.exports = mongoose;
