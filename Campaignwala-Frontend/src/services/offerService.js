import api from './api';

/**
 * Offer Service - Handle all offer-related API calls
 */

/**
 * Get all offers with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (all, Active, Hold, Pending, Completed, Rejected)
 * @param {string} params.category - Filter by category
 * @param {boolean} params.isApproved - Filter by approval status
 * @param {string} params.search - Search term
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.sortBy - Sort field
 * @param {string} params.order - Sort order (asc, desc)
 * @returns {Promise} API response with offers
 */
export const getAllOffers = async (params = {}) => {
  try {
    const response = await api.get('/offers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
};

/**
 * Get offer by ID
 * @param {string} id - Offer ID
 * @returns {Promise} API response with offer data
 */
export const getOfferById = async (id) => {
  try {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching offer:', error);
    throw error;
  }
};

/**
 * Create new offer
 * @param {Object} offerData - Offer data
 * @returns {Promise} API response with created offer
 */
export const createOffer = async (offerData) => {
  try {
    const response = await api.post('/offers', offerData);
    return response.data;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

/**
 * Update existing offer
 * @param {string} id - Offer ID
 * @param {Object} offerData - Updated offer data
 * @returns {Promise} API response with updated offer
 */
export const updateOffer = async (id, offerData) => {
  try {
    const response = await api.put(`/offers/${id}`, offerData);
    return response.data;
  } catch (error) {
    console.error('Error updating offer:', error);
    throw error;
  }
};

/**
 * Delete offer
 * @param {string} id - Offer ID
 * @returns {Promise} API response
 */
export const deleteOffer = async (id) => {
  try {
    const response = await api.delete(`/offers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
};

/**
 * Approve offer
 * @param {string} id - Offer ID
 * @param {string} userId - User ID who is approving
 * @returns {Promise} API response with approved offer
 */
export const approveOffer = async (id, userId = null) => {
  try {
    const response = await api.post(`/offers/${id}/approve`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error approving offer:', error);
    throw error;
  }
};

/**
 * Reject offer
 * @param {string} id - Offer ID
 * @param {string} reason - Rejection reason
 * @returns {Promise} API response with rejected offer
 */
export const rejectOffer = async (id, reason = '') => {
  try {
    const response = await api.post(`/offers/${id}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting offer:', error);
    throw error;
  }
};

/**
 * Get offer statistics
 * @returns {Promise} API response with statistics
 */
export const getOfferStats = async () => {
  try {
    const response = await api.get('/offers/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching offer stats:', error);
    throw error;
  }
};

/**
 * Bulk upload offers
 * @param {Array} offers - Array of offer objects
 * @returns {Promise} API response
 */
export const bulkUploadOffers = async (offers) => {
  try {
    const response = await api.post('/offers/bulk-upload', { offers });
    return response.data;
  } catch (error) {
    console.error('Error bulk uploading offers:', error);
    throw error;
  }
};

/**
 * Get offers by category
 * @param {string} categoryId - Category ID
 * @returns {Promise} API response with offers
 */
export const getOffersByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/offers/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching offers by category:', error);
    throw error;
  }
};

// Default export object with all methods
const offerService = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  approveOffer,
  rejectOffer,
  getOfferStats,
  bulkUploadOffers,
  getOffersByCategory
};

export default offerService;
