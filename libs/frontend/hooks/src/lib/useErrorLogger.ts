import { useCallback, useRef, useEffect } from 'react';

export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ErrorLogContext {
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  appVersion?: string;
  environment?: string;
  url?: string;
  timestamp?: string;
}

export interface ErrorLog {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  context?: string;
  severity?: ErrorSeverity;
  metadata?: ErrorLogContext;
}

interface CreateErrorLogInput {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  context?: string;
  severity: ErrorSeverity;
  app: string;
  page?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  environment: string;
  metadata?: Record<string, any>;
}

interface ErrorLogSubmission {
  errorId: string;
  timestamp: number;
  retryCount: number;
}

/**
 * Hook for error logging and tracking
 * Logs errors to console and backend GraphQL endpoint
 *
 * @example
 * ```tsx
 * const { log, track, getStatus } = useErrorLogger();
 *
 * // Log an error
 * log(error, 'component-context', { userId: user.id });
 *
 * // Track error pattern
 * track('api-error', { endpoint: '/api/data', status: 500 });
 *
 * // Check submission status
 * const status = getStatus(errorId);
 * ```
 */
export function useErrorLogger() {
  const submissionsRef = useRef<Map<string, ErrorLogSubmission>>(new Map());
  const batchQueueRef = useRef<CreateErrorLogInput[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Determine error severity based on error content
   */
  const determineSeverity = (error: Error, context?: string): ErrorSeverity => {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors
    if (
      message.includes('authentication') ||
      message.includes('unauthorized') ||
      message.includes('module federation') ||
      message.includes('network error')
    ) {
      return 'CRITICAL';
    }

    // High severity
    if (
      message.includes('reference error') ||
      message.includes('type error') ||
      message.includes('render error') ||
      stack.includes('react')
    ) {
      return 'HIGH';
    }

    // Medium severity
    if (
      message.includes('api') ||
      message.includes('fetch') ||
      message.includes('xhr')
    ) {
      return 'MEDIUM';
    }

    // Default to low
    return 'LOW';
  };

  /**
   * Extract error boundary context information
   */
  const extractAppInfo = (context?: string): { app: string; page?: string } => {
    if (!context) return { app: 'unknown' };

    let app = 'unknown';
    let page: string | undefined;

    if (context.includes('shell-root')) {
      app = 'shell';
    } else if (context.includes('auth')) {
      app = 'auth-mfe';
      if (context.includes('page')) page = context.replace('page-', '');
    } else if (context.includes('profile')) {
      app = 'profile-mfe';
      if (context.includes('page')) page = context.replace('page-', '');
    } else if (context.includes('admin')) {
      app = 'admin-mfe';
      if (context.includes('page')) page = context.replace('page-', '');
    } else if (context.includes('chat')) {
      app = 'chatbot-mfe';
      if (context.includes('page')) page = 'chat';
    }

    return { app, page };
  };

  /**
   * Send error log to GraphQL backend
   */
  const sendErrorToBackend = useCallback(
    async (errorLogInput: CreateErrorLogInput, retryCount = 0) => {
      const maxRetries = 3;
      const backoffMs = Math.pow(2, retryCount) * 1000; // Exponential backoff

      try {
        const query = `
          mutation CreateErrorLog($input: CreateErrorLogInput!) {
            createErrorLog(input: $input) {
              id
              errorId
              timestamp
            }
          }
        `;

        const response = await fetch('/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: { input: errorLogInput },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.errors) {
          throw new Error(
            `GraphQL Error: ${result.errors.map((e: any) => e.message).join(', ')}`
          );
        }

        // Mark as submitted
        const submission = submissionsRef.current.get(errorLogInput.errorId);
        if (submission) {
          submission.timestamp = Date.now();
          submission.retryCount = 0;
        }

        if (import.meta.env.MODE === 'development') {
          console.log(
            `[ErrorLogger] Error logged to backend:`,
            errorLogInput.errorId
          );
        }

        return result.data.createErrorLog;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (retryCount < maxRetries) {
          if (import.meta.env.MODE === 'development') {
            console.warn(
              `[ErrorLogger] Retry ${retryCount + 1}/${maxRetries} for ${errorLogInput.errorId}: ${message}`
            );
          }

          // Schedule retry with exponential backoff
          setTimeout(() => {
            sendErrorToBackend(errorLogInput, retryCount + 1);
          }, backoffMs);

          return null;
        } else {
          if (import.meta.env.MODE === 'development') {
            console.error(
              `[ErrorLogger] Failed to log error after ${maxRetries} retries:`,
              errorLogInput.errorId,
              message
            );
          }

          // Mark as failed
          const submission = submissionsRef.current.get(errorLogInput.errorId);
          if (submission) {
            submission.retryCount = -1; // Mark as failed
          }

          return null;
        }
      }
    },
    []
  );

  /**
   * Flush batched errors
   */
  const flushBatch = useCallback(async () => {
    if (batchQueueRef.current.length === 0) return;

    const batch = [...batchQueueRef.current];
    batchQueueRef.current = [];

    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }

    try {
      const query = `
        mutation CreateErrorLogsBatch($input: [CreateErrorLogInput!]!) {
          createErrorLogsBatch(input: $input) {
            id
            errorId
            timestamp
          }
        }
      `;

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { input: batch },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.errors) {
        batch.forEach((input) => {
          const submission = submissionsRef.current.get(input.errorId);
          if (submission) {
            submission.timestamp = Date.now();
            submission.retryCount = 0;
          }
        });

        if (import.meta.env.MODE === 'development') {
          console.log(`[ErrorLogger] Batch submitted: ${batch.length} errors`);
        }
      }
    } catch (error) {
      // Requeue batch for retry
      batchQueueRef.current.unshift(...batch);

      if (import.meta.env.MODE === 'development') {
        console.error(
          `[ErrorLogger] Batch submission failed, requeued:`,
          error
        );
      }
    }
  }, []);

  /**
   * Queue error for batch submission
   */
  const queueErrorLog = useCallback(
    (errorLogInput: CreateErrorLogInput) => {
      batchQueueRef.current.push(errorLogInput);

      // Set up batch timeout
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      batchTimeoutRef.current = setTimeout(() => {
        flushBatch();
      }, 5000); // Flush every 5 seconds
    },
    [flushBatch]
  );

  /**
   * Log an error
   */
  const log = useCallback(
    async (
      error: Error,
      context?: string,
      metadata?: Partial<ErrorLogContext>
    ) => {
      const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const severity = determineSeverity(error, context);
      const { app, page } = extractAppInfo(context);

      const errorLog: ErrorLog = {
        errorId,
        message: error.message,
        stack: error.stack,
        context,
        severity,
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          environment: import.meta.env.MODE,
          ...metadata,
        },
      };

      // Log to console in development
      if (import.meta.env.MODE === 'development') {
        console.group(`[ErrorLogger] ${context || 'Error'} (${severity})`);
        console.error('Message:', errorLog.message);
        console.error('Stack:', errorLog.stack);
        console.error('ID:', errorId);
        if (metadata) {
          console.error('Metadata:', metadata);
        }
        console.groupEnd();
      }

      // Track submission
      submissionsRef.current.set(errorId, {
        errorId,
        timestamp: Date.now(),
        retryCount: 0,
      });

      // Prepare backend submission
      const errorLogInput: CreateErrorLogInput = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: error.stack, // Use stack as component stack fallback
        context,
        severity,
        app,
        page,
        url: window.location.href,
        userAgent: navigator.userAgent,
        environment: import.meta.env.MODE,
        metadata: {
          ...metadata,
          originalContext: context,
        },
      };

      // Send to backend - use batch for better performance
      if (severity === 'CRITICAL') {
        // Send critical errors immediately
        await sendErrorToBackend(errorLogInput);
      } else {
        // Queue other errors for batch submission
        queueErrorLog(errorLogInput);
      }

      return errorId;
    },
    [sendErrorToBackend, queueErrorLog]
  );

  /**
   * Track error pattern or event
   */
  const track = useCallback(
    async (errorType: string, metadata?: Record<string, any>) => {
      // Log to console in development
      if (import.meta.env.MODE === 'development') {
        console.group('[ErrorTracking]');
        console.info(`Type: ${errorType}`, metadata);
        console.groupEnd();
      }

      // Queue for batch submission
      const errorLogInput: CreateErrorLogInput = {
        errorId: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: errorType,
        severity: 'LOW',
        app: 'unknown',
        environment: import.meta.env.MODE,
        metadata,
      };

      queueErrorLog(errorLogInput);
    },
    [queueErrorLog]
  );

  /**
   * Get submission status for an error
   */
  const getStatus = useCallback((errorId: string) => {
    const submission = submissionsRef.current.get(errorId);
    if (!submission) return null;

    if (submission.retryCount === -1) return 'failed';
    if (submission.retryCount === 0) return 'submitted';
    return 'retrying';
  }, []);

  /**
   * Flush all pending errors on unload
   */
  const flushPending = useCallback(async () => {
    await flushBatch();
  }, [flushBatch]);

  // Clean up on unmount
  useEffect(() => {
    window.addEventListener('beforeunload', flushPending);
    return () => {
      window.removeEventListener('beforeunload', flushPending);
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, [flushPending]);

  return { log, track, getStatus, flushBatch: flushPending };
}
