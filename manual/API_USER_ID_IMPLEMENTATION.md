# API User ID Header Implementation

This document describes the implementation of automatic user_id header inclusion in all API requests.

## Overview

All API calls in the application now automatically include a `user_id` header containing the authenticated user's identifier. This is handled transparently through Axios request interceptors.

## Implementation Details

### 1. Authentication Service Updates (`src/service/authService.js`)

- Added `getUserId()` function to extract user ID from authentication response data
- Added `getUserFullName()` function to format user's full name for display
- JWT token decoding capability as fallback for user identification
- Priority order: Authentication response `id` → `userId` → JWT token fields

### 2. API Service Updates (`src/service/api.js`)

- Enhanced request interceptor to automatically add `user_id` header
- Headers are added to all authenticated requests
- Debug logging to track header inclusion

### 3. Authentication Response Structure

The application now handles the complete authentication response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": 1,
  "firstName": "Raneesh",
  "lastName": "AK",
  "email": "raneeshak@gmail.com",
  "roles": ["ROLE_ADMIN"],
  "type": "Bearer",
  "username": "raneeshak@gmail.com"
}
```

### 4. Manual Token Setup Updates (`src/utils/manualTokenSetup.js`)

- Updated to match actual authentication response structure
- Includes all user fields: `id`, `firstName`, `lastName`, `email`, `roles`

### 5. UI Updates (`src/Layout/NavBar.jsx`)

- Navbar now displays full name using `getUserFullName()`
- Formats name as "firstName lastName" or falls back appropriately

## API Header Structure

Every authenticated API request will now include:

```javascript
{
  "Authorization": "Bearer <jwt_token>",
  "user_id": "<user_identifier>",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

## User ID Resolution Order

The system attempts to resolve the user ID in this order:

1. **Authentication Response ID**: `userInfo.id` from the authentication response (PRIMARY)
2. **Legacy User ID**: `userInfo.userId` for backward compatibility
3. **JWT Token Fields**: Decoded JWT token fields as fallback:
   - `userId`
   - `sub` (standard JWT subject field)
   - `id`
   - `email` (as last resort identifier)

## User Display Name

The `getUserFullName()` function formats the user's display name:

1. **Full Name**: `firstName + " " + lastName` if both available
2. **First Name Only**: If only firstName is available
3. **Email Fallback**: If no name fields are available
4. **Default**: "User" as final fallback

## Affected API Calls

All API calls made through the following methods automatically include the `user_id` header:

### Service Layer

- `get()` - GET requests via apiService
- `post()` - POST requests via apiService
- Direct `api.get()`, `api.post()`, `api.put()`, `api.delete()` calls

### Redux Slices

- `usersSlice.js` - User management operations
- `donationSlice.js` - Donation report operations
- All other slices using the centralized `api` instance

### Component API Calls

- Medicine stock data fetching
- Location data fetching
- All API calls in React components using the service layer

## Testing

To test the implementation:

1. **Browser Console Test**:

   ```javascript
   // Setup manual token (if needed)
   setupManualToken();

   // Test API headers
   testApiHeaders();
   ```

2. **Network Tab Verification**:

   - Open browser DevTools → Network tab
   - Make any API call in the application
   - Check request headers for `user_id` field

3. **Debug Logging**:
   - API calls include debug logging in browser console
   - Shows token presence and user_id header inclusion

## Error Handling

- Missing user ID: Request proceeds without user_id header (non-authenticated endpoints)
- Invalid JWT token: Falls back to email or other available identifiers
- No authentication: Only affects authenticated endpoints

## Security Notes

- User ID is extracted from client-side stored data and JWT tokens
- Backend should validate the user_id header against the JWT token
- User ID format depends on your authentication implementation (email, UUID, etc.)

## Files Modified

1. `src/service/authService.js` - Added getUserId() and getUserFullName() functions
2. `src/service/api.js` - Enhanced request interceptor for user_id header
3. `src/utils/manualTokenSetup.js` - Updated to match authentication response structure
4. `src/utils/testApiHeaders.js` - Enhanced testing utility with full name support
5. `src/Layout/NavBar.jsx` - Updated to display full name using getUserFullName()
6. `src/store/authSlice.js` - Already properly stores complete authentication response

## No Changes Required For

- Individual React components
- Redux slices (already using centralized API)
- Login endpoint (no user_id needed before authentication)
- Existing API call patterns

The implementation is backward compatible and requires no changes to existing code that uses the service layer for API calls.
