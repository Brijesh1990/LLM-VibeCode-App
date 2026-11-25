import api from './api';

export const assignmentService = {
  listAssignments: async (params = {}) => {
    const { data } = await api.get('/assignments', { params });
    return data;
  },
  getAssignment: async (id) => {
    const { data } = await api.get(`/assignments/${id}`);
    return data;
  },
  createAssignment: async (payload) => {
    const { data } = await api.post('/assignments', payload);
    return data;
  },
  updateAssignment: async (id, payload) => {
    const { data } = await api.put(`/assignments/${id}`, payload);
    return data;
  },
  deleteAssignment: async (id) => {
    const { data } = await api.delete(`/assignments/${id}`);
    return data;
  },
  listSubmissions: async (params = {}) => {
    const { data } = await api.get('/submissions', { params });
    return data;
  },
  submitAssignment: async (formData) => {
    const { data } = await api.post('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  evaluateSubmission: async (id, payload) => {
    const { data } = await api.put(`/submissions/${id}/evaluate`, payload);
    return data;
  },
};
