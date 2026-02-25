const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const normalizedBase = rawApiBaseUrl.replace(/\/+$/, '');

// Base API URL (env override for different environments)
// If env already contains /api, strip it to avoid /api/api duplication.
export const API_BASE_URL = normalizedBase.endsWith('/api')
  ? normalizedBase.slice(0, -4)
  : normalizedBase;

// Build a fully-qualified API URL
export const apiUrl = (path) => {
  if (!path) return API_BASE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const finalPath =
    API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api/')
      ? normalizedPath.slice(4)
      : normalizedPath;

  if (API_BASE_URL) {
    return `${API_BASE_URL}${finalPath}`;
  }
  return finalPath;
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
