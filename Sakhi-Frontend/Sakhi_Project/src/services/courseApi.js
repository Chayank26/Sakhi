import courseApi from './api';

export const fetchCourses = async (params = {}) => {
    try {
        const response = await courseApi.get('/courses', { params });
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export const fetchCourseById = async (id) => {
    try {
        const response = await courseApi.get(`/courses/${id}`);
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export const createCourse = async (courseData) => {
    try {
        const response = await courseApi.post('/courses', courseData);
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export const enrollInCourse = async (courseId, enrollmentData) => {
    try {
        const response = await courseApi.post(`/courses/${courseId}/enroll`, enrollmentData);
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export const fetchMyLearning = async () => {
    try {
        const response = await courseApi.get('/courses/my-learning');
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export default courseApi;
