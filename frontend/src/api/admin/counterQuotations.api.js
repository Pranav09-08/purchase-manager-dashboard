import apiClient from '../apiClient';

export const listCounterQuotations = async (token) => {
  const { data } = await apiClient.get('/api/vendor/counter-quotations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const acceptCounterQuotation = async (token, id) => {
  const { data } = await apiClient.put(`/api/vendor/counter-quotation/${id}/accept`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const rejectCounterQuotation = async (token, id) => {
  const { data } = await apiClient.put(`/api/vendor/counter-quotation/${id}/reject`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
