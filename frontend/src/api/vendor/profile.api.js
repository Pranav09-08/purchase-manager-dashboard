import apiClient from '../apiClient';

export const getVendorProfile = async (token) => {
  const { data } = await apiClient.get('/api/supplier/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
