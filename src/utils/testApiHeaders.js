// Test utility to verify API headers are working correctly
import { getUserId, getUserToken, getUserInfo, getUserFullName } from '../service/authService';
import { get } from '../service/apiService';
import { apiDomain } from '../constants/constants';

export const testApiHeaders = async () => {
  try {
    console.log('=== TESTING API HEADERS ===');
    
    // Test user authentication info
    const userToken = getUserToken();
    const userId = getUserId();
    const userInfo = getUserInfo();
    const fullName = getUserFullName();
    
    console.log('User Token:', userToken ? 'Present' : 'Missing');
    console.log('User ID (from auth response):', userId);
    console.log('User Full Name:', fullName);
    console.log('User Info:', userInfo);
    
    if (userInfo) {
      console.log('User Details:');
      console.log('  - ID:', userInfo.id);
      console.log('  - First Name:', userInfo.firstName);
      console.log('  - Last Name:', userInfo.lastName);
      console.log('  - Email:', userInfo.email);
      console.log('  - Roles:', userInfo.roles);
    }
    
    if (!userToken || !userId) {
      console.warn('No user token or user ID found. Please login first or use setupManualToken()');
      return;
    }
    
    // Test API call to see headers in network tab
    console.log('Making test API call...');
    
    try {
      const response = await get(`${apiDomain}/api/v1/locations`);
      console.log('✅ API call successful');
      console.log('Response data:', response.data);
      console.log(`user_id header will be set to: ${userId}`);
    } catch (error) {
      console.log('❌ API call failed:', error.message);
      console.log('This is expected if backend is not running');
      console.log(`user_id header would be set to: ${userId}`);
    }
    
    console.log('Check the Network tab in browser DevTools to verify the user_id header is present');
    console.log('==============================');
    
  } catch (error) {
    console.error('Error testing API headers:', error);
  }
};

// Make it available globally for console access
window.testApiHeaders = testApiHeaders;

export default testApiHeaders;
