import { useAuth } from '@ai-chatbot/hooks';
import { Card } from '@myapp/frontend/ui-components';

export function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Conversations',
      value: '0',
      icon: '💬',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Messages',
      value: '0',
      icon: '✉️',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'AI Tokens Used',
      value: '0',
      icon: '🎯',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Active Sessions',
      value: '1',
      icon: '⚡',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const quickActions = [
    {
      title: 'New Conversation',
      description: 'Start chatting with AI',
      icon: '💬',
      href: '/chatbot',
      color: 'bg-primary-600 hover:bg-primary-700',
    },
    {
      title: 'View Profile',
      description: 'Manage your account',
      icon: '👤',
      href: '/profile',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      title: 'Settings',
      description: 'Customize preferences',
      icon: '⚙️',
      href: '/profile/settings',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  const recentActivity = [
    {
      type: 'login',
      message: 'You logged in',
      time: 'Just now',
      icon: '🔐',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-primary-100">
          Ready to continue your AI-powered conversations?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`text-4xl w-16 h-16 rounded-full ${stat.color} flex items-center justify-center`}
              >
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className={`${action.color} text-white rounded-lg p-6 transition-colors`}
              >
                <div className="text-4xl mb-3">{action.icon}</div>
                <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <Card>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Start using the chatbot to see more activity
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Getting Started Guide */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="text-4xl">🚀</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Getting Started
            </h3>
            <p className="text-gray-600 mb-4">
              Welcome to your AI Chatbot Dashboard! Here's how to get started:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Click "New Conversation" to start chatting with the AI</li>
              <li>Visit your profile to customize your account settings</li>
              <li>Check out the settings to personalize your experience</li>
              {user?.role === 'ADMIN' && (
                <li>
                  Access the Admin panel to manage users and system settings
                </li>
              )}
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
