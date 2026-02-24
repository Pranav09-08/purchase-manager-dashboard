import apiClient from '../apiClient';

export const listVendorEnquiries = async (token, vendorId) => {
  const { data } = await apiClient.get(`/api/purchase/enquiries?vendorId=${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
