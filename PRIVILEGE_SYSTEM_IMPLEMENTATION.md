# Privilege-Based Authorization System Implementation

## Overview

This document provides a comprehensive guide to the privilege-based authorization system implemented across the inventory management application. The system provides fine-grained access control at both component and route levels.

## System Architecture

### 1. Privilege Constants (`/src/constants/constants.js`)

```javascript
export const PRIVILEGES = {
  // User Management
  USER_CREATE: "user.create",
  USER_READ: "user.read",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",

  // Medicine Stock Management
  MEDICINE_STOCK_VIEW: "medicine.stock.view",
  MEDICINE_STOCK_CREATE: "medicine.stock.create",
  MEDICINE_STOCK_UPDATE: "medicine.stock.update",
  MEDICINE_STOCK_DELETE: "medicine.stock.delete",

  // Distribution Management
  DISTRIBUTION_VIEW: "distribution.view",
  DISTRIBUTION_CREATE: "distribution.create",
  DISTRIBUTION_UPDATE: "distribution.update",
  DISTRIBUTION_DELETE: "distribution.delete",
  DISTRIBUTION_PATIENT_ADD: "distribution.patient.add",
  DISTRIBUTION_CENTER_ADD: "distribution.center.add",

  // Dashboard and Analytics
  DASHBOARD_VIEW: "dashboard.view",

  // Reports and Costing
  REPORT_COSTING: "report.costing",

  // Settings Management
  SETTINGS_VIEW: "settings.view",
  MEDICINE_TYPE_MANAGE: "medicine.type.manage",
  LOCATION_MANAGE: "location.manage",

  // Role Management
  ROLE_CREATE: "role.create",
  ROLE_READ: "role.read",
  ROLE_UPDATE: "role.update",
  ROLE_DELETE: "role.delete",
  ROLE_MANAGE: "role.manage",

  // System Administration
  SYSTEM_ADMIN: "*",
};
```

### 2. Privilege Groups for Navigation

```javascript
export const PRIVILEGE_GROUPS = {
  DASHBOARD_ACCESS: [PRIVILEGES.DASHBOARD_VIEW, "*"],
  MEDICINE_STOCK_ACCESS: [
    PRIVILEGES.MEDICINE_STOCK_VIEW,
    PRIVILEGES.MEDICINE_STOCK_CREATE,
    PRIVILEGES.MEDICINE_STOCK_UPDATE,
    PRIVILEGES.MEDICINE_STOCK_DELETE,
    "medicine.stock.*",
    "*",
  ],
  DISTRIBUTION_ACCESS: [
    PRIVILEGES.DISTRIBUTION_VIEW,
    PRIVILEGES.DISTRIBUTION_CREATE,
    PRIVILEGES.DISTRIBUTION_UPDATE,
    PRIVILEGES.DISTRIBUTION_DELETE,
    "distribution.*",
    "*",
  ],
  USER_MANAGEMENT_ACCESS: [
    PRIVILEGES.USER_CREATE,
    PRIVILEGES.USER_READ,
    PRIVILEGES.USER_UPDATE,
    PRIVILEGES.USER_DELETE,
    "user.*",
    "*",
  ],
  SETTINGS_ACCESS: [
    PRIVILEGES.SETTINGS_VIEW,
    PRIVILEGES.MEDICINE_TYPE_MANAGE,
    PRIVILEGES.LOCATION_MANAGE,
    PRIVILEGES.ROLE_MANAGE,
    "settings.*",
    "*",
  ],
  REPORTS_ACCESS: [PRIVILEGES.REPORT_COSTING, "report.*", "*"],
};
```

### 3. Privilege Utilities (`/src/utils/privilegeUtils.js`)

Core utility functions for privilege checking with wildcard support:

```javascript
import { PRIVILEGES } from "../constants/constants";

export const hasPrivilege = (userPrivileges, requiredPrivilege) => {
  if (!userPrivileges || userPrivileges.length === 0) {
    return false;
  }

  // Check for exact match
  if (userPrivileges.includes(requiredPrivilege)) {
    return true;
  }

  // Check for wildcard privileges
  if (userPrivileges.includes("*")) {
    return true;
  }

  // Check for module-level wildcards (e.g., "user.*" covers "user.create", "user.read", etc.)
  const parts = requiredPrivilege.split(".");
  if (parts.length > 1) {
    const moduleWildcard = parts[0] + ".*";
    if (userPrivileges.includes(moduleWildcard)) {
      return true;
    }
  }

  return false;
};

export const hasAnyPrivilege = (userPrivileges, requiredPrivileges) => {
  if (!requiredPrivileges || requiredPrivileges.length === 0) {
    return true;
  }

  return requiredPrivileges.some((privilege) =>
    hasPrivilege(userPrivileges, privilege)
  );
};
```

## Component Implementation

### 1. PrivilegeGuard Component

```jsx
// Usage example:
<PrivilegeGuard privileges={[PRIVILEGES.MEDICINE_STOCK_CREATE]}>
  <button>Add Medicine</button>
</PrivilegeGuard>
```

### 2. Route Protection

```jsx
// ProtectedRouteWithPrivileges usage:
<Route
  path="/stock"
  element={
    <ProtectedRouteWithPrivileges
      privileges={[PRIVILEGES.MEDICINE_STOCK_VIEW]}
      element={<MedicineStock />}
    />
  }
/>
```

