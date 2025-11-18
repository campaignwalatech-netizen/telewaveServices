
import walletService from '../../../src/services/walletService';
import api from '../../../src/services/api';

// Mock the api module
jest.mock('../../../src/services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('walletService', () => {
  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  // Test for getWalletByUserId
  describe('getWalletByUserId', () => {
    it('should fetch wallet data for a given user ID', async () => {
      const userId = '123';
      const responseData = { userId, balance: 1000 };
      api.get.mockResolvedValue({ data: responseData });

      const result = await walletService.getWalletByUserId(userId);

      expect(api.get).toHaveBeenCalledWith(`/wallet/user/${userId}`);
      expect(result).toEqual(responseData);
    });

    it('should throw an error if the API call fails', async () => {
      const userId = '123';
      const error = new Error('User not found');
      api.get.mockRejectedValue(error);

      await expect(walletService.getWalletByUserId(userId)).rejects.toThrow('User not found');
    });
  });

  // Test for addCredit
  describe('addCredit', () => {
    it('should add credit to a wallet successfully', async () => {
      const creditData = { userId: '123', amount: 100 };
      const responseData = { userId: '123', balance: 1100 };
      api.post.mockResolvedValue({ data: responseData });

      const result = await walletService.addCredit(creditData);

      expect(api.post).toHaveBeenCalledWith('/wallet/credit', creditData);
      expect(result).toEqual(responseData);
    });

    it('should throw an error if the API call fails', async () => {
        const creditData = { userId: '123', amount: 100 };
        const error = new Error('Invalid data');
        api.post.mockRejectedValue(error);
  
        await expect(walletService.addCredit(creditData)).rejects.toThrow('Invalid data');
      });
  });

  // Test for addDebit
  describe('addDebit', () => {
    it('should add debit to a wallet successfully', async () => {
      const debitData = { userId: '123', amount: 50 };
      const responseData = { userId: '123', balance: 950 };
      api.post.mockResolvedValue({ data: responseData });

      const result = await walletService.addDebit(debitData);

      expect(api.post).toHaveBeenCalledWith('/wallet/debit', debitData);
      expect(result).toEqual(responseData);
    });

    it('should throw an error for insufficient funds', async () => {
        const debitData = { userId: '123', amount: 2000 };
        const error = new Error('Insufficient funds');
        api.post.mockRejectedValue(error);
  
        await expect(walletService.addDebit(debitData)).rejects.toThrow('Insufficient funds');
      });
  });

  // Test for getAllWallets
  describe('getAllWallets', () => {
    it('should fetch all wallets successfully', async () => {
      const responseData = [{ userId: '123', balance: 1000 }, { userId: '456', balance: 500 }];
      api.get.mockResolvedValue({ data: responseData });

      const result = await walletService.getAllWallets();

      expect(api.get).toHaveBeenCalledWith('/wallet/all');
      expect(result).toEqual(responseData);
    });

    it('should throw an error if the API call fails', async () => {
        const error = new Error('API Error');
        api.get.mockRejectedValue(error);
  
        await expect(walletService.getAllWallets()).rejects.toThrow('API Error');
      });
  });
});
