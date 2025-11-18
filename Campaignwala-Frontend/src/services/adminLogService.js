const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Admin Log Service
 * Handles all admin activity log API calls
 */
class AdminLogService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/adminlogs`;
  }

  /**
   * Get authorization headers
   */
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  /**
   * Get all admin logs with filters
   * @param {Object} params - Query parameters
   * @param {string} params.severity - Filter by severity (info, success, warning, error)
   * @param {string} params.actionType - Filter by action type
   * @param {string} params.module - Filter by module
   * @param {string} params.status - Filter by status
   * @param {string} params.adminId - Filter by admin ID
   * @param {string} params.search - Search term
   * @param {string} params.startDate - Start date for filtering
   * @param {string} params.endDate - End date for filtering
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (asc/desc)
   * @returns {Promise<Object>} - Admin logs list response
   */
  async getAllAdminLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.severity) queryParams.append('severity', params.severity);
      if (params.actionType) queryParams.append('actionType', params.actionType);
      if (params.module) queryParams.append('module', params.module);
      if (params.status) queryParams.append('status', params.status);
      if (params.adminId) queryParams.append('adminId', params.adminId);
      if (params.search) queryParams.append('search', params.search);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${this.baseURL}?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch admin logs');
      }

      return data;
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      throw error;
    }
  }

  /**
   * Get admin log by ID
   * @param {string} logId - Log ID
   * @returns {Promise<Object>} - Admin log details
   */
  async getAdminLogById(logId) {
    try {
      const response = await fetch(`${this.baseURL}/${logId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch admin log');
      }

      return data;
    } catch (error) {
      console.error('Error fetching admin log:', error);
      throw error;
    }
  }

  /**
   * Create admin log entry
   * @param {Object} logData - Log data
   * @param {string} logData.adminId - Admin user ID
   * @param {string} logData.adminName - Admin name
   * @param {string} logData.adminRole - Admin role
   * @param {string} logData.action - Action description
   * @param {string} logData.actionType - Type of action
   * @param {string} logData.module - Module affected
   * @param {string} logData.severity - Severity level
   * @param {string} logData.ipAddress - IP address
   * @param {string} logData.userAgent - User agent
   * @param {string} logData.details - Detailed description
   * @param {Object} logData.metadata - Additional metadata
   * @param {string} logData.targetId - Target entity ID
   * @param {string} logData.targetType - Target entity type
   * @param {string} logData.status - Action status
   * @param {string} logData.errorMessage - Error message if failed
   * @returns {Promise<Object>} - Created log
   */
  async createAdminLog(logData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(logData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin log');
      }

      return data;
    } catch (error) {
      console.error('Error creating admin log:', error);
      throw error;
    }
  }

  /**
   * Delete admin log
   * @param {string} logId - Log ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteAdminLog(logId) {
    try {
      const response = await fetch(`${this.baseURL}/${logId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete admin log');
      }

      return data;
    } catch (error) {
      console.error('Error deleting admin log:', error);
      throw error;
    }
  }

  /**
   * Get admin log statistics
   * @returns {Promise<Object>} - Statistics data
   */
  async getAdminLogStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch statistics');
      }

      return data;
    } catch (error) {
      console.error('Error fetching admin log stats:', error);
      throw error;
    }
  }

  /**
   * Get logs by admin ID
   * @param {string} adminId - Admin user ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Admin logs for specific admin
   */
  async getLogsByAdminId(adminId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${this.baseURL}/admin/${adminId}?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch admin logs');
      }

      return data;
    } catch (error) {
      console.error('Error fetching logs by admin ID:', error);
      throw error;
    }
  }

  /**
   * Bulk delete admin logs
   * @param {Array<string>} ids - Array of log IDs to delete
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async bulkDeleteAdminLogs(ids) {
    try {
      const response = await fetch(`${this.baseURL}/bulk-delete`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ ids })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete logs');
      }

      return data;
    } catch (error) {
      console.error('Error bulk deleting admin logs:', error);
      throw error;
    }
  }

  /**
   * Clear old logs
   * @param {number} days - Delete logs older than this many days
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async clearOldLogs(days = 90) {
    try {
      const response = await fetch(`${this.baseURL}/clear-old`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ days })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear old logs');
      }

      return data;
    } catch (error) {
      console.error('Error clearing old logs:', error);
      throw error;
    }
  }

  /**
   * Export logs to CSV (client-side implementation)
   * @param {Array} logs - Array of log objects
   * @returns {string} - CSV string
   */
  exportToCSV(logs) {
    if (!logs || logs.length === 0) {
      return '';
    }

    // CSV Headers
    const headers = ['ID', 'Admin', 'Action', 'Timestamp', 'IP Address', 'Severity', 'Details'];
    
    // Convert logs to CSV rows
    const rows = logs.map(log => [
      log.logId || log._id,
      log.adminName,
      log.action,
      new Date(log.createdAt).toLocaleString(),
      log.ipAddress,
      log.severity,
      log.details || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Download logs as CSV file
   * @param {Array} logs - Array of log objects
   * @param {string} filename - Filename for download
   */
  downloadCSV(logs, filename = 'admin-logs.csv') {
    const csvContent = this.exportToCSV(logs);
    
    if (!csvContent) {
      console.warn('No logs to export');
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Export singleton instance
const adminLogService = new AdminLogService();
export default adminLogService;
