import apiClient from '../apiClient';

// Vendor Orders API
const vendorOrdersApi = {
  list: (token, vendorId) => apiClient.get(`/api/purchase/orders?vendorId=${vendorId}`, { headers: { Authorization: `Bearer ${token}` } }),
  getById: (token, id) => apiClient.get(`/api/vendor/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  create: (token, data) => apiClient.post('/api/vendor/orders', data, { headers: { Authorization: `Bearer ${token}` } }),
  update: (token, id, data) => apiClient.put(`/api/vendor/orders/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  // Add more vendor order endpoints as needed
};

export const listVendorOrders = async (token, vendorId) => {
  const { data } = await vendorOrdersApi.list(token, vendorId);
  return data;
};

export const confirmVendorOrder = async (token, orderId) => {
  const { data } = await vendorOrdersApi.update(token, orderId, {});
  return data;
};

export default vendorOrdersApi;
