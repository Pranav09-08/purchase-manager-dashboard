import apiClient from '../apiClient';

const BASE = '/api/vendor/dashboard';

const vendorDashboardApi = {
  getOverviewKPIs: (token) => apiClient.get(`${BASE}/overview`, { headers: { Authorization: `Bearer ${token}` } }),
  getStatusSummary: (token) => apiClient.get(`${BASE}/status-summary`, { headers: { Authorization: `Bearer ${token}` } }),
  getMonthlyRevenue: (token, year) => apiClient.get(`${BASE}/monthly-revenue`, { headers: { Authorization: `Bearer ${token}` }, params: { year } }),
  getConversionRate: (token) => apiClient.get(`${BASE}/conversion-rate`, { headers: { Authorization: `Bearer ${token}` } }),
  getRecentActivity: (token) => apiClient.get(`${BASE}/recent-activity`, { headers: { Authorization: `Bearer ${token}` } }),
};

export default vendorDashboardApi;
