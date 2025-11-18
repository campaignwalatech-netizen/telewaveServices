import adminLogService from '@/services/adminLogService';
import { vi } from 'vitest';

// Mock fetch and localStorage
global.fetch = vi.fn();
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

describe('adminLogService', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
  });

  describe('getAllAdminLogs', () => {
    it('should fetch all admin logs successfully', async () => {
      const responseData = { data: [] };
      fetch.mockResolvedValueOnce({ ok: true, json: async () => responseData });
      const result = await adminLogService.getAllAdminLogs();
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/adminlogs'), expect.any(Object));
      expect(result).toEqual(responseData);
    });
  });

  describe('createAdminLog', () => {
    it('should create an admin log successfully', async () => {
      const logData = { action: 'test action' };
      const responseData = { data: { id: '1', ...logData } };
      fetch.mockResolvedValueOnce({ ok: true, json: async () => responseData });
      const result = await adminLogService.createAdminLog(logData);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/adminlogs'), expect.objectContaining({ method: 'POST' }));
      expect(result).toEqual(responseData);
    });
  });

  describe('exportToCSV', () => {
    it('should convert log data to a CSV string', () => {
      const logs = [
        { _id: '1', adminName: 'Admin', action: 'Login', createdAt: new Date().toISOString(), ipAddress: '127.0.0.1', severity: 'info', details: 'Logged in' },
      ];
      const csv = adminLogService.exportToCSV(logs);
      expect(csv).toContain('ID,Admin,Action,Timestamp,IP Address,Severity,Details');
      expect(csv).toContain('"1","Admin","Login"');
    });

    it('should return an empty string if no logs are provided', () => {
      const csv = adminLogService.exportToCSV([]);
      expect(csv).toBe('');
    });
  });

  // ... more tests for other methods

});
