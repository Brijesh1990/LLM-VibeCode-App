import api from './api';

export const reportService = {
  getDashboardKPIs: async () => {
    const { data } = await api.get('/reports/dashboard');
    return data;
  },
  getAnalyticsReport: async (params = {}) => {
    const { data } = await api.get('/reports/analytics', { params });
    return data;
  },
  listNotifications: async (params = {}) => {
    const { data } = await api.get('/notifications', { params });
    return data;
  },
  sendNotification: async (payload) => {
    const { data } = await api.post('/notifications', payload);
    return data;
  },
  markNotificationRead: async (id) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },
  markAllNotificationsRead: async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },
  listAnnouncements: async (params = {}) => {
    const { data } = await api.get('/announcements', { params });
    return data;
  },
  createAnnouncement: async (payload) => {
    const { data } = await api.post('/announcements', payload);
    return data;
  },
  updateAnnouncement: async (id, payload) => {
    const { data } = await api.put(`/announcements/${id}`, payload);
    return data;
  },
  deleteAnnouncement: async (id) => {
    const { data } = await api.delete(`/announcements/${id}`);
    return data;
  },
  getSettings: async () => {
    const { data } = await api.get('/settings');
    return data;
  },
  updateSettings: async (settings) => {
    const { data } = await api.put('/settings', { settings });
    return data;
  },
};
