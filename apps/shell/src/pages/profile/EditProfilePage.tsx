import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Button, FormField } from '@myapp/frontend/ui-components';
import { useAuth, useToast, useApi } from '@ai-chatbot/hooks';

const editProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const { put } = useApi();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);

    try {
      // Update user profile via API
      const updatedUser = await put(`/users/${user?.id}`, data);

      // Update local user state
      updateUser(updatedUser);

      toast.success('Profile updated successfully!');

      // Navigate back to profile
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } catch (err: any) {
      const errorMessage =
        err.message || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-1">Update your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <Button type="button" variant="outline" size="sm" disabled>
                      Change Avatar (Coming Soon)
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      Avatar upload will be available in a future update
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <FormField
                label="Full Name"
                type="text"
                placeholder="John Doe"
                error={errors.name?.message}
                required
                {...register('name')}
              />

              {/* Email Field */}
              <FormField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                required
                {...register('email')}
              />

              {/* Role (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                  {user?.role || 'USER'}
                  <span className="text-xs text-gray-500 ml-2">
                    (Cannot be changed)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button type="submit" loading={isLoading} disabled={isLoading}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Tips
            </h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex gap-2">
                <span>✅</span>
                <p>Use your real name for better personalization</p>
              </div>
              <div className="flex gap-2">
                <span>✅</span>
                <p>Keep your email up to date for notifications</p>
              </div>
              <div className="flex gap-2">
                <span>🔒</span>
                <p>Your information is kept private and secure</p>
              </div>
              <div className="flex gap-2">
                <span>💡</span>
                <p>
                  Need to change your password? Visit the{' '}
                  <a
                    href="/profile/security"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Security
                  </a>{' '}
                  page
                </p>
              </div>
            </div>
          </Card>

          <Card className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Account ID
            </h3>
            <p className="text-xs font-mono text-gray-600 break-all">
              {user?.id || 'N/A'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
