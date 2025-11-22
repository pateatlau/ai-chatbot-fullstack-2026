import { useLocation } from 'react-router-dom';
import { ErrorBoundary, ThemeProvider } from '@myapp/frontend/ui-components';
import { RecoveryAction, useRequireRole } from '@myapp/frontend/hooks';
import {
  AdminDashboardPage,
  UserManagementPage,
  UserDetailPage,
  AuditLogsPage,
} from '../pages';

function AppContent() {
  // Ensure admin role at MFE root level for defense-in-depth
  useRequireRole('ADMIN');

  const location = useLocation();

  // Router path-based rendering - shell controls routing
  // /admin -> Dashboard
  // /admin/users -> User List
  // /admin/users/:id -> User Detail
  // /admin/audit-logs -> Audit Logs

  if (location.pathname.startsWith('/admin/users/')) {
    return <UserDetailPage />;
  }

  if (location.pathname === '/admin/users') {
    return <UserManagementPage />;
  }

  if (location.pathname === '/admin/audit-logs') {
    return <AuditLogsPage />;
  }

  // Default to admin dashboard
  return <AdminDashboardPage />;
}

export function App() {
  const isInShell =
    typeof window !== 'undefined' && window.location.port === '5173';

  const handleRecovery = (action: RecoveryAction) => {
    console.log('[Admin MFE] Recovery action triggered:', action);
    // Execute recovery action
    void action.action();
  };

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[Admin MFE] Error caught:', { error, errorInfo });
  };

  return (
    <ThemeProvider
      defaultTheme="light"
      storageKey="app-theme"
      passive={isInShell}
    >
      <ErrorBoundary
        variant="full"
        context="admin-mfe-root"
        enableRecovery={true}
        onRecovery={handleRecovery}
        onError={handleError}
        showDetails={process.env.NODE_ENV === 'development'}
      >
        <AppContent />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
