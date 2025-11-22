import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Configure axios instance with withCredentials to support HttpOnly cookies
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Allow cookies to be sent/received
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('[authService] Making request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('[authService] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('[authService] Response received:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('[authService] Response error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string; // Token is returned for use in Authorization headers
  expiresIn: number;
  message?: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    console.log('[authService.login] Called with:', {
      email: data.email,
      passwordLength: data.password?.length,
    });
    console.log('[authService.login] API_BASE_URL:', API_BASE_URL);
    console.log('[authService.login] About to call apiClient.post...');
    try {
      const response = await apiClient.post('/api/auth/login', data);
      console.log('[authService.login] Response received:', response);
      return response.data;
    } catch (error) {
      console.error('[authService.login] Error caught:', error);
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  },
};
