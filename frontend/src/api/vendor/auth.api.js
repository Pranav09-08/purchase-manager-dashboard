import apiClient from '../apiClient';

// Vendor Auth API
const vendorAuthApi = {
  login: (credentials) => apiClient.post('/api/vendor/auth/login', credentials),
  logout: (token) => apiClient.post('/api/vendor/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } }),
  getProfile: (token) => apiClient.get('/api/vendor/me', { headers: { Authorization: `Bearer ${token}` } }),
  register: (payload) => apiClient.post('/api/auth/register', payload),
};

export default vendorAuthApi;
