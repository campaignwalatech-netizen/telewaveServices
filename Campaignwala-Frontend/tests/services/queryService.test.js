
import axios from 'axios';
import queryService from '../../../src/services/queryService';

// Mock axios
jest.mock('axios');

describe('queryService', () => {
  const token = 'test-token';
  const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  beforeEach(() => {
    localStorage.setItem('token', token);
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.removeItem('token');
  });

  // Test for getAllQueries
  describe('getAllQueries', () => {
    it('should fetch all queries successfully', async () => {
      const responseData = { data: [] };
      axios.get.mockResolvedValue({ data: responseData });

      const result = await queryService.getAllQueries();

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/queries?`, expect.any(Object));
      expect(result).toEqual(responseData);
    });
  });

  // Test for getQueryById
  describe('getQueryById', () => {
    it('should fetch a query by ID successfully', async () => {
      const queryId = '1';
      const responseData = { data: { id: queryId } };
      axios.get.mockResolvedValue({ data: responseData });

      const result = await queryService.getQueryById(queryId);

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/queries/${queryId}`, expect.any(Object));
      expect(result).toEqual(responseData);
    });
  });

  // Test for createQuery
  describe('createQuery', () => {
    it('should create a new query successfully', async () => {
      const queryData = { subject: 'Test' };
      const responseData = { data: { id: '1', ...queryData } };
      axios.post.mockResolvedValue({ data: responseData });

      const result = await queryService.createQuery(queryData);

      expect(axios.post).toHaveBeenCalledWith(`${API_BASE_URL}/queries`, queryData, expect.any(Object));
      expect(result).toEqual(responseData);
    });
  });

  // Test for updateQuery
  describe('updateQuery', () => {
    it('should update a query successfully', async () => {
      const queryId = '1';
      const queryData = { status: 'Closed' };
      const responseData = { data: { id: queryId, ...queryData } };
      axios.put.mockResolvedValue({ data: responseData });

      const result = await queryService.updateQuery(queryId, queryData);

      expect(axios.put).toHaveBeenCalledWith(`${API_BASE_URL}/queries/${queryId}`, queryData, expect.any(Object));
      expect(result).toEqual(responseData);
    });
  });

  // Test for deleteQuery
  describe('deleteQuery', () => {
    it('should delete a query successfully', async () => {
      const queryId = '1';
      const responseData = { message: 'Query deleted' };
      axios.delete.mockResolvedValue({ data: responseData });

      const result = await queryService.deleteQuery(queryId);

      expect(axios.delete).toHaveBeenCalledWith(`${API_BASE_URL}/queries/${queryId}`, expect.any(Object));
      expect(result).toEqual(responseData);
    });
  });

  // ... more tests for addReply, updateQueryStatus, etc.
});
