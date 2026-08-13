import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import { uploadImageToStorage } from '../services/uploadService.js';

/**
 * GET /api/community/posts
 * Fetch posts with search, category filtering, sorting, and pagination
 */
export const getPosts = async (req, res) => {
    try {
        const { q, category, sortBy = 'latest', page = 1, limit = 10 } = req.query;

        const queryConditions = {};

        // Category filter
        if (category && category !== 'All') {
            queryConditions.category = category;
        }

        // Search query filter (Regex search on title and content)
        if (q && q.trim() !== '') {
            const searchRegex = new RegExp(q.trim(), 'i');
            queryConditions.$or = [
                { title: searchRegex },
                { content: searchRegex },
                { category: searchRegex }
            ];
        }

        // Sorting configuration
        let sortOption = { createdAt: -1 }; // default latest
        if (sortBy === 'popular') {
            // Sort by likes array size descending
            sortOption = { likesCount: -1, createdAt: -1 };
        } else if (sortBy === 'commented') {
            sortOption = { commentsCount: -1, createdAt: -1 };
        } else if (sortBy === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Fetch posts from MongoDB
        const rawPosts = await Post.find(queryConditions)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalPosts = await Post.countDocuments(queryConditions);
        const currentUserId = req.user?.uid;

        // Format post objects with calculated flags (isLiked, isBookmarked, likesCount)
        const posts = rawPosts.map((post) => {
            const likesArr = post.likes || [];
            const bookmarksArr = post.bookmarks || [];

            return {
                id: post._id.toString(),
                author: post.author,
                title: post.title,
                content: post.content,
                category: post.category,
                imageUrl: post.imageUrl || null,
                likesCount: likesArr.length,
                commentsCount: post.commentsCount || 0,
                isLiked: currentUserId ? likesArr.includes(currentUserId) : false,
                isBookmarked: currentUserId ? bookmarksArr.includes(currentUserId) : false,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            };
        });

        res.json({
            success: true,
            posts,
            totalPosts,
            page: pageNum,
            totalPages: Math.ceil(totalPosts / limitNum) || 1
        });
    } catch (error) {
        console.error('[Community Controller] Error fetching posts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching community posts.',
            error: error.message
        });
    }
};

/**
 * GET /api/community/posts/search
 * Search community posts by query, category, and sorting
 */
export const searchPosts = async (req, res) => {
    try {
        const { q = '', category, sortBy = 'latest', page = 1, limit = 10 } = req.query;

        const queryConditions = {};

        // Category filter
        if (category && category !== 'All') {
            queryConditions.category = category;
        }

        // Regex search matching title, content, or category
        if (q && q.trim() !== '') {
            const searchRegex = new RegExp(q.trim(), 'i');
            queryConditions.$or = [
                { title: searchRegex },
                { content: searchRegex },
                { category: searchRegex }
            ];
        }

        // Sorting option
        let sortOption = { createdAt: -1 };
        if (sortBy === 'popular') {
            sortOption = { likesCount: -1, createdAt: -1 };
        } else if (sortBy === 'commented') {
            sortOption = { commentsCount: -1, createdAt: -1 };
        } else if (sortBy === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        const rawPosts = await Post.find(queryConditions)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalPosts = await Post.countDocuments(queryConditions);
        const currentUserId = req.user?.uid;

        const posts = rawPosts.map((post) => {
            const likesArr = post.likes || [];
            const bookmarksArr = post.bookmarks || [];
            return {
                id: post._id.toString(),
                author: post.author,
                title: post.title,
                content: post.content,
                category: post.category,
                imageUrl: post.imageUrl || null,
                likesCount: likesArr.length,
                commentsCount: post.commentsCount || 0,
                isLiked: currentUserId ? likesArr.includes(currentUserId) : false,
                isBookmarked: currentUserId ? bookmarksArr.includes(currentUserId) : false,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            };
        });

        res.json({
            success: true,
            query: q,
            category: category || 'All',
            sortBy,
            posts,
            totalPosts,
            page: pageNum,
            totalPages: Math.ceil(totalPosts / limitNum) || 1
        });
    } catch (error) {
        console.error('[Community Controller] Error searching posts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching community posts.',
            error: error.message
        });
    }
};

