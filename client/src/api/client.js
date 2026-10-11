import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HTTP cookies for JWT refresh sessions
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach access token if stored in memory or local storage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ss_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401 and handle session expiration gracefully
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt silent refresh via cookie
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = res.data?.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('ss_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('ss_access_token');
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);
