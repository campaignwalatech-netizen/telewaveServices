import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  selectIsAuthenticated,
  selectUser,
  selectUserRole,
  selectAuthError,
  selectIsLoading,
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutUser,
  clearError
} from '../redux/slices/authSlice';
import authService from '../services/authService';

/**
 * Auth Hook with Backend Integration
 * Provides authentication functionality connected to backend APIs
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selectors
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const error = useSelector(selectAuthError);
  const isLoading = useSelector(selectIsLoading);

  

  // Register function - Step 1: Send OTP
  const register = useCallback(async (userData) => {
    try {
      console.log('🎯 [useAuth] Register called with:', { 
        ...userData, 
        password: '***', 
        confirmPassword: '***' 
      });
      
      dispatch(registerStart());
      
      const result = await authService.register(userData);
      
      // Registration step 1 successful - OTP sent to email
      dispatch(registerSuccess({ 
        message: result.message,
        email: userData.email,
        requireOTP: true 
      }));
      
      return result;
    } catch (error) {
      console.error('❌ [useAuth] Register error:', error);
      dispatch(registerFailure(error.message));
      throw error;
    }
  }, [dispatch]);

  // Verify Registration OTP - Step 2: Complete registration
  const verifyRegistrationOTP = useCallback(async (email, otp) => {
    try {
      console.log('🔑 [useAuth] Verifying registration OTP for:', email);
      
      dispatch(registerStart());
      
      const result = await authService.verifyRegistrationOTP({ email, otp });
      
      console.log('✅ [useAuth] Registration OTP verification result:', result);
      
      // Check if admin approval is required
      if (result?.requiresAdminApproval) {
        console.log('⏳ [useAuth] User requires admin approval');
        
        // Clear any existing auth data
        authService.clearAuthData();
        
        // Return the result to handle in RegisterPage
        return {
          ...result,
          requiresAdminApproval: true
        };
      }
      
      // Normal flow - user is approved immediately
      console.log('✅ [useAuth] User approved, logging in...');
      authService.storeAuthData(result.data);
      dispatch(registerSuccess(result.data));
      
      // Redirect to user dashboard
      navigate('/user', { replace: true });
      
      return result;
    } catch (error) {
      console.error('❌ [useAuth] Registration OTP verification error:', error);
      dispatch(registerFailure(error.message));
      throw error;
    }
  }, [dispatch, navigate]);

  // Login function - Step 1: Send OTP
  const login = useCallback(async (credentials) => {
    try {
      console.log('🔐 [useAuth] Login attempt with:', { email: credentials.email });
      
      dispatch(loginStart());
      
      const result = await authService.login(credentials);
      
      if (result.requireOTP) {
        // OTP required - store temporary data and return OTP requirement
        dispatch(loginSuccess({ 
          message: result.message,
          email: credentials.email,
          requireOTP: true,
          tempData: credentials 
        }));
      } else {
        // Login successful without OTP (shouldn't happen with new flow)
        authService.storeAuthData(result.data);
        dispatch(loginSuccess(result.data));
        
        // Redirect based on role
        if (result.data.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/user', { replace: true });
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ [useAuth] Login error:', error);
      dispatch(loginFailure(error.message));
      throw error;
    }
  }, [dispatch, navigate]);

  // Verify Login OTP - Step 2: Complete login
// Verify Login OTP - Step 2: Complete login
const verifyLoginOTP = useCallback(async (email, otp) => {
  try {
    console.log('🔑 [useAuth] Verifying login OTP for:', email);
    
    dispatch(loginStart());
    
    const result = await authService.verifyLoginOTP({ email, otp });
    
    // Store auth data and complete login
    authService.storeAuthData(result.data);
    dispatch(loginSuccess(result.data));
    
    // Check if user is approved using authService
    if (!authService.isUserApproved()) {
      console.log(`⚠️ [useAuth] User not approved (status: ${authService.getUserRegistrationStatus()}), redirecting to pending approval`);
      navigate('/pending-approval', { replace: true });
      return { ...result, requiresApproval: true };
    }
    
    // Redirect based on role
    if (result.data.user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/user', { replace: true });
    }
    
    return result;
  } catch (error) {
    console.error('❌ [useAuth] Login OTP verification error:', error);
    dispatch(loginFailure(error.message));
    throw error;
  }
}, [dispatch, navigate]);

  // Admin login function
  const adminLogin = useCallback(async (credentials) => {
    try {
      console.log('🔐 [useAuth] Admin login attempt with:', { email: credentials.email });
      
      dispatch(loginStart());
      
      const result = await authService.adminLogin(credentials);
      
      if (result.requireOTP) {
        // OTP required - store temporary data
        dispatch(loginSuccess({ 
          message: result.message,
          email: credentials.email,
          requireOTP: true,
          tempData: credentials,
          isAdmin: true
        }));
      }
      
      return result;
    } catch (error) {
      console.error('❌ [useAuth] Admin login error:', error);
      dispatch(loginFailure(error.message));
      throw error;
    }
  }, [dispatch]);

  // Forgot password function
  const requestPasswordReset = useCallback(async (email) => {
    try {
      const result = await authService.forgotPassword({ email });
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  // Reset password function
  const resetUserPassword = useCallback(async (resetData) => {
    try {
      const result = await authService.resetPassword(resetData);
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  // Logout function
  // In useAuth.jsx
const logout = useCallback(async () => {
  try {
    // Use authService logout
    await authService.logout();
    
    // Dispatch logout action to update Redux state
    dispatch(logoutUser());
    
    // Clear API authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Redirect to login
    navigate('/', { replace: true });
  } catch (error) {
    console.error('Logout error:', error);
    // Force logout even if server call fails
    authService.clearAuthData();
    dispatch(logoutUser());
    delete api.defaults.headers.common['Authorization'];
    navigate('/', { replace: true });
  }
}, [dispatch, navigate]);

  // Clear error function
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Get user display name
  const getDisplayName = useCallback(() => {
    if (!user) return '';
    return user.displayName || user.name || user.email || 'User';
  }, [user]);

  // Check if OTP is required (for conditional rendering)
  const isOTPRequired = useCallback(() => {
    return user?.requireOTP === true;
  }, [user]);

  return {
    // State
    isAuthenticated,
    user,
    userRole,
    error,
    isLoading,

    // Actions
    login,
    verifyLoginOTP,
    register,
    verifyRegistrationOTP,
    adminLogin,
    logout,
    requestPasswordReset,
    resetUserPassword,
    clearAuthError,

    // Utilities
    getDisplayName,
    isOTPRequired,

    // Role checks
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user'
  };
};