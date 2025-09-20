# 🚀 Deployment Guide

## Git Strategy for Deployment Scripts

### ✅ **Files to Commit to Git:**

```bash
# Core deployment scripts
deploy.sh
user-data.sh
docker-compose.yml
setup-aws-resources.sh
update-config.sh
test-deployment.sh

# Configuration templates (with placeholders)
production.env
backend/config.production.env

# Documentation
DEPLOYMENT.md
README.md
```

### ❌ **Files NOT to Commit to Git:**

```bash
# Sensitive files (automatically ignored by .gitignore)
.env
*.pem
*.key
asset-management-key.pem
config.env
*.bak
```

## 🚀 **Deployment Process**

### 1. **Initial Setup (One-time)**
```bash
# Configure AWS CLI
aws configure

# Setup AWS resources
./setup-aws-resources.sh
```

### 2. **Deploy Application**
```bash
# Update configuration with actual values
./update-config.sh

# Deploy to AWS
./deploy.sh
```

### 3. **Test Deployment**
```bash
# Test all endpoints
./test-deployment.sh
```

## 🔐 **Security Best Practices**

1. **Never commit sensitive files:**
   - AWS key pairs (`.pem` files)
   - Environment variables with real credentials
   - Database connection strings with passwords

2. **Use environment variables:**
   - Store sensitive data in environment variables
   - Use templates with placeholders in Git
   - Update actual values during deployment

3. **Rotate credentials regularly:**
   - Change JWT secrets
   - Update database passwords
   - Rotate AWS access keys

## 📁 **File Structure**

```
asset-management-react/
├── deploy.sh                 # ✅ Main deployment script
├── user-data.sh              # ✅ EC2 initialization
├── docker-compose.yml        # ✅ Container orchestration
├── setup-aws-resources.sh    # ✅ AWS resource creation
├── update-config.sh          # ✅ Configuration updater
├── test-deployment.sh        # ✅ Deployment tester
├── production.env            # ✅ Template (safe to commit)
├── .env                      # ❌ Real values (ignored)
├── *.pem                     # ❌ AWS keys (ignored)
└── *.bak                     # ❌ Backup files (ignored)
```

## 🔄 **Workflow**

1. **Development:**
   - Work on your application code
   - Test locally with `docker-compose up`

2. **Commit to Git:**
   - Commit application code and deployment scripts
   - Never commit sensitive configuration

3. **Deploy:**
   - Run deployment scripts on your local machine
   - Scripts will handle AWS deployment

4. **Update:**
   - Make changes to your code
   - Commit and push to Git
   - Re-run deployment scripts

## 🆘 **Troubleshooting**

### Common Issues:

1. **AWS CLI not configured:**
   ```bash
   aws configure
   ```

2. **Permission denied on scripts:**
   ```bash
   chmod +x *.sh
   ```

3. **Docker not running:**
   ```bash
   # Start Docker Desktop or Docker daemon
   ```

4. **EC2 instance not found:**
   ```bash
   # Check if instance is running
   aws ec2 describe-instances --filters "Name=tag:Name,Values=asset-management"
   ```

## 📞 **Support**

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify AWS resources: `aws ec2 describe-instances`
3. Test endpoints: `./test-deployment.sh`
4. Review configuration: Check `.env` files
