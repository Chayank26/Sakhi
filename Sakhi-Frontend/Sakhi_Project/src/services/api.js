import axios from 'axios';

const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://sakhi-c0b4.onrender.com/api';
const API_BASE_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/+$/, '')}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchJobs = async (params = {}) => {
    try {
        const response = await api.get('/jobs', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
};

export const fetchJobById = async (id) => {
    try {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching job ${id}:`, error);
        throw error;
    }
};

export const createJob = async (jobData) => {
    try {
        const response = await api.post('/jobs', jobData);
        return response.data;
    } catch (error) {
        console.error('Error creating job:', error);
        throw error;
    }
};

export const applyForJob = async (jobId, formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/apply`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error applying to job ${jobId}:`, error);
        throw error;
    }
};

export default api;
