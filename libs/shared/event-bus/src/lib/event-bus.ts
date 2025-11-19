// libs/shared/event-bus/src/lib/event-bus.ts

type EventListener<T = any> = (data: T) => void | Promise<void>;
type EventUnsubscribe = () => void;

export interface EventBusOptions {
  enableHistory?: boolean;
  maxHistorySize?: number;
  enableLogging?: boolean;
}

interface EventRecord {
  name: string;
  data: any;
  timestamp: number;
  listenersCount: number;
}

/**
 * Pub/Sub Event Bus for zero-coupling inter-MFE communication
 *
 * @example
 * const bus = new EventBus();
 * const unsubscribe = bus.subscribe('user:logged-in', (event) => {
 *   console.log('User logged in:', event.user.email);
 * });
 * bus.emit('user:logged-in', { user: { email: 'test@example.com' } });
 * unsubscribe(); // Clean up
 */
export class EventBus {
  private listeners = new Map<string, Set<EventListener>>();
  private eventHistory: EventRecord[] = [];
  private options: Required<EventBusOptions>;

  constructor(options: EventBusOptions = {}) {
    this.options = {
      enableHistory: options.enableHistory ?? true,
      maxHistorySize: options.maxHistorySize ?? 1000,
      enableLogging: options.enableLogging ?? false,
    };
  }

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  subscribe<T = any>(
    eventName: string,
    listener: EventListener<T>
  ): EventUnsubscribe {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName)!.add(listener);

    if (this.options.enableLogging) {
      console.log(
        `[EventBus] Listener added for "${eventName}"`,
        `(total: ${this.listeners.get(eventName)?.size})`
      );
    }

    // Return unsubscribe function
    return () => this.unsubscribe(eventName, listener);
  }

  /**
   * Subscribe to event once, then auto-unsubscribe
   */
  once<T = any>(
    eventName: string,
    listener: EventListener<T>
  ): EventUnsubscribe {
    const wrappedListener = (data: T) => {
      listener(data);
      this.unsubscribe(eventName, wrappedListener);
    };

    return this.subscribe(eventName, wrappedListener);
  }

  /**
   * Emit event to all listeners
   */
  async emit<T = any>(eventName: string, data: T): Promise<void> {
    if (this.options.enableLogging) {
      console.log(`[EventBus] Emitting "${eventName}"`, data);
    }

    // Record event
    if (this.options.enableHistory) {
      this.recordEvent(eventName, data);
    }

    // Get listeners
    const listeners = this.listeners.get(eventName);
    if (!listeners || listeners.size === 0) {
      if (this.options.enableLogging) {
        console.warn(`[EventBus] No listeners for "${eventName}"`);
      }
      return;
    }

    // Execute all listeners
    const promises = Array.from(listeners).map((listener) =>
      Promise.resolve(listener(data)).catch((err) => {
        console.error(`[EventBus] Error in listener for "${eventName}":`, err);
      })
    );

    await Promise.all(promises);
  }

  /**
   * Unsubscribe specific listener
   */
  private unsubscribe<T = any>(
    eventName: string,
    listener: EventListener<T>
  ): void {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.delete(listener);

      if (this.options.enableLogging) {
        console.log(
          `[EventBus] Listener removed for "${eventName}"`,
          `(total: ${listeners.size})`
        );
      }

      // Clean up empty sets
      if (listeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  /**
   * Remove all listeners for an event (or all events if no name provided)
   */
  clear(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
      if (this.options.enableLogging) {
        console.log(`[EventBus] Cleared all listeners for "${eventName}"`);
      }
    } else {
      this.listeners.clear();
      if (this.options.enableLogging) {
        console.log(`[EventBus] Cleared all listeners`);
      }
    }
  }

  /**
   * Get number of listeners for an event
   */
  getListenerCount(eventName: string): number {
    return this.listeners.get(eventName)?.size ?? 0;
  }

  /**
   * Get event history (for debugging)
   */
  getEventHistory(): EventRecord[] {
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Record event to history
   */
  private recordEvent(eventName: string, data: any): void {
    this.eventHistory.push({
      name: eventName,
      data,
      timestamp: Date.now(),
      listenersCount: this.listeners.get(eventName)?.size ?? 0,
    });

    // Trim history if exceeds max size
    if (this.eventHistory.length > this.options.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.options.maxHistorySize);
    }
  }

  /**
   * Get all registered event names
   */
  getEventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Check if there are listeners for an event
   */
  hasListeners(eventName: string): boolean {
    return this.getListenerCount(eventName) > 0;
  }

  /**
   * Get event bus statistics
   */
  getStats() {
    const totalListeners = Array.from(this.listeners.values()).reduce(
      (sum, listeners) => sum + listeners.size,
      0
    );

    const listenersByEvent: Record<string, number> = {};
    this.listeners.forEach((listeners, eventName) => {
      listenersByEvent[eventName] = listeners.size;
    });

    return {
      totalEvents: this.eventHistory.length,
      totalListeners,
      eventTypes: this.listeners.size,
      listenersByEvent,
      maxHistorySize: this.options.maxHistorySize,
      historyEnabled: this.options.enableHistory,
    };
  }
}

// Singleton instance
let globalEventBus: EventBus | null = null;

/**
 * Get global EventBus singleton instance
 */
export function getEventBus(): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus({
      enableHistory: true,
      maxHistorySize: 1000,
      enableLogging: process.env['NODE_ENV'] === 'development',
    });
  }
  return globalEventBus;
}

/**
 * Reset global EventBus (mainly for testing)
 */
export function resetEventBus(): void {
  if (globalEventBus) {
    globalEventBus.clear();
    globalEventBus.clearHistory();
  }
  globalEventBus = null;
}
