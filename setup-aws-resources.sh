#!/bin/bash

# AWS Resources Setup Script for Asset Management System
# This script creates the necessary AWS resources before deployment

set -e

echo "🔧 Setting up AWS resources for Asset Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="us-east-1"
SECURITY_GROUP_NAME="asset-management-sg"
KEY_PAIR_NAME="asset-management-key"

echo -e "${YELLOW}📋 AWS Resources Configuration:${NC}"
echo "AWS Region: $AWS_REGION"
echo "Security Group: $SECURITY_GROUP_NAME"
echo "Key Pair: $KEY_PAIR_NAME"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"

# Create security group
echo -e "${YELLOW}🔒 Creating security group...${NC}"
if aws ec2 describe-security-groups --group-names $SECURITY_GROUP_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠️  Security group $SECURITY_GROUP_NAME already exists${NC}"
else
    aws ec2 create-security-group \
        --group-name $SECURITY_GROUP_NAME \
        --description "Security group for Asset Management System" \
        --region $AWS_REGION
    
    echo -e "${GREEN}✅ Security group created${NC}"
fi

# Add security group rules
echo -e "${YELLOW}🔒 Adding security group rules...${NC}"

# HTTP (port 80)
aws ec2 authorize-security-group-ingress \
    --group-name $SECURITY_GROUP_NAME \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || echo "HTTP rule already exists"

# HTTPS (port 443)
aws ec2 authorize-security-group-ingress \
    --group-name $SECURITY_GROUP_NAME \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || echo "HTTPS rule already exists"

# Backend API (port 5002)
aws ec2 authorize-security-group-ingress \
    --group-name $SECURITY_GROUP_NAME \
    --protocol tcp \
    --port 5002 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || echo "Backend API rule already exists"

# SSH (port 22)
aws ec2 authorize-security-group-ingress \
    --group-name $SECURITY_GROUP_NAME \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || echo "SSH rule already exists"

echo -e "${GREEN}✅ Security group rules configured${NC}"

# Create key pair
echo -e "${YELLOW}🔑 Creating key pair...${NC}"
if aws ec2 describe-key-pairs --key-names $KEY_PAIR_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠️  Key pair $KEY_PAIR_NAME already exists${NC}"
else
    aws ec2 create-key-pair \
        --key-name $KEY_PAIR_NAME \
        --query 'KeyMaterial' \
        --output text \
        --region $AWS_REGION > $KEY_PAIR_NAME.pem
    
    chmod 400 $KEY_PAIR_NAME.pem
    echo -e "${GREEN}✅ Key pair created: $KEY_PAIR_NAME.pem${NC}"
fi

# Get security group ID
SECURITY_GROUP_ID=$(aws ec2 describe-security-groups \
    --group-names $SECURITY_GROUP_NAME \
    --query 'SecurityGroups[0].GroupId' \
    --output text \
    --region $AWS_REGION)

echo -e "${GREEN}🎉 AWS resources setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Summary:${NC}"
echo "Security Group ID: $SECURITY_GROUP_ID"
echo "Key Pair: $KEY_PAIR_NAME.pem"
echo "Region: $AWS_REGION"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Update your deploy.sh script with the security group ID: $SECURITY_GROUP_ID"
echo "2. Run ./deploy.sh to deploy your application"
echo "3. Your key file is: $KEY_PAIR_NAME.pem (keep this secure!)"
