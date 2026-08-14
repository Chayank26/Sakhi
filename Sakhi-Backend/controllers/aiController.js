import { generateAiResponseService } from '../services/aiService.js';

/**
 * POST /api/ai/chat
 * Endpoint for processing Sakhi AI chat interactions
 */
export const chatWithAi = async (req, res) => {
    try {
        const { message } = req.body;

        // Input validation
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message field is required and cannot be empty.'
            });
        }

        const result = await generateAiResponseService({ message: message.trim() });

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
