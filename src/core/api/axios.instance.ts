import axios from 'axios';
import { TokenStorage } from '@/core/storage/token.storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await TokenStorage.getToken(); 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await TokenStorage.removeToken();
    }
    return Promise.reject(error);
  }
);

export default api;