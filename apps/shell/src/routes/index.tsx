import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Auth pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

// Core pages
import { HomePage } from '../pages/HomePage';
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Profile pages
import {
  ProfilePage,
  EditProfilePage,
  SettingsPage,
  SecurityPage,
} from '../pages/profile';

// Admin pages
import {
  AdminDashboardPage,
  UserListPage,
  UserDetailPage,
} from '../pages/admin';

// Placeholder for Chatbot MFE (to be replaced with actual MFE)
const ChatbotPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Chatbot</h1>
    <p className="text-gray-600">Chatbot MFE will be loaded here.</p>
  </div>
);

export const router = createBrowserRouter([
  // Public home page
  {
    path: '/',
    index: true,
    element: <HomePage />,
  },
  // Auth routes
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  // Protected routes with DashboardLayout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      // Chatbot (placeholder for MFE)
      {
        path: 'chatbot',
        element: <ChatbotPage />,
      },
      // Profile routes
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'profile/edit',
        element: <EditProfilePage />,
      },
      {
        path: 'profile/settings',
        element: <SettingsPage />,
      },
      {
        path: 'profile/security',
        element: <SecurityPage />,
      },
      // Admin routes
      {
        path: 'admin',
        element: <AdminDashboardPage />,
      },
      {
        path: 'admin/users',
        element: <UserListPage />,
      },
      {
        path: 'admin/users/:userId',
        element: <UserDetailPage />,
      },
    ],
  },
  // 404 catch-all route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
