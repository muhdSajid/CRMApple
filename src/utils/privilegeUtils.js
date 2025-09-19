/**
 * Utility functions for checking user privileges and managing access control
 */

import { getUserRole, getUserPrivileges } from '../service/authService';

/**
 * Check if the current user has a specific privilege
 * Handles wildcard privileges (*, user.*, medicine.stock.*, etc.)
 * @param {string} privilegeName - The name of the privilege to check
 * @returns {boolean} - True if user has the privilege, false otherwise
 */
export const hasPrivilege = (privilegeName) => {
  const privileges = getUserPrivileges();
  
  // Check for exact match first
  const hasExactMatch = privileges.some(privilege => privilege.privilegeName === privilegeName);
  if (hasExactMatch) return true;

  // Check for super admin privilege (*)
  const hasSuperAdmin = privileges.some(privilege => privilege.privilegeName === '*');
  if (hasSuperAdmin) return true;

  // Check for wildcard privileges
  const privilegeParts = privilegeName.split('.');
  
  // Check for category wildcards (e.g., user.* covers user.create, user.read, etc.)
  for (let i = privilegeParts.length - 1; i > 0; i--) {
    const wildcardPattern = privilegeParts.slice(0, i).join('.') + '.*';
    const hasWildcard = privileges.some(privilege => privilege.privilegeName === wildcardPattern);
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
 * System privilege constants matching the actual backend privileges
 * These correspond to the exact privilege names returned by the API
 */
export const PRIVILEGES = {
  // User Management Privileges
  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ALL: 'user.*',

  // Medicine Stock Privileges
  MEDICINE_STOCK_VIEW: 'medicine.stock.view',
  MEDICINE_STOCK_DETAILS: 'medicine.stock.details',
  MEDICINE_STOCK_CREATE: 'medicine.stock.create',
  MEDICINE_STOCK_UPDATE: 'medicine.stock.update',
  MEDICINE_STOCK_BATCH_ADD: 'medicine.stock.batch.add',
  MEDICINE_STOCK_BATCH_EDIT: 'medicine.stock.batch.edit',
  MEDICINE_STOCK_BATCH_DELETE: 'medicine.stock.batch.delete',
  MEDICINE_STOCK_ALL: 'medicine.stock.*',

  // Dashboard Privileges
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_ALL: 'dashboard.*',

  // Distribution Privileges
  MEDICINE_DISTRIBUTION_VIEW: 'medicine.distribution.view',
  MEDICINE_DISTRIBUTION_DETAILS: 'medicine.distribution.details',
  MEDICINE_DISTRIBUTION_CREATE: 'medicine.distribution.create',
  MEDICINE_DISTRIBUTION_CENTER_ADD: 'medicine.distribution.center.add',
  MEDICINE_DISTRIBUTION_PATIENT_ADD: 'medicine.distribution.patient.add',
  MEDICINE_DISTRIBUTION_ALL: 'medicine.distribution.*',

  // Report Privileges
  REPORT_COSTING: 'Report.costing',
  REPORT_ALL: 'Report.*',

  // Settings Privileges
  SETTINGS_MEDICINE_ALL: 'settings.medicince.*',
  SETTINGS_LOCATION_ALL: 'settings.location.*',
  SETTINGS_ALL: 'settings.*',

  // Super Admin Privilege
  ALL: '*',
};

/**
 * Privilege groups for easier management
 */
export const PRIVILEGE_GROUPS = {
  // User Management
  USER_MANAGEMENT: [
    PRIVILEGES.USER_CREATE,
    PRIVILEGES.USER_READ,
    PRIVILEGES.USER_UPDATE,
    PRIVILEGES.USER_DELETE,
    PRIVILEGES.USER_ALL
  ],

  // Medicine Stock Management
  MEDICINE_STOCK: [
    PRIVILEGES.MEDICINE_STOCK_VIEW,
    PRIVILEGES.MEDICINE_STOCK_DETAILS,
    PRIVILEGES.MEDICINE_STOCK_CREATE,
    PRIVILEGES.MEDICINE_STOCK_UPDATE,
    PRIVILEGES.MEDICINE_STOCK_ALL
  ],

  // Medicine Stock Batch Operations
  MEDICINE_BATCH: [
    PRIVILEGES.MEDICINE_STOCK_BATCH_ADD,
    PRIVILEGES.MEDICINE_STOCK_BATCH_EDIT,
    PRIVILEGES.MEDICINE_STOCK_BATCH_DELETE
  ],

  // Dashboard Access
  DASHBOARD: [
    PRIVILEGES.DASHBOARD_VIEW,
    PRIVILEGES.DASHBOARD_ALL
  ],

  // Distribution Management
  DISTRIBUTION: [
    PRIVILEGES.MEDICINE_DISTRIBUTION_VIEW,
    PRIVILEGES.MEDICINE_DISTRIBUTION_DETAILS,
    PRIVILEGES.MEDICINE_DISTRIBUTION_CREATE,
    PRIVILEGES.MEDICINE_DISTRIBUTION_CENTER_ADD,
    PRIVILEGES.MEDICINE_DISTRIBUTION_PATIENT_ADD,
    PRIVILEGES.MEDICINE_DISTRIBUTION_ALL
  ],

  // Reporting
  REPORTS: [
    PRIVILEGES.REPORT_COSTING,
    PRIVILEGES.REPORT_ALL
  ],

  // Settings Management
  SETTINGS: [
    PRIVILEGES.SETTINGS_MEDICINE_ALL,
    PRIVILEGES.SETTINGS_LOCATION_ALL,
    PRIVILEGES.SETTINGS_ALL
  ]
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