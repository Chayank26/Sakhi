import { aiProfileHandlers } from '../controllers/aiProfileController.js';
import { saveAiFeedback } from '../controllers/aiFeedbackController.js';
import { requireDatabase } from '../config/db.js';
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
    createAiSession,
    getAiSessions,
    appendAiMessage
} from '../controllers/aiSessionController.js';

const router = express.Router();

router.post('/sessions', verifyToken, requireDatabase, createAiSession);
router.get('/sessions', verifyToken, requireDatabase, getAiSessions);
router.post('/sessions/message', verifyToken, requireDatabase, appendAiMessage);

router.get('/profile', verifyToken, requireDatabase, aiProfileHandlers.get);
router.put('/profile', verifyToken, requireDatabase, aiProfileHandlers.put);
router.put('/sessions/:sessionId/messages/:messageId/feedback', verifyToken, requireDatabase, saveAiFeedback);

export default router;
