import apiClient from '../apiClient';

export const listRegistrations = async (token, status) => {
  const { data } = await apiClient.get(status ? `/api/auth/registrations?status=${status}` : '/api/auth/registrations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const approveRegistration = async (token, supplierId) => {
  const { data } = await apiClient.put(`/api/auth/registrations/${supplierId}/approve`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const rejectRegistration = async (token, supplierId, reason) => {
  const { data } = await apiClient.put(`/api/auth/registrations/${supplierId}/reject`, { reason }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateCertificateStatus = async (token, supplierId, status) => {
  const { data } = await apiClient.put(`/api/auth/registrations/${supplierId}/certificate`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
