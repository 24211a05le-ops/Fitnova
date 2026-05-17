import axios from 'axios';

// Create Axios instance with Base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitnova_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    console.error('API Error:', message);
    
    // Auto-logout if unauthorized (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('fitnova_token');
      localStorage.removeItem('fitnova_user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
