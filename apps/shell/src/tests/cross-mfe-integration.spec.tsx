import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';
import { useShellEventCoordination } from '../hooks/useEventDrivenStores';

describe('Cross-MFE Integration Tests', () => {
  let eventBus: ReturnType<typeof getEventBus>;

  beforeEach(() => {
    eventBus = getEventBus();
    // Clear event history before each test
    const history = eventBus.getEventHistory();
    history.length = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Shell Event Coordination', () => {
    it('should initialize event bus at shell level', () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      // Verify event bus is accessible
      expect(eventBus).toBeDefined();
      expect(typeof eventBus.emit).toBe('function');
      expect(typeof eventBus.subscribe).toBe('function');

      unmount();
    });

    it('should log events in development mode', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { unmount } = renderHook(() => useShellEventCoordination());

      // Emit a test event
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          userId: 'test-123',
          role: 'user',
        });
      });

      // Should log the event
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Shell Event Bus]'),
        expect.objectContaining({
          name: EVENT_NAMES.USER_LOGGED_IN,
        })
      );

      process.env.NODE_ENV = originalEnv;
      unmount();
    });

    it('should coordinate authentication events', async () => {
      const { unmount } = renderHook(() => useShellEventCoordination());
      const consoleSpy = vi.spyOn(console, 'log');

      // Simulate login
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          userId: 'user-456',
          email: 'test@example.com',
          role: 'user',
        });
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[Shell] User logged in'),
          expect.objectContaining({
            userId: 'user-456',
            role: 'user',
          })
        );
      });

      // Simulate logout
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_OUT, {});
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[Shell] User logged out')
        );
      });

      unmount();
    });

    it('should track event history size', () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      // Emit multiple events
      act(() => {
        for (let i = 0; i < 50; i++) {
          eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, {
            messageId: `msg-${i}`,
            content: `Test message ${i}`,
          });
        }
      });

      const history = eventBus.getEventHistory();
      expect(history.length).toBeGreaterThanOrEqual(50);

      unmount();
    });
  });

  describe('Cross-MFE Event Flows', () => {
    it('should propagate USER_LOGGED_IN to all MFEs', async () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      const loginData = {
        userId: 'user-789',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
      };

      // Subscribe to verify event reaches all potential MFEs
      const chatbotListener = vi.fn();
      const adminListener = vi.fn();
      const profileListener = vi.fn();

      const unsubscribers = [
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, chatbotListener),
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, adminListener),
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, profileListener),
      ];

      // Emit login event
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, loginData);
      });

      await waitFor(() => {
        expect(chatbotListener).toHaveBeenCalledWith(
          expect.objectContaining({
            name: EVENT_NAMES.USER_LOGGED_IN,
            data: loginData,
          })
        );
        expect(adminListener).toHaveBeenCalledTimes(1);
        expect(profileListener).toHaveBeenCalledTimes(1);
      });

      unsubscribers.forEach((unsub) => unsub());
      unmount();
    });

    it('should propagate USER_LOGGED_OUT to all MFEs', async () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      const logoutListener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.USER_LOGGED_OUT,
        logoutListener
      );

      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_OUT, {});
      });

      await waitFor(() => {
        expect(logoutListener).toHaveBeenCalledWith(
          expect.objectContaining({
            name: EVENT_NAMES.USER_LOGGED_OUT,
          })
        );
      });

      unsubscribe();
      unmount();
    });

    it('should propagate THEME_CHANGED from profile to all MFEs', async () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      const themeListener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.THEME_CHANGED,
        themeListener
      );

      act(() => {
        eventBus.emit(EVENT_NAMES.THEME_CHANGED, { theme: 'dark' });
      });

      await waitFor(() => {
        expect(themeListener).toHaveBeenCalledWith(
          expect.objectContaining({
            name: EVENT_NAMES.THEME_CHANGED,
            data: { theme: 'dark' },
          })
        );
      });

      unsubscribe();
      unmount();
    });

    it('should propagate CONVERSATION_CREATED to admin dashboard', async () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      const conversationListener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.CONVERSATION_CREATED,
        conversationListener
      );

      const conversationData = {
        conversationId: 'conv-123',
        userId: 'user-456',
        title: 'New Conversation',
      };

      act(() => {
        eventBus.emit(EVENT_NAMES.CONVERSATION_CREATED, conversationData);
      });

      await waitFor(() => {
        expect(conversationListener).toHaveBeenCalledWith(
          expect.objectContaining({
            name: EVENT_NAMES.CONVERSATION_CREATED,
            data: conversationData,
          })
        );
      });

      unsubscribe();
      unmount();
    });

    it('should handle multiple concurrent events without loss', async () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      const listeners = {
        login: vi.fn(),
        message: vi.fn(),
        theme: vi.fn(),
        conversation: vi.fn(),
      };

      const unsubscribers = [
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, listeners.login),
        eventBus.subscribe(
          EVENT_NAMES.CHAT_MESSAGE_RECEIVED,
          listeners.message
        ),
        eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, listeners.theme),
        eventBus.subscribe(
          EVENT_NAMES.CONVERSATION_CREATED,
          listeners.conversation
        ),
      ];

      // Emit multiple events in rapid succession
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, { userId: 'user-1' });
        eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, {
          messageId: 'msg-1',
        });
        eventBus.emit(EVENT_NAMES.THEME_CHANGED, { theme: 'dark' });
        eventBus.emit(EVENT_NAMES.CONVERSATION_CREATED, {
          conversationId: 'conv-1',
        });
      });

      await waitFor(() => {
        expect(listeners.login).toHaveBeenCalledTimes(1);
        expect(listeners.message).toHaveBeenCalledTimes(1);
        expect(listeners.theme).toHaveBeenCalledTimes(1);
        expect(listeners.conversation).toHaveBeenCalledTimes(1);
      });

      unsubscribers.forEach((unsub) => unsub());
      unmount();
    });
  });

  describe('Event History Management', () => {
    it('should maintain event history under limit', () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      // Emit many events
      act(() => {
        for (let i = 0; i < 1100; i++) {
          eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, {
            messageId: `msg-${i}`,
          });
        }
      });

      const history = eventBus.getEventHistory();

      // History should be limited (default 1000)
      expect(history.length).toBeLessThanOrEqual(1000);

      unmount();
    });

    it('should provide event history for debugging', () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, { userId: 'user-1' });
        eventBus.emit(EVENT_NAMES.CONVERSATION_CREATED, {
          conversationId: 'conv-1',
        });
        eventBus.emit(EVENT_NAMES.USER_LOGGED_OUT, {});
      });

      const history = eventBus.getEventHistory();

      expect(history.length).toBeGreaterThanOrEqual(3);
      expect(history[history.length - 3].name).toBe(EVENT_NAMES.USER_LOGGED_IN);
      expect(history[history.length - 2].name).toBe(
        EVENT_NAMES.CONVERSATION_CREATED
      );
      expect(history[history.length - 1].name).toBe(
        EVENT_NAMES.USER_LOGGED_OUT
      );

      unmount();
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should cleanup listeners on unmount', () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.USER_LOGGED_IN,
        listener
      );

      // Event should be received before unmount
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, { userId: 'user-1' });
      });
      expect(listener).toHaveBeenCalledTimes(1);

      // Manually unsubscribe
      unsubscribe();

      // Event should NOT be received after unsubscribe
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, { userId: 'user-2' });
      });
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not 2

      unmount();
    });

    it('should handle rapid mount/unmount cycles', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      // Mount and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() => useShellEventCoordination());
        unmount();
      }

      // Should not cause memory issues
      const history = eventBus.getEventHistory();
      expect(history.length).toBeLessThan(100); // Reasonable limit

      consoleSpy.mockRestore();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete user session lifecycle', async () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      const eventLog: string[] = [];

      const unsubscribers = [
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, () =>
          eventLog.push('login')
        ),
        eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED, () =>
          eventLog.push('profile-updated')
        ),
        eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, () =>
          eventLog.push('conversation-created')
        ),
        eventBus.subscribe(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, () =>
          eventLog.push('message-received')
        ),
        eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, () =>
          eventLog.push('theme-changed')
        ),
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_OUT, () =>
          eventLog.push('logout')
        ),
      ];

      // Simulate user session
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          userId: 'user-1',
          role: 'user',
        });
        eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
          name: 'Updated Name',
        });
        eventBus.emit(EVENT_NAMES.CONVERSATION_CREATED, {
          conversationId: 'conv-1',
        });
        eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, {
          messageId: 'msg-1',
        });
        eventBus.emit(EVENT_NAMES.THEME_CHANGED, { theme: 'dark' });
        eventBus.emit(EVENT_NAMES.USER_LOGGED_OUT, {});
      });

      await waitFor(() => {
        expect(eventLog).toEqual([
          'login',
          'profile-updated',
          'conversation-created',
          'message-received',
          'theme-changed',
          'logout',
        ]);
      });

      unsubscribers.forEach((unsub) => unsub());
      unmount();
    });

    it('should coordinate admin actions across MFEs', async () => {
      const { unmount } = renderHook(() => useShellEventCoordination());

      const adminEvents: string[] = [];

      const unsubscribers = [
        eventBus.subscribe(EVENT_NAMES.USER_BANNED, () =>
          adminEvents.push('banned')
        ),
        eventBus.subscribe(EVENT_NAMES.USER_UNBANNED, () =>
          adminEvents.push('unbanned')
        ),
        eventBus.subscribe(EVENT_NAMES.USER_ROLE_CHANGED, () =>
          adminEvents.push('role-changed')
        ),
      ];

      act(() => {
        eventBus.emit(EVENT_NAMES.USER_BANNED, { userId: 'user-bad' });
        eventBus.emit(EVENT_NAMES.USER_UNBANNED, { userId: 'user-good' });
        eventBus.emit(EVENT_NAMES.USER_ROLE_CHANGED, {
          userId: 'user-1',
          newRole: 'admin',
        });
      });

      await waitFor(() => {
        expect(adminEvents).toEqual(['banned', 'unbanned', 'role-changed']);
      });

      unsubscribers.forEach((unsub) => unsub());
      unmount();
    });
  });
});
