import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@myapp/frontend/hooks';
import {
  Card,
  FormField,
  Button,
  ErrorBoundary,
  cn,
} from '@myapp/frontend/ui-components';
import { useChangePassword } from '@myapp/frontend/apollo-client';
import { useProfileStoreInitialization } from '../store/profile.store';

function SecurityPageContent() {
  // Initialize profile store with event bus subscriptions
  useProfileStoreInitialization();

  const navigate = useNavigate();
  const toast = useToast();

  // GraphQL mutation for changing password
  const changePasswordMutation = useChangePassword();

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

      // Use GraphQL mutation instead of REST API
      const result = await changePasswordMutation(currentPassword, newPassword);

      if (result.data?.changePassword?.success) {
        toast.success('Password changed successfully. Please login again.');

        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.message ||
        'Failed to change password';

      // Check if it's a current password error
      if (
        errorMessage.includes('Current password') ||
        errorMessage.includes('current')
      ) {
        setErrors({ currentPassword: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('max-w-3xl mx-auto', 'px-4 py-6 sm:px-6 lg:px-8')}>
      <div className="mb-8">
        <h1 className={cn('text-3xl font-bold', 'text-text-primary')}>
          Security
        </h1>
        <p className={cn('mt-2', 'text-text-secondary')}>
          Manage your password and security settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Change Password */}
        <Card>
          <h3 className={cn('text-lg font-medium mb-4', 'text-text-primary')}>
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
          <h3 className={cn('text-lg font-medium mb-4', 'text-text-primary')}>
            Two-Factor Authentication
          </h3>
          <p className={cn('text-sm mb-4', 'text-text-secondary')}>
            Add an extra layer of security to your account by enabling
            two-factor authentication.
          </p>
          <Button type="button" variant="outline" disabled>
            Enable Two-Factor Authentication (Coming Soon)
          </Button>
        </Card>

        {/* Active Sessions */}
        <Card>
          <h3
            className={cn(
              'text-lg font-medium mb-4',
              'text-[var(--text-primary)]'
            )}
          >
            Active Sessions
          </h3>
          <p className={cn('text-sm mb-4', 'text-text-secondary')}>
            View and manage your active sessions across different devices.
          </p>
          <div className="space-y-3">
            <div
              className={cn(
                'flex items-center justify-between p-3 rounded-lg',
                'border border-border-default'
              )}
            >
              <div>
                <p className={cn('text-sm font-medium', 'text-text-primary')}>
                  Current Session
                </p>
                <p className={cn('text-xs', 'text-text-tertiary')}>
                  Active now
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded',
                  'text-xs font-medium',
                  'bg-feedback-successBg text-feedback-success'
                )}
              >
                Active
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function SecurityPage() {
  return (
    <ErrorBoundary variant="full" context="page-security">
      <SecurityPageContent />
    </ErrorBoundary>
  );
}
