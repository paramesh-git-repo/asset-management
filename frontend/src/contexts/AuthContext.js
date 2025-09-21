import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to check if token is expired
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't parse the token, consider it expired
    }
  };

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.log('Token expired, clearing localStorage');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          const userData = JSON.parse(savedUser);
          console.log('Loaded user from localStorage:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      console.log('No saved user or token found in localStorage');
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email, password) => {
    console.log('Login attempt:', { email, password });
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success' && data.data.token) {
        const userData = data.data.user;
        console.log('Login successful:', userData);
        
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        return { success: true, user: userData };
      } else {
        console.log('Login failed:', data.message, 'Status:', response.status);
        // Provide more specific error messages based on response status
        let errorMessage = data.message || 'Login failed';
        if (response.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (response.status === 403) {
          errorMessage = 'Account is locked or deactivated. Please contact your administrator.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please check if the backend is running.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    console.log('Registration attempt:', userData);
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.status === 'success' && data.data.token) {
        const newUser = data.data.user;
        console.log('Registration successful:', newUser);
        
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        setUser(newUser);
        return { success: true, user: newUser };
      } else {
        console.log('Registration failed:', data.message);
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please check if the backend is running.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // Clear authentication data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Reload page to reset all state
    window.location.reload();
  };

  const updateProfile = (profileData) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      // Persist the updated user data to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const handleAuthSuccess = () => {
    // This will be called by the Auth component after successful authentication
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('Authentication successful, user set:', userData);
      } catch (error) {
        console.error('Error loading user after auth:', error);
      }
    }
  };

  // Role-based helper functions
  const hasRole = (role) => {
    return user && user.role === role;
  };

  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'Admin') return true;
    
    // Check if user has specific permission
    return user.permissions && user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'Admin') return true;
    
    // Check if user has any of the specified permissions
    return user.permissions && permissions.some(permission => user.permissions.includes(permission));
  };

  const isAdmin = () => hasRole('Admin');
  const isManager = () => hasRole('Manager');
  const isEmployee = () => hasRole('Employee');
  const isManagerOrAdmin = () => hasAnyRole(['Manager', 'Admin']);

  // Get API headers with authentication token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    handleAuthSuccess,
    loading,
    isAuthenticated: !!user,
    // Role-based helpers
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    isAdmin,
    isManager,
    isEmployee,
    isManagerOrAdmin,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};