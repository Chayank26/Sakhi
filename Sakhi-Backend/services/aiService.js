import { callCloudLlm } from '../ai/llm.js';
import { SAKHI_SYSTEM_PROMPT } from '../ai/prompts/sakhiSystemPrompt.js';
import { buildProfileContext } from './aiPersonalizationService.js';

/**
 * Sakhi AI Service Abstraction Layer
 * Isolates AI response generation logic from HTTP controllers and Express routes.
 */

export const normalizeMessages = (messages = []) => {
    if (!Array.isArray(messages)) return [];

    return messages
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: typeof item.content === 'string' ? item.content.trim() : ''
        }))
        .filter((item) => item.content && ['user', 'assistant'].includes(item.role));
};

export const createFallbackAiResponse = (context = '') => ({
    message: context
        ? `I’m here to help with Sakhi jobs, courses, schemes, and support. Could you rephrase your question about “${context.slice(0, 80)}”?`
        : 'I’m here to help with Sakhi jobs, courses, schemes, and support. Please tell me what you want help with.',
    actions: [],
    cards: { jobs: [], courses: [], schemes: [] },
    timestamp: new Date().toISOString()
});

/**
 * Generate AI chat response from user message or conversation history
 * @param {Object} params
 * @param {string} [params.message] - Single user message string
 * @param {Array} [params.messages] - Multi-turn message history array
 * @returns {Promise<Object>} Object containing response message
 */
export const generateAiResponseService = async ({ message, messages, profile = {} }) => {
    const normalizedMessages = normalizeMessages(messages);
    const promptText = typeof message === 'string' ? message.trim() : '';
    const profileContext = buildProfileContext(profile);

    const llmResult = await callCloudLlm({
        prompt: promptText || undefined,
        messages: normalizedMessages.length > 0 ? normalizedMessages : undefined,
        systemInstruction: `${SAKHI_SYSTEM_PROMPT}${profileContext ? `\n\nUSER_PROFILE_CONTEXT:\n${profileContext}` : ''}`
    });

    const replyText = typeof llmResult === 'string'
        ? llmResult
        : (llmResult.text || '');

    if (!replyText) {
        return createFallbackAiResponse(promptText || 'your request');
    }

    const actions = typeof llmResult === 'object' && Array.isArray(llmResult.actions) ? llmResult.actions : [];
    const cards = typeof llmResult === 'object' && llmResult.cards ? llmResult.cards : { jobs: [], courses: [], schemes: [] };

    return {
        message: replyText,
        actions,
        cards,
        timestamp: new Date().toISOString()
    };
};

