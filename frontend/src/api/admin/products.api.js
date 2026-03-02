import apiClient from '../apiClient';

// Admin Products API
const adminProductsApi = {
  list: async (token) => {
    const { data } = await apiClient.get('/products', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
  getById: async (token, id) => {
    const { data } = await apiClient.get(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
  create: async (token, payload) => {
    const { data: responseData } = await apiClient.post('/products', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return responseData;
  },
  update: async (token, id, payload) => {
    const { data: responseData } = await apiClient.put(`/products/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return responseData;
  },
  remove: async (token, id) => {
    const { data: responseData } = await apiClient.delete(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return responseData;
  },
  // Add more admin product endpoints as needed
};

export default adminProductsApi;
