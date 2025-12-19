import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { AdminRoute } from '../components/AdminRoute';
import { RootRedirect } from '../components/RootRedirect';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ChatbotMfe } from '../components/ChatbotMfe';
import { AuthMfe } from '../components/AuthMfe';
import { AdminMfe } from '../components/AdminMfe';
import { ProfileMfe } from '../components/ProfileMfe';

// Core pages
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  // Root route - redirect based on auth status
  {
    path: '/',
    index: true,
    element: <RootRedirect />,
  },
  // Auth routes - delegated to Auth MFE
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthMfe />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <AuthMfe />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <AuthMfe />
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password/:token',
    element: (
      <PublicRoute>
        <AuthMfe />
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
      // Chatbot MFE - all chat routes
      {
        path: 'chat',
        element: <ChatbotMfe />,
      },
      {
        path: 'chat/:conversationId',
        element: <ChatbotMfe />,
      },
      {
        path: 'chatbot', // Legacy route, redirect to /chat
        element: <ChatbotMfe />,
      },
      // Profile routes - delegated to Profile MFE
      {
        path: 'profile',
        element: <ProfileMfe />,
      },
      {
        path: 'profile/edit',
        element: <ProfileMfe />,
      },
      {
        path: 'profile/settings',
        element: <ProfileMfe />,
      },
      {
        path: 'profile/security',
        element: <ProfileMfe />,
      },
      // Admin routes - delegated to Admin MFE with admin role check
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminMfe />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <AdminRoute>
            <AdminMfe />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/users/:userId',
        element: (
          <AdminRoute>
            <AdminMfe />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/audit-logs',
        element: (
          <AdminRoute>
            <AdminMfe />
          </AdminRoute>
        ),
      },
    ],
  },
  // 404 catch-all route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
