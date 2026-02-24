import apiClient from '../apiClient';

export const listRequiredComponents = async (token, vendorId) => {
  const { data } = await apiClient.get('/api/vendor/components-required', {
    headers: { Authorization: `Bearer ${token}` },
    params: { vendorId },
  });
  return data;
};
