import api from './api';

const leadService = {
  // ==================== ORIGINAL LEAD SERVICES ====================

  // Get all leads
  getAllLeads: async (params = {}) => {
    try {
      const response = await api.get('/leads', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get lead by ID
  getLeadById: async (id) => {
    try {
      const response = await api.get(`/leads/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new lead (from shared link)
  createLead: async (leadData) => {
    try {
      const response = await api.post('/leads', leadData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update lead status
  updateLeadStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/leads/${id}`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete lead
  deleteLead: async (id) => {
    try {
      const response = await api.delete(`/leads/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get lead statistics
  getLeadStats: async (hrUserId = null) => {
    try {
      const params = hrUserId ? { hrUserId } : {};
      const response = await api.get('/leads/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Approve lead
  approveLead: async (id) => {
    try {
      const response = await api.post(`/leads/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reject lead
  rejectLead: async (id, rejectionReason = '') => {
    try {
      const response = await api.post(`/leads/${id}/reject`, { rejectionReason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get analytics data
  getLeadAnalytics: async (params = {}) => {
    try {
      console.log('🔌 [API SERVICE] Calling /leads/analytics with params:', params);
      const response = await api.get('/leads/analytics', { params });
      console.log('🔌 [API SERVICE] Analytics response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API SERVICE] Analytics error:', error);
      console.error('❌ [API SERVICE] Error response:', error.response?.data);
      throw error.response?.data || error;
    }
  },

  // Get all users for dropdown
  getAllUsers: async () => {
    try {
      console.log('🔌 [API SERVICE] Calling /leads/users');
      const response = await api.get('/leads/users');
      console.log('🔌 [API SERVICE] Users response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API SERVICE] Users error:', error);
      console.error('❌ [API SERVICE] Error response:', error.response?.data);
      throw error.response?.data || error;
    }
  },

  // Bulk upload leads
  bulkUploadLeads: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/leads/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== ADMIN LEAD DISTRIBUTION SERVICES ====================

  // Get users for lead distribution
  getUsersForDistribution: async (distributionType = 'all_active') => {
    try {
      const response = await api.get('/leads/admin/distribution/users', {
        params: { distributionType }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Team Leaders for distribution
  getTeamLeadersForDistribution: async () => {
    try {
      const response = await api.get('/leads/admin/distribution/tls');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get available leads for distribution
  getLeadsForDistribution: async (params = {}) => {
    try {
      const response = await api.get('/leads/admin/distribution/available', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Distribute leads (Admin)
  distributeLeads: async (distributionData) => {
    try {
      const response = await api.post('/admin/leads/distribute', distributionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Withdraw leads from user (Admin)
  withdrawLeadsFromUser: async (userId, leadIds) => {
    try {
      const response = await api.post(`/admin/users/${userId}/withdraw-leads`, { leadIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get lead distribution report
  getLeadDistributionReport: async (params = {}) => {
    try {
      const response = await api.get('/leads/admin/distribution/report', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== TL LEAD DISTRIBUTION SERVICES ====================

  // Distribute leads to team (TL)
  distributeLeadsToTeam: async (distributionData) => {
    try {
      const response = await api.post('/tl/leads/distribute', distributionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Withdraw leads from team member (TL)
  withdrawLeadsFromTeamMember: async (userId, leadIds) => {
    try {
      const response = await api.post(`/tl/users/${userId}/withdraw-leads`, { leadIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get team leads (TL)
  getTeamLeads: async (params = {}) => {
    try {
      const response = await api.get('/leads/tl/team', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== USER LEAD SERVICES ====================

  // Get user's lead statistics
  getUserLeadStats: async () => {
    try {
      const response = await api.get('/leads/user/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user's lead details
  getUserLeadDetails: async (leadId) => {
    try {
      const response = await api.get(`/leads/user/${leadId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user's today leads
  getUserTodaysLeads: async () => {
    try {
      const response = await api.get('/my-leads/today');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Start working on a lead
  startLead: async (leadId) => {
    try {
      const response = await api.post(`/my-leads/${leadId}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Complete a lead
  completeLead: async (leadId, remarks = '') => {
    try {
      const response = await api.post(`/my-leads/${leadId}/complete`, { remarks });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== USER DASHBOARD SERVICES ====================

  // Get user dashboard statistics
  getUserDashboard: async () => {
    try {
      const response = await api.get('/dashboard/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user attendance
  getUserAttendance: async () => {
    try {
      const response = await api.get('/today-attendance');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark attendance
  markAttendance: async (status = 'present') => {
    try {
      const response = await api.post('/mark-attendance', { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get attendance history
  getAttendanceHistory: async (params = {}) => {
    try {
      const response = await api.get('/attendance-history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== USER WALLET SERVICES ====================

  // Get wallet balance
  getWalletBalance: async () => {
    try {
      const response = await api.get('/wallet');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== USER KYC SERVICES ====================

  // Get KYC details
  getKYCDetails: async () => {
    try {
      const response = await api.get('/kyc');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update KYC details
  updateKYCDetails: async (kycData) => {
    try {
      const response = await api.put('/kyc', kycData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Submit KYC for approval
  submitKYC: async (kycData) => {
    try {
      const response = await api.post('/kyc/submit', kycData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Request KYC approval
  requestKYCApproval: async () => {
    try {
      const response = await api.post('/kyc/request-approval');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== USER QUERY SERVICES ====================

  // Rise query
  riseQuery: async (queryData) => {
    try {
      const response = await api.post('/queries', queryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== ADMIN DASHBOARD SERVICES ====================

  // Get admin dashboard
  getAdminDashboard: async () => {
    try {
      const response = await api.get('/dashboard/admin');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get admin attendance report
  getAdminAttendanceReport: async (params = {}) => {
    try {
      const response = await api.get('/admin/attendance/report', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== ADMIN USER MANAGEMENT SERVICES ====================

  // Get all users with filters
  getAllUsersWithFilters: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get users by status
  getUsersByStatus: async (status, params = {}) => {
    try {
      const response = await api.get(`/admin/users/status/${status}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Approve user registration
  approveUserRegistration: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark user as Hold
  markUserHold: async (userId, reason = '', holdUntil = null) => {
    try {
      const response = await api.post(`/admin/users/${userId}/hold`, { reason, holdUntil });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark user as Active
  markUserActive: async (userId, reason = '') => {
    try {
      const response = await api.post(`/admin/users/${userId}/active`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Block user
  blockUser: async (userId, reason = '') => {
    try {
      const response = await api.post(`/admin/users/${userId}/block`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change user role
  changeUserRole: async (userId, newRole, reason = '') => {
    try {
      const response = await api.post(`/admin/users/${userId}/change-role`, { newRole, reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update TL permissions
  updateTLPermissions: async (userId, permissions) => {
    try {
      const response = await api.put(`/admin/users/${userId}/tl-permissions`, { permissions });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Toggle user status
  toggleUserStatus: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark user as Ex
  markUserAsEx: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/mark-ex`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Bulk upload users
  bulkUploadUsers: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/admin/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== ADMIN KYC SERVICES ====================

  // Get pending KYC requests
  getPendingKYCRequests: async (params = {}) => {
    try {
      const response = await api.get('/admin/kyc/pending', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get KYC details by user ID
  getKYCDetailsByUserId: async (userId) => {
    try {
      const response = await api.get(`/admin/kyc/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Approve KYC
  approveKYC: async (userId, remarks = '') => {
    try {
      const response = await api.put(`/admin/kyc/${userId}/approve`, { remarks });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reject KYC
  rejectKYC: async (userId, reason) => {
    try {
      const response = await api.put(`/admin/kyc/${userId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== TL DASHBOARD SERVICES ====================

  // Get TL dashboard
  getTLDashboard: async () => {
    try {
      const response = await api.get('/dashboard/tl');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get team attendance
  getTeamAttendance: async () => {
    try {
      const response = await api.get('/tl/team-attendance');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== TL TEAM MANAGEMENT SERVICES ====================

  // Get team members
  getTeamMembers: async () => {
    try {
      const response = await api.get('/tl/team-members');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add team member
  addTeamMember: async (memberId) => {
    try {
      const response = await api.post('/tl/team-members', { memberId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Remove team member
  removeTeamMember: async (memberId) => {
    try {
      const response = await api.delete(`/tl/team-members/${memberId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get team performance
  getTeamPerformance: async () => {
    try {
      const response = await api.get('/tl/team-performance');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== PROFILE SERVICES ====================

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== AUTHENTICATION SERVICES ====================

  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify registration OTP
  verifyRegistrationOTP: async (otpData) => {
    try {
      const response = await api.post('/verify-registration', otpData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify login OTP
  verifyLoginOTP: async (otpData) => {
    try {
      const response = await api.post('/verify-login', otpData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin login
  adminLogin: async (credentials) => {
    try {
      const response = await api.post('/admin-login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // TL login
  tlLogin: async (credentials) => {
    try {
      const response = await api.post('/tl-login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reset password
  resetPassword: async (resetData) => {
    try {
      const response = await api.post('/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.post('/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== EMAIL OTP SERVICES ====================

  // Send email OTP
  sendEmailOTP: async (purpose) => {
    try {
      const response = await api.post('/send-email-otp', { purpose });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify email OTP
  verifyEmailOTP: async (otp) => {
    try {
      const response = await api.post('/verify-email-otp', { otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== LEGACY SERVICES ====================

  // Send OTP (legacy)
  sendOTP: async (phoneNumber) => {
    try {
      const response = await api.post('/send-otp', { phoneNumber });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all users with stats
  getAllUsersWithStats: async (params = {}) => {
    try {
      const response = await api.get('/admin/users-with-stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Export users
  exportUsers: async (format = 'excel') => {
    try {
      const response = await api.get('/admin/export-users', { params: { format } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user stats
  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default leadService;