import apiClient from '../apiClient';

export const listVendorQuotations = async (token, vendorId) => {
  const { data } = await apiClient.get(`/api/purchase/quotations?vendorId=${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createVendorQuotation = async (token, payload) => {
  const { data } = await apiClient.post('/api/vendor/quotation', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
