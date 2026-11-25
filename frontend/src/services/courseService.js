import api from './api';

export const courseService = {
  listCourses: async (params = {}) => {
    const { data } = await api.get('/courses', { params });
    return data;
  },
  getCourse: async (id) => {
    const { data } = await api.get(`/courses/${id}`);
    return data;
  },
  createCourse: async (payload) => {
    const { data } = await api.post('/courses', payload);
    return data;
  },
  updateCourse: async (id, payload) => {
    const { data } = await api.put(`/courses/${id}`, payload);
    return data;
  },
  deleteCourse: async (id) => {
    const { data } = await api.delete(`/courses/${id}`);
    return data;
  },
  listCategories: async () => {
    const { data } = await api.get('/categories');
    return data;
  },
  createCategory: async (payload) => {
    const { data } = await api.post('/categories', payload);
    return data;
  },
  updateCategory: async (id, payload) => {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data;
  },
  deleteCategory: async (id) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
  listModules: async (params = {}) => {
    const { data } = await api.get('/modules', { params });
    return data;
  },
  createModule: async (payload) => {
    const { data } = await api.post('/modules', payload);
    return data;
  },
  updateModule: async (id, payload) => {
    const { data } = await api.put(`/modules/${id}`, payload);
    return data;
  },
  deleteModule: async (id) => {
    const { data } = await api.delete(`/modules/${id}`);
    return data;
  },
  listLectures: async (params = {}) => {
    const { data } = await api.get('/lectures', { params });
    return data;
  },
  createLecture: async (payload) => {
    const { data } = await api.post('/lectures', payload);
    return data;
  },
  updateLecture: async (id, payload) => {
    const { data } = await api.put(`/lectures/${id}`, payload);
    return data;
  },
  completeLecture: async (id, is_completed = true) => {
    const { data } = await api.post(`/lectures/${id}/complete`, { is_completed });
    return data;
  },
  deleteLecture: async (id) => {
    const { data } = await api.delete(`/lectures/${id}`);
    return data;
  },
  listMaterials: async (params = {}) => {
    const { data } = await api.get('/materials', { params });
    return data;
  },
  uploadMaterial: async (formData) => {
    const { data } = await api.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  deleteMaterial: async (id) => {
    const { data } = await api.delete(`/materials/${id}`);
    return data;
  },
};
