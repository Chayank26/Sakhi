import { aiLimiter } from '../middleware/security.js';
import { requireDatabase } from '../config/db.js';
import express from 'express';
import { chatWithAi } from '../controllers/aiController.js';
import { optionalToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/ai/chat
router.post('/chat', aiLimiter, optionalToken, (req, res, next) => req.body?.sessionId ? requireDatabase(req, res, next) : next(), chatWithAi);

export default router;
