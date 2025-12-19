import { useLocation } from 'react-router-dom';
import { ErrorBoundary, ThemeProvider } from '@myapp/frontend/ui-components';
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
  // Detect if running in shell (port 5173) vs standalone (port 5174)
  const isInShell =
    typeof window !== 'undefined' && window.location.port === '5173';

  const handleRecovery = (action: RecoveryAction) => {
    console.log('[Auth MFE] Recovery action triggered:', action);
    // Execute recovery action
    void action.action();
  };

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[Auth MFE] Error caught:', { error, errorInfo });
  };

  // Use passive mode when in shell so we don't fight with shell's ThemeProvider
  // In passive mode, we provide theme context but don't manipulate the DOM
  return (
    <ThemeProvider
      defaultTheme="light"
      storageKey="app-theme"
      passive={isInShell}
    >
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
    </ThemeProvider>
  );
}

export default App;
