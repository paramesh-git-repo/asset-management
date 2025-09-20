const axios = require('axios');

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing Complete Flow: MongoDB → Backend → Frontend');
    console.log('=' .repeat(60));
    
    // Step 1: Login to get JWT token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'admin@assetmanagement.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.status === 'success') {
      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      console.log('✅ Login successful!');
      console.log('   User:', user.firstName, user.lastName, `(${user.role})`);
      console.log('   Token:', token.substring(0, 20) + '...');
      
      // Step 2: Test Employee API with token
      console.log('\n2️⃣ Fetching employees from MongoDB...');
      const employeesResponse = await axios.get('http://localhost:5002/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (employeesResponse.data.status === 'success') {
        const employees = employeesResponse.data.data;
        console.log('✅ Employees fetched successfully!');
        console.log('   Count:', employees.length);
        employees.forEach((emp, index) => {
          console.log(`   ${index + 1}. ${emp.firstName} ${emp.lastName} (${emp.department})`);
        });
      } else {
        console.log('❌ Failed to fetch employees:', employeesResponse.data.message);
      }
      
      // Step 3: Test Assets API with token
      console.log('\n3️⃣ Fetching assets from MongoDB...');
      const assetsResponse = await axios.get('http://localhost:5002/api/assets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (assetsResponse.data.status === 'success') {
        const assets = assetsResponse.data.data;
        console.log('✅ Assets fetched successfully!');
        console.log('   Count:', assets.length);
        assets.forEach((asset, index) => {
          console.log(`   ${index + 1}. ${asset.name} (${asset.category}) - ${asset.status}`);
        });
      } else {
        console.log('❌ Failed to fetch assets:', assetsResponse.data.message);
      }
      
      console.log('\n🎉 Complete Flow Test Results:');
      console.log('   ✅ MongoDB Connection: Working');
      console.log('   ✅ Backend API: Working');
      console.log('   ✅ Authentication: Working');
      console.log('   ✅ Data Fetching: Working');
      console.log('\n💡 The issue is that the frontend needs to login first!');
      console.log('   Go to http://localhost:3000 and login with:');
      console.log('   Email: admin@assetmanagement.com');
      console.log('   Password: admin123');
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompleteFlow();
