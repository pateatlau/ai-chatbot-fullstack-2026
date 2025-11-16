import { useState } from 'react';
import { Card, FormField } from '@myapp/frontend/ui-components';

export function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password change
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Security</h1>
        <p className="mt-2 text-gray-600">
          Manage your password and security settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Change Password */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <FormField
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <FormField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              hint="Must be at least 8 characters with uppercase, lowercase, number, and special character"
            />

            <FormField
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Update Password
              </button>
            </div>
          </form>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Add an extra layer of security to your account by enabling
            two-factor authentication.
          </p>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Enable Two-Factor Authentication
          </button>
        </Card>

        {/* Active Sessions */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Active Sessions
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Current Session
                </p>
                <p className="text-xs text-gray-500">
                  MacOS • Chrome • San Francisco, CA
                </p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
