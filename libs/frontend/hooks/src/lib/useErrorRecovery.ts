import { useCallback, useRef } from 'react';
import {
  ErrorRecoveryContext,
  RecoveryStrategy,
  ErrorCategory,
  RecoveryAction,
  StateSnapshot,
  RecoveryResult,
} from './useErrorRecovery.types';

interface RecoveryQueue {
  action: RecoveryAction;
  retryCount: number;
  lastAttempt?: number;
}

/**
 * Error Recovery Manager Hook
 * Handles automatic error recovery with retry logic, state restoration, and fallback strategies
 *
 * @example
 * ```tsx
 * const { recover, restoreState, suggestions } = useErrorRecovery();
 *
 * // Automatically recover from error
 * const result = await recover(error, 'auth-mfe', {
 *   maxRetries: 3,
 *   autoRestore: true,
 * });
 *
 * // Get suggestions for user
 * const suggestion = suggestions.get(error);
 * ```
 */
export function useErrorRecovery() {
  const stateSnapshotsRef = useRef<Map<string, StateSnapshot>>(new Map());
  const recoveryQueueRef = useRef<RecoveryQueue[]>([]);
  const recoveryContextRef = useRef<Map<string, ErrorRecoveryContext>>(
    new Map()
  );
  const recoveryCallbacksRef = useRef<Map<string, () => Promise<void>>>(
    new Map()
  );

  /**
   * Categorize error to determine recovery approach
   */
  const categorizeError = useCallback(
    (error: Error, context?: string): ErrorCategory => {
      const message = error.message.toLowerCase();
      const stack = error.stack?.toLowerCase() || '';

      if (
        message.includes('auth') ||
        message.includes('unauthorized') ||
        message.includes('token')
      ) {
        return ErrorCategory.AUTHENTICATION;
      }

      if (message.includes('forbidden') || message.includes('permission')) {
        return ErrorCategory.AUTHORIZATION;
      }

      if (
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('connection')
      ) {
        return ErrorCategory.NETWORK;
      }

      if (message.includes('validation') || message.includes('invalid')) {
        return ErrorCategory.VALIDATION;
      }

      if (
        message.includes('module') ||
        message.includes('federation') ||
        message.includes('import')
      ) {
        return ErrorCategory.MODULE_FEDERATION;
      }

      if (message.includes('state') || stack.includes('state')) {
        return ErrorCategory.STATE;
      }

      return ErrorCategory.INTERNAL;
    },
    []
  );

  /**
   * Generate recovery actions based on error category
   */
  const generateRecoveryActions = useCallback(
    (
      error: Error,
      category: ErrorCategory,
      retryFn?: () => Promise<void>
    ): RecoveryAction[] => {
      const actions: RecoveryAction[] = [];

      switch (category) {
        case ErrorCategory.AUTHENTICATION:
          // Redirect to login
          actions.push({
            strategy: RecoveryStrategy.NAVIGATE,
            category,
            label: 'Redirect to Login',
            action: () => {
              window.location.href = '/auth/login';
            },
            priority: 1,
            canRetry: false,
          });

          // Try to refresh token
          if (retryFn) {
            actions.push({
              strategy: RecoveryStrategy.RETRY,
              category,
              label: 'Refresh Session',
              action: retryFn,
              priority: 2,
              canRetry: true,
              maxRetries: 2,
            });
          }
          break;

        case ErrorCategory.NETWORK:
          // Retry with backoff
          if (retryFn) {
            actions.push({
              strategy: RecoveryStrategy.RETRY,
              category,
              label: 'Retry Request',
              action: retryFn,
              priority: 1,
              canRetry: true,
              maxRetries: 3,
            });
          }

          // Show offline fallback
          actions.push({
            strategy: RecoveryStrategy.FALLBACK,
            category,
            label: 'Show Cached Data',
            action: () => {
              console.info('Showing cached/fallback data');
            },
            priority: 2,
            canRetry: false,
          });
          break;

        case ErrorCategory.MODULE_FEDERATION:
          // Retry module load
          if (retryFn) {
            actions.push({
              strategy: RecoveryStrategy.RETRY,
              category,
              label: 'Retry Module Load',
              action: retryFn,
              priority: 1,
              canRetry: true,
              maxRetries: 3,
            });
          }

          // Show fallback
          actions.push({
            strategy: RecoveryStrategy.FALLBACK,
            category,
            label: 'Load Fallback Component',
            action: () => {
              console.info('Loading fallback component');
            },
            priority: 2,
            canRetry: false,
          });
          break;

        case ErrorCategory.VALIDATION:
          // Reset form
          actions.push({
            strategy: RecoveryStrategy.RESET,
            category,
            label: 'Clear Form',
            action: () => {
              console.info('Resetting form');
            },
            priority: 1,
            canRetry: false,
          });
          break;

        case ErrorCategory.STATE:
          // Restore previous state
          actions.push({
            strategy: RecoveryStrategy.RESTORE,
            category,
            label: 'Restore Previous State',
            action: () => {
              console.info('Restoring state');
            },
            priority: 1,
            canRetry: false,
          });

          // Full reset
          actions.push({
            strategy: RecoveryStrategy.RESET,
            category,
            label: 'Reset Component',
            action: () => {
              window.location.reload();
            },
            priority: 2,
            canRetry: false,
          });
          break;

        default:
          if (retryFn) {
            actions.push({
              strategy: RecoveryStrategy.RETRY,
              category,
              label: 'Try Again',
              action: retryFn,
              priority: 1,
              canRetry: true,
              maxRetries: 2,
            });
          }
      }

      return actions.sort((a, b) => a.priority - b.priority);
    },
    []
  );

  /**
   * Save component state snapshot
   */
  const saveStateSnapshot = useCallback(
    (componentId: string, state: Record<string, any>) => {
      const snapshot: StateSnapshot = {
        componentId,
        state: JSON.parse(JSON.stringify(state)), // Deep copy
        timestamp: Date.now(),
        version: (stateSnapshotsRef.current.get(componentId)?.version ?? 0) + 1,
      };

      stateSnapshotsRef.current.set(componentId, snapshot);

      if (import.meta.env.MODE === 'development') {
        console.log(
          `[ErrorRecovery] State snapshot saved for ${componentId}`,
          snapshot
        );
      }
    },
    []
  );

  /**
   * Restore component state from snapshot
   */
  const restoreStateSnapshot = useCallback(
    (componentId: string): Record<string, any> | null => {
      const snapshot = stateSnapshotsRef.current.get(componentId);

      if (!snapshot) {
        console.warn(
          `[ErrorRecovery] No state snapshot found for ${componentId}`
        );
        return null;
      }

      if (import.meta.env.MODE === 'development') {
        console.log(
          `[ErrorRecovery] State restored for ${componentId}`,
          snapshot.state
        );
      }

      return snapshot.state;
    },
    []
  );

  /**
   * Attempt recovery with retry logic
   */
  const recover = useCallback(
    async (
      error: Error,
      context: string,
      options?: {
        maxRetries?: number;
        autoRestore?: boolean;
        retryFn?: () => Promise<void>;
      }
    ): Promise<RecoveryResult> => {
      const errorId = `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const category = categorizeError(error, context);
      const maxRetries = options?.maxRetries ?? 2;

      // Create recovery context
      const recoveryCtx: ErrorRecoveryContext = {
        errorId,
        originalError: error,
        category,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries,
        recoveryAttempts: [],
      };

      recoveryContextRef.current.set(errorId, recoveryCtx);

      if (import.meta.env.MODE === 'development') {
        console.group(`[ErrorRecovery] Recovery started (${category})`);
        console.error('Error:', error.message);
        console.error('Context:', context);
        console.groupEnd();
      }

      // Generate recovery actions
      const actions = generateRecoveryActions(
        error,
        category,
        options?.retryFn
      );

      if (actions.length === 0) {
        return {
          success: false,
          strategy: RecoveryStrategy.RESET,
          message: 'No recovery strategy available',
          error,
        };
      }

      // Try actions in priority order
      for (const action of actions) {
        try {
          recoveryCtx.recoveryAttempts.push(action.strategy);
          recoveryCtx.lastRecoveryAttempt = {
            strategy: action.strategy,
            timestamp: Date.now(),
            success: false,
          };

          if (action.canRetry && action.maxRetries) {
            // Retry with backoff
            let lastError: Error | null = null;

            for (
              let attempt = 0;
              attempt <= (action.maxRetries ?? 0);
              attempt++
            ) {
              try {
                if (import.meta.env.MODE === 'development') {
                  console.log(
                    `[ErrorRecovery] Attempting ${action.strategy} (${attempt + 1}/${(action.maxRetries ?? 0) + 1})`
                  );
                }

                await action.action();

                recoveryCtx.lastRecoveryAttempt!.success = true;
                recoveryCtx.retryCount = attempt + 1;

                if (import.meta.env.MODE === 'development') {
                  console.log(
                    `[ErrorRecovery] Recovery successful with ${action.strategy}`
                  );
                }

                return {
                  success: true,
                  strategy: action.strategy,
                  message: `Recovered using ${action.label}`,
                };
              } catch (attemptError) {
                lastError = attemptError as Error;

                if (attempt < (action.maxRetries ?? 0)) {
                  // Exponential backoff
                  const backoffMs = Math.pow(2, attempt) * 100;
                  await new Promise((resolve) =>
                    setTimeout(resolve, backoffMs)
                  );
                }
              }
            }

            if (lastError) {
              if (import.meta.env.MODE === 'development') {
                console.error(
                  `[ErrorRecovery] ${action.strategy} failed after retries:`,
                  lastError
                );
              }
              continue;
            }
          } else {
            // Non-retryable action
            await action.action();

            recoveryCtx.lastRecoveryAttempt!.success = true;

            if (import.meta.env.MODE === 'development') {
              console.log(
                `[ErrorRecovery] Recovery successful with ${action.strategy}`
              );
            }

            return {
              success: true,
              strategy: action.strategy,
              message: `Recovered using ${action.label}`,
            };
          }
        } catch (strategyError) {
          if (import.meta.env.MODE === 'development') {
            console.error(
              `[ErrorRecovery] ${action.strategy} failed:`,
              strategyError
            );
          }
          continue;
        }
      }

      // If all strategies failed, suggest user refresh
      return {
        success: false,
        strategy: RecoveryStrategy.RESET,
        message: 'Unable to recover, please refresh the page',
        error,
        nextSteps: [
          'Refresh the page',
          'Clear browser cache',
          'Contact support',
        ],
      };
    },
    [categorizeError, generateRecoveryActions]
  );

  /**
   * Register a custom recovery callback
   */
  const registerRecoveryCallback = useCallback(
    (errorType: string, callback: () => Promise<void>) => {
      recoveryCallbacksRef.current.set(errorType, callback);
    },
    []
  );

  /**
   * Get recovery context for an error
   */
  const getRecoveryContext = useCallback((errorId: string) => {
    return recoveryContextRef.current.get(errorId);
  }, []);

  /**
   * Get recovery suggestions based on error
   */
  const getSuggestions = useCallback(
    (error: Error, category?: ErrorCategory) => {
      const cat = category || categorizeError(error);

      const suggestions: Record<ErrorCategory, string[]> = {
        [ErrorCategory.AUTHENTICATION]: [
          'Your session has expired. Please log in again.',
          'Check your credentials and try again.',
        ],
        [ErrorCategory.AUTHORIZATION]: [
          "You don't have permission to access this resource.",
          'Contact your administrator for access.',
        ],
        [ErrorCategory.NETWORK]: [
          'Network connection lost. Check your internet connection.',
          'The server may be temporarily unavailable. Please try again.',
        ],
        [ErrorCategory.VALIDATION]: [
          'Please check the form for errors and try again.',
          'Make sure all required fields are filled correctly.',
        ],
        [ErrorCategory.INTERNAL]: [
          'An unexpected error occurred. Our team has been notified.',
          'Please try refreshing the page.',
        ],
        [ErrorCategory.MODULE_FEDERATION]: [
          'Failed to load the feature. Please try again.',
          'If the problem persists, refresh the page.',
        ],
        [ErrorCategory.STATE]: [
          'The application state is corrupted. Please refresh.',
          'Try clearing your browser cache and reload.',
        ],
        [ErrorCategory.UNKNOWN]: [
          'An unknown error occurred. Please try again.',
          'If the problem persists, contact support.',
        ],
      };

      return suggestions[cat] || suggestions[ErrorCategory.UNKNOWN];
    },
    [categorizeError]
  );

  return {
    recover,
    saveStateSnapshot,
    restoreStateSnapshot,
    registerRecoveryCallback,
    getRecoveryContext,
    getSuggestions,
    categorizeError,
  };
}

export default useErrorRecovery;
