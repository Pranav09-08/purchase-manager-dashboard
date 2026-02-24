import apiClient from '../apiClient';

export const listVendorInvoices = async (token, vendorId) => {
  const { data } = await apiClient.get(`/api/vendor/invoices?vendorId=${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createVendorInvoice = async (token, payload) => {
  const { data } = await apiClient.post('/api/vendor/invoice', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getVendorInvoice = async (token, invoiceId) => {
  const { data } = await apiClient.get(`/api/vendor/invoice/${invoiceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getVendorInvoiceSummary = async (token, invoiceId) => {
  const { data } = await apiClient.get(`/api/vendor/invoice/${invoiceId}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const markVendorInvoiceReceived = async (token, invoiceId) => {
  const { data } = await apiClient.put(`/api/vendor/invoice/${invoiceId}/received`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const acceptVendorInvoice = async (token, invoiceId) => {
  const { data } = await apiClient.put(`/api/vendor/invoice/${invoiceId}/accept`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const rejectVendorInvoice = async (token, invoiceId) => {
  const { data } = await apiClient.put(`/api/vendor/invoice/${invoiceId}/reject`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const markVendorInvoicePaid = async (token, invoiceId) => {
  const { data } = await apiClient.put(`/api/vendor/invoice/${invoiceId}/paid`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
