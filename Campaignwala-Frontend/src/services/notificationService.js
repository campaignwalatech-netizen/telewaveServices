import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Notification Service
 * Handles all notification management API calls
 */
class NotificationService {
  /**
   * Send notification to users
   * @param {Object} data - Notification data
   * @param {string} data.type - Notification type (profile, offer, announcement, system)
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {Array} data.recipients - Array of user IDs or ['all']
   * @param {Array} data.targetSegments - Target segments
   * @param {Object} data.offerDetails - Offer details (for offer type)
   * @param {string} data.filterBy - Filter criteria (all, incomplete, active, inactive)
   * @param {string} data.searchQuery - Search query
   * @param {Array} data.selectedUserIds - Selected user IDs
   * @returns {Promise<Object>} - Send notification response
   */
  async sendNotification(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/notifications/send`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Get all notifications with filters
   * @param {Object} params - Query parameters
   * @param {string} params.type - Filter by type (all, profile, offer, announcement, system)
   * @param {string} params.status - Filter by status (all, pending, sent, failed)
   * @param {string} params.search - Search query
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.order - Sort order (asc, desc)
   * @returns {Promise<Object>} - Notifications list response
   */
  async getAllNotifications(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_BASE_URL}/notifications?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Get notification by ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Notification details
   */
  async getNotificationById(notificationId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Delete confirmation
   */
  async deleteNotification(notificationId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Bulk delete notifications
   * @param {Array} ids - Array of notification IDs
   * @returns {Promise<Object>} - Delete confirmation
   */
  async bulkDeleteNotifications(ids) {
    try {
      const response = await axios.post(`${API_BASE_URL}/notifications/bulk-delete`, 
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
      console.error('Error bulk deleting notifications:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Get notification statistics
   * @returns {Promise<Object>} - Notification stats
   */
  async getNotificationStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Get user notifications (for end users)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - User notifications
   */
  async getUserNotifications(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_BASE_URL}/notifications/user?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Mark notification as read (client-side only, using localStorage)
   * @param {string} notificationId - Notification ID
   */
  markNotificationAsRead(notificationId) {
    try {
      const readNotifications = this.getReadNotifications();
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read (client-side only, using localStorage)
   * @param {Array} notificationIds - Array of notification IDs
   */
  markAllNotificationsAsRead(notificationIds) {
    try {
      const readNotifications = this.getReadNotifications();
      notificationIds.forEach(id => {
        if (!readNotifications.includes(id)) {
          readNotifications.push(id);
        }
      });
      localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Get list of read notification IDs from localStorage
   * @returns {Array} - Array of read notification IDs
   */
  getReadNotifications() {
    try {
      const stored = localStorage.getItem('readNotifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading read notifications:', error);
      return [];
    }
  }

  /**
   * Check if a notification is read
   * @param {string} notificationId - Notification ID
   * @returns {boolean} - True if notification is read
   */
  isNotificationRead(notificationId) {
    const readNotifications = this.getReadNotifications();
    return readNotifications.includes(notificationId);
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
