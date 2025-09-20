// CORS and Authentication Debugging Script
// Run this in the browser console to test different approaches

console.log('=== CORS & AUTH DEBUGGING SCRIPT ===');

// Test 1: Simple GET request without custom headers (no preflight)
async function testSimpleRequest() {
  console.log('\n🔍 Test 1: Simple GET request (no preflight)');
  try {
    const response = await fetch('http://localhost:8081/api/v1/users/getRoleWithPrivileges/1');
    console.log('✅ Simple request status:', response.status);
    const data = await response.text();
    console.log('Response data:', data);
  } catch (error) {
    console.error('❌ Simple request failed:', error);
  }
}

// Test 2: Request with Authorization header (triggers preflight)
async function testAuthRequest() {
  console.log('\n🔍 Test 2: Request with Authorization header');
  
  // Get token from localStorage
  const authData = localStorage.getItem('authData');
  let token = null;
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      token = parsed.token;
      console.log('Token from localStorage:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
    } catch (e) {
      console.error('Failed to parse auth data:', e);
    }
  }
  
  if (!token) {
    console.error('❌ No token found in localStorage');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:8081/api/v1/users/getRoleWithPrivileges/1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Auth request status:', response.status);
    const data = await response.text();
    console.log('Response data:', data);
  } catch (error) {
    console.error('❌ Auth request failed:', error);
  }
}

// Test 3: Manual OPTIONS request to check CORS
async function testOptionsRequest() {
  console.log('\n🔍 Test 3: Manual OPTIONS request (CORS preflight)');
  try {
    const response = await fetch('http://localhost:8081/api/v1/users/getRoleWithPrivileges/1', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5174',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type'
      }
    });
    
    console.log('✅ OPTIONS request status:', response.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
    });
  } catch (error) {
    console.error('❌ OPTIONS request failed:', error);
  }
}

// Test 4: Check current auth state
function checkAuthState() {
  console.log('\n🔍 Test 4: Current authentication state');
  
  const authData = localStorage.getItem('authData');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      console.log('Auth data found:', {
        hasToken: !!parsed.token,
        tokenLength: parsed.token?.length,
        user: parsed.user,
        isAuthenticated: parsed.isAuthenticated
      });
    } catch (e) {
      console.error('Failed to parse auth data:', e);
    }
  } else {
    console.log('❌ No auth data in localStorage');
  }
}

// Run all tests
async function runAllTests() {
  checkAuthState();
  await testSimpleRequest();
  await testOptionsRequest();
  await testAuthRequest();
  
  console.log('\n📋 SUMMARY:');
  console.log('1. If simple request works but auth request fails → CORS issue');
  console.log('2. If OPTIONS returns 401 → Backend CORS not configured properly');
  console.log('3. Check if backend accepts Authorization header in CORS config');
}

// Export functions for manual testing
window.corsDebug = {
  testSimpleRequest,
  testAuthRequest,
  testOptionsRequest,
  checkAuthState,
  runAllTests
};

console.log('✅ Debug functions available as: corsDebug.runAllTests()');
console.log('Individual tests: corsDebug.testSimpleRequest(), corsDebug.testAuthRequest(), etc.');