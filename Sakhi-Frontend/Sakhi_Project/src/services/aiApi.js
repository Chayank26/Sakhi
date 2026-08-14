import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/ai';

/**
 * Send chat message to Sakhi AI Express backend endpoint (POST /api/ai/chat)
 * @param {string} message - User query
 * @returns {Promise<Object>} Backend response JSON
 */
export const sendChatMessage = async (message) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/chat`, { message });
        return response.data;
    } catch (error) {
        console.error('Error sending chat message to Sakhi AI backend:', error);
        throw error;
    }
};
