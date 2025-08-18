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

### Spring Boot CORS Configuration

If your backend is a Spring Boot application, you can fix the CORS issue by adding a global configuration. Create a new class `WebConfig.java` in your project, for example under a `config` package.

```java
package com.yourproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/v1/**") // Apply to all endpoints under /api/v1/
            .allowedOrigins("http://localhost:5174") // Your React app's origin
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
            .allowedHeaders("Authorization", "Content-Type", "Accept") // Allowed headers
            .allowCredentials(true) // Allow sending credentials
            .maxAge(3600); // Cache preflight response
    }
}
```

**Explanation:**

- **`@Configuration` & `@EnableWebMvc`**: Standard annotations to enable and customize Spring MVC.
- **`addMapping("/api/v1/**")`**: Applies this CORS configuration to all endpoints starting with `/api/v1/`. You can change this to `/\*\*` to apply it globally.
- **`.allowedOrigins("http://localhost:5174")`**: This explicitly permits your frontend application to access the API.
- **`.allowedHeaders("Authorization", "Content-Type", "Accept")`**: This is critical. It allows the browser to send the `Authorization` header (containing your JWT token) with the request.

### Spring Boot CORS Configuration (Production-Ready)

You are right to point out that hardcoding URLs is not a good practice. The best approach is to externalize the configuration into your `application.properties` file.

#### Step 1: Add Origins to `application.properties`

Define the allowed origins in your `src/main/resources/application.properties` file. This allows you to manage different environments (dev, prod) easily.

```properties
# ===================================================================
# CORS Configuration
# ===================================================================
# Comma-separated list of allowed origins for CORS.
# Add your production frontend URL here as well.
app.cors.allowed-origins=http://localhost:5174,https://your-production-app.com
```

#### Step 2: Create a `WebConfig` to Use the Properties

Create a configuration class that reads these properties and applies them to the CORS settings.

```java
package com.yourproject.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    // Inject the comma-separated list from application.properties
    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/v1/**") // Apply to all endpoints under /api/v1/
            .allowedOrigins(allowedOrigins) // Read from properties
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
            .allowedHeaders("Authorization", "Content-Type", "Accept") // Allowed headers
            .allowCredentials(true) // Allow sending credentials
            .maxAge(3600); // Cache preflight response
    }
}
```

**Explanation:**

- **`@Value("${app.cors.allowed-origins}")`**: This annotation injects the property from your `application.properties` file into the `allowedOrigins` array.
- **`.allowedOrigins(allowedOrigins)`**: This uses the values you configured, making your code flexible and secure without hardcoded URLs.
- **`.allowedHeaders("Authorization", "Content-Type", "Accept")`**: This is critical. It allows the browser to send the `Authorization` header (containing your JWT token) with the request.

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
