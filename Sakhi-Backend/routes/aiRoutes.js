import express from 'express';
import { chatWithAi } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/chat
router.post('/chat', chatWithAi);

export default router;
