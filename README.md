# 🏢 Asset Management System

A complete, full-stack asset management system built with React frontend and Node.js backend, featuring MongoDB integration, real-time analytics, and comprehensive asset tracking capabilities.

## 🚀 Features

### Frontend (React)
- **Modern UI**: Built with React 18 and Tailwind CSS
- **Responsive Design**: Mobile-first responsive design
- **Component-Based**: Modular, reusable components
- **State Management**: Efficient state management with React hooks
- **Real-time Updates**: Live dashboard updates and notifications

### Backend (Node.js + Express)
- **RESTful API**: Complete REST API with Express.js
- **MongoDB Integration**: Robust database with Mongoose ODM
- **Authentication**: JWT-based authentication system
- **File Uploads**: Support for images and documents
- **Validation**: Comprehensive input validation and sanitization
- **Security**: Helmet, CORS, and other security middleware

### Core Functionality
- **Asset Management**: Full CRUD operations for assets
- **Employee Management**: Complete employee lifecycle management
- **Dashboard Analytics**: Real-time statistics and reporting
- **Search & Filtering**: Advanced search with pagination
- **File Management**: Document and image uploads
- **Role-based Access**: User authentication and authorization

## 🏗️ Project Structure

```
asset-management-system/
├── frontend/                 # React frontend application
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── public/             # Public assets
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind CSS configuration
├── backend/                 # Node.js backend API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API route handlers
│   ├── seeders/            # Database seeding scripts
│   ├── uploads/            # File upload directory
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── package.json             # Root package.json
└── README.md               # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload middleware
- **Express Validator** - Input validation

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (v4.4 or higher) - local or cloud (MongoDB Atlas)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd asset-management-system

# Install all dependencies (frontend + backend)
npm run install:all
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Run setup script (creates directories, checks dependencies)
npm run setup

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

The backend will be available at: `http://localhost:5000/api`

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Start the React development server
npm start
```

The frontend will be available at: `http://localhost:3000`

### 4. Run Both Services

```bash
# From the root directory, run both frontend and backend
npm run dev
```

## 🔐 Default Credentials

- **Username**: `admin`
- **Password**: `password`
- **Role**: Administrator

## 📊 Sample Data

The system comes pre-loaded with:
- **5 Sample Employees** across different departments
- **8 Sample Assets** in various categories
- **Manager-subordinate relationships**
- **Asset assignments** to employees

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Assets
- `GET /api/assets` - Get all assets (with search/filtering)
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Dashboard
- `GET /api/dashboard/overview` - Dashboard statistics
- `GET /api/dashboard/assets/analytics` - Asset analytics
- `GET /api/dashboard/employees/analytics` - Employee analytics

## 🔧 Configuration

### Backend Environment Variables

Create a `backend/config.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/asset_management
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h
MAX_FILE_SIZE=5242880
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration

The frontend is configured to connect to the backend at `http://localhost:5000` by default.

## 📱 Available Scripts

### Root Level
```bash
npm run dev              # Start both frontend and backend in development mode
npm run start            # Start both services in production mode
npm run install:all      # Install dependencies for all packages
npm run setup            # Run backend setup
npm run seed             # Seed database with sample data
npm run build            # Build frontend for production
```

### Frontend
```bash
cd frontend
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
```

### Backend
```bash
cd backend
npm run dev              # Start with nodemon (development)
npm start                # Start production server
npm run seed             # Seed database
npm run setup            # Run setup script
```

## 🗄️ Database Schema

### Asset Model
- Basic info (name, ID, category, status)
- Financial data (purchase price, current value)
- Technical details (manufacturer, model, serial number)
- Assignment and location tracking
- Maintenance history and scheduling
- File attachments and documents

### Employee Model
- Personal information (name, email, phone)
- Employment details (department, position, hire date)
- Skills and certifications
- Performance reviews and goals
- Asset assignments
- Manager-subordinate relationships

## 🔍 Search & Filtering

### Assets
- Search by name, ID, serial number, manufacturer
- Filter by status, category, location, assigned employee
- Sort by any field with pagination

### Employees
- Search by name, ID, email, department
- Filter by status, department, manager
- Sort with pagination support

## 📈 Analytics & Reporting

- **Dashboard Overview**: Key metrics and statistics
- **Asset Analytics**: Value trends, category distribution
- **Employee Analytics**: Department stats, performance metrics
- **Financial Reports**: Asset values, depreciation analysis
- **System Health**: Maintenance alerts, warranty notifications

## 🚨 System Alerts

- Assets requiring maintenance
- Warranty expirations
- Unassigned high-value assets
- Employee asset overload
- System health monitoring

## 🛡️ Security Features

- JWT-based authentication
- Input validation and sanitization
- CORS protection
- Security headers (Helmet)
- File upload security
- Role-based access control

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build frontend
npm run build

# Start production servers
npm start
```

### Docker (Optional)
```bash
# Backend
cd backend
docker build -t asset-management-api .
docker run -p 5000:5000 asset-management-api

# Frontend
cd frontend
docker build -t asset-management-frontend .
docker run -p 3000:3000 asset-management-frontend
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (when implemented)
cd backend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check the documentation in each directory
- Review the API endpoints
- Check the console for error messages
- Ensure MongoDB is running
- Verify environment variables are set correctly

## 🔄 Changelog

### Version 1.0.0
- Complete React frontend with Tailwind CSS
- Full Node.js backend with Express
- MongoDB integration with Mongoose
- JWT authentication system
- File upload capabilities
- Comprehensive API endpoints
- Dashboard analytics
- Sample data and seeding

---

## 🎯 Next Steps

1. **Customize the system** for your specific needs
2. **Add more features** like reporting, notifications
3. **Implement user roles** and permissions
4. **Add audit logging** for compliance
5. **Set up monitoring** and error tracking
6. **Deploy to production** environment

---

**Happy Asset Managing! 🎉**
