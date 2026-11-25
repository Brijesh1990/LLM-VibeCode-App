import api from './api';

export const attendanceService = {
  listAttendance: async (params = {}) => {
    const { data } = await api.get('/attendance', { params });
    return data;
  },
  markAttendance: async (payload) => {
    const { data } = await api.post('/attendance/mark', payload);
    return data;
  },
};
