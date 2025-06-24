import axios from 'axios';
import useAuthStore from '../store/authStore';
import { API_BASE_URL } from '../constants';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.message;
    
    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (status === 403) {
      toast.error('Access forbidden');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (status === 404) {
      toast.error('Resource not found');
    } else {
      console.error('API Error:', message);
    }
    
    return Promise.reject(error);
  }
);

export default api;