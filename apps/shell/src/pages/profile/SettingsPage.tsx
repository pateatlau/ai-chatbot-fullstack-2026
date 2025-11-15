import { useState } from 'react';
import { Card } from '@myapp/frontend/ui-components';
import { useToast } from '@ai-chatbot/hooks';

export function SettingsPage() {
  const toast = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    chat: true,
  });
  const [language, setLanguage] = useState('en');

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast.info(`Theme changed to ${newTheme} mode (Coming Soon)`);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Notification preferences updated');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    toast.info('Language preference saved (Coming Soon)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Customize your experience and preferences
        </p>
      </div>

      {/* Theme Settings */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  theme === 'light'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">☀️</div>
                <div className="font-medium">Light</div>
                <div className="text-xs text-gray-500">Default theme</div>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">🌙</div>
                <div className="font-medium">Dark</div>
                <div className="text-xs text-gray-500">Coming soon</div>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <div className="font-medium text-gray-900">
                Email Notifications
              </div>
              <div className="text-sm text-gray-500">
                Receive updates via email
              </div>
            </div>
            <button
              onClick={() => handleNotificationChange('email')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.email ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <div className="font-medium text-gray-900">
                Push Notifications
              </div>
              <div className="text-sm text-gray-500">
                Browser notifications (Coming soon)
              </div>
            </div>
            <button
              onClick={() => handleNotificationChange('push')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.push ? 'bg-primary-600' : 'bg-gray-200'
              }`}
              disabled
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.push ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-gray-900">
                Chat Notifications
              </div>
              <div className="text-sm text-gray-500">
                Notifications for new messages
              </div>
            </div>
            <button
              onClick={() => handleNotificationChange('chat')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.chat ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.chat ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Language Settings */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Language</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Language
          </label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Español (Coming Soon)</option>
            <option value="fr">Français (Coming Soon)</option>
            <option value="de">Deutsch (Coming Soon)</option>
            <option value="zh">中文 (Coming Soon)</option>
          </select>
          <p className="text-sm text-gray-500 mt-2">
            More languages will be available soon
          </p>
        </div>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Data & Privacy
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <div className="font-medium text-gray-900 mb-1">
                Your data is secure
              </div>
              <p className="text-sm text-gray-600">
                We use industry-standard encryption to protect your
                conversations and personal information.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">📊</div>
            <div>
              <div className="font-medium text-gray-900 mb-1">
                Data collection
              </div>
              <p className="text-sm text-gray-600">
                We only collect data necessary to provide and improve our
                services. You can request a copy of your data at any time.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
