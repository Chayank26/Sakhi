import axios from 'axios';
import { auth } from '../components/pages/firebase/firebase';

const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://sakhi-c0b4.onrender.com/api';
const ROOT_API = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/+$/, '')}/api`;
const API_BASE_URL = `${ROOT_API}/community`;

const getAuthHeaders = async () => {
    try {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const token = await currentUser.getIdToken();
            return {
                Authorization: `Bearer ${token}`
            };
        }
    } catch (err) {
        console.warn('Failed to retrieve Firebase auth token:', err);
    }
    return {};
};

/**
 * Fetch community posts with filters, search query, and sorting
 */
export const fetchPosts = async (params = {}) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/posts`, {
            params,
            headers
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching community posts:', error);
        throw error;
    }
};

/**
 * Search posts explicitly via GET /api/community/posts/search?q=
 */
export const searchPosts = async (query = '', category = 'All', sortBy = 'latest') => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/posts/search`, {
            params: { q: query, category, sortBy },
            headers
        });
        return response.data;
    } catch (error) {
        console.error(`Error searching posts for "${query}":`, error);
        throw error;
    }
};

/**
 * Fetch a single community post by ID
 */
export const fetchPostById = async (id) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/posts/${id}`, {
            headers
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching post ${id}:`, error);
        throw error;
    }
};

/**
 * Create a new post (Authenticated)
 */
export const createPost = async (postData) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_BASE_URL}/posts`, postData, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating community post:', error);
        throw error;
    }
};

/**
 * Upload image for post attachment (Authenticated)
 */
export const uploadPostImage = async (file) => {
    try {
        const headers = await getAuthHeaders();
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(`${API_BASE_URL}/upload-image`, formData, {
            headers: {
                ...headers,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading post image:', error);
        throw error;
    }
};

/**
 * Fetch comments for a specific post
 */
export const fetchComments = async (postId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`, {
            headers
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
        throw error;
    }
};

/**
 * Create a new comment on a post (Authenticated)
 */
export const createComment = async (postId, content) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${API_BASE_URL}/posts/${postId}/comments`,
            { content },
            {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error creating comment for post ${postId}:`, error);
        throw error;
    }
};

/**
 * Update an existing comment (Authenticated - Owner only)
 */
export const updateComment = async (commentId, content) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.put(
            `${API_BASE_URL}/comments/${commentId}`,
            { content },
            {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating comment ${commentId}:`, error);
        throw error;
    }
};

/**
 * Delete an existing comment (Authenticated - Owner only)
 */
export const deleteComment = async (commentId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
            headers
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting comment ${commentId}:`, error);
        throw error;
    }
};

/**
 * Upvote/Like a post (Authenticated)
 */
export const likePost = async (postId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${API_BASE_URL}/posts/${postId}/like`,
            {},
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error(`Error upvoting post ${postId}:`, error);
        throw error;
    }
};

/**
 * Remove Upvote/Like from a post (Authenticated)
 */
export const unlikePost = async (postId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.delete(`${API_BASE_URL}/posts/${postId}/like`, {
            headers
        });
        return response.data;
    } catch (error) {
        console.error(`Error removing upvote from post ${postId}:`, error);
        throw error;
    }
};

/**
 * Save/Bookmark a post (Authenticated)
 */
export const bookmarkPost = async (postId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${API_BASE_URL}/posts/${postId}/bookmark`,
            {},
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error(`Error bookmarking post ${postId}:`, error);
        throw error;
    }
};

/**
 * Remove Save/Bookmark from a post (Authenticated)
 */
export const unbookmarkPost = async (postId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.delete(`${API_BASE_URL}/posts/${postId}/bookmark`, {
            headers
        });
        return response.data;
    } catch (error) {
        console.error(`Error unbookmarking post ${postId}:`, error);
        throw error;
    }
};

/**
 * Fetch all bookmarked posts for the authenticated user
 */
export const fetchSavedPosts = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/posts/saved`, {
            headers
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        throw error;
    }
};

/**
 * Update an existing post (Authenticated - Owner only)
 */
export const updatePost = async (postId, postData) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.put(`${API_BASE_URL}/posts/${postId}`, postData, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating post ${postId}:`, error);
        throw error;
    }
};

/**
 * Delete a post and its comments (Authenticated - Owner only)
 */
export const deletePost = async (postId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
            headers
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting post ${postId}:`, error);
        throw error;
    }
};

/**
 * Submit a moderation report for a post or comment (Authenticated)
 */
export const submitReport = async (reportData) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_BASE_URL}/reports`, reportData, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting moderation report:', error);
        throw error;
    }
};
