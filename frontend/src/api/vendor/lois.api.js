import apiClient from '../apiClient';

export const listVendorLois = async (token, vendorId) => {
  const { data } = await apiClient.get(`/api/purchase/lois?vendorId=${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const vendorLoiAction = async (token, loiId, action) => {
  const { data } = await apiClient.put(`/api/vendor/loi/${loiId}/${action}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
