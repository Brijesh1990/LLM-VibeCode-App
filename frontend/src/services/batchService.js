import api from './api';

export const batchService = {
  listBatches: async (params = {}) => {
    const { data } = await api.get('/batches', { params });
    return data;
  },
  getBatch: async (id) => {
    const { data } = await api.get(`/batches/${id}`);
    return data;
  },
  createBatch: async (payload) => {
    const { data } = await api.post('/batches', payload);
    return data;
  },
  updateBatch: async (id, payload) => {
    const { data } = await api.put(`/batches/${id}`, payload);
    return data;
  },
  deleteBatch: async (id) => {
    const { data } = await api.delete(`/batches/${id}`);
    return data;
  },
  addStudentToBatch: async (batchId, studentId) => {
    const { data } = await api.post(`/batches/${batchId}/students`, { student_id: studentId });
    return data;
  },
  removeStudentFromBatch: async (batchId, studentId) => {
    const { data } = await api.delete(`/batches/${batchId}/students/${studentId}`);
    return data;
  },
  listEnrollments: async (params = {}) => {
    const { data } = await api.get('/enrollments', { params });
    return data;
  },
  createEnrollment: async (payload) => {
    const { data } = await api.post('/enrollments', payload);
    return data;
  },
  updateEnrollment: async (id, payload) => {
    const { data } = await api.put(`/enrollments/${id}`, payload);
    return data;
  },
  deleteEnrollment: async (id) => {
    const { data } = await api.delete(`/enrollments/${id}`);
    return data;
  },
};
