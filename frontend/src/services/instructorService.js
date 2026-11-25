import api from './api';

export const instructorService = {
  listInstructors: async (params = {}) => {
    const { data } = await api.get('/instructors', { params });
    return data;
  },
  getInstructor: async (id) => {
    const { data } = await api.get(`/instructors/${id}`);
    return data;
  },
  createInstructor: async (payload) => {
    const { data } = await api.post('/instructors', payload);
    return data;
  },
  updateInstructor: async (id, payload) => {
    const { data } = await api.put(`/instructors/${id}`, payload);
    return data;
  },
  deleteInstructor: async (id) => {
    const { data } = await api.delete(`/instructors/${id}`);
    return data;
  },
};
