import apiClient from '../apiClient';

export const listInvoices = async (token) => {
  const { data } = await apiClient.get('/api/vendor/invoices', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const invoiceAction = async (token, id, action) => {
  const { data } = await apiClient.put(`/api/vendor/invoice/${id}/${action}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
