import { useEffect } from 'react';
import {
  Card,
  Button,
  ErrorBoundary,
  designTokens,
  colorMap,
  layouts,
  cn,
} from '@myapp/frontend/ui-components';
import { useToast, useRequireRole } from '@myapp/frontend/hooks';
import { adminAPI, DashboardStats } from '../api/admin.api';
import {
  useAdminStore,
  useAdminStoreInitialization,
  useAdminDashboardAutoRefresh,
} from '../store/admin.store';
import { useSystemStats } from '@myapp/frontend/apollo-client';

function AdminDashboardPageContent() {
  // Ensure only ADMIN users can access this page
  useRequireRole('ADMIN');

  // Initialize admin store with event bus subscriptions
  useAdminStoreInitialization();

  // Enable auto-refresh every 60 seconds
  useAdminDashboardAutoRefresh(60000);

  // Get state from store
  const { metrics, isLoading, isRefreshing, error } = useAdminStore();
  const toast = useToast();

  // Apollo Client query for system stats
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useSystemStats();

  // Load stats from Apollo on mount or when data updates
  useEffect(() => {
    if (statsData?.systemStats) {
      const { setMetrics } = useAdminStore.getState();
      const stats = statsData.systemStats;

      const metrics = {
        totalUsers: stats.totalUsers || 0,
        activeUsers: stats.activeUsers || 0,
        totalConversations: stats.totalConversations || 0,
        totalMessages: stats.totalMessages || 0,
        avgMessagesPerUser: stats.averageMessagesPerConversation || 0,
        lastUpdated: new Date().toISOString(),
      };

      setMetrics(metrics);
    }
  }, [statsData]);

  // Fallback to REST API if GraphQL not available
  useEffect(() => {
    if (!statsData && !statsLoading && !isLoading) {
      loadStats();
    }
  }, [statsLoading, isLoading, statsData]);

  const loadStats = async () => {
    try {
      const { setMetrics, setLoading } = useAdminStore.getState();
      setLoading(true);
      const data = await adminAPI.getStats();

      const metrics = {
        totalUsers: data.totalUsers,
        activeUsers: data.activeUsers,
        totalConversations: data.totalConversations,
        totalMessages:
          data.totalConversations * (data.averageMessagesPerConversation || 1),
        avgMessagesPerUser: data.averageMessagesPerConversation,
        lastUpdated: new Date().toISOString(),
      };

      setMetrics(metrics);
    } catch (error: any) {
      const { setError } = useAdminStore.getState();
      const errorMsg =
        error.response?.data?.error || 'Failed to load dashboard data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      const { setLoading } = useAdminStore.getState();
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const statCards = metrics
    ? [
        {
          label: 'Total Users',
          value: formatNumber(metrics.totalUsers),
          icon: '👥',
          color: 'blue',
        },
        {
          label: 'Active Users',
          value: formatNumber(metrics.activeUsers),
          icon: '✅',
          color: 'green',
        },
        {
          label: 'Total Conversations',
          value: formatNumber(metrics.totalConversations),
          icon: '💬',
          color: 'purple',
        },
        {
          label: 'Avg Messages/User',
          value: metrics.avgMessagesPerUser.toFixed(1),
          icon: '📊',
          color: 'orange',
        },
      ]
    : [];

  const recentActivity = [
    {
      type: 'user_registered',
      message: 'New user registered: john@example.com',
      time: '5 minutes ago',
      icon: '👤',
    },
    {
      type: 'conversation_started',
      message: '3 new conversations started',
      time: '15 minutes ago',
      icon: '💬',
    },
    {
      type: 'system',
      message: 'System backup completed successfully',
      time: '1 hour ago',
      icon: '💾',
    },
    {
      type: 'user_upgrade',
      message: 'User upgraded to Premium plan',
      time: '2 hours ago',
      icon: '⭐',
    },
  ];

  const systemHealth = [
    { label: 'API Status', value: 'Operational', status: 'success' },
    { label: 'Database', value: 'Healthy', status: 'success' },
    { label: 'AI Service', value: 'Operational', status: 'success' },
    { label: 'Storage', value: '67% Used', status: 'warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Admin Dashboard
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Monitor system performance and manage users
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <div className="animate-pulse">
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-24 mb-2"></div>
                  <div className="h-8 bg-[var(--bg-tertiary)] rounded w-16"></div>
                </div>
              </Card>
            ))}
          </>
        ) : (
          statCards.map((stat, index) => (
            <Card key={index}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-[var(--text-primary)]">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`text-3xl ${
                    stat.color === 'blue'
                      ? 'text-[var(--status-info)]'
                      : stat.color === 'green'
                        ? 'text-[var(--status-success)]'
                        : stat.color === 'purple'
                          ? 'text-[var(--interactive-primary)]'
                          : 'text-[var(--status-warning)]'
                  }`}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            System Health
          </h2>
          <div className="space-y-3">
            {systemHealth.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-[var(--text-secondary)]">
                  {item.label}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.status === 'success'
                      ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]'
                      : item.status === 'warning'
                        ? 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]'
                        : 'bg-[var(--status-error)]/10 text-[var(--status-error)]'
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-3 py-2">
                <div className="text-xl">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">
                    {activity.message}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Quick Admin Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/users"
            className="block p-4 border border-[var(--border-default)] rounded-lg hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium text-[var(--text-primary)]">
              Manage Users
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              View all users
            </div>
          </a>
          <button
            className="p-4 border border-[var(--border-default)] rounded-lg hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-[var(--text-primary)]">
              Analytics
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              Coming soon
            </div>
          </button>
          <button
            className="p-4 border border-[var(--border-default)] rounded-lg hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-medium text-[var(--text-primary)]">
              System Settings
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              Coming soon
            </div>
          </button>
          <button
            className="p-4 border border-[var(--border-default)] rounded-lg hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <div className="text-2xl mb-2">📧</div>
            <div className="font-medium text-[var(--text-primary)]">
              Email Notifications
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              Coming soon
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}

export function AdminDashboardPage() {
  return (
    <ErrorBoundary variant="full" context="page-admin-dashboard">
      <AdminDashboardPageContent />
    </ErrorBoundary>
  );
}
