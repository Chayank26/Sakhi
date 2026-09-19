import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { AiChatSession } from '../models/AiChatSession.js';
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
        const { sessionId } = req.body || {};
        const { hasValidMessagesArray, hasValidSingleMessage, normalizedMessage, normalizedMessages } = normalizeChatInput(req.body);

        if (!hasValidMessagesArray && !hasValidSingleMessage) {
            console.warn(`[AI Controller]: Invalid request payload received. requestId=${requestId}`);
            return res.status(400).json({
                success: false,
                message: 'Request payload must include a non-empty "message" string or a valid "messages" array.',
                requestId
            });
        }

        let message = normalizedMessage;
        let messages = normalizedMessages;
        let session;

        if (sessionId) {
            if (!req.user?.uid) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication is required for persisted AI sessions.',
                    requestId
                });
            }

            if (!mongoose.isValidObjectId(sessionId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid session ID.',
                    requestId
                });
            }

            session = await AiChatSession.findOne({ _id: sessionId, userId: req.user.uid });
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'AI session not found.',
                    requestId
                });
            }

            message = normalizedMessage || [...normalizedMessages].reverse().find((entry) => entry.role === 'user')?.content;
            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'A user message is required for an AI session.',
                    requestId
                });
            }

            messages = [
                ...session.messages.map((entry) => ({ role: entry.role, content: entry.content })),
                { role: 'user', content: message }
            ];
        }

        console.info(`[AI Controller]: Processing AI request. requestId=${requestId}, messageCount=${messages?.length || 1}, sessionId=${sessionId || 'none'}`);

        const result = await generateAiResponseService({
            message,
            messages
        });

        if (session) {
            session.messages.push(
                { role: 'user', content: message, createdAt: new Date() },
                { role: 'assistant', content: result.message, createdAt: new Date() }
            );
            session.lastActiveAt = new Date();
            await session.save();
        }

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
