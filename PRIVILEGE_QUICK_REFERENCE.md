# Privilege System Quick Reference

## System Privileges List

### User Management

- `user.create` - Create new users
- `user.read` - View user lists and details
- `user.update` - Edit user information
- `user.delete` - Delete users
- `user.*` - All user management operations

### Medicine Stock

- `medicine.stock.view` - View medicine stock lists
- `medicine.stock.details` - View detailed stock information
- `medicine.stock.create` - Add new medicine to stock
- `medicine.stock.update` - Update medicine information
- `medicine.stock.batch.add` - Add new batches
- `medicine.stock.batch.edit` - Edit batch information
- `medicine.stock.batch.delete` - Delete batches
- `medicine.stock.*` - All medicine stock operations

### Dashboard

- `dashboard.view` - Access dashboard
- `dashboard.*` - All dashboard features

### Distribution

- `medicine.distribution.view` - View distributions
- `medicine.distribution.details` - View distribution details
- `medicine.distribution.create` - Create distributions
- `medicine.distribution.center.add` - Add delivery centers
- `medicine.distribution.patient.add` - Add patients
- `medicine.distribution.*` - All distribution operations

### Reports

- `Report.costing` - Generate costing reports
- `Report.*` - All reporting features

### Settings

- `settings.medicince.*` - Manage medicine types/categories
- `settings.location.*` - Manage locations and warehouses
- `settings.*` - All settings management

### Super Admin

- `*` - Complete system access

## Quick Usage Patterns

### 1. Check Single Privilege

```jsx
const { hasPrivilege } = usePrivileges();

if (hasPrivilege("user.create")) {
  // Show create user button
}
```

### 2. Guard Component with Privilege

```jsx
<PrivilegeGuard privileges="user.read">
  <UserList />
</PrivilegeGuard>
```

### 3. Multiple Privileges (ANY)

```jsx
<PrivilegeGuard privileges={["user.create", "user.update"]}>
  <UserForm />
</PrivilegeGuard>
```

### 4. Multiple Privileges (ALL)

```jsx
<PrivilegeGuard privileges={["user.read", "user.update"]} requireAll={true}>
  <UserEditForm />
</PrivilegeGuard>
```

### 5. Wildcard Privileges

```jsx
// User with "medicine.stock.*" can access all medicine stock features
<PrivilegeGuard privileges="medicine.stock.create">
  <AddMedicineButton />
</PrivilegeGuard>
```

### 6. Super Admin Check

```jsx
const { hasPrivilege } = usePrivileges();

if (hasPrivilege("*")) {
  // Super admin features
}
```

## Common Component Patterns

### Navigation Item with Privilege

```jsx
<PrivilegeGuard privileges="user.read" fallback={null}>
  <NavItem to="/users">User Management</NavItem>
</PrivilegeGuard>
```

### Button with Privilege

```jsx
<PrivilegeGuard
  privileges="user.create"
  fallback={<button disabled>Create User (No Permission)</button>}
>
  <button onClick={createUser}>Create User</button>
</PrivilegeGuard>
```

### Conditional Feature Display

```jsx
const MyComponent = () => {
  const { hasPrivilege } = usePrivileges();

  return (
    <div>
      {hasPrivilege("user.read") && <UserStats />}
      {hasPrivilege("medicine.stock.view") && <StockOverview />}
      {hasPrivilege("dashboard.*") && <AdvancedAnalytics />}
    </div>
  );
};
```

## Route Protection Examples

### Protected Route Component

```jsx
const ProtectedRoute = ({ children, requiredPrivilege }) => {
  const { hasPrivilege } = usePrivileges();

  if (!hasPrivilege(requiredPrivilege)) {
    return <AccessDenied />;
  }

  return children;
};

// Usage
<Route
  path="/users"
  element={
    <ProtectedRoute requiredPrivilege="user.read">
      <UserManagement />
    </ProtectedRoute>
  }
/>;
```

## Testing Different User Types

### Super Admin (`*`)

```javascript
// Can access everything in the system
hasPrivilege("user.create"); // ✅ true
hasPrivilege("medicine.stock.view"); // ✅ true
hasPrivilege("settings.*"); // ✅ true
```

### Medicine Stock Manager (`medicine.stock.*`)

```javascript
hasPrivilege("medicine.stock.view"); // ✅ true
hasPrivilege("medicine.stock.batch.add"); // ✅ true
hasPrivilege("user.create"); // ❌ false
hasPrivilege("settings.*"); // ❌ false
```

### User Manager (`user.*`)

```javascript
hasPrivilege("user.create"); // ✅ true
hasPrivilege("user.update"); // ✅ true
hasPrivilege("medicine.stock.view"); // ❌ false
```

### Read-Only User (`user.read`, `medicine.stock.view`, `dashboard.view`)

```javascript
hasPrivilege("user.read"); // ✅ true
hasPrivilege("user.create"); // ❌ false
hasPrivilege("medicine.stock.view"); // ✅ true
hasPrivilege("medicine.stock.create"); // ❌ false
```

## Import Statements

```javascript
// Hooks
import { usePrivileges, useRole } from "../hooks/usePrivileges";

// Components
import PrivilegeGuard from "../components/common/PrivilegeGuard";

// Utilities
import {
  hasPrivilege,
  hasAnyPrivilege,
  PRIVILEGES,
  PRIVILEGE_GROUPS,
} from "../utils/privilegeUtils";

// Constants
import { PRIVILEGES } from "../utils/privilegeUtils";
```

## Debugging Tips

### Check Current User Privileges

```javascript
const { privileges, role } = usePrivileges();
console.log("Current role:", role);
console.log("Current privileges:", privileges);
```

### Test Privilege Check

```javascript
const { hasPrivilege } = usePrivileges();
console.log("Can create users:", hasPrivilege("user.create"));
console.log("Has medicine access:", hasPrivilege("medicine.stock.*"));
```
