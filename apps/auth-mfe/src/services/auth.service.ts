import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/register`,
      data
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/auth/logout`);
  },

  getCurrentUser: async (token: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/forgot-password`,
      { email }
    );
    return response.data;
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/reset-password/${token}`,
      { password }
    );
    return response.data;
  },
};
