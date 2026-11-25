import api from './api';

export const quizService = {
  listQuizzes: async (params = {}) => {
    const { data } = await api.get('/quizzes', { params });
    return data;
  },
  getQuiz: async (id) => {
    const { data } = await api.get(`/quizzes/${id}`);
    return data;
  },
  createQuiz: async (payload) => {
    const { data } = await api.post('/quizzes', payload);
    return data;
  },
  updateQuiz: async (id, payload) => {
    const { data } = await api.put(`/quizzes/${id}`, payload);
    return data;
  },
  deleteQuiz: async (id) => {
    const { data } = await api.delete(`/quizzes/${id}`);
    return data;
  },
  addQuestion: async (quizId, payload) => {
    const { data } = await api.post(`/quizzes/${quizId}/questions`, payload);
    return data;
  },
  deleteQuestion: async (questionId) => {
    const { data } = await api.delete(`/quizzes/questions/${questionId}`);
    return data;
  },
  startQuiz: async (quizId) => {
    const { data } = await api.post(`/quizzes/${quizId}/start`);
    return data;
  },
  submitQuizAttempt: async (attemptId, answers) => {
    const { data } = await api.post(`/quizzes/attempts/${attemptId}/submit`, { answers });
    return data;
  },
  listAttempts: async (params = {}) => {
    const { data } = await api.get('/quizzes/attempts/all', { params });
    return data;
  },
};
