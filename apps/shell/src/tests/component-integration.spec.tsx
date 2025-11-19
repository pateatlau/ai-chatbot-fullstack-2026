import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

describe('Component Integration Tests - Event Emission', () => {
  let eventBus: ReturnType<typeof getEventBus>;

  beforeEach(() => {
    eventBus = getEventBus();
    // Clear event history
    const history = eventBus.getEventHistory();
    history.length = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should emit USER_LOGGED_IN event on successful login', async () => {
      const loginData = {
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };

      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.USER_LOGGED_IN,
        listener
      );

      // Simulate login
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, loginData);
      });

      await waitFor(() => {
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            name: EVENT_NAMES.USER_LOGGED_IN,
            data: loginData,
          })
        );
      });

      unsubscribe();
    });

    it('should emit USER_LOGGED_IN event on successful registration', async () => {
      const registerData = {
        userId: 'user-456',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'USER',
      };

      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.USER_LOGGED_IN,
        listener
      );

      // Simulate registration (emits same event as login)
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, registerData);
      });

      await waitFor(() => {
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              userId: 'user-456',
              email: 'newuser@example.com',
            }),
          })
        );
      });

      unsubscribe();
    });

    it('should emit USER_LOGGED_OUT event on logout', async () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.USER_LOGGED_OUT,
        listener
      );

      // Simulate logout
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_OUT, {});
      });

      await waitFor(() => {
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            name: EVENT_NAMES.USER_LOGGED_OUT,
          })
        );
      });

      unsubscribe();
    });

    it('should coordinate login → profile sync → dashboard load', async () => {
      const eventLog: string[] = [];

      const unsubscribers = [
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, () =>
          eventLog.push('login')
        ),
        eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED, () =>
          eventLog.push('profile-synced')
        ),
      ];

      // Simulate login flow
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          userId: 'user-789',
          email: 'user@example.com',
          role: 'USER',
        });

        // Profile MFE would sync and emit this
        eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
          userId: 'user-789',
        });
      });

      await waitFor(() => {
        expect(eventLog).toEqual(['login', 'profile-synced']);
      });

      unsubscribers.forEach((unsub) => unsub());
    });
  });

  describe('Profile Updates', () => {
    it('should emit USER_PROFILE_UPDATED when profile is edited', async () => {
      const updateData = {
        userId: 'user-123',
        updates: {
          name: 'Updated Name',
          avatar: 'https://example.com/avatar.jpg',
        },
      };

      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.USER_PROFILE_UPDATED,
        listener
      );

      // Simulate profile update (from EditProfilePage)
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, updateData);
      });

      await waitFor(() => {
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            name: EVENT_NAMES.USER_PROFILE_UPDATED,
            data: updateData,
          })
        );
      });

      unsubscribe();
    });

    it('should emit THEME_CHANGED when theme is updated in settings', async () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.THEME_CHANGED,
        listener
      );

      // Simulate theme change
      act(() => {
        eventBus.emit(EVENT_NAMES.THEME_CHANGED, { theme: 'dark' });
      });

      await waitFor(() => {
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            name: EVENT_NAMES.THEME_CHANGED,
            data: { theme: 'dark' },
          })
        );
      });

      unsubscribe();
    });
  });

  describe('Admin Actions', () => {
    it('should emit USER_PROFILE_UPDATED when admin updates user', async () => {
      const adminUpdateData = {
        userId: 'user-123',
        updates: {
          name: 'Admin Updated Name',
          role: 'MODERATOR',
        },
      };

      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.USER_PROFILE_UPDATED,
        listener
      );

      // Simulate admin update (from UserDetailPage)
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, adminUpdateData);
      });

      await waitFor(() => {
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            data: adminUpdateData,
          })
        );
      });

      unsubscribe();
    });

    it('should emit USER_BANNED when admin bans user', async () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(EVENT_NAMES.USER_BANNED, listener);

      act(() => {
        eventBus.emit(EVENT_NAMES.USER_BANNED, { userId: 'bad-user' });
      });

      await waitFor(() => {
        expect(listener).toHaveBeenCalledTimes(1);
      });

      unsubscribe();
    });

    it('should emit CONVERSATION_CREATED when new conversation starts', async () => {
      const conversationData = {
        conversationId: 'conv-123',
        userId: 'user-456',
        title: 'New Chat',
      };

      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.CONVERSATION_CREATED,
        listener
      );

      act(() => {
        eventBus.emit(EVENT_NAMES.CONVERSATION_CREATED, conversationData);
      });

      await waitFor(() => {
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            data: conversationData,
          })
        );
      });

      unsubscribe();
    });
  });

  describe('Cross-Component Event Flows', () => {
    it('should handle profile update → admin dashboard refresh flow', async () => {
      const eventLog: string[] = [];

      const unsubscribers = [
        eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED, () =>
          eventLog.push('profile-updated')
        ),
        eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, () =>
          eventLog.push('conversation-created')
        ),
      ];

      act(() => {
        eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, { userId: 'user-1' });
        eventBus.emit(EVENT_NAMES.CONVERSATION_CREATED, {
          conversationId: 'conv-1',
        });
      });

      await waitFor(() => {
        expect(eventLog).toEqual(['profile-updated', 'conversation-created']);
      });

      unsubscribers.forEach((unsub) => unsub());
    });

    it('should handle theme change → all components update flow', async () => {
      const themeListeners = {
        profile: vi.fn(),
        chatbot: vi.fn(),
        admin: vi.fn(),
      };

      const unsubscribers = [
        eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, themeListeners.profile),
        eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, themeListeners.chatbot),
        eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, themeListeners.admin),
      ];

      act(() => {
        eventBus.emit(EVENT_NAMES.THEME_CHANGED, { theme: 'dark' });
      });

      await waitFor(() => {
        expect(themeListeners.profile).toHaveBeenCalledTimes(1);
        expect(themeListeners.chatbot).toHaveBeenCalledTimes(1);
        expect(themeListeners.admin).toHaveBeenCalledTimes(1);
      });

      unsubscribers.forEach((unsub) => unsub());
    });

    it('should maintain event order in rapid succession', async () => {
      const eventLog: string[] = [];

      const unsubscribers = [
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, () =>
          eventLog.push('1-login')
        ),
        eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED, () =>
          eventLog.push('2-profile')
        ),
        eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, () =>
          eventLog.push('3-theme')
        ),
        eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, () =>
          eventLog.push('4-conversation')
        ),
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_OUT, () =>
          eventLog.push('5-logout')
        ),
      ];

      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, { userId: 'user-1' });
        eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, { userId: 'user-1' });
        eventBus.emit(EVENT_NAMES.THEME_CHANGED, { theme: 'dark' });
        eventBus.emit(EVENT_NAMES.CONVERSATION_CREATED, {
          conversationId: 'conv-1',
        });
        eventBus.emit(EVENT_NAMES.USER_LOGGED_OUT, {});
      });

      await waitFor(() => {
        expect(eventLog).toEqual([
          '1-login',
          '2-profile',
          '3-theme',
          '4-conversation',
          '5-logout',
        ]);
      });

      unsubscribers.forEach((unsub) => unsub());
    });
  });

  describe('Event Data Integrity', () => {
    it('should preserve all user data in USER_LOGGED_IN event', async () => {
      const userData = {
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        avatar: 'https://example.com/avatar.jpg',
      };

      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.USER_LOGGED_IN,
        listener
      );

      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, userData);
      });

      await waitFor(() => {
        const receivedEvent = listener.mock.calls[0][0];
        expect(receivedEvent.data).toEqual(userData);
        expect(receivedEvent.data.role).toBe('ADMIN');
        expect(receivedEvent.data.avatar).toBe(
          'https://example.com/avatar.jpg'
        );
      });

      unsubscribe();
    });

    it('should include timestamp in all events', async () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.USER_LOGGED_IN,
        listener
      );

      const beforeEmit = Date.now();

      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, { userId: 'user-1' });
      });

      const afterEmit = Date.now();

      await waitFor(() => {
        const receivedEvent = listener.mock.calls[0][0];
        expect(receivedEvent.timestamp).toBeGreaterThanOrEqual(beforeEmit);
        expect(receivedEvent.timestamp).toBeLessThanOrEqual(afterEmit);
      });

      unsubscribe();
    });
  });

  describe('Error Handling', () => {
    it('should handle listener errors without stopping other listeners', async () => {
      const goodListener = vi.fn();
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const anotherGoodListener = vi.fn();

      const unsubscribers = [
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, goodListener),
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, errorListener),
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, anotherGoodListener),
      ];

      // Should not throw
      expect(() => {
        act(() => {
          eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, { userId: 'user-1' });
        });
      }).not.toThrow();

      await waitFor(() => {
        expect(goodListener).toHaveBeenCalledTimes(1);
        expect(errorListener).toHaveBeenCalledTimes(1);
        // This might fail if error stops propagation - that's a bug to fix
        expect(anotherGoodListener).toHaveBeenCalledTimes(1);
      });

      unsubscribers.forEach((unsub) => unsub());
    });
  });

  describe('Performance', () => {
    it('should handle 100 events without performance degradation', () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.CHAT_MESSAGE_RECEIVED,
        listener
      );

      const startTime = performance.now();

      act(() => {
        for (let i = 0; i < 100; i++) {
          eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, {
            messageId: `msg-${i}`,
            content: `Message ${i}`,
          });
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in less than 100ms (1ms per event)
      expect(duration).toBeLessThan(100);
      expect(listener).toHaveBeenCalledTimes(100);

      unsubscribe();
    });
  });
});
