
import offerService, { getAllOffers, getOfferById, createOffer, updateOffer, deleteOffer, approveOffer, rejectOffer, getOfferStats, bulkUploadOffers, getOffersByCategory } from '../../../src/services/offerService';
import api from '../../../src/services/api';

// Mock the api module
jest.mock('../../../src/services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('offerService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOffers', () => {
    it('should fetch all offers successfully', async () => {
      const responseData = { data: [] };
      api.get.mockResolvedValue({ data: responseData });
      const result = await getAllOffers();
      expect(api.get).toHaveBeenCalledWith('/offers', { params: {} });
      expect(result).toEqual(responseData);
    });
  });

  describe('getOfferById', () => {
    it('should fetch an offer by ID successfully', async () => {
      const offerId = '1';
      const responseData = { data: { id: offerId } };
      api.get.mockResolvedValue({ data: responseData });
      const result = await getOfferById(offerId);
      expect(api.get).toHaveBeenCalledWith(`/offers/${offerId}`);
      expect(result).toEqual(responseData);
    });
  });

  describe('createOffer', () => {
    it('should create a new offer successfully', async () => {
      const offerData = { title: 'New Offer' };
      const responseData = { data: { id: '1', ...offerData } };
      api.post.mockResolvedValue({ data: responseData });
      const result = await createOffer(offerData);
      expect(api.post).toHaveBeenCalledWith('/offers', offerData);
      expect(result).toEqual(responseData);
    });
  });

  describe('updateOffer', () => {
    it('should update an offer successfully', async () => {
      const offerId = '1';
      const offerData = { title: 'Updated Offer' };
      const responseData = { data: { id: offerId, ...offerData } };
      api.put.mockResolvedValue({ data: responseData });
      const result = await updateOffer(offerId, offerData);
      expect(api.put).toHaveBeenCalledWith(`/offers/${offerId}`, offerData);
      expect(result).toEqual(responseData);
    });
  });

  describe('deleteOffer', () => {
    it('should delete an offer successfully', async () => {
      const offerId = '1';
      const responseData = { message: 'Offer deleted' };
      api.delete.mockResolvedValue({ data: responseData });
      const result = await deleteOffer(offerId);
      expect(api.delete).toHaveBeenCalledWith(`/offers/${offerId}`);
      expect(result).toEqual(responseData);
    });
  });

  // ... more tests for approve, reject, stats, bulk upload, etc.

});
