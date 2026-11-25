import axios from 'axios';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('lms_access_token') || localStorage.getItem('lms_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry && !originalRequest?.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      const refreshToken = sessionStorage.getItem('lms_refresh_token') || localStorage.getItem('lms_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem('lms_access_token', data.access_token);
          localStorage.setItem('lms_refresh_token', data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('lms_access_token');
          localStorage.removeItem('lms_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
