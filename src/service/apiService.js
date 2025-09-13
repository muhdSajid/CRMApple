import api from "./api";
import { getUserToken } from "./authService";
import { apiDomain } from "../constants/constants";

export const get = (url, props) => _fetch(url, "GET", null, props);
export const post = (url, data, props, token) =>
  _fetch(url, "POST", data, props, token);

export const getMedicineTypes = async () => {
  try {
    const response = await get(`${apiDomain}/api/v1/medicine-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medicine types:', error);
    throw error;
  }
};

export const getMedicineTypeById = async (id) => {
  try {
    const response = await get(`${apiDomain}/api/v1/medicine-types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medicine type by ID:', error);
    throw error;
  }
};

export const createMedicineType = async (medicineTypeData) => {
  try {
    const response = await post(`${apiDomain}/api/v1/medicine-types`, medicineTypeData);
    return response.data;
  } catch (error) {
    console.error('Error creating medicine type:', error);
    throw error;
  }
};

export const updateMedicineType = async (id, medicineTypeData) => {
  try {
    const apiData = {
      id: parseInt(id),
      typeName: medicineTypeData.typeName,
      description: medicineTypeData.description
    };
    
    const response = await _fetch(`${apiDomain}/api/v1/medicine-types/${id}`, "PUT", apiData);
    return response.data;
  } catch (error) {
    console.error('Error updating medicine type:', error);
    throw error;
  }
};

export const deleteMedicineType = async (id) => {
  try {
    const response = await _fetch(`${apiDomain}/api/v1/medicine-types/${id}`, "DELETE", null);
    return response.data;
  } catch (error) {
    console.error('Error deleting medicine type:', error);
    throw error;
  }
};

// Location management API functions
export const getLocationsFromSettings = async () => {
  try {
    const response = await get(`${apiDomain}/api/v1/locations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching locations from settings:', error);
    throw error;
  }
};

export const getLocationById = async (id) => {
  try {
    const response = await get(`${apiDomain}/api/v1/locations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location by ID:', error);
    throw error;
  }
};

export const createLocation = async (locationData) => {
  try {
    const response = await post(`${apiDomain}/api/v1/locations`, locationData);
    return response.data;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
};

export const updateLocation = async (id, locationData) => {
  try {
    const response = await _fetch(`${apiDomain}/api/v1/locations/${id}`, "PUT", locationData);
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

export const softDeleteLocation = async (id) => {
  try {
    const response = await _fetch(`${apiDomain}/api/v1/locations/${id}/soft-delete`, "PUT", null);
    return response.data;
  } catch (error) {
    console.error('Error soft deleting location:', error);
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

export const changePassword = async (passwordData) => {
  try {
    const response = await post(`${apiDomain}/api/v1/auth/change-password`, passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const getDeliveryCenterTypes = async () => {
  try {
    const response = await get(`${apiDomain}/api/delivery-center-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery center types:', error);
    throw error;
  }
};

export const getDeliveryCentersByLocationAndType = async (locationId, typeId) => {
  try {
    const response = await get(`${apiDomain}/api/v1/delivery-centers/by-location-and-type?locationId=${locationId}&typeId=${typeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery centers:', error);
    throw error;
  }
};

// Create a new delivery center
export const createDeliveryCenter = async (centerData) => {
  try {
    const response = await _fetch(`${apiDomain}/api/v1/delivery-centers`, "POST", centerData);
    return response.data;
  } catch (error) {
    console.error('Error creating delivery center:', error);
    throw error;
  }
};

// Patient-related API functions
export const searchPatients = async (searchTerm) => {
  try {
    const response = await get(`${apiDomain}/api/v1/patients/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
};

export const createPatient = async (patientData) => {
  try {
    const response = await _fetch(`${apiDomain}/api/v1/patients`, "POST", patientData);
    return response.data;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

export const updatePatient = async (patientId, patientData) => {
  try {
    const response = await _fetch(`${apiDomain}/api/v1/patients/${patientId}`, "PUT", patientData);
    return response.data;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

// Medicine search for distribution
export const searchMedicinesByLocation = async (locationId, searchTerm) => {
  try {
    const response = await get(`${apiDomain}/api/medicine-locations/location/${locationId}/available?search=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching medicines:', error);
    throw error;
  }
};

// Submit distribution for a patient
export const submitDistribution = async (distributionData) => {
  try {
    // Transform the data to match the new API format
    const apiPayload = {
      patientId: distributionData.patientId,
      deliveryCenterId: distributionData.deliveryCenterId,
      distributionDate: distributionData.distributionDate.split('T')[0], // Format as YYYY-MM-DD
      distributionItems: distributionData.distributionItems.map(item => ({
        medicine: {
          id: item.medicineId
        },
        batch: {
          id: item.batchId
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    };

    console.log('Submitting distribution with payload:', apiPayload);
    
    // Use the authenticated API instance instead of raw fetch
    const response = await api.post('/v1/medicine-distributions', apiPayload, {
      headers: {
        'X-Created-By': 'admin_user'
      }
    });

    console.log('Distribution submitted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting distribution:', error);
    
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.statusText || 'Unknown server error';
      throw new Error(`API Error (${error.response.status}): ${errorMessage}`);
    } else if (error.request) {
      // Network error
      throw new Error('Network error: Unable to reach the server');
    } else {
      // Other error
      throw new Error(`Error: ${error.message}`);
    }
  }
};

// Fetch available batches for medicine at location
export const fetchAvailableBatches = async (locationId, medicineId) => {
  try {
    console.log(`Fetching batches for medicine ${medicineId} at location ${locationId}...`);
    const response = await get(`${apiDomain}/api/v1/batches/available?locationId=${locationId}&medicineId=${medicineId}`);
    console.log('Available batches response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching available batches:', error);
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

// Fetch medicine distributions by patient for a specific delivery center and date
export const getMedicineDistributionsByPatient = async (deliveryCenterId, distributionDate) => {
  try {
    const url = `${apiDomain}/api/v1/medicine-distributions/by-patient?deliveryCenterId=${deliveryCenterId}&distributionDate=${distributionDate}`;
    const response = await get(url);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching medicine distributions by patient:', error);
    throw error;
  }
};

export const getMedicineDailyCostSummary = async (searchData) => {
  try {
    const response = await post(`${apiDomain}/api/medicine-daily-cost-summary/search`, searchData);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching medicine daily cost summary:', error);
    throw error;
  }
};

export const exportMedicineDailyCostSummary = async (searchData) => {
  try {
    const userToken = getUserToken();
    
    const response = await fetch(`${apiDomain}/api/medicine-daily-cost-summary/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/octet-stream',
        ...(userToken && userToken.token ? { 'Authorization': `Bearer ${userToken.token}` } : {})
      },
      body: JSON.stringify(searchData)
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    // Get the blob data
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    link.download = `medicine-cost-summary-${currentDate}.xlsx`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting medicine daily cost summary:', error);
    throw error;
  }
};
