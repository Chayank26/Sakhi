import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/schemes';

/**
 * Fetch schemes list with filtering, sorting, and pagination
 */
export const fetchSchemes = async (params = {}) => {
    try {
        const response = await axios.get(API_BASE_URL, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching government schemes:', error);
        throw error;
    }
};

/**
 * Search schemes by keyword
 */
export const searchSchemes = async (query = '', params = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/search`, {
            params: { q: query, ...params }
        });
        return response.data;
    } catch (error) {
        console.error(`Error searching schemes for "${query}":`, error);
        throw error;
    }
};

/**
 * Fetch single scheme details by ID
 */
export const fetchSchemeById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching scheme ${id}:`, error);
        throw error;
    }
};

/**
 * Sakhi AI Integration Helpers
 */
export const fetchAiSchemeContext = async (category = '') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ai/context`, {
            params: { category: category || undefined }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching AI scheme context:', error);
        throw error;
    }
};

export const checkSchemeEligibility = async (schemeId, userProfile = {}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/ai/check-eligibility`, {
            schemeId,
            userProfile
        });
        return response.data;
    } catch (error) {
        console.error(`Error evaluating eligibility for scheme ${schemeId}:`, error);
        throw error;
    }
};

export const fetchRecommendedSchemes = async (userProfile = {}, limit = 5) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/ai/recommend`, {
            userProfile,
            limit
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching scheme recommendations:', error);
        throw error;
    }
};
