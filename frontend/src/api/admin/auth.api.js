import apiClient from '../apiClient';

// Admin Auth API
const adminAuthApi = {
  login: (credentials) => apiClient.post('/api/admin/auth/login', credentials),
  logout: (token) => apiClient.post('/api/admin/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } }),
  getProfile: (token) => apiClient.get('/api/admin/me', { headers: { Authorization: `Bearer ${token}` } }),
  // Add more admin auth endpoints as needed
};

export default adminAuthApi;
