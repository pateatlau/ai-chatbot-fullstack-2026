import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useToast } from '@ai-chatbot/hooks';
import {
  Navigation,
  NavLink,
  cn,
  designTokens,
} from '@myapp/frontend/ui-components';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

// Inline SVG icons for navigation
const HomeIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const ChatIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const UserIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const ShieldIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

export function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();

    // Emit logout event for cross-MFE coordination
    const eventBus = getEventBus();
    eventBus.emit(EVENT_NAMES.USER_LOGGED_OUT, {});

    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Define navigation links
  const navLinks: NavLink[] = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: HomeIcon,
      requiresAuth: true,
    },
    {
      label: 'Chat',
      to: '/chat',
      icon: ChatIcon,
      requiresAuth: true,
    },
    {
      label: 'Profile',
      to: '/profile',
      icon: UserIcon,
      requiresAuth: true,
    },
    {
      label: 'Admin',
      to: '/admin',
      icon: ShieldIcon,
      requiresAuth: true,
      requiresAdmin: true,
    },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Navigation Header */}
      <Navigation
        links={navLinks}
        currentPath={location.pathname}
        isAuthenticated={!!user}
        isAdmin={hasRole('ADMIN')}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main
        className={cn('container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8')}
      >
        <Outlet />
      </main>
    </div>
  );
}
