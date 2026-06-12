import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

// WHY: Add token to every request automatically
// WHAT: Request interceptor checks localStorage for JWT token
// HOW: Adds Authorization header with Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return "https://placehold.co/400x300?text=No+Image";
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // If it starts with /media/, prepend the base URL
  if (imagePath.startsWith('/media/')) {
    return `http://127.0.0.1:8000${imagePath}`;
  }
  // If it's a relative path like 'listings/image.jpg', add /media/ prefix
  return `http://127.0.0.1:8000/media/${imagePath}`;
};

export default api;