/**
 * GET /api/community/posts/:id
 * Get single post details by ID
 */
export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id).lean();

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        const currentUserId = req.user?.uid;
        const likesArr = post.likes || [];
        const bookmarksArr = post.bookmarks || [];

        const formattedPost = {
            id: post._id.toString(),
            author: post.author,
            title: post.title,
            content: post.content,
            category: post.category,
            imageUrl: post.imageUrl || null,
            likesCount: likesArr.length,
            commentsCount: post.commentsCount || 0,
            isLiked: currentUserId ? likesArr.includes(currentUserId) : false,
            isBookmarked: currentUserId ? bookmarksArr.includes(currentUserId) : false,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        };

        res.json({
            success: true,
            post: formattedPost
        });
    } catch (error) {
        console.error('[Community Controller] Error fetching post by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching post.',
            error: error.message
        });
    }
};

/**
 * POST /api/community/posts
 * Create a new community post (Protected)
 */
export const createPost = async (req, res) => {
    try {
        const { title, content, category, imageUrl } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Post title is required.'
            });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Post content is required.'
            });
        }

        const authenticatedUser = req.user;

        const newPost = new Post({
            author: {
                uid: authenticatedUser.uid,
                name: authenticatedUser.name || 'Sakhi Member',
                email: authenticatedUser.email || '',
                avatar: authenticatedUser.avatar || null,
                role: authenticatedUser.role || 'Community Member'
            },
            title: title.trim(),
            content: content.trim(),
            category: category || 'General Discussion',
            imageUrl: imageUrl || null,
            likes: [],
            bookmarks: [],
            commentsCount: 0
        });

        const savedPost = await newPost.save();

        res.status(201).json({
            success: true,
            message: 'Community post created successfully!',
            post: {
                id: savedPost._id.toString(),
                author: savedPost.author,
                title: savedPost.title,
                content: savedPost.content,
                category: savedPost.category,
                imageUrl: savedPost.imageUrl,
                likesCount: 0,
                commentsCount: 0,
                isLiked: false,
                isBookmarked: false,
                createdAt: savedPost.createdAt,
                updatedAt: savedPost.updatedAt
            }
        });
    } catch (error) {
        console.error('[Community Controller] Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create post.',
            error: error.message
        });
    }
};

/**
 * POST /api/community/upload-image
 * Upload image attachment for community post (Protected)
 */
export const uploadPostImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file uploaded.'
            });
        }

        const imageUrl = await uploadImageToStorage(req.file, req);

        res.json({
            success: true,
            message: 'Image uploaded successfully!',
            imageUrl
        });
    } catch (error) {
        console.error('[Community Controller] Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process image upload.'
        });
    }
};

/**
 * GET /api/community/posts/:id/comments
 * Fetch comments for a specific post
 */
export const getPostComments = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const rawComments = await Comment.find({ post: postId }).sort({ createdAt: 1 }).lean();
        const currentUserId = req.user?.uid;

        const comments = rawComments.map((c) => ({
            id: c._id.toString(),
            postId: c.post.toString(),
            author: c.author,
            content: c.content,
            likesCount: c.likes ? c.likes.length : 0,
            isLiked: currentUserId && c.likes ? c.likes.includes(currentUserId) : false,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }));

        res.json({
            success: true,
            comments,
            totalComments: comments.length
        });
    } catch (error) {
        console.error('[Community Controller] Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch post comments.',
            error: error.message
        });
    }
};

/**
 * POST /api/community/posts/:id/comments
 * Add a new comment to a post (Protected)
 */
export const addComment = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Comment content cannot be empty.'
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Target post not found.'
            });
        }

        const authenticatedUser = req.user;

        const newComment = new Comment({
            post: postId,
            author: {
                uid: authenticatedUser.uid,
                name: authenticatedUser.name || 'Sakhi Member',
                email: authenticatedUser.email || '',
                avatar: authenticatedUser.avatar || null,
                role: authenticatedUser.role || 'Community Member'
            },
            content: content.trim(),
            likes: []
        });

        const savedComment = await newComment.save();

        // Increment commentsCount on parent post
        post.commentsCount = (post.commentsCount || 0) + 1;
        await post.save();

        res.status(201).json({
            success: true,
            message: 'Comment added successfully!',
            comment: {
                id: savedComment._id.toString(),
                postId,
                author: savedComment.author,
                content: savedComment.content,
                likesCount: 0,
                isLiked: false,
                createdAt: savedComment.createdAt,
                updatedAt: savedComment.updatedAt
            }
        });
    } catch (error) {
        console.error('[Community Controller] Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to post comment.',
            error: error.message
        });
    }
};

