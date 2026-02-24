import apiClient from '../apiClient';

export const listPayments = async (token) => {
  const { data } = await apiClient.get('/api/purchase/payments', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createPayment = async (token, payload) => {
  const { data } = await apiClient.post('/api/purchase/payment', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const completePayment = async (token, id) => {
  const { data } = await apiClient.put(`/api/purchase/payment/${id}/complete`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const failPayment = async (token, id) => {
  const { data } = await apiClient.put(`/api/purchase/payment/${id}/fail`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
