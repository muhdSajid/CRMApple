import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../service/api';

// Async thunk to fetch all roles
export const fetchRoles = createAsyncThunk(
  'users/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Making API call to: /v1/users/getAllRoles');
      const response = await api.get('/v1/users/getAllRoles');
      console.log('Roles fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch roles';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to fetch all users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;
      
      console.log('=== FETCH USERS DEBUG ===');
      console.log('Is authenticated:', isAuthenticated);
      console.log('Making API call to: /v1/users/getAll');
      
      const response = await api.get('/v1/users/getAll');
      console.log('Users fetched successfully:', response.data);
      console.log('First user structure:', JSON.stringify(response.data[0], null, 2));
      console.log('First user role details:', response.data[0]?.role);
      console.log('========================');
      
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      let message = 'Failed to fetch users';
      
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

// Async thunk to add a new user
export const addUser = createAsyncThunk(
  'users/addUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/add', userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add user';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to update user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/v1/users/${id}`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update user';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to update user (both role and status)
export const updateUserComplete = createAsyncThunk(
  'users/updateUserComplete',
  async ({ userId, roles, isActive }, { rejectWithValue }) => {
    try {
      console.log('Making API call to update user:', { userId, roles, isActive });
      const response = await api.put('/v1/users/update', {
        userId: userId,
        roles: roles,
        isActive: isActive
      });
      console.log('User updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update user';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to assign role to user
export const assignRole = createAsyncThunk(
  'users/assignRole',
  async ({ userId, roles }, { rejectWithValue }) => {
    try {
      const response = await api.put('/v1/users/assignRole', {
        userId: userId,
        roles: roles
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to assign role';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to reset user password
export const resetUserPassword = createAsyncThunk(
  'users/resetUserPassword',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('Resetting password for user:', userId);
      const response = await api.post(`/auth/reset/${userId}`);
      console.log('Password reset response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      const message = error.response?.data?.message || error.message || 'Failed to reset password';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to fetch all locations
export const fetchAllLocations = createAsyncThunk(
  'users/fetchAllLocations',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Making API call to: /v1/locations');
      const response = await api.get('/v1/locations');
      console.log('Locations fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch locations';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to fetch user locations
export const fetchUserLocations = createAsyncThunk(
  'users/fetchUserLocations',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('Making API call to: /v1/user-locations/user/' + userId);
      const response = await api.get(`/v1/user-locations/user/${userId}`);
      console.log('User locations fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user locations:', error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch user locations';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to update user locations
export const updateUserLocations = createAsyncThunk(
  'users/updateUserLocations',
  async ({ userId, locationIds }, { rejectWithValue }) => {
    try {
      console.log('Updating user locations:', { userId, locationIds });
      const response = await api.put('/v1/user-locations', {
        userId: userId,
        locationIds: locationIds
      });
      console.log('User locations updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating user locations:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update user locations';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  users: [],
  roles: [],
  locations: [],
  userLocations: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  temporaryPassword: null,
  resetPassword: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.temporaryPassword = null;
      state.resetPassword = null;
    },
    clearError: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Add user
      .addCase(addUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Don't automatically add to the users array to avoid N/A display
        // Instead, let the user refresh or refetch to see the updated list
        state.message = 'User added successfully';
        console.log('Add user response:', action.payload);
        state.temporaryPassword = action.payload.temporaryPassword;
        console.log('Temporary password set:', state.temporaryPassword);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.message = 'User updated successfully';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update user complete (role and status)
      .addCase(updateUserComplete.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateUserComplete.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'User updated successfully';
      })
      .addCase(updateUserComplete.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Assign role
      .addCase(assignRole.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(assignRole.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Role assigned successfully';
      })
      .addCase(assignRole.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Reset user password
      .addCase(resetUserPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
        state.resetPassword = null;
      })
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message || 'Password reset successfully';
        state.resetPassword = action.payload.newPassword;
        console.log('Reset password set:', state.resetPassword);
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.resetPassword = null;
      })
      // Fetch all locations
      .addCase(fetchAllLocations.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchAllLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.locations = action.payload;
      })
      .addCase(fetchAllLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch user locations
      .addCase(fetchUserLocations.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchUserLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userLocations = action.payload;
      })
      .addCase(fetchUserLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update user locations
      .addCase(updateUserLocations.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateUserLocations.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'User locations updated successfully';
      })
      .addCase(updateUserLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearError } = usersSlice.actions;
export default usersSlice.reducer;
