import axios from 'axios';

/**
 * Centralised Axios instance configured with the backend base URL and
 * an interceptor that automatically attaches the JWT token from local
 * storage to every request. If needed the proxy setting in
 * package.json will also reroute API calls during development.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
});

// Attach Authorization header for authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
