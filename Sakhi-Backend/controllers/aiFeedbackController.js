import mongoose from 'mongoose';
import { AiChatSession } from '../models/AiChatSession.js';

export const createFeedbackHandler = (Session = AiChatSession) => async (req, res) => {
    const { sessionId, messageId } = req.params;
    const rating = req.body?.rating;
    if (!req.user?.uid) return res.status(401).json({ success: false, message: 'Sign in to save feedback.' });
    if (![sessionId, messageId].every((id) => mongoose.isValidObjectId(id)) || !['up', 'down', null].includes(rating)) {
        return res.status(400).json({ success: false, message: 'Invalid feedback.' });
    }
    try {
        const result = await Session.updateOne({ _id: sessionId, userId: req.user.uid,
            messages: { $elemMatch: { _id: messageId, role: 'assistant' } } }, {
            $set: { 'messages.$.feedback': { rating, updatedAt: new Date() } }
        });
        if (!result.matchedCount) return res.status(404).json({ success: false, message: 'Response not found.' });
        return res.json({ success: true, messageId, rating });
    } catch {
        return res.status(503).json({ success: false, message: 'Feedback could not be saved. Please try again.' });
    }
};
export const saveAiFeedback = createFeedbackHandler();
