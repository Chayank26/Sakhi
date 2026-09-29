import axios from 'axios';
import { auth } from '../components/pages/firebase/firebase';

const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://sakhi-c0b4.onrender.com/api';
const API_BASE_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/+$/, '')}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async config => {
    await auth.authStateReady();
    if (auth.currentUser) config.headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
    return config;
});

export const fetchJobs = async (params = {}) => {
    try {
        const response = await api.get('/jobs', { params });
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export const fetchJobById = async (id) => {
    try {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export const createJob = async (jobData) => {
    try {
        const response = await api.post('/jobs', jobData);
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export const applyForJob = async (jobId, formData) => {
    try {
        const response = await api.post(`/jobs/${jobId}/apply`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Sakhi API request failed.');
        throw error;
    }
};

export default api;
