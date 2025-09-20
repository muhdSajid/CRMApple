/**
 * Manual Login Debug and Test Script - Updated for your login response format
 */

console.log('🔧 MANUAL LOGIN DEBUG TOOLS LOADED');

// Function to manually test the privilege API call with your exact data format
window.testPrivilegeAPICall = async function() {
  console.log('=== MANUAL PRIVILEGE API TEST ===');
  
  // Get stored data
  const userInfo = localStorage.getItem('userInfo');
  const userToken = localStorage.getItem('userToken');
  
  if (!userToken) {
    console.error('❌ No userToken found. Please login first.');
    return;
  }
  
  if (!userInfo) {
    console.error('❌ No userInfo found. Please login first.');
    return;
  }
  
  const tokenData = JSON.parse(userToken);
  const userData = JSON.parse(userInfo);
  
  console.log('📦 Available data:');
  console.log('Token:', tokenData.token ? 'Available' : 'Missing');
  console.log('User data fields:', Object.keys(userData));
  console.log('User data:', userData);
  
  // Extract user ID based on your login response format
  const userId = userData.id; // Based on your response, id should be available directly
  
  if (!userId) {
    console.error('❌ Could not extract user ID from:', userData);
    console.error('Expected userData.id but got:', userData.id);
    return;
  }
  
  console.log('✅ Extracted User ID:', userId);
  
  // Make the API call
  try {
    const apiUrl = `http://localhost:8081/api/v1/users/getRoleWithPrivileges/${userId}`;
    console.log('🚀 Making API call to:', apiUrl);
    console.log('🚀 Using token:', tokenData.token.substring(0, 20) + '...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.token}`
      }
    });
    
    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const roleData = await response.json();
      console.log('✅ API SUCCESS - Role Data:', roleData);
      
      // Store it in localStorage
      localStorage.setItem('userRole', JSON.stringify(roleData));
      console.log('✅ Stored role data in localStorage');
      console.log('🔄 Refresh the page to see navigation');
      
      return roleData;
    } else {
      const errorText = await response.text();
      console.error('❌ API ERROR Response:', errorText);
      
      // Try to parse error as JSON
      try {
        const errorData = JSON.parse(errorText);
        console.error('❌ Parsed Error Data:', errorData);
      } catch (e) {
        console.error('❌ Error response is not valid JSON');
      }
      
      return null;
    }
  } catch (error) {
    console.error('❌ Network/Request Error:', error);
    return null;
  }
};

// Quick test function based on your exact login format
window.quickTest = function() {
  console.log('🚀 QUICK TEST - Using your exact login format');
  
  // Simulate your exact login response
  const sampleUserData = {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyYW5lZXNoYWtAZ21haWwuY29tIiwiaWF0IjoxNzU4MzU1OTAyLCJleHAiOjE3NTg0NDIzMDJ9.NJ6cXt5uE50K47ynQRii0JgK6TuR8Ox13-qfLtAor7I",
    "id": 1,
    "firstName": "Raneesh",
    "lastName": "AK",
    "email": "raneeshak@gmail.com",
    "roles": ["ROLE_ADMIN"],
    "type": "Bearer",
    "username": "raneeshak@gmail.com"
  };
  
  console.log('Sample user data:', sampleUserData);
  console.log('User ID would be:', sampleUserData.id);
  console.log('API call would be made to:', `http://localhost:8081/api/v1/users/getRoleWithPrivileges/${sampleUserData.id}`);
};

// Rest of the debug functions remain the same...
window.checkLoginState = function() {
  console.log('=== LOGIN STATE CHECK ===');
  
  const userToken = localStorage.getItem('userToken');
  const userInfo = localStorage.getItem('userInfo');
  const userRole = localStorage.getItem('userRole');
  
  console.log('LocalStorage items:');
  console.log('- userToken:', userToken ? 'EXISTS' : 'MISSING');
  console.log('- userInfo:', userInfo ? 'EXISTS' : 'MISSING');
  console.log('- userRole:', userRole ? 'EXISTS' : 'MISSING');
  
  if (userInfo) {
    try {
      const userData = JSON.parse(userInfo);
      console.log('User data fields:', Object.keys(userData));
      console.log('User ID (userData.id):', userData.id);
      console.log('Full user data:', userData);
    } catch (e) {
      console.error('❌ Invalid user info data');
    }
  }
  
  if (userRole) {
    try {
      const roleData = JSON.parse(userRole);
      console.log('Role data:', roleData);
      console.log('Privileges:', roleData.privileges?.map(p => p.privilegeName));
    } catch (e) {
      console.error('❌ Invalid role data');
    }
  }
};

console.log('\n� AVAILABLE FUNCTIONS:');
console.log('- quickTest() - Test with your exact login data format');
console.log('- checkLoginState() - Check current login/token state');
console.log('- testPrivilegeAPICall() - Manually test the privilege API');

console.log('\n🚀 RUNNING INITIAL CHECK:');
window.checkLoginState();