/**
 * PUT /api/community/comments/:id
 * Edit an existing comment (Protected - Owner only)
 */
export const updateComment = async (req, res) => {
    try {
        const { id: commentId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Updated comment content cannot be empty.'
            });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found.'
            });
        }

        // Ownership verification
        if (comment.author.uid !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You can only edit your own comments.'
            });
        }

        comment.content = content.trim();
        const updated = await comment.save();

        res.json({
            success: true,
            message: 'Comment updated successfully!',
            comment: {
                id: updated._id.toString(),
                postId: updated.post.toString(),
                author: updated.author,
                content: updated.content,
                likesCount: updated.likes ? updated.likes.length : 0,
                isLiked: updated.likes ? updated.likes.includes(req.user.uid) : false,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt
            }
        });
    } catch (error) {
        console.error('[Community Controller] Error updating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update comment.',
            error: error.message
        });
    }
};

/**
 * DELETE /api/community/comments/:id
 * Delete an existing comment (Protected - Owner only)
 */
export const deleteComment = async (req, res) => {
    try {
        const { id: commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found.'
            });
        }

        // Ownership verification
        if (comment.author.uid !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You can only delete your own comments.'
            });
        }

        const postId = comment.post;
        await Comment.findByIdAndDelete(commentId);

        // Decrement commentsCount on parent post
        const post = await Post.findById(postId);
        if (post && post.commentsCount > 0) {
            post.commentsCount -= 1;
            await post.save();
        }

        res.json({
            success: true,
            message: 'Comment deleted successfully!'
        });
    } catch (error) {
        console.error('[Community Controller] Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete comment.',
            error: error.message
        });
    }
};

/**
 * POST /api/community/posts/:id/like
 * Add upvote/like to a post (Protected)
 */
export const likePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user.uid;

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: userId } },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        res.json({
            success: true,
            message: 'Post upvoted successfully!',
            isLiked: true,
            likesCount: updatedPost.likes ? updatedPost.likes.length : 0
        });
    } catch (error) {
        console.error('[Community Controller] Error upvoting post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upvote post.',
            error: error.message
        });
    }
};

/**
 * DELETE /api/community/posts/:id/like
 * Remove upvote/like from a post (Protected)
 */
export const unlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user.uid;

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: userId } },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        res.json({
            success: true,
            message: 'Post upvote removed successfully!',
            isLiked: false,
            likesCount: updatedPost.likes ? updatedPost.likes.length : 0
        });
    } catch (error) {
        console.error('[Community Controller] Error removing upvote from post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove upvote.',
            error: error.message
        });
    }
};

/**
 * POST /api/community/posts/:id/bookmark
 * Save/bookmark a post for the authenticated user (Protected)
 */
export const bookmarkPost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user.uid;

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { bookmarks: userId } },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        res.json({
            success: true,
            message: 'Post saved to your bookmarks!',
            isBookmarked: true
        });
    } catch (error) {
        console.error('[Community Controller] Error bookmarking post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bookmark post.',
            error: error.message
        });
    }
};

/**
 * DELETE /api/community/posts/:id/bookmark
 * Remove save/bookmark for the authenticated user (Protected)
 */
export const unbookmarkPost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user.uid;

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $pull: { bookmarks: userId } },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        res.json({
            success: true,
            message: 'Post removed from saved bookmarks.',
            isBookmarked: false
        });
    } catch (error) {
        console.error('[Community Controller] Error unbookmarking post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove bookmark.',
            error: error.message
        });
    }
};

/**
 * GET /api/community/posts/saved
 * Fetch all bookmarked posts saved by the authenticated user (Protected)
 */