## Implementation Details

### Sidebar Navigation Protection

All navigation items in `Sidebar.jsx` are wrapped with `PrivilegeGuard` components using appropriate privilege groups:

```jsx
<PrivilegeGuard privileges={PRIVILEGE_GROUPS.MEDICINE_STOCK_ACCESS}>
  <NavLink to="/stock">Medicine Stock</NavLink>
</PrivilegeGuard>
```

### Component-Level Protection

Each major component has privilege guards around sensitive actions:

**Medicine Stock Component:**

- View: `MEDICINE_STOCK_VIEW`
- Add Medicine: `MEDICINE_STOCK_CREATE`
- Edit Medicine: `MEDICINE_STOCK_UPDATE`
- Delete Medicine: `MEDICINE_STOCK_DELETE`

**Distribution Component:**

- View Distributions: `DISTRIBUTION_VIEW`
- Create Distribution: `DISTRIBUTION_CREATE`
- Add Patients: `DISTRIBUTION_PATIENT_ADD`
- Add Centers: `DISTRIBUTION_CENTER_ADD`

**User Management Component:**

- View Users: `USER_READ`
- Add User: `USER_CREATE`
- Edit User: `USER_UPDATE`
- Delete User: `USER_DELETE`

### Route-Level Protection

All sensitive routes are protected with specific privilege requirements:

```jsx
// Dashboard requires dashboard view
<Route index element={
  <ProtectedRouteWithPrivileges
    privileges={[PRIVILEGES.DASHBOARD_VIEW]}
    element={<Dashboard />}
  />
} />

// Medicine Stock requires view privileges
<Route path="/stock" element={
  <ProtectedRouteWithPrivileges
    privileges={[PRIVILEGES.MEDICINE_STOCK_VIEW]}
    element={<MedicineStock />}
  />
} />
```

## Wildcard Privilege Support

The system supports three levels of wildcard privileges:

1. **Full Admin (`*`)**: Access to everything
2. **Module Wildcards (`user.*`, `medicine.stock.*`)**: Access to all operations within a module
3. **Specific Privileges (`user.create`, `medicine.stock.view`)**: Access to specific operations

## User Privilege Storage

User privileges are stored in localStorage after login and managed through Redux:

```javascript
// Privileges are stored as an array in user object
const user = {
  id: 123,
  name: "John Doe",
  privileges: ["user.read", "medicine.stock.*", "dashboard.view"],
};
```

## Testing Privilege System

### Manual Testing Steps:

1. **Login with different user roles**
2. **Verify sidebar visibility** - Only accessible modules should be visible
3. **Test component-level guards** - Buttons/actions should hide based on privileges
4. **Test route protection** - Direct URL access should be blocked without privileges
5. **Test wildcard privileges** - Users with `*` or `module.*` should have appropriate access

### Test Scenarios:

1. **User with only `user.read`**: Should only see user management in sidebar, can view users but cannot add/edit/delete
2. **User with `medicine.stock.*`**: Should have full access to medicine stock module
3. **User with `*`**: Should have access to everything
4. **User with no privileges**: Should see minimal interface, mostly restricted access

## Security Considerations

1. **Frontend-only protection**: This system provides UI/UX protection but backend API must also validate privileges
2. **Token validation**: Ensure JWT tokens contain privilege information and are validated on each API request
3. **Privilege synchronization**: Keep frontend and backend privilege definitions in sync
4. **Session management**: Privileges should be refreshed when user roles change

## Maintenance Guidelines

1. **Adding new privileges**: Add to `PRIVILEGES` object in constants.js
2. **Adding new components**: Wrap sensitive actions with `PrivilegeGuard`
3. **Adding new routes**: Use `ProtectedRouteWithPrivileges` for privilege-sensitive routes
4. **Updating privilege groups**: Modify `PRIVILEGE_GROUPS` when adding new navigation items

## Troubleshooting

### Common Issues:

1. **Sidebar items not hiding**: Check if privilege groups are correctly defined and imported
2. **Route access not blocked**: Ensure route uses `ProtectedRouteWithPrivileges` with correct privileges
3. **Component actions visible**: Verify `PrivilegeGuard` wrapper is properly implemented
4. **Wildcard not working**: Check `privilegeUtils.js` implementation and privilege string format

### Debug Tools:

```javascript
// Check user privileges in browser console
console.log(
  "User privileges:",
  JSON.parse(localStorage.getItem("user"))?.privileges
);

// Test privilege checking
import { hasPrivilege } from "./utils/privilegeUtils";
const userPrivileges =
  JSON.parse(localStorage.getItem("user"))?.privileges || [];
console.log(
  "Has medicine stock view:",
  hasPrivilege(userPrivileges, "medicine.stock.view")
);
```

## Summary

This privilege-based authorization system provides comprehensive access control across the entire application with:

- ✅ **Sidebar navigation protection** based on user privileges
- ✅ **Component-level action protection** for buttons and sensitive operations
- ✅ **Route-level protection** preventing direct URL access
- ✅ **Wildcard privilege support** for flexible role management
- ✅ **Centralized privilege definitions** for easy maintenance
- ✅ **Consistent implementation** across all application modules

The system ensures that users only see and can access functionality appropriate to their assigned privileges, providing both security and improved user experience.
