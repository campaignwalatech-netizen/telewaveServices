import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls with new OTP flows
 */
class AuthService {
  /**
   * Register new user - Step 1: Send OTP to email
   * @param {Object} userData - User registration data
   * @param {string} userData.name - Full name
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password
   * @param {string} userData.confirmPassword - Confirm password
   * @param {string} userData.phoneNumber - Phone number
   * @returns {Promise<Object>} - Registration response with OTP requirement
   */

  async sendEmailOTP(purpose = 'verification') {
    try {
      const response = await api.post('/users/send-email-otp', { purpose });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify Email OTP
   * @param {string} otp - OTP code to verify
   * @returns {Promise<Object>} - Verification response
   */
  async verifyEmailOTP(otp) {
    try {
      const response = await api.post('/users/verify-email-otp', { otp });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - Axios error object
   * @returns {Error} - Processed error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'Operation failed';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error('An unexpected error occurred.');
    }
  }
  async register(userData) {
    try {
      console.log('📤 [AuthService] Sending registration data:', { 
        ...userData, 
        password: '***', 
        confirmPassword: '***' 
      });
      const response = await api.post('/users/register', userData);
      console.log('✅ [AuthService] Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AuthService] Registration error:', error.response?.data || error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Verify registration OTP - Step 2: Complete registration
   * @param {Object} otpData - OTP verification data
   * @param {string} otpData.email - User email
   * @param {string} otpData.otp - OTP code
   * @returns {Promise<Object>} - Registration completion response
   */
  async verifyRegistrationOTP(otpData) {
    try {
      console.log('🔑 [AuthService] Verifying registration OTP for:', otpData.email);
      const response = await api.post('/users/verify-registration', otpData);
      console.log('✅ [AuthService] Registration OTP verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AuthService] Registration OTP verification error:', error.response?.data || error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Login user with email and password - Step 1: Send OTP to email
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} - Authentication response with OTP requirement
   */
  async login(credentials) {
    try {
      console.log('🔐 [AuthService] Login attempt with:', { email: credentials.email });
      const response = await api.post('/users/login', credentials);
      console.log('✅ [AuthService] Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AuthService] Login error:', error.response?.data || error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Verify login OTP - Step 2: Complete login
   * @param {Object} otpData - OTP verification data
   * @param {string} otpData.email - User email
   * @param {string} otpData.otp - OTP code
   * @returns {Promise<Object>} - Login completion response
   */
  async verifyLoginOTP(otpData) {
    try {
      console.log('🔑 [AuthService] Verifying login OTP for:', otpData.email);
      const response = await api.post('/users/verify-login', otpData);
      console.log('✅ [AuthService] Login OTP verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AuthService] Login OTP verification error:', error.response?.data || error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Admin login with email and password - Step 1: Send OTP to email
   * @param {Object} credentials - Admin login credentials
   * @param {string} credentials.email - Admin email
   * @param {string} credentials.password - Admin password
   * @returns {Promise<Object>} - Authentication response with OTP requirement
   */
  async adminLogin(credentials) {
    try {
      console.log('🔐 [AuthService] Admin login attempt with:', { email: credentials.email });
      const response = await api.post('/users/admin-login', credentials);
      console.log('✅ [AuthService] Admin login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AuthService] Admin login error:', error.response?.data || error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset OTP via email
   * @param {Object} data - Reset request data
   * @param {string} data.email - User email
   * @returns {Promise<Object>} - Reset request response
   */
  async forgotPassword(data) {
    try {
      const response = await api.post('/users/forgot-password', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with OTP
   * @param {Object} data - Reset data
   * @param {string} data.email - User email
   * @param {string} data.otp - OTP code
   * @param {string} data.newPassword - New password
   * @param {string} data.confirmPassword - Confirm password
   * @returns {Promise<Object>} - Reset response
   */
  async resetPassword(data) {
    try {
      const response = await api.post('/users/reset-password', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} - Profile response
   */
  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} - Updated profile response
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @param {string} passwordData.confirmPassword - Confirm password
   * @returns {Promise<Object>} - Change password response
   */
  async changePassword(passwordData) {
    try {
      const response = await api.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.warn('Logout API call failed, clearing local storage anyway');
    } finally {
      // Clear local storage regardless of API call success
      this.clearAuthData();
    }
  }

  /**
   * Send Email OTP for verification
   * @param {string} purpose - Purpose of OTP (e.g., 'profile-update', 'login')
   * @returns {Promise<Object>} - OTP send response
   */
  async sendEmailOTP(purpose = 'verification') {
    try {
      const response = await api.post('/users/send-email-otp', { purpose });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify Email OTP
   * @param {string} otp - OTP code to verify
   * @returns {Promise<Object>} - Verification response
   */
  async verifyEmailOTP(otp) {
    try {
      const response = await api.post('/users/verify-email-otp', { otp });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - Axios error object
   * @returns {Error} - Processed error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'Operation failed';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error('An unexpected error occurred.');
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true' && 
           localStorage.getItem('accessToken') !== null;
  }

  /**
   * Get current user role
   * @returns {string|null} - User role
   */
  getUserRole() {
    return localStorage.getItem('userType');
  }

  /**
   * Get access token
   * @returns {string|null} - Access token
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  }

  /**
   * Store authentication data after successful login
   * @param {Object} authData - Authentication data
   */
  storeAuthData(authData) {
    const { user, token } = authData;
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userType', user.role);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.name);
    
    // Set authorization header for future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Get stored user data
   * @returns {Object|null} - User data
   */
  getStoredUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;