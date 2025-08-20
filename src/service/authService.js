const ifTokenExpired = (userToken) => {
  const expiry = Date.parse(userToken.expiration);
  if (expiry > Date.now()) {
    return false;
  }
  return true;
};

// Helper function to decode JWT token and extract user information
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

export const getUserToken = () => {
  const userTkn = JSON.parse(localStorage.getItem('userToken')) || {};
  const token =
    Object.entries(userTkn).length !== 0 && !ifTokenExpired(userTkn)
      ? userTkn
      : "";
  return token;
};

export const getUserInfo = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || null;
  const userToken = getUserToken();
  
  // If token is expired or doesn't exist, return null
  if (!userToken) {
    localStorage.removeItem('userInfo');
    return null;
  }
  
  return userInfo;
};

export const getUserId = () => {
  const userToken = getUserToken();
  if (!userToken || !userToken.token) {
    return null;
  }

  // First try to get user ID from stored userInfo (from authentication response)
  const userInfo = getUserInfo();
  if (userInfo && userInfo.id) {
    return userInfo.id;
  }
  
  // Fallback to userId field if available
  if (userInfo && userInfo.userId) {
    return userInfo.userId;
  }

  // If not available in userInfo, decode JWT token as last resort
  const decodedToken = decodeJWT(userToken.token);
  if (decodedToken) {
    // JWT typically uses 'sub' field for subject (user identifier)
    // Try different possible fields where user ID might be stored
    return decodedToken.userId || decodedToken.sub || decodedToken.id || decodedToken.email;
  }

  return null;
};

export const getUserFullName = () => {
  const userInfo = getUserInfo();
  if (userInfo && userInfo.firstName && userInfo.lastName) {
    return `${userInfo.firstName} ${userInfo.lastName}`;
  }
  
  // Fallback to just first name if last name is not available
  if (userInfo && userInfo.firstName) {
    return userInfo.firstName;
  }
  
  // Fallback to email or username if name is not available
  if (userInfo && userInfo.email) {
    return userInfo.email;
  }
  
  return 'User';
};

export const isAuthenticated = () => {
  const token = getUserToken();
  return !!token;
};


