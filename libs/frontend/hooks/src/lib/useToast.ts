import { useCallback } from 'react';
import { useToastStore, type ToastType } from '@myapp/frontend/stores';

export interface UseToastReturn {
  /**
   * Show a success toast
   */
  success: (message: string, duration?: number) => void;

  /**
   * Show an error toast
   */
  error: (message: string, duration?: number) => void;

  /**
   * Show a warning toast
   */
  warning: (message: string, duration?: number) => void;

  /**
   * Show an info toast
   */
  info: (message: string, duration?: number) => void;

  /**
   * Show a toast with custom type
   */
  show: (message: string, type: ToastType, duration?: number) => void;

  /**
   * Remove a specific toast by ID
   */
  dismiss: (id: string) => void;

  /**
   * Remove all toasts
   */
  dismissAll: () => void;
}

/**
 * Custom hook for toast notifications
 *
 * Provides a clean, simplified interface for showing toast messages.
 * Wraps the Zustand toast store with convenient methods.
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * // Simple success message
 * toast.success('User created successfully!');
 *
 * // Error with custom duration
 * toast.error('Failed to save changes', 8000);
 *
 * // Different types
 * toast.warning('Your session will expire soon');
 * toast.info('New updates available');
 * ```
 */
export function useToast(): UseToastReturn {
  const { addToast, removeToast, clearToasts } = useToastStore();

  /**
   * Show success toast
   */
  const success = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'success', duration);
    },
    [addToast]
  );

  /**
   * Show error toast
   */
  const error = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'error', duration);
    },
    [addToast]
  );

  /**
   * Show warning toast
   */
  const warning = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'warning', duration);
    },
    [addToast]
  );

  /**
   * Show info toast
   */
  const info = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'info', duration);
    },
    [addToast]
  );

  /**
   * Show toast with custom type
   */
  const show = useCallback(
    (message: string, type: ToastType, duration?: number) => {
      addToast(message, type, duration);
    },
    [addToast]
  );

  /**
   * Dismiss specific toast
   */
  const dismiss = useCallback(
    (id: string) => {
      removeToast(id);
    },
    [removeToast]
  );

  /**
   * Dismiss all toasts
   */
  const dismissAll = useCallback(() => {
    clearToasts();
  }, [clearToasts]);

  return {
    success,
    error,
    warning,
    info,
    show,
    dismiss,
    dismissAll,
  };
}

/**
 * Hook that returns a promise-based toast interface
 * Useful for async operations with loading states
 *
 * @example
 * ```tsx
 * const toast = useAsyncToast();
 *
 * await toast.promise(
 *   saveUserData(),
 *   {
 *     loading: 'Saving...',
 *     success: 'Saved successfully!',
 *     error: 'Failed to save'
 *   }
 * );
 * ```
 */
export function useAsyncToast() {
  const toast = useToast();

  const promise = useCallback(
    async <T>(
      asyncFn: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ): Promise<T> => {
      // Show loading toast
      toast.info(messages.loading, 0); // 0 duration = persistent

      try {
        const result = await asyncFn;

        // Clear loading and show success
        toast.dismissAll();
        const successMsg =
          typeof messages.success === 'function'
            ? messages.success(result)
            : messages.success;
        toast.success(successMsg);

        return result;
      } catch (err) {
        // Clear loading and show error
        toast.dismissAll();
        const errorMsg =
          typeof messages.error === 'function'
            ? messages.error(err as Error)
            : messages.error;
        toast.error(errorMsg);

        throw err;
      }
    },
    [toast]
  );

  return { ...toast, promise };
}
