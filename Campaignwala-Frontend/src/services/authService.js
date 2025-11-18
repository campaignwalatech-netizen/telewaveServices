import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * Send OTP to phone number
   * @param {Object} data - Phone number data
   * @param {string} data.phoneNumber - User phone number
   * @returns {Promise<Object>} - OTP response
   */
  async sendOTP(data) {
    try {
      console.log('🌐 authService.sendOTP called with:', data);
      const response = await api.post('/users/send-otp', data);
      console.log('✅ authService.sendOTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ authService.sendOTP error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verify OTP
   * @param {Object} otpData - OTP verification data
   * @param {string} otpData.phoneNumber - User phone number
   * @param {string} otpData.otp - OTP code
   * @returns {Promise<Object>} - Verification response
   */
  async verifyOTP(otpData) {
    try {
      const response = await api.post('/users/verify-otp', otpData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.phoneNumber - Phone number
   * @param {string} userData.otp - OTP code
   * @param {string} userData.name - Full name
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password
   * @returns {Promise<Object>} - Registration response
   */
  async register(userData) {
    try {
      console.log('📤 Sending registration data:', userData);
      const response = await api.post('/users/register', userData);
      console.log('✅ Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Login user with credentials
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.phoneNumber - User phone number
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} - Authentication response
   */
  async login(credentials) {
    try {
      const response = await api.post('/users/login', credentials);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset OTP
   * @param {Object} data - Reset request data
   * @param {string} data.phoneNumber - User phone number
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
   * @param {string} data.phoneNumber - User phone number
   * @param {string} data.otp - OTP code
   * @param {string} data.newPassword - New password
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
   * @returns {Promise<Object>} - Change password response
   */
  async changePassword(passwordData) {
    try {
      const response = await api.post('/users/change-password', passwordData);
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
    // Clear local storage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userPhone');
    return Promise.resolve();
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
   * Get refresh token
   * @returns {string|null} - Refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
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
    localStorage.removeItem('userPhone');
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;