# 🔧 Frontend Configuration Guide

## 📋 Overview

Your React app is already properly configured to use environment variables for API URLs. This guide shows you how to update it for production deployment.

## ✅ Current Configuration Status

Your React app **already uses environment variables correctly**:

```javascript
// In frontend/src/config/config.js
API_BASE_URL: process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com/api' 
    : 'http://localhost:5002/api')
```

## 🚀 Quick Setup

### Option 1: Automatic Configuration (Recommended)
```bash
# Run the configuration script
./update-frontend-config.sh
```

This script will:
- ✅ Detect your EC2 instance IP
- ✅ Create `.env.production` and `.env.development` files
- ✅ Update configuration with your backend URL
- ✅ Test the build process

### Option 2: Manual Configuration

1. **Create Production Environment File:**
   ```bash
   # Copy the template
   cp frontend/env.production.template frontend/.env.production
   
   # Edit with your backend URL
   nano frontend/.env.production
   ```

2. **Update the file with your backend URL:**
   ```env
   REACT_APP_API_URL=https://your-backend-domain.com/api
   REACT_APP_ENV=production
   REACT_APP_ENABLE_LOGGING=false
   REACT_APP_ENABLE_ANALYTICS=true
   GENERATE_SOURCEMAP=false
   ```

## 🔧 Environment Variables

### Production (`.env.production`)
```env
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.com/api

# Environment
REACT_APP_ENV=production

# Feature Flags
REACT_APP_ENABLE_LOGGING=false
REACT_APP_ENABLE_ANALYTICS=true

# Build Configuration
GENERATE_SOURCEMAP=false
```

### Development (`.env.development`)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5002/api

# Environment
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_LOGGING=true
REACT_APP_ENABLE_ANALYTICS=false

# Build Configuration
GENERATE_SOURCEMAP=true
```

## 🌐 URL Examples

### For EC2 Deployment:
```env
REACT_APP_API_URL=http://YOUR_EC2_IP:5002/api
```

### For Custom Domain:
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

### For Load Balancer:
```env
REACT_APP_API_URL=https://your-load-balancer.com/api
```

## 🔄 Build Process

### Development Build:
```bash
cd frontend
npm start  # Uses .env.development
```

### Production Build:
```bash
cd frontend
npm run build  # Uses .env.production
```

### Custom Environment:
```bash
cd frontend
REACT_APP_API_URL=https://custom-api.com/api npm run build
```

## 🧪 Testing Configuration

1. **Test Build:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Test API Connection:**
   ```bash
   # Check if your backend is accessible
   curl https://your-backend-domain.com/api/health
   ```

3. **Test Frontend:**
   ```bash
   # Serve the built files
   npx serve -s build
   ```

## 🔒 Security Best Practices

1. **Use HTTPS in Production:**
   ```env
   REACT_APP_API_URL=https://your-backend-domain.com/api
   ```

2. **Disable Source Maps:**
   ```env
   GENERATE_SOURCEMAP=false
   ```

3. **Disable Logging in Production:**
   ```env
   REACT_APP_ENABLE_LOGGING=false
   ```

## 🚨 Common Issues

### Issue 1: CORS Errors
**Solution:** Update backend CORS configuration
```javascript
// In backend server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

### Issue 2: Mixed Content (HTTP/HTTPS)
**Solution:** Use HTTPS for both frontend and backend
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Issue 3: Environment Variables Not Loading
**Solution:** Ensure variables start with `REACT_APP_`
```env
REACT_APP_API_URL=https://your-backend-domain.com/api  # ✅ Correct
API_URL=https://your-backend-domain.com/api            # ❌ Wrong
```

## 📝 Deployment Checklist

- [ ] Create `.env.production` with correct backend URL
- [ ] Test build process: `npm run build`
- [ ] Verify API connectivity
- [ ] Update CORS settings in backend
- [ ] Deploy frontend with new configuration
- [ ] Test full application flow

## 🔄 Update Process

When your backend URL changes:

1. **Update environment file:**
   ```bash
   # Edit the production environment
   nano frontend/.env.production
   ```

2. **Rebuild frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Redeploy:**
   ```bash
   # Your deployment script will handle this
   ./deploy.sh
   ```

## 📞 Support

If you encounter issues:
1. Check the browser console for API errors
2. Verify your backend is accessible
3. Check CORS configuration
4. Ensure environment variables are loaded correctly
