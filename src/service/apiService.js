import axios from "axios";
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
  const bearer = `Bearer ${userToken.token}`;
  const headers = {
    Authorization: bearer,
  };
  let body;
  let response;
  if (method !== "GET") {
    body = data ? data : null;
    response = axios.post(`${apiDomain}${url}`, body, { headers });
    return response;
  }
  response = axios.get(`${apiDomain}${url}`, { headers });
  return response;
};
