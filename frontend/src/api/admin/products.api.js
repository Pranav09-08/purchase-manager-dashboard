import apiClient from '../apiClient';

// Admin Products API
const adminProductsApi = {
  list: async (token) => {
    const { data } = await apiClient.get('/api/admin/products', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
  getById: async (token, id) => {
    const { data } = await apiClient.get(`/api/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
  create: async (token, data) => {
    const { data } = await apiClient.post('/api/admin/products', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
  update: async (token, id, data) => {
    const { data } = await apiClient.put(`/api/admin/products/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
  // Add more admin product endpoints as needed
};

export default adminProductsApi;
