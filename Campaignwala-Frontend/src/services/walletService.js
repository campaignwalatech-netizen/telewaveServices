import api from './api';

const walletService = {
  // Get wallet by user ID
  getWalletByUserId: async (userId) => {
    try {
      const response = await api.get(`/wallet/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add credit to wallet
  addCredit: async (creditData) => {
    try {
      const response = await api.post('/wallet/credit', creditData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add debit to wallet
  addDebit: async (debitData) => {
    try {
      const response = await api.post('/wallet/debit', debitData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all wallets (Admin)
  getAllWallets: async () => {
    try {
      const response = await api.get('/wallet/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default walletService;
