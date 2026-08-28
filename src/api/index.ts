import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { YummyUser } from '../types/user';

const YUMMY_API_URL = 'https://api.yani.tv';
const APP_TOKEN = import.meta.env.VITE_APP_TOKEN || '';

export const api = axios.create({
  baseURL: YUMMY_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Application': APP_TOKEN,
    'Accept': 'image/avif,image/webp',
  },
});

// 401-handler: clear auth and let consumers re-route as needed (e.g. via <Navigate> in ProtectedRoute).
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const clearAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const setUser = (user: YummyUser) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): YummyUser | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr) as YummyUser;
    } catch {
      return null;
    }
  }
  return null;
};
