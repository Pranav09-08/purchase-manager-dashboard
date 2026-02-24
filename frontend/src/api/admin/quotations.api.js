import apiClient from '../apiClient';

export const listQuotations = async (token) => {
  const { data } = await apiClient.get('/api/purchase/quotations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createQuotation = async (token, payload) => {
  const { data } = await apiClient.post('/api/purchase/quotation', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateQuotation = async (token, id, payload) => {
  const { data } = await apiClient.put(`/api/purchase/quotation/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const acceptQuotation = async (token, id) => {
  const { data } = await apiClient.put(`/api/purchase/quotation/${id}`, { status: 'accepted' }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const negotiateQuotation = async (token, id, notes) => {
  const { data } = await apiClient.put(`/api/purchase/quotation/${id}`, { status: 'negotiating', notes }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
