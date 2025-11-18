import api from './api';

/**
 * Slide Service
 * All API calls related to slides management
 */

const slideService = {
    /**
     * Get all slides with filters and pagination
     */
    getAllSlides: async (params = {}) => {
        try {
            const response = await api.get('/slides', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching slides:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Get slide by ID
     */
    getSlideById: async (id) => {
        try {
            const response = await api.get(`/slides/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching slide:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Create new slide
     */
    createSlide: async (slideData) => {
        try {
            const response = await api.post('/slides', slideData);
            return response.data;
        } catch (error) {
            console.error('Error creating slide:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Update slide
     */
    updateSlide: async (id, slideData) => {
        try {
            const response = await api.put(`/slides/${id}`, slideData);
            return response.data;
        } catch (error) {
            console.error('Error updating slide:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Delete slide
     */
    deleteSlide: async (id) => {
        try {
            const response = await api.delete(`/slides/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting slide:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Get slide statistics
     */
    getSlideStats: async () => {
        try {
            const response = await api.get('/slides/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching slide stats:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Update slide order
     */
    updateSlideOrder: async (slides) => {
        try {
            const response = await api.patch('/slides/order/update', { slides });
            return response.data;
        } catch (error) {
            console.error('Error updating slide order:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Increment slide views
     */
    incrementSlideViews: async (id) => {
        try {
            const response = await api.patch(`/slides/${id}/view`);
            return response.data;
        } catch (error) {
            console.error('Error incrementing slide views:', error);
            throw error.response?.data || error;
        }
    }
};

export default slideService;
