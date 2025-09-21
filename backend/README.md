# Asset Management System - Backend API

A robust Node.js/Express backend API for managing assets, employees, and providing comprehensive analytics for an asset management system.

## 🚀 Features

- **Asset Management**: Full CRUD operations for assets with file uploads
- **Employee Management**: Complete employee lifecycle management
- **Authentication**: JWT-based authentication system
- **File Uploads**: Support for images and documents
- **Analytics**: Comprehensive dashboard analytics and reporting
- **MongoDB Integration**: Robust database with Mongoose ODM
- **Validation**: Input validation and sanitization
- **Security**: Helmet, CORS, and other security middleware
- **Search & Filtering**: Advanced search and filtering capabilities
- **Pagination**: Efficient data pagination
- **Real-time Statistics**: Live dashboard statistics

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Compression**: Compression middleware

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd asset-management-react/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `config.env.example` to `config.env`
   - Update the configuration values:
     ```env
     MONGODB_URI=mongodb://localhost:27017/asset_management
     PORT=5000
     JWT_SECRET=your_secret_key_here
     JWT_EXPIRE=24h
     ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in config.env
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify JWT token

### Assets
- `GET /api/assets` - Get all assets (with pagination, search, filtering)
- `GET /api/assets/:id` - Get asset by ID
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset (soft delete)
- `PATCH /api/assets/:id/assign` - Assign asset to employee
- `PATCH /api/assets/:id/status` - Update asset status
- `GET /api/assets/stats/overview` - Asset statistics

### Employees
- `GET /api/employees` - Get all employees (with pagination, search, filtering)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee (soft delete)
- `PATCH /api/employees/:id/status` - Update employee status
- `PATCH /api/employees/:id/skills` - Add skill to employee
- `PATCH /api/employees/:id/reviews` - Add performance review
- `GET /api/employees/stats/overview` - Employee statistics

### Dashboard
- `GET /api/dashboard/overview` - Dashboard overview statistics
- `GET /api/dashboard/assets/analytics` - Asset analytics
- `GET /api/dashboard/employees/analytics` - Employee analytics
- `GET /api/dashboard/financial/analytics` - Financial analytics
- `GET /api/dashboard/health/alerts` - System health and alerts

### System
- `GET /api/health` - API health check

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Default Admin User
- **Username**: admin@assetmanagement.com
- **Password**: admin123
- **Role**: admin

**Note**: Change the default password in production for security.

## 📁 File Uploads

The API supports file uploads for:
- Asset images and documents
- Employee profile pictures and documents

**Supported formats**: JPEG, PNG, GIF, PDF, DOC, DOCX
**Maximum file size**: 5MB (configurable)

Files are stored in the `uploads/` directory with organized subdirectories.

## 🔍 Search & Filtering

### Assets
- **Search**: Name, Asset ID, Serial Number, Manufacturer, Model
- **Filter**: Status, Category, Location, Assigned Employee
- **Sort**: Any field with ascending/descending order

### Employees
- **Search**: First Name, Last Name, Employee ID, Email, Department, Position
- **Filter**: Status, Department, Manager
- **Sort**: Any field with ascending/descending order

## 📊 Analytics & Reporting

### Dashboard Overview
- Total assets and employees
- Asset status distribution
- Financial summaries
- Recent activities
- Category and department breakdowns

### Asset Analytics
- Creation trends
- Value by category
- Status distribution
- Top valuable assets
- Maintenance requirements

### Employee Analytics
- Department distribution
- Salary analysis
- Performance metrics
- Growth trends

### Financial Analytics
- Asset value over time
- Depreciation analysis
- Maintenance costs
- ROI calculations

## 🚨 System Alerts

The system provides real-time alerts for:
- Assets requiring maintenance
- Warranty expirations
- Unassigned high-value assets
- Employee asset overload

## 🛡️ Security Features

- **Input Validation**: Comprehensive input validation and sanitization
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **File Upload Security**: File type and size validation
- **Rate Limiting**: Built-in rate limiting (can be enhanced)
- **SQL Injection Protection**: MongoDB with Mongoose ODM

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/asset_management` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT secret key | `your_jwt_secret_key_here` |
| `JWT_EXPIRE` | JWT expiration time | `24h` |
| `MAX_FILE_SIZE` | Maximum file upload size | `5242880` (5MB) |
| `UPLOAD_PATH` | File upload directory | `./uploads` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   JWT_SECRET=<strong_secret_key>
   MONGODB_URI=<production_mongodb_uri>
   ```

2. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "asset-management-api"
   
   # Using Docker
   docker build -t asset-management-api .
   docker run -p 5000:5000 asset-management-api
   ```

3. **Reverse Proxy**
   - Use Nginx or Apache as reverse proxy
   - Configure SSL/TLS certificates
   - Set up load balancing if needed

## 🔧 Development

### Project Structure
```
backend/
├── models/          # MongoDB schemas
├── routes/          # API route handlers
├── uploads/         # File upload directory
├── config.env       # Environment configuration
├── package.json     # Dependencies and scripts
├── server.js        # Main server file
└── README.md        # This file
```

### Adding New Features
1. Create/update models in `models/` directory
2. Add routes in `routes/` directory
3. Update server.js to include new routes
4. Add validation and error handling
5. Update documentation

### Code Style
- Use ES6+ features
- Follow Express.js best practices
- Implement proper error handling
- Add input validation
- Use async/await for database operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete CRUD operations for assets and employees
- Authentication system
- Dashboard analytics
- File upload support
- Comprehensive API documentation

---

**Happy Coding! 🎉**
