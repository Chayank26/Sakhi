import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { AiChatSession } from '../models/AiChatSession.js';
import { summarizeResponseSignals } from '../services/aiFeedbackEvalService.js';

try {
    if (!await connectDB()) process.exitCode = 1;
    else {
        const sessions = await AiChatSession.find({}).sort({ lastActiveAt: -1 }).limit(500).select('messages._id messages.role messages.quality messages.feedback').lean();
        const reviewCandidates = sessions.flatMap((session) => session.messages
            .filter((message) => message.role === 'assistant' && (message.feedback?.rating === 'down' || message.quality?.score < 85))
            .map((message) => ({ sessionId: session._id, messageId: message._id, score: message.quality?.score, feedback: message.feedback?.rating }))).slice(0, 100);
        console.log(JSON.stringify({ sampledSessions: sessions.length, ...summarizeResponseSignals(sessions.flatMap((session) => session.messages)), reviewCandidates }, null, 2));
    }
} finally {
    await mongoose.disconnect();
}
