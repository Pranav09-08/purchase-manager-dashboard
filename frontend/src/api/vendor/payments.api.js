import apiClient from '../apiClient';

export const listVendorPayments = async (token, vendorId) => {
  const { data } = await apiClient.get(`/api/purchase/payments?vendorId=${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const vendorPaymentReceipt = async (token, paymentId) => {
  const { data } = await apiClient.put(`/api/vendor/payment/${paymentId}/receipt`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
