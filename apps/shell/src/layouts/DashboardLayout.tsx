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
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/chatbot"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Chatbot
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Profile
                </Link>
                {hasRole('ADMIN') && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
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
