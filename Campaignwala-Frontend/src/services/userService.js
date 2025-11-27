import api from './api';

/**
 * Enhanced User Service
 * Handles all user management API calls with comprehensive statistics
 */
class UserService {
  /**
   * Get all users with filters and enhanced statistics
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.role - Filter by role
   * @param {string} params.status - Filter by status (active, inactive, ex)
   * @param {string} params.search - Search term
   * @param {string} params.sort - Sort field
   * @param {string} params.order - Sort order (asc/desc)
   * @returns {Promise<Object>} - Users list response
   */
  async getAllUsers(params = {}) {
    try {
      console.log('🌐 userService.getAllUsers called with:', params);
      const response = await api.get('/users/admin/users', { params });
      console.log('✅ userService.getAllUsers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getAllUsers error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user by ID with complete details
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User details
   */
  async getUserById(userId) {
    try {
      console.log('🌐 userService.getUserById called with:', userId);
      const response = await api.get(`/users/admin/users/${userId}`);
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
      const response = await api.put(`/users/admin/users/${userId}`, data);
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
   * @param {string} role - New role (user/admin/TL)
   * @returns {Promise<Object>} - Updated user
   */
  // async updateUserRole(userId, role) {
  //   try {
  //     console.log('🌐 userService.updateUserRole called with:', userId, role);
  //     const response = await api.put(`/users/admin/users/${userId}/role`, { role });
  //     console.log('✅ userService.updateUserRole response:', response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('❌ userService.updateUserRole error:', error);
  //     throw this.handleError(error);
  //   }
  // }

  /**
   * Toggle user active status (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated user
   */
  async toggleUserStatus(userId) {
    try {
      console.log('🌐 userService.toggleUserStatus called with:', userId);
      const response = await api.put(`/users/admin/users/${userId}/toggle-status`);
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
      const response = await api.delete(`/users/admin/users/${userId}`);
      console.log('✅ userService.deleteUser response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.deleteUser error:', error);
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
      const response = await api.put(`/users/admin/users/${userId}/mark-ex`);
      console.log('✅ userService.markUserAsEx response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.markUserAsEx error:', error);
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
        api.get(`/users/admin/users/${userId}`),
        api.get(`/leads?hrUserId=${userId}`),
        api.get(`/wallet/user/${userId}`)
      ]);

      const user = userResponse.data.data.user;
      const leads = leadsResponse.data.data.leads || [];
      const wallet = walletResponse.data.data || { balance: 0, totalEarned: 0, totalWithdrawn: 0 };

      // Calculate lead statistics
      const totalLeads = leads.length;
      const completed = leads.filter(l => l.status === 'completed').length;
      const pending = leads.filter(l => l.status === 'pending').length;
      const rejected = leads.filter(l => l.status === 'rejected').length;
      const approved = leads.filter(l => l.status === 'approved').length;

      const stats = {
        ...user,
        totalLeads,
        completedLeads: completed,
        pendingLeads: pending,
        rejectedLeads: rejected,
        approvedLeads: approved,
        totalEarnings: `₹${wallet.totalEarned?.toLocaleString('en-IN') || '0'}`,
        currentBalance: `₹${wallet.balance?.toLocaleString('en-IN') || '0'}`,
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
      const usersResponse = await this.getAllUsers(params);
      const users = usersResponse.data.users || [];

      // Enhanced user data with statistics
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          try {
            // Get user statistics
            const statsResponse = await this.getUserStats(user._id);
            const stats = statsResponse.data;
            
            return {
              _id: user._id,
              id: user._id,
              name: user.name || 'N/A',
              email: user.email || 'N/A',
              phoneNumber: user.phoneNumber || 'N/A',
              role: user.role || 'user',
              isActive: user.isActive,
              isEx: user.isEx || false,
              isVerified: user.isVerified,
              kycDetails: user.kycDetails || {},
              bankDetails: user.bankDetails || {},
              statistics: user.statistics || {},
              createdAt: user.createdAt,
              lastActivity: user.lastActivity,
              // Lead statistics
              totalLeads: stats.totalLeads || 0,
              completedLeads: stats.completedLeads || 0,
              pendingLeads: stats.pendingLeads || 0,
              rejectedLeads: stats.rejectedLeads || 0,
              approvedLeads: stats.approvedLeads || 0,
              // Financial statistics
              totalEarnings: stats.totalEarnings || '₹0',
              currentBalance: stats.currentBalance || '₹0',
              // Additional fields for table
              joinDate: new Date(user.createdAt).toLocaleDateString('en-IN'),
              lastActive: user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('en-IN') : 'Never'
            };
          } catch (error) {
            console.error(`Error getting stats for user ${user._id}:`, error);
            // Return user with default stats if there's an error
            return {
              _id: user._id,
              id: user._id,
              name: user.name || 'N/A',
              email: user.email || 'N/A',
              phoneNumber: user.phoneNumber || 'N/A',
              role: user.role || 'user',
              isActive: user.isActive,
              isEx: user.isEx || false,
              isVerified: user.isVerified,
              kycDetails: user.kycDetails || {},
              bankDetails: user.bankDetails || {},
              statistics: user.statistics || {},
              createdAt: user.createdAt,
              lastActivity: user.lastActivity,
              totalLeads: 0,
              completedLeads: 0,
              pendingLeads: 0,
              rejectedLeads: 0,
              approvedLeads: 0,
              totalEarnings: '₹0',
              currentBalance: '₹0',
              joinDate: new Date(user.createdAt).toLocaleDateString('en-IN'),
              lastActive: user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('en-IN') : 'Never'
            };
          }
        })
      );

      console.log('✅ userService.getAllUsersWithStats response:', usersWithStats);
      return {
        success: true,
        data: {
          users: usersWithStats,
          pagination: usersResponse.data.pagination
        }
      };
    } catch (error) {
      console.error('❌ userService.getAllUsersWithStats error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} - Dashboard stats
   */
  async getDashboardStats() {
    try {
      console.log('🌐 userService.getDashboardStats called');
      const response = await api.get('/users/admin/dashboard-stats');
      console.log('✅ userService.getDashboardStats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getDashboardStats error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Bulk upload users
   * @param {File} file - Excel/CSV file
   * @returns {Promise<Object>} - Upload result
   */
  async bulkUploadUsers(file) {
    try {
      console.log('🌐 userService.bulkUploadUsers called');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/users/admin/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ userService.bulkUploadUsers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.bulkUploadUsers error:', error);
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