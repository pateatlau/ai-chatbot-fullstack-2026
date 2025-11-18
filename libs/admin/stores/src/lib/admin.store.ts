// libs/admin/stores/src/lib/admin.store.ts

import { create } from 'zustand';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerUser: number;
  lastUpdated: number;
}

export interface AdminState {
  // State
  users: AdminUser[];
  selectedUserId: string | null;
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions - Users
  setUsers: (users: AdminUser[]) => void;
  addUser: (user: AdminUser) => void;
  updateUser: (userId: string, updates: Partial<AdminUser>) => void;
  deleteUser: (userId: string) => void;
  banUser: (userId: string, adminId: string, reason: string) => void;
  unbanUser: (userId: string, adminId: string) => void;
  setSelectedUser: (userId: string | null) => void;

  // Actions - Metrics
  setMetrics: (metrics: DashboardMetrics) => void;
  refreshDashboard: (source: 'manual' | 'auto') => void;

  // Actions - Loading/Error
  setLoading: (isLoading: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state
  users: [],
  selectedUserId: null,
  metrics: null,
  isLoading: false,
  isRefreshing: false,
  error: null,

  // User actions
  setUsers: (users) => set({ users }),

  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  updateUser: (userId, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? { ...user, ...updates, updatedAt: new Date().toISOString() }
          : user
      ),
    })),

  deleteUser: (userId) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== userId),
      selectedUserId:
        state.selectedUserId === userId ? null : state.selectedUserId,
    })),

  banUser: (userId, adminId, reason) => {
    get().updateUser(userId, { isBanned: true, isActive: false });

    // Emit user banned event
    const eventBus = getEventBus();
    eventBus.emit(EVENT_NAMES.USER_BANNED, {
      userId,
      adminId,
      reason,
      timestamp: Date.now(),
    });
  },

  unbanUser: (userId, adminId) => {
    get().updateUser(userId, { isBanned: false, isActive: true });

    // Emit user unbanned event
    const eventBus = getEventBus();
    eventBus.emit(EVENT_NAMES.USER_UNBANNED, {
      userId,
      adminId,
      timestamp: Date.now(),
    });
  },

  setSelectedUser: (userId) => set({ selectedUserId: userId }),

  // Metrics actions
  setMetrics: (metrics) => set({ metrics }),

  refreshDashboard: (source) => {
    set({ isRefreshing: true });

    // Emit dashboard refresh event
    const eventBus = getEventBus();
    eventBus.emit(EVENT_NAMES.ADMIN_DASHBOARD_REFRESH, {
      source,
      timestamp: Date.now(),
    });

    // In real app, this would trigger API calls
    // For now, just clear refreshing state after a delay
    setTimeout(() => {
      set({ isRefreshing: false });
    }, 1000);
  },

  // Loading/error actions
  setLoading: (isLoading) => set({ isLoading }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
