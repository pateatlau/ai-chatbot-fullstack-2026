import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@myapp/frontend/ui-components';
import { RecoveryAction } from '@myapp/frontend/hooks';
import {
  ProfilePage,
  EditProfilePage,
  SettingsPage,
  SecurityPage,
} from '../pages';

function AppContent() {
  const location = useLocation();

  // Router path-based rendering - shell controls routing
  // /profile -> Profile view
  // /profile/edit -> Edit profile
  // /profile/settings -> Settings
  // /profile/security -> Security

  if (location.pathname === '/profile/edit') {
    return <EditProfilePage />;
  }

  if (location.pathname === '/profile/settings') {
    return <SettingsPage />;
  }

  if (location.pathname === '/profile/security') {
    return <SecurityPage />;
  }

  // Default to profile view
  return <ProfilePage />;
}

export function App() {
  const handleRecovery = (action: RecoveryAction) => {
    console.log('[Profile MFE] Recovery action triggered:', action);
    // Execute recovery action
    void action.action();
  };

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[Profile MFE] Error caught:', { error, errorInfo });
  };

  return (
    <ErrorBoundary
      variant="full"
      context="profile-mfe-root"
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
