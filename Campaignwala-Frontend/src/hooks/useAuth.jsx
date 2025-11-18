import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  selectIsAuthenticated,
  selectUser,
  selectUserRole,
  selectAuthError,
  selectIsLoading,
  loginUser,
  registerUser,
  logoutUser,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  clearError
} from '../redux/slices/authSlice';

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

  // Send OTP function
  const requestOTP = useCallback(async (phoneNumber) => {
    try {
      console.log('📱 useAuth requestOTP called with:', phoneNumber);
      const result = await dispatch(sendOTP(phoneNumber)).unwrap();
      console.log('✅ useAuth requestOTP result:', result);
      return result;
    } catch (error) {
      console.error('❌ useAuth requestOTP error:', error);
      throw error;
    }
  }, [dispatch]);

  // Verify OTP function
  const verifyOTPCode = useCallback(async (phoneNumber, otp) => {
    try {
      const result = await dispatch(verifyOTP({ phoneNumber, otp })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Register function
  const register = useCallback(async ({ phoneNumber, otp, name, email, password }) => {
    try {
      console.log('🎯 useAuth register called with:', { phoneNumber, otp, name, email, password: '***' });
      
      const result = await dispatch(registerUser({ phoneNumber, otp, name, email, password })).unwrap();
      
      // New users are always 'user' role - redirect to user dashboard
      navigate('/user', { replace: true });
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch, navigate]);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      
      // Redirect based on user role
      if (result.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (result.user.role === 'user') {
        navigate('/user', { replace: true });
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch, navigate]);

  // Forgot password function
  const requestPasswordReset = useCallback(async (phoneNumber) => {
    try {
      const result = await dispatch(forgotPassword(phoneNumber)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Reset password function
  const resetUserPassword = useCallback(async ({ phoneNumber, otp, newPassword }) => {
    try {
      const result = await dispatch(resetPassword({ phoneNumber, otp, newPassword })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/', { replace: true });
    } catch (error) {
      // Force logout even if server call fails
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
    return user.displayName || user.name || user.phoneNumber || 'User';
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
    register,
    logout,
    requestOTP,
    verifyOTPCode,
    requestPasswordReset,
    resetUserPassword,
    clearAuthError,

    // Utilities
    getDisplayName,

    // Role checks
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user'
  };
};
