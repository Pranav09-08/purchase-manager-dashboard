import apiClient from '../apiClient';

export const getOverviewKPIs = async (token) => {
  const { data } = await apiClient.get('/api/admin/dashboard/overview', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getStatusSummary = async (token) => {
  const { data } = await apiClient.get('/api/admin/dashboard/status-summary', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getMonthlyRevenue = async (token, year) => {
  const { data } = await apiClient.get('/api/admin/dashboard/monthly-revenue', {
    headers: { Authorization: `Bearer ${token}` },
    params: { year },
  });
  return data;
};

export const getConversionRate = async (token) => {
  const { data } = await apiClient.get('/api/admin/dashboard/conversion-rate', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getTopSalesManagers = async (token, limit = 5) => {
  const { data } = await apiClient.get('/api/admin/dashboard/top-sales-managers', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit },
  });
  return data;
};

export const getTopPlanningManagers = async (token, limit = 5) => {
  const { data } = await apiClient.get('/api/admin/dashboard/top-planning-managers', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit },
  });
  return data;
};

export const getRecentActivity = async (token) => {
  const { data } = await apiClient.get('/api/admin/dashboard/recent-activity', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
