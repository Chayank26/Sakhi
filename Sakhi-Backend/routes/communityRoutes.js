import express from 'express';
import {
    getPosts,
    searchPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    uploadPostImage,
    getPostComments,
    addComment,
    updateComment,
    deleteComment,
    likePost,
    unlikePost,
    bookmarkPost,
    unbookmarkPost,
    getSavedPosts,
    createReport
} from '../controllers/communityController.js';
import { verifyToken, optionalToken } from '../middleware/auth.js';
import { imageUpload } from '../middleware/imageUpload.js';

const router = express.Router();

// Public / Optionally Authenticated routes
router.get('/posts', optionalToken, getPosts);
router.get('/posts/search', optionalToken, searchPosts);
router.get('/posts/saved', verifyToken, getSavedPosts);
router.get('/posts/:id', optionalToken, getPostById);
router.get('/posts/:id/comments', optionalToken, getPostComments);

// Protected routes (Requires Firebase Auth token)
router.post('/posts', verifyToken, createPost);
router.put('/posts/:id', verifyToken, updatePost);
router.delete('/posts/:id', verifyToken, deletePost);
router.post('/upload-image', verifyToken, imageUpload.single('image'), uploadPostImage);
router.post('/posts/:id/comments', verifyToken, addComment);
router.put('/comments/:id', verifyToken, updateComment);
router.delete('/comments/:id', verifyToken, deleteComment);

// Like / Upvote routes
router.post('/posts/:id/like', verifyToken, likePost);
router.delete('/posts/:id/like', verifyToken, unlikePost);

// Bookmark / Save routes
router.post('/posts/:id/bookmark', verifyToken, bookmarkPost);
router.delete('/posts/:id/bookmark', verifyToken, unbookmarkPost);

// Moderation / Report routes
router.post('/reports', verifyToken, createReport);

export default router;
