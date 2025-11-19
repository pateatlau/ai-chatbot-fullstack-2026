import {
  useProfileStore,
  useProfileStoreInitialization,
} from '../store/profile.store';
import { Card } from '@myapp/frontend/ui-components';

export function ProfilePage() {
  // Initialize profile store with event bus subscriptions
  useProfileStoreInitialization();

  // Get user from profile store
  const { user } = useProfileStore();

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">
          View and manage your profile information
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary-100">
                <span className="text-3xl font-bold text-primary-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <span className="inline-flex items-center px-3 py-1 mt-2 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                {user?.role}
              </span>
            </div>
            <div>
              <a
                href="/profile/edit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Edit Profile
              </a>
            </div>
          </div>
        </Card>

        {/* Profile Information */}
        <Card>
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Profile Information
          </h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.role}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Account Status
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </dd>
            </div>
          </dl>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href="/profile/settings"
              className="flex items-center p-4 transition-all border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 text-white rounded-md bg-primary-500">
                  ⚙️
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Settings</h4>
                <p className="text-sm text-gray-500">Manage your preferences</p>
              </div>
            </a>
            <a
              href="/profile/security"
              className="flex items-center p-4 transition-all border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 text-white rounded-md bg-primary-500">
                  🔒
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Security</h4>
                <p className="text-sm text-gray-500">
                  Password and security settings
                </p>
              </div>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
