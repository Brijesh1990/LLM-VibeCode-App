import api from './api';

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  updateProfile: async (payload) => {
    const { data } = await api.put('/auth/profile', payload);
    return data;
  },
  changePassword: async (payload) => {
    const { data } = await api.put('/auth/change-password', payload);
    return data;
  },
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  resetPassword: async (payload) => {
    const { data } = await api.post('/auth/reset-password', payload);
    return data;
  },
  logout: async (refreshToken) => {
    const { data } = await api.post('/auth/logout', { refresh_token: refreshToken });
    return data;
  },
};
