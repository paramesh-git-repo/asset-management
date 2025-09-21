import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      path: '/dashboard',
      permission: 'view_assets' // Changed from 'view_reports' to 'view_assets' so Employee users can access
    },
    {
      id: 'assets',
      label: 'Assets',
      icon: 'fas fa-boxes',
      path: '/assets',
      permission: 'view_assets'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: 'fas fa-users',
      path: '/employees',
      permission: 'view_employees'
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: 'fas fa-clock',
      path: '/timeline',
      permission: 'view_assets'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'fas fa-cog',
      path: '/settings',
      permission: 'system_settings'
    }
  ];

  const handleNavigation = (item) => {
    navigate(item.path);
  };

  const isActive = (item) => {
    return location.pathname === item.path;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="fas fa-cubes" style={{ color: '#000000' }}></i>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const shouldShow = user?.role === 'Admin' || hasPermission(item.permission);
            
            if (!shouldShow) return null;
            
            return (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${isActive(item) ? 'active' : ''}`}
                  onClick={() => handleNavigation(item)}
                  title={item.label}
                  style={{ color: '#ffffff' }}
                >
                  <i className={item.icon} style={{ color: '#ffffff' }}></i>
                  <span className="nav-label" style={{ color: '#ffffff' }}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;