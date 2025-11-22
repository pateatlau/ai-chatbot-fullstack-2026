# Phase 6: Error Recovery - Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Enable Error Recovery

```typescript
import { ErrorBoundary, RecoveryAction } from '@myapp/frontend/ui-components';

<ErrorBoundary
  enableRecovery={true}
  onRecovery={(action: RecoveryAction) => console.log('Recovered:', action)}
  context="my-component"
>
  <MyApp />
</ErrorBoundary>
```

### 2. Save/Restore Component State

```typescript
import { useErrorRecovery } from '@myapp/frontend/hooks';

function MyComponent() {
  const recovery = useErrorRecovery();

  // Save state before risky operation
  recovery.saveStateSnapshot('my-component', { data: state });

  // Restore after recovery
  const saved = recovery.restoreStateSnapshot('my-component');
}
```

### 3. Handle Session Recovery

```typescript
import { sessionRecoveryService } from '@myapp/frontend/hooks';

// Initialize
sessionRecoveryService.initialize({ refreshThreshold: 300000 });

// Save session on login
sessionRecoveryService.saveSession({
  userId: 'user-123',
  token: 'jwt-token',
  user: userObject,
});

// Check if valid
if (sessionRecoveryService.isSessionValid()) {
  // Continue
}
```

### 4. Display Error Suggestions

```typescript
import { ErrorSuggestions } from '@myapp/frontend/ui-components';

<ErrorSuggestions
  error={error}
  category={category}
  onRetry={handleRetry}
  showDetails={isDevelopment}
/>
```

### 5. Show Fallback UI

```typescript
import {
  OfflineFallback,
  LoadingFallback,
  SessionExpiredFallback,
} from '@myapp/frontend/ui-components';

{isRecovering && <LoadingFallback message="Recovering..." />}
{isOffline && <OfflineFallback onRetry={retry} />}
{sessionExpired && <SessionExpiredFallback />}
```

---

## 📚 Error Categories

| Icon | Category          | Detect Pattern           | Default Action                    |
| ---- | ----------------- | ------------------------ | --------------------------------- |
| 🔐   | AUTHENTICATION    | "401", "unauthorized"    | Refresh token + redirect to login |
| 🔒   | AUTHORIZATION     | "403", "forbidden"       | Show access denied + home link    |
| 🌐   | NETWORK           | "fetch error", "timeout" | Retry 3x with backoff + fallback  |
| ⚠️   | VALIDATION        | "validation", "invalid"  | Show error + reset form           |
| ❌   | INTERNAL          | "error", "500"           | Retry 2x + suggest refresh        |
| 📦   | MODULE_FEDERATION | "chunk", "module"        | Retry 3x + fallback UI            |
| 💾   | STATE             | "state", "redux"         | Restore from snapshot or reset    |
| ❓   | UNKNOWN           | (no match)               | Retry + generic message           |

---

## 🎯 Recovery Strategies

### RETRY

Automatic retry with exponential backoff

```
Attempt 1 → Wait 1s → Attempt 2 → Wait 2s → Attempt 3 → Wait 4s → Attempt 4 (or fallback)
```

### FALLBACK

Show fallback UI when operation fails

```
Error → Display OfflineFallback / LoadingFallback / NotAvailableFallback
```

### RESET

Clear state and reinitialize

```
Error → Reset form / Clear state → User restarts
```

### NAVIGATE

Redirect to recovery path

```
Auth Error → Navigate to /login
Permission Error → Navigate to /home
```

### RESTORE

Restore component state from snapshot

```
Error → Restore previous state snapshot → Resume with saved data
```

---

## 🔧 API Reference

### `useErrorRecovery()` Hook

```typescript
// Main recovery orchestration
const recovery = useErrorRecovery();

// Categorize error into 8 types
recovery.categorizeError(error, context)
→ ErrorCategory

// Generate recovery actions for error
recovery.generateRecoveryActions(error, category, retryFn)
→ RecoveryAction[]

// Execute recovery with retry logic
recovery.recover(error, context, options)
→ Promise<RecoveryResult>

// Save component state snapshot
recovery.saveStateSnapshot(componentId, state)
→ void

// Restore component state
recovery.restoreStateSnapshot(componentId)
→ Record<string, any> | null

// Get user-friendly suggestions
recovery.getSuggestions(error, category)
→ string[]

// Register custom recovery callback
recovery.registerRecoveryCallback(errorType, callback)
→ void
```

