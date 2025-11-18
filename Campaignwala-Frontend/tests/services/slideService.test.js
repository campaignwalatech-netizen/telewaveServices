
import slideService from '../../../src/services/slideService';
import api from '../../../src/services/api';

// Mock the api module
jest.mock('../../../src/services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}));

describe('slideService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for getAllSlides
  describe('getAllSlides', () => {
    it('should fetch all slides successfully', async () => {
      const responseData = [{ id: '1', title: 'Slide 1' }];
      api.get.mockResolvedValue({ data: responseData });

      const result = await slideService.getAllSlides();

      expect(api.get).toHaveBeenCalledWith('/slides', { params: {} });
      expect(result).toEqual(responseData);
    });
  });

  // Test for getSlideById
  describe('getSlideById', () => {
    it('should fetch a slide by ID successfully', async () => {
      const slideId = '1';
      const responseData = { id: slideId, title: 'Slide 1' };
      api.get.mockResolvedValue({ data: responseData });

      const result = await slideService.getSlideById(slideId);

      expect(api.get).toHaveBeenCalledWith(`/slides/${slideId}`);
      expect(result).toEqual(responseData);
    });
  });

  // Test for createSlide
  describe('createSlide', () => {
    it('should create a new slide successfully', async () => {
      const slideData = { title: 'New Slide', content: 'Content' };
      const responseData = { id: '2', ...slideData };
      api.post.mockResolvedValue({ data: responseData });

      const result = await slideService.createSlide(slideData);

      expect(api.post).toHaveBeenCalledWith('/slides', slideData);
      expect(result).toEqual(responseData);
    });
  });

  // Test for updateSlide
  describe('updateSlide', () => {
    it('should update a slide successfully', async () => {
      const slideId = '1';
      const slideData = { title: 'Updated Slide' };
      const responseData = { id: slideId, ...slideData };
      api.put.mockResolvedValue({ data: responseData });

      const result = await slideService.updateSlide(slideId, slideData);

      expect(api.put).toHaveBeenCalledWith(`/slides/${slideId}`, slideData);
      expect(result).toEqual(responseData);
    });
  });

  // Test for deleteSlide
  describe('deleteSlide', () => {
    it('should delete a slide successfully', async () => {
      const slideId = '1';
      const responseData = { message: 'Slide deleted' };
      api.delete.mockResolvedValue({ data: responseData });

      const result = await slideService.deleteSlide(slideId);

      expect(api.delete).toHaveBeenCalledWith(`/slides/${slideId}`);
      expect(result).toEqual(responseData);
    });
  });

  // Test for updateSlideOrder
  describe('updateSlideOrder', () => {
    it('should update the order of slides successfully', async () => {
      const slides = [{ id: '1', order: 1 }, { id: '2', order: 0 }];
      const responseData = { message: 'Order updated' };
      api.patch.mockResolvedValue({ data: responseData });

      const result = await slideService.updateSlideOrder(slides);

      expect(api.patch).toHaveBeenCalledWith('/slides/order/update', { slides });
      expect(result).toEqual(responseData);
    });
  });

  // Test for incrementSlideViews
  describe('incrementSlideViews', () => {
    it('should increment the view count of a slide', async () => {
      const slideId = '1';
      const responseData = { message: 'View count updated' };
      api.patch.mockResolvedValue({ data: responseData });

      const result = await slideService.incrementSlideViews(slideId);

      expect(api.patch).toHaveBeenCalledWith(`/slides/${slideId}/view`);
      expect(result).toEqual(responseData);
    });
  });

});
