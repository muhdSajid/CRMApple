import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../service/api';

// Async thunk for fetching user role and privileges
export const fetchUserRoleAndPrivileges = createAsyncThunk(
  'auth/fetchUserRoleAndPrivileges',
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      console.log('=== PRIVILEGE API CALL DEBUG ===');
      console.log('UserId:', userId);
      console.log('Token preview:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
      console.log('Full token length:', token ? token.length : 0);
      
      // Use the same API instance but with explicit token override
      // The api instance will handle CORS and other configurations properly
      const response = await api.get(`/v1/users/getRoleWithPrivileges/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Override with the new token
        }
      });

      console.log('✅ API Success - Response:', response.data);
      console.log('Response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ API Call Failed:', error);
      
      // More specific error handling for axios
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('Response status:', status);
        console.error('Response data:', data);
        console.error('Response headers:', error.response.headers);
        
        if (status === 401) {
          console.error('🔒 Authentication failed - token might be invalid or expired');
          console.error('Token used:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
          return rejectWithValue('Authentication failed. Please login again.');
        } else if (status === 403) {
          console.error('🚫 Authorization failed - insufficient permissions');
          return rejectWithValue('Access denied. Insufficient permissions.');
        } else if (status === 404) {
          console.error('👤 User not found');
          return rejectWithValue('User not found.');
        } else {
          console.error('🔥 API Error:', data);
          return rejectWithValue(data?.message || `API Error: ${status}`);
        }
      } else if (error.request) {
        console.error('🌐 Network error - no response received');
        console.error('Request details:', error.request);
        return rejectWithValue('Network error. Please check your connection.');
      } else {
        console.error('⚙️ Request setup error:', error.message);
        return rejectWithValue('Failed to fetch role and privileges.');
      }
    }
  }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      // Use the api instance which routes through Nginx proxy in production
      // In production: /api/auth/signin -> Nginx -> http://localhost:8081/api/auth/signin
      const response = await api.post('/auth/signin', {
        email: credentials.email,
        password: credentials.password,
      });

      // Store token securely in localStorage
      const userData = response.data;
      console.log('Login response data:', userData);
      console.log('Login response keys:', Object.keys(userData));
      
      // Check for different token field names
      const token = userData.token || userData.accessToken || userData.access_token || userData.authToken;
      
      if (token) {
        console.log('Token found:', token);
        localStorage.setItem('userToken', JSON.stringify({
          token: token,
          expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        }));
        localStorage.setItem('userInfo', JSON.stringify(userData));
      } else {
        console.error('No token found in response. Available fields:', Object.keys(userData));
      }

      return userData;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userRole');
    return null;
  }
);

// Get user from localStorage
const getUserFromStorage = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    const userToken = localStorage.getItem('userToken');
    
    if (userInfo && userToken) {
      const tokenData = JSON.parse(userToken);
      const expiry = Date.parse(tokenData.expiration);
      
      // Check if token is expired
      if (expiry > Date.now()) {
        return JSON.parse(userInfo);
      } else {
        // Token expired, clean up
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userRole');
      }
    }
    return null;
  } catch {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userRole');
    return null;
  }
};

// Get role from localStorage
const getRoleFromStorage = () => {
  try {
    const userRole = localStorage.getItem('userRole');
    const userToken = localStorage.getItem('userToken');
    
    if (userRole && userToken) {
      const tokenData = JSON.parse(userToken);
      const expiry = Date.parse(tokenData.expiration);
      
      // Check if token is expired
      if (expiry > Date.now()) {
        return JSON.parse(userRole);
      } else {
        // Token expired, clean up
        localStorage.removeItem('userRole');
      }
    }
    return null;
  } catch {
    localStorage.removeItem('userRole');
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  isAuthenticated: !!getUserFromStorage(),
  role: getRoleFromStorage(),
  privileges: getRoleFromStorage()?.privileges || [],
  isRoleLoading: false,
  roleError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearError: (state) => {
      state.isError = false;
      state.message = '';
      state.roleError = null;
    },
    checkAuthStatus: (state) => {
      const user = getUserFromStorage();
      state.user = user;
      state.isAuthenticated = !!user;
    },
    clearRole: (state) => {
      state.role = null;
      state.privileges = [];
      state.roleError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        console.log('🔄 loginUser.pending');
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('✅ loginUser.fulfilled:', action.payload);
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.message = 'Login successful';
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log('❌ loginUser.rejected:', action.payload);
        state.isLoading = false;
        state.isError = true;
        state.isAuthenticated = false;
        state.user = null;
        state.message = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isSuccess = false;
        state.role = null;
        state.privileges = [];
        state.roleError = null;
        state.message = 'Logged out successfully';
      })
      .addCase(fetchUserRoleAndPrivileges.pending, (state) => {
        console.log('🔄 fetchUserRoleAndPrivileges.pending');
        state.isRoleLoading = true;
        state.roleError = null;
      })
      .addCase(fetchUserRoleAndPrivileges.fulfilled, (state, action) => {
        console.log('✅ fetchUserRoleAndPrivileges.fulfilled:', action.payload);
        state.isRoleLoading = false;
        state.role = action.payload;
        state.privileges = action.payload.privileges || [];
        
        // Store role and privileges in localStorage for persistence
        localStorage.setItem('userRole', JSON.stringify(action.payload));
        console.log('✅ Stored userRole in localStorage');
      })
      .addCase(fetchUserRoleAndPrivileges.rejected, (state, action) => {
        console.log('❌ fetchUserRoleAndPrivileges.rejected:', action.payload);
        state.isRoleLoading = false;
        state.roleError = action.payload;
      });
  },
});

export const { reset, clearError, checkAuthStatus, clearRole } = authSlice.actions;
export default authSlice.reducer;
