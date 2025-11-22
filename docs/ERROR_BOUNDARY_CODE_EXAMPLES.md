# Error Boundary Implementation - Code Examples

## 1. Reusable Shared ErrorBoundary Component

### File: `libs/frontend/ui-components/src/components/ErrorBoundary/ErrorBoundary.tsx`

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

export type ErrorBoundaryVariant = 'full' | 'compact' | 'minimal';

export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;

  /** Visual variant */
  variant?: ErrorBoundaryVariant;

  /** Custom fallback component or function */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);

  /** Error logging callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /** If true, error doesn't propagate to parent boundaries */
  isolate?: boolean;

  /** Context for better error identification */
  context?: string;

  /** Show detailed error info (stack trace, component stack) */
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  private readonly DEFAULT_CONTEXT = 'ErrorBoundary';

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Store component stack
    this.setState({
      errorInfo,
    });

    // Call user's error handler
    this.props.onError?.(error, errorInfo);

    // Log to console
    const context = this.props.context || this.DEFAULT_CONTEXT;
    console.error(`[${context}] Error caught:`, {
      error,
      errorInfo,
      errorId: this.state.errorId,
      variant: this.props.variant,
      timestamp: new Date().toISOString(),
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  renderFallback() {
    const { error, errorInfo, errorId } = this.state;
    const {
      variant = 'full',
      context = this.DEFAULT_CONTEXT,
      showDetails = true,
    } = this.props;

    if (this.props.fallback) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(error!, this.handleReset);
      }
      return this.props.fallback;
    }

    switch (variant) {
      case 'full':
        return this.renderFullUI(
          error,
          errorInfo,
          errorId,
          context,
          showDetails
        );
      case 'compact':
        return this.renderCompactUI(error, errorId, context);
      case 'minimal':
        return this.renderMinimalUI(error);
      default:
        return this.renderFullUI(
          error,
          errorInfo,
          errorId,
          context,
          showDetails
        );
    }
  }

  private renderFullUI(
    error: Error | null,
    errorInfo: ErrorInfo | null,
    errorId: string,
    context: string,
    showDetails: boolean
  ) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorHeader}>
          <span className={styles.errorIcon}>⚠️</span>
          <h1 className={styles.errorTitle}>Something Went Wrong</h1>
        </div>

        <div className={styles.errorContent}>
          <p className={styles.errorMessage}>
            {error?.message || 'Unknown error'}
          </p>

          {showDetails && (
            <details className={styles.errorDetails}>
              <summary className={styles.detailsSummary}>Error Details</summary>

              <div className={styles.detailsBody}>
                <div className={styles.detailSection}>
                  <h3 className={styles.detailTitle}>Error ID</h3>
                  <code className={styles.detailCode}>{errorId}</code>
                </div>

                <div className={styles.detailSection}>
                  <h3 className={styles.detailTitle}>Context</h3>
                  <code className={styles.detailCode}>{context}</code>
                </div>

                {error && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailTitle}>Error Message</h3>
                    <code className={styles.detailCode}>
                      {error.toString()}
                    </code>
                  </div>
                )}

                {error?.stack && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailTitle}>Stack Trace</h3>
                    <pre className={styles.detailStack}>{error.stack}</pre>
                  </div>
                )}

                {errorInfo?.componentStack && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailTitle}>Component Stack</h3>
                    <pre className={styles.detailStack}>
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        <div className={styles.errorActions}>
          <button className={styles.buttonPrimary} onClick={this.handleReload}>
            Reload Application
          </button>
          <button className={styles.buttonSecondary} onClick={this.handleReset}>
            Try Again
          </button>
        </div>

        <p className={styles.errorHint}>
          If this problem persists, please contact support with Error ID:{' '}
          <code>{errorId}</code>
        </p>
      </div>
    );
  }

  private renderCompactUI(
    error: Error | null,
    errorId: string,
    context: string
  ) {
    return (
      <div className={styles.errorContainerCompact}>
        <div className={styles.errorHeader}>
          <span className={styles.errorIcon}>⚠️</span>
          <div>
            <h2 className={styles.errorTitleCompact}>Error in {context}</h2>
            <p className={styles.errorMessageCompact}>
              {error?.message || 'An error occurred'}
            </p>
          </div>
        </div>

        <div className={styles.errorActionsCompact}>
          <button className={styles.buttonPrimary} onClick={this.handleReload}>
            Reload
          </button>
        </div>

        <p className={styles.errorHintSmall}>Error ID: {errorId}</p>
      </div>
    );
  }

  private renderMinimalUI(error: Error | null) {
    return (
      <div className={styles.errorContainerMinimal}>
        <p className={styles.errorMessageMinimal}>
          {error?.message || 'An error occurred'}
        </p>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### File: `libs/frontend/ui-components/src/components/ErrorBoundary/ErrorBoundary.module.css`

```css
.errorContainer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 40px;
  background: #fff5f5;
  border: 2px solid #f56565;
  border-radius: 8px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  max-width: 900px;
  margin: 40px auto;
  min-height: 300px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.errorHeader {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.errorIcon {
  font-size: 32px;
  flex-shrink: 0;
}

.errorTitle {
  margin: 0;
  color: #742a2a;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.errorContent {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.errorMessage {
  margin: 0;
  color: #742a2a;
  font-size: 16px;
  line-height: 1.5;
}

.errorDetails {
  cursor: pointer;
  margin-top: 12px;
}

.detailsSummary {
  padding: 12px;
  background: #fbd38d;
  border: 1px solid #f6ad55;
  border-radius: 4px;
  font-weight: 600;
  color: #742a2a;
  user-select: none;
  transition: background-color 0.2s;
}

.detailsSummary:hover {
  background: #f6ad55;
}

.detailsBody {
  padding: 16px;
  background: #fffaf0;
  border: 1px solid #fbd38d;
  border-top: none;
  border-radius: 0 0 4px 4px;
  margin-top: -1px;
}

.detailSection {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.detailSection:last-child {
  margin-bottom: 0;
}

.detailTitle {
  margin: 0;
  font-weight: 600;
  color: #742a2a;
  font-size: 14px;
}

.detailCode {
  padding: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  overflow-x: auto;
  color: #2d3748;
  word-break: break-word;
}

.detailStack {
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
  color: #2d3748;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

.errorActions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.buttonPrimary {
  padding: 12px 24px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.buttonPrimary:hover {
  background: #4338ca;
}

.buttonPrimary:active {
  background: #3730a3;
}

.buttonSecondary {
  padding: 12px 24px;
  background: white;
  color: #4f46e5;
  border: 2px solid #4f46e5;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.buttonSecondary:hover {
  background: #f0f4ff;
}

.buttonSecondary:active {
  background: #e0e7ff;
}

.errorHint {
  margin: 0;
  font-size: 12px;
  color: #742a2a;
  line-height: 1.5;
}

.errorHint code {
  font-family: 'Courier New', monospace;
  background: #fffaf0;
  padding: 2px 4px;
  border-radius: 2px;
}

/* Compact Variant */
.errorContainerCompact {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.errorTitleCompact {
  margin: 0;
  color: #991b1b;
  font-size: 16px;
  font-weight: 700;
}

.errorMessageCompact {
  margin: 0;
  color: #7f1d1d;
  font-size: 14px;
}

.errorActionsCompact {
  display: flex;
  gap: 8px;
}

.errorHintSmall {
  margin: 0;
  font-size: 11px;
  color: #7f1d1d;
}

/* Minimal Variant */
.errorContainerMinimal {
  padding: 8px;
  background: #fee2e2;
  border-left: 4px solid #dc2626;
  border-radius: 4px;
}

.errorMessageMinimal {
  margin: 0;
  color: #7f1d1d;
  font-size: 13px;
}
```

---

## 2. Integration in MFE Apps

### Auth MFE: `apps/auth-mfe/src/app/app.tsx`

```tsx
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@myapp/frontend/ui-components';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

function AppContent() {
  const location = useLocation();

  if (location.pathname === '/register') {
    return <Register />;
  }

  if (location.pathname === '/forgot-password') {
    return <ForgotPassword />;
  }

  if (location.pathname.startsWith('/reset-password/')) {
    return <ResetPassword />;
  }

  return <Login />;
}

export function App() {
  return (
    <ErrorBoundary variant="full" context="auth-mfe-root">
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
```

### Profile MFE: `apps/profile-mfe/src/app/app.tsx`

```tsx
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@myapp/frontend/ui-components';
import {
  ProfilePage,
  EditProfilePage,
  SettingsPage,
  SecurityPage,
} from '../pages';

function AppContent() {
  const location = useLocation();

  if (location.pathname === '/profile/edit') {
    return <EditProfilePage />;
  }

  if (location.pathname === '/profile/settings') {
    return <SettingsPage />;
  }

  if (location.pathname === '/profile/security') {
    return <SecurityPage />;
  }

  return <ProfilePage />;
}

export function App() {
  return (
    <ErrorBoundary variant="full" context="profile-mfe-root">
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
```

### Admin MFE: `apps/admin-mfe/src/app/app.tsx`

```tsx
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@myapp/frontend/ui-components';
import {
  AdminDashboardPage,
  UserManagementPage,
  UserDetailPage,
  AuditLogsPage,
} from '../pages';

function AppContent() {
  const location = useLocation();

  if (location.pathname.startsWith('/admin/users/')) {
    return <UserDetailPage />;
  }

  if (location.pathname === '/admin/users') {
    return <UserManagementPage />;
  }

  if (location.pathname === '/admin/audit-logs') {
    return <AuditLogsPage />;
  }

  return <AdminDashboardPage />;
}

export function App() {
  return (
    <ErrorBoundary variant="full" context="admin-mfe-root">
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
```

---

## 3. MFE Loader Error Boundary

### File: `apps/shell/src/components/MfeErrorBoundary.tsx`

```tsx
import { ErrorBoundary } from '@myapp/frontend/ui-components';
import { ReactNode } from 'react';

interface MfeErrorBoundaryProps {
  mfeName: 'chatbot' | 'auth' | 'profile' | 'admin';
  children: ReactNode;
}

export function MfeErrorBoundary({ mfeName, children }: MfeErrorBoundaryProps) {
  const mfeDisplayName = {
    chatbot: 'Chatbot',
    auth: 'Authentication',
    profile: 'Profile',
    admin: 'Admin Panel',
  }[mfeName];

  return (
    <ErrorBoundary
      variant="compact"
      context={`mfe-${mfeName}`}
      fallback={(error, reset) => (
        <MfeErrorFallback
          mfeName={mfeDisplayName}
          error={error}
          onReset={reset}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

interface MfeErrorFallbackProps {
  mfeName: string;
  error: Error;
  onReset: () => void;
}

function MfeErrorFallback({ mfeName, error, onReset }: MfeErrorFallbackProps) {
  return (
    <div
      style={{
        padding: '32px',
        textAlign: 'center',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
    >
      <div style={{ fontSize: '48px' }}>⚠️</div>
      <h2 style={{ margin: '0 0 8px 0', color: '#7f1d1d' }}>
        {mfeName} Module Error
      </h2>
      <p style={{ margin: '0 0 16px 0', color: '#991b1b', fontSize: '14px' }}>
        {error.message || 'Failed to load this module. Please try again.'}
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Reload Application
        </button>
        <button
          onClick={onReset}
          style={{
            padding: '10px 20px',
            background: 'white',
            color: '#4f46e5',
            border: '2px solid #4f46e5',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

### Update: `apps/shell/src/components/ChatbotMfe.tsx`

```tsx
import { lazy, Suspense } from 'react';
import { MfeErrorBoundary } from './MfeErrorBoundary';

const ChatbotMfeModule = lazy(() => import('chatbotMfe/Module'));

export function ChatbotMfe() {
  return (
    <MfeErrorBoundary mfeName="chatbot">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading chatbot...</p>
            </div>
          </div>
        }
      >
        <ChatbotMfeModule />
      </Suspense>
    </MfeErrorBoundary>
  );
}
```

---

## 4. Page-Level Error Boundaries

### Example: `apps/auth-mfe/src/pages/Login.tsx`

```tsx
import { ErrorBoundary } from '@myapp/frontend/ui-components';
import LoginContent from './LoginContent'; // Extract actual component

export default function Login() {
  return (
    <ErrorBoundary variant="full" context="auth-login-page">
      <LoginContent />
    </ErrorBoundary>
  );
}
```

### Example: `apps/profile-mfe/src/pages/SecurityPage.tsx`

```tsx
import { ErrorBoundary } from '@myapp/frontend/ui-components';
import SecurityPageContent from './SecurityPageContent'; // Extract actual component

export default function SecurityPage() {
  return (
    <ErrorBoundary variant="full" context="profile-security-page">
      <SecurityPageContent />
    </ErrorBoundary>
  );
}
```

---

## 5. Error Logger Hook

### File: `libs/frontend/hooks/src/lib/useErrorLogger.ts`

```tsx
import { useCallback } from 'react';

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
  metadata?: ErrorLogContext;
}

