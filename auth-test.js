/**
 * Quick Authentication Test for Privilege API
 * 
 * Run this in the browser console after login to test the API manually
 */

console.log('🔧 AUTHENTICATION TEST SCRIPT LOADED');

window.testAuthWithRealToken = async function() {
  console.log('=== TESTING AUTHENTICATION WITH CURRENT TOKEN ===');
  
  const userInfo = localStorage.getItem('userInfo');
  const userToken = localStorage.getItem('userToken');
  
  if (!userInfo || !userToken) {
    console.error('❌ Please login first. Missing userInfo or userToken in localStorage.');
    return;
  }
  
  try {
    const userData = JSON.parse(userInfo);
    const tokenData = JSON.parse(userToken);
    
    console.log('📦 Current data:');
    console.log('User ID:', userData.id);
    console.log('Token exists:', !!tokenData.token);
    console.log('Token preview:', tokenData.token?.substring(0, 30) + '...');
    
    const apiUrl = `http://localhost:8081/api/v1/users/getRoleWithPrivileges/${userData.id}`;
    console.log('🚀 Testing API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.token}`
      }
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Role data:', data);
      
      // Test storing it
      localStorage.setItem('userRole', JSON.stringify(data));
      console.log('✅ Stored in localStorage');
      console.log('🔄 Refresh the page to see navigation');
      
      return data;
    } else {
      const errorText = await response.text();
      console.error('❌ API Error Status:', response.status);
      console.error('❌ Error Response:', errorText);
      
      if (response.status === 401) {
        console.error('🔒 Authentication failed. Token might be invalid or expired.');
      } else if (response.status === 403) {
        console.error('🚫 Access denied. User might not have permission.');
      } else if (response.status === 404) {
        console.error('👤 User not found.');
      }
      
      return null;
    }
  } catch (error) {
    console.error('❌ Network/Request Error:', error);
    return null;
  }
};

window.debugTokens = function() {
  console.log('=== TOKEN DEBUG ===');
  
  const userInfo = localStorage.getItem('userInfo');
  const userToken = localStorage.getItem('userToken');
  
  if (userInfo) {
    const userData = JSON.parse(userInfo);
    console.log('UserInfo token field:', userData.token?.substring(0, 30) + '...');
  }
  
  if (userToken) {
    const tokenData = JSON.parse(userToken);
    console.log('UserToken token field:', tokenData.token?.substring(0, 30) + '...');
  }
  
  console.log('Are they the same?', 
    JSON.parse(userInfo)?.token === JSON.parse(userToken)?.token
  );
};

console.log('\n📋 AVAILABLE FUNCTIONS:');
console.log('- testAuthWithRealToken() - Test API with your actual token');
console.log('- debugTokens() - Compare tokens in localStorage');

console.log('\n💡 TIP: Run testAuthWithRealToken() after login to verify API access');

// Auto-check if user is already logged in
const userInfo = localStorage.getItem('userInfo');
if (userInfo) {
  console.log('✅ User appears to be logged in. You can run testAuthWithRealToken() now.');
} else {
  console.log('ℹ️ Please login first, then run testAuthWithRealToken()');
}