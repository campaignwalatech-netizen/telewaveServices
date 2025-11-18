import { store } from '../redux/store';
import { 
  updateLastActivity, 
  forceLogout, 
  refreshToken,
  selectIsAuthenticated,
  selectSessionTimeRemaining,
  selectRefreshToken 
} from '../redux/slices/authSlice';

/**
 * Session Management Service
 * Handles session timeout, token refresh, and activity tracking
 */
class SessionManager {
  constructor() {
    this.activityTimer = null;
    this.refreshTimer = null;
    this.warningTimer = null;
    this.isInitialized = false;
    
    // Configuration
    this.config = {
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      refreshInterval: 5 * 60 * 1000,  // 5 minutes
      warningTime: 5 * 60 * 1000,      // 5 minutes before expiry
      activityEvents: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    };
  }

  /**
   * Initialize session management
   */
  init() {
    if (this.isInitialized) return;
    
    this.setupActivityTracking();
    this.setupTokenRefresh();
    this.setupSessionWarning();
    this.isInitialized = true;
    
    console.log('Session Manager initialized');
  }

  /**
   * Cleanup session management
   */
  destroy() {
    this.clearTimers();
    this.removeActivityListeners();
    this.isInitialized = false;
    
    console.log('Session Manager destroyed');
  }

  /**
   * Setup user activity tracking
   */
  setupActivityTracking() {
    const handleActivity = this.throttle(() => {
      const state = store.getState();
      const isAuthenticated = selectIsAuthenticated(state);
      
      if (isAuthenticated) {
        store.dispatch(updateLastActivity());
        this.resetSessionTimer();
      }
    }, 1000); // Throttle to once per second

    // Add event listeners
    this.config.activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    this.handleActivity = handleActivity;
  }

  /**
   * Remove activity event listeners
   */
  removeActivityListeners() {
    if (this.handleActivity) {
      this.config.activityEvents.forEach(event => {
        document.removeEventListener(event, this.handleActivity, true);
      });
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    this.refreshTimer = setInterval(() => {
      const state = store.getState();
      const isAuthenticated = selectIsAuthenticated(state);
      const refreshTokenValue = selectRefreshToken(state);
      
      if (isAuthenticated && refreshTokenValue) {
        store.dispatch(refreshToken());
      }
    }, this.config.refreshInterval);
  }

  /**
   * Setup session expiry warning
   */
  setupSessionWarning() {
    this.warningTimer = setInterval(() => {
      const state = store.getState();
      const isAuthenticated = selectIsAuthenticated(state);
      const timeRemaining = selectSessionTimeRemaining(state);
      
      if (isAuthenticated && timeRemaining <= this.config.warningTime && timeRemaining > 0) {
        this.showSessionWarning(timeRemaining);
      }
    }, 90000); // Check every minute
  }

  /**
   * Reset session timer
   */
  resetSessionTimer() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    this.activityTimer = setTimeout(() => {
      this.handleSessionExpiry();
    }, this.config.sessionTimeout);
  }

  /**
   * Handle session expiry
   */
  handleSessionExpiry() {
    const state = store.getState();
    const isAuthenticated = selectIsAuthenticated(state);
    
    if (isAuthenticated) {
      store.dispatch(forceLogout());
      this.showSessionExpiredMessage();
    }
  }

  /**
   * Show session warning notification
   */
  showSessionWarning(timeRemaining) {
    const minutes = Math.ceil(timeRemaining / 90000);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Warning', {
        body: `Your session will expire in ${minutes} minutes`,
        icon: '/favicon.ico'
      });
    }
    
    // You can also dispatch an action to show in-app notification
    console.warn(`Session expires in ${minutes} minutes`);
  }

  /**
   * Show session expired message
   */
  showSessionExpiredMessage() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Expired', {
        body: 'Your session has expired. Please log in again.',
        icon: '/favicon.ico'
      });
    }
    
    console.warn('Session expired');
  }

  /**
   * Clear all timers
   */
  clearTimers() {
    if (this.activityTimer) clearTimeout(this.activityTimer);
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    if (this.warningTimer) clearInterval(this.warningTimer);
  }

  /**
   * Throttle function execution
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Request notification permission
   */
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  /**
   * Get session status
   */
  getSessionStatus() {
    const state = store.getState();
    return {
      isAuthenticated: selectIsAuthenticated(state),
      timeRemaining: selectSessionTimeRemaining(state),
      isExpired: selectSessionTimeRemaining(state) === 0
    };
  }

  /**
   * Extend session manually
   */
  extendSession() {
    store.dispatch(updateLastActivity());
    this.resetSessionTimer();
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;