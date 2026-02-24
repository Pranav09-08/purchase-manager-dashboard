import apiClient from '../apiClient';

export const listVendorCounterQuotations = async (token, vendorId) => {
  const { data } = await apiClient.get(`/api/vendor/counter-quotations?vendorId=${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createVendorCounterQuotation = async (token, payload) => {
  const { data } = await apiClient.post('/api/vendor/counter-quotation', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
