import axios, { AxiosInstance } from 'axios';

const ADMIN_API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3002/api/admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  userGrowthRate: number;
  totalConversations: number;
  activeConversations: number;
  averageMessagesPerConversation: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: string;
  targetUserId: string | null;
  targetUserEmail?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN' | 'MODERATOR';
  isActive?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

class AdminAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ADMIN_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include cookies in requests
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/stats');
    return response.data;
  }

  /**
   * Get all users with pagination
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  }): Promise<UserListResponse> {
    const response = await this.client.get<UserListResponse>('/users', {
      params,
    });
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const response = await this.client.get<User>(`/users/${userId}`);
    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    data: UpdateUserRequest
  ): Promise<{ message: string; user: User }> {
    const response = await this.client.patch<{ message: string; user: User }>(
      `/users/${userId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(
      `/users/${userId}`
    );
    return response.data;
  }

  /**
   * Reset user password
   */
  async resetUserPassword(
    userId: string,
    data: ResetPasswordRequest
  ): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/users/${userId}/reset-password`,
      data
    );
    return response.data;
  }

  /**
   * Get audit logs with pagination
   */
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
  }): Promise<AuditLogListResponse> {
    const response = await this.client.get<AuditLogListResponse>(
      '/audit-logs',
      { params }
    );
    return response.data;
  }
}

export const adminAPI = new AdminAPI();
