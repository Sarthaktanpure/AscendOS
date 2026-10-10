import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject token if stored in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ascendos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login failure itself
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('ascendos_token');
        // Let React state handle navigation gracefully
      }
    }
    return Promise.reject(error);
  }
);

export default api;
