import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@myapp/frontend/ui-components';
import { RecoveryAction } from '@myapp/frontend/hooks';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

function AppContent() {
  const location = useLocation();

  // When embedded in shell, render component based on current path
  // The shell's router handles the routing, we just render the right component
  if (location.pathname === '/register') {
    return <Register />;
  }

  if (location.pathname === '/forgot-password') {
    return <ForgotPassword />;
  }

  if (location.pathname.startsWith('/reset-password/')) {
    return <ResetPassword />;
  }

  // Default to login for /login or any other path
  return <Login />;
}

export function App() {
  const handleRecovery = (action: RecoveryAction) => {
    console.log('[Auth MFE] Recovery action triggered:', action);
    // Execute recovery action
    void action.action();
  };

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[Auth MFE] Error caught:', { error, errorInfo });
  };

  return (
    <ErrorBoundary
      variant="full"
      context="auth-mfe-root"
      enableRecovery={true}
      onRecovery={handleRecovery}
      onError={handleError}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
