import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@ai-chatbot/hooks';
import { Card, FormField, Button } from '@myapp/frontend/ui-components';
import { profileAPI } from '../api/profile.api';
import { useProfileStoreInitialization } from '../store/profile.store';

export function SecurityPage() {
  // Initialize profile store with event bus subscriptions
  useProfileStoreInitialization();

  const navigate = useNavigate();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Must contain uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Must contain lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Must contain number';
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Must contain special character';
    }
    return null;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate inputs
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        newErrors.newPassword = passwordError;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword =
        'New password must be different from current password';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);

      await profileAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      toast.success('Password changed successfully. Please login again.');

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage =
        error.response?.data?.error || 'Failed to change password';

      // Check if it's a current password error
      if (errorMessage.includes('Current password')) {
        setErrors({ currentPassword: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
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
              error={errors.currentPassword}
              required
            />

            <FormField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              required
              hint="Must be at least 8 characters with uppercase, lowercase, number, and special character"
            />

            <FormField
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} loading={isLoading}>
                Update Password
              </Button>
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
          <Button type="button" variant="outline" disabled>
            Enable Two-Factor Authentication (Coming Soon)
          </Button>
        </Card>

        {/* Active Sessions */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Active Sessions
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            View and manage your active sessions across different devices.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Current Session
                </p>
                <p className="text-xs text-gray-500">Active now</p>
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
