import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Define user roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

// Async Thunks

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
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ phoneNumber, otp, name, email, password }, { rejectWithValue }) => {
    try {
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
  async ({ phoneNumber, password, email, isAdmin = false }, { rejectWithValue }) => {
    try {
      let response;
      
      if (isAdmin) {
        // Admin login with email/password
        response = await authService.adminLogin({ email, password });
      } else {
        // User login with phone/password
        response = await authService.login({ phoneNumber, password });
      }
      
      // Check if OTP is required
      if (response.requireOTP) {
        return {
          requireOTP: true,
          email: response.email,
          tempData: { phoneNumber, password, email, isAdmin },
          isAdmin
        };
      }
      
      // Store in localStorage if login successful
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

// Verify OTP for login/registration
export const verifyOTPForAuth = createAsyncThunk(
  'auth/verifyOTPForAuth',
  async ({ email, otp, tempAuthData }, { rejectWithValue }) => {
    try {
      let response;
      
      if (tempAuthData.isRegistration) {
        // Complete registration
        response = await authService.completeRegistration({ email, otp });
      } else {
        // Complete login (admin or user)
        if (tempAuthData.isAdmin) {
          response = await authService.completeAdminLogin({ email, otp });
        } else {
          response = await authService.completeLogin({ email, otp });
        }
      }
      
      // Store in localStorage
      if (response.success && response.data) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', response.data.user.role);
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.user.phoneNumber) {
          localStorage.setItem('userPhone', response.data.user.phoneNumber);
        }
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

// Logout async thunk
export const logoutUserAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      
      // Clear localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userPhone');
      
      return true;
    } catch (error) {
      // Still clear localStorage even if API call fails
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userPhone');
      
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Initial state
const initialState = {
  // Authentication status
  isAuthenticated: localStorage.getItem('isLoggedIn') === 'true',
  user: (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  })(),
  userRole: localStorage.getItem('userType') || USER_ROLES.GUEST,
  accessToken: localStorage.getItem('accessToken') || null,
  
  // Loading and error states
  isLoading: false,
  status: 'idle', // idle, loading, succeeded, failed
  error: null,
  
  // OTP flow management
  requireOTP: false,
  tempAuthData: null, // Store temporary data during OTP flow
  
  // Additional state
  lastActivity: Date.now()
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions (sync)
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
      state.status = 'loading';
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.status = 'succeeded';
      
      if (action.payload.requireOTP) {
        // OTP required - store temp data
        state.requireOTP = true;
        state.tempAuthData = {
          email: action.payload.email,
          credentials: action.payload.tempData,
          isAdmin: action.payload.isAdmin || false
        };
      } else {
        // Login completed
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.userRole = action.payload.user.role;
        state.accessToken = action.payload.token;
        state.requireOTP = false;
        state.tempAuthData = null;
      }
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.status = 'failed';
      state.requireOTP = false;
      state.tempAuthData = null;
    },

    // Registration actions (sync)
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
      state.status = 'loading';
    },
    registerSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.status = 'succeeded';
      
      if (action.payload.requireOTP) {
        // OTP required for registration
        state.requireOTP = true;
        state.tempAuthData = {
          email: action.payload.email,
          isRegistration: true
        };
      } else {
        // Registration completed
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.userRole = action.payload.user.role;
        state.accessToken = action.payload.token;
        state.requireOTP = false;
        state.tempAuthData = null;
      }
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.status = 'failed';
      state.requireOTP = false;
      state.tempAuthData = null;
    },

    // Logout action (sync)
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.userRole = USER_ROLES.GUEST;
      state.accessToken = null;
      state.isLoading = false;
      state.status = 'idle';
      state.error = null;
      state.requireOTP = false;
      state.tempAuthData = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear OTP requirement (when user cancels OTP flow)
    clearOTPRequirement: (state) => {
      state.requireOTP = false;
      state.tempAuthData = null;
    },

    // Update user profile
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    // Reset auth state
    resetAuthState: () => initialState,
    
    // Update last activity
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },

    // Set access token
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Send OTP cases
      .addCase(sendOTP.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.status = 'succeeded';
        state.isLoading = false;
        state.error = null;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Verify OTP cases
      .addCase(verifyOTP.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.status = 'succeeded';
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.userRole = action.payload.user.role;
        state.error = null;
        state.requireOTP = false;
        state.tempAuthData = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.userRole = USER_ROLES.GUEST;
        state.requireOTP = false;
        state.tempAuthData = null;
      })
      
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isLoading = false;
        state.error = null;
        
        if (action.payload.requireOTP) {
          // OTP required - store temp data
          state.requireOTP = true;
          state.tempAuthData = {
            email: action.payload.email,
            credentials: action.payload.tempData,
            isAdmin: action.payload.isAdmin || false
          };
        } else {
          // Login completed
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.userRole = action.payload.user.role;
          state.accessToken = action.payload.token;
          state.requireOTP = false;
          state.tempAuthData = null;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.userRole = USER_ROLES.GUEST;
        state.requireOTP = false;
        state.tempAuthData = null;
      })
      
      // Verify OTP for Auth cases
      .addCase(verifyOTPForAuth.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTPForAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.userRole = action.payload.user.role;
        state.error = null;
        state.requireOTP = false;
        state.tempAuthData = null;
      })
      .addCase(verifyOTPForAuth.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoading = false;
        state.error = action.payload;
        state.requireOTP = true; // Keep OTP requirement on failure
      })
      
      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout cases
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.status = 'idle';
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.userRole = USER_ROLES.GUEST;
        state.error = null;
        state.isLoading = false;
        state.requireOTP = false;
        state.tempAuthData = null;
      })
      .addCase(logoutUserAsync.rejected, (state) => {
        // Still reset state even if API call fails
        state.status = 'idle';
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.userRole = USER_ROLES.GUEST;
        state.error = null;
        state.isLoading = false;
        state.requireOTP = false;
        state.tempAuthData = null;
      });
  }
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutUser,
  clearError,
  clearOTPRequirement,
  updateUserProfile,
  resetAuthState,
  updateLastActivity,
  setAccessToken
} = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.userRole;
export const selectAuthError = (state) => state.auth.error;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectRequireOTP = (state) => state.auth.requireOTP;
export const selectTempAuthData = (state) => state.auth.tempAuthData;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAdmin = (state) => state.auth.userRole === USER_ROLES.ADMIN;
export const selectIsUser = (state) => state.auth.userRole === USER_ROLES.USER;
export const selectAuth = (state) => state.auth;

export default authSlice.reducer;