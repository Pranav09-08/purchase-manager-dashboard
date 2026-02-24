import apiClient from '../apiClient';

export const listRequests = async (token) => {
  const { data } = await apiClient.get('/api/requests', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
