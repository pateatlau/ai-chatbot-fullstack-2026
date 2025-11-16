import { useCallback, useMemo } from 'react';
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface UseApiOptions {
  /**
   * Show toast on error
   * @default true
   */
  showErrorToast?: boolean;

  /**
   * Show toast on success
   * @default false
   */
  showSuccessToast?: boolean;

  /**
   * Custom success message
   */
  successMessage?: string;

  /**
   * Automatically refresh token on 401
   * @default true
   */
  autoRefreshToken?: boolean;

  /**
   * Custom error handler
   */
  onError?: (error: AxiosError) => void;
}

export interface UseApiReturn {
  /**
   * Configured axios instance with auth headers
   */
  api: AxiosInstance;

  /**
   * Make a GET request
   */
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;

  /**
   * Make a POST request
   */
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) => Promise<T>;

  /**
   * Make a PUT request
   */
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) => Promise<T>;

  /**
   * Make a PATCH request
   */
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) => Promise<T>;

  /**
   * Make a DELETE request
   */
  del: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

/**
 * Custom hook for API calls with authentication and error handling
 *
 * Features:
 * - Automatic auth token injection
 * - Token refresh on 401 errors
 * - Error toast notifications
 * - Success toast notifications
 * - TypeScript support
 *
 * @example
 * ```tsx
 * const { get, post } = useApi();
 *
 * // Simple GET request
 * const users = await get<User[]>('/users');
 *
 * // POST with success toast
 * await post('/users', userData, {
 *   showSuccessToast: true,
 *   successMessage: 'User created!'
 * });
 *
 * // Custom error handling
 * await get('/admin/data', {
 *   onError: (error) => {
 *     if (error.response?.status === 403) {
 *       navigate('/forbidden');
 *     }
 *   }
 * });
 * ```
 */
export function useApi(defaultOptions: UseApiOptions = {}): UseApiReturn {
  const { accessToken, refreshTokens, logout } = useAuth();
  const toast = useToast();

  /**
   * Create axios instance with auth headers
   */
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    instance.interceptors.request.use(
      (config) => {
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // If 401 and haven't retried yet, try to refresh token
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          defaultOptions.autoRefreshToken !== false
        ) {
          originalRequest._retry = true;

          try {
            await refreshTokens();

            // Retry original request with new token
            if (originalRequest.headers && accessToken) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return instance.request(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            await logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }, [accessToken, refreshTokens, logout, defaultOptions.autoRefreshToken]);

  /**
   * Handle API call with options
   */
  const handleRequest = useCallback(
    async <T>(
      requestFn: () => Promise<AxiosResponse<T>>,
      options: UseApiOptions = {}
    ): Promise<T> => {
      const mergedOptions = { ...defaultOptions, ...options };

      try {
        const response = await requestFn();

        // Show success toast if configured
        if (mergedOptions.showSuccessToast && mergedOptions.successMessage) {
          toast.success(mergedOptions.successMessage);
        }

        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;

        // Custom error handler
        if (mergedOptions.onError) {
          mergedOptions.onError(axiosError);
        }

        // Show error toast if configured
        if (mergedOptions.showErrorToast !== false) {
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'An error occurred';
          toast.error(errorMessage);
        }

        throw error;
      }
    },
    [defaultOptions, toast]
  );

  /**
   * GET request
   */
  const get = useCallback(
    async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      return handleRequest<T>(
        () => api.get(url, config),
        config as UseApiOptions
      );
    },
    [api, handleRequest]
  );

  /**
   * POST request
   */
  const post = useCallback(
    async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      return handleRequest<T>(
        () => api.post(url, data, config),
        config as UseApiOptions
      );
    },
    [api, handleRequest]
  );

  /**
   * PUT request
   */
  const put = useCallback(
    async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      return handleRequest<T>(
        () => api.put(url, data, config),
        config as UseApiOptions
      );
    },
    [api, handleRequest]
  );

  /**
   * PATCH request
   */
  const patch = useCallback(
    async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      return handleRequest<T>(
        () => api.patch(url, data, config),
        config as UseApiOptions
      );
    },
    [api, handleRequest]
  );

  /**
   * DELETE request
   */
  const del = useCallback(
    async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      return handleRequest<T>(
        () => api.delete(url, config),
        config as UseApiOptions
      );
    },
    [api, handleRequest]
  );

  return {
    api,
    get,
    post,
    put,
    patch,
    del,
  };
}

/**
 * Hook for making API calls without authentication
 * Useful for public endpoints
 */
export function usePublicApi(defaultOptions: UseApiOptions = {}): UseApiReturn {
  const toast = useToast();

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, []);

  const handleRequest = useCallback(
    async <T>(
      requestFn: () => Promise<AxiosResponse<T>>,
      options: UseApiOptions = {}
    ): Promise<T> => {
      const mergedOptions = { ...defaultOptions, ...options };

      try {
        const response = await requestFn();

        if (mergedOptions.showSuccessToast && mergedOptions.successMessage) {
          toast.success(mergedOptions.successMessage);
        }

        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;

        if (mergedOptions.onError) {
          mergedOptions.onError(axiosError);
        }

        if (mergedOptions.showErrorToast !== false) {
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'An error occurred';
          toast.error(errorMessage);
        }

        throw error;
      }
    },
    [defaultOptions, toast]
  );

  const get = useCallback(
    async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      return handleRequest<T>(
        () => api.get(url, config),
        config as UseApiOptions
      );
    },
    [api, handleRequest]
  );

  const post = useCallback(
    async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      return handleRequest<T>(
        () => api.post(url, data, config),
        config as UseApiOptions
      );
    },
    [api, handleRequest]
  );

  const put = useCallback(
    async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      return handleRequest<T>(
        () => api.put(url, data, config),
        config as UseApiOptions
      );
    },
    [api, handleRequest]
  );

  const patch = useCallback(
    async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      return handleRequest<T>(
        () => api.patch(url, data, config),
        config as UseApiOptions
      );
    },
    [api, handleRequest]
  );

  const del = useCallback(
    async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      return handleRequest<T>(
        () => api.delete(url, config),
        config as UseApiOptions
      );
    },
    [api, handleRequest]
  );

  return {
    api,
    get,
    post,
    put,
    patch,
    del,
  };
}
