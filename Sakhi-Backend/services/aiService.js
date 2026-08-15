import { callCloudLlm } from '../ai/llm.js';
import { SAKHI_SYSTEM_PROMPT } from '../ai/prompts/sakhiSystemPrompt.js';

/**
 * Sakhi AI Service Abstraction Layer
 * Isolates AI response generation logic from HTTP controllers and Express routes.
 */

/**
 * Generate AI chat response from user message or conversation history
 * @param {Object} params
 * @param {string} [params.message] - Single user message string
 * @param {Array} [params.messages] - Multi-turn message history array
 * @returns {Promise<Object>} Object containing response message
 */
export const generateAiResponseService = async ({ message, messages }) => {
    const llmResult = await callCloudLlm({
        prompt: message,
        messages: Array.isArray(messages) && messages.length > 0 ? messages : undefined,
        systemInstruction: SAKHI_SYSTEM_PROMPT
    });

    const replyText = typeof llmResult === 'string' ? llmResult : (llmResult.text || '');
    const actions = typeof llmResult === 'object' && Array.isArray(llmResult.actions) ? llmResult.actions : [];

    return {
        message: replyText,
        actions,
        timestamp: new Date().toISOString()
    };
};
