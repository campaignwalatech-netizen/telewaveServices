// Change to:
import api from './api';
import { apiHelpers } from './api';
/**
 * Data Service for handling all data-related API calls
 */
const dataService = {
  // ==================== ADMIN DATA OPERATIONS ====================
  
  /**
   * Add bulk data (Admin only)
   * @param {Array} dataArray - Array of data objects with name and contact
   * @param {string} batchName - Optional batch name
   * @returns {Promise}
   */
  async addBulkData(dataArray, batchName = null) {
    try {
      const response = await api.post('/data/admin/bulk-add', {
        dataArray,
        batchName
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add bulk data',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Assign data to TL (Admin only)
   * @param {number} count - Number of data records to assign
   * @param {string} tlId - TL user ID
   * @returns {Promise}
   */
  async assignDataToTL(count, tlId) {
    try {
      const response = await api.post('/data/admin/assign-to-tl', {
        count,
        tlId
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to assign data to TL',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Assign data directly to user (Admin only)
   * @param {number} count - Number of data records to assign
   * @param {string} userId - User ID
   * @returns {Promise}
   */
  async assignDataToUser(count, userId) {
    try {
      const response = await api.post('/data/admin/assign-to-user', {
        count,
        userId
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to assign data to user',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Get pending data (Admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getPendingData(params = {}) {
    try {
      const response = await api.get('/data/admin/pending-data', {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          batchNumber: params.batchNumber,
          ...params
        }
      });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get pending data',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Get batch statistics (Admin only)
   * @param {string} batchNumber - Batch number
   * @returns {Promise}
   */
  async getBatchStats(batchNumber) {
    try {
      const response = await api.get(`/data/admin/batch-stats/${batchNumber}`);
      
      return {
        success: true,
        data: response.data.stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get batch statistics',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Get all batches summary (Admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getAllBatches(params = {}) {
    try {
      const response = await api.get('/data/admin/batches', {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
          ...params
        }
      });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get batches',
        details: error.response?.data
      };
    }
  },
  
  // ==================== TL DATA OPERATIONS ====================
  
  /**
   * Get TL's assigned data
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getTLData(params = {}) {
    try {
      const response = await api.get('/data/tl/data', {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          status: params.status,
          search: params.search,
          sortBy: params.sortBy || 'assignedAt',
          sortOrder: params.sortOrder || 'desc',
          ...params
        }
      });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get TL data',
        details: error.response?.data
      };
    }
  },
  
  /**
   * TL distributes data to team members
   * @param {Array} dataIds - Array of data IDs
   * @param {Array} teamMemberIds - Array of team member IDs
   * @param {string} distributionMethod - Distribution method (manual/auto/equal/performance_based)
   * @returns {Promise}
   */
  async distributeDataToTeam(dataIds, teamMemberIds, distributionMethod = 'manual') {
    try {
      const response = await api.post('/data/tl/distribute', {
        dataIds,
        teamMemberIds,
        distributionMethod
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to distribute data to team',
        details: error.response?.data
      };
    }
  },
  
  /**
   * TL withdraws data from team members
   * @param {Array} dataIds - Array of data IDs
   * @param {Array} teamMemberIds - Array of team member IDs
   * @param {string} reason - Reason for withdrawal
   * @returns {Promise}
   */
  async withdrawDataFromTeam(dataIds, teamMemberIds, reason = '') {
    try {
      const response = await api.post('/data/tl/withdraw', {
        dataIds,
        teamMemberIds,
        reason
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to withdraw data from team',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Get TL statistics
   * @returns {Promise}
   */
  async getTLStatistics() {
    try {
      const response = await api.get('/data/tl/statistics');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get TL statistics',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Get TL's withdrawn data
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getWithdrawnData(params = {}) {
    try {
      const response = await api.get('/data/tl/withdrawn-data', {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          ...params
        }
      });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get withdrawn data',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Get TL's team members
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getTLTeamMembers(params = {}) {
    try {
      const response = await api.get('/data/tl/team-members', {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          status: params.status,
          search: params.search,
          ...params
        }
      });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get team members',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Get data available for distribution (TL only)
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getAvailableDataForDistribution(params = {}) {
    try {
      const response = await api.get('/data/tl/available-data', {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          search: params.search,
          ...params
        }
      });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get available data',
        details: error.response?.data
      };
    }
  },
  
  // ==================== USER DATA OPERATIONS ====================
  
  /**
   * Get user's assigned data
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getUserData(params = {}) {
    try {
      const response = await api.get('/data/user/data', {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          status: params.status,
          search: params.search,
          sortBy: params.sortBy || 'assignedAt',
          sortOrder: params.sortOrder || 'desc',
          ...params
        }
      });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get user data',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Update data status (for users)
   * @param {string} dataId - Data ID
   * @param {string} status - New status (pending/contacted/converted/rejected/not_reachable)
   * @param {string} notes - Optional notes
   * @returns {Promise}
   */
  async updateDataStatus(dataId, status, notes = '') {
    try {
      const response = await api.put('/data/user/update-status', {
        dataId,
        status,
        notes
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update data status',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Get user statistics
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getUserStatistics(params = {}) {
    try {
      const response = await api.get('/data/user/statistics', {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          ...params
        }
      });
      
      return {
        success: true,
        data: response.data.stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get user statistics',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Get user's today's data summary
   * @returns {Promise}
   */
  async getUserTodayData() {
    try {
      const response = await api.get('/data/user/today-data');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get today\'s data',
        details: error.response?.data
      };
    }
  },
  
  // ==================== COMMON DATA OPERATIONS ====================
  
  /**
   * Search data across all statuses
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise}
   */
  async searchData(query, params = {}) {
    try {
      const response = await api.get('/data/search', {
        params: {
          query,
          page: params.page || 1,
          limit: params.limit || 50,
          status: params.status,
          ...params
        }
      });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to search data',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Get data by ID
   * @param {string} dataId - Data ID
   * @returns {Promise}
   */
  async getDataById(dataId) {
    try {
      const response = await api.get(`/data/${dataId}`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get data details',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Export data to CSV
   * @param {Object} params - Filter parameters
   * @returns {Promise}
   */
  async exportDataToCSV(params = {}) {
    try {
      const response = await api.get('/data/export/csv', {
        params,
        responseType: 'blob' // Important for file download
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return {
        success: true,
        message: 'Data exported successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to export data',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Import data from CSV file
   * @param {File} file - CSV file
   * @param {Object} options - Import options
   * @returns {Promise}
   */
  /**
 * Import data from CSV file
 * @param {File} file - CSV file
 * @param {Object} options - Import options
 * @returns {Promise}
 */

async importDataFromCSV(file, options = {}) {
  try {
    const formData = new FormData();
    formData.append('csv', file); // 'csv' should match the field name in multer
    
    // Add batchName if provided
    if (options.batchName) {
      formData.append('batchName', options.batchName);
    }
    
    const token = apiHelpers.getAuthToken(); // Use apiHelpers here
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/data/import/csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // DON'T set Content-Type header - let browser set it with boundary
      },
      body: formData
    });
    
    return await response.json();
  } catch (error) {
    console.error('Import CSV error:', error);
    return {
      success: false,
      error: 'Failed to import CSV data',
      details: error.message
    };
  }
},
  


  /**
   * Get data analytics
   * @param {Object} params - Analytics parameters
   * @returns {Promise}
   */
  async getDataAnalytics(params = {}) {
    try {
      const response = await api.get('/data/analytics', {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          groupBy: params.groupBy || 'day',
          ...params
        }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get analytics',
        details: error.response?.data
      };
    }
  },
  
  // ==================== BATCH OPERATIONS ====================
  
  /**
   * Create a new batch
   * @param {Object} batchData - Batch data
   * @returns {Promise}
   */
  async createBatch(batchData) {
    try {
      const response = await api.post('/data/batches', batchData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create batch',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Update batch
   * @param {string} batchId - Batch ID
   * @param {Object} updateData - Update data
   * @returns {Promise}
   */
  async updateBatch(batchId, updateData) {
    try {
      const response = await api.put(`/data/batches/${batchId}`, updateData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update batch',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Delete batch
   * @param {string} batchId - Batch ID
   * @returns {Promise}
   */
  async deleteBatch(batchId) {
    try {
      const response = await api.delete(`/data/batches/${batchId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete batch',
        details: error.response?.data
      };
    }
  },
  
  /**
   * Get batch details
   * @param {string} batchId - Batch ID
   * @returns {Promise}
   */
  async getBatchDetails(batchId) {
    try {
      const response = await api.get(`/data/batches/${batchId}`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get batch details',
        details: error.response?.data
      };
    }
  },
  
  // ==================== UTILITY FUNCTIONS ====================
  
  /**
   * Validate phone number format
   * @param {string} phone - Phone number
   * @returns {boolean}
   */
  validatePhoneNumber(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  },
  
  /**
   * Format data for display
   * @param {Array} data - Raw data array
   * @returns {Array}
   */
  formatDataForDisplay(data) {
    return data.map(item => ({
      id: item._id,
      name: item.name || 'N/A',
      contact: item.contact || 'N/A',
      status: item.distributionStatus || 'pending',
      assignedTo: item.assignedToInfo?.name || 'Not assigned',
      assignedAt: item.assignedAt ? new Date(item.assignedAt).toLocaleString() : 'N/A',
      createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A',
      batchNumber: item.batchNumber || 'N/A',
      raw: item
    }));
  },
  
  /**
   * Get status color based on status
   * @param {string} status - Status string
   * @returns {string} - CSS color class
   */
  getStatusColor(status) {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'assigned': 'bg-blue-100 text-blue-800',
      'distributed': 'bg-purple-100 text-purple-800',
      'withdrawn': 'bg-red-100 text-red-800',
      'archived': 'bg-gray-100 text-gray-800',
      'converted': 'bg-green-100 text-green-800',
      'contacted': 'bg-indigo-100 text-indigo-800',
      'rejected': 'bg-red-100 text-red-800',
      'not_reachable': 'bg-orange-100 text-orange-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  },
  
  /**
   * Get status label
   * @param {string} status - Status string
   * @returns {string} - Human readable status
   */
  getStatusLabel(status) {
    const statusLabels = {
      'pending': 'Pending',
      'assigned': 'Assigned',
      'distributed': 'Distributed',
      'withdrawn': 'Withdrawn',
      'archived': 'Archived',
      'converted': 'Converted',
      'contacted': 'Contacted',
      'rejected': 'Rejected',
      'not_reachable': 'Not Reachable'
    };
    
    return statusLabels[status] || status;
  },
  
  /**
   * Download data template for import
   */
  downloadTemplate() {
    const templateData = [
      ['Name', 'Contact'],
      ['John Doe', '9876543210'],
      ['Jane Smith', '9876543211'],
      ['Mike Johnson', '9876543212']
    ];
    
    let csvContent = "data:text/csv;charset=utf-8,";
    templateData.forEach(row => {
      csvContent += row.join(",") + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'data-import-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

export default dataService;