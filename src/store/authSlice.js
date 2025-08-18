import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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
      }
    }
    return null;
  } catch {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
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
    },
    checkAuthStatus: (state) => {
      const user = getUserFromStorage();
      state.user = user;
      state.isAuthenticated = !!user;
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
        state.message = 'Logged out successfully';
      });
  },
});

export const { reset, clearError, checkAuthStatus } = authSlice.actions;
export default authSlice.reducer;
