import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@myapp/frontend/stores';

/**
 * Root route handler that redirects based on authentication status
 * - Authenticated users → /dashboard
 * - Unauthenticated users → /login
 */
export function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}
