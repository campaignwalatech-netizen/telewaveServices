import api from './api';

const withdrawalService = {
  // Create withdrawal request
  createWithdrawalRequest: async (withdrawalData) => {
    try {
      const response = await api.post('/withdrawals', withdrawalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all withdrawals (Admin)
  getAllWithdrawals: async (params = {}) => {
    try {
      const response = await api.get('/withdrawals', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get withdrawal by ID
  getWithdrawalById: async (id) => {
    try {
      const response = await api.get(`/withdrawals/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get withdrawals by user ID
  getWithdrawalsByUserId: async (userId, params = {}) => {
    try {
      const response = await api.get(`/withdrawals/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Approve withdrawal (Admin)
  approveWithdrawal: async (id, approvalData) => {
    try {
      const response = await api.put(`/withdrawals/${id}/approve`, approvalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reject withdrawal (Admin)
  rejectWithdrawal: async (id, rejectionData) => {
    try {
      const response = await api.put(`/withdrawals/${id}/reject`, rejectionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete withdrawal
  deleteWithdrawal: async (id) => {
    try {
      const response = await api.delete(`/withdrawals/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get withdrawal statistics
  getWithdrawalStats: async () => {
    try {
      const response = await api.get('/withdrawals/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default withdrawalService;
