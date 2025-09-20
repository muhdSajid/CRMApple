// CORS Bypass Testing - Use this to test the API directly
// Run this in Node.js (not browser) to bypass CORS

const https = require('https');
const http = require('http');

// Test function to call the API directly (bypassing CORS)
function testApiDirectly() {
  console.log('=== DIRECT API TEST (No CORS) ===');
  
  // You'll need to replace this with an actual token
  const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token from login
  const userId = '1';
  
  const options = {
    hostname: 'localhost',
    port: 8081,
    path: `/api/v1/users/getRoleWithPrivileges/${userId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  };
  
  console.log('Request options:', options);
  
  const req = http.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response Body:', data);
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed Response:', parsed);
      } catch (e) {
        console.log('Response is not JSON:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Request failed:', error);
  });
  
  req.end();
}

// CORS configuration that should be on the backend
const corsConfig = `
Backend CORS Configuration Needed:

For Spring Boot:
@CrossOrigin(
    origins = {"http://localhost:5174", "http://localhost:5173"}, 
    allowedHeaders = {"*"}, 
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = true
)

For Express.js:
app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

The key points:
1. Must allow Authorization header
2. Must handle OPTIONS method
3. Must allow the frontend origin (http://localhost:5174)
4. Should set Access-Control-Allow-Credentials: true if needed
`;

console.log(corsConfig);

// Uncomment the line below and add a real token to test
// testApiDirectly();

module.exports = { testApiDirectly };