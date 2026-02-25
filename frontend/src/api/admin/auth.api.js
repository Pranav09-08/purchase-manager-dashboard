import apiClient from '../apiClient';

// Admin Auth API
const adminAuthApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: (token) => apiClient.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } }),
  getProfile: (token) => apiClient.get('/vendor/profile', { headers: { Authorization: `Bearer ${token}` } }),
  // Add more admin auth endpoints as needed
};

export default adminAuthApi;
