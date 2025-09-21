import config from '../config/config';

// Helper function for API calls
async function apiCall(url, options = {}) {
  try {
    // Get authentication token
    const token = localStorage.getItem('token');
    
    // Set default headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    const fetchOptions = {
      ...options,
      headers: defaultHeaders,
    };
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text();
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
      
      // Handle token expiration
      if (response.status === 401 && (errorData.message === 'Token expired' || errorData.message === 'Access token required')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.reload(); // This will trigger the AuthContext to show login
        throw new Error('Session expired. Please login again.');
      }
      
      // Handle validation errors specifically
      if (response.status === 400 && errorData.errors && Array.isArray(errorData.errors)) {
        const validationErrors = {};
        errorData.errors.forEach(error => {
          validationErrors[error.path] = error.msg;
        });
        throw new Error(JSON.stringify({ type: 'validation', errors: validationErrors }));
      }
      
      console.error(`❌ API call failed: ${response.status} ${response.statusText}`, errorData);
      throw new Error(errorData.message || `API call failed: ${response.status} ${response.statusText}`);
    }

    // Parse JSON safely
    let data;
    try {
      data = await response.json();
      console.log(`✅ API call successful, data:`, data);
    } catch (err) {
      console.error(`❌ Failed to parse JSON from ${url}:`, err);
      throw new Error(`Failed to parse JSON from ${url}`);
    }

    // Return the data - don't treat empty arrays/objects as failures
    return data;
  } catch (error) {
    console.error(`❌ API call error for ${url}:`, error);
    throw error;
  }
}

// Asset API calls
export const assetAPI = {
  // Get all assets with pagination and filters
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`${config.API_BASE_URL}/assets?${queryString}`);
  },

  // Get single asset by ID
  getById: (id) => apiCall(`${config.API_BASE_URL}/assets/${id}`),

  async create(assetData) {
    console.log('🔍 assetAPI.create called with:', JSON.stringify(assetData, null, 2));
    console.log('📦 Payload:', assetData);
    console.log('🚀 Sending to API:', JSON.stringify(assetData));
    return apiCall(`${config.API_BASE_URL}/assets`, {
      method: 'POST',
      body: JSON.stringify(assetData)
    });
  },

  // Update existing asset
  update: (id, assetData) => apiCall(`${config.API_BASE_URL}/assets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(assetData),
  }),

  // Delete asset
  delete: (id) => apiCall(`${config.API_BASE_URL}/assets/${id}`, {
    method: 'DELETE',
  }),

  // Get asset statistics
  getStats: () => apiCall(`${config.API_BASE_URL}/assets/stats/overview`),
};

// Employee API calls
export const employeeAPI = {
  // Get all employees with pagination and filters
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`${config.API_BASE_URL}/employees?${queryString}`);
  },

  // Get single employee by ID
  getById: (id) => apiCall(`${config.API_BASE_URL}/employees/${id}`),

  // Create new employee
  create: (employeeData) => apiCall(`${config.API_BASE_URL}/employees`, {
    method: 'POST',
    body: JSON.stringify(employeeData),
  }),

  // Update existing employee
  update: (id, employeeData) => apiCall(`${config.API_BASE_URL}/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
  }),

  // Delete employee
  delete: (id) => apiCall(`${config.API_BASE_URL}/employees/${id}`, {
    method: 'DELETE',
  }),

  // Get employee statistics
  getStats: () => apiCall(`${config.API_BASE_URL}/employees/stats/overview`),
};

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard overview
  getOverview: () => apiCall(`${config.API_BASE_URL}/dashboard/overview`),
  
  // Get asset analytics
  getAssetAnalytics: () => apiCall(`${config.API_BASE_URL}/dashboard/assets/analytics`),
  
  // Get employee analytics
  getEmployeeAnalytics: () => apiCall(`${config.API_BASE_URL}/dashboard/employees/analytics`),
  
  // Get financial analytics
  getFinancialAnalytics: () => apiCall(`${config.API_BASE_URL}/dashboard/financial/analytics`),
  
  // Get health alerts
  getHealthAlerts: () => apiCall(`${config.API_BASE_URL}/dashboard/health/alerts`),
};

// Auth API calls
export const authAPI = {
  // Login
  login: (credentials) => apiCall(`${config.API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  // Register
  register: (userData) => apiCall(`${config.API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // Get profile
  getProfile: () => apiCall(`${config.API_BASE_URL}/auth/profile`),

  // Update profile
  updateProfile: (profileData) => apiCall(`${config.API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),

  // Change password
  changePassword: (passwordData) => apiCall(`${config.API_BASE_URL}/auth/change-password`, {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  }),

  // Logout
  logout: () => apiCall(`${config.API_BASE_URL}/auth/logout`, {
    method: 'POST',
  }),
};

// Export the apiCall function for direct use
export { apiCall };

export default {
  assetAPI,
  employeeAPI,
  dashboardAPI,
  authAPI,
  apiCall,
};
