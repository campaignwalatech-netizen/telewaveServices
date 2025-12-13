import api from './api';

/**
 * Enhanced User Service
 * Handles all user management API calls with comprehensive statistics
 */
class UserService {
  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users with filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.role - Filter by role
   * @param {boolean} params.isVerified - Filter by verification status
   * @param {string} params.search - Search term
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

  async getPresentUsers(params = {}) {
    try {
      console.log('🌐 userService.getPresentUsers called with:', params);
      const response = await api.get('/users/admin/present-users', { params });
      console.log('✅ userService.getPresentUsers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getPresentUsers error:', error);
      throw this.handleError(error);
    }
  }


  /**
   * Get users by status (for admin dashboard)
   * @param {string} status - User status (active, inactive, hold, blocked, pending, ex)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Users list
   */
  async getUsersByStatus(status, params = {}) {
    try {
      console.log('🌐 userService.getUsersByStatus called with:', status, params);
      const response = await api.get(`/users/admin/users/status/${status}`, { params });
      console.log('✅ userService.getUsersByStatus response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getUsersByStatus error:', error);
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
   * Update user profile (comprehensive update)
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
  async updateUserRole(userId, role) {
    try {
      console.log('🌐 userService.updateUserRole called with:', userId, role);
      const response = await api.put(`/users/admin/users/${userId}/role`, { role });
      console.log('✅ userService.updateUserRole response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.updateUserRole error:', error);
      throw this.handleError(error);
    }
  }

  async approveAndAssignTL(userId, data) {
  try {
    const response = await api.post(`/users/admin/users/${userId}/approve-and-assign-tl`, data);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}

  /**
   * Update TL permissions
   * @param {string} userId - User ID
   * @param {Object} permissions - TL permissions object
   * @returns {Promise<Object>} - Updated TL
   */
  async updateTLPermissions(userId, permissions) {
    try {
      console.log('🌐 userService.updateTLPermissions called with:', userId, permissions);
      const response = await api.put(`/users/admin/users/${userId}/tl-permissions`, { permissions });
      console.log('✅ userService.updateTLPermissions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.updateTLPermissions error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Approve user registration
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Approval response
   */
  async approveUserRegistration(userId) {
  try {
    const response = await api.post(`/users/admin/users/${userId}/approve-registration`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}

async activateUser(userId, tlId) {
  try {
    const response = await api.post(`/users/admin/users/${userId}/activate`, { tlId });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}

  /**
   * Bulk approve users
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise<Object>} - Bulk approval response
   */
  async bulkApproveUsers(userIds) {
    try {
      console.log('🌐 userService.bulkApproveUsers called with:', userIds);
      const response = await api.post('/users/admin/bulk-approve', { userIds });
      console.log('✅ userService.bulkApproveUsers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.bulkApproveUsers error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark user as Hold
   * @param {string} userId - User ID
   * @param {Object} data - Hold data (reason, holdUntil)
   * @returns {Promise<Object>} - Hold response
   */
  async markUserHold(userId, data) {
    try {
      console.log('🌐 userService.markUserHold called with:', userId, data);
      const response = await api.post(`/users/admin/users/${userId}/hold`, data);
      console.log('✅ userService.markUserHold response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.markUserHold error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark user as Active (from Hold)
   * @param {string} userId - User ID
   * @param {Object} data - Activation data (reason)
   * @returns {Promise<Object>} - Activation response
   */
  async markUserActive(userId, data = {}) {
    try {
      console.log('🌐 userService.markUserActive called with:', userId, data);
      const response = await api.post(`/users/admin/users/${userId}/active`, data);
      console.log('✅ userService.markUserActive response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.markUserActive error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Block user
   * @param {string} userId - User ID
   * @param {Object} data - Block data (reason)
   * @returns {Promise<Object>} - Block response
   */
  async blockUser(userId, data) {
    try {
      console.log('🌐 userService.blockUser called with:', userId, data);
      const response = await api.post(`/users/admin/users/${userId}/block`, data);
      console.log('✅ userService.blockUser response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.blockUser error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Change user role (User ↔ TL)
   * @param {string} userId - User ID
   * @param {Object} data - Role change data (newRole, reason)
   * @returns {Promise<Object>} - Role change response
   */
  async changeUserRole(userId, data) {
    try {
      console.log('🌐 userService.changeUserRole called with:', userId, data);
      const response = await api.post(`/users/admin/users/${userId}/change-role`, data);
      console.log('✅ userService.changeUserRole response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.changeUserRole error:', error);
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
      const response = await api.put(`/users/admin/users/${userId}/toggle-status`);
      console.log('✅ userService.toggleUserStatus response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.toggleUserStatus error:', error);
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
   * Process withdrawal for user
   * @param {string} userId - User ID
   * @param {Object} data - Withdrawal data
   * @returns {Promise<Object>} - Withdrawal response
   */
  async processWithdrawal(userId, data) {
    try {
      console.log('🌐 userService.processWithdrawal called with:', userId, data);
      const response = await api.post(`/users/admin/users/${userId}/withdrawal`, data);
      console.log('✅ userService.processWithdrawal response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.processWithdrawal error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Add rollback data to user
   * @param {string} userId - User ID
   * @param {Object} data - Rollback data
   * @returns {Promise<Object>} - Rollback response
   */
  async addRollback(userId, data) {
    try {
      console.log('🌐 userService.addRollback called with:', userId, data);
      const response = await api.post(`/users/admin/users/${userId}/rollback`, data);
      console.log('✅ userService.addRollback response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.addRollback error:', error);
      throw this.handleError(error);
    }
  }

  // ==================== USER STATISTICS ====================

  /**
   * Get user statistics with leads and wallet data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User stats
   */
  async getUserStats(userId) {
    try {
      console.log('🌐 userService.getUserStats called with:', userId);
      const response = await api.get(`/users/admin/users/${userId}/stats`);
      console.log('✅ userService.getUserStats response:', response.data);
      return response.data;
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
      const response = await api.get('/users/admin/users-with-stats', { params });
      console.log('✅ userService.getAllUsersWithStats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getAllUsersWithStats error:', error);
      throw this.handleError(error);
    }
  }

  // ==================== ATTENDANCE MANAGEMENT ====================

  /**
   * Mark attendance (for regular users only)
   * @param {Object} data - Attendance data (status)
   * @returns {Promise<Object>} - Attendance response
   */
  async markAttendance(data = {}) {
    try {
      console.log('🌐 userService.markAttendance called with:', data);
      const response = await api.post('/users/mark-attendance', data);
      console.log('✅ userService.markAttendance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.markAttendance error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get today's attendance
   * @returns {Promise<Object>} - Today's attendance
   */
  async getTodayAttendance() {
    try {
      console.log('🌐 userService.getTodayAttendance called');
      const response = await api.get('/users/today-attendance');
      console.log('✅ userService.getTodayAttendance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getTodayAttendance error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get attendance history
   * @param {Object} params - Query parameters (startDate, endDate, limit)
   * @returns {Promise<Object>} - Attendance history
   */
  async getAttendanceHistory(params = {}) {
    try {
      console.log('🌐 userService.getAttendanceHistory called with:', params);
      const response = await api.get('/users/attendance-history', { params });
      console.log('✅ userService.getAttendanceHistory response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getAttendanceHistory error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get attendance report (Admin only)
   * @param {Object} params - Query parameters (startDate, endDate)
   * @returns {Promise<Object>} - Attendance report
   */
  async getAttendanceReport(params = {}) {
    try {
      console.log('🌐 userService.getAttendanceReport called with:', params);
      const response = await api.get('/users/admin/attendance/report', { params });
      console.log('✅ userService.getAttendanceReport response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getAttendanceReport error:', error);
      throw this.handleError(error);
    }
  }

  // ==================== LEAD MANAGEMENT ====================

  /**
   * Distribute leads (Admin only)
   * @param {Object} data - Distribution data
   * @returns {Promise<Object>} - Distribution response
   */
  async distributeLeads(data) {
    try {
      console.log('🌐 userService.distributeLeads called with:', data);
      const response = await api.post('/users/admin/leads/distribute', data);
      console.log('✅ userService.distributeLeads response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.distributeLeads error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Withdraw leads from user (Admin only)
   * @param {string} userId - User ID
   * @param {Object} data - Withdrawal data (leadIds)
   * @returns {Promise<Object>} - Withdrawal response
   */
  async withdrawLeads(userId, data) {
    try {
      console.log('🌐 userService.withdrawLeads called with:', userId, data);
      const response = await api.post(`/users/admin/users/${userId}/withdraw-leads`, data);
      console.log('✅ userService.withdrawLeads response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.withdrawLeads error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user's today leads
   * @returns {Promise<Object>} - Today's leads
   */
  async getUserTodaysLeads() {
    try {
      console.log('🌐 userService.getUserTodaysLeads called');
      const response = await api.get('/users/my-leads/today');
      console.log('✅ userService.getUserTodaysLeads response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getUserTodaysLeads error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Start working on a lead
   * @param {string} leadId - Lead ID
   * @returns {Promise<Object>} - Start response
   */
  async startLead(leadId) {
    try {
      console.log('🌐 userService.startLead called with:', leadId);
      const response = await api.post(`/users/my-leads/${leadId}/start`);
      console.log('✅ userService.startLead response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.startLead error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Complete a lead
   * @param {string} leadId - Lead ID
   * @param {Object} data - Completion data (remarks)
   * @returns {Promise<Object>} - Completion response
   */
  async completeLead(leadId, data = {}) {
    try {
      console.log('🌐 userService.completeLead called with:', leadId, data);
      const response = await api.post(`/users/my-leads/${leadId}/complete`, data);
      console.log('✅ userService.completeLead response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.completeLead error:', error);
      throw this.handleError(error);
    }
  }

  // ==================== KYC MANAGEMENT ====================

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
   * Submit KYC for approval
   * @param {Object} data - KYC data
   * @returns {Promise<Object>} - Submission response
   */
  async submitKYC(data) {
    try {
      console.log('🌐 userService.submitKYC called with:', data);
      const response = await api.post('/users/kyc/submit', data);
      console.log('✅ userService.submitKYC response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.submitKYC error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Request KYC approval
   * @returns {Promise<Object>} - Approval request response
   */
  async requestKYCApproval() {
    try {
      console.log('🌐 userService.requestKYCApproval called');
      const response = await api.post('/users/kyc/request-approval');
      console.log('✅ userService.requestKYCApproval response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.requestKYCApproval error:', error);
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
   * @param {Object} data - Approval data (remarks)
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
   * @param {Object} data - Rejection data (reason)
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

  // ==================== WALLET MANAGEMENT ====================

  /**
   * Get wallet balance
   * @returns {Promise<Object>} - Wallet balance
   */
  async getWalletBalance() {
    try {
      console.log('🌐 userService.getWalletBalance called');
      const response = await api.get('/users/wallet');
      console.log('✅ userService.getWalletBalance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getWalletBalance error:', error);
      throw this.handleError(error);
    }
  }

  // ==================== QUERY MANAGEMENT ====================

  /**
   * Submit a query
   * @param {Object} data - Query data (subject, message, category, priority)
   * @returns {Promise<Object>} - Query submission response
   */
  async riseQuery(data) {
    try {
      console.log('🌐 userService.riseQuery called with:', data);
      const response = await api.post('/users/queries', data);
      console.log('✅ userService.riseQuery response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.riseQuery error:', error);
      throw this.handleError(error);
    }
  }

  // ==================== DASHBOARD & REPORTS ====================

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
   * Export users to Excel/JSON
   * @param {Object} params - Export parameters (format)
   * @returns {Promise<Blob>} - Export file
   */
  async exportUsers(params = {}) {
    try {
      console.log('🌐 userService.exportUsers called with:', params);
      const response = await api.get('/users/admin/export-users', {
        params,
        responseType: 'blob'
      });
      console.log('✅ userService.exportUsers response received');
      return response.data;
    } catch (error) {
      console.error('❌ userService.exportUsers error:', error);
      throw this.handleError(error);
    }
  }

  // ==================== BULK OPERATIONS ====================

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

  // ==================== TL TEAM MANAGEMENT ====================


  /**
   * Get team leaders
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Team leaders list
   */
  async getTeamLeaders(params = {}) {
    try {
      console.log('🌐 userService.getTeamLeaders called with:', params);
      const response = await api.get('/users/admin/team-leaders', { params });
      console.log('✅ userService.getTeamLeaders response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getTeamLeaders error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get team members (for TL)
   * @returns {Promise<Object>} - Team members
   */
  async getTeamMembers() {
    try {
      console.log('🌐 userService.getTeamMembers called');
      const response = await api.get('/users/tl/team-members');
      console.log('✅ userService.getTeamMembers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getTeamMembers error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Add team member (for TL)
   * @param {Object} data - Team member data (memberId)
   * @returns {Promise<Object>} - Added member
   */
  async addTeamMember(data) {
    try {
      console.log('🌐 userService.addTeamMember called with:', data);
      const response = await api.post('/users/tl/team-members', data);
      console.log('✅ userService.addTeamMember response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.addTeamMember error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Remove team member (for TL)
   * @param {string} memberId - Team member ID
   * @returns {Promise<Object>} - Removal confirmation
   */
  async removeTeamMember(memberId) {
    try {
      console.log('🌐 userService.removeTeamMember called with:', memberId);
      const response = await api.delete(`/users/tl/team-members/${memberId}`);
      console.log('✅ userService.removeTeamMember response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.removeTeamMember error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get team performance (for TL)
   * @returns {Promise<Object>} - Team performance
   */
  async getTeamPerformance() {
    try {
      console.log('🌐 userService.getTeamPerformance called');
      const response = await api.get('/users/tl/team-performance');
      console.log('✅ userService.getTeamPerformance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getTeamPerformance error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get team attendance (for TL)
   * @returns {Promise<Object>} - Team attendance
   */
  async getTeamAttendance() {
    try {
      console.log('🌐 userService.getTeamAttendance called');
      const response = await api.get('/users/tl/team-attendance');
      console.log('✅ userService.getTeamAttendance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getTeamAttendance error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Distribute leads to team members (for TL)
   * @param {Object} data - Distribution data (leadIds, memberId, dailyQuota)
   * @returns {Promise<Object>} - Distribution response
   */
  async distributeLeadsToTeam(data) {
    try {
      console.log('🌐 userService.distributeLeadsToTeam called with:', data);
      const response = await api.post('/users/tl/leads/distribute', data);
      console.log('✅ userService.distributeLeadsToTeam response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.distributeLeadsToTeam error:', error);
      throw this.handleError(error);
    }
  }

  // ==================== ERROR HANDLING ====================

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

  // ==================== USER MANAGEMENT ====================

  /**
   * Get all approved users (not TL or admin)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Approved users list
   */
  async getApprovedUsers(params = {}) {
    try {
      console.log('🌐 userService.getApprovedUsers called with:', params);
      const response = await api.get('/users/admin/approved-users', { 
        params: {
          ...params,
          role: 'user' // Only get regular users
        }
      });
      console.log('✅ userService.getApprovedUsers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getApprovedUsers error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all not approved users (including TLs)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Not approved users list
   */
  async getNotApprovedUsers(params = {}) {
    try {
      console.log('🌐 userService.getNotApprovedUsers called with:', params);
      const response = await api.get('/users/admin/not-approved-users', { params });
      console.log('✅ userService.getNotApprovedUsers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userService.getNotApprovedUsers error:', error);
      throw this.handleError(error);
    }
  }


  // Add these methods to your UserService class

async approveUser(userId, data = {}) {
  try {
    const response = await api.post(`/users/admin/users/${userId}/approve`, data);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}

async rejectUser(userId, data) {
  try {
    const response = await api.post(`/users/admin/users/${userId}/reject`, data);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}

async assignUserToTL(userId, data) {
  try {
    const response = await api.post(`/users/admin/users/${userId}/assign-tl`, data);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}



async exportNotApprovedUsers(params = {}) {
  try {
    const response = await api.get('/users/admin/export-pending-users', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}

  


}


// Export singleton instance
const userService = new UserService();
export default userService;