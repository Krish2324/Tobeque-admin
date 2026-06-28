import axios from 'axios';

// Create central Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Uses ENV in prod, Vite proxy in dev
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach bearer token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch authorization and network exceptions globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If server triggers a 401 Unauthorized or token expired status
    if (error.response && error.response.status === 401) {
      console.warn('API Session Expired or Unauthorized. Signing out...');
      localStorage.removeItem('admin_token');
      // Force reload to dump state and redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
