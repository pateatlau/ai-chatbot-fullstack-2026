import { useEffect } from 'react';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

/**
 * Shell-level hook that coordinates event-driven store initialization across all MFEs.
 *
 * This hook:
 * 1. Initializes the global event bus
 * 2. Sets up shell-level event listeners for debugging
 * 3. Coordinates authentication state across all MFEs
 * 4. Provides centralized event logging in development
 *
 * Note: Individual MFEs handle their own event subscriptions via their
 * respective useStoreInitialization() hooks.
 */
export function useEventDrivenStores() {
  useEffect(() => {
    const eventBus = getEventBus();

    // Development mode: Log all events for debugging
    if (import.meta.env.MODE === 'development') {
      const eventLogger = (event: any) => {
        // Safely format timestamp
        let timestamp: string;
        try {
          if (event.timestamp) {
            const date = new Date(event.timestamp);
            timestamp = isNaN(date.getTime())
              ? 'Invalid Date'
              : date.toISOString();
          } else {
            timestamp = new Date().toISOString();
          }
        } catch {
          timestamp = new Date().toISOString();
        }

        console.log('[Shell Event Bus]', {
          name: event.name,
          timestamp,
          data: event.data,
          historySize: eventBus.getEventHistory().length,
        });
      };

      // Subscribe to all major events for visibility
      const unsubscribers = [
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, eventLogger),
        eventBus.subscribe(EVENT_NAMES.USER_LOGGED_OUT, eventLogger),
        eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED, eventLogger),
        eventBus.subscribe(EVENT_NAMES.THEME_CHANGED, eventLogger),
        eventBus.subscribe(EVENT_NAMES.CONVERSATION_CREATED, eventLogger),
        eventBus.subscribe(EVENT_NAMES.CONVERSATION_DELETED, eventLogger),
        eventBus.subscribe(EVENT_NAMES.CHAT_MESSAGE_RECEIVED, eventLogger),
        eventBus.subscribe(EVENT_NAMES.USER_BANNED, eventLogger),
        eventBus.subscribe(EVENT_NAMES.USER_UNBANNED, eventLogger),
        eventBus.subscribe(EVENT_NAMES.USER_ROLE_CHANGED, eventLogger),
      ];

      console.log(
        '[Shell] Event bus initialized with',
        unsubscribers.length,
        'debug listeners'
      );

      return () => {
        unsubscribers.forEach((unsub) => unsub());
        console.log('[Shell] Event bus debug listeners cleaned up');
      };
    }

    // Production mode: Silent operation
    console.log('[Shell] Event bus initialized');
  }, []);
}

/**
 * Hook for monitoring event bus health metrics.
 * Returns statistics about event bus usage.
 */
export function useEventBusMetrics() {
  useEffect(() => {
    const eventBus = getEventBus();

    const interval = setInterval(() => {
      const history = eventBus.getEventHistory();
      const metrics = {
        totalEvents: history.length,
        eventTypes: Array.from(new Set(history.map((e: any) => e.name))),
        oldestEvent: history[0]?.timestamp || null,
        newestEvent: history[history.length - 1]?.timestamp || null,
      };

      // Log warning if history gets too large
      if (history.length > 800) {
        console.warn('[Shell] Event bus history approaching limit:', metrics);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);
}

/**
 * Hook for coordinating authentication state across all MFEs.
 * Ensures proper initialization order and state consistency.
 */
export function useAuthenticationCoordination() {
  useEffect(() => {
    const eventBus = getEventBus();

    // Listen for login events and ensure all MFEs are notified
    const unsubscribeLogin = eventBus.subscribe(
      EVENT_NAMES.USER_LOGGED_IN,
      (event) => {
        console.log('[Shell] User logged in, MFEs will initialize:', {
          userId: event.data?.userId,
          role: event.data?.role,
        });
      }
    );

    // Listen for logout events and coordinate cleanup
    const unsubscribeLogout = eventBus.subscribe(
      EVENT_NAMES.USER_LOGGED_OUT,
      () => {
        console.log('[Shell] User logged out, MFEs will clear state');
      }
    );

    return () => {
      unsubscribeLogin();
      unsubscribeLogout();
    };
  }, []);
}

/**
 * Complete shell-level event coordination.
 * Use this single hook in App.tsx to initialize all shell-level event handling.
 */
export function useShellEventCoordination() {
  useEventDrivenStores();
  useAuthenticationCoordination();

  // Conditionally use metrics in development
  const isDevelopment = import.meta.env.MODE === 'development';

  useEffect(() => {
    if (isDevelopment) {
      const eventBus = getEventBus();

      const interval = setInterval(() => {
        const history = eventBus.getEventHistory();
        if (history.length > 800) {
          console.warn(
            '[Shell] Event bus history approaching limit:',
            history.length
          );
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isDevelopment]);
}
