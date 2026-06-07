import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

export const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return "https://placehold.co/400x300?text=No+Image";
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `http://127.0.0.1:8000/media/${cleanPath}`;
};
export default api;