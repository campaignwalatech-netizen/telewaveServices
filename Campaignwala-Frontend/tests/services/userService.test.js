
import userService from '../../../src/services/userService';
import api from '../../../src/services/api';

// Mock the api module
jest.mock('../../../src/services/api', () => ({
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('userService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for getAllUsers
  describe('getAllUsers', () => {
    it('should fetch all users successfully', async () => {
      const params = { page: 1, limit: 10 };
      const responseData = { data: { users: [], pagination: {} } };
      api.get.mockResolvedValue({ data: responseData });

      const result = await userService.getAllUsers(params);

      expect(api.get).toHaveBeenCalledWith('/users', { params });
      expect(result).toEqual(responseData);
    });

    it('should handle errors when fetching users', async () => {
        const error = { response: { data: { message: 'Error fetching users' } } };
        api.get.mockRejectedValue(error);
  
        await expect(userService.getAllUsers()).rejects.toEqual({ message: 'Error fetching users' });
      });
  });

  // Test for getUserById
  describe('getUserById', () => {
    it('should fetch a user by ID successfully', async () => {
      const userId = '1';
      const responseData = { data: { id: userId, name: 'Test User' } };
      api.get.mockResolvedValue({ data: responseData });

      const result = await userService.getUserById(userId);

      expect(api.get).toHaveBeenCalledWith(`/users/${userId}`);
      expect(result).toEqual(responseData);
    });

    it('should handle errors when fetching a user by ID', async () => {
        const userId = '1';
        const error = { response: { data: { message: 'User not found' } } };
        api.get.mockRejectedValue(error);
  
        await expect(userService.getUserById(userId)).rejects.toEqual({ message: 'User not found' });
      });
  });

  // Test for updateUser
  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const userId = '1';
      const userData = { name: 'Updated Name' };
      const responseData = { data: { id: userId, ...userData } };
      api.put.mockResolvedValue({ data: responseData });

      const result = await userService.updateUser(userId, userData);

      expect(api.put).toHaveBeenCalledWith(`/users/${userId}`, userData);
      expect(result).toEqual(responseData);
    });
  });

  // Test for deleteUser
  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const userId = '1';
      const responseData = { message: 'User deleted' };
      api.delete.mockResolvedValue({ data: responseData });

      const result = await userService.deleteUser(userId);

      expect(api.delete).toHaveBeenCalledWith(`/users/${userId}`);
      expect(result).toEqual(responseData);
    });
  });

  // Add more tests for other methods like updateUserRole, toggleUserStatus, KYC methods, etc.

});
