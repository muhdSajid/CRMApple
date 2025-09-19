import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching user role and privileges
export const fetchUserRoleAndPrivileges = createAsyncThunk(
  'auth/fetchUserRoleAndPrivileges',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/users/getRoleWithPrivileges/${userId}`, {
        headers: {
          'accept': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch role and privileges';
      return rejectWithValue(message);
    }
  }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8081/api/auth/signin', {
        email: credentials.email,
        password: credentials.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Store token securely in localStorage
      const userData = response.data;
      console.log('Login response data:', userData);
      
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
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.message = 'Login successful';
      })
      .addCase(loginUser.rejected, (state, action) => {
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
        state.isRoleLoading = true;
        state.roleError = null;
      })
      .addCase(fetchUserRoleAndPrivileges.fulfilled, (state, action) => {
        state.isRoleLoading = false;
        state.role = action.payload;
        state.privileges = action.payload.privileges || [];
        
        // Store role and privileges in localStorage for persistence
        localStorage.setItem('userRole', JSON.stringify(action.payload));
      })
      .addCase(fetchUserRoleAndPrivileges.rejected, (state, action) => {
        state.isRoleLoading = false;
        state.roleError = action.payload;
      });
  },
});

export const { reset, clearError, checkAuthStatus, clearRole } = authSlice.actions;
export default authSlice.reducer;
