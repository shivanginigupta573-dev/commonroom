import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

// WHY: Add token to every request automatically
// WHAT: Request interceptor checks localStorage for JWT token
// HOW: Adds Authorization header with Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  // Only add token if we aren't explicitly omitting it
  if (token && !config.headers['X-No-Auth']) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Clean up custom header before sending
  if (config.headers['X-No-Auth']) {
    delete config.headers['X-No-Auth'];
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// WHY: Gracefully handle expired tokens by refreshing them
// WHAT: Response interceptor catches 401 Unauthorized errors
// HOW: Attempts to refresh the access token using the refresh token, then retries the original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If it's a 401, not a retry, and NOT the refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('token/refresh')) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Attempt to get a new access token
          const refreshResponse = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
            refresh: refreshToken
          });

          const newAccessToken = refreshResponse.data.access;
          
          // Save the new token
          localStorage.setItem('access_token', newAccessToken);

          // Update the failed request's header and retry it
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        // Fall through to logout
      }

      // If refresh failed, or no refresh token exists, clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // If we are in the browser, force reload to clear app state and show logged-out view
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

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