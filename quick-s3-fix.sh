#!/bin/bash

# Quick S3 Fix Script
# This script quickly updates your React app for S3 deployment

set -e

echo "🚀 Quick S3 deployment fix..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get backend URL from user
echo -e "${YELLOW}📝 Enter your backend API URL:${NC}"
echo "Examples:"
echo "  - EC2: http://YOUR_EC2_IP:5002/api"
echo "  - Custom domain: https://api.yourdomain.com/api"
read -p "Backend URL: " BACKEND_URL

# Ensure URL has protocol and /api suffix
if [[ ! "$BACKEND_URL" =~ ^https?:// ]]; then
    BACKEND_URL="http://$BACKEND_URL"
fi
if [[ ! "$BACKEND_URL" =~ /api$ ]]; then
    BACKEND_URL="$BACKEND_URL/api"
fi

echo -e "${GREEN}✅ Using: $BACKEND_URL${NC}"

# Create .env.production
cat > frontend/.env.production << EOF
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_ENV=production
REACT_APP_ENABLE_LOGGING=false
GENERATE_SOURCEMAP=false
EOF

# Build and upload
echo -e "${YELLOW}🔨 Building and uploading...${NC}"
cd frontend && npm run build && cd ..
aws s3 sync frontend/build/ s3://asset-management-react-paramesh/ --delete

echo -e "${GREEN}🎉 Done! Your S3 site is updated.${NC}"
echo -e "${YELLOW}🌐 Test at: http://asset-management-react-paramesh.s3-website-us-east-1.amazonaws.com${NC}"