export const getSavedPosts = async (req, res) => {
    try {
        const userId = req.user.uid;
        const rawPosts = await Post.find({ bookmarks: userId }).sort({ createdAt: -1 }).lean();

        const posts = rawPosts.map((post) => {
            const likesArr = post.likes || [];
            const bookmarksArr = post.bookmarks || [];
            return {
                id: post._id.toString(),
                author: post.author,
                title: post.title,
                content: post.content,
                category: post.category,
                imageUrl: post.imageUrl || null,
                likesCount: likesArr.length,
                commentsCount: post.commentsCount || 0,
                isLiked: likesArr.includes(userId),
                isBookmarked: true,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            };
        });

        res.json({
            success: true,
            posts,
            totalPosts: posts.length
        });
    } catch (error) {
        console.error('[Community Controller] Error fetching saved posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch saved posts.',
            error: error.message
        });
    }
};

/**
 * PUT /api/community/posts/:id
 * Edit post (Protected - Strict Ownership Check)
 */
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, imageUrl } = req.body;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        // Strict Backend Ownership Enforcement
        if (post.author.uid !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You can only edit your own posts.'
            });
        }

        if (title && title.trim()) post.title = title.trim();
        if (content && content.trim()) post.content = content.trim();
        if (category) post.category = category;
        if (imageUrl !== undefined) post.imageUrl = imageUrl;

        const updatedPost = await post.save();
        const currentUserId = req.user.uid;
        const likesArr = updatedPost.likes || [];
        const bookmarksArr = updatedPost.bookmarks || [];

        res.json({
            success: true,
            message: 'Post updated successfully!',
            post: {
                id: updatedPost._id.toString(),
                author: updatedPost.author,
                title: updatedPost.title,
                content: updatedPost.content,
                category: updatedPost.category,
                imageUrl: updatedPost.imageUrl,
                likesCount: likesArr.length,
                commentsCount: updatedPost.commentsCount || 0,
                isLiked: likesArr.includes(currentUserId),
                isBookmarked: bookmarksArr.includes(currentUserId),
                createdAt: updatedPost.createdAt,
                updatedAt: updatedPost.updatedAt
            }
        });
    } catch (error) {
        console.error('[Community Controller] Error updating post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update post.',
            error: error.message
        });
    }
};

/**
 * DELETE /api/community/posts/:id
 * Delete post and its comments (Protected - Strict Ownership Check)
 */
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        // Strict Backend Ownership Enforcement
        if (post.author.uid !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You can only delete your own posts.'
            });
        }

        // Delete post and cleanup associated comments
        await Post.findByIdAndDelete(id);
        await Comment.deleteMany({ post: id });

        res.json({
            success: true,
            message: 'Post and associated comments deleted successfully!'
        });
    } catch (error) {
        console.error('[Community Controller] Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete post.',
            error: error.message
        });
    }
};

/**
 * POST /api/community/reports
 * Submit a report for an inappropriate post or comment (Protected)
 */
export const createReport = async (req, res) => {
    try {
        const { targetType, targetId, reason, description } = req.body;

        if (!targetType || !['post', 'comment'].includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid report targetType. Must be "post" or "comment".'
            });
        }

        if (!targetId) {
            return res.status(400).json({
                success: false,
                message: 'Target ID is required.'
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Report reason is required.'
            });
        }

        const authenticatedUser = req.user;

        // Check if report already exists from this user for this target
        const existingReport = await Report.findOne({
            targetId,
            'reporter.uid': authenticatedUser.uid
        });

        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this item. Our moderation team is reviewing it.'
            });
        }

        const report = new Report({
            reporter: {
                uid: authenticatedUser.uid,
                name: authenticatedUser.name || 'Sakhi Member',
                email: authenticatedUser.email || ''
            },
            targetType,
            targetId,
            targetModel: targetType === 'post' ? 'Post' : 'Comment',
            reason,
            description: description ? description.trim() : '',
            status: 'pending'
        });

        const savedReport = await report.save();

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully. Thank you for keeping Sakhi safe!',
            reportId: savedReport._id.toString()
        });
    } catch (error) {
        console.error('[Community Controller] Error submitting report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit report.',
            error: error.message
        });
    }
};