export function useErrorLogger() {
  const log = useCallback(
    async (
      error: Error,
      context?: string,
      metadata?: Partial<ErrorLogContext>
    ) => {
      const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const errorLog: ErrorLog = {
        errorId,
        message: error.message,
        stack: error.stack,
        context,
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          environment: import.meta.env.MODE,
          ...metadata,
        },
      };

      // Log to console
      console.error('[ErrorLogger]', errorLog);

      // TODO: Send to backend
      // try {
      //   await fetch('/api/errors', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(errorLog),
      //   });
      // } catch (logError) {
      //   console.error('Failed to log error:', logError);
      // }

      return errorId;
    },
    []
  );

  const track = useCallback(
    async (errorType: string, metadata?: Record<string, any>) => {
      const trackingData = {
        type: errorType,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...metadata,
      };

      console.info('[ErrorTracking]', trackingData);

      // TODO: Send to analytics backend
      // try {
      //   await fetch('/api/error-analytics', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(trackingData),
      //   });
      // } catch (trackingError) {
      //   console.error('Failed to track error:', trackingError);
      // }
    },
    []
  );

  return { log, track };
}
```

---

## 6. Export from UI Components

### Update: `libs/frontend/ui-components/src/index.ts`

```tsx
// ... existing exports ...

// Error Boundary
export { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
export type {
  ErrorBoundaryProps,
  ErrorBoundaryVariant,
} from './components/ErrorBoundary/ErrorBoundary';

// ... rest of exports ...
```

---

## Usage Examples

### Basic Usage

```tsx
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### With Custom Context

```tsx
<ErrorBoundary context="dashboard-page">
  <Dashboard />
</ErrorBoundary>
```

### With Error Logging

```tsx
const { log } = useErrorLogger();

<ErrorBoundary
  context="profile-edit"
  onError={(error, errorInfo) => {
    log(error, 'profile-edit-page', { userId: currentUser.id });
  }}
>
  <EditProfile />
</ErrorBoundary>;
```

### With Custom Fallback

```tsx
<ErrorBoundary
  fallback={(error, reset) => <CustomErrorUI error={error} onRetry={reset} />}
>
  <MyComponent />
</ErrorBoundary>
```

### Compact Variant for Production

```tsx
<ErrorBoundary variant="compact" context="critical-section">
  <CriticalSection />
</ErrorBoundary>
```

### Minimal Variant for Nested Boundaries

```tsx
<ErrorBoundary variant="minimal">
  <NestedComponent />
</ErrorBoundary>
```

---

**Code Examples Version**: 1.0
**Last Updated**: November 22, 2025
