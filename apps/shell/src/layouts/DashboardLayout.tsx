import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '@ai-chatbot/hooks';
import { Button } from '@myapp/frontend/ui-components';

export function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                to="/dashboard"
                className="text-xl font-bold text-primary-600"
              >
                AI Chatbot
              </Link>
              <nav className="flex gap-6">
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/chat"
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Chat
                </Link>
                {hasRole('ADMIN') && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* User Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    👤 Profile
                  </Link>
                  <Link
                    to="/profile/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ⚙️ Settings
                  </Link>
                  <Link
                    to="/profile/security"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    🔒 Security
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
