import apiClient from '../apiClient';

// Admin Clients API
const adminClientsApi = {
  list: (token) => apiClient.get('/api/admin/clients', { headers: { Authorization: `Bearer ${token}` } }),
  getById: (token, id) => apiClient.get(`/api/admin/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  create: (token, data) => apiClient.post('/api/admin/clients', data, { headers: { Authorization: `Bearer ${token}` } }),
  update: (token, id, data) => apiClient.put(`/api/admin/clients/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  // Add more admin client endpoints as needed
};

export const createClient = async (token, payload) => {
  const { data } = await apiClient.post('/api/clients', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const listClients = async (token) => {
  const { data } = await apiClient.get('/api/clients', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getClientById = async (token, id) => {
  const { data } = await apiClient.get(`/api/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateClient = async (token, id, payload) => {
  const { data } = await apiClient.patch(`/api/clients/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateClientStatus = async (token, id, status) => {
  const { data } = await apiClient.patch(`/api/clients/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export default adminClientsApi;
