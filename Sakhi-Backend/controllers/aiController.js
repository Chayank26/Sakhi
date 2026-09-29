import { loadAiProfile } from './aiProfileController.js';
import { publicAiSession } from '../services/aiSessionPresentation.js';
import { evaluateResponseQuality } from '../services/aiFeedbackEvalService.js';
import { buildSessionContext, generateSessionTitle } from '../services/aiSessionService.js';
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
export const createChatHandler = ({ Session = AiChatSession, generateResponse = generateAiResponseService, loadProfile = loadAiProfile } = {}) => async (req, res) => {
    const requestId = randomUUID();
    const cancellation = new AbortController();
    const onClose = () => { if (!res.writableEnded) cancellation.abort(); };
    res.on?.('close', onClose);

    try {
        const { sessionId, clientTurnId } = req.body || {};
        if (clientTurnId !== undefined && (typeof clientTurnId !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(clientTurnId))) {
            return res.status(400).json({ success: false, message: 'Invalid chat request identifier.' });
        }
        const { hasValidMessagesArray, hasValidSingleMessage, normalizedMessage, normalizedMessages } = normalizeChatInput(req.body || {});

        if (!hasValidMessagesArray && !hasValidSingleMessage) {
            console.warn(`[AI Controller]: Invalid request payload received. requestId=${requestId}`);
            return res.status(400).json({
                success: false,
                message: 'Request payload must include a non-empty "message" string or a valid "messages" array.',
                requestId
            });
        }

        let message = normalizedMessage;
        let messages = buildSessionContext(normalizedMessages);
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

            session = await Session.findOne({ _id: sessionId, userId: req.user.uid });
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

            const previousReply = clientTurnId && session.messages.find((entry) => entry.role === 'assistant' && entry.turnId === clientTurnId);
            if (previousReply) {
                const previousQuestion = session.messages.find((entry) => entry.role === 'user' && entry.turnId === clientTurnId);
                if (previousQuestion?.content !== message) return res.status(409).json({ success: false, message: 'This request identifier belongs to a different message.' });
                return res.json({ success: true, session: publicAiSession(session), message: previousReply.content,
                    cards: previousReply.cards, actions: previousReply.actions, requestId });
            }
            messages = buildSessionContext([
                ...session.messages,
                { role: 'user', content: message }
            ]);
        }

        console.info(`[AI Controller]: Processing AI request. requestId=${requestId}, messageCount=${messages?.length || 1}, sessionId=${sessionId || 'none'}`);

        const profile = await loadProfile(req.user?.uid);
        if (cancellation.signal.aborted) return;
        const result = await generateResponse({ message, messages, profile, signal: cancellation.signal });
        if (cancellation.signal.aborted) return;
        const quality = result.quality || evaluateResponseQuality({ answer: result.message,
            query: message || normalizedMessages?.at(-1)?.content,
            recommendationCount: Object.values(result.cards || {}).reduce((sum, records) => sum + (Array.isArray(records) ? records.length : 0), 0) });
        console.info(`[AI Quality]: requestId=${requestId}, score=${quality.score}, rating=${quality.quality}`);

        if (session) {
            const turns = [
                { role: 'user', content: message, turnId: clientTurnId, createdAt: new Date() },
                { role: 'assistant', content: result.message, turnId: clientTurnId, quality,
                    actions: result.actions || [], cards: result.cards || { jobs: [], courses: [], schemes: [] }, createdAt: new Date() }
            ];
            const firstTurn = !session.messages.some((entry) => entry.role === 'user');
            if (clientTurnId) {
                // Atomic deduplication handles retries even if the original response was lost.
                session = await Session.findOneAndUpdate({ _id: sessionId, userId: req.user.uid, 'messages.turnId': { $ne: clientTurnId } }, {
                    $push: { messages: { $each: turns } },
                    $set: { lastActiveAt: new Date(), ...(firstTurn ? { title: generateSessionTitle(message) } : {}) }
                }, { new: true, runValidators: true }) || await Session.findOne({ _id: sessionId, userId: req.user.uid });
                if (!session) return res.status(404).json({ success: false, message: 'AI session not found.' });
            } else {
                if (firstTurn) session.title = generateSessionTitle(message);
                session.messages.push(...turns);
                session.lastActiveAt = new Date();
                await session.save();
            }
        }

        if (cancellation.signal.aborted) return;
        if (session && clientTurnId) {
            const savedQuestion = session.messages.find((entry) => entry.role === 'user' && entry.turnId === clientTurnId);
            const savedReply = session.messages.find((entry) => entry.role === 'assistant' && entry.turnId === clientTurnId);
            if (savedQuestion?.content !== message) return res.status(409).json({ success: false, message: 'This request identifier belongs to a different message.' });
            if (savedReply) Object.assign(result, { message: savedReply.content, actions: savedReply.actions, cards: savedReply.cards });
        }
        res.json({
            success: true,
            session: publicAiSession(session),
            message: result.message,
            actions: result.actions || [],
            cards: result.cards || { jobs: [], courses: [], schemes: [] },
            timestamp: result.timestamp,
            requestId
        });
    } catch (error) {
        if (cancellation.signal.aborted) return;
        console.error('[API] Request failed.', { requestId: req.requestId });
        const statusCode = error.statusCode || 500;
        if (error.retryAfter) res.set('Retry-After', String(error.retryAfter));
        res.status(statusCode).json({
            success: false,
            message: statusCode >= 500 ? 'Sakhi AI is temporarily unavailable. Please retry.' : error.message || 'Unable to process this request.',
            retryAfter: error.retryAfter,
            requestId
        });
    } finally {
        res.off?.('close', onClose);
    }
};

export const chatWithAi = createChatHandler();