### `sessionRecoveryService` Singleton

```typescript
// Initialize with options
sessionRecoveryService.initialize(options)
→ void

// Save session to localStorage
sessionRecoveryService.saveSession(sessionData)
→ void

// Retrieve and validate session
sessionRecoveryService.restoreSession()
→ SessionData | null

// Refresh token (typically automatic)
sessionRecoveryService.refreshSession()
→ Promise<string | null>

// Check if session is valid
sessionRecoveryService.isSessionValid()
→ boolean

// Clear session on logout
sessionRecoveryService.clearSession()
→ void

// Handle 401/403 errors
sessionRecoveryService.handleAuthError()
→ void

// Backup for crash recovery
sessionRecoveryService.preserveSessionForCrash()
→ void

// Restore from crash backup
sessionRecoveryService.recoverFromCrash()
→ void

// Start auto-refresh timer
sessionRecoveryService.startAutoRefresh()
→ void

// Stop auto-refresh timer
sessionRecoveryService.stopAutoRefresh()
→ void
```

### `ErrorBoundary` Component

```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  enableRecovery?: boolean; // Default: false
  onRecovery?: (action: RecoveryAction) => void;
  onError?: (error: Error, info: ErrorInfo) => void;
  context?: string; // For debugging
  showDetails?: boolean; // Dev mode
  variant?: 'full' | 'compact' | 'minimal';
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  isolate?: boolean; // Don't propagate to parent
}
```

### `ErrorSuggestions` Component

```typescript
interface ErrorSuggestionsProps {
  error: Error; // Error to display
  category: ErrorCategory; // Classified error type
  onRetry?: () => void; // Retry button handler
  onDismiss?: () => void; // Dismiss handler
  showDetails?: boolean; // Show stack trace
}
```

### Fallback Components

```typescript
// 7 pre-built fallback components
<OfflineFallback onRetry={fn} />          // Network offline
<LoadingFallback message={text} />        // Recovery in progress
<NotAvailableFallback feature={name} />   // Feature unavailable
<AccessDeniedFallback />                   // No permission
<ErrorOccurredFallback message={text} onRetry={fn} />  // Generic error
<SessionExpiredFallback />                 // Go to login
<NetworkErrorFallback onRetry={fn} />     // Connection error
```

---

## 📊 Type Definitions

```typescript
// Error categories
type ErrorCategory =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'NETWORK'
  | 'VALIDATION'
  | 'INTERNAL'
  | 'MODULE_FEDERATION'
  | 'STATE'
  | 'UNKNOWN';

// Recovery strategies
type RecoveryStrategy = 'RETRY' | 'FALLBACK' | 'RESET' | 'NAVIGATE' | 'RESTORE';

// Recovery action
interface RecoveryAction {
  type: RecoveryStrategy;
  label: string;
  description: string;
  path?: string; // For NAVIGATE
}

// Recovery context
interface ErrorRecoveryContext {
  error: Error;
  category: ErrorCategory;
  actions: RecoveryAction[];
  attemptCount: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// State snapshot
interface StateSnapshot {
  componentId: string;
  state: Record<string, any>;
  timestamp: Date;
}

// Session data
interface SessionData {
  userId: string;
  token: string;
  user: {
    id: string;
    name: string;
    role?: string;
    [key: string]: any;
  };
  expiresAt?: number;
  createdAt?: number;
}
```

---

## 🧪 Testing Examples

### Test Error Categorization

```typescript
const recovery = useErrorRecovery();
const category = recovery.categorizeError(new Error('401 Unauthorized'), {});
expect(category).toBe('AUTHENTICATION');
```

### Test State Snapshot

