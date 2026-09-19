import express from 'express';
import {
    createAiSession,
    getAiSessions,
    appendAiMessage
} from '../controllers/aiSessionController.js';

const router = express.Router();

router.post('/sessions', createAiSession);
router.get('/sessions', getAiSessions);
router.post('/sessions/message', appendAiMessage);

export default router;
