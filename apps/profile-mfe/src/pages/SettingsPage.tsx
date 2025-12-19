import { useState, useEffect } from 'react';
import {
  useProfileStore,
  useProfileStoreInitialization,
  useThemeBroadcaster,
  useNotificationPreferences,
} from '../store/profile.store';
import { useToast } from '@myapp/frontend/hooks';
import { Card, Button, ErrorBoundary, cn } from '@myapp/frontend/ui-components';

function SettingsPageContent() {
  // Initialize profile store with event bus subscriptions
  useProfileStoreInitialization();

  // Get settings from profile store
  const { settings, updateSettings } = useProfileStore();

  // Use notification preferences helper
  useNotificationPreferences();

  // Use theme broadcaster to apply theme changes
  useThemeBroadcaster();

  const toast = useToast();

  const [emailNotifications, setEmailNotifications] = useState(
    settings.emailNotifications
  );
  const [pushNotifications, setPushNotifications] = useState(
    settings.pushNotifications
  );
  const [weeklyDigest, setWeeklyDigest] = useState(settings.weeklyDigest);
  const [theme, setTheme] = useState(settings.theme);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if there are unsaved changes
    const changed =
      emailNotifications !== settings.emailNotifications ||
      pushNotifications !== settings.pushNotifications ||
      weeklyDigest !== settings.weeklyDigest ||
      theme !== settings.theme;
    setHasChanges(changed);
  }, [emailNotifications, pushNotifications, weeklyDigest, theme, settings]);

  const handleSave = () => {
    updateSettings({
      emailNotifications,
      pushNotifications,
      weeklyDigest,
      theme,
    });
    toast.success('Settings saved successfully');
    setHasChanges(false);
  };

  const handleReset = () => {
    // Define default values
    const defaults = {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      theme: 'light' as const,
    };

    // Update store with defaults
    updateSettings({
      emailNotifications: defaults.emailNotifications,
      pushNotifications: defaults.pushNotifications,
      weeklyDigest: defaults.weeklyDigest,
      theme: defaults.theme,
    });

    // Sync local state with reset values
    setEmailNotifications(defaults.emailNotifications);
    setPushNotifications(defaults.pushNotifications);
    setWeeklyDigest(defaults.weeklyDigest);
    setTheme(defaults.theme);
    toast.info('Settings reset to defaults');
    setHasChanges(false);
  };

  const handleCancel = () => {
    // Revert to saved settings
    setEmailNotifications(settings.emailNotifications);
    setPushNotifications(settings.pushNotifications);
    setWeeklyDigest(settings.weeklyDigest);
    setTheme(settings.theme);
    setHasChanges(false);
  };

  return (
    <div className={cn('max-w-3xl mx-auto', 'px-4 py-6 sm:px-6 lg:px-8')}>
      <div className="mb-8">
        <h1 className={cn('text-3xl font-bold', 'text-text-primary')}>
          Settings
        </h1>
        <p className={cn('mt-2', 'text-text-secondary')}>
          Manage your account preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <Card>
          <h3 className={cn('text-lg font-medium mb-4', 'text-text-primary')}>
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={cn('text-sm font-medium', 'text-text-primary')}>
                  Email Notifications
                </h4>
                <p className={cn('text-sm', 'text-text-secondary')}>
                  Receive notifications via email
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0',
                  'cursor-pointer rounded-full border-2 border-transparent',
                  'transition-colors duration-200 ease-in-out',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  emailNotifications
                    ? 'bg-interactive-primary'
                    : 'bg-bg-tertiary',
                  'focus:ring-border-focus'
                )}
                role="switch"
                aria-checked={emailNotifications}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5',
                    'transform rounded-full bg-white shadow ring-0',
                    'transition duration-200 ease-in-out',
                    emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className={cn('text-sm font-medium', 'text-text-primary')}>
                  Push Notifications
                </h4>
                <p className={cn('text-sm', 'text-text-secondary')}>
                  Receive push notifications
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPushNotifications(!pushNotifications)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0',
                  'cursor-pointer rounded-full border-2 border-transparent',
                  'transition-colors duration-200 ease-in-out',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  pushNotifications
                    ? 'bg-interactive-primary'
                    : 'bg-bg-tertiary',
                  'focus:ring-border-focus'
                )}
                role="switch"
                aria-checked={pushNotifications}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5',
                    'transform rounded-full bg-white shadow ring-0',
                    'transition duration-200 ease-in-out',
                    pushNotifications ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className={cn('text-sm font-medium', 'text-text-primary')}>
                  Weekly Digest
                </h4>
                <p className={cn('text-sm', 'text-text-secondary')}>
                  Receive weekly activity summary
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWeeklyDigest(!weeklyDigest)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0',
                  'cursor-pointer rounded-full border-2 border-transparent',
                  'transition-colors duration-200 ease-in-out',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  weeklyDigest ? 'bg-interactive-primary' : 'bg-bg-tertiary',
                  'focus:ring-border-focus'
                )}
                role="switch"
                aria-checked={weeklyDigest}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5',
                    'transform rounded-full bg-white shadow ring-0',
                    'transition duration-200 ease-in-out',
                    weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <h3 className={cn('text-lg font-medium mb-4', 'text-text-primary')}>
            Appearance
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="theme-select"
                className={cn(
                  'text-sm font-medium block mb-2',
                  'text-text-primary'
                )}
              >
                Theme
              </label>
              <select
                id="theme-select"
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value as 'light' | 'dark' | 'system')
                }
                className={cn(
                  'w-full px-3 py-2 rounded-md',
                  'border border-border-default',
                  'bg-bg-primary text-text-primary',
                  'focus:outline-none focus:ring-2',
                  'focus:ring-border-focus focus:border-transparent',
                  'transition-all duration-200'
                )}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
              <p className={cn('mt-2 text-sm', 'text-text-tertiary')}>
                Choose how the interface appears
              </p>
            </div>
          </div>
        </Card>

        {/* Save/Reset Actions */}
        {hasChanges && (
          <Card>
            <div
              className={cn(
                'flex flex-col sm:flex-row sm:items-center sm:justify-between',
                'gap-4'
              )}
            >
              <p className={cn('text-sm', 'text-text-secondary')}>
                You have unsaved changes
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset to Defaults
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        )}

        {!hasChanges && (
          <Card>
            <div
              className={cn(
                'flex flex-col sm:flex-row sm:items-center sm:justify-between',
                'gap-4'
              )}
            >
              <p className={cn('text-sm', 'text-text-secondary')}>
                All changes saved
              </p>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset to Defaults
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <ErrorBoundary variant="full" context="page-settings">
      <SettingsPageContent />
    </ErrorBoundary>
  );
}
