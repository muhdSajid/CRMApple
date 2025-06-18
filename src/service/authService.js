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


