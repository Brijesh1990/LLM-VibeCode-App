import api from './api';

export const studentService = {
  listStudents: async (params = {}) => {
    const { data } = await api.get('/students', { params });
    return data;
  },
  getStudent: async (id) => {
    const { data } = await api.get(`/students/${id}`);
    return data;
  },
  createStudent: async (payload) => {
    const { data } = await api.post('/students', payload);
    return data;
  },
  updateStudent: async (id, payload) => {
    const { data } = await api.put(`/students/${id}`, payload);
    return data;
  },
  deleteStudent: async (id) => {
    const { data } = await api.delete(`/students/${id}`);
    return data;
  },
  listUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params });
    return data;
  },
  createUser: async (payload) => {
    const { data } = await api.post('/users', payload);
    return data;
  },
  updateUser: async (id, payload) => {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },
  deleteUser: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
  getProgress: async (params = {}) => {
    const { data } = await api.get('/progress', { params });
    return data;
  },
};
