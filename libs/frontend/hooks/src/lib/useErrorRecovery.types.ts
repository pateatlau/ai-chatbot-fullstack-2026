/**
 * Error recovery strategy types
 */
export enum RecoveryStrategy {
  RETRY = 'RETRY',
  FALLBACK = 'FALLBACK',
  RESET = 'RESET',
  NAVIGATE = 'NAVIGATE',
  RESTORE = 'RESTORE',
}

/**
 * Error category for determining recovery approach
 */
export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  INTERNAL = 'INTERNAL',
  MODULE_FEDERATION = 'MODULE_FEDERATION',
  STATE = 'STATE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Recovery action that can be taken
 */
export interface RecoveryAction {
  strategy: RecoveryStrategy;
  category: ErrorCategory;
  label: string;
  action: () => Promise<void> | void;
  priority: number;
  canRetry: boolean;
  maxRetries?: number;
}

/**
 * Error context with recovery metadata
 */
export interface ErrorRecoveryContext {
  errorId: string;
  originalError: Error;
  category: ErrorCategory;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  recoveryAttempts: string[];
  lastRecoveryAttempt?: {
    strategy: RecoveryStrategy;
    timestamp: number;
    success: boolean;
  };
}

/**
 * State snapshot for recovery
 */
export interface StateSnapshot {
  componentId: string;
  state: Record<string, any>;
  timestamp: number;
  version: number;
}

/**
 * Recovery suggestion for user
 */
export interface RecoverySuggestion {
  title: string;
  description: string;
  actions: Array<{
    label: string;
    primary?: boolean;
    onClick: () => void;
  }>;
  icon?: string;
}

/**
 * Recovery result
 */
export interface RecoveryResult {
  success: boolean;
  strategy: RecoveryStrategy;
  message: string;
  recoveredState?: Record<string, any>;
  error?: Error;
  nextSteps?: string[];
}
