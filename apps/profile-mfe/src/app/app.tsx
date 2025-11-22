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
  return (
    <ErrorBoundary variant="full" context="profile-mfe-root">
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
