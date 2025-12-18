import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_TIMEOUT = 90000; // 60 seconds (increased for email OTP operations)

/**
 * Create axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
  (config) => {
    console.log('🌐 [API] Request:', config.method.toUpperCase(), config.url, config.params);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('❌ [API] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle auth errors and token refresh
 */
api.interceptors.response.use(
  (response) => {
    // Add response time for debugging
    if (response.config.metadata) {
      response.config.metadata.endTime = new Date();
      response.duration = response.config.metadata.endTime - response.config.metadata.startTime;
      console.log('✅ [API] Response:', response.config.url, `(${response.duration}ms)`, response.data);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });

          const { accessToken } = response.data;
          
          // Update stored token
          localStorage.setItem('accessToken', accessToken);
          
          // Update the authorization header and retry the request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear auth data and redirect to login
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other error status codes
    switch (error.response?.status) {
      case 403:
        // Forbidden - redirect to unauthorized page
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized';
        }
        break;
      case 404:
        // Not found
        console.error('API endpoint not found:', error.config.url);
        break;
      case 500:
        // Server error
        console.error('Server error:', error.response.data);
        break;
      default:
        // Other errors
        console.error('API error:', error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * API helper methods
 */
export const apiHelpers = {
  /**
   * Set auth token for all requests
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('accessToken', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('accessToken');
    }
  },

  /**
   * Clear auth token
   */
  clearAuthToken() {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
  },

  /**
   * Get current auth token
   * @returns {string|null}
   */
  getAuthToken() {
    return localStorage.getItem('accessToken');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getAuthToken();
  },

  /**
   * Create form data for file uploads
   * @param {Object} data - Data object
   * @returns {FormData}
   */
  createFormData(data) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          data[key].forEach(item => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    
    return formData;
  },

  /**
   * Handle file upload with progress
   * @param {string} url - Upload URL
   * @param {FormData} formData - Form data
   * @param {Function} onProgress - Progress callback
   * @returns {Promise}
   */
  uploadWithProgress(url, formData, onProgress) {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) onProgress(progress);
      },
    });
  }
};

/**
 * Specific API endpoints
 */
export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/users/login',
    verifyLogin: '/users/verify-login',
    register: '/users/register',
    verifyRegistration: '/users/verify-registration',
    adminLogin: '/users/admin-login',
    logout: '/users/logout',
    profile: '/users/profile',
    forgotPassword: '/users/forgot-password',
    resetPassword: '/users/reset-password',
    changePassword: '/users/change-password',
    sendEmailOTP: '/users/send-email-otp',
    verifyEmailOTP: '/users/verify-email-otp'
  },
  
  // Admin endpoints
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    Offers: '/admin/Offers',
    categories: '/admin/categories',
    leads: '/admin/leads',
    slides: '/admin/slides',
    payments: '/admin/payments',
    logs: '/admin/logs',
    queries: '/admin/queries'
  },
  
  // User endpoints
  user: {
    dashboard: '/user',
    profile: '/user/profile',
    leads: '/user/leads',
    attendance: '/user/attendance',
    analytics: '/user/analytics',
    leaderboard: '/user/leaderboard'
  }
};

export default api;