import express from 'express';
import { chatWithAi } from '../controllers/aiController.js';
import { optionalToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/ai/chat
router.post('/chat', optionalToken, chatWithAi);

export default router;
