/**
 * Manual Privilege Debug Script
 * 
 * To use this script:
 * 1. Open browser dev tools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter to run
 * 
 * This will help identify why admin users can't see navigation options
 */

console.log('🔍 STARTING PRIVILEGE DEBUG...');

// 1. Check localStorage directly
console.log('\n📦 LOCALSTORAGE CHECK:');
const userToken = localStorage.getItem('userToken');
const userRole = localStorage.getItem('userRole');
const userInfo = localStorage.getItem('userInfo');

console.log('userToken exists:', !!userToken);
console.log('userRole:', userRole ? JSON.parse(userRole) : 'MISSING');
console.log('userInfo:', userInfo ? JSON.parse(userInfo) : 'MISSING');

// 2. Test privilege functions if available
if (window.location.pathname.includes('/')) {
  console.log('\n🔧 TESTING PRIVILEGE FUNCTIONS:');
  
  // Try to manually test getUserPrivileges
  try {
    const userRoleObj = userRole ? JSON.parse(userRole) : null;
    const privileges = userRoleObj?.privileges || [];
    console.log('Extracted privileges:', privileges);
    console.log('Privilege names:', privileges.map(p => p?.privilegeName));
    
    // Check if * privilege exists
    const hasWildcard = privileges.some(p => p?.privilegeName === '*');
    console.log('Has wildcard (*):', hasWildcard);
    
    // Check specific privilege patterns
    const privilegeNames = privileges.map(p => p?.privilegeName).filter(Boolean);
    console.log('All privilege names:', privilegeNames);
    
  } catch (error) {
    console.error('Error testing privileges manually:', error);
  }
}

// 3. Create test function for privilege checking
console.log('\n⚡ MANUAL PRIVILEGE TEST:');
window.testPrivilege = function(privilegeName) {
  try {
    const userRoleObj = userRole ? JSON.parse(userRole) : null;
    const privileges = userRoleObj?.privileges || [];
    
    // Exact match test
    const exactMatch = privileges.some(p => p?.privilegeName === privilegeName);
    
    // Wildcard test
    const wildcardMatch = privileges.some(p => p?.privilegeName === '*');
    
    console.log(`Testing privilege "${privilegeName}":`, {
      exactMatch,
      wildcardMatch,
      result: exactMatch || wildcardMatch
    });
    
    return exactMatch || wildcardMatch;
  } catch (error) {
    console.error('Error in testPrivilege:', error);
    return false;
  }
};

// 4. Instructions for user
console.log('\n📋 HOW TO TEST:');
console.log('1. Run: testPrivilege("*") - Should return true for admin');
console.log('2. Run: testPrivilege("dashboard.view") - Should return true if user has * or exact privilege');
console.log('3. Run: testPrivilege("medicine.stock.view") - Should return true if user has * or exact privilege');

// 5. Quick automated tests
console.log('\n🚀 AUTOMATED TESTS:');
if (userRole) {
  const testResults = {
    'wildcard (*)': window.testPrivilege('*'),
    'dashboard.view': window.testPrivilege('dashboard.view'), 
    'medicine.stock.view': window.testPrivilege('medicine.stock.view'),
    'user.read': window.testPrivilege('user.read')
  };
  
  console.table(testResults);
  
  const hasAnyAccess = Object.values(testResults).some(Boolean);
  console.log(hasAnyAccess ? '✅ User has some privileges' : '❌ User has NO privileges');
} else {
  console.log('❌ No userRole found in localStorage');
}

console.log('\n🔍 DEBUG COMPLETE - Check results above');
console.log('💡 TIP: Add ?debug=true to URL for more detailed logging');

// 6. Add URL parameter for enhanced debugging
if (!window.location.search.includes('debug=true')) {
  console.log('\n🔗 For enhanced debugging, visit:');
  const debugUrl = window.location.origin + window.location.pathname + '?debug=true';
  console.log(debugUrl);
}