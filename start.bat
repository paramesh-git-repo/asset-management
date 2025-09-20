@echo off
echo 🚀 Asset Management System - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo ✅ npm detected
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing root dependencies...
    npm install
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend && npm install && cd ..
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend && npm install && cd ..
)

echo.
echo 🎯 Starting Asset Management System...
echo.

REM Start both services
npm run dev

pause
