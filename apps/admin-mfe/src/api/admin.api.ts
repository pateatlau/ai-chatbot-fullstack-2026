import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@myapp/frontend/stores';

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

    // SECURITY NOTE: Token in Authorization header (DEV vs PROD strategy)
    //
    // DEVELOPMENT (localhost with different ports):
    // - Services run on different ports (shell:5173, admin-service:3002)
    // - Browsers block cookies across ports due to same-origin policy
    // - WORKAROUND: Send JWT via Authorization header from localStorage
    // - XSS RISK: Token is accessible to JavaScript (vulnerable to XSS attacks)
    //
    // PRODUCTION (same domain):
    // - All services behind same domain (e.g., api.example.com)
    // - HttpOnly cookies work across services (same domain)
    // - SECURE: Cookies are HttpOnly, token NOT in localStorage
    // - No XSS risk: JavaScript cannot access HttpOnly cookies
    //
    // TODO: Before production deployment:
    // 1. Remove accessToken from localStorage persistence in auth.store.ts
    // 2. Remove this Authorization header interceptor
    // 3. Rely solely on HttpOnly cookies for authentication
    // 4. Ensure all services are behind API gateway on same domain
    this.client.interceptors.request.use((config) => {
      // Only add Authorization header in development when cookies don't work cross-port
      const isDev =
        import.meta.env.DEV || window.location.hostname === 'localhost';

      if (isDev) {
        try {
          const authStorage = localStorage.getItem('auth-storage');
          console.log(
            '[AdminAPI] DEV MODE - Request interceptor - authStorage:',
            authStorage ? 'exists' : 'null'
          );

          if (authStorage) {
            const authState = JSON.parse(authStorage);
            console.log('[AdminAPI] Parsed authState:', {
              hasState: !!authState.state,
              hasAccessToken: !!authState.state?.accessToken,
              tokenPreview: authState.state?.accessToken
                ? authState.state.accessToken.substring(0, 20) + '...'
                : 'none',
            });

            const token = authState.state?.accessToken;
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
              console.log(
                '[AdminAPI] Authorization header set with Bearer token (DEV MODE)'
              );
            } else {
              console.warn('[AdminAPI] No accessToken found in auth state');
            }
          } else {
            console.warn('[AdminAPI] No auth-storage in localStorage');
          }
        } catch (error) {
          console.error(
            '[AdminAPI] Failed to get token from localStorage:',
            error
          );
        }
      } else {
        console.log('[AdminAPI] PROD MODE - Relying on HttpOnly cookies only');
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[AdminAPI] Response error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });

        if (error.response?.status === 401) {
          console.warn(
            '[AdminAPI] 401 Unauthorized - clearing auth and redirecting to /login'
          );
          // Clear auth state before redirecting to avoid PublicRoute redirecting back to dashboard
          const { clearAuth } = useAuthStore.getState();
          clearAuth();
          // Small delay to ensure state is cleared
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
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
