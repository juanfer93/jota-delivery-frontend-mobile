import axios, { AxiosRequestConfig } from 'axios';
import { TokenStorage } from '@/core/storage/token.storage';
import { ApiResponse, ApiListResponse } from '@/core/domain/api.types';

//  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.10:3000/api/v1';
const baseUrl = 'http://localhost:3000/api/v1'

const api = axios.create({
  baseURL: baseUrl,
  timeout: 60000,
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

export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await api.request<ApiResponse<T>>(config);
  return response.data.data; 
};

export const apiListRequest = async <T>(config: AxiosRequestConfig): Promise<T[]> => {
  const response = await api.request<ApiListResponse<T>>(config);
  return response.data.data; 
};

export default api;