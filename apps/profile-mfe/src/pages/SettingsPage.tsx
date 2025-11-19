import { useState, useEffect } from 'react';
import {
  useProfileStore,
  useProfileStoreInitialization,
  useThemeBroadcaster,
  useNotificationPreferences,
} from '../store/profile.store';
import { useToast } from '@myapp/frontend/hooks';
import { Card, Button } from '@myapp/frontend/ui-components';

export function SettingsPage() {
  // Initialize profile store with event bus subscriptions
  useProfileStoreInitialization();

  // Get settings from profile store
  const { settings, updateSettings } = useProfileStore();

  // Use notification preferences helper
  const { resetToDefaults } = useNotificationPreferences();

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
    resetToDefaults();
    // Sync local state with reset values
    const defaults = {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      theme: 'light' as const,
    };
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
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Email Notifications
                </h4>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`${
                  emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                role="switch"
                aria-checked={emailNotifications}
              >
                <span
                  className={`${
                    emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Push Notifications
                </h4>
                <p className="text-sm text-gray-500">
                  Receive push notifications
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`${
                  pushNotifications ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                role="switch"
                aria-checked={pushNotifications}
              >
                <span
                  className={`${
                    pushNotifications ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Weekly Digest
                </h4>
                <p className="text-sm text-gray-500">
                  Receive weekly activity summary
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWeeklyDigest(!weeklyDigest)}
                className={`${
                  weeklyDigest ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                role="switch"
                aria-checked={weeklyDigest}
              >
                <span
                  className={`${
                    weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="theme-select"
                className="text-sm font-medium text-gray-900 block mb-2"
              >
                Theme
              </label>
              <select
                id="theme-select"
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value as 'light' | 'dark' | 'system')
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Choose how the interface appears
              </p>
            </div>
          </div>
        </Card>

        {/* Save/Reset Actions */}
        {hasChanges && (
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">You have unsaved changes</p>
              <div className="flex space-x-3">
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">All changes saved</p>
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
