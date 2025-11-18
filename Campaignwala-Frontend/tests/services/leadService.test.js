import leadService from '@/services/leadService';
import api from '@/services/api';
import { vi } from 'vitest';

// Mock the api module
vi.mock('@/services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

describe('leadService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllLeads', () => {
    it('should fetch all leads successfully', async () => {
      const responseData = { data: [] };
      api.get.mockResolvedValue({ data: responseData });
      const result = await leadService.getAllLeads();
      expect(api.get).toHaveBeenCalledWith('/leads', { params: {} });
      expect(result).toEqual(responseData);
    });
  });

  describe('getLeadById', () => {
    it('should fetch a lead by ID successfully', async () => {
      const leadId = '1';
      const responseData = { data: { id: leadId } };
      api.get.mockResolvedValue({ data: responseData });
      const result = await leadService.getLeadById(leadId);
      expect(api.get).toHaveBeenCalledWith(`/leads/${leadId}`);
      expect(result).toEqual(responseData);
    });
  });

  describe('createLead', () => {
    it('should create a new lead successfully', async () => {
      const leadData = { name: 'New Lead' };
      const responseData = { data: { id: '1', ...leadData } };
      api.post.mockResolvedValue({ data: responseData });
      const result = await leadService.createLead(leadData);
      expect(api.post).toHaveBeenCalledWith('/leads', leadData);
      expect(result).toEqual(responseData);
    });
  });

  describe('updateLeadStatus', () => {
    it('should update a lead status successfully', async () => {
      const leadId = '1';
      const statusData = { status: 'Contacted' };
      const responseData = { data: { id: leadId, ...statusData } };
      api.put.mockResolvedValue({ data: responseData });
      const result = await leadService.updateLeadStatus(leadId, statusData);
      expect(api.put).toHaveBeenCalledWith(`/leads/${leadId}`, statusData);
      expect(result).toEqual(responseData);
    });
  });

  describe('deleteLead', () => {
    it('should delete a lead successfully', async () => {
      const leadId = '1';
      const responseData = { message: 'Lead deleted' };
      api.delete.mockResolvedValue({ data: responseData });
      const result = await leadService.deleteLead(leadId);
      expect(api.delete).toHaveBeenCalledWith(`/leads/${leadId}`);
      expect(result).toEqual(responseData);
    });
  });

  // ... more tests for approve, reject, stats, analytics, etc.

});
