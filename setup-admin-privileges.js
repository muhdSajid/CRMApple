/**
 * Updated Privilege Debug and Setup Script
 * 
 * To use this script:
 * 1. Open browser dev tools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter to run
 */

console.log('🔍 STARTING UPDATED PRIVILEGE DEBUG...');

// 1. Check localStorage directly
console.log('\n📦 LOCALSTORAGE CHECK:');
const userToken = localStorage.getItem('userToken');
const userRole = localStorage.getItem('userRole');
const userInfo = localStorage.getItem('userInfo');

console.log('userToken exists:', !!userToken);
console.log('userRole:', userRole ? JSON.parse(userRole) : 'MISSING');
console.log('userInfo:', userInfo ? JSON.parse(userInfo) : 'MISSING');

// 2. Extract user ID from stored data
if (userInfo) {
  const userData = JSON.parse(userInfo);
  console.log('\n🔍 USER ID EXTRACTION:');
  console.log('userData.id:', userData.id);
  console.log('userData.userId:', userData.userId);
  console.log('userData.user_id:', userData.user_id);
  console.log('userData.sub:', userData.sub);
  
  const possibleUserId = userData.id || userData.userId || userData.user_id || userData.sub;
  console.log('Extracted User ID:', possibleUserId);
  
  // 3. Test API call manually
  if (possibleUserId && userToken) {
    const tokenData = JSON.parse(userToken);
    console.log('\n🚀 MANUAL API TEST:');
    
    window.testRoleAPI = async function() {
      try {
        console.log('Testing API call to:', `http://localhost:8081/api/v1/users/getRoleWithPrivileges/${possibleUserId}`);
        
        const response = await fetch(`http://localhost:8081/api/v1/users/getRoleWithPrivileges/${possibleUserId}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.token}`
          }
        });
        
        console.log('API Response Status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API Success - Role Data:', data);
          
          // Store it manually for testing
          localStorage.setItem('userRole', JSON.stringify(data));
          console.log('✅ Stored role data in localStorage');
          console.log('🔄 Refresh the page to see navigation');
          return data;
        } else {
          const errorData = await response.text();
          console.log('❌ API Error Response:', errorData);
          return null;
        }
      } catch (error) {
        console.error('❌ API Call Failed:', error);
        return null;
      }
    };
    
    console.log('Run testRoleAPI() to manually test the API call');
  }
}

// 4. Enhanced privilege setup functions
window.setupAdminPrivileges = function() {
  console.log('🔧 Setting up admin privileges manually...');
  
  const adminRole = {
    id: 1,
    name: "ROLE_ADMIN",
    displayName: "Administrator",
    privileges: [
      {
        id: 1,
        privilegeName: "*",
        description: "Super admin - all privileges"
      }
    ]
  };
  
  try {
    localStorage.setItem('userRole', JSON.stringify(adminRole));
    console.log('✅ Admin privileges set successfully');
    console.log('🔄 Please refresh the page to see changes');
    return true;
  } catch (error) {
    console.error('❌ Failed to set admin privileges:', error);
    return false;
  }
};

window.checkPrivilegeSystem = function() {
  console.log('� CHECKING PRIVILEGE SYSTEM STATUS:');
  
  const userRoleData = localStorage.getItem('userRole');
  if (!userRoleData) {
    console.log('❌ No userRole found in localStorage');
    console.log('� This means the API call to fetch privileges failed or was never made');
    return false;
  }
  
  const role = JSON.parse(userRoleData);
  console.log('✅ Role found:', role);
  console.log('✅ Privileges:', role.privileges?.map(p => p.privilegeName));
  
  const hasWildcard = role.privileges?.some(p => p.privilegeName === '*');
  console.log('Has wildcard (*):', hasWildcard);
  
  if (hasWildcard) {
    console.log('✅ User should see ALL navigation items');
  } else {
    console.log('ℹ️ User will see limited navigation based on specific privileges');
  }
  
  return true;
};

// 5. Instructions
console.log('\n� AVAILABLE FUNCTIONS:');
console.log('- checkPrivilegeSystem() - Check current privilege status');
console.log('- setupAdminPrivileges() - Manually set admin privileges');
console.log('- testRoleAPI() - Test the API call manually (if user data available)');

// Auto-run checks
console.log('\n🚀 AUTOMATIC CHECKS:');
window.checkPrivilegeSystem();

console.log('\n🔍 DEBUG COMPLETE');
console.log('💡 TIP: If no userRole found, the API call is failing. Use testRoleAPI() to debug.');