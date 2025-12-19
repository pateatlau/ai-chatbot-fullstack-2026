// libs/shared/event-bus/src/lib/hooks/useEventBus.ts

import { useEffect, useRef, useCallback } from 'react';
import { getEventBus } from '../event-bus';
import type { EventMap, EventName } from '../event-types';

/**
 * React hook for subscribing to EventBus events
 *
 * @example
 * useEventBus('user:logged-in', (event) => {
 *   console.log('User logged in:', event.user.email);
 * });
 */
export function useEventBus<K extends EventName>(
  eventName: K,
  handler: (data: EventMap[K]) => void | Promise<void>,
  dependencies: React.DependencyList = []
): void {
  const handlerRef = useRef(handler);

  // Keep handler ref up to date
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventBus = getEventBus();

    const wrappedHandler = (data: EventMap[K]) => {
      handlerRef.current(data);
    };

    const unsubscribe = eventBus.subscribe(eventName, wrappedHandler);

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, ...dependencies]);
}

/**
 * React hook for emitting EventBus events
 *
 * @example
 * const emitUserLogin = useEventEmitter('user:logged-in');
 * emitUserLogin({ user: { id: '1', email: 'test@example.com', name: 'Test', role: 'user' }, timestamp: Date.now() });
 */
export function useEventEmitter<K extends EventName>() {
  const eventBus = getEventBus();

  return useCallback(
    <T extends EventName>(eventName: T, data: EventMap[T]) => {
      return eventBus.emit(eventName, data);
    },
    [eventBus]
  );
}

/**
 * React hook that returns the EventBus instance
 * Use this when you need direct access to the EventBus
 *
 * @example
 * const eventBus = useEventBusInstance();
 * const history = eventBus.getEventHistory();
 */
export function useEventBusInstance() {
  return getEventBus();
}
