import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectSessionTimeRemaining,
  selectIsAuthenticated,
  updateLastActivity,
  forceLogout 
} from '../redux/slices/authSlice';

/**
 * Session management hook with automatic timeout and warnings
 * @param {Object} options - Configuration options
 * @param {number} options.warningTime - Time in ms before expiry to show warning
 * @param {number} options.checkInterval - Interval in ms to check session
 * @returns {Object} Session state and methods
 */
export const useSession = (options = {}) => {
  const {
    warningTime = 5 * 60 * 1000, // 5 minutes
    checkInterval = 30 * 1000, // 30 seconds
  } = options;

  const dispatch = useDispatch();
  const sessionTimeRemaining = useSelector(selectSessionTimeRemaining);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [showWarning, setShowWarning] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const warningShownRef = useRef(false);
  const intervalRef = useRef(null);

  // Check session status
  const checkSessionStatus = useCallback(() => {
    if (!isAuthenticated) return;

    const timeRemaining = sessionTimeRemaining;
    
    // Show warning if time is running out and warning hasn't been shown
    if (timeRemaining <= warningTime && timeRemaining > 0 && !warningShownRef.current) {
      setShowWarning(true);
      warningShownRef.current = true;
    }
    
    // Force logout if session expired
    if (timeRemaining <= 0) {
      dispatch(forceLogout());
      setShowWarning(false);
      warningShownRef.current = false;
    }
  }, [isAuthenticated, sessionTimeRemaining, warningTime, dispatch]);

  // Extend session
  const extendSession = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsExtending(true);
    
    try {
      // Update last activity to extend session
      dispatch(updateLastActivity());
      setShowWarning(false);
      warningShownRef.current = false;
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  }, [isAuthenticated, dispatch]);

  // Dismiss warning (but don't extend session)
  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    warningShownRef.current = true; // Prevent showing again until next login
  }, []);

  // Logout manually
  const logout = useCallback(() => {
    dispatch(forceLogout());
    setShowWarning(false);
    warningShownRef.current = false;
  }, [dispatch]);

  // Get formatted time remaining
  const getFormattedTimeRemaining = useCallback(() => {
    const timeRemaining = Math.max(0, sessionTimeRemaining);
    const minutes = Math.floor(timeRemaining / (60 * 1000));
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
    
    return {
      minutes,
      seconds,
      formatted: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      total: timeRemaining
    };
  }, [sessionTimeRemaining]);

  // Register user activity
  const registerActivity = useCallback(() => {
    if (isAuthenticated) {
      dispatch(updateLastActivity());
    }
  }, [isAuthenticated, dispatch]);

  // Setup activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus'
    ];

    const throttledRegisterActivity = throttle(registerActivity, 30000); // Throttle to every 30 seconds

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledRegisterActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledRegisterActivity, true);
      });
    };
  }, [isAuthenticated, registerActivity]);

  // Setup session check interval
  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(checkSessionStatus, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, checkSessionStatus, checkInterval]);

  // Reset warning state when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      warningShownRef.current = false;
      setShowWarning(false);
    }
  }, [isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // State
    isAuthenticated,
    sessionTimeRemaining,
    showWarning,
    isExtending,
    
    // Methods
    extendSession,
    dismissWarning,
    logout,
    registerActivity,
    
    // Computed
    timeRemaining: getFormattedTimeRemaining(),
    isExpiringSoon: sessionTimeRemaining <= warningTime,
    isExpired: sessionTimeRemaining <= 0
  };
};

// Utility function to throttle function calls
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export default useSession;