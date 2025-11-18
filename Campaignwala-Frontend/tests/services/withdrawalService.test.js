
import withdrawalService from '../../../src/services/withdrawalService';
import api from '../../../src/services/api';

// Mock the api module
jest.mock('../../../src/services/api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('withdrawalService', () => {
  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  // Test for createWithdrawalRequest
  describe('createWithdrawalRequest', () => {
    it('should create a withdrawal request successfully', async () => {
      const withdrawalData = { amount: 100, currency: 'USD' };
      const responseData = { id: '1', ...withdrawalData, status: 'pending' };
      api.post.mockResolvedValue({ data: responseData });

      const result = await withdrawalService.createWithdrawalRequest(withdrawalData);

      expect(api.post).toHaveBeenCalledWith('/withdrawals', withdrawalData);
      expect(result).toEqual(responseData);
    });

    it('should throw an error if the API call fails', async () => {
      const withdrawalData = { amount: 100, currency: 'USD' };
      const error = new Error('Network Error');
      api.post.mockRejectedValue(error);

      await expect(withdrawalService.createWithdrawalRequest(withdrawalData)).rejects.toThrow('Network Error');
    });
  });

  // Test for getAllWithdrawals
  describe('getAllWithdrawals', () => {
    it('should fetch all withdrawals successfully', async () => {
      const responseData = [{ id: '1', amount: 100, status: 'pending' }];
      api.get.mockResolvedValue({ data: responseData });

      const result = await withdrawalService.getAllWithdrawals();

      expect(api.get).toHaveBeenCalledWith('/withdrawals', { params: {} });
      expect(result).toEqual(responseData);
    });

    it('should throw an error if the API call fails', async () => {
      const error = new Error('API Error');
      api.get.mockRejectedValue(error);

      await expect(withdrawalService.getAllWithdrawals()).rejects.toThrow('API Error');
    });
  });

  // Test for getWithdrawalById
  describe('getWithdrawalById', () => {
    it('should fetch a single withdrawal by ID', async () => {
      const withdrawalId = '1';
      const responseData = { id: withdrawalId, amount: 100, status: 'pending' };
      api.get.mockResolvedValue({ data: responseData });

      const result = await withdrawalService.getWithdrawalById(withdrawalId);

      expect(api.get).toHaveBeenCalledWith(`/withdrawals/${withdrawalId}`);
      expect(result).toEqual(responseData);
    });

    it('should throw an error if the API call fails', async () => {
        const withdrawalId = '1';
        const error = new Error('Not Found');
        api.get.mockRejectedValue(error);
  
        await expect(withdrawalService.getWithdrawalById(withdrawalId)).rejects.toThrow('Not Found');
      });
  });

  // ... additional tests for other service methods (approve, reject, delete, etc.) can be added here
});
