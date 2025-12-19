import { renderHook, cleanup } from '@testing-library/react';
import { act } from 'react';
import { getEventBus } from './event-bus';
import { EVENT_NAMES } from './event-types';
import { useEventBus } from './hooks/useEventBus';

describe('Memory Leak Verification', () => {
  let eventBus: ReturnType<typeof getEventBus>;

  beforeEach(() => {
    eventBus = getEventBus();
    eventBus.clear();
  });

  afterEach(() => {
    eventBus.clear();
    cleanup();
  });

  describe('useEventBus Hook Cleanup', () => {
    it('should remove listener on component unmount', () => {
      const mockCallback = jest.fn();
      const { unmount } = renderHook(() =>
        useEventBus(EVENT_NAMES.USER_LOGGED_IN, mockCallback)
      );

      // Emit event before unmount
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          user: {
            id: 'user-1',
            email: 'test@test.com',
            name: 'Test',
            role: 'user',
          },
          timestamp: Date.now(),
        });
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Unmount component
      unmount();

      // Reset mock
      mockCallback.mockClear();

      // Emit event after unmount - should NOT be called
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          user: {
            id: 'user-2',
            email: 'test2@test.com',
            name: 'Test2',
            role: 'user',
          },
          timestamp: Date.now(),
        });
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle multiple mount/unmount cycles without memory leaks', () => {
      const mockCallback = jest.fn();

      // Mount and unmount 10 times
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() =>
          useEventBus(EVENT_NAMES.CONVERSATION_CREATED, mockCallback)
        );

        act(() => {
          eventBus.emit(EVENT_NAMES.CONVERSATION_CREATED, {
            conversationId: `conv-${i}`,
            userId: 'user-1',
            timestamp: Date.now(),
          });
        });

        unmount();
      }

      // Should have been called exactly 10 times (once per mount)
      expect(mockCallback).toHaveBeenCalledTimes(10);

      // Clear mock
      mockCallback.mockClear();

      // After all unmounts, no listener should remain
      act(() => {
        eventBus.emit(EVENT_NAMES.CONVERSATION_CREATED, {
          conversationId: 'conv-final',
          userId: 'user-1',
          timestamp: Date.now(),
        });
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle multiple hooks listening to same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      const { unmount: unmount1 } = renderHook(() =>
        useEventBus(EVENT_NAMES.CHAT_MESSAGE_SENT, callback1)
      );
      const { unmount: unmount2 } = renderHook(() =>
        useEventBus(EVENT_NAMES.CHAT_MESSAGE_SENT, callback2)
      );
      const { unmount: unmount3 } = renderHook(() =>
        useEventBus(EVENT_NAMES.CHAT_MESSAGE_SENT, callback3)
      );

      // All should receive the event
      act(() => {
        eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_SENT, {
          conversationId: 'conv-1',
          messageId: 'msg-1',
          userId: 'user-1',
          timestamp: Date.now(),
        });
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);

      // Unmount first hook
      unmount1();
      callback1.mockClear();
      callback2.mockClear();
      callback3.mockClear();

      // Only 2 and 3 should receive event
      act(() => {
        eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_SENT, {
          conversationId: 'conv-1',
          messageId: 'msg-2',
          userId: 'user-1',
          timestamp: Date.now(),
        });
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);

      // Unmount remaining hooks
      unmount2();
      unmount3();
      callback2.mockClear();
      callback3.mockClear();

      // No callbacks should receive event
      act(() => {
        eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_SENT, {
          conversationId: 'conv-1',
          messageId: 'msg-3',
          userId: 'user-1',
          timestamp: Date.now(),
        });
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).not.toHaveBeenCalled();
    });
  });

  describe('Manual Unsubscribe', () => {
    it('should not receive events after manual unsubscribe', () => {
      const mockListener = jest.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.THEME_CHANGED,
        mockListener
      );

      // Should receive event
      act(() => {
        eventBus.emit(EVENT_NAMES.THEME_CHANGED, {
          userId: 'user-1',
          theme: 'dark',
          timestamp: Date.now(),
        });
      });

      expect(mockListener).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();
      mockListener.mockClear();

      // Should NOT receive event
      act(() => {
        eventBus.emit(EVENT_NAMES.THEME_CHANGED, {
          userId: 'user-1',
          theme: 'light',
          timestamp: Date.now(),
        });
      });

      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should handle unsubscribe called multiple times', () => {
      const mockListener = jest.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.USER_BANNED,
        mockListener
      );

      // Call unsubscribe multiple times (should not throw)
      expect(() => {
        unsubscribe();
        unsubscribe();
        unsubscribe();
      }).not.toThrow();

      // Should not receive event
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_BANNED, {
          userId: 'user-1',
          bannedBy: 'admin-1',
          reason: 'Test',
          timestamp: Date.now(),
        });
      });

      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should not affect other listeners when unsubscribing one', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      const unsubscribe1 = eventBus.subscribe(
        EVENT_NAMES.ADMIN_DASHBOARD_REFRESH,
        listener1
      );
      const unsubscribe2 = eventBus.subscribe(
        EVENT_NAMES.ADMIN_DASHBOARD_REFRESH,
        listener2
      );
      const unsubscribe3 = eventBus.subscribe(
        EVENT_NAMES.ADMIN_DASHBOARD_REFRESH,
        listener3
      );

      // Unsubscribe middle listener
      unsubscribe2();

      // Emit event
      act(() => {
        eventBus.emit(EVENT_NAMES.ADMIN_DASHBOARD_REFRESH, {
          source: 'manual',
          timestamp: Date.now(),
        });
      });

      // Only 1 and 3 should be called
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).toHaveBeenCalledTimes(1);

      // Cleanup
      unsubscribe1();
      unsubscribe3();
    });
  });

  describe('Event History Limits', () => {
    it('should limit event history to prevent memory growth', () => {
      const maxEvents = 1000; // From EventBusOptions

      // Emit more than maxEvents
      for (let i = 0; i < maxEvents + 500; i++) {
        act(() => {
          eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_SENT, {
            conversationId: 'conv-1',
            messageId: `msg-${i}`,
            userId: 'user-1',
            timestamp: Date.now(),
          });
        });
      }

      // Get history using public method
      const history = eventBus.getEventHistory();

      // Should not exceed maxEvents
      expect(history.length).toBeLessThanOrEqual(maxEvents);
    });

    it('should maintain FIFO order in event history', () => {
      const testEvents = [
        { name: EVENT_NAMES.USER_LOGGED_IN, data: { userId: 'user-1' } },
        {
          name: EVENT_NAMES.CONVERSATION_CREATED,
          data: { conversationId: 'conv-1' },
        },
        { name: EVENT_NAMES.CHAT_MESSAGE_SENT, data: { messageId: 'msg-1' } },
      ];

      // Clear history
      eventBus.clear();

      // Emit events
      testEvents.forEach((event) => {
        act(() => {
          eventBus.emit(event.name, { ...event.data, timestamp: Date.now() });
        });
      });

      // Get history
      const history = eventBus.getEventHistory();

      // Should have 3 events
      expect(history.length).toBeGreaterThanOrEqual(3);

      // Last 3 events should match (most recent first)
      const lastThree = history.slice(-3);
      expect(lastThree[0]?.name).toBe(EVENT_NAMES.USER_LOGGED_IN);
      expect(lastThree[1]?.name).toBe(EVENT_NAMES.CONVERSATION_CREATED);
      expect(lastThree[2]?.name).toBe(EVENT_NAMES.CHAT_MESSAGE_SENT);
    });
  });

  describe('Clear Method', () => {
    it('should remove all listeners and clear history', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, listener1);
      eventBus.subscribe(EVENT_NAMES.USER_LOGGED_OUT, listener2);
      eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, listener3);

      // Emit some events to populate history
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          user: {
            id: 'user-1',
            email: 'test@test.com',
            name: 'Test',
            role: 'user',
          },
          timestamp: Date.now(),
        });
      });

      // Clear everything
      eventBus.clear();
      eventBus.clearHistory();

      // History should be empty after clear
      let history = eventBus.getEventHistory();
      expect(history.length).toBe(0);

      // Emit events again - no listeners should be called
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          user: {
            id: 'user-2',
            email: 'test2@test.com',
            name: 'Test2',
            role: 'user',
          },
          timestamp: Date.now(),
        });
        eventBus.emit(EVENT_NAMES.USER_LOGGED_OUT, {
          userId: 'user-2',
          timestamp: Date.now(),
        });
        eventBus.emit(EVENT_NAMES.THEME_CHANGED, {
          userId: 'user-2',
          theme: 'dark',
          timestamp: Date.now(),
        });
      });

      expect(listener1).toHaveBeenCalledTimes(1); // Only once before clear
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).not.toHaveBeenCalled();

      // History should now contain 3 new events (from emits after clear)
      history = eventBus.getEventHistory();
      expect(history.length).toBe(3);
    });
  });

  describe('Memory Profiling', () => {
    it('should handle rapid event emissions without errors', () => {
      const listener = jest.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.CHAT_MESSAGE_SENT,
        listener
      );

      // Rapid emissions
      for (let i = 0; i < 10000; i++) {
        act(() => {
          eventBus.emit(EVENT_NAMES.CHAT_MESSAGE_SENT, {
            conversationId: 'conv-1',
            messageId: `msg-${i}`,
            userId: 'user-1',
            timestamp: Date.now(),
          });
        });
      }

      // Should be called 10000 times
      expect(listener).toHaveBeenCalledTimes(10000);

      // Verify event history is limited
      const history = eventBus.getEventHistory();
      expect(history.length).toBeLessThanOrEqual(1000);

      unsubscribe();
    });

    it('should handle multiple listeners with rapid emissions', () => {
      const listeners = Array.from({ length: 100 }, () => jest.fn());
      const unsubscribes = listeners.map((listener) =>
        eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, listener)
      );

      // Emit 100 events with 100 listeners = 10,000 total listener calls
      for (let i = 0; i < 100; i++) {
        act(() => {
          eventBus.emit(EVENT_NAMES.CONVERSATION_CREATED, {
            conversationId: `conv-${i}`,
            userId: 'user-1',
            timestamp: Date.now(),
          });
        });
      }

      // Each listener should be called 100 times
      listeners.forEach((listener) => {
        expect(listener).toHaveBeenCalledTimes(100);
      });

      // Cleanup all listeners
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    });
  });

  describe('Edge Cases', () => {
    it('should handle subscribing and immediately unsubscribing', () => {
      const listener = jest.fn();
      const unsubscribe = eventBus.subscribe(
        EVENT_NAMES.USER_PROFILE_UPDATED,
        listener
      );

      // Unsubscribe immediately
      unsubscribe();

      // Emit event
      act(() => {
        eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
          userId: 'user-1',
          changes: { name: 'New Name' },
          timestamp: Date.now(),
        });
      });

      // Should not be called
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle unsubscribe within event listener', () => {
      const listener = jest.fn();
      let unsubscribe: (() => void) | undefined;

      unsubscribe = eventBus.subscribe(EVENT_NAMES.TOAST_SHOW, (event: any) => {
        listener(event);
        // Unsubscribe self
        if (unsubscribe) {
          unsubscribe();
        }
      });

      // First emit - should be called
      act(() => {
        eventBus.emit(EVENT_NAMES.TOAST_SHOW, {
          message: 'Test 1',
          type: 'success',
          duration: 3000,
          timestamp: Date.now(),
        });
      });

      expect(listener).toHaveBeenCalledTimes(1);

      // Second emit - should NOT be called (unsubscribed)
      act(() => {
        eventBus.emit(EVENT_NAMES.TOAST_SHOW, {
          message: 'Test 2',
          type: 'info',
          duration: 3000,
          timestamp: Date.now(),
        });
      });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should handle subscribing the same listener twice', () => {
      const listener = jest.fn();

      // Subscribe same listener twice
      const unsubscribe1 = eventBus.subscribe(
        EVENT_NAMES.ERROR_OCCURRED,
        listener
      );
      const unsubscribe2 = eventBus.subscribe(
        EVENT_NAMES.ERROR_OCCURRED,
        listener
      );

      // Emit event - Since Sets only store unique references,
      // the listener should only be called once (Set deduplication)
      act(() => {
        eventBus.emit(EVENT_NAMES.ERROR_OCCURRED, {
          error: { message: 'Test error', code: 'TEST_ERROR' },
          source: 'test',
          timestamp: Date.now(),
        });
      });

      expect(listener).toHaveBeenCalledTimes(1);

      // Cleanup
      unsubscribe1();
      unsubscribe2();
    });
  });
});
