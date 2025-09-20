// API Configuration
export const config = {
  // API Base URL - change this based on your environment
  API_BASE_URL: process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'http://your-ec2-public-ip:5002/api' 
      : 'http://localhost:5002/api'),
  
  // Environment
  ENV: process.env.REACT_APP_ENV || 'development',
  
  // Feature Flags
  ENABLE_LOGGING: process.env.REACT_APP_ENABLE_LOGGING !== 'false',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  
  // API Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // File upload limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Local storage keys (for fallback)
  STORAGE_KEYS: {
    ASSETS: 'assets',
    EMPLOYEES: 'employees',
    SETTINGS: 'settings',
    USER_PREFERENCES: 'userPreferences',
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
  },
};

export default config;
