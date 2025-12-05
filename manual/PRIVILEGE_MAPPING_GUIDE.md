# Privilege Mapping Guide

This document maps UI actions to system privileges for the inventory management application.

## System Privileges Overview

The system uses a hierarchical privilege structure with wildcard support:

- `*` - Super admin access to everything
- `user.*` - All user management actions
- `medicine.stock.*` - All medicine stock operations
- `dashboard.*` - All dashboard features
- `medicine.distribution.*` - All distribution operations
- `Report.*` - All reporting features
- `settings.*` - All settings management

## UI Component to Privilege Mapping

### 1. User Management (`/usermanagment`)

| UI Action                   | Required Privilege | Alternative Privileges |
| --------------------------- | ------------------ | ---------------------- |
| View user list              | `user.read`        | `user.*`, `*`          |
| Create new user             | `user.create`      | `user.*`, `*`          |
| Edit user details           | `user.update`      | `user.*`, `*`          |
| Delete user                 | `user.delete`      | `user.*`, `*`          |
| Access user management page | `user.read`        | `user.*`, `*`          |

### 2. Medicine Stock Management (`/medicine-stock`)

| UI Action          | Required Privilege            | Alternative Privileges  |
| ------------------ | ----------------------------- | ----------------------- |
| View stock list    | `medicine.stock.view`         | `medicine.stock.*`, `*` |
| View stock details | `medicine.stock.details`      | `medicine.stock.*`, `*` |
| Add new medicine   | `medicine.stock.create`       | `medicine.stock.*`, `*` |
| Edit medicine info | `medicine.stock.update`       | `medicine.stock.*`, `*` |
| Add batch          | `medicine.stock.batch.add`    | `medicine.stock.*`, `*` |
| Edit batch         | `medicine.stock.batch.edit`   | `medicine.stock.*`, `*` |
| Delete batch       | `medicine.stock.batch.delete` | `medicine.stock.*`, `*` |

### 3. Dashboard (`/dashboard` or `/`)

| UI Action                     | Required Privilege | Alternative Privileges |
| ----------------------------- | ------------------ | ---------------------- |
| View dashboard                | `dashboard.view`   | `dashboard.*`, `*`     |
| Access all dashboard features | `dashboard.*`      | `*`                    |

### 4. Distribution Management (`/distribution`)

| UI Action                 | Required Privilege                  | Alternative Privileges         |
| ------------------------- | ----------------------------------- | ------------------------------ |
| View distributions        | `medicine.distribution.view`        | `medicine.distribution.*`, `*` |
| View distribution details | `medicine.distribution.details`     | `medicine.distribution.*`, `*` |
| Create distribution       | `medicine.distribution.create`      | `medicine.distribution.*`, `*` |
| Add delivery center       | `medicine.distribution.center.add`  | `medicine.distribution.*`, `*` |
| Add patient               | `medicine.distribution.patient.add` | `medicine.distribution.*`, `*` |

### 5. Reporting (`/costing`)

| UI Action            | Required Privilege | Alternative Privileges |
| -------------------- | ------------------ | ---------------------- |
| View costing reports | `Report.costing`   | `Report.*`, `*`        |
| Access all reports   | `Report.*`         | `*`                    |

### 6. Settings

#### Settings Overview (`/settings`)

| UI Action          | Required Privilege                             | Alternative Privileges |
| ------------------ | ---------------------------------------------- | ---------------------- |
| View settings page | `settings.*` OR any specific setting privilege | `*`                    |

#### Medicine Types (`/settings/medicine-types`)

| UI Action             | Required Privilege     | Alternative Privileges |
| --------------------- | ---------------------- | ---------------------- |
| Manage medicine types | `settings.medicince.*` | `settings.*`, `*`      |

#### Location Management (`/settings/locations`)

| UI Action        | Required Privilege    | Alternative Privileges |
| ---------------- | --------------------- | ---------------------- |
| Manage locations | `settings.location.*` | `settings.*`, `*`      |

#### Role Management (`/settings/role-management`)

| UI Action    | Required Privilege  | Alternative Privileges |
| ------------ | ------------------- | ---------------------- |
| Manage roles | Admin role required | `*`                    |

## Implementation Examples

### Example 1: Medicine Stock Component

