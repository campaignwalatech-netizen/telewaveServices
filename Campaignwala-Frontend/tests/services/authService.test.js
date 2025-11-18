import authService from '@/services/authService';
import api from '@/services/api';
import { vi } from 'vitest';

// Mock api and localStorage
vi.mock('@/services/api', () => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}));

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => store[key] = value.toString(),
    removeItem: key => delete store[key],
    clear: () => store = {},
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const credentials = { phoneNumber: '1234567890', password: 'password' };
      const responseData = { data: { token: 'test-token' } };
      api.post.mockResolvedValue({ data: responseData });

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/users/login', credentials);
      expect(result).toEqual(responseData);
    });
  });

  describe('logout', () => {
    it('should clear authentication data from localStorage', async () => {
      localStorage.setItem('isLoggedIn', 'true');
      await authService.logout();
      expect(localStorage.getItem('isLoggedIn')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if user is authenticated', () => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('accessToken', 'some-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false if user is not authenticated', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  // ... more tests for register, sendOTP, verifyOTP, etc.

});
