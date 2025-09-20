#!/bin/bash

# AWS Deployment Script for Asset Management System
# Make sure you have AWS CLI configured and Docker installed

set -e

echo "🚀 Starting AWS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="asset-management"
EC2_INSTANCE_TYPE="t2.micro"
KEY_PAIR_NAME="asset-management-key"

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "AWS Region: $AWS_REGION"
echo "ECR Repository: $ECR_REPOSITORY"
echo "EC2 Instance Type: $EC2_INSTANCE_TYPE"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Build and push backend image
echo -e "${YELLOW}🔨 Building backend Docker image...${NC}"
cd backend
docker build -t $ECR_REPOSITORY-backend .
cd ..

# Build and push frontend image
echo -e "${YELLOW}🔨 Building frontend Docker image...${NC}"
cd frontend
docker build -t $ECR_REPOSITORY-frontend .
cd ..

echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Create ECR repositories
echo -e "${YELLOW}📦 Creating ECR repositories...${NC}"
aws ecr create-repository --repository-name $ECR_REPOSITORY-backend --region $AWS_REGION || true
aws ecr create-repository --repository-name $ECR_REPOSITORY-frontend --region $AWS_REGION || true

# Get ECR login token
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com

# Tag and push images
ECR_URI=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com

echo -e "${YELLOW}📤 Pushing backend image to ECR...${NC}"
docker tag $ECR_REPOSITORY-backend:latest $ECR_URI/$ECR_REPOSITORY-backend:latest
docker push $ECR_URI/$ECR_REPOSITORY-backend:latest

echo -e "${YELLOW}📤 Pushing frontend image to ECR...${NC}"
docker tag $ECR_REPOSITORY-frontend:latest $ECR_URI/$ECR_REPOSITORY-frontend:latest
docker push $ECR_URI/$ECR_REPOSITORY-frontend:latest

echo -e "${GREEN}✅ Images pushed to ECR successfully${NC}"

# Create EC2 instance
echo -e "${YELLOW}🖥️  Creating EC2 instance...${NC}"
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 1 \
    --instance-type $EC2_INSTANCE_TYPE \
    --key-name $KEY_PAIR_NAME \
    --security-groups asset-management-sg \
    --user-data file://user-data.sh \
    --query 'Instances[0].InstanceId' \
    --output text \
    --region $AWS_REGION)

echo "Instance ID: $INSTANCE_ID"

# Wait for instance to be running
echo -e "${YELLOW}⏳ Waiting for instance to be running...${NC}"
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $AWS_REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --region $AWS_REGION)

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your application is available at: http://$PUBLIC_IP${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. SSH into your instance: ssh -i $KEY_PAIR_NAME.pem ec2-user@$PUBLIC_IP"
echo "2. Configure your environment variables"
echo "3. Start your application containers"
echo "4. Set up a domain name (optional)"

