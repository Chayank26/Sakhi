import { AiChatSession } from '../models/AiChatSession.js';
import { buildSessionContext, generateSessionTitle } from '../services/aiSessionService.js';
import mongoose from 'mongoose';

export const createAiSession = async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication is required.' });
        }

        const session = await AiChatSession.create({
            userId,
            title: 'New conversation',
            messages: []
        });

        return res.status(201).json({ success: true, session });
    } catch (error) {
        console.error('[AI Session Controller]: createAiSession failed', error);
        return res.status(500).json({ success: false, message: 'Failed to create AI session.' });
    }
};

export const getAiSessions = async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication is required.' });
        }

        const sessions = await AiChatSession.find({ userId }).sort({ lastActiveAt: -1 }).limit(20);
        return res.json({ success: true, sessions });
    } catch (error) {
        console.error('[AI Session Controller]: getAiSessions failed', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch AI sessions.' });
    }
};

export const appendAiMessage = async (req, res) => {
    try {
        const { sessionId, role, content } = req.body;

        if (!sessionId || !role || !content || !['user', 'assistant'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid session payload.' });
        }

        if (!req.user?.uid) {
            return res.status(401).json({ success: false, message: 'Authentication is required.' });
        }

        if (!mongoose.isValidObjectId(sessionId)) {
            return res.status(400).json({ success: false, message: 'Invalid session ID.' });
        }

        const session = await AiChatSession.findOne({ _id: sessionId, userId: req.user.uid });
        if (!session) {
            return res.status(404).json({ success: false, message: 'AI session not found.' });
        }

        const trimmed = String(content).trim();
        if (!trimmed) {
            return res.status(400).json({ success: false, message: 'Message content is required.' });
        }

        session.messages.push({ role, content: trimmed, createdAt: new Date() });

        if (role === 'user' && session.messages.length === 1) {
            session.title = generateSessionTitle(trimmed);
        }

        session.lastActiveAt = new Date();
        await session.save();

        return res.json({
            success: true,
            session,
            context: buildSessionContext(session.messages, 12)
        });
    } catch (error) {
        console.error('[AI Session Controller]: appendAiMessage failed', error);
        return res.status(500).json({ success: false, message: 'Failed to save AI message.' });
    }
};
