#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Asset Management Backend Setup');
console.log('================================\n');

// Check if Node.js is installed
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js ${nodeVersion} detected`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Check if npm is available
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm ${npmVersion} detected`);
} catch (error) {
  console.error('❌ npm is not available. Please install npm first.');
  process.exit(1);
}

// Check if MongoDB is running
console.log('\n🔍 Checking MongoDB connection...');
try {
  // Try to connect to MongoDB (this is a simple check)
  const { MongoClient } = require('mongodb');
  const client = new MongoClient('mongodb://localhost:27017');
  
  client.connect()
    .then(() => {
      console.log('✅ MongoDB is running on localhost:27017');
      client.close();
    })
    .catch(() => {
      console.log('⚠️  MongoDB is not running on localhost:27017');
      console.log('   Please start MongoDB or update config.env with your MongoDB URI');
    });
} catch (error) {
  console.log('⚠️  MongoDB check skipped (mongodb package not installed yet)');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Check if config.env exists
const configPath = path.join(__dirname, 'config.env');
if (!fs.existsSync(configPath)) {
  console.log('\n⚠️  config.env file not found');
  console.log('   Please create config.env with your configuration');
  console.log('   Example:');
  console.log('   MONGODB_URI=mongodb://localhost:27017/asset_management');
  console.log('   PORT=5000');
  console.log('   JWT_SECRET=your_secret_key_here');
  console.log('   JWT_EXPIRE=24h');
} else {
  console.log('✅ config.env file found');
}

// Create uploads directories
console.log('\n📁 Creating upload directories...');
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads', 'assets'),
  path.join(__dirname, 'uploads', 'employees')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running');
console.log('2. Update config.env with your settings');
console.log('3. Run the following commands:');
console.log('   npm run seed    # Seed the database with sample data');
console.log('   npm run dev     # Start the development server');
console.log('\n🌐 The API will be available at: http://localhost:5000/api');
console.log('📚 Check README.md for detailed documentation');
console.log('\n🔐 Default admin credentials:');
console.log('   Username: admin');
console.log('   Password: password');

console.log('\n🚀 Happy coding!');
