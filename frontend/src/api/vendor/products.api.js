import apiClient from '../apiClient';

// Vendor Products API
const vendorProductsApi = {
  list: (token) => apiClient.get('/api/vendor/products', { headers: { Authorization: `Bearer ${token}` } }),
  getById: (token, id) => apiClient.get(`/api/vendor/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  create: (token, data) => apiClient.post('/api/vendor/products', data, { headers: { Authorization: `Bearer ${token}` } }),
  update: (token, id, data) => apiClient.put(`/api/vendor/products/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  // Add more vendor product endpoints as needed
};

export default vendorProductsApi;
