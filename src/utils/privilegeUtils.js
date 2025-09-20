/**
 * Utility functions for checking user privileges and managing access control
 */

import { getUserRole, getUserPrivileges } from '../service/authService';
import { PRIVILEGES, PRIVILEGE_GROUPS } from '../constants/constants';

/**
 * Check if the current user has a specific privilege
 * Handles wildcard privileges (*, user.*, medicine.stock.*, etc.)
 * @param {string} privilegeName - The name of the privilege to check
 * @returns {boolean} - True if user has the privilege, false otherwise
 */
export const hasPrivilege = (privilegeName) => {
  const privileges = getUserPrivileges();
  
  // Safety check
  if (!privileges || !Array.isArray(privileges)) {
    console.warn('getUserPrivileges() returned invalid data:', privileges);
    return false;
  }
  
  if (!privilegeName || typeof privilegeName !== 'string') {
    console.warn('Invalid privilegeName provided to hasPrivilege:', privilegeName);
    return false;
  }
  
  // Check for exact match first
  const hasExactMatch = privileges.some(privilege => 
    privilege && privilege.privilegeName === privilegeName
  );
  if (hasExactMatch) return true;

  // Check for super admin privilege (*)
  const hasSuperAdmin = privileges.some(privilege => 
    privilege && privilege.privilegeName === '*'
  );
  if (hasSuperAdmin) return true;

  // Check for wildcard privileges
  const privilegeParts = privilegeName.split('.');
  
  // Check for category wildcards (e.g., user.* covers user.create, user.read, etc.)
  for (let i = privilegeParts.length - 1; i > 0; i--) {
    const wildcardPattern = privilegeParts.slice(0, i).join('.') + '.*';
    const hasWildcard = privileges.some(privilege => 
      privilege && privilege.privilegeName === wildcardPattern
    );
    if (hasWildcard) return true;
  }

  return false;
};

/**
 * Check if the current user has any of the specified privileges
 * @param {string|string[]} privilegeNames - Single privilege name or array of privilege names
 * @returns {boolean} - True if user has at least one of the privileges, false otherwise
 */
export const hasAnyPrivilege = (privilegeNames) => {
  if (!Array.isArray(privilegeNames)) {
    return hasPrivilege(privilegeNames);
  }
  return privilegeNames.some(privilegeName => hasPrivilege(privilegeName));
};

/**
 * Check if the current user has all of the specified privileges
 * @param {string|string[]} privilegeNames - Single privilege name or array of privilege names
 * @returns {boolean} - True if user has all the privileges, false otherwise
 */
export const hasAllPrivileges = (privilegeNames) => {
  if (!Array.isArray(privilegeNames)) {
    return hasPrivilege(privilegeNames);
  }
  return privilegeNames.every(privilegeName => hasPrivilege(privilegeName));
};

/**
 * Get the current user's role information
 * @returns {Object|null} - Role object with id, name, displayName, and privileges, or null if not found
 */
export const getCurrentUserRole = () => {
  return getUserRole();
};

/**
 * Get the current user's role name
 * @returns {string|null} - Role name (e.g., "ROLE_ADMIN") or null if not found
 */
export const getCurrentUserRoleName = () => {
  const role = getUserRole();
  return role?.name || null;
};

/**
 * Get the current user's role display name
 * @returns {string|null} - Role display name (e.g., "Administrator") or null if not found
 */
export const getCurrentUserRoleDisplayName = () => {
  const role = getUserRole();
  return role?.displayName || null;
};

/**
 * Check if the current user has a specific role
 * @param {string} roleName - The role name to check (e.g., "ROLE_ADMIN")
 * @returns {boolean} - True if user has the role, false otherwise
 */
export const hasRole = (roleName) => {
  const userRoleName = getCurrentUserRoleName();
  return userRoleName === roleName;
};

/**
 * Check if the current user has any of the specified roles
 * @param {string|string[]} roleNames - Single role name or array of role names
 * @returns {boolean} - True if user has at least one of the roles, false otherwise
 */
export const hasAnyRole = (roleNames) => {
  if (!Array.isArray(roleNames)) {
    return hasRole(roleNames);
  }
  return roleNames.some(roleName => hasRole(roleName));
};

/**
 * Get all privilege names for the current user
 * @returns {string[]} - Array of privilege names
 */
export const getUserPrivilegeNames = () => {
  const privileges = getUserPrivileges();
  return privileges.map(privilege => privilege.privilegeName);
};

/**
 * Check if current user is admin
 * @returns {boolean} - True if user has admin role, false otherwise
 */
export const isAdmin = () => {
  return hasRole('ROLE_ADMIN');
};

/**
 * Common role checks
 */
export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  MANAGER: 'ROLE_MANAGER',
  VIEWER: 'ROLE_VIEWER',
};

/**
 * Helper function to conditionally render components based on privileges
 * @param {string|string[]} requiredPrivileges - Required privilege(s)
 * @param {React.Component} component - Component to render if user has privileges
 * @param {React.Component} fallback - Optional fallback component if user doesn't have privileges
 * @returns {React.Component|null} - Component if authorized, fallback or null otherwise
 */
export const renderWithPrivilege = (requiredPrivileges, component, fallback = null) => {
  if (hasAnyPrivilege(requiredPrivileges)) {
    return component;
  }
  return fallback;
};

/**
 * Helper function to conditionally render components based on roles
 * @param {string|string[]} requiredRoles - Required role(s)
 * @param {React.Component} component - Component to render if user has roles
 * @param {React.Component} fallback - Optional fallback component if user doesn't have roles
 * @returns {React.Component|null} - Component if authorized, fallback or null otherwise
 */
export const renderWithRole = (requiredRoles, component, fallback = null) => {
  if (hasAnyRole(requiredRoles)) {
    return component;
  }
  return fallback;
};