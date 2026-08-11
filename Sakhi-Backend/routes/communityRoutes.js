import express from 'express';
import { getPosts, getPostById, createPost } from '../controllers/communityController.js';
import { verifyToken, optionalToken } from '../middleware/auth.js';

const router = express.Router();

// Public / Optionally Authenticated routes
router.get('/posts', optionalToken, getPosts);
router.get('/posts/:id', optionalToken, getPostById);

// Protected routes (Requires Firebase Auth token)
router.post('/posts', verifyToken, createPost);

export default router;
