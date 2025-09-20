const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@assetmanagement.com',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'Admin',
    department: 'IT',
    position: 'System Administrator'
  },
  {
    username: 'manager1',
    email: 'manager@assetmanagement.com',
    password: 'manager123',
    firstName: 'John',
    lastName: 'Manager',
    role: 'Manager',
    department: 'Operations',
    position: 'Operations Manager'
  },
  {
    username: 'employee1',
    email: 'employee@assetmanagement.com',
    password: 'employee123',
    firstName: 'Jane',
    lastName: 'Employee',
    role: 'Employee',
    department: 'HR',
    position: 'HR Specialist'
  },
  {
    username: 'it.manager',
    email: 'it.manager@assetmanagement.com',
    password: 'itmanager123',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'Manager',
    department: 'IT',
    position: 'IT Manager'
  },
  {
    username: 'finance.employee',
    email: 'finance@assetmanagement.com',
    password: 'finance123',
    firstName: 'Sarah',
    lastName: 'Wilson',
    role: 'Employee',
    department: 'Finance',
    position: 'Financial Analyst'
  }
];

async function seedUsers() {
  try {
    console.log('🔍 MONGODB_URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asset-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    console.log('🔍 Database name:', mongoose.connection.db.databaseName);

    // Clear existing users (optional - remove this line to keep existing users)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create sample users with pre-hashed passwords
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (userData) => {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        return {
          ...userData,
          password: hashedPassword,
          _passwordAlreadyHashed: true
        };
      })
    );
    
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ Created ${createdUsers.length} sample users:`);

    createdUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
    });

    console.log('\n🎉 User seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('   Admin: admin@assetmanagement.com / admin123');
    console.log('   Manager: manager@assetmanagement.com / manager123');
    console.log('   Employee: employee@assetmanagement.com / employee123');
    console.log('   IT Manager: it.manager@assetmanagement.com / itmanager123');
    console.log('   Finance Employee: finance@assetmanagement.com / finance123');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeder
if (require.main === module) {
  seedUsers();
}

module.exports = { seedUsers, sampleUsers };
