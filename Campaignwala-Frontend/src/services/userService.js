import api from './api';

/**
 * User Service
 * Handles all user management API calls
 */
class UserService {
  /**
   * Get all users with filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.role - Filter by role
   * @param {string} params.isActive - Filter by active status
   * @param {string} params.search - Search term
   * @returns {Promise<Object>} - Users list response
   */
  async getAllUsers(params = {}) {
    try {
      console.log('🌐 userService.getAllUsers called with:', params);
      const response = await api.get('/users', { params });
      console.log('✅ userService.getAllUsers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getAllUsers error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User details
   */
  async getUserById(userId) {
    try {
      console.log('🌐 userService.getUserById called with:', userId);
      const response = await api.get(`/users/${userId}`);
      console.log('✅ userService.getUserById response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getUserById error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} data - Updated user data
   * @returns {Promise<Object>} - Updated user
   */
  async updateUser(userId, data) {
    try {
      console.log('🌐 userService.updateUser called with:', userId, data);
      const response = await api.put(`/users/${userId}`, data);
      console.log('✅ userService.updateUser response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.updateUser error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user role (Admin only)
   * @param {string} userId - User ID
   * @param {string} role - New role (user/admin)
   * @returns {Promise<Object>} - Updated user
   */
  async updateUserRole(userId, role) {
    try {
      console.log('🌐 userService.updateUserRole called with:', userId, role);
      const response = await api.put(`/users/${userId}/role`, { role });
      console.log('✅ userService.updateUserRole response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.updateUserRole error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Toggle user active status (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated user
   */
  async toggleUserStatus(userId) {
    try {
      console.log('🌐 userService.toggleUserStatus called with:', userId);
      const response = await api.put(`/users/${userId}/toggle-status`);
      console.log('✅ userService.toggleUserStatus response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.toggleUserStatus error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete user (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteUser(userId) {
    try {
      console.log('🌐 userService.deleteUser called with:', userId);
      const response = await api.delete(`/users/${userId}`);
      console.log('✅ userService.deleteUser response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.deleteUser error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user statistics with leads and wallet data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User stats
   */
  async getUserStats(userId) {
    try {
      console.log('🌐 userService.getUserStats called with:', userId);
      
      // Fetch user details, leads, and wallet in parallel
      const [userResponse, leadsResponse, walletResponse] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/leads?hrUserId=${userId}`),
        api.get(`/wallet/user/${userId}`)
      ]);

      const user = userResponse.data.data;
      const leads = leadsResponse.data.data.leads || [];
      const wallet = walletResponse.data.data || { balance: 0, totalEarned: 0, totalWithdrawn: 0 };

      // Calculate lead statistics
      const totalLeads = leads.length;
      const approved = leads.filter(l => l.status === 'approved').length;
      const completed = leads.filter(l => l.status === 'completed').length;
      const rejected = leads.filter(l => l.status === 'rejected').length;
      const pending = leads.filter(l => l.status === 'pending').length;

      const stats = {
        ...user,
        totalLeads,
        approved,
        completed,
        rejected,
        pending,
        totalEarnings: `₹${wallet.totalEarned.toLocaleString('en-IN')}`,
        totalBalance: `₹${(wallet.balance + wallet.totalWithdrawn).toLocaleString('en-IN')}`,
        currentBalance: `₹${wallet.balance.toLocaleString('en-IN')}`,
        wallet
      };

      console.log('✅ userService.getUserStats response:', stats);
      return { success: true, data: stats };
    } catch (error) {
      console.error('❌ userService.getUserStats error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all users with complete statistics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Users with stats
   */
  async getAllUsersWithStats(params = {}) {
    try {
      console.log('🌐 userService.getAllUsersWithStats called with:', params);
      
      // Get all users
      const usersResponse = await api.get('/users', { params });
      const users = usersResponse.data.data.users || [];

      // Get all leads and wallets
      const [leadsResponse, walletsResponse] = await Promise.all([
        api.get('/leads'),
        api.get('/wallet/all')
      ]);

      const allLeads = leadsResponse.data.data.leads || [];
      const allWallets = walletsResponse.data.data || [];

      // Map users with their statistics
      const usersWithStats = users.map(user => {
        const userLeads = allLeads.filter(lead => lead.hrUserId === user._id || lead.hrUserId._id === user._id);
        const userWallet = allWallets.find(w => w.userId === user._id || w.userId._id === user._id) || {
          balance: 0,
          totalEarned: 0,
          totalWithdrawn: 0
        };

        const totalLeads = userLeads.length;
        const approved = userLeads.filter(l => l.status === 'approved').length;
        const completed = userLeads.filter(l => l.status === 'completed').length;
        const rejected = userLeads.filter(l => l.status === 'rejected').length;
        const pending = userLeads.filter(l => l.status === 'pending').length;

        return {
          id: user._id,
          name: user.name || 'N/A',
          email: user.email || 'N/A',
          phone: user.phoneNumber || user.phone || 'N/A',
          status: user.isEx ? 'Ex' : (user.isActive ? 'Active' : 'Hold'),
          joinedOn: new Date(user.createdAt).toISOString().split('T')[0],
          totalLeads,
          approved,
          rejected,
          completed,
          pending,
          totalEarnings: `₹${userWallet.totalEarned.toLocaleString('en-IN')}`,
          totalBalance: `₹${(userWallet.balance + userWallet.totalWithdrawn).toLocaleString('en-IN')}`,
          currentBalance: `₹${userWallet.balance.toLocaleString('en-IN')}`,
          _id: user._id,
          isActive: user.isActive,
          isEx: user.isEx || false,
          role: user.role
        };
      });

      console.log('✅ userService.getAllUsersWithStats response:', usersWithStats);
      return {
        success: true,
        data: {
          users: usersWithStats,
          pagination: usersResponse.data.data.pagination
        }
      };
    } catch (error) {
      console.error('❌ userService.getAllUsersWithStats error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark user as Ex (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated user
   */
  async markUserAsEx(userId) {
    try {
      console.log('🌐 userService.markUserAsEx called with:', userId);
      const response = await api.put(`/users/${userId}/mark-ex`);
      console.log('✅ userService.markUserAsEx response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.markUserAsEx error:', error);
      throw this.handleError(error);
    }
  }

  // ==================== KYC Methods ====================

  /**
   * Get user's KYC details
   * @returns {Promise<Object>} - KYC details
   */
  async getKYCDetails() {
    try {
      console.log('🌐 userService.getKYCDetails called');
      const response = await api.get('/users/kyc');
      console.log('✅ userService.getKYCDetails response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getKYCDetails error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update KYC details (Personal + Documents + Bank)
   * @param {Object} data - KYC data
   * @returns {Promise<Object>} - Updated KYC details
   */
  async updateKYCDetails(data) {
    try {
      console.log('🌐 userService.updateKYCDetails called with:', data);
      const response = await api.put('/users/kyc', data);
      console.log('✅ userService.updateKYCDetails response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.updateKYCDetails error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all pending KYC requests (Admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Pending KYC requests
   */
  async getPendingKYCRequests(params = {}) {
    try {
      console.log('🌐 userService.getPendingKYCRequests called with:', params);
      const response = await api.get('/users/admin/kyc/pending', { params });
      console.log('✅ userService.getPendingKYCRequests response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getPendingKYCRequests error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get KYC details by user ID (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User's KYC details
   */
  async getKYCDetailsByUserId(userId) {
    try {
      console.log('🌐 userService.getKYCDetailsByUserId called with:', userId);
      const response = await api.get(`/users/admin/kyc/${userId}`);
      console.log('✅ userService.getKYCDetailsByUserId response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getKYCDetailsByUserId error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Approve KYC (Admin only)
   * @param {string} userId - User ID
   * @param {Object} data - Approval data (optional remarks)
   * @returns {Promise<Object>} - Approval confirmation
   */
  async approveKYC(userId, data = {}) {
    try {
      console.log('🌐 userService.approveKYC called with:', userId, data);
      const response = await api.put(`/users/admin/kyc/${userId}/approve`, data);
      console.log('✅ userService.approveKYC response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.approveKYC error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reject KYC (Admin only)
   * @param {string} userId - User ID
   * @param {Object} data - Rejection data (reason required)
   * @returns {Promise<Object>} - Rejection confirmation
   */
  async rejectKYC(userId, data) {
    try {
      console.log('🌐 userService.rejectKYC called with:', userId, data);
      const response = await api.put(`/users/admin/kyc/${userId}/reject`, data);
      console.log('✅ userService.rejectKYC response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.rejectKYC error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @private
   */
  handleError(error) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || 'An error occurred',
      error: error.toString()
    };
  }
}

// Export singleton instance
const userService = new UserService();
export default userService;
