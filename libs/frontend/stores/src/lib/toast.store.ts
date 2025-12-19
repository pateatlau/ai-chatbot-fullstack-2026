import { create } from 'zustand';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, type, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Emit toast show event
    const eventBus = getEventBus();
    eventBus.emit(EVENT_NAMES.TOAST_SHOW, {
      id,
      type,
      message,
      duration,
      timestamp: Date.now(),
    });

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));

        // Emit toast dismiss event
        eventBus.emit(EVENT_NAMES.TOAST_DISMISS, {
          id,
          timestamp: Date.now(),
        });
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));

    // Emit toast dismiss event
    const eventBus = getEventBus();
    eventBus.emit(EVENT_NAMES.TOAST_DISMISS, {
      id,
      timestamp: Date.now(),
    });
  },

  clearToasts: () => set({ toasts: [] }),
}));
