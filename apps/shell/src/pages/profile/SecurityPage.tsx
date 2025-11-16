import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Button, FormField } from '@myapp/frontend/ui-components';
import { useToast, useApi } from '@ai-chatbot/hooks';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function SecurityPage() {
  const toast = useToast();
  const { post } = useApi();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      await post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success('Password changed successfully!');
      reset();
    } catch (err: any) {
      const errorMessage =
        err.message || 'Failed to change password. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const activeSessions = [
    {
      device: 'Current Session',
      location: 'San Francisco, CA',
      ip: '192.168.1.1',
      lastActive: 'Active now',
      isCurrent: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security</h1>
        <p className="text-gray-600 mt-1">
          Manage your password and security settings
        </p>
      </div>

      {/* Change Password */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Change Password
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <FormField
            label="Current Password"
            type="password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            required
            {...register('currentPassword')}
          />

          <FormField
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            hint="Must be at least 8 characters with uppercase, lowercase, number, and special character"
            required
            {...register('newPassword')}
          />

          <FormField
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            required
            {...register('confirmPassword')}
          />

          <Button type="submit" loading={isLoading} disabled={isLoading}>
            Update Password
          </Button>
        </form>
      </Card>

      {/* Active Sessions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Active Sessions
        </h2>
        <div className="space-y-4">
          {activeSessions.map((session, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex gap-4">
                <div className="text-3xl">💻</div>
                <div>
                  <div className="font-medium text-gray-900">
                    {session.device}
                    {session.isCurrent && (
                      <span className="ml-2 text-xs font-normal px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {session.location} • {session.ip}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {session.lastActive}
                  </div>
                </div>
              </div>
              {!session.isCurrent && (
                <Button size="sm" variant="outline">
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Don't recognize a session? Revoke it immediately and change your
          password.
        </p>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="text-3xl">🔐</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Two-Factor Authentication
              </h2>
              <p className="text-gray-600 mb-4">
                Add an extra layer of security to your account
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                Not Enabled
              </div>
            </div>
          </div>
          <Button variant="outline" disabled>
            Enable (Coming Soon)
          </Button>
        </div>
      </Card>

      {/* Security Tips */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Security Tips
        </h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-2">
            <span>✅</span>
            <p>Use a strong, unique password for your account</p>
          </div>
          <div className="flex gap-2">
            <span>✅</span>
            <p>Never share your password with anyone</p>
          </div>
          <div className="flex gap-2">
            <span>✅</span>
            <p>Enable two-factor authentication when available</p>
          </div>
          <div className="flex gap-2">
            <span>✅</span>
            <p>Review active sessions regularly</p>
          </div>
          <div className="flex gap-2">
            <span>✅</span>
            <p>Log out from shared or public devices</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
