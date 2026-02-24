import apiClient from '../apiClient';

export const listRequiredComponents = async (token) => {
  const { data } = await apiClient.get('/api/required-components', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createRequiredComponent = async (token, payload) => {
  const { data } = await apiClient.post('/api/required-components', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateRequiredComponent = async (token, id, payload) => {
  const { data } = await apiClient.put(`/api/required-components/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteRequiredComponent = async (token, id) => {
  const { data } = await apiClient.delete(`/api/required-components/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