```typescript
recovery.saveStateSnapshot('comp-1', { count: 42 });
const restored = recovery.restoreStateSnapshot('comp-1');
expect(restored.count).toBe(42);
```

### Test Session Recovery

```typescript
sessionRecoveryService.initialize({});
sessionRecoveryService.saveSession({ userId: '123', token: 'jwt' });
const session = sessionRecoveryService.restoreSession();
expect(session?.userId).toBe('123');
```

---

## ⚙️ Configuration

### Session Recovery Options

```typescript
sessionRecoveryService.initialize({
  refreshThreshold: 300000, // Refresh token 5 min before expiry
  checkInterval: 60000, // Check every 1 minute
  autoRefresh: true, // Enable auto-refresh
  persistOnError: true, // Persist session on error
});
```

### ErrorBoundary Configuration

```typescript
// Development
<ErrorBoundary
  enableRecovery={true}
  showDetails={true}
  context="debug-component"
/>

// Production
<ErrorBoundary
  enableRecovery={true}
  showDetails={false}
  context="app-root"
/>
```

---

## 🐛 Common Patterns

### Pattern 1: Auth Error Redirect

```typescript
const handleRecovery = (action: RecoveryAction) => {
  if (action.type === 'NAVIGATE' && action.path === '/login') {
    window.location.href = '/login';
  }
};

<ErrorBoundary onRecovery={handleRecovery}>
  <ProtectedComponent />
</ErrorBoundary>
```

### Pattern 2: Network Retry

```typescript
const recovery = useErrorRecovery();

async function fetchWithRecovery() {
  try {
    return await api.get('/data');
  } catch (error) {
    const result = await recovery.recover(error, {});
    if (result.recovered) {
      return await api.get('/data'); // Retry
    }
  }
}
```

### Pattern 3: Form State Recovery

```typescript
const recovery = useErrorRecovery();
const [formData, setFormData] = useState({});

const handleSubmit = async () => {
  recovery.saveStateSnapshot('form-1', formData);
  try {
    await api.post('/form', formData);
  } catch (error) {
    const saved = recovery.restoreStateSnapshot('form-1');
    if (saved) setFormData(saved); // Restore form
  }
};
```

### Pattern 4: Offline Detection

```typescript
const isOnline = navigator.onLine;

{!isOnline && (
  <OfflineFallback
    onRetry={() => window.location.reload()}
  />
)}
```

---

## 📈 Metrics & Monitoring

### Track Recovery Attempts

```typescript
const handleRecovery = (action: RecoveryAction) => {
  // Log recovery attempt
  console.log('[Recovery]', {
    type: action.type,
    timestamp: new Date().toISOString(),
  });

  // Send to analytics
  analytics.trackEvent('error_recovery_attempted', {
    action_type: action.type,
  });
};
```

### Monitor Session Health

```typescript
setInterval(() => {
  const isValid = sessionRecoveryService.isSessionValid();
  if (!isValid) {
    console.warn('[Session] Session is invalid');
  }
}, 60000);
```

---

## 🚨 Troubleshooting

### Recovery Not Triggering

- ✅ Check `enableRecovery={true}` prop
- ✅ Verify error category matches (console.log error message)
- ✅ Check recovery strategy for error type
- ✅ Verify retry function provided for RETRY strategy

### Session Not Persisting

- ✅ Check `sessionRecoveryService.initialize()` was called
- ✅ Verify session data saved with `saveSession()`
- ✅ Check localStorage is not disabled
- ✅ Verify token format and expiry

### Fallback UI Not Showing

- ✅ Ensure error boundary caught the error
- ✅ Check variant prop if using 'compact' or 'minimal'
- ✅ Verify custom fallback prop not overriding
- ✅ Check CSS styles are loaded

---

## 📚 Full Documentation

For complete documentation, see:

- `PHASE_6_COMPLETION_REPORT.md` - Full implementation details
- `PHASE_6_SESSION_SUMMARY.md` - Session achievements
- Type definitions in `useErrorRecovery.types.ts`
- Component examples in MFE apps

---

**Last Updated**: Phase 6 Completion
**Version**: 1.0.0
**Status**: Production Ready ✅
