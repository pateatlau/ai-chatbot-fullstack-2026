import { act, renderHook, waitFor } from '@testing-library/react';
import { useAdminStore } from './admin.store';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

describe('useAdminStore', () => {
  let eventBus: ReturnType<typeof getEventBus>;

  beforeEach(() => {
    // Reset store state before each test
    useAdminStore.setState({
      users: [],
      selectedUserId: null,
      metrics: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
    });

    // Get fresh event bus instance
    eventBus = getEventBus();
    eventBus.clear();
  });

  afterEach(() => {
    eventBus.clear();
  });

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useAdminStore());

      expect(result.current.users).toEqual([]);
      expect(result.current.selectedUserId).toBeNull();
      expect(result.current.metrics).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('User Management', () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User One',
        role: 'user' as const,
        isActive: true,
        isBanned: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        name: 'User Two',
        role: 'user' as const,
        isActive: true,
        isBanned: false,
        createdAt: '2025-01-02T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      },
    ];

    beforeEach(() => {
      const { result } = renderHook(() => useAdminStore());
      act(() => {
        result.current.setUsers(mockUsers);
      });
    });

    it('should set users list', () => {
      const { result } = renderHook(() => useAdminStore());

      expect(result.current.users).toHaveLength(2);
      expect(result.current.users[0]?.email).toBe('user1@example.com');
      expect(result.current.users[1]?.email).toBe('user2@example.com');
    });

    it('should add a new user', () => {
      const { result } = renderHook(() => useAdminStore());

      const newUser = {
        id: 'user-3',
        email: 'user3@example.com',
        name: 'User Three',
        role: 'user' as const,
        isActive: true,
        isBanned: false,
        createdAt: '2025-01-03T00:00:00.000Z',
        updatedAt: '2025-01-03T00:00:00.000Z',
      };

      act(() => {
        result.current.addUser(newUser);
      });

      expect(result.current.users).toHaveLength(3);
      expect(result.current.users[2]).toEqual(newUser);
    });

    it('should update user details', () => {
      const { result } = renderHook(() => useAdminStore());

      act(() => {
        result.current.updateUser('user-1', { name: 'Updated Name' });
      });

      const updatedUser = result.current.users.find((u) => u.id === 'user-1');
      expect(updatedUser?.name).toBe('Updated Name');
      expect(updatedUser?.updatedAt).not.toBe('2025-01-01T00:00:00.000Z');
    });

    it('should delete a user', () => {
      const { result } = renderHook(() => useAdminStore());

      act(() => {
        result.current.deleteUser('user-1');
      });

      expect(result.current.users).toHaveLength(1);
      expect(
        result.current.users.find((u) => u.id === 'user-1')
      ).toBeUndefined();
    });

    it('should clear selectedUserId when deleting selected user', () => {
      const { result } = renderHook(() => useAdminStore());

      act(() => {
        result.current.setSelectedUser('user-1');
      });

      expect(result.current.selectedUserId).toBe('user-1');

      act(() => {
        result.current.deleteUser('user-1');
      });

      expect(result.current.selectedUserId).toBeNull();
    });

    it('should select a user', () => {
      const { result } = renderHook(() => useAdminStore());

      act(() => {
        result.current.setSelectedUser('user-1');
      });

      expect(result.current.selectedUserId).toBe('user-1');
    });

    it('should deselect a user', () => {
      const { result } = renderHook(() => useAdminStore());

      act(() => {
        result.current.setSelectedUser('user-1');
        result.current.setSelectedUser(null);
      });

      expect(result.current.selectedUserId).toBeNull();
    });
  });

  describe('User Ban/Unban', () => {
    const mockUser = {
      id: 'user-1',
      email: 'user1@example.com',
      name: 'User One',
      role: 'user' as const,
      isActive: true,
      isBanned: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    beforeEach(() => {
      const { result } = renderHook(() => useAdminStore());
      act(() => {
        result.current.setUsers([mockUser]);
      });
    });

    it('should ban a user and emit USER_BANNED event', () => {
      const { result } = renderHook(() => useAdminStore());
      const mockListener = jest.fn();

      eventBus.subscribe(EVENT_NAMES.USER_BANNED, mockListener);

      act(() => {
        result.current.banUser(
          'user-1',
          'admin-123',
          'Violated terms of service'
        );
      });

      // Verify state updated
      const bannedUser = result.current.users.find((u) => u.id === 'user-1');
      expect(bannedUser?.isBanned).toBe(true);
      expect(bannedUser?.isActive).toBe(false);

      // Verify event emitted
      expect(mockListener).toHaveBeenCalledTimes(1);
      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.userId).toBe('user-1');
      expect(emittedEvent.adminId).toBe('admin-123');
      expect(emittedEvent.reason).toBe('Violated terms of service');
      expect(emittedEvent.timestamp).toBeDefined();
      expect(typeof emittedEvent.timestamp).toBe('number');
    });

    it('should unban a user and emit USER_UNBANNED event', () => {
      const { result } = renderHook(() => useAdminStore());
      const mockListener = jest.fn();

      // First ban the user
      act(() => {
        result.current.banUser('user-1', 'admin-123', 'Test ban');
      });

      eventBus.subscribe(EVENT_NAMES.USER_UNBANNED, mockListener);

      // Then unban
      act(() => {
        result.current.unbanUser('user-1', 'admin-123');
      });

      // Verify state updated
      const unbannedUser = result.current.users.find((u) => u.id === 'user-1');
      expect(unbannedUser?.isBanned).toBe(false);
      expect(unbannedUser?.isActive).toBe(true);

      // Verify event emitted
      expect(mockListener).toHaveBeenCalledTimes(1);
      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.userId).toBe('user-1');
      expect(emittedEvent.adminId).toBe('admin-123');
      expect(emittedEvent.timestamp).toBeDefined();
    });

    it('should handle banning non-existent user gracefully', () => {
      const { result } = renderHook(() => useAdminStore());
      const mockListener = jest.fn();

      eventBus.subscribe(EVENT_NAMES.USER_BANNED, mockListener);

      act(() => {
        result.current.banUser('non-existent', 'admin-123', 'Test');
      });

      // Should still emit event even if user doesn't exist
      expect(mockListener).toHaveBeenCalledTimes(1);
    });

    it('should handle empty ban reason', () => {
      const { result } = renderHook(() => useAdminStore());
      const mockListener = jest.fn();

      eventBus.subscribe(EVENT_NAMES.USER_BANNED, mockListener);

      act(() => {
        result.current.banUser('user-1', 'admin-123', '');
      });

      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.reason).toBe('');
    });

    it('should handle multiple rapid ban/unban operations', () => {
      const { result } = renderHook(() => useAdminStore());

      act(() => {
        // Rapid operations
        result.current.banUser('user-1', 'admin-123', 'Test 1');
        result.current.unbanUser('user-1', 'admin-123');
        result.current.banUser('user-1', 'admin-123', 'Test 2');
        result.current.unbanUser('user-1', 'admin-123');
      });

      const user = result.current.users.find((u) => u.id === 'user-1');
      expect(user?.isBanned).toBe(false);
      expect(user?.isActive).toBe(true);
    });

    it('should handle special characters in ban reason', () => {
      const { result } = renderHook(() => useAdminStore());
      const mockListener = jest.fn();
      const specialReason = '\\n\\t"\\\'<>&@#$%^&*()[]{}';

      eventBus.subscribe(EVENT_NAMES.USER_BANNED, mockListener);

      act(() => {
        result.current.banUser('user-1', 'admin-123', specialReason);
      });

      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.reason).toBe(specialReason);
    });
  });

  describe('Dashboard Metrics', () => {
    it('should set metrics', () => {
      const { result } = renderHook(() => useAdminStore());

      const metrics = {
        totalUsers: 100,
        activeUsers: 75,
        totalConversations: 500,
        totalMessages: 2500,
        avgMessagesPerUser: 25,
        lastUpdated: Date.now(),
      };

      act(() => {
        result.current.setMetrics(metrics);
      });

      expect(result.current.metrics).toEqual(metrics);
    });

    it('should refresh dashboard and emit ADMIN_DASHBOARD_REFRESH event with manual source', async () => {
      const { result } = renderHook(() => useAdminStore());
      const mockListener = jest.fn();

      eventBus.subscribe(EVENT_NAMES.ADMIN_DASHBOARD_REFRESH, mockListener);

      act(() => {
        result.current.refreshDashboard('manual');
      });

      // Verify refreshing state is set
      expect(result.current.isRefreshing).toBe(true);

      // Verify event emitted
      expect(mockListener).toHaveBeenCalledTimes(1);
      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.source).toBe('manual');
      expect(emittedEvent.timestamp).toBeDefined();

      // Wait for refreshing to complete
      await waitFor(
        () => {
          expect(result.current.isRefreshing).toBe(false);
        },
        { timeout: 2000 }
      );
    });

    it('should refresh dashboard with auto source', () => {
      const { result } = renderHook(() => useAdminStore());
      const mockListener = jest.fn();

      eventBus.subscribe(EVENT_NAMES.ADMIN_DASHBOARD_REFRESH, mockListener);

      act(() => {
        result.current.refreshDashboard('auto');
      });

      const emittedEvent = mockListener.mock.calls[0]?.[0];
      expect(emittedEvent.source).toBe('auto');
      expect(result.current.isRefreshing).toBe(true);
    });
  });

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useAdminStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should set refreshing state', () => {
      const { result } = renderHook(() => useAdminStore());

      act(() => {
        result.current.setRefreshing(true);
      });

      expect(result.current.isRefreshing).toBe(true);

      act(() => {
        result.current.setRefreshing(false);
      });

      expect(result.current.isRefreshing).toBe(false);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => useAdminStore());
      const errorMessage = 'Failed to load users';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear error state', () => {
      const { result } = renderHook(() => useAdminStore());

      act(() => {
        result.current.setError('Some error');
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Event Integration', () => {
    it('should emit all admin events with correct payload structure', () => {
      const { result } = renderHook(() => useAdminStore());
      const events: Array<{ name: string; payload: any }> = [];

      // Set up test user
      act(() => {
        result.current.setUsers([
          {
            id: 'user-1',
            email: 'user1@example.com',
            name: 'User One',
            role: 'user',
            isActive: true,
            isBanned: false,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        ]);
      });

      // Subscribe to all admin events
      eventBus.subscribe(EVENT_NAMES.USER_BANNED, (payload: any) => {
        events.push({ name: 'USER_BANNED', payload });
      });
      eventBus.subscribe(EVENT_NAMES.USER_UNBANNED, (payload: any) => {
        events.push({ name: 'USER_UNBANNED', payload });
      });
      eventBus.subscribe(
        EVENT_NAMES.ADMIN_DASHBOARD_REFRESH,
        (payload: any) => {
          events.push({ name: 'ADMIN_DASHBOARD_REFRESH', payload });
        }
      );

      // Perform actions
      act(() => {
        result.current.banUser('user-1', 'admin-123', 'Test ban');
        result.current.unbanUser('user-1', 'admin-123');
        result.current.refreshDashboard('manual');
      });

      // Verify all events were emitted
      expect(events).toHaveLength(3);
      expect(events.map((e) => e.name)).toEqual([
        'USER_BANNED',
        'USER_UNBANNED',
        'ADMIN_DASHBOARD_REFRESH',
      ]);

      // Verify event payloads have timestamps
      events.forEach((event) => {
        expect(event.payload.timestamp).toBeDefined();
        expect(typeof event.payload.timestamp).toBe('number');
      });
    });

    it('should maintain event order', () => {
      const { result } = renderHook(() => useAdminStore());
      const eventOrder: string[] = [];

      // Set up test user
      act(() => {
        result.current.setUsers([
          {
            id: 'user-1',
            email: 'user1@example.com',
            name: 'User One',
            role: 'user',
            isActive: true,
            isBanned: false,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        ]);
      });

      eventBus.subscribe(EVENT_NAMES.USER_BANNED, () => {
        eventOrder.push('BANNED');
      });
      eventBus.subscribe(EVENT_NAMES.USER_UNBANNED, () => {
        eventOrder.push('UNBANNED');
      });
      eventBus.subscribe(EVENT_NAMES.ADMIN_DASHBOARD_REFRESH, () => {
        eventOrder.push('REFRESH');
      });

      act(() => {
        result.current.banUser('user-1', 'admin-123', 'Test');
        result.current.unbanUser('user-1', 'admin-123');
        result.current.refreshDashboard('manual');
      });

      expect(eventOrder).toEqual(['BANNED', 'UNBANNED', 'REFRESH']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle large user lists', () => {
      const { result } = renderHook(() => useAdminStore());

      const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
        id: `user-${i}`,
        email: `user${i}@example.com`,
        name: `User ${i}`,
        role: 'user' as const,
        isActive: true,
        isBanned: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      }));

      act(() => {
        result.current.setUsers(largeUserList);
      });

      expect(result.current.users).toHaveLength(1000);

      act(() => {
        result.current.banUser('user-500', 'admin-123', 'Test');
      });

      const bannedUser = result.current.users.find((u) => u.id === 'user-500');
      expect(bannedUser?.isBanned).toBe(true);
    });

    it('should handle updating multiple users in succession', () => {
      const { result } = renderHook(() => useAdminStore());

      const users = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User One',
          role: 'user' as const,
          isActive: true,
          isBanned: false,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User Two',
          role: 'user' as const,
          isActive: true,
          isBanned: false,
          createdAt: '2025-01-02T00:00:00.000Z',
          updatedAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      act(() => {
        result.current.setUsers(users);
        result.current.updateUser('user-1', { name: 'Updated One' });
        result.current.updateUser('user-2', { name: 'Updated Two' });
      });

      expect(result.current.users[0]?.name).toBe('Updated One');
      expect(result.current.users[1]?.name).toBe('Updated Two');
    });

    it('should handle metrics with zero values', () => {
      const { result } = renderHook(() => useAdminStore());

      const zeroMetrics = {
        totalUsers: 0,
        activeUsers: 0,
        totalConversations: 0,
        totalMessages: 0,
        avgMessagesPerUser: 0,
        lastUpdated: Date.now(),
      };

      act(() => {
        result.current.setMetrics(zeroMetrics);
      });

      expect(result.current.metrics).toEqual(zeroMetrics);
    });

    it('should handle role change from user to admin', () => {
      const { result } = renderHook(() => useAdminStore());

      const user = {
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User One',
        role: 'user' as const,
        isActive: true,
        isBanned: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      act(() => {
        result.current.setUsers([user]);
        result.current.updateUser('user-1', { role: 'admin' });
      });

      const updatedUser = result.current.users.find((u) => u.id === 'user-1');
      expect(updatedUser?.role).toBe('admin');
    });
  });
});
