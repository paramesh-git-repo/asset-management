#!/bin/bash

# Deployment Test Script for Asset Management System
# This script tests if your deployed application is working correctly

set -e

echo "🧪 Testing Asset Management System deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get EC2 public IP
echo -e "${YELLOW}🔍 Getting EC2 instance IP...${NC}"
PUBLIC_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=asset-management" "Name=instance-state-name,Values=running" \
    --query 'Reservations[*].Instances[*].PublicIpAddress' \
    --output text 2>/dev/null || echo "")

if [ -z "$PUBLIC_IP" ]; then
    echo -e "${RED}❌ No running EC2 instance found. Please deploy first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found EC2 instance with IP: $PUBLIC_IP${NC}"

# Test endpoints
FRONTEND_URL="http://$PUBLIC_IP"
BACKEND_URL="http://$PUBLIC_IP:5002"

echo -e "${YELLOW}🧪 Testing application endpoints...${NC}"

# Test backend health endpoint
echo -e "${YELLOW}🔍 Testing backend health endpoint...${NC}"
if curl -f -s "$BACKEND_URL/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

# Test backend database status
echo -e "${YELLOW}🔍 Testing backend database connection...${NC}"
if curl -f -s "$BACKEND_URL/api/db-status" > /dev/null; then
    echo -e "${GREEN}✅ Backend database connection working${NC}"
else
    echo -e "${RED}❌ Backend database connection failed${NC}"
fi

# Test frontend
echo -e "${YELLOW}🔍 Testing frontend...${NC}"
if curl -f -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
fi

# Test API endpoints
echo -e "${YELLOW}🔍 Testing API endpoints...${NC}"

# Test assets endpoint
if curl -f -s "$BACKEND_URL/api/assets" > /dev/null; then
    echo -e "${GREEN}✅ Assets API endpoint working${NC}"
else
    echo -e "${RED}❌ Assets API endpoint failed${NC}"
fi

# Test employees endpoint
if curl -f -s "$BACKEND_URL/api/employees" > /dev/null; then
    echo -e "${GREEN}✅ Employees API endpoint working${NC}"
else
    echo -e "${RED}❌ Employees API endpoint failed${NC}"
fi

# Test dashboard endpoint
if curl -f -s "$BACKEND_URL/api/dashboard/overview" > /dev/null; then
    echo -e "${GREEN}✅ Dashboard API endpoint working${NC}"
else
    echo -e "${RED}❌ Dashboard API endpoint failed${NC}"
fi

echo -e "${GREEN}🎉 Deployment test completed!${NC}"
echo ""
echo -e "${YELLOW}📝 Application URLs:${NC}"
echo "Frontend: $FRONTEND_URL"
echo "Backend API: $BACKEND_URL/api"
echo "Health Check: $BACKEND_URL/api/health"
echo ""
echo -e "${YELLOW}📝 Default Login Credentials:${NC}"
echo "Username: admin"
echo "Password: password"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Open $FRONTEND_URL in your browser"
echo "2. Login with the default credentials"
echo "3. Test the application functionality"
echo "4. Update default credentials for security"
