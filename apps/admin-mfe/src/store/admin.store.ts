import { useEffect } from 'react';
import { useAdminStore as useSharedAdminStore } from '@ai-chatbot/admin-stores';
import { getEventBus, EVENT_NAMES, useEventBus } from '@myapp/shared/event-bus';

/**
 * MFE-local Admin Store Hook
 *
 * Re-exports the shared admin store for use within the Admin MFE.
 * This provides a clean separation between the MFE and shared libraries.
 */
export const useAdminStore = useSharedAdminStore;

/**
 * Initialize Admin Store with Event Bus subscriptions
 *
 * This hook should be called once at the MFE root level (Dashboard.tsx or App.tsx)
 * to set up all event listeners and ensure proper cleanup.
 *
 * @example
 * function Dashboard() {
 *   useAdminStoreInitialization();
 *   const { users, metrics } = useAdminStore();
 *   // ...
 * }
 */
export function useAdminStoreInitialization() {
  const { refreshDashboard, setUsers } = useAdminStore();

  // Listen for user login - check if admin
  useEventBus(EVENT_NAMES.USER_LOGGED_IN, (event) => {
    const isAdmin = event.user.role === 'admin';

    if (isAdmin) {
      console.log('[Admin MFE] Admin logged in:', event.user.email);
      // Auto-refresh dashboard when admin logs in
      refreshDashboard('auto');
    } else {
      console.log('[Admin MFE] Non-admin user logged in, clearing admin data');
      // Clear admin data if non-admin user logs in
      setUsers([]);
    }
  });

  // Listen for user logout - clear all admin data
  useEventBus(EVENT_NAMES.USER_LOGGED_OUT, () => {
    console.log('[Admin MFE] User logged out, clearing admin data');
    setUsers([]);
  });

  // Listen for conversation created - update metrics
  useEventBus(EVENT_NAMES.CONVERSATION_CREATED, () => {
    console.log('[Admin MFE] Conversation created, refreshing dashboard');
    // Auto-refresh dashboard when new conversations are created
    refreshDashboard('auto');
  });

  // Listen for user banned events from other admin instances
  useEventBus(EVENT_NAMES.USER_BANNED, (event) => {
    console.log('[Admin MFE] User banned:', event.userId);
    // Update local user list to reflect ban
    const { users, setUsers } = useAdminStore.getState();
    const updatedUsers = users.map((user) =>
      user.id === event.userId
        ? { ...user, isBanned: true, isActive: false }
        : user
    );
    setUsers(updatedUsers);
  });

  // Listen for user unbanned events
  useEventBus(EVENT_NAMES.USER_UNBANNED, (event) => {
    console.log('[Admin MFE] User unbanned:', event.userId);
    // Update local user list to reflect unban
    const { users, setUsers } = useAdminStore.getState();
    const updatedUsers = users.map((user) =>
      user.id === event.userId
        ? { ...user, isBanned: false, isActive: true }
        : user
    );
    setUsers(updatedUsers);
  });

  // Listen for profile updates - may need to update admin user list
  useEventBus(EVENT_NAMES.USER_PROFILE_UPDATED, (event) => {
    console.log('[Admin MFE] User profile updated:', event.userId);
    const { users, setUsers } = useAdminStore.getState();
    const updatedUsers = users.map((user) =>
      user.id === event.userId
        ? { ...user, ...event.changes, updatedAt: new Date().toISOString() }
        : user
    );
    setUsers(updatedUsers);
  });

  // Cleanup is handled automatically by useEventBus hook
}

/**
 * Helper hook to check if current user is admin
 *
 * @returns {boolean} True if user is admin
 */
export function useIsAdmin(): boolean {
  const eventBus = getEventBus();
  const history = eventBus.getEventHistory();

  // Find most recent login event
  for (let i = history.length - 1; i >= 0; i--) {
    const event = history[i];
    if (event && event.name === EVENT_NAMES.USER_LOGGED_IN) {
      return event.data?.user?.role === 'admin';
    }
    if (event && event.name === EVENT_NAMES.USER_LOGGED_OUT) {
      return false;
    }
  }

  return false;
}

/**
 * Hook to auto-refresh dashboard metrics periodically
 *
 * @param intervalMs Refresh interval in milliseconds (default: 60000 = 1 minute)
 */
export function useAdminDashboardAutoRefresh(intervalMs = 60000) {
  const { refreshDashboard } = useAdminStore();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    console.log('[Admin MFE] Starting auto-refresh with interval:', intervalMs);
    const interval = setInterval(() => {
      refreshDashboard('auto');
    }, intervalMs);

    return () => {
      console.log('[Admin MFE] Stopping auto-refresh');
      clearInterval(interval);
    };
  }, [isAdmin, intervalMs, refreshDashboard]);
}
