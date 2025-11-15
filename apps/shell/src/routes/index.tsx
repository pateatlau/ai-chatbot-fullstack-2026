import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

// Placeholder pages
const DashboardPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p className="text-gray-600">Welcome to your dashboard!</p>
  </div>
);

const ChatbotPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Chatbot</h1>
    <p className="text-gray-600">Chatbot MFE will be loaded here.</p>
  </div>
);

const ProfilePage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Profile</h1>
    <p className="text-gray-600">Profile MFE will be loaded here.</p>
  </div>
);

const AdminPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Admin</h1>
    <p className="text-gray-600">Admin MFE will be loaded here.</p>
  </div>
);

export const router = createBrowserRouter([
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
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'chatbot',
        element: <ChatbotPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
    ],
  },
]);
