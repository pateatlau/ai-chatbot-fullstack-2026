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
  return (
    <ErrorBoundary variant="full" context="admin-mfe-root">
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
