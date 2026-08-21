import axios from 'axios';

const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://sakhi-c0b4.onrender.com/api';
const API_BASE_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/+$/, '')}/api`;

const courseApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchCourses = async (params = {}) => {
    try {
        const response = await courseApi.get('/courses', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
};

export const fetchCourseById = async (id) => {
    try {
        const response = await courseApi.get(`/courses/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching course ${id}:`, error);
        throw error;
    }
};

export const createCourse = async (courseData) => {
    try {
        const response = await courseApi.post('/courses', courseData);
        return response.data;
    } catch (error) {
        console.error('Error creating course:', error);
        throw error;
    }
};

export const enrollInCourse = async (courseId, enrollmentData) => {
    try {
        const response = await courseApi.post(`/courses/${courseId}/enroll`, enrollmentData);
        return response.data;
    } catch (error) {
        console.error(`Error enrolling in course ${courseId}:`, error);
        throw error;
    }
};

export const fetchMyLearning = async (email = '') => {
    try {
        const response = await courseApi.get('/courses/my-learning', {
            params: { email },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching My Learning data:', error);
        throw error;
    }
};

export default courseApi;
