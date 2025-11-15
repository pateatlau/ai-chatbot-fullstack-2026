import { Link } from 'react-router-dom';
import { Card, Button } from '@myapp/frontend/ui-components';
import { useAuth } from '@ai-chatbot/hooks';

export function ProfilePage() {
  const { user } = useAuth();

  type ProfileItem = {
    label: string;
    value: string;
    badge?: boolean;
    mono?: boolean;
    color?: 'success';
  };

  const profileSections: { title: string; items: ProfileItem[] }[] = [
    {
      title: 'Personal Information',
      items: [
        { label: 'Name', value: user?.name || 'N/A' },
        { label: 'Email', value: user?.email || 'N/A' },
        { label: 'Role', value: user?.role || 'N/A', badge: true },
        { label: 'User ID', value: user?.id || 'N/A', mono: true },
      ],
    },
    {
      title: 'Account Status',
      items: [
        { label: 'Status', value: 'Active', badge: true, color: 'success' },
        { label: 'Member Since', value: 'November 2025' },
        { label: 'Last Login', value: 'Just now' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">
            View and manage your account information
          </p>
        </div>
        <Link to="/profile/edit">
          <Button>Edit Profile</Button>
        </Link>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {user?.name || 'User'}
            </h2>
            <p className="text-gray-600 mb-4">{user?.email || 'N/A'}</p>
            <div className="flex gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user?.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {user?.role || 'USER'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profileSections.map((section, index) => (
          <Card key={index}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {section.title}
            </h3>
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-600">{item.label}:</span>
                  {item.badge ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.color === 'success'
                          ? 'bg-green-100 text-green-800'
                          : user?.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.value}
                    </span>
                  ) : (
                    <span
                      className={`text-sm font-medium text-gray-900 ${
                        item.mono ? 'font-mono text-xs' : ''
                      }`}
                    >
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/profile/edit" className="block">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
              <div className="text-2xl mb-2">✏️</div>
              <div className="font-medium text-gray-900">Edit Profile</div>
              <div className="text-sm text-gray-500">
                Update your information
              </div>
            </div>
          </Link>
          <Link to="/profile/settings" className="block">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium text-gray-900">Settings</div>
              <div className="text-sm text-gray-500">Manage preferences</div>
            </div>
          </Link>
          <Link to="/profile/security" className="block">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
              <div className="text-2xl mb-2">🔒</div>
              <div className="font-medium text-gray-900">Security</div>
              <div className="text-sm text-gray-500">Password & sessions</div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
