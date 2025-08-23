import api from "./api";
import { getUserToken } from "./authService";
import { apiDomain } from "../constants/constants";

export const get = (url, props) => _fetch(url, "GET", null, props);
export const post = (url, data, props, token) =>
  _fetch(url, "POST", data, props, token);

// Cache for medicine types to avoid frequent API calls
let medicineTypesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const getMedicineTypes = async () => {
  // Check if cache is valid
  if (medicineTypesCache && cacheTimestamp && 
      (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return medicineTypesCache;
  }

  try {
    const response = await get(`${apiDomain}/api/v1/medicine-types`);
    medicineTypesCache = response.data;
    cacheTimestamp = Date.now();
    return medicineTypesCache;
  } catch (error) {
    console.error('Error fetching medicine types:', error);
    throw error;
  }
};

export const getPurchaseTypes = async () => {
  try {
    console.log('Making API call to fetch purchase types...');
    const response = await get(`${apiDomain}/api/v1/purchase-types`);
    console.log('Raw API response:', response);
    
    // Transform the response to match expected structure
    const transformedData = response.data.map(item => ({
      id: item.id,
      name: item.typeName,
      description: item.description
    }));
    
    console.log('Transformed purchase types data:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error fetching purchase types:', error);
    throw error;
  }
};

export const addMedicine = async (medicineData) => {
  try {
    const response = await post(`${apiDomain}/api/v1/medicines`, medicineData);
    return response.data;
  } catch (error) {
    console.error('Error adding medicine:', error);
    throw error;
  }
};

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
