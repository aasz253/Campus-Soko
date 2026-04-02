// Centralized configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace('/api', '');
export const UPLOADS_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace('/api', '');

// Helper to get full URL for uploaded files
export const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${UPLOADS_URL}${path}`;
};
