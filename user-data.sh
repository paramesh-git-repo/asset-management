#!/bin/bash

# AWS EC2 User Data Script for Asset Management System
# This script runs when the EC2 instance starts

set -e

echo "🚀 Starting Asset Management System deployment..."

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Create application directory
mkdir -p /opt/asset-management
cd /opt/asset-management

# Create environment file
cat > .env << EOF
# Production Environment Variables
NODE_ENV=production
PORT=5002

# Database - Update with your MongoDB connection string
MONGODB_URI=mongodb+srv://parameshk:tjQR02Mq6Lpdi8O3@cluster1.amnjtnt.mongodb.net/asset_management?retryWrites=true&w=majority&appName=Cluster1

# JWT Configuration - CHANGE THIS SECRET!
JWT_SECRET=your_very_secure_jwt_secret_key_for_production_change_this_$(date +%s)
JWT_EXPIRE=24h

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS - Update with your domain
CORS_ORIGIN=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Frontend API URL
REACT_APP_API_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5002/api

# Security
BCRYPT_ROUNDS=12
EOF

# Create docker-compose file
cat > docker-compose.yml << EOF
version: '3.8'

services:
  backend:
    image: \${AWS_ACCOUNT_ID}.dkr.ecr.\${AWS_REGION}.amazonaws.com/asset-management-backend:latest
    ports:
      - "5002:5002"
    environment:
      - NODE_ENV=production
      - PORT=5002
      - MONGODB_URI=\${MONGODB_URI}
      - JWT_SECRET=\${JWT_SECRET}
      - JWT_EXPIRE=24h
      - MAX_FILE_SIZE=5242880
      - UPLOAD_PATH=./uploads
      - CORS_ORIGIN=\${CORS_ORIGIN}
      - BCRYPT_ROUNDS=12
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5002/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: \${AWS_ACCOUNT_ID}.dkr.ecr.\${AWS_REGION}.amazonaws.com/asset-management-frontend:latest
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=\${REACT_APP_API_URL}
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF

# Create startup script
cat > start-app.sh << 'EOF'
#!/bin/bash

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

# Update docker-compose with actual values
sed -i "s/\${AWS_ACCOUNT_ID}/$AWS_ACCOUNT_ID/g" docker-compose.yml
sed -i "s/\${AWS_REGION}/$AWS_REGION/g" docker-compose.yml
sed -i "s|\${REACT_APP_API_URL}|$REACT_APP_API_URL|g" docker-compose.yml

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Pull and start containers
docker-compose pull
docker-compose up -d

echo "✅ Application started successfully!"
echo "🌐 Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "🔧 Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5002/api"
EOF

chmod +x start-app.sh

# Create systemd service for auto-start
cat > /etc/systemd/system/asset-management.service << EOF
[Unit]
Description=Asset Management System
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/asset-management
ExecStart=/opt/asset-management/start-app.sh
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable asset-management.service

echo "✅ User data script completed successfully!"
echo "📝 Next steps:"
echo "1. Run the deploy.sh script from your local machine"
echo "2. The application will automatically start on the EC2 instance"
