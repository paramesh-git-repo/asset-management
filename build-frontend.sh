#!/bin/bash

# Netlify Build Script for Frontend
# This script builds the React frontend for Netlify deployment

set -e

echo "🔨 Building React frontend for Netlify..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the React app
echo "🏗️ Building React app..."
npm run build

echo "✅ Frontend build completed successfully!"
echo "📁 Build files are in: frontend/build/"
