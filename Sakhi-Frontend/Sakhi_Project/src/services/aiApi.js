import axios from 'axios';
import { auth } from '../components/pages/firebase/firebase';

const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://sakhi-c0b4.onrender.com/api';
const ROOT_API = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/+$/, '')}/api`;
const API_BASE_URL = `${ROOT_API}/ai`;
// Allows the bounded provider request plus database lookup/persistence to finish.
const aiHttpClient = axios.create({ timeout: 90000 });

const getAuthHeaders = async () => {
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) return {};
    return { Authorization: `Bearer ${await user.getIdToken()}` };
};

/**
 * Send chat message or full conversation history to Sakhi AI Express backend endpoint (POST /api/ai/chat)
 * @param {string|Array} input - Single string message OR array of messages [{ role: 'user'|'assistant', content: string }]
 * @returns {Promise<Object>} Backend response JSON
 */
export const sendChatMessage = async (input, sessionId = null, { signal, clientTurnId } = {}) => {
    try {
        const headers = await getAuthHeaders();
        const payload = Array.isArray(input) ? { messages: input } : { message: input };
        if (sessionId) payload.sessionId = sessionId;
        if (clientTurnId) payload.clientTurnId = clientTurnId;

        const response = await aiHttpClient.post(`${API_BASE_URL}/chat`, payload, { headers, signal });
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export const getAiSessions = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await aiHttpClient.get(`${API_BASE_URL}/sessions`, {
            headers
        });
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export const createAiSession = async ({ signal } = {}) => {
    try {
        const headers = await getAuthHeaders();
        const response = await aiHttpClient.post(`${API_BASE_URL}/sessions`, {}, { headers, signal });
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export const appendAiMessage = async (sessionId, role, content) => {
    try {
        const headers = await getAuthHeaders();
        const response = await aiHttpClient.post(`${API_BASE_URL}/sessions/message`, {
            sessionId,
            role,
            content
        }, { headers });
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export const getAiProfile = async () => {
    const headers = await getAuthHeaders();
    return (await aiHttpClient.get(`${API_BASE_URL}/profile`, { headers })).data;
};
export const saveAiProfile = async (profile) => {
    const headers = await getAuthHeaders();
    return (await aiHttpClient.put(`${API_BASE_URL}/profile`, profile, { headers })).data;
};
export const saveAiFeedback = async (sessionId, messageId, rating) => {
    const headers = await getAuthHeaders();
    return (await aiHttpClient.put(`${API_BASE_URL}/sessions/${sessionId}/messages/${messageId}/feedback`, { rating }, { headers })).data;
};
