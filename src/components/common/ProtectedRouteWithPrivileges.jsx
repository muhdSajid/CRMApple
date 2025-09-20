import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasAnyPrivilege } from '../../utils/privilegeUtils';
import { isAuthenticated } from '../../service/authService';

/**
 * Protected route component that checks both authentication and privileges
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render if user is authorized
 * @param {string|string[]} props.privileges - Required privilege(s) to access the route
 * @param {string} props.redirectTo - Path to redirect to if user doesn't have privileges (default: '/')
 * @returns {React.ReactNode} - Children if authorized, redirect otherwise
 */
const ProtectedRouteWithPrivileges = ({ 
  children, 
  privileges, 
  redirectTo = '/' 
}) => {
  // First check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If no privileges specified, just return children (authenticated user)
  if (!privileges) {
    return children;
  }

  // Check if user has required privileges
  if (!hasAnyPrivilege(privileges)) {
    // User is authenticated but doesn't have required privileges
    // You could redirect to an "Access Denied" page or the dashboard
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated and has required privileges
  return children;
};

export default ProtectedRouteWithPrivileges;