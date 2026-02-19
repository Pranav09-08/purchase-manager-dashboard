// Base API URL (env override for different environments)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Build a fully-qualified API URL
export const apiUrl = (path) => {
  if (!path) return API_BASE_URL;
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path.startsWith('/') ? path : `/${path}`;
};

// Get Firebase ID token for API requests
// This function can be imported and called to get the auth header
export const getAuthHeader = async () => {
  // Import auth dynamically to avoid circular dependencies
  const { auth } = await import('../config/firebase');
  const user = auth.currentUser;
  
  if (user) {
    try {
      const idToken = await user.getIdToken();
      return { Authorization: `Bearer ${idToken}` };
    } catch (error) {
      console.error('Error getting ID token:', error);
      return {};
    }
  }
  
  return {};
};
