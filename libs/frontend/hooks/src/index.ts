// Auth hooks
export {
  useAuth,
  useRequireAuth,
  useRequireRole,
  type LoginCredentials,
  type RegisterData,
  type AuthResponse,
  type UseAuthReturn,
} from './lib/useAuth';

// Toast hooks
export { useToast, useAsyncToast, type UseToastReturn } from './lib/useToast';

// API hooks
export {
  useApi,
  usePublicApi,
  type UseApiOptions,
  type UseApiReturn,
} from './lib/useApi';

// Error logging hooks
export {
  useErrorLogger,
  type ErrorLogContext,
  type ErrorLog,
} from './lib/useErrorLogger';

// Error recovery types
export type {
  ErrorRecoveryContext,
  RecoveryAction,
  StateSnapshot,
  RecoverySuggestion,
  RecoveryResult,
} from './lib/useErrorRecovery.types';

export { ErrorCategory, RecoveryStrategy } from './lib/useErrorRecovery.types';

// Error recovery hook
export { useErrorRecovery } from './lib/useErrorRecovery';

// Session recovery
export {
  sessionRecoveryService,
  type SessionData,
  type SessionRecoveryOptions,
} from './lib/sessionRecovery.service';
