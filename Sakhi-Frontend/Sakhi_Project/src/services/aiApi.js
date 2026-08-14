import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/ai';

/**
 * Send chat message or full conversation history to Sakhi AI Express backend endpoint (POST /api/ai/chat)
 * @param {string|Array} input - Single string message OR array of messages [{ role: 'user'|'assistant', content: string }]
 * @returns {Promise<Object>} Backend response JSON
 */
export const sendChatMessage = async (input) => {
    try {
        const payload = Array.isArray(input) ? { messages: input } : { message: input };
        const response = await axios.post(`${API_BASE_URL}/chat`, payload);
        return response.data;
    } catch (error) {
        console.error('Error sending chat message to Sakhi AI backend:', error);
        throw error;
    }
};
