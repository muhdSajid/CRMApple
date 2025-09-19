import { useSelector } from 'react-redux';
import { useMemo } from 'react';

/**
 * Custom hook for accessing user privileges and roles in React components
 * @returns {Object} - Object containing privilege and role checking functions and data
 */
export const usePrivileges = () => {
  const { role, privileges } = useSelector((state) => state.auth);

  // Memoized privilege checking functions
  const privilegeHelpers = useMemo(() => {
    /**
     * Check if user has a specific privilege
     * Handles wildcard privileges (*, user.*, medicine.stock.*, etc.)
     * @param {string} privilegeName - The privilege name to check
     * @returns {boolean} - True if user has the privilege
     */
    const hasPrivilege = (privilegeName) => {
      if (!privileges || privileges.length === 0) return false;
      
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
     * Check if user has any of the specified privileges
     * @param {string|string[]} privilegeNames - Single or array of privilege names
     * @returns {boolean} - True if user has at least one privilege
     */
    const hasAnyPrivilege = (privilegeNames) => {
      if (!Array.isArray(privilegeNames)) {
        return hasPrivilege(privilegeNames);
      }
      return privilegeNames.some(privilegeName => hasPrivilege(privilegeName));
    };

    /**
     * Check if user has all of the specified privileges
     * @param {string|string[]} privilegeNames - Single or array of privilege names
     * @returns {boolean} - True if user has all privileges
     */
    const hasAllPrivileges = (privilegeNames) => {
      if (!Array.isArray(privilegeNames)) {
        return hasPrivilege(privilegeNames);
      }
      return privilegeNames.every(privilegeName => hasPrivilege(privilegeName));
    };

    /**
     * Check if user has a specific role
     * @param {string} roleName - The role name to check
     * @returns {boolean} - True if user has the role
     */
    const hasRole = (roleName) => {
      return role?.name === roleName;
    };

    /**
     * Check if user has any of the specified roles
     * @param {string|string[]} roleNames - Single or array of role names
     * @returns {boolean} - True if user has at least one role
     */
    const hasAnyRole = (roleNames) => {
      if (!Array.isArray(roleNames)) {
        return hasRole(roleNames);
      }
      return roleNames.some(roleName => hasRole(roleName));
    };

    /**
     * Check if user is admin
     * @returns {boolean} - True if user has admin role
     */
    const isAdmin = () => {
      return hasRole('ROLE_ADMIN');
    };

    /**
     * Get all privilege names as array
     * @returns {string[]} - Array of privilege names
     */
    const getPrivilegeNames = () => {
      return privileges?.map(privilege => privilege.privilegeName) || [];
    };

    return {
      hasPrivilege,
      hasAnyPrivilege,
      hasAllPrivileges,
      hasRole,
      hasAnyRole,
      isAdmin,
      getPrivilegeNames,
    };
  }, [role, privileges]);

  return {
    // Raw data
    role,
    privileges,
    roleName: role?.name || null,
    roleDisplayName: role?.displayName || null,
    
    // Helper functions
    ...privilegeHelpers,
    
    // Computed states
    isRoleLoaded: !!role,
    hasAnyPrivileges: privileges?.length > 0,
  };
};

/**
 * Hook specifically for role information
 * @returns {Object} - Role information and checking functions
 */
export const useRole = () => {
  const { role } = useSelector((state) => state.auth);
  
  return {
    role,
    roleName: role?.name || null,
    roleDisplayName: role?.displayName || null,
    isRoleLoaded: !!role,
    isAdmin: role?.name === 'ROLE_ADMIN',
  };
};

/**
 * Hook for checking if user is currently loading privileges
 * @returns {boolean} - True if role/privileges are being loaded
 */
export const usePrivilegeLoading = () => {
  const { isRoleLoading } = useSelector((state) => state.auth);
  return isRoleLoading;
};