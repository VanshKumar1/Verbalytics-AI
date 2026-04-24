import axios from 'axios';

const api = axios.create({
  baseURL: '/api',             // proxied to http://localhost:5000/api via vite.config.js
  timeout: 30000,              // 30s timeout for AI responses
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('verbalytics_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('verbalytics_token');
      localStorage.removeItem('verbalytics_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
