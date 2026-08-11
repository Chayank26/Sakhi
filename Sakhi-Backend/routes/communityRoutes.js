import express from 'express';
import {
    getPosts,
    searchPosts,
    getPostById,
    createPost,
    uploadPostImage,
    getPostComments,
    addComment,
    updateComment,
    deleteComment,
    likePost,
    unlikePost
} from '../controllers/communityController.js';
import { verifyToken, optionalToken } from '../middleware/auth.js';
import { imageUpload } from '../middleware/imageUpload.js';

const router = express.Router();

// Public / Optionally Authenticated routes
router.get('/posts', optionalToken, getPosts);
router.get('/posts/search', optionalToken, searchPosts);
router.get('/posts/:id', optionalToken, getPostById);
router.get('/posts/:id/comments', optionalToken, getPostComments);

// Protected routes (Requires Firebase Auth token)
router.post('/posts', verifyToken, createPost);
router.post('/upload-image', verifyToken, imageUpload.single('image'), uploadPostImage);
router.post('/posts/:id/comments', verifyToken, addComment);
router.put('/comments/:id', verifyToken, updateComment);
router.delete('/comments/:id', verifyToken, deleteComment);

// Like / Upvote routes
router.post('/posts/:id/like', verifyToken, likePost);
router.delete('/posts/:id/like', verifyToken, unlikePost);

export default router;
