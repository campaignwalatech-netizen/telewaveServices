import axios from 'axios';
import api, { apiHelpers } from '@/services/api';
import { vi } from 'vitest';

// Mock axios and localStorage


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

describe('api service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('request interceptor', () => {
    it('should add auth token to headers if it exists', () => {
      const token = 'test-token';
      localStorage.setItem('accessToken', token);
      const config = { headers: {} };
      const requestInterceptor = api.interceptors.request.use.mock.calls[0][0];
      const newConfig = requestInterceptor(config);
      expect(newConfig.headers.Authorization).toBe(`Bearer ${token}`);
    });
  });

  describe('apiHelpers', () => {
    it('setAuthToken should set token in headers and localStorage', () => {
      const token = 'test-token';
      apiHelpers.setAuthToken(token);
      expect(api.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
      expect(localStorage.getItem('accessToken')).toBe(token);
    });

    it('clearAuthToken should remove token from headers and localStorage', () => {
      apiHelpers.clearAuthToken();
      expect(api.defaults.headers.common['Authorization']).toBeUndefined();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('isAuthenticated should return true if token exists', () => {
      localStorage.setItem('accessToken', 'some-token');
      expect(apiHelpers.isAuthenticated()).toBe(true);
    });
  });

  // More tests can be added for response interceptor logic (token refresh)

});