```jsx
import { usePrivileges } from "../hooks/usePrivileges";
import PrivilegeGuard from "../common/PrivilegeGuard";
import { PRIVILEGES } from "../utils/privilegeUtils";

const MedicineStock = () => {
  const { hasPrivilege } = usePrivileges();

  return (
    <div>
      {/* View stock list - requires medicine.stock.view */}
      <PrivilegeGuard privileges={PRIVILEGES.MEDICINE_STOCK_VIEW}>
        <StockList />
      </PrivilegeGuard>

      {/* Add new medicine - requires medicine.stock.create */}
      <PrivilegeGuard privileges={PRIVILEGES.MEDICINE_STOCK_CREATE}>
        <AddMedicineButton />
      </PrivilegeGuard>

      {/* Batch operations - requires specific batch privileges */}
      <PrivilegeGuard
        privileges={[
          PRIVILEGES.MEDICINE_STOCK_BATCH_ADD,
          PRIVILEGES.MEDICINE_STOCK_BATCH_EDIT,
          PRIVILEGES.MEDICINE_STOCK_BATCH_DELETE,
        ]}
      >
        <BatchManagement />
      </PrivilegeGuard>
    </div>
  );
};
```

### Example 2: User Management Component

```jsx
const UserManagement = () => {
  const { hasPrivilege } = usePrivileges();

  return (
    <div>
      {/* User list - requires user.read */}
      {hasPrivilege(PRIVILEGES.USER_READ) && <UserList />}

      {/* Create user button - requires user.create */}
      {hasPrivilege(PRIVILEGES.USER_CREATE) && (
        <button onClick={createUser}>Add User</button>
      )}

      {/* Edit/Delete actions - require respective privileges */}
      <PrivilegeGuard privileges={PRIVILEGES.USER_UPDATE}>
        <EditButton />
      </PrivilegeGuard>

      <PrivilegeGuard privileges={PRIVILEGES.USER_DELETE}>
        <DeleteButton />
      </PrivilegeGuard>
    </div>
  );
};
```

### Example 3: Dashboard Component

```jsx
const Dashboard = () => {
  return (
    <PrivilegeGuard
      privileges={PRIVILEGES.DASHBOARD_VIEW}
      fallback={<div>Access denied to dashboard</div>}
    >
      <DashboardContent />
    </PrivilegeGuard>
  );
};
```

## Privilege Hierarchy Logic

The system checks privileges in the following order:

1. **Exact Match**: Direct privilege name match (e.g., `user.create`)
2. **Super Admin**: `*` privilege grants access to everything
3. **Category Wildcards**: `user.*` grants access to all user operations
4. **Nested Wildcards**: `medicine.stock.*` grants access to all stock operations including batch operations

### Examples:

- User with `*` privilege: Can do everything
- User with `user.*` privilege: Can perform all user operations (`user.create`, `user.read`, `user.update`, `user.delete`)
- User with `medicine.stock.*` privilege: Can perform all medicine stock operations including batch operations
- User with `user.read` privilege: Can only view users, cannot create/edit/delete

## Navigation Access Control

### Sidebar/Navigation Guards

```jsx
// In your navigation component
<PrivilegeGuard privileges={PRIVILEGES.USER_READ}>
  <NavigationItem to="/usermanagment">User Management</NavigationItem>
</PrivilegeGuard>

<PrivilegeGuard privileges={PRIVILEGES.MEDICINE_STOCK_VIEW}>
  <NavigationItem to="/medicine-stock">Medicine Stock</NavigationItem>
</PrivilegeGuard>

<PrivilegeGuard privileges={PRIVILEGES.DASHBOARD_VIEW}>
  <NavigationItem to="/dashboard">Dashboard</NavigationItem>
</PrivilegeGuard>
```

## Testing Different User Roles

### Super Admin (\*)

- Can access everything
- All UI elements visible and functional

### Stock Manager (medicine.stock.\*)

- Can manage all medicine stock operations
- Cannot access user management or settings
- Can view dashboard if has dashboard.view

### User Manager (user.\*)

- Can manage all user operations
- Cannot access medicine stock or other modules
- Limited dashboard access

### Viewer (specific read permissions)

- user.read, medicine.stock.view, dashboard.view
- Can only view data, no create/edit/delete operations
- Read-only access to respective modules

This mapping ensures that the UI properly reflects user permissions and provides appropriate access control throughout the application.
