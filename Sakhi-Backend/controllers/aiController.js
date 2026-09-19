import { randomUUID } from 'crypto';
import { generateAiResponseService } from '../services/aiService.js';

const normalizeChatInput = (payload = {}) => {
    const { message, messages } = payload;

    const hasValidMessagesArray = Array.isArray(messages) && messages.length > 0 && messages.every(
        (entry) => entry && typeof entry.content === 'string' && entry.content.trim() && (entry.role === 'user' || entry.role === 'assistant')
    );

    const hasValidSingleMessage = typeof message === 'string' && message.trim().length > 0;

    return {
        hasValidMessagesArray,
        hasValidSingleMessage,
        normalizedMessage: hasValidSingleMessage ? message.trim() : undefined,
        normalizedMessages: hasValidMessagesArray ? messages.map((entry) => ({
            role: entry.role,
            content: entry.content.trim()
        })) : undefined
    };
};

/**
 * POST /api/ai/chat
 * Endpoint for processing Sakhi AI chat interactions
 */
export const chatWithAi = async (req, res) => {
    const requestId = randomUUID();

    try {
        const { hasValidMessagesArray, hasValidSingleMessage, normalizedMessage, normalizedMessages } = normalizeChatInput(req.body);

        if (!hasValidMessagesArray && !hasValidSingleMessage) {
            console.warn(`[AI Controller]: Invalid request payload received. requestId=${requestId}`);
            return res.status(400).json({
                success: false,
                message: 'Request payload must include a non-empty "message" string or a valid "messages" array.',
                requestId
            });
        }

        console.info(`[AI Controller]: Processing AI request. requestId=${requestId}, messageCount=${normalizedMessages?.length || 1}`);

        const result = await generateAiResponseService({
            message: normalizedMessage,
            messages: normalizedMessages
        });

        res.json({
            success: true,
            message: result.message,
            actions: result.actions || [],
            cards: result.cards || { jobs: [], courses: [], schemes: [] },
            timestamp: result.timestamp,
            requestId
        });
    } catch (error) {
        console.error(`[AI Controller Error]: Failed to process chat request. requestId=${requestId}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'An error occurred while processing your AI request.',
            error: error.message,
            requestId
        });
    }
};
