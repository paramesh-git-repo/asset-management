# 🔗 React API Configuration Examples

## 📋 Current Configuration

Your React app is already properly configured to use environment variables for API URLs:

### **Config File (`frontend/src/config/config.js`):**
```javascript
export const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-domain.com/api' 
      : 'http://localhost:5002/api'),
  // ... other config
};
```

### **API Service (`frontend/src/services/api.js`):**
```javascript
import config from '../config/config';

// All API calls use the configurable URL
export const assetAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`${config.API_BASE_URL}/assets?${queryString}`);
  },
  
  getById: (id) => apiCall(`${config.API_BASE_URL}/assets/${id}`),
  
  create: (assetData) => apiCall(`${config.API_BASE_URL}/assets`, {
    method: 'POST',
    body: JSON.stringify(assetData)
  }),
  // ... more methods
};
```

## 🚀 Environment Setup

### **Development (`.env.development`):**
```env
REACT_APP_API_URL=http://localhost:5002/api
REACT_APP_ENV=development
REACT_APP_ENABLE_LOGGING=true
GENERATE_SOURCEMAP=true
```

### **Production (`.env.production`):**
```env
REACT_APP_API_URL=http://your-backend-url:5002/api
REACT_APP_ENV=production
REACT_APP_ENABLE_LOGGING=false
GENERATE_SOURCEMAP=false
```

## 📝 Example API Calls

### **1. Get Assets:**
```javascript
import { assetAPI } from '../services/api';

async function getAssets() {
  try {
    const assets = await assetAPI.getAll();
    console.log('Assets:', assets);
    return assets;
  } catch (error) {
    console.error('Error fetching assets:', error);
  }
}
```

### **2. Login User:**
```javascript
import { authAPI } from '../services/api';

async function loginUser(email, password) {
  try {
    const response = await authAPI.login({ email, password });
    console.log('Login successful:', response);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### **3. Create Asset:**
```javascript
import { assetAPI } from '../services/api';

async function createAsset(assetData) {
  try {
    const newAsset = await assetAPI.create(assetData);
    console.log('Asset created:', newAsset);
    return newAsset;
  } catch (error) {
    console.error('Error creating asset:', error);
  }
}
```

### **4. Direct Fetch Example:**
```javascript
// Using the config directly
import config from '../config/config';

async function getAssets() {
  const API_BASE = config.API_BASE_URL;
  
  try {
    const response = await fetch(`${API_BASE}/assets`);
    const data = await response.json();
    console.log('Assets:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 🔧 Setup Commands

### **Quick Setup:**
```bash
# Run the setup script
./setup-react-api.sh
```

### **Manual Setup:**
```bash
# Create environment files
echo "REACT_APP_API_URL=http://localhost:5002/api" > frontend/.env.development
echo "REACT_APP_API_URL=http://your-backend-url:5002/api" > frontend/.env.production

# Build for production
cd frontend && npm run build
```

## 🚀 Deployment

### **Build and Deploy to S3:**
```bash
# 1. Setup API configuration
./setup-react-api.sh

# 2. Upload to S3
aws s3 sync frontend/build/ s3://asset-management-react-paramesh/ --delete
```

### **Test Your Deployment:**
```bash
# Test API connectivity
curl http://your-backend-url:5002/api/health

# Test S3 website
open http://asset-management-react-paramesh.s3-website-us-east-1.amazonaws.com
```

## 🧪 Testing API Calls

### **Test in Browser Console:**
```javascript
// Test API root
fetch('http://your-backend-url:5002/api')
  .then(res => res.json())
  .then(data => console.log('API Root:', data));

// Test health check
fetch('http://your-backend-url:5002/api/health')
  .then(res => res.json())
  .then(data => console.log('Health:', data));
```

### **Test Login:**
```javascript
fetch('http://your-backend-url:5002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password'
  })
})
.then(res => res.json())
.then(data => console.log('Login:', data));
```

## ✅ Your App is Ready!

Your React app is already perfectly configured to:
- ✅ Use environment variables for API URLs
- ✅ Switch between development and production
- ✅ Make API calls to your backend
- ✅ Handle authentication and data fetching
- ✅ Deploy to S3 with correct backend URLs

**Next step:** Run `./setup-react-api.sh` to configure your specific backend URL and build for deployment!
