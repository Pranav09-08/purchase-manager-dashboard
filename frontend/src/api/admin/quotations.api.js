import apiClient from '../apiClient';

export const listQuotations = async (token) => {
  const { data } = await apiClient.get('/purchase-quotations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createQuotation = async (token, payload) => {
  const { data } = await apiClient.post('/purchase-quotation', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateQuotation = async (token, id, payload) => {
  const { data } = await apiClient.patch(`/purchase-quotation/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const acceptQuotation = async (token, id) => {
  const { data } = await apiClient.patch(`/purchase-quotation/${id}`, { status: 'accepted' }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const negotiateQuotation = async (token, id, notes) => {
  const { data } = await apiClient.patch(`/purchase-quotation/${id}`, { status: 'negotiating', notes }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
