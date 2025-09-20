// Temporary CORS workaround - Add this script to test CORS bypass
// This should be used ONLY for debugging, not in production

export const corsWorkaround = {
  // Method 1: Try with minimal headers
  async callApiMinimal(userId, token) {
    console.log('🔧 CORS Workaround - Minimal headers');
    try {
      const response = await fetch(`http://localhost:8081/api/v1/users/getRoleWithPrivileges/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Minimal headers approach failed:', error);
      throw error;
    }
  },

  // Method 2: Try with mode: 'cors'
  async callApiWithCors(userId, token) {
    console.log('🔧 CORS Workaround - Explicit CORS mode');
    try {
      const response = await fetch(`http://localhost:8081/api/v1/users/getRoleWithPrivileges/${userId}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit', // Try without credentials first
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('CORS mode approach failed:', error);
      throw error;
    }
  },

  // Method 3: Try with a different approach - POST instead of GET to avoid some CORS issues
  async callApiAsPost(userId, token) {
    console.log('🔧 CORS Workaround - POST method');
    try {
      const response = await fetch('http://localhost:8081/api/v1/users/getRoleWithPrivileges', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('POST method approach failed:', error);
      throw error;
    }
  }
};

// Instructions for backend developer
export const backendCorsInstructions = `
BACKEND CORS CONFIGURATION NEEDED:

The 401 error on OPTIONS request indicates the backend is not properly configured for CORS.

For Spring Boot, add this to your controller or application:

@RestController
@CrossOrigin(
    origins = {"http://localhost:5174", "http://localhost:5173"}, 
    allowedHeaders = {"*"}, 
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = true
)
public class UserController {
    // your endpoints
}

Or globally in Application class:
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:5174", "http://localhost:5173"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}

IMPORTANT POINTS:
1. The OPTIONS request should NOT require authentication
2. Must allow 'Authorization' header
3. Must include the frontend origin
4. Should return appropriate CORS headers

The issue is that your backend is returning 401 for the OPTIONS preflight request,
which should be allowed without authentication.
`;

console.log('CORS workaround functions loaded');
console.log('Backend instructions:', backendCorsInstructions);