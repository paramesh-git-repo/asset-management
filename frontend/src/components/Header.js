import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ currentPage }) => {
  const { user, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New asset added', type: 'info' },
    { id: 2, message: 'Maintenance due', type: 'warning' },
    { id: 3, message: 'Asset assigned', type: 'success' }
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageInfo = () => {
    const pageInfo = {
      dashboard: { title: 'Dashboard', subtitle: 'Welcome to your Asset Management System' },
      assets: { title: 'Asset Management', subtitle: 'Manage your organization\'s assets' },
      employees: { title: 'Employee Management', subtitle: 'Manage your organization\'s employees and their asset assignments' },
      timeline: { title: 'Activity Timeline', subtitle: 'Track all activities and changes in your system' },
      settings: { title: 'Settings', subtitle: 'Configure your application preferences' }
    };
    return pageInfo[currentPage] || { title: 'Dashboard', subtitle: 'Welcome to your Asset Management System' };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="fixed top-0 right-0 left-16 bg-white shadow-sm border-b border-gray-200 z-40 transition-all duration-300" style={{ height: '80px' }}>
      <div className="flex justify-between items-center px-6 py-4 h-full">
        <div className="flex items-center">
          <div>
            <h4 className="text-xl font-semibold text-gray-900 mb-0">{pageInfo.title}</h4>
            <p className="text-gray-500 mb-0 text-sm">{pageInfo.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* User Role Badge */}
          {user?.role && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.role === 'Admin' ? 'bg-red-100 text-red-800' :
              user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user.role}
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button 
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 relative"
              type="button"
            >
              <i className="fas fa-bell"></i>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            </button>
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
              type="button"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
              <span className="text-gray-900 font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <i className={`fas fa-chevron-down text-gray-500 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`}></i>
            </button>
            
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-xs text-blue-600 mt-1">{user?.role}</p>
                </div>
                <div className="py-1">
                  {/* Only show Profile Settings for Admin users */}
                  {user?.role === 'Admin' && (
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        // Navigate to settings page
                        window.location.href = '/settings';
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
                    >
                      <i className="fas fa-user-cog mr-3 text-gray-400"></i>
                      Profile Settings
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
                  >
                    <i className="fas fa-sign-out-alt mr-3 text-red-400"></i>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
