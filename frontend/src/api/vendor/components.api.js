import apiClient from '../apiClient';

export const listVendorComponents = async (token) => {
  const { data } = await apiClient.get('/api/vendor/components', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getVendorComponent = async (token, componentId) => {
  const { data } = await apiClient.get(`/api/vendor/components/${componentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createVendorComponent = async (token, payload) => {
  const { data } = await apiClient.post('/api/vendor/components', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateVendorComponent = async (token, componentId, payload) => {
  const { data } = await apiClient.put(`/api/vendor/components/${componentId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteVendorComponent = async (token, componentId) => {
  const { data } = await apiClient.delete(`/api/vendor/components/${componentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const approveVendorComponent = async (token, componentId) => {
  const { data } = await apiClient.put(`/api/vendor/components/${componentId}/approve`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const rejectVendorComponent = async (token, componentId) => {
  const { data } = await apiClient.put(`/api/vendor/components/${componentId}/reject`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const listRequiredVendorComponents = async (token) => {
  const { data } = await apiClient.get('/api/vendor/components-required', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const listAvailableVendorComponents = async (token) => {
  const { data } = await apiClient.get('/api/vendor/available-components', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const addAvailableVendorComponent = async (token, payload) => {
  const { data } = await apiClient.post('/api/vendor/add-available-component', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
