import React from 'react';
import { hasAnyPrivilege, hasAnyRole } from '../../utils/privilegeUtils';

/**
 * PrivilegeGuard component for conditionally rendering content based on user privileges
 * @param {Object} props - Component props
 * @param {string|string[]} props.privileges - Required privilege(s) to render children
 * @param {string|string[]} props.roles - Required role(s) to render children (alternative to privileges)
 * @param {React.ReactNode} props.children - Content to render if user has required privileges/roles
 * @param {React.ReactNode} props.fallback - Optional fallback content if user doesn't have required privileges/roles
 * @param {boolean} props.requireAll - If true, user must have ALL specified privileges/roles (default: false - requires ANY)
 * @returns {React.ReactNode} - Children if authorized, fallback or null otherwise
 */
const PrivilegeGuard = ({ 
  privileges, 
  roles, 
  children, 
  fallback = null, 
  requireAll = false 
}) => {
  // Determine if user is authorized
  let isAuthorized = false;

  if (privileges) {
    if (requireAll) {
      // Check if user has ALL required privileges
      const privilegeArray = Array.isArray(privileges) ? privileges : [privileges];
      isAuthorized = privilegeArray.every(privilege => hasAnyPrivilege(privilege));
    } else {
      // Check if user has ANY of the required privileges
      isAuthorized = hasAnyPrivilege(privileges);
    }
  } else if (roles) {
    if (requireAll) {
      // Check if user has ALL required roles
      const roleArray = Array.isArray(roles) ? roles : [roles];
      isAuthorized = roleArray.every(role => hasAnyRole(role));
    } else {
      // Check if user has ANY of the required roles
      isAuthorized = hasAnyRole(roles);
    }
  }

  // Render content based on authorization
  return isAuthorized ? children : fallback;
};

export default PrivilegeGuard;