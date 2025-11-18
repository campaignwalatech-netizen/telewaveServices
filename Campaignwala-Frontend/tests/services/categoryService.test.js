import categoryService, { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, getCategoryStats, convertImageToBase64 } from '@/services/categoryService';
import api from '@/services/api';
import { vi } from 'vitest';

// Mock the api module
vi.mock('@/services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

describe('categoryService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should fetch all categories successfully', async () => {
      const responseData = { data: [] };
      api.get.mockResolvedValue({ data: responseData });
      const result = await getAllCategories();
      expect(api.get).toHaveBeenCalledWith('/categories', { params: {} });
      expect(result).toEqual(responseData);
    });
  });

  describe('getCategoryById', () => {
    it('should fetch a category by ID successfully', async () => {
      const categoryId = '1';
      const responseData = { data: { id: categoryId } };
      api.get.mockResolvedValue({ data: responseData });
      const result = await getCategoryById(categoryId);
      expect(api.get).toHaveBeenCalledWith(`/categories/${categoryId}`);
      expect(result).toEqual(responseData);
    });
  });

  describe('createCategory', () => {
    it('should create a new category successfully', async () => {
      const categoryData = { name: 'New Category' };
      const responseData = { data: { id: '1', ...categoryData } };
      api.post.mockResolvedValue({ data: responseData });
      const result = await createCategory(categoryData);
      expect(api.post).toHaveBeenCalledWith('/categories', categoryData);
      expect(result).toEqual(responseData);
    });
  });

  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      const categoryId = '1';
      const categoryData = { name: 'Updated Category' };
      const responseData = { data: { id: categoryId, ...categoryData } };
      api.put.mockResolvedValue({ data: responseData });
      const result = await updateCategory(categoryId, categoryData);
      expect(api.put).toHaveBeenCalledWith(`/categories/${categoryId}`, categoryData);
      expect(result).toEqual(responseData);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category successfully', async () => {
      const categoryId = '1';
      const responseData = { message: 'Category deleted' };
      api.delete.mockResolvedValue({ data: responseData });
      const result = await deleteCategory(categoryId);
      expect(api.delete).toHaveBeenCalledWith(`/categories/${categoryId}`);
      expect(result).toEqual(responseData);
    });
  });

  describe('convertImageToBase64', () => {
    it('should convert an image file to a base64 string', async () => {
      const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
      const result = await convertImageToBase64(file);
      expect(result).toMatch(/^data:image\/png;base64,/);
    });
  });

});
