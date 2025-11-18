import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Define user roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

// Send OTP async thunk
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      console.log('🔵 Redux sendOTP thunk called with:', phoneNumber);
      const response = await authService.sendOTP({ phoneNumber });
      console.log('✅ Redux sendOTP response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Redux sendOTP error:', error);
      return rejectWithValue(error.message || 'Failed to send OTP');
    }
  }
);

// Verify OTP async thunk
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phoneNumber, otp }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTP({ phoneNumber, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to verify OTP');
    }
  }
);

// Register user async thunk
// Register user async thunk
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ phoneNumber, otp, name, email, password }, { rejectWithValue }) => {
    try {
      // Send all fields to backend
      const response = await authService.register({ 
        phoneNumber, 
        otp, 
        name, 
        email, 
        password 
      });
      
      // Store in localStorage
      if (response.success && response.data) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', response.data.user.role);
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userPhone', response.data.user.phoneNumber);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Login user async thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ phoneNumber, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login({ phoneNumber, password });
      
      // Store in localStorage
      if (response.success && response.data) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', response.data.user.role);
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userPhone', response.data.user.phoneNumber);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Forgot password async thunk
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword({ phoneNumber });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send reset OTP');
    }
  }
);

// Reset password async thunk
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ phoneNumber, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword({ phoneNumber, otp, newPassword });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reset password');
    }
  }
);

// Logout async thunk
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Initial state
const initialState = {
  user: (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  })(),
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: localStorage.getItem('isLoggedIn') === 'true',
  role: localStorage.getItem('userType') || USER_ROLES.GUEST,
  status: 'idle', // idle, loading, succeeded, failed
  error: null
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset auth state
    resetAuthState: () => initialState,
    
    // Update last activity
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Send OTP cases
      .addCase(sendOTP.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Verify OTP cases
      .addCase(verifyOTP.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.role = action.payload.user.role;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.role = USER_ROLES.GUEST;
      })
      
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.role = action.payload.user.role;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.role = USER_ROLES.GUEST;
      })
      
      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'idle';
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.role = USER_ROLES.GUEST;
        state.error = null;
      });
  }
});

// Action creators
export const {
  clearError,
  resetAuthState,
  updateLastActivity
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.role;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsLoading = (state) => state.auth.status === 'loading';
export const selectIsAdmin = (state) => state.auth.role === USER_ROLES.ADMIN;
export const selectIsUser = (state) => state.auth.role === USER_ROLES.USER;

export default authSlice.reducer;