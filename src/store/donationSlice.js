import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../service/api';

// Async thunk to fetch donation report data
export const fetchDonationReport = createAsyncThunk(
  'donation/fetchDonationReport',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;
      
      console.log('=== FETCH DONATION REPORT DEBUG ===');
      console.log('Is authenticated:', isAuthenticated);
      console.log('Making API call to: /v1/donation-report');
      
      const response = await api.get('/v1/donation-report');
      console.log('Donation report fetched successfully:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data is array:', Array.isArray(response.data));
      console.log('First item:', response.data[0]);
      console.log('======================================');
      
      return response.data;
    } catch (error) {
      console.error('Error fetching donation report:', error);
      let message = 'Failed to fetch donation report';
      
      if (error.message.includes('Cannot connect to server')) {
        message = 'Cannot connect to server. Please ensure the backend is running on port 8081.';
      } else if (error.message.includes('CORS')) {
        message = 'CORS error. Please check backend CORS configuration for http://localhost:5174';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  data: [],
  total: 0,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

const donationSlice = createSlice({
  name: 'donation',
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDonationReport.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchDonationReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Ensure we have valid data array
        const responseData = Array.isArray(action.payload) ? action.payload : [];
        
        // Sanitize the data and normalize the amount field (API uses 'value', we use 'amount')
        state.data = responseData.map(item => ({
          ...item,
          amount: Number(item.value || item.amount) || 0, // Handle both 'value' and 'amount' fields
          name: item.name || 'Unknown Location'
        }));
        
        // Calculate total from the sanitized data
        state.total = state.data.reduce((sum, city) => sum + (city.amount || 0), 0);
        
        console.log('=== REDUX SLICE DEBUG ===');
        console.log('Processed data:', state.data);
        console.log('Calculated total:', state.total);
        console.log('=========================');
      })
      .addCase(fetchDonationReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.data = [];
        state.total = 0;
      });
  },
});

export const { reset, clearError } = donationSlice.actions;
export default donationSlice.reducer;
