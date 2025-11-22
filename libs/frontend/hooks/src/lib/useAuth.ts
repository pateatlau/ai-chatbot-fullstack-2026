import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type User } from '@myapp/frontend/stores';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UseAuthReturn {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateUser: (user: User) => void;

  // Helpers
  hasRole: (role: string | string[]) => boolean;
  isAdmin: () => boolean;
}

/**
 * Custom hook for authentication management
 *
 * Provides a clean interface for authentication operations including:
 * - Login/Register/Logout
 * - Token management
 * - User state access
 * - Role checking utilities
 *
 * @example
 * ```tsx
 * const { login, user, isAuthenticated, hasRole } = useAuth();
 *
 * // Login
 * await login({ email, password });
 *
 * // Check roles
 * if (hasRole('ADMIN')) {
 *   // Admin only content
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    setAuth,
    clearAuth,
    setUser,
    setTokens,
  } = useAuthStore();

  /**
   * Login user with credentials
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      try {
        const response = await axios.post<AuthResponse>(
          `${API_URL}/auth/login`,
          credentials
        );

        const { user, accessToken, refreshToken } = response.data;
        setAuth(user, accessToken, refreshToken);

        return response.data;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed';
        throw new Error(message);
      }
    },
    [setAuth]
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (data: RegisterData): Promise<AuthResponse> => {
      try {
        console.log(
          '[useAuth] Register called with data:',
          JSON.stringify(data, null, 2)
        );
        console.log('[useAuth] data.role value:', data.role);
        console.log('[useAuth] data.role type:', typeof data.role);

        const response = await axios.post<AuthResponse>(
          `${API_URL}/auth/register`,
          data
        );

        console.log(
          '[useAuth] Register response user role:',
          response.data.user.role
        );
        const { user, accessToken, refreshToken } = response.data;
        setAuth(user, accessToken, refreshToken);

        return response.data;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Registration failed';
        throw new Error(message);
      }
    },
    [setAuth]
  );

  /**
   * Logout user and clear auth state
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Optional: Call backend logout endpoint
      if (accessToken && refreshToken) {
        await axios.post(
          `${API_URL}/auth/logout`,
          { refreshToken },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      clearAuth();
    }
  }, [accessToken, refreshToken, clearAuth]);

  /**
   * Refresh access and refresh tokens
   */
  const refreshTokens = useCallback(async (): Promise<void> => {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(`${API_URL}/auth/refresh`, { refreshToken });

      setTokens(response.data.accessToken, response.data.refreshToken);
    } catch {
      // If refresh fails, clear auth and force re-login
      clearAuth();
      throw new Error('Session expired. Please login again.');
    }
  }, [refreshToken, setTokens, clearAuth]);

  /**
   * Update user data without affecting tokens
   */
  const updateUser = useCallback(
    (updatedUser: User) => {
      setUser(updatedUser);
    },
    [setUser]
  );

  /**
   * Check if user has specific role(s)
   */
  const hasRole = useCallback(
    (role: string | string[]): boolean => {
      if (!user) return false;

      if (Array.isArray(role)) {
        return role.includes(user.role);
      }

      return user.role === role;
    },
    [user]
  );

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback((): boolean => {
    return hasRole('ADMIN');
  }, [hasRole]);

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,

    // Actions
    login,
    register,
    logout,
    refreshTokens,
    updateUser,

    // Helpers
    hasRole,
    isAdmin,
  };
}

/**
 * Hook to require authentication - redirects to login if not authenticated
 *
 * @param redirectTo - Path to redirect if not authenticated (default: '/login')
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { user } = useRequireAuth();
 *   // User is guaranteed to be authenticated here
 * }
 * ```
 */
export function useRequireAuth(redirectTo = '/login'): UseAuthReturn {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate, redirectTo]);

  return auth;
}

/**
 * Hook to require specific role(s) - redirects if user doesn't have required role
 *
 * @param requiredRole - Role or array of roles required
 * @param redirectTo - Path to redirect if role check fails (default: '/dashboard')
 *
 * @example
 * ```tsx
 * function AdminPage() {
 *   const { user } = useRequireRole('ADMIN');
 *   // User is guaranteed to have ADMIN role here
 * }
 *
 * function ModeratorPage() {
 *   const { user } = useRequireRole(['ADMIN', 'MODERATOR']);
 *   // User has either ADMIN or MODERATOR role
 * }
 * ```
 */
export function useRequireRole(
  requiredRole: string | string[],
  redirectTo = '/dashboard'
): UseAuthReturn {
  const auth = useRequireAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated && !auth.hasRole(requiredRole)) {
      navigate(redirectTo, { replace: true });
    }
  }, [auth, requiredRole, navigate, redirectTo]);

  return auth;
}
