import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { auth } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = auth.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = auth.getRefreshToken();
          if (refreshToken) {
            const newToken = await auth.refreshAccessToken(refreshToken);
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          }
        } catch (refreshError) {
          auth.logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      auth.logout();
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      message.error('权限不足');
    } else if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as { message?: string };
      message.error(data.message || '请求失败');
    } else {
      message.error('网络错误');
    }

    return Promise.reject(error);
  }
);

export default api;
