import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
    createAiSession,
    getAiSessions,
    appendAiMessage
} from '../controllers/aiSessionController.js';

const router = express.Router();

router.post('/sessions', verifyToken, createAiSession);
router.get('/sessions', verifyToken, getAiSessions);
router.post('/sessions/message', verifyToken, appendAiMessage);

export default router;
