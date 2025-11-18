import api from './api';

/**
 * Category Service - Handle all category-related API calls
 */

/**
 * Get all categories with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (all, active, inactive)
 * @param {string} params.search - Search term
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.sortBy - Sort field
 * @param {string} params.order - Sort order (asc, desc)
 * @returns {Promise} API response with categories
 */
export const getAllCategories = async (params = {}) => {
  try {
    const response = await api.get('/categories', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Promise} API response with category data
 */
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

/**
 * Create new category
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.name - Category name
 * @param {string} categoryData.description - Category description
 * @param {string} categoryData.earnUpto - Earning information
 * @param {string} categoryData.icon - Icon name (optional)
 * @param {string} categoryData.iconImage - Icon image URL or base64 (optional)
 * @param {string} categoryData.status - Status (active/inactive)
 * @returns {Promise} API response with created category
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Update existing category
 * @param {string} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise} API response with updated category
 */
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete category
 * @param {string} id - Category ID
 * @returns {Promise} API response
 */
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Get category statistics
 * @returns {Promise} API response with statistics
 */
export const getCategoryStats = async () => {
  try {
    const response = await api.get('/categories/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching category stats:', error);
    throw error;
  }
};

/**
 * Convert image file to base64 string
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 encoded image
 */
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const categoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  convertImageToBase64
};

export default categoryService;
