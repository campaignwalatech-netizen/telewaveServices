import api from './api';

/**
 * TL Service
 * Handles all Team Leader specific API calls
 */
class TLService {
  /**
   * Get TL dashboard data
   * @param {string} range - Time range (today, week, month, quarter)
   * @returns {Promise<Object>} - Dashboard data
   */
  async getDashboardData(range = 'today') {
    try {
      console.log('🌐 tlService.getDashboardData called with range:', range);
      const response = await api.get('/users/tl/dashboard-stats', { params: { range } });
      console.log('✅ tlService.getDashboardData response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.getDashboardData error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get team members
   * @returns {Promise<Object>} - Team members data
   */
  async getTeamMembers() {
    try {
      console.log('🌐 tlService.getTeamMembers called');
      const response = await api.get('/users/tl/team-members');
      console.log('✅ tlService.getTeamMembers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.getTeamMembers error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Add team member
   * @param {Object} memberData - Team member data
   * @returns {Promise<Object>} - Added member data
   */
  async addTeamMember(memberData) {
    try {
      console.log('🌐 tlService.addTeamMember called with:', memberData);
      const response = await api.post('/users/tl/team-members', memberData);
      console.log('✅ tlService.addTeamMember response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.addTeamMember error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Remove team member
   * @param {string} memberId - Team member ID
   * @returns {Promise<Object>} - Removal confirmation
   */
  async removeTeamMember(memberId) {
    try {
      console.log('🌐 tlService.removeTeamMember called with:', memberId);
      const response = await api.delete(`/users/tl/team-members/${memberId}`);
      console.log('✅ tlService.removeTeamMember response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.removeTeamMember error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get TL leads with filters
   * @param {Object} filters - Lead filters
   * @returns {Promise<Object>} - Leads data
   */
  async getLeads(filters = {}) {
    try {
      console.log('🌐 tlService.getLeads called with filters:', filters);
      const response = await api.get('/leads/tl', { params: filters });
      console.log('✅ tlService.getLeads response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.getLeads error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Assign lead to team member
   * @param {string} leadId - Lead ID
   * @param {Object} assignData - Assignment data
   * @returns {Promise<Object>} - Assignment confirmation
   */
  async assignLead(leadId, assignData) {
    try {
      console.log('🌐 tlService.assignLead called with:', leadId, assignData);
      const response = await api.post(`/leads/${leadId}/assign`, assignData);
      console.log('✅ tlService.assignLead response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.assignLead error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Approve lead
   * @param {string} leadId - Lead ID
   * @param {string} notes - Approval notes
   * @returns {Promise<Object>} - Approval confirmation
   */
  async approveLead(leadId, notes = '') {
    try {
      console.log('🌐 tlService.approveLead called with:', leadId, notes);
      const response = await api.put(`/leads/${leadId}/approve`, { notes });
      console.log('✅ tlService.approveLead response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.approveLead error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reject lead
   * @param {string} leadId - Lead ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} - Rejection confirmation
   */
  async rejectLead(leadId, reason = '') {
    try {
      console.log('🌐 tlService.rejectLead called with:', leadId, reason);
      const response = await api.put(`/leads/${leadId}/reject`, { reason });
      console.log('✅ tlService.rejectLead response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.rejectLead error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get team performance report
   * @param {string} range - Time range
   * @returns {Promise<Object>} - Performance report
   */
  async getTeamPerformance(range = 'month') {
    try {
      console.log('🌐 tlService.getTeamPerformance called with range:', range);
      const response = await api.get('/users/tl/team-performance', { params: { range } });
      console.log('✅ tlService.getTeamPerformance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.getTeamPerformance error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get TL wallet
   * @returns {Promise<Object>} - Wallet data
   */
  async getWallet() {
    try {
      console.log('🌐 tlService.getWallet called');
      const response = await api.get('/wallet/tl');
      console.log('✅ tlService.getWallet response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.getWallet error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get TL notifications
   * @returns {Promise<Object>} - Notifications
   */
  async getNotifications() {
    try {
      console.log('🌐 tlService.getNotifications called');
      const response = await api.get('/notifications/tl');
      console.log('✅ tlService.getNotifications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.getNotifications error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Update confirmation
   */
  async markNotificationAsRead(notificationId) {
    try {
      console.log('🌐 tlService.markNotificationAsRead called with:', notificationId);
      const response = await api.put(`/notifications/${notificationId}/read`);
      console.log('✅ tlService.markNotificationAsRead response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.markNotificationAsRead error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get assigned leads
   * @returns {Promise<Object>} - Assigned leads
   */
  async getAssignedLeads() {
    try {
      console.log('🌐 tlService.getAssignedLeads called');
      const response = await api.get('/leads/assigned');
      console.log('✅ tlService.getAssignedLeads response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.getAssignedLeads error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get lead assignments
   * @returns {Promise<Object>} - Lead assignments
   */
  async getLeadAssignments() {
    try {
      console.log('🌐 tlService.getLeadAssignments called');
      const response = await api.get('/leads/assignments');
      console.log('✅ tlService.getLeadAssignments response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.getLeadAssignments error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get pending approvals
   * @returns {Promise<Object>} - Pending approvals
   */
  async getPendingApprovals() {
    try {
      console.log('🌐 tlService.getPendingApprovals called');
      const response = await api.get('/leads/pending-approvals');
      console.log('✅ tlService.getPendingApprovals response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tlService.getPendingApprovals error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Export team report
   * @param {string} format - Export format (excel, pdf, csv)
   * @param {Object} filters - Report filters
   * @returns {Promise<Blob>} - Report file
   */
  async exportTeamReport(format = 'excel', filters = {}) {
    try {
      console.log('🌐 tlService.exportTeamReport called with:', format, filters);
      const response = await api.get('/reports/team', {
        params: { ...filters, format },
        responseType: 'blob'
      });
      console.log('✅ tlService.exportTeamReport response received');
      return response.data;
    } catch (error) {
      console.error('❌ tlService.exportTeamReport error:', error);
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
const tlService = new TLService();
export default tlService;