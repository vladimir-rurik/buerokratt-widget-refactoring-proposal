// services/api/client.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiClientConfig } from './types';

/**
 * Create a configured API client
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout ?? 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - unwrap Ruuter response format
  client.interceptors.response.use(
    (response) => {
      // Ruuter wraps all responses in { response: ... }
      return response.data?.response ?? response.data;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        handleAuthExpiry();
      }
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Get JWT token from cookies
 */
function getAuthToken(): string | null {
  const cookies = document.cookie.split(';');
  const jwtCookie = cookies.find((c) => c.trim().startsWith('JWTTOKEN='));
  return jwtCookie ? jwtCookie.split('=')[1] : null;
}

/**
 * Handle expired authentication
 */
function handleAuthExpiry(): void {
  document.cookie = 'JWTTOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.dispatchEvent(new CustomEvent('auth:expired'));
}
