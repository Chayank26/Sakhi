import Post from '../models/Post.js';

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
