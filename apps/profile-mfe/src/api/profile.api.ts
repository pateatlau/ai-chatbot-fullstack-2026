import axios, { AxiosInstance } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/api';

/**
 * Helper to get access token from Zustand auth storage
 * The auth store persists tokens under 'auth-storage' key
 */
function getAccessToken(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return null;

    const parsed = JSON.parse(authStorage);
    return parsed?.state?.accessToken || null;
  } catch {
    return null;
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string | null;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

class ProfileAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor
    this.client.interceptors.request.use((config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> {
    const response = await this.client.patch<UpdateProfileResponse>(
      '/auth/profile',
      data
    );
    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    const response = await this.client.post<ChangePasswordResponse>(
      '/auth/change-password',
      data
    );
    return response.data;
  }

  /**
   * Upload avatar (placeholder - implement based on your file upload strategy)
   */
  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    // TODO: Implement actual file upload endpoint
    // For now, return a placeholder Dicebear avatar
    const name = file.name;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

    return { url: avatarUrl };
  }
}

export const profileAPI = new ProfileAPI();
