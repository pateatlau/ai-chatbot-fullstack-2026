import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '@ai-chatbot/hooks';
import { cn, Navigation } from '@myapp/frontend/ui-components';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

export function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();

    // Emit logout event for cross-MFE coordination
    const eventBus = getEventBus();
    eventBus.emit(EVENT_NAMES.USER_LOGGED_OUT, {});

    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Navigation Header */}
      <Navigation
        userEmail={user?.email}
        onLogout={handleLogout}
        isAdmin={hasRole('ADMIN')}
      />

      {/* Main Content - Offset below fixed nav (h-16 = 64px) */}
      <div
        className={cn(
          'min-h-screen bg-[var(--bg-secondary)]',
          'pt-16', // Offset for fixed navigation
          'transition-colors duration-200' // Smooth theme transitions
        )}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <main
          className={cn(
            'container mx-auto',
            'px-4 sm:px-6 lg:px-8', // Responsive padding
            'py-6 md:py-8', // Responsive vertical spacing
            'max-w-7xl' // Max width for better readability
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
