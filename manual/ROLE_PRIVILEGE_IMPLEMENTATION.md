# Role and Privilege Management Implementation

This guide explains how the role and privilege management system works in the application after successful login.

## Overview

After a successful login, the application automatically fetches the user's role and privileges from the backend API and stores them in Redux state and localStorage for persistence.

## API Endpoint

The system calls the following endpoint after successful authentication:

```
GET http://localhost:8080/api/v1/users/getRoleWithPrivileges/{userId}
```

## Implementation Flow

### 1. Login Process

1. User logs in successfully
2. System fetches user role and privileges using the user ID
3. Role and privilege data is stored in Redux state and localStorage
4. User is redirected to dashboard with full access control in place

### 2. Data Structure

The API returns data in the following format:

```json
{
  "id": 1,
  "name": "ROLE_ADMIN",
  "displayName": "Administrator",
  "privileges": [
    {
      "id": 101,
      "privilegeName": "VIEW_USERS",
      "description": "Can view user list"
    },
    {
      "id": 102,
      "privilegeName": "EDIT_USERS",
      "description": "Can edit user details"
    }
  ]
}
```

### 3. Redux State

The auth slice now includes:

```javascript
{
  user: userInfo,
  role: roleObject,
  privileges: privilegeArray,
  isRoleLoading: boolean,
  roleError: string|null
}
```

## Usage Examples

### 1. Using the usePrivileges Hook

```jsx
import { usePrivileges } from "../../hooks/usePrivileges";

const MyComponent = () => {
  const { hasPrivilege, hasAnyPrivilege, isAdmin, roleDisplayName } =
    usePrivileges();

  if (hasPrivilege("user.read")) {
    // Render user list
  }

  if (hasAnyPrivilege(["user.update", "user.create"])) {
    // Show edit/create buttons
  }

  // Check for wildcard privileges
  if (hasPrivilege("medicine.stock.*")) {
    // User has all medicine stock permissions
  }

  if (isAdmin()) {
    // Show admin-only features
  }
};
```

### 2. Using PrivilegeGuard Component

```jsx
import PrivilegeGuard from "../common/PrivilegeGuard";
import { PRIVILEGES } from "../../utils/privilegeUtils";

const MyComponent = () => (
  <div>
    <PrivilegeGuard
      privileges={PRIVILEGES.USER_READ}
      fallback={<div>Access denied</div>}
    >
      <UserList />
    </PrivilegeGuard>

    <PrivilegeGuard
      privileges={["user.update", "user.create"]}
      requireAll={false} // User needs ANY of these privileges
    >
      <EditButton />
    </PrivilegeGuard>

    {/* Wildcard privilege check */}
    <PrivilegeGuard privileges={PRIVILEGES.MEDICINE_STOCK_ALL}>
      <MedicineStockManagement />
    </PrivilegeGuard>

    {/* Super admin check */}
    <PrivilegeGuard privileges={PRIVILEGES.ALL}>
      <SuperAdminPanel />
    </PrivilegeGuard>
  </div>
);
```

### 3. Using Utility Functions

```javascript
import {
  hasPrivilege,
  hasAnyRole,
  isAdmin,
  PRIVILEGES,
  ROLES,
} from "../../utils/privilegeUtils";

// Check single privilege
if (hasPrivilege(PRIVILEGES.USER_READ)) {
  // Allow user list access
}

// Check wildcard privilege
if (hasPrivilege(PRIVILEGES.MEDICINE_STOCK_ALL)) {
  // User can perform all medicine stock operations
}

// Check super admin
if (hasPrivilege(PRIVILEGES.ALL)) {
  // Super admin access
}

// Multiple roles check
if (hasAnyRole([ROLES.ADMIN, ROLES.MANAGER])) {
  // Show management features
}
```

### 4. Conditional Rendering

```jsx
import { renderWithPrivilege, PRIVILEGES } from "../../utils/privilegeUtils";

const MyComponent = () => (
  <div>
    {renderWithPrivilege(
      PRIVILEGES.USER_UPDATE,
      <EditButton />,
      <span>No edit permission</span>
    )}

    {/* Render with wildcard privilege */}
    {renderWithPrivilege(
      PRIVILEGES.SETTINGS_ALL,
      <SettingsPanel />,
      <span>Settings access restricted</span>
    )}
  </div>
);
```

## Available Privilege Constants

