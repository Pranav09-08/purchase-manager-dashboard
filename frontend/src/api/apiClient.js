import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const normalizedBaseURL = rawBaseURL.replace(/\/+$/, '');
const baseURL = normalizedBaseURL.endsWith('/api')
  ? normalizedBaseURL.slice(0, -4)
  : normalizedBaseURL;

const apiClient = axios.create({
  baseURL,
});

// Dynamically import Firebase auth and attach ID token to all requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const { auth } = await import('../config/firebase');
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (err) {
    // If Firebase not initialized or user not logged in, skip
  }
  return config;
}, (error) => Promise.reject(error));
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error.message ||
      'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
