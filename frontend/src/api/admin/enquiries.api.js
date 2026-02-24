import apiClient from '../apiClient';

export const listEnquiries = async (token) => {
  const { data } = await apiClient.get('/api/purchase/enquiries', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createEnquiry = async (token, payload) => {
  const { data } = await apiClient.post('/api/purchase/enquiry', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateEnquiry = async (token, id, payload) => {
  const { data } = await apiClient.put(`/api/purchase/enquiry/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteEnquiry = async (token, id) => {
  const { data } = await apiClient.delete(`/api/purchase/enquiry/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const rejectEnquiry = async (token, id) => {
  const { data } = await apiClient.put(`/api/purchase/enquiry/${id}/reject`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