The system now uses the actual backend privileges with wildcard support:

```javascript
export const PRIVILEGES = {
  // User Management Privileges
  USER_CREATE: "user.create",
  USER_READ: "user.read",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_ALL: "user.*",

  // Medicine Stock Privileges
  MEDICINE_STOCK_VIEW: "medicine.stock.view",
  MEDICINE_STOCK_DETAILS: "medicine.stock.details",
  MEDICINE_STOCK_CREATE: "medicine.stock.create",
  MEDICINE_STOCK_UPDATE: "medicine.stock.update",
  MEDICINE_STOCK_BATCH_ADD: "medicine.stock.batch.add",
  MEDICINE_STOCK_BATCH_EDIT: "medicine.stock.batch.edit",
  MEDICINE_STOCK_BATCH_DELETE: "medicine.stock.batch.delete",
  MEDICINE_STOCK_ALL: "medicine.stock.*",

  // Dashboard Privileges
  DASHBOARD_VIEW: "dashboard.view",
  DASHBOARD_ALL: "dashboard.*",

  // Distribution Privileges
  MEDICINE_DISTRIBUTION_VIEW: "medicine.distribution.view",
  MEDICINE_DISTRIBUTION_DETAILS: "medicine.distribution.details",
  MEDICINE_DISTRIBUTION_CREATE: "medicine.distribution.create",
  MEDICINE_DISTRIBUTION_CENTER_ADD: "medicine.distribution.center.add",
  MEDICINE_DISTRIBUTION_PATIENT_ADD: "medicine.distribution.patient.add",
  MEDICINE_DISTRIBUTION_ALL: "medicine.distribution.*",

  // Report Privileges
  REPORT_COSTING: "Report.costing",
  REPORT_ALL: "Report.*",

  // Settings Privileges
  SETTINGS_MEDICINE_ALL: "settings.medicince.*",
  SETTINGS_LOCATION_ALL: "settings.location.*",
  SETTINGS_ALL: "settings.*",

  // Super Admin Privilege
  ALL: "*",
};
```

### Privilege Hierarchy

The system supports hierarchical privileges with wildcard matching:

- `*` - Super admin access to everything
- `user.*` - All user management operations
- `medicine.stock.*` - All medicine stock operations (including batch operations)
- `dashboard.*` - All dashboard features
- `medicine.distribution.*` - All distribution operations
- `Report.*` - All reporting capabilities
- `settings.*` - All settings management

### Wildcard Logic

The privilege checking system automatically handles wildcards:

1. **Exact Match**: `user.create` matches exactly
2. **Super Admin**: `*` grants access to everything
3. **Category Wildcards**: `user.*` grants access to all user operations
4. **Nested Wildcards**: Automatically resolves nested permissions

Example: If user has `medicine.stock.*`, they automatically get:

- `medicine.stock.view`
- `medicine.stock.create`
- `medicine.stock.batch.add`
- `medicine.stock.batch.edit`
- And all other medicine.stock.\* permissions

## Available Role Constants

```javascript
export const ROLES = {
  ADMIN: "ROLE_ADMIN",
  USER: "ROLE_USER",
  MANAGER: "ROLE_MANAGER",
  VIEWER: "ROLE_VIEWER",
};
```

## Error Handling

The system gracefully handles errors:

- If role/privilege fetching fails, the user can still access the dashboard
- Errors are logged to console for debugging
- Role and privilege checks default to `false` if data is unavailable

## Persistence

Role and privilege data is persisted in:

1. Redux state (for component access)
2. localStorage (for page refreshes)

Data is automatically cleaned up on:

- User logout
- Token expiration
- Authentication errors

## Security Notes

1. **Client-side only**: This is UI-level access control. Always validate permissions on the server-side
2. **Token-based**: Privileges are tied to token validity
3. **Automatic cleanup**: Expired tokens automatically clear role data
4. **Fallback behavior**: Components gracefully handle missing privilege data

## Testing the Implementation

1. Login with different user roles
2. Check that UI elements show/hide based on privileges
3. Verify role display in settings page
4. Test privilege-based navigation restrictions
5. Ensure proper cleanup on logout

## Customization

To add new privileges:

1. Add the privilege name to `PRIVILEGES` constant in `privilegeUtils.js`
2. Use the new privilege in components with `PrivilegeGuard` or `usePrivileges`
3. Ensure the backend API returns the new privilege for appropriate roles
