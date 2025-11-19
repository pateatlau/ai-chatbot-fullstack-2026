import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@myapp/frontend/stores';
import { useChatbotStore } from '@ai-chatbot/chatbot-stores';
import { useAdminStore } from '@ai-chatbot/admin-stores';
import { useProfileStore, useProfileSync } from '@ai-chatbot/profile-stores';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

// Mock localStorage for profile store
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Cross-MFE Integration Tests', () => {
  let eventBus: ReturnType<typeof getEventBus>;

  beforeEach(() => {
    // Clear localStorage
    localStorageMock.clear();

    // Reset all store states
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });

    useChatbotStore.setState({
      conversations: [],
      currentConversationId: null,
      messages: {},
      isLoading: false,
      isSending: false,
      error: null,
    });

    useAdminStore.setState({
      users: [],
      selectedUserId: null,
      metrics: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
    });

    useProfileStore.setState({
      profile: null,
      settings: {
        theme: 'auto',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          inApp: true,
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showLocation: false,
        },
      },
      isLoading: false,
      isSaving: false,
      error: null,
    });

    // Get fresh event bus instance
    eventBus = getEventBus();
    eventBus.clear();
  });

  afterEach(() => {
    eventBus.clear();
    localStorageMock.clear();
  });

  describe('Auth → Profile Sync Flow', () => {
    it('should sync profile when user logs in', () => {
      const { result: authResult } = renderHook(() => useAuthStore());
      const { result: profileResult } = renderHook(() => useProfileStore());
      const { result: syncResult } = renderHook(() => useProfileSync());

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user' as const,
      };

      // User logs in
      act(() => {
        authResult.current.setAuth(mockUser, 'mock-token');
      });

      // Profile should be synced
      expect(profileResult.current.profile).toBeDefined();
      expect(profileResult.current.profile?.id).toBe('user-123');
      expect(profileResult.current.profile?.email).toBe('user@example.com');
      expect(profileResult.current.profile?.name).toBe('Test User');
    });

    it('should clear profile when user logs out', () => {
      const { result: authResult } = renderHook(() => useAuthStore());
      const { result: profileResult } = renderHook(() => useProfileStore());
      const { result: syncResult } = renderHook(() => useProfileSync());

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user' as const,
      };

      // Login first
      act(() => {
        authResult.current.setAuth(mockUser, 'mock-token');
      });

      expect(profileResult.current.profile).not.toBeNull();

      // Then logout
      act(() => {
        authResult.current.clearAuth();
      });

      expect(profileResult.current.profile).toBeNull();
    });

    it('should update profile when auth user changes', () => {
      const { result: authResult } = renderHook(() => useAuthStore());
      const { result: profileResult } = renderHook(() => useProfileStore());
      const { result: syncResult } = renderHook(() => useProfileSync());

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user' as const,
      };

      // Login
      act(() => {
        authResult.current.setAuth(mockUser, 'mock-token');
      });

      // Update user in auth store
      act(() => {
        authResult.current.setUser({
          ...mockUser,
          name: 'Updated Name',
          email: 'updated@example.com',
        });
      });

      // Profile should be updated
      expect(profileResult.current.profile?.name).toBe('Updated Name');
      expect(profileResult.current.profile?.email).toBe('updated@example.com');
    });
  });

  describe('Theme Change Propagation', () => {
    it('should emit THEME_CHANGED event that all MFEs can listen to', () => {
      const { result: profileResult } = renderHook(() => useProfileStore());
      const listeners: string[] = [];

      // Simulate multiple MFEs listening to theme changes
      eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, () => {
        listeners.push('MFE_1');
      });
      eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, () => {
        listeners.push('MFE_2');
      });
      eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, () => {
        listeners.push('MFE_3');
      });

      // Change theme
      act(() => {
        profileResult.current.setTheme('dark');
      });

      // All MFEs should receive the event
      expect(listeners).toEqual(['MFE_1', 'MFE_2', 'MFE_3']);
    });

    it('should allow multiple theme changes to propagate', () => {
      const { result: profileResult } = renderHook(() => useProfileStore());
      const themeHistory: string[] = [];

      eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, (event: any) => {
        themeHistory.push(event.theme);
      });

      act(() => {
        profileResult.current.setTheme('dark');
        profileResult.current.setTheme('light');
        profileResult.current.setTheme('auto');
      });

      expect(themeHistory).toEqual(['dark', 'light', 'auto']);
    });
  });

  describe('Conversation → Admin Dashboard Flow', () => {
    it('should allow admin dashboard to react to new conversations', () => {
      const { result: chatbotResult } = renderHook(() => useChatbotStore());
      const { result: adminResult } = renderHook(() => useAdminStore());
      const conversationCount = { value: 0 };

      // Admin listens to conversation created events
      eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, () => {
        conversationCount.value += 1;
        // In real app, would trigger dashboard refresh
        adminResult.current.refreshDashboard('auto');
      });

      // Create conversations
      act(() => {
        chatbotResult.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'First Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        chatbotResult.current.addConversation({
          id: 'conv-2',
          userId: 'user-123',
          title: 'Second Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      expect(conversationCount.value).toBe(2);
    });
  });

  describe('User Ban → Conversation Access Flow', () => {
    it('should demonstrate user ban event being emitted when admin bans user', () => {
      const { result: adminResult } = renderHook(() => useAdminStore());
      const bannedUsers: string[] = [];

      // Set up test user
      act(() => {
        adminResult.current.setUsers([
          {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Test User',
            role: 'user',
            isActive: true,
            isBanned: false,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        ]);
      });

      // Chatbot MFE listens for ban events
      eventBus.subscribe(EVENT_NAMES.USER_BANNED, (event: any) => {
        bannedUsers.push(event.userId);
        // In real app, would disable chat functionality for banned user
      });

      // Admin bans user
      act(() => {
        adminResult.current.banUser('user-123', 'admin-456', 'Violated TOS');
      });

      expect(bannedUsers).toContain('user-123');
    });
  });

  describe('Complete User Journey Integration', () => {
    it('should handle complete user flow: login → create conversation → update profile → logout', () => {
      const { result: authResult } = renderHook(() => useAuthStore());
      const { result: chatbotResult } = renderHook(() => useChatbotStore());
      const { result: profileResult } = renderHook(() => useProfileStore());
      const { result: syncResult } = renderHook(() => useProfileSync());

      const eventLog: string[] = [];

      // Listen to all relevant events
      eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, () => {
        eventLog.push('USER_LOGGED_IN');
      });
      eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, () => {
        eventLog.push('CONVERSATION_CREATED');
      });
      eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED, () => {
        eventLog.push('USER_PROFILE_UPDATED');
      });
      eventBus.subscribe(EVENT_NAMES.USER_LOGGED_OUT, () => {
        eventLog.push('USER_LOGGED_OUT');
      });

      // 1. User logs in
      act(() => {
        authResult.current.setAuth(
          {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Test User',
            role: 'user',
          },
          'mock-token'
        );
      });

      expect(profileResult.current.profile).not.toBeNull();

      // 2. User creates a conversation
      act(() => {
        chatbotResult.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'My First Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // 3. User updates their profile
      act(() => {
        authResult.current.setUser({
          id: 'user-123',
          email: 'user@example.com',
          name: 'Updated User',
          role: 'user',
        });
      });

      expect(profileResult.current.profile?.name).toBe('Updated User');

      // 4. User logs out
      act(() => {
        authResult.current.clearAuth();
      });

      expect(profileResult.current.profile).toBeNull();
      expect(authResult.current.isAuthenticated).toBe(false);

      // Verify event sequence
      expect(eventLog).toEqual([
        'USER_LOGGED_IN',
        'CONVERSATION_CREATED',
        'USER_PROFILE_UPDATED',
        'USER_LOGGED_OUT',
      ]);
    });
  });

  describe('Multi-MFE Event Listeners', () => {
    it('should allow multiple MFEs to listen to the same event', () => {
      const { result: chatbotResult } = renderHook(() => useChatbotStore());
      const responses: string[] = [];

      // Multiple MFEs listening to conversation created
      eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, () => {
        responses.push('Analytics MFE updated');
      });
      eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, () => {
        responses.push('Notifications MFE sent alert');
      });
      eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, () => {
        responses.push('Admin dashboard refreshed');
      });

      act(() => {
        chatbotResult.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'Test',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      expect(responses).toHaveLength(3);
      expect(responses).toContain('Analytics MFE updated');
      expect(responses).toContain('Notifications MFE sent alert');
      expect(responses).toContain('Admin dashboard refreshed');
    });
  });

  describe('Event Order and Timing', () => {
    it('should maintain event order across MFEs', () => {
      const { result: authResult } = renderHook(() => useAuthStore());
      const { result: chatbotResult } = renderHook(() => useChatbotStore());
      const { result: adminResult } = renderHook(() => useAdminStore());
      const eventSequence: string[] = [];

      eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, () => {
        eventSequence.push('LOGIN');
      });
      eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, () => {
        eventSequence.push('CONV_CREATED');
      });
      eventBus.subscribe(EVENT_NAMES.ADMIN_DASHBOARD_REFRESH, () => {
        eventSequence.push('DASHBOARD_REFRESH');
      });
      eventBus.subscribe(EVENT_NAMES.USER_LOGGED_OUT, () => {
        eventSequence.push('LOGOUT');
      });

      act(() => {
        authResult.current.setAuth(
          {
            id: 'user-123',
            email: 'test@test.com',
            name: 'Test',
            role: 'user',
          },
          'token'
        );
        chatbotResult.current.addConversation({
          id: 'conv-1',
          userId: 'user-123',
          title: 'Test',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        adminResult.current.refreshDashboard('manual');
        authResult.current.clearAuth();
      });

      expect(eventSequence).toEqual([
        'LOGIN',
        'CONV_CREATED',
        'DASHBOARD_REFRESH',
        'LOGOUT',
      ]);
    });
  });

  describe('Error Handling Across MFEs', () => {
    it('should isolate errors between MFEs', () => {
      const { result: chatbotResult } = renderHook(() => useChatbotStore());
      const { result: adminResult } = renderHook(() => useAdminStore());

      // Simulate error in one MFE
      act(() => {
        chatbotResult.current.setError('Chatbot error');
      });

      // Other MFE should not be affected
      expect(chatbotResult.current.error).toBe('Chatbot error');
      expect(adminResult.current.error).toBeNull();
    });
  });
});
