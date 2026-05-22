import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const nextConfig = {
    ...config,
    headers: {
      ...(config.headers || {}),
    },
  };

  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('token');

    if (token) {
      nextConfig.headers.Authorization = `Bearer ${token}`;
    }
  }

  return nextConfig;
});

export default api;
