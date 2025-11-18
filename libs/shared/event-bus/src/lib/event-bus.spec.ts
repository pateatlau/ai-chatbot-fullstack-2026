// libs/shared/event-bus/src/lib/event-bus.spec.ts

import { EventBus, getEventBus, resetEventBus } from './event-bus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus({ enableLogging: false });
  });

  afterEach(() => {
    eventBus.clear();
  });

  describe('subscribe and emit', () => {
    it('should subscribe to events and receive emitted data', async () => {
      const mockListener = jest.fn();
      eventBus.subscribe('test:event', mockListener);

      await eventBus.emit('test:event', { data: 'test' });

      expect(mockListener).toHaveBeenCalledWith({ data: 'test' });
      expect(mockListener).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple listeners for the same event', async () => {
      const mockListener1 = jest.fn();
      const mockListener2 = jest.fn();

      eventBus.subscribe('test:event', mockListener1);
      eventBus.subscribe('test:event', mockListener2);

      await eventBus.emit('test:event', { data: 'test' });

      expect(mockListener1).toHaveBeenCalledWith({ data: 'test' });
      expect(mockListener2).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should not call listener if event is not emitted', async () => {
      const mockListener = jest.fn();
      eventBus.subscribe('test:event', mockListener);

      await eventBus.emit('other:event', { data: 'test' });

      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should handle async listeners', async () => {
      const mockAsyncListener = jest.fn(
        async (): Promise<void> =>
          new Promise((resolve) => setTimeout(resolve, 10))
      );

      eventBus.subscribe('test:event', mockAsyncListener);

      await eventBus.emit('test:event', { data: 'test' });

      expect(mockAsyncListener).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should catch and log errors in listeners without breaking other listeners', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const errorListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      const successListener = jest.fn();

      eventBus.subscribe('test:event', errorListener);
      eventBus.subscribe('test:event', successListener);

      await eventBus.emit('test:event', { data: 'test' });

      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(successListener).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe listener and stop receiving events', async () => {
      const mockListener = jest.fn();
      const unsubscribe = eventBus.subscribe('test:event', mockListener);

      await eventBus.emit('test:event', { data: 'first' });
      expect(mockListener).toHaveBeenCalledTimes(1);

      unsubscribe();

      await eventBus.emit('test:event', { data: 'second' });
      expect(mockListener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should only unsubscribe the specific listener', async () => {
      const mockListener1 = jest.fn();
      const mockListener2 = jest.fn();

      const unsubscribe1 = eventBus.subscribe('test:event', mockListener1);
      eventBus.subscribe('test:event', mockListener2);

      unsubscribe1();

      await eventBus.emit('test:event', { data: 'test' });

      expect(mockListener1).not.toHaveBeenCalled();
      expect(mockListener2).toHaveBeenCalledWith({ data: 'test' });
    });
  });

  describe('once', () => {
    it('should subscribe and auto-unsubscribe after first emission', async () => {
      const mockListener = jest.fn();
      eventBus.once('test:event', mockListener);

      await eventBus.emit('test:event', { data: 'first' });
      expect(mockListener).toHaveBeenCalledTimes(1);

      await eventBus.emit('test:event', { data: 'second' });
      expect(mockListener).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  describe('clear', () => {
    it('should clear all listeners for a specific event', async () => {
      const mockListener1 = jest.fn();
      const mockListener2 = jest.fn();

      eventBus.subscribe('test:event', mockListener1);
      eventBus.subscribe('other:event', mockListener2);

      eventBus.clear('test:event');

      await eventBus.emit('test:event', { data: 'test' });
      await eventBus.emit('other:event', { data: 'test' });

      expect(mockListener1).not.toHaveBeenCalled();
      expect(mockListener2).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should clear all listeners if no event name provided', async () => {
      const mockListener1 = jest.fn();
      const mockListener2 = jest.fn();

      eventBus.subscribe('test:event', mockListener1);
      eventBus.subscribe('other:event', mockListener2);

      eventBus.clear();

      await eventBus.emit('test:event', { data: 'test' });
      await eventBus.emit('other:event', { data: 'test' });

      expect(mockListener1).not.toHaveBeenCalled();
      expect(mockListener2).not.toHaveBeenCalled();
    });
  });

  describe('getListenerCount', () => {
    it('should return correct listener count', () => {
      expect(eventBus.getListenerCount('test:event')).toBe(0);

      eventBus.subscribe('test:event', jest.fn());
      expect(eventBus.getListenerCount('test:event')).toBe(1);

      eventBus.subscribe('test:event', jest.fn());
      expect(eventBus.getListenerCount('test:event')).toBe(2);
    });
  });

  describe('hasListeners', () => {
    it('should return true if event has listeners', () => {
      expect(eventBus.hasListeners('test:event')).toBe(false);

      eventBus.subscribe('test:event', jest.fn());
      expect(eventBus.hasListeners('test:event')).toBe(true);
    });
  });

  describe('getEventNames', () => {
    it('should return all registered event names', () => {
      eventBus.subscribe('test:event1', jest.fn());
      eventBus.subscribe('test:event2', jest.fn());

      const eventNames = eventBus.getEventNames();
      expect(eventNames).toContain('test:event1');
      expect(eventNames).toContain('test:event2');
      expect(eventNames).toHaveLength(2);
    });
  });

  describe('event history', () => {
    it('should record events in history when enabled', async () => {
      const busWithHistory = new EventBus({
        enableHistory: true,
        maxHistorySize: 10,
      });

      await busWithHistory.emit('test:event1', { data: 'first' });
      await busWithHistory.emit('test:event2', { data: 'second' });

      const history = busWithHistory.getEventHistory();
      expect(history).toHaveLength(2);
      expect(history[0]?.name).toBe('test:event1');
      expect(history[1]?.name).toBe('test:event2');
    });

    it('should not record events when history is disabled', async () => {
      const busWithoutHistory = new EventBus({ enableHistory: false });

      await busWithoutHistory.emit('test:event', { data: 'test' });

      const history = busWithoutHistory.getEventHistory();
      expect(history).toHaveLength(0);
    });

    it('should limit history size', async () => {
      const busWithLimitedHistory = new EventBus({
        enableHistory: true,
        maxHistorySize: 3,
      });

      for (let i = 0; i < 5; i++) {
        await busWithLimitedHistory.emit('test:event', { data: `event${i}` });
      }

      const history = busWithLimitedHistory.getEventHistory();
      expect(history).toHaveLength(3);
      expect(history[0]?.data.data).toBe('event2'); // First 2 events trimmed
    });

    it('should clear history', async () => {
      await eventBus.emit('test:event', { data: 'test' });

      expect(eventBus.getEventHistory().length).toBeGreaterThan(0);

      eventBus.clearHistory();
      expect(eventBus.getEventHistory()).toHaveLength(0);
    });
  });

  describe('singleton', () => {
    afterEach(() => {
      resetEventBus();
    });

    it('should return same instance from getEventBus', () => {
      const instance1 = getEventBus();
      const instance2 = getEventBus();

      expect(instance1).toBe(instance2);
    });

    it('should reset singleton with resetEventBus', () => {
      const instance1 = getEventBus();
      resetEventBus();
      const instance2 = getEventBus();

      expect(instance1).not.toBe(instance2);
    });

    it('should clear all listeners and history when reset', async () => {
      const instance = getEventBus();
      instance.subscribe('test:event', jest.fn());
      await instance.emit('test:event', { data: 'test' });

      expect(instance.getListenerCount('test:event')).toBe(1);
      expect(instance.getEventHistory().length).toBeGreaterThan(0);

      resetEventBus();
      const newInstance = getEventBus();

      expect(newInstance.getListenerCount('test:event')).toBe(0);
      expect(newInstance.getEventHistory()).toHaveLength(0);
    });
  });
});
