import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import config from '../config/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const didHydrate = useRef(false);

  // Hydrate authentication state
  useEffect(() => {
    if (didHydrate.current) return; // prevent StrictMode double-run
    didHydrate.current = true;

    console.log('🔍 AuthContext: Starting authentication hydration...');
    
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('🔍 AuthContext: Token found:', !!token);
    console.log('🔍 AuthContext: User found:', !!savedUser);

    if (!token) {
      console.log('🔍 AuthContext: No token found, user not authenticated');
      setUser(null);
      setLoading(false);
      return;
    }

    // Check if token is expired
    const payload = decodeJwtPayload(token);
    if (!payload || payload.exp < Date.now() / 1000) {
      console.log('❌ AuthContext: Token expired, clearing localStorage');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return;
    }

    console.log('✅ AuthContext: Token is valid');

    // If we have cached user data, use it immediately
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Prefer latest avatar stored separately
        const storedAvatar = localStorage.getItem('user_avatar');
        if (storedAvatar) {
          userData.avatar = storedAvatar;
        }
        setUser(userData);
        console.log('✅ AuthContext: User loaded from localStorage');
        setLoading(false);
        
        // Verify token with backend in background
        verifyTokenWithBackend(token);
        return;
      } catch (error) {
        console.error('❌ AuthContext: Error parsing saved user:', error);
        // Continue to fetch from backend
      }
    }

    // Fetch user data from backend
    console.log('🔍 AuthContext: Fetching user data from backend...');
    fetchUserFromBackend(token);
  }, []);

  // Fetch user data from backend
  const fetchUserFromBackend = async (token) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data.user;
        // Overlay with locally stored avatar if present (client preference)
        const storedAvatar = localStorage.getItem('user_avatar');
        if (storedAvatar) {
          userData.avatar = storedAvatar;
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ AuthContext: User fetched from backend');
      } else {
        console.log('❌ AuthContext: Token verification failed, clearing localStorage');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ AuthContext: Error fetching user from backend:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Verify token with backend (background verification)
  const verifyTokenWithBackend = async (token) => {
    try {
      console.log('🔍 AuthContext: Verifying token with backend in background...');
      const response = await fetch(`${config.API_BASE_URL}/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ AuthContext: Token verified successfully in background');
      } else {
        console.log('❌ AuthContext: Token verification failed in background, logging out');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ AuthContext: Error verifying token in background:', error);
      // Don't logout on network errors during background verification
    }
  };

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
    localStorage.removeItem('user_avatar');
    // Reload page to reset all state
    window.location.reload();
  };

  const updateProfile = (profileData) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      try {
        // Attempt to persist full user (including avatar)
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // If avatar provided, also keep a separate, replaceable copy
        if (typeof profileData.avatar === 'string') {
          localStorage.setItem('user_avatar', profileData.avatar);
        } else if (profileData.avatar === null) {
          localStorage.removeItem('user_avatar');
        }
      } catch (e) {
        // Fallback: strip avatar from the main user record to avoid quota issues
        try {
          const { avatar, ...rest } = updatedUser;
          localStorage.setItem('user', JSON.stringify(rest));
          if (typeof profileData.avatar === 'string') {
            localStorage.setItem('user_avatar', profileData.avatar);
          } else if (profileData.avatar === null) {
            localStorage.removeItem('user_avatar');
          }
        } catch (innerErr) {
          // As a last resort, do nothing; state still holds the avatar for this session
          console.warn('⚠️ Unable to persist user updates to localStorage:', innerErr);
        }
      }
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
        // Force a small delay to ensure state is updated before navigation
        setTimeout(() => {
          console.log('User state updated, ready for navigation');
        }, 100);
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