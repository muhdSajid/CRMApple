// Manual Token Setup Utility
// Open browser console and run this to set up the token manually

export const setupManualToken = () => {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyYW5lZXNoYWtAZ21haWwuY29tIiwiaWF0IjoxNzU1NTI3NjA5LCJleHAiOjE3NTU2MTQwMDl9.Jj0KSVpSdJ_4AZ1vCm4GKJIXLPZWkjHfYbbTkJI5csM';
  
  localStorage.setItem('userToken', JSON.stringify({
    token: token,
    expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  localStorage.setItem('userInfo', JSON.stringify({
    email: 'raneeshak@gmail.com',
    token: token,
    name: 'Raneesha K'
  }));
  
  console.log('Manual token setup complete. Refreshing page...');
  window.location.reload();
};

// Make it available globally for console access
window.setupManualToken = setupManualToken;
