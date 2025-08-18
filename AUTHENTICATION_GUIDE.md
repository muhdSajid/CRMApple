# Authentication Implementation Guide

## Overview

This React application now includes secure authentication functionality with Redux store integration. The authentication system includes:

- Secure login with JWT token management
- Protected routes
- User session management
- Automatic token refresh handling
- Logout functionality

## Features Implemented

### 1. Redux Authentication Store (`src/store/authSlice.js`)

- **Login Action**: `loginUser` - Authenticates user with backend API
- **Logout Action**: `logoutUser` - Clears user session and tokens
- **Auth Status Check**: `checkAuthStatus` - Validates existing session on app load
- **State Management**: Handles loading, success, error states

### 2. Secure Token Storage

- JWT tokens stored in localStorage with expiration timestamps
- Automatic token validation and cleanup
- 24-hour token expiration (configurable)

### 3. Protected Routes (`src/components/common/ProtectedRoute.jsx`)

- Automatically redirects unauthenticated users to login
- Wraps all protected dashboard routes

### 4. Enhanced Login Component (`src/components/auth/Login.jsx`)

- Form validation
- Loading states and user feedback
- Automatic redirect after successful login
- Error handling with toast notifications

### 5. API Integration

- Base URL configured for `http://localhost:8081/api/auth/signin`
- Automatic token injection in API requests
- Token expiration handling with auto-logout

### 6. Navigation Updates (`src/Layout/NavBar.jsx`)

- Displays authenticated user information
- Logout functionality with confirmation
- Clean session termination

## API Configuration

The authentication service is configured to work with your backend API:

```bash
curl --location 'http://localhost:8081/api/auth/signin' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email":"raneeshak@gmail.com",
    "password":"password"
}'
```

## Usage Instructions

### 1. Starting the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5174/` (or next available port)

### 2. Authentication Flow

1. Navigate to `http://localhost:5174/`
2. If not authenticated, you'll be redirected to `http://localhost:5174/login`
3. Enter your credentials (email and password)
4. Upon successful login, you'll be redirected to the dashboard
5. Your session will persist across browser refreshes for 24 hours

### 3. Logout

- Click on your profile in the top-right corner
- Select "Sign out" from the dropdown menu
- You'll be redirected to the login page

## Security Features

### Token Management

- Tokens are stored with expiration timestamps
- Automatic cleanup of expired tokens
- Secure HTTP-only cookie alternative available (configurable)

### Route Protection

- All dashboard routes require authentication
- Automatic redirect to login for unauthenticated access
- Session validation on app initialization

### API Security

- Bearer token authentication
- Automatic token injection for authenticated requests
- 401 response handling with auto-logout

## Configuration

### API Endpoints

Update `src/constants/constants.js` to modify API endpoints:

```javascript
export const apiDomain = "http://localhost:8081";
export const authApiDomain = "http://localhost:8081";
```

### Token Expiration

Modify token expiration in `src/store/authSlice.js`:

```javascript
expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend API has CORS configured for `http://localhost:5174`
2. **Token Expiration**: Users will be automatically logged out when tokens expire
3. **Network Errors**: Check that the backend API is running on `http://localhost:8081`

### Backend Requirements

Your backend API should:

1. Accept POST requests to `/api/auth/signin`
2. Return JWT tokens in the response
3. Include user information in the response
4. Handle CORS for the frontend domain

## Testing

Test the authentication flow:

1. Try accessing `http://localhost:5174/` without being logged in
2. Verify redirect to login page
3. Test login with valid credentials
4. Verify successful redirect to dashboard
5. Test logout functionality
6. Verify token persistence across browser refreshes

## Next Steps

Consider implementing:

1. Remember me functionality
2. Password reset flow
3. User registration enhancement
4. Role-based access control
5. Refresh token implementation
