import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
});
// WHY: Add token to every request automatically
// WHAT: Request interceptor checks localStorage for JWT token
// HOW: Adds Authorization header with Bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// WHY: Handle expired/invalid tokens gracefully
// WHAT: On 401, clear stale tokens from localStorage and retry public GETs without auth.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      originalRequest._retry = true;
      
      // The token is definitely invalid/expired, so clear it to prevent loops
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }

      // For GET requests (public endpoints), retry without auth
      if (originalRequest.method === 'get' || originalRequest.method === 'GET') {
        delete originalRequest.headers.Authorization;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return "https://placehold.co/400x300?text=No+Image";
  // Cloudinary URLs start with https:// — return as is
  if (imagePath.startsWith('http')) return imagePath;
  // Fallback for any remaining local paths
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${BACKEND_URL}/media/${cleanPath}`;
};
export default api;