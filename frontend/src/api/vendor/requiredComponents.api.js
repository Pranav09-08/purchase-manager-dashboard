import apiClient from '../apiClient';

export const listRequiredComponents = async (token) => {
  const { data } = await apiClient.get('/api/vendor/components-required', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
