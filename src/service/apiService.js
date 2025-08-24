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

export const getMedicineDetails = async (medicineId) => {
  try {
    const response = await get(`${apiDomain}/api/v1/medicines/${medicineId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medicine details:', error);
    throw error;
  }
};

export const updateMedicine = async (medicineId, medicineData) => {
  try {
    // Prepare the data with the medicine ID included as required by the API
    const apiData = {
      id: parseInt(medicineId),
      medicineName: medicineData.medicineName,
      typeId: medicineData.typeId,
      stockThreshold: medicineData.stockThreshold
    };
    
    const response = await _fetch(`${apiDomain}/api/v1/medicines/${medicineId}`, "PUT", apiData);
    return response.data;
  } catch (error) {
    console.error('Error updating medicine:', error);
    throw error;
  }
};

export const createBatch = async (batchData) => {
  try {
    const response = await post(`${apiDomain}/api/v1/batches`, batchData);
    return response.data;
  } catch (error) {
    console.error('Error creating batch:', error);
    throw error;
  }
};

export const getMedicines = async () => {
  try {
    const response = await get(`${apiDomain}/api/v1/medicines`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medicines:', error);
    throw error;
  }
};

export const getLocations = async () => {
  try {
    const response = await get(`${apiDomain}/api/v1/locations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

export const getAvailableBatches = async (locationId, medicineId) => {
  try {
    const response = await get(`${apiDomain}/api/v1/batches/available?locationId=${locationId}&medicineId=${medicineId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available batches:', error);
    throw error;
  }
};

export const updateBatch = async (batchId, updateData) => {
  try {
    const response = await _fetch(`${apiDomain}/api/v1/batches/${batchId}`, "PATCH", updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating batch:', error);
    throw error;
  }
};

export const softDeleteBatch = async (batchId) => {
  try {
    const response = await _fetch(`${apiDomain}/api/v1/batches/${batchId}/soft`, "DELETE", null);
    return response.data;
  } catch (error) {
    console.error('Error soft deleting batch:', error);
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
  
  if (method === "GET") {
    // Use the authenticated API instance for GET requests
    if (userToken && userToken.token) {
      response = await api.get(url.replace(apiDomain + '/api', ''));
    } else {
      response = await api.get(url);
    }
  } else {
    // Handle POST, PATCH, PUT, DELETE requests
    const body = data ? data : null;
    
    // Use the authenticated API instance for requests that need auth
    if (userToken && userToken.token) {
      const endpoint = url.replace(apiDomain + '/api', '');
      if (method === "PATCH") {
        response = await api.patch(endpoint, body);
      } else if (method === "PUT") {
        response = await api.put(endpoint, body);
      } else if (method === "DELETE") {
        response = await api.delete(endpoint);
      } else {
        response = await api.post(endpoint, body);
      }
    } else {
      // For requests without auth (like login), use full URL
      if (method === "PATCH") {
        response = await api.patch(url, body);
      } else if (method === "PUT") {
        response = await api.put(url, body);
      } else if (method === "DELETE") {
        response = await api.delete(url);
      } else {
        response = await api.post(url, body);
      }
    }
  }
  
  return response;
};
