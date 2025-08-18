const ifTokenExpired = (userToken) => {
  const expiry = Date.parse(userToken.expiration);
  if (expiry > Date.now()) {
    return false;
  }
  return true;
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

export const isAuthenticated = () => {
  const token = getUserToken();
  return !!token;
};


