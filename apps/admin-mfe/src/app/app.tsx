import { useLocation } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';

export function App() {
  const location = useLocation();

  // Router path-based rendering - shell controls routing
  // /admin -> Dashboard
  // /admin/users -> User List (placeholder for now)
  // /admin/users/:id -> User Detail (placeholder for now)

  if (location.pathname.startsWith('/admin/users/')) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">User Detail</h1>
        <p className="text-gray-600 mt-2">User detail page coming soon...</p>
      </div>
    );
  }

  if (location.pathname === '/admin/users') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-2">User list page coming soon...</p>
      </div>
    );
  }

  // Default to admin dashboard
  return <AdminDashboardPage />;
}

export default App;
