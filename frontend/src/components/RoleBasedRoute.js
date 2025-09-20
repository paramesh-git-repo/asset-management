import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRoute = ({ 
  children, 
  requiredRole, 
  requiredRoles, 
  requiredPermission, 
  requiredPermissions,
  fallback = null 
}) => {
  const { 
    user, 
    hasRole, 
    hasAnyRole, 
    hasPermission, 
    hasAnyPermission 
  } = useAuth();

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback;
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return fallback;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log(`RoleBasedRoute: Access denied for permission: ${requiredPermission}`);
    return fallback;
  }

  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    console.log(`RoleBasedRoute: Access denied for permissions: ${requiredPermissions}`);
    return fallback;
  }

  return children;
};

export default RoleBasedRoute;
