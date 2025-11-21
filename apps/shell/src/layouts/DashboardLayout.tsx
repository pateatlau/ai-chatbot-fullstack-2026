import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '@ai-chatbot/hooks';
import { Button } from '@myapp/frontend/ui-components';
import { designTokens, layouts, cn } from '@myapp/frontend/ui-components';
import { colorMap, gradients } from '@myapp/frontend/ui-components';
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
    <div className={cn('min-h-screen', colorMap.bg.secondary)}>
      {/* Header */}
      <header className={cn('bg-white', designTokens.shadows.sm)}>
        <div className={cn(layouts.container, 'py-4')}>
          <div className={cn(layouts.centerBetween)}>
            <div className={cn(layouts.hStack, designTokens.spacing.xl)}>
              <Link
                to="/dashboard"
                className={cn(designTokens.typography.h5, 'text-primary-600')}
              >
                AI Chatbot
              </Link>
              <nav className={cn(layouts.hStack, designTokens.spacing.lg)}>
                <Link
                  to="/dashboard"
                  className={cn(
                    colorMap.text.secondary,
                    'hover:text-gray-900 transition-colors font-medium'
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  to="/chatbot"
                  className={cn(
                    colorMap.text.secondary,
                    'hover:text-gray-900 transition-colors font-medium'
                  )}
                >
                  Chat
                </Link>
                {hasRole('ADMIN') && (
                  <Link
                    to="/admin"
                    className={cn(
                      colorMap.text.secondary,
                      'hover:text-gray-900 transition-colors font-medium'
                    )}
                  >
                    Admin
                  </Link>
                )}
              </nav>
            </div>

            <div className={cn(layouts.hStack, designTokens.spacing.lg)}>
              {/* User Dropdown */}
              <div className="relative group">
                <button
                  className={cn(
                    layouts.hStack,
                    designTokens.spacing.md,
                    'text-sm',
                    colorMap.text.secondary,
                    'hover:text-gray-900 transition-colors'
                  )}
                >
                  <div
                    className={cn(
                      cn(
                        gradients.primary,
                        'rounded-full flex items-center justify-center'
                      ),
                      'w-8 h-8 text-white font-medium'
                    )}
                  >
                    {user?.name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() ||
                      'U'}
                  </div>
                  <span className="font-medium">
                    {user?.name || user?.email}
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div
                  className={cn(
                    'absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200'
                  )}
                >
                  <Link
                    to="/profile"
                    className={cn(
                      'block px-4 py-2 text-sm',
                      colorMap.text.secondary,
                      'hover:bg-gray-100'
                    )}
                  >
                    👤 Profile
                  </Link>
                  <Link
                    to="/profile/settings"
                    className={cn(
                      'block px-4 py-2 text-sm',
                      colorMap.text.secondary,
                      'hover:bg-gray-100'
                    )}
                  >
                    ⚙️ Settings
                  </Link>
                  <Link
                    to="/profile/security"
                    className={cn(
                      'block px-4 py-2 text-sm',
                      colorMap.text.secondary,
                      'hover:bg-gray-100'
                    )}
                  >
                    🔒 Security
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm',
                      colorMap.text.danger,
                      'hover:bg-gray-100'
                    )}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(layouts.container, designTokens.padding.lg)}>
        <Outlet />
      </main>
    </div>
  );
}
