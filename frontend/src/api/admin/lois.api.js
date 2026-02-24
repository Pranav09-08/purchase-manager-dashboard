import apiClient from '../apiClient';

export const listLois = async (token) => {
  const { data } = await apiClient.get('/api/purchase/lois', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createLoi = async (token, payload) => {
  const { data } = await apiClient.post('/api/purchase/loi', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateLoi = async (token, id, payload) => {
  const { data } = await apiClient.put(`/api/purchase/loi/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const resubmitLoi = async (token, id) => {
  const { data } = await apiClient.put(`/api/purchase/loi/${id}`, { status: 'sent' }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
