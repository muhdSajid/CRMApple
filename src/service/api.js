import axios from "axios";
import { getUserToken, getUserId } from "./authService";

// Create axios instance with better configuration for CORS
const api = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Enable credentials for CORS
  withCredentials: false,
});

// Request interceptor to add auth token and user_id header
api.interceptors.request.use(
  (config) => {
    const userToken = getUserToken();
    const userId = getUserId();
    
    console.log('=== API REQUEST DEBUG ===');
    console.log('URL:', config.baseURL + config.url);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Has userToken:', !!userToken);
    console.log('Token value:', userToken?.token ? `${userToken.token.substring(0, 20)}...` : 'No token');
    console.log('User ID:', userId);
    
    if (userToken && userToken.token) {
      config.headers.Authorization = `Bearer ${userToken.token}`;
      console.log('Authorization header set');
    } else {
      console.log('No authorization header - no token available');
    }

    // Add user_id header if available
    if (userId) {
      config.headers.user_id = userId;
      console.log('user_id header set:', userId);
    } else {
      console.log('No user_id header - no user ID available');
    }
    
    console.log('Final headers:', config.headers);
    console.log('========================');
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and network errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Network Error: Cannot connect to server at http://localhost:8081');
      return Promise.reject(new Error('Cannot connect to server. Please check if the backend is running on port 8081.'));
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Authentication failed. Please login again.'));
    }
    
    if (error.response?.status === 403) {
      return Promise.reject(new Error('Access forbidden. You do not have permission to access this resource.'));
    }
    
    // CORS error
    if (!error.response) {
      return Promise.reject(new Error('CORS error or network issue. Please check if the backend allows requests from this domain.'));
    }
    
    return Promise.reject(error);
  }
);

export default api;
