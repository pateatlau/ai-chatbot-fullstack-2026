import {
  useProfileStore,
  useProfileStoreInitialization,
} from '../store/profile.store';
import { Card, ErrorBoundary, cn } from '@myapp/frontend/ui-components';

function ProfilePageContent() {
  // Initialize profile store with event bus subscriptions
  useProfileStoreInitialization();

  // Get user from profile store
  const { user } = useProfileStore();

  return (
    <div className={cn('max-w-4xl mx-auto', 'px-4 py-6 sm:px-6 lg:px-8')}>
      <div className="mb-8">
        <h1 className={cn('text-3xl font-bold', 'text-text-primary')}>
          Profile
        </h1>
        <p className={cn('mt-2', 'text-text-secondary')}>
          View and manage your profile information
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <div
            className={cn(
              'flex flex-col sm:flex-row sm:items-center',
              'gap-4 sm:gap-6'
            )}
          >
            <div className="flex-shrink-0">
              <div
                className={cn(
                  'flex items-center justify-center',
                  'w-20 h-20 sm:w-24 sm:h-24 rounded-full',
                  'bg-interactive-primary/10'
                )}
              >
                <span
                  className={cn(
                    'text-2xl sm:text-3xl font-bold',
                    'text-interactive-primary'
                  )}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className={cn(
                  'text-2xl font-bold truncate',
                  'text-text-primary'
                )}
              >
                {user?.name || 'User'}
              </h2>
              <p className={cn('truncate', 'text-text-secondary')}>
                {user?.email || 'Loading...'}
              </p>
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 mt-2',
                  'text-xs font-medium rounded-full',
                  'bg-interactive-primary/10 text-interactive-primary'
                )}
              >
                {user?.role || 'User'}
              </span>
            </div>
            <div className="flex-shrink-0">
              <a
                href="/profile/edit"
                className={cn(
                  'inline-flex items-center px-4 py-2',
                  'text-sm font-medium rounded-md',
                  'text-text-inverse bg-interactive-primary',
                  'hover:bg-interactive-primaryHover',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'focus:ring-border-focus',
                  'transition-colors'
                )}
              >
                Edit Profile
              </a>
            </div>
          </div>
        </Card>

        {/* Profile Information */}
        <Card>
          <h3 className={cn('mb-4 text-lg font-medium', 'text-text-primary')}>
            Profile Information
          </h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className={cn('text-sm font-medium', 'text-text-secondary')}>
                Full name
              </dt>
              <dd className={cn('mt-1 text-sm', 'text-text-primary')}>
                {user?.name}
              </dd>
            </div>
            <div>
              <dt className={cn('text-sm font-medium', 'text-text-secondary')}>
                Email address
              </dt>
              <dd className={cn('mt-1 text-sm', 'text-text-primary')}>
                {user?.email}
              </dd>
            </div>
            <div>
              <dt className={cn('text-sm font-medium', 'text-text-secondary')}>
                Role
              </dt>
              <dd className={cn('mt-1 text-sm', 'text-text-primary')}>
                {user?.role}
              </dd>
            </div>
            <div>
              <dt className={cn('text-sm font-medium', 'text-text-secondary')}>
                Account Status
              </dt>
              <dd className={cn('mt-1 text-sm', 'text-text-primary')}>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded',
                    'text-xs font-medium',
                    'bg-feedback-successBg text-feedback-success'
                  )}
                >
                  Active
                </span>
              </dd>
            </div>
          </dl>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className={cn('mb-4 text-lg font-medium', 'text-text-primary')}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href="/profile/settings"
              className={cn(
                'flex items-center p-4 rounded-lg',
                'border border-border-default',
                'hover:border-border-hover hover:bg-bg-secondary',
                'transition-colors'
              )}
            >
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-md',
                    'text-white bg-interactive-primary'
                  )}
                >
                  ⚙️
                </div>
              </div>
              <div className="ml-4">
                <h4 className={cn('text-sm font-medium', 'text-text-primary')}>
                  Settings
                </h4>
                <p className={cn('text-sm', 'text-text-secondary')}>
                  Manage your preferences
                </p>
              </div>
            </a>
            <a
              href="/profile/security"
              className={cn(
                'flex items-center p-4 rounded-lg',
                'border border-border-default',
                'hover:border-border-hover hover:bg-bg-secondary',
                'transition-colors'
              )}
            >
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-md',
                    'text-white bg-interactive-primary'
                  )}
                >
                  🔒
                </div>
              </div>
              <div className="ml-4">
                <h4 className={cn('text-sm font-medium', 'text-text-primary')}>
                  Security
                </h4>
                <p className={cn('text-sm', 'text-text-secondary')}>
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

export function ProfilePage() {
  return (
    <ErrorBoundary variant="full" context="page-profile-view">
      <ProfilePageContent />
    </ErrorBoundary>
  );
}
