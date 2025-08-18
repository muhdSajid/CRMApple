import api from "./api";
import { getUserToken } from "./authService";
import { apiDomain } from "../constants/constants";

export const get = (url, props) => _fetch(url, "GET", null, props);
export const post = (url, data, props, token) =>
  _fetch(url, "POST", data, props, token);

const _fetch = async (url, method, data = null, props, token = null) => {
  let userToken;
  if (token !== null) {
    userToken = token;
  } else {
    userToken = getUserToken();
  }

  let response;
  
  if (method !== "GET") {
    const body = data ? data : null;
    
    // Use the authenticated API instance for requests that need auth
    if (userToken && userToken.token) {
      response = await api.post(url.replace(apiDomain + '/api', ''), body);
    } else {
      // For requests without auth (like login), use full URL
      response = await api.post(url, body);
    }
  } else {
    // Use the authenticated API instance for GET requests
    if (userToken && userToken.token) {
      response = await api.get(url.replace(apiDomain + '/api', ''));
    } else {
      response = await api.get(url);
    }
  }
  
  return response;
};
