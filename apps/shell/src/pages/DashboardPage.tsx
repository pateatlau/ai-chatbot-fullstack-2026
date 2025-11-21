import { Link } from 'react-router-dom';
import { useAuth } from '@ai-chatbot/hooks';
import { Card } from '@myapp/frontend/ui-components';

export function DashboardPage() {
  const { user } = useAuth();
  const timeOfDay =
    new Date().getHours() < 12
      ? 'morning'
      : new Date().getHours() < 18
        ? 'afternoon'
        : 'evening';

  const stats = [
    {
      label: 'Conversations',
      value: '0',
      change: '+0%',
      icon: '💬',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: 'neutral',
    },
    {
      label: 'Messages',
      value: '0',
      change: '+0%',
      icon: '✉️',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: 'neutral',
    },
    {
      label: 'AI Tokens Used',
      value: '0',
      change: '+0%',
      icon: '🎯',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trend: 'neutral',
    },
    {
      label: 'Active Sessions',
      value: '1',
      change: 'Active',
      icon: '⚡',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trend: 'positive',
    },
  ];

  const quickActions = [
    {
      title: 'Start Conversation',
      description: 'Chat with AI assistant',
      icon: '💬',
      href: '/chatbot',
      color: 'from-primary-500 to-primary-600',
      textColor: 'text-white',
    },
    {
      title: 'Your Profile',
      description: 'View account details',
      icon: '👤',
      href: '/profile',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-white',
    },
    {
      title: 'Settings',
      description: 'Manage preferences',
      icon: '⚙️',
      href: '/profile/settings',
      color: 'from-slate-500 to-slate-600',
      textColor: 'text-white',
    },
  ];

  const features = [
    {
      title: 'AI-Powered Conversations',
      description: 'Chat with advanced AI models for intelligent discussions',
      icon: '🤖',
    },
    {
      title: 'Conversation History',
      description: 'Access and manage all your previous conversations',
      icon: '📚',
    },
    {
      title: 'Personal Profile',
      description: 'Customize your account and preferences',
      icon: '🎨',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-primary-600 via-primary-500 to-primary-700 px-6 py-12 md:px-8 md:py-16 shadow-lg">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white opacity-10"></div>
          <div className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-white opacity-10"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Good {timeOfDay}, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl">
            Welcome back to your AI Chatbot dashboard. Let's explore what you
            can do today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div
              className={`absolute inset-0 ${stat.bgColor} opacity-40`}
            ></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`text-3xl ${stat.iconColor}`}>{stat.icon}</div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${stat.trend === 'positive' ? 'text-green-600' : 'text-gray-600'}`}
                >
                  {stat.change}
                </span>
                {stat.trend === 'positive' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    Active
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className={`group relative overflow-hidden rounded-xl bg-linear-to-br ${action.color} p-6 ${action.textColor} shadow-md hover:shadow-lg transition-all transform hover:scale-105`}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-3 group-group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
                <div className="mt-4 flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Go <span className="ml-2">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Call-to-Action Section */}
      <Card className="bg-linear-to-r from-indigo-50 to-blue-50 border border-indigo-100 text-gray-900!">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ready to start?
            </h3>
            <p className="text-gray-600">
              Begin your first conversation with our AI assistant and explore
              the capabilities of intelligent chatting.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              to="/chatbot"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
            >
              Start Now <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </Card>

      {/* Admin Access Notice */}
      {user?.role === 'ADMIN' && (
        <Card className="border-l-4 border-amber-500 bg-amber-50">
          <div className="flex items-start gap-4">
            <div className="text-3xl">👨‍💼</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Admin Access</h3>
              <p className="text-gray-600 text-sm mb-3">
                You have access to the admin panel to manage users and system
                settings.
              </p>
              <Link
                to="/admin"
                className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
              >
                Go to Admin Panel <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
