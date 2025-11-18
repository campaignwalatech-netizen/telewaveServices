import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Query Service
 * Handles all user query management API calls
 */
class QueryService {
  /**
   * Get all queries with filters
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {string} params.priority - Filter by priority
   * @param {string} params.category - Filter by category
   * @param {string} params.search - Search query
   * @param {string} params.user - Filter by user name
   * @param {string} params.email - Filter by email
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.order - Sort order
   * @returns {Promise<Object>} - Queries list response
   */
  async getAllQueries(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_BASE_URL}/queries?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching queries:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Get query by ID
   * @param {string} queryId - Query ID
   * @returns {Promise<Object>} - Query details
   */
  async getQueryById(queryId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/queries/${queryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching query:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Create new query
   * @param {Object} data - Query data
   * @param {string} data.user - User name
   * @param {string} data.userId - User ID (optional)
   * @param {string} data.email - User email
   * @param {string} data.subject - Query subject
   * @param {string} data.message - Query message
   * @param {string} data.priority - Priority level
   * @param {string} data.category - Query category
   * @returns {Promise<Object>} - Created query
   */
  async createQuery(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/queries`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating query:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Update query
   * @param {string} queryId - Query ID
   * @param {Object} data - Updated query data
   * @returns {Promise<Object>} - Updated query
   */
  async updateQuery(queryId, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/queries/${queryId}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating query:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Delete query
   * @param {string} queryId - Query ID
   * @returns {Promise<Object>} - Delete confirmation
   */
  async deleteQuery(queryId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/queries/${queryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting query:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Add reply to query
   * @param {string} queryId - Query ID
   * @param {Object} data - Reply data
   * @param {string} data.message - Reply message
   * @param {string} data.repliedBy - Admin user ID
   * @param {string} data.repliedByName - Admin name
   * @returns {Promise<Object>} - Updated query with reply
   */
  async addReply(queryId, data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/queries/${queryId}/reply`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Update query status
   * @param {string} queryId - Query ID
   * @param {string} status - New status (Open, Replied, Closed)
   * @returns {Promise<Object>} - Updated query
   */
  async updateQueryStatus(queryId, status) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/queries/${queryId}/status`, 
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating query status:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Get query statistics
   * @returns {Promise<Object>} - Query stats
   */
  async getQueryStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/queries/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching query stats:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Get queries by user email
   * @param {string} email - User email
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - User queries
   */
  async getQueriesByEmail(email, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_BASE_URL}/queries/email/${email}?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user queries:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Bulk delete queries
   * @param {Array} ids - Array of query IDs
   * @returns {Promise<Object>} - Delete confirmation
   */
  async bulkDeleteQueries(ids) {
    try {
      const response = await axios.post(`${API_BASE_URL}/queries/bulk-delete`, 
        { ids },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting queries:', error);
      throw error.response?.data || error.message;
    }
  }
}

// Export singleton instance
const queryService = new QueryService();
export default queryService;
