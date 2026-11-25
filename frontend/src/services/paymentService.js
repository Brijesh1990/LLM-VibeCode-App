import api from './api';

export const paymentService = {
  listPayments: async (params = {}) => {
    const { data } = await api.get('/payments', { params });
    return data;
  },
  recordPayment: async (payload) => {
    const { data } = await api.post('/payments', payload);
    return data;
  },
  updatePayment: async (id, payload) => {
    const { data } = await api.put(`/payments/${id}`, payload);
    return data;
  },
  getGatewayConfig: async () => {
    const { data } = await api.get('/payments/gateway/config');
    return data;
  },
  createGatewayOrder: async (payload) => {
    const { data } = await api.post('/payments/gateway/create-order', payload);
    return data;
  },
  verifyCheckout: async (payload) => {
    const { data } = await api.post('/payments/gateway/verify-checkout', payload);
    return data;
  },
  payPendingBalance: async (payload) => {
    const { data } = await api.post('/payments/gateway/pay-pending', payload);
    return data;
  },
  listCertificates: async (params = {}) => {
    const { data } = await api.get('/certificates', { params });
    return data;
  },
  listPublicCertificates: async () => {
    const { data } = await api.get('/certificates/public-list');
    return data;
  },
  generateCertificate: async (payload) => {
    const { data } = await api.post('/certificates/generate', payload);
    return data;
  },
  verifyCertificate: async (identifier) => {
    const { data } = await api.get(`/certificates/verify/${encodeURIComponent(identifier)}`);
    return data;
  },
  toggleRevokeCertificate: async (id) => {
    const { data } = await api.put(`/certificates/${id}/revoke`);
    return data;
  },
};
