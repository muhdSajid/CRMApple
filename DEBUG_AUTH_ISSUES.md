# Network Error Fix Guide

## Issue: Network Error (Curl works in Postman but fails in browser)

Since your curl command works in Postman, this is a **browser CORS/network issue**.

## Quick Fix Steps

### 1. Set Token Manually

Open browser console on `http://localhost:5174/usermanagment` and run:

```javascript
setupManualToken();
```

This will set your working token and refresh the page.

### 2. Required Backend CORS Configuration

Your backend needs these CORS headers for browser requests:

```java
// Spring Boot CORS Configuration
@CrossOrigin(origins = "http://localhost:5174",
            allowedHeaders = {"Authorization", "Content-Type"},
            methods = {RequestMethod.GET, RequestMethod.POST})

// OR in application.properties
cors.allowed-origins=http://localhost:5174
cors.allowed-headers=Authorization,Content-Type
cors.allowed-methods=GET,POST,PUT,DELETE
```

### 3. Alternative CORS Headers (Express/Node.js style)

```javascript
Access-Control-Allow-Origin: http://localhost:5174
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## Network Error Types

### Type 1: CORS Preflight Failure

**Symptom**: Network error, no response in browser
**Fix**: Add OPTIONS method support to your backend

### Type 2: CORS Origin Rejection

**Symptom**: CORS policy error in console
**Fix**: Add `http://localhost:5174` to allowed origins

### Type 3: Authorization Header Blocked

**Symptom**: 401 error, header missing in network tab
**Fix**: Add "Authorization" to allowed headers

## Testing Flow

1. **Run**: `setupManualToken()` in browser console
2. **Check**: Network tab shows Authorization header
3. **Verify**: User management page loads data
4. **Fix Backend**: Add CORS configuration if still failing

## Backend Requirements Checklist

- [ ] Server running on `http://localhost:8081`
- [ ] CORS allows origin: `http://localhost:5174`
- [ ] CORS allows header: `Authorization`
- [ ] CORS allows methods: `GET, POST`
- [ ] OPTIONS preflight handled
- [ ] Endpoint exists: `/api/v1/users/getAll`

## Immediate Test

Run this in browser console after setting up token:

```javascript
fetch("http://localhost:8081/api/v1/users/getAll", {
  headers: {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyYW5lZXNoYWtAZ21haWwuY29tIiwiaWF0IjoxNzU1NTI3NjA5LCJleHAiOjE3NTU2MTQwMDl9.Jj0KSVpSdJ_4AZ1vCm4GKJIXLPZWkjHfYbbTkJI5csM",
  },
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```
