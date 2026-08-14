import { callCloudLlm } from '../ai/llm.js';

/**
 * Sakhi AI Service Abstraction Layer
 * Isolates AI response generation logic from HTTP controllers and Express routes.
 */

/**
 * Generate AI chat response from user message
 * @param {Object} params
 * @param {string} params.message - The incoming message string from the user
 * @returns {Promise<Object>} Object containing response message
 */
export const generateAiResponseService = async ({ message }) => {
    const replyText = await callCloudLlm({ prompt: message });

    return {
        message: replyText,
        timestamp: new Date().toISOString()
    };
};
