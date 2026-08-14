import { generateAiResponseService } from '../services/aiService.js';

/**
 * POST /api/ai/chat
 * Endpoint for processing Sakhi AI chat interactions
 */
export const chatWithAi = async (req, res) => {
    try {
        const { message, messages } = req.body;

        // Input validation: Must have either valid messages array or non-empty message string
        const hasValidMessagesArray = Array.isArray(messages) && messages.length > 0 && messages.every(
            (m) => m && typeof m.content === 'string' && m.content.trim() && (m.role === 'user' || m.role === 'assistant')
        );

        const hasValidSingleMessage = typeof message === 'string' && message.trim().length > 0;

        if (!hasValidMessagesArray && !hasValidSingleMessage) {
            return res.status(400).json({
                success: false,
                message: 'Request payload must include a non-empty "message" string or a valid "messages" array.'
            });
        }

        const result = await generateAiResponseService({
            message: hasValidSingleMessage ? message.trim() : undefined,
            messages: hasValidMessagesArray ? messages : undefined
        });

        res.json({
            success: true,
            message: result.message,
            timestamp: result.timestamp
        });
    } catch (error) {
        console.error('[AI Controller Error]: Failed to process chat request:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'An error occurred while processing your AI request.',
            error: error.message
        });
    }
};
