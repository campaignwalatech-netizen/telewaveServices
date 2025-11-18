
import sessionManager from '../../../src/services/sessionManager';
import { store } from '../../../src/redux/store';
import { updateLastActivity, forceLogout, refreshToken } from '../../../src/redux/slices/authSlice';

// Mock Redux store and actions
jest.mock('../../../src/redux/store', () => ({
  getState: jest.fn(),
  dispatch: jest.fn(),
}));
jest.mock('../../../src/redux/slices/authSlice', () => ({
  updateLastActivity: jest.fn(),
  forceLogout: jest.fn(),
  refreshToken: jest.fn(),
  selectIsAuthenticated: jest.fn(),
  selectSessionTimeRemaining: jest.fn(),
  selectRefreshToken: jest.fn(),
}));

// Mock Notification API
global.Notification = jest.fn();

describe('SessionManager', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    store.dispatch.mockClear();
    sessionManager.destroy(); // Ensure clean state before each test
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize and set up timers and listeners', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    sessionManager.init();
    expect(sessionManager.isInitialized).toBe(true);
    expect(addEventListenerSpy).toHaveBeenCalled();
    addEventListenerSpy.mockRestore();
  });

  it('should clean up timers and listeners on destroy', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    sessionManager.init();
    sessionManager.destroy();
    expect(sessionManager.isInitialized).toBe(false);
    expect(removeEventListenerSpy).toHaveBeenCalled();
    removeEventListenerSpy.mockRestore();
  });

  it('should dispatch updateLastActivity on user activity', () => {
    // Mock isAuthenticated to be true
    require('../../../src/redux/slices/authSlice').selectIsAuthenticated.mockReturnValue(true);
    sessionManager.init();

    // Simulate a mouse move event
    const event = new MouseEvent('mousemove', { bubbles: true, cancelable: true });
    document.dispatchEvent(event);

    // Check if updateLastActivity was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(updateLastActivity());
  });

  it('should dispatch forceLogout on session expiry', () => {
    require('../../../src/redux/slices/authSlice').selectIsAuthenticated.mockReturnValue(true);
    sessionManager.init();

    // Fast-forward time to trigger session timeout
    jest.advanceTimersByTime(sessionManager.config.sessionTimeout);

    expect(store.dispatch).toHaveBeenCalledWith(forceLogout());
  });

  it('should dispatch refreshToken periodically', () => {
    require('../../../src/redux/slices/authSlice').selectIsAuthenticated.mockReturnValue(true);
    require('../../../src/redux/slices/authSlice').selectRefreshToken.mockReturnValue('some-refresh-token');
    sessionManager.init();

    // Fast-forward time to trigger token refresh
    jest.advanceTimersByTime(sessionManager.config.refreshInterval);

    expect(store.dispatch).toHaveBeenCalledWith(refreshToken());
  });
});
