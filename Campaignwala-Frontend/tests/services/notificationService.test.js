
import axios from 'axios';
import notificationService from '../../../src/services/notificationService';

// Mock axios
jest.mock('axios');

describe('notificationService', () => {
  const token = 'test-token';
  const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  beforeEach(() => {
    localStorage.setItem('token', token);
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.removeItem('token');
  });

  // Test for sendNotification
  describe('sendNotification', () => {
    it('should send a notification successfully', async () => {
      const notificationData = { title: 'Test', message: 'Hello' };
      const responseData = { data: { id: '1', ...notificationData } };
      axios.post.mockResolvedValue({ data: responseData });

      const result = await notificationService.sendNotification(notificationData);

      expect(axios.post).toHaveBeenCalledWith(`${API_BASE_URL}/notifications/send`, notificationData, expect.any(Object));
      expect(result).toEqual(responseData);
    });
  });

  // Test for getAllNotifications
  describe('getAllNotifications', () => {
    it('should fetch all notifications successfully', async () => {
      const responseData = { data: [] };
      axios.get.mockResolvedValue({ data: responseData });

      const result = await notificationService.getAllNotifications();

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/notifications?`, expect.any(Object));
      expect(result).toEqual(responseData);
    });
  });

  // Test for getNotificationById
  describe('getNotificationById', () => {
    it('should fetch a notification by ID successfully', async () => {
      const notificationId = '1';
      const responseData = { data: { id: notificationId } };
      axios.get.mockResolvedValue({ data: responseData });

      const result = await notificationService.getNotificationById(notificationId);

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/notifications/${notificationId}`, expect.any(Object));
      expect(result).toEqual(responseData);
    });
  });

  // Test for deleteNotification
  describe('deleteNotification', () => {
    it('should delete a notification successfully', async () => {
      const notificationId = '1';
      const responseData = { message: 'Notification deleted' };
      axios.delete.mockResolvedValue({ data: responseData });

      const result = await notificationService.deleteNotification(notificationId);

      expect(axios.delete).toHaveBeenCalledWith(`${API_BASE_URL}/notifications/${notificationId}`, expect.any(Object));
      expect(result).toEqual(responseData);
    });
  });

  // ... more tests for bulkDelete, stats, etc.
});
