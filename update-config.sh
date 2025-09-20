#!/bin/bash

# Configuration Update Script for Asset Management System
# This script helps update configuration files with actual deployment values

set -e

echo "🔧 Updating configuration files for deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get EC2 public IP (if instance exists)
echo -e "${YELLOW}🔍 Looking for existing EC2 instance...${NC}"
PUBLIC_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=asset-management" "Name=instance-state-name,Values=running" \
    --query 'Reservations[*].Instances[*].PublicIpAddress' \
    --output text 2>/dev/null || echo "")

if [ -z "$PUBLIC_IP" ]; then
    echo -e "${YELLOW}⚠️  No running EC2 instance found. You can update this later.${NC}"
    echo -e "${YELLOW}📝 Please enter your EC2 public IP (or press Enter to skip):${NC}"
    read -p "EC2 Public IP: " PUBLIC_IP
fi

if [ ! -z "$PUBLIC_IP" ]; then
    echo -e "${GREEN}✅ Found EC2 instance with IP: $PUBLIC_IP${NC}"
    
    # Update production.env
    if [ -f "production.env" ]; then
        echo -e "${YELLOW}📝 Updating production.env...${NC}"
        sed -i.bak "s/your-ec2-public-ip/$PUBLIC_IP/g" production.env
        sed -i.bak "s/your-domain.com/http:\/\/$PUBLIC_IP/g" production.env
        sed -i.bak "s/your-backend-domain.com/http:\/\/$PUBLIC_IP:5002/g" production.env
        echo -e "${GREEN}✅ production.env updated${NC}"
    fi
    
    # Update frontend config
    if [ -f "frontend/src/config/config.js" ]; then
        echo -e "${YELLOW}📝 Updating frontend config...${NC}"
        sed -i.bak "s/your-ec2-public-ip/$PUBLIC_IP/g" frontend/src/config/config.js
        echo -e "${GREEN}✅ Frontend config updated${NC}"
    fi
    
    # Update backend config
    if [ -f "backend/config.production.env" ]; then
        echo -e "${YELLOW}📝 Updating backend config...${NC}"
        sed -i.bak "s/your-domain.com/http:\/\/$PUBLIC_IP/g" backend/config.production.env
        echo -e "${GREEN}✅ Backend config updated${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping IP updates. You can run this script again after deployment.${NC}"
fi

# Generate secure JWT secret
echo -e "${YELLOW}🔐 Generating secure JWT secret...${NC}"
JWT_SECRET=$(openssl rand -base64 32)

# Update JWT secret in all config files
for file in production.env backend/config.production.env; do
    if [ -f "$file" ]; then
        sed -i.bak "s/your_very_secure_jwt_secret_key_for_production_change_this_to_something_secure/$JWT_SECRET/g" "$file"
        echo -e "${GREEN}✅ Updated JWT secret in $file${NC}"
    fi
done

echo -e "${GREEN}🎉 Configuration update completed!${NC}"
echo ""
echo -e "${YELLOW}📝 Important notes:${NC}"
echo "1. Review the updated configuration files"
echo "2. Update MongoDB connection string if needed"
echo "3. Run ./deploy.sh to deploy your application"
echo "4. Your application will be available at: http://$PUBLIC_IP"
