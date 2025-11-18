import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  },
  apiHelpers: {
    setAuthToken: vi.fn(),
    clearAuthToken: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));