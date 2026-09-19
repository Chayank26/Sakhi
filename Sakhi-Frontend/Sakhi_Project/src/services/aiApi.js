import axios from 'axios';

const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://sakhi-c0b4.onrender.com/api';
const ROOT_API = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/+$/, '')}/api`;
const API_BASE_URL = `${ROOT_API}/ai`;

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

export const getAiSessions = async (userId = 'guest-user') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/sessions`, {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Sakhi AI sessions:', error);
        throw error;
    }
};

export const createAiSession = async (userId = 'guest-user') => {
    try {
        const response = await axios.post(`${API_BASE_URL}/sessions`, { userId });
        return response.data;
    } catch (error) {
        console.error('Error creating Sakhi AI session:', error);
        throw error;
    }
};

export const appendAiMessage = async (sessionId, role, content) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/sessions/message`, {
            sessionId,
            role,
            content
        });
        return response.data;
    } catch (error) {
        console.error('Error saving Sakhi AI message:', error);
        throw error;
    }
};
