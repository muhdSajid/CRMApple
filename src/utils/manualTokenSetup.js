// Manual Token Setup Utility
// Open browser console and run this to set up the token manually

export const setupManualToken = () => {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyYW5lZXNoYWtAZ21haWwuY29tIiwiaWF0IjoxNzU1NzE1MzUzLCJleHAiOjE3NTU4MDE3NTN9.YiPmdSU1avi15qTOfDD4SmnPRqFBl3jYI7rbs3sRwU4';
  
  localStorage.setItem('userToken', JSON.stringify({
    token: token,
    expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  // Store user info matching the authentication response structure
  localStorage.setItem('userInfo', JSON.stringify({
    token: token,
    id: 1,
    firstName: "Raneesh",
    lastName: "AK",
    email: "raneeshak@gmail.com",
    roles: ["ROLE_ADMIN"],
    type: "Bearer",
    username: "raneeshak@gmail.com"
  }));
  
  console.log('Manual token setup complete. Refreshing page...');
  window.location.reload();
};

// Make it available globally for console access
window.setupManualToken = setupManualToken;
