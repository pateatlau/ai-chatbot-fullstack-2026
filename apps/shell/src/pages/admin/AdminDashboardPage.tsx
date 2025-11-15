import { Card } from '@myapp/frontend/ui-components';
import { useRequireRole } from '@ai-chatbot/hooks';

export function AdminDashboardPage() {
  // Ensure only admins can access this page
  useRequireRole('ADMIN');

  const stats = [
    {
      label: 'Total Users',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: '👥',
      color: 'blue',
    },
    {
      label: 'Active Users',
      value: '856',
      change: '+8%',
      trend: 'up',
      icon: '✅',
      color: 'green',
    },
    {
      label: 'Total Conversations',
      value: '5,678',
      change: '+23%',
      trend: 'up',
      icon: '💬',
      color: 'purple',
    },
    {
      label: 'AI Tokens Used',
      value: '2.4M',
      change: '+15%',
      trend: 'up',
      icon: '🎯',
      color: 'orange',
    },
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitor system performance and manage users
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-green-600 font-medium">
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div
                className={`text-3xl ${
                  stat.color === 'blue'
                    ? 'text-blue-500'
                    : stat.color === 'green'
                      ? 'text-green-500'
                      : stat.color === 'purple'
                        ? 'text-purple-500'
                        : 'text-orange-500'
                }`}
              >
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Health
          </h2>
          <div className="space-y-3">
            {systemHealth.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-gray-600">{item.label}</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-3 py-2">
                <div className="text-xl">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Admin Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/users"
            className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium text-gray-900">Manage Users</div>
            <div className="text-sm text-gray-500">View all users</div>
          </a>
          <button
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
            disabled
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-900">Analytics</div>
            <div className="text-sm text-gray-500">Coming soon</div>
          </button>
          <button
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
            disabled
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-medium text-gray-900">System Settings</div>
            <div className="text-sm text-gray-500">Coming soon</div>
          </button>
          <button
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
            disabled
          >
            <div className="text-2xl mb-2">📧</div>
            <div className="font-medium text-gray-900">Email Notifications</div>
            <div className="text-sm text-gray-500">Coming soon</div>
          </button>
        </div>
      </Card>
    </div>
  );
}
