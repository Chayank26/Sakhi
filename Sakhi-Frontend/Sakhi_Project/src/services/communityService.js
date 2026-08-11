import axios from 'axios';
import { auth } from '../components/pages/firebase/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/community';

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
