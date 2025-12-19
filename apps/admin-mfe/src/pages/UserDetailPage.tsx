import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card,
  Button,
  Input,
  ErrorBoundary,
} from '@myapp/frontend/ui-components';
import { useToast, useRequireRole } from '@myapp/frontend/hooks';
import {
  useGetUser,
  useUpdateUser,
  useResetPassword,
} from '@myapp/frontend/apollo-client';
import { User } from '../api/admin.api';
import {
  useAdminStore,
  useAdminStoreInitialization,
} from '../store/admin.store';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

function UserDetailPageContent() {
  // Ensure only ADMIN users can access this page
  useRequireRole('ADMIN');

  // Initialize admin store with event bus subscriptions
  useAdminStoreInitialization();

  const location = useLocation();
  const userId = location.pathname.split('/').pop() || '';
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'MODERATOR',
    isActive: true,
  });
  const [newPassword, setNewPassword] = useState('');
  const toast = useToast();

  // Use GraphQL queries and mutations
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetUser(userId);

  const updateUserMutation = useUpdateUser();
  const resetPasswordMutation = useResetPassword();

  // Update local state when GraphQL user data changes
  useEffect(() => {
    if (userData?.user) {
      const loadedUser = userData.user;
      setUser(loadedUser);
      setFormData({
        name: loadedUser.name,
        email: loadedUser.email,
        role: loadedUser.role,
        isActive: loadedUser.isActive,
      });
    }
  }, [userData]);

  // Handle errors
  useEffect(() => {
    if (userError) {
      toast.error('Failed to load user details');
    }
  }, [userError, toast]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserMutation(userId, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      });

      // Emit event for cross-MFE coordination
      const eventBus = getEventBus();
      eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
        userId,
        updates: formData,
      });

      toast.success('User information has been updated successfully');
      refetchUser();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await resetPasswordMutation(userId, newPassword);
      toast.success('User password has been reset successfully');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (userLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--bg-tertiary)] rounded w-64 mb-2"></div>
          <div className="h-4 bg-[var(--bg-tertiary)] rounded w-96"></div>
        </div>
        <Card>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-32"></div>
            <div className="h-10 bg-[var(--bg-tertiary)] rounded"></div>
            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-32"></div>
            <div className="h-10 bg-[var(--bg-tertiary)] rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-12">
            <p className="text-[var(--text-secondary)]">User not found</p>
            <a
              href="/admin/users"
              className="text-[var(--interactive-primary)] hover:text-[var(--interactive-primaryHover)] mt-4 inline-block"
            >
              Back to users
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <a
            href="/admin/users"
            className="text-[var(--interactive-primary)] hover:text-[var(--interactive-primaryHover)]"
          >
            ← Back to users
          </a>
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          {user.name}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            User Information
          </h2>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Name
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: e.target.value as 'USER' | 'ADMIN' | 'MODERATOR',
                  }))
                }
                className="w-full px-3 py-2 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
              >
                <option value="USER">User</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-[var(--interactive-primary)] focus:ring-[var(--border-focus)] border-[var(--border-default)] rounded"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-[var(--text-primary)]"
              >
                Active Account
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit">Save Changes</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (user) {
                    setFormData({
                      name: user.name,
                      email: user.email,
                      role: user.role,
                      isActive: user.isActive,
                    });
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Metadata Card */}
        <Card>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Metadata
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">User ID</p>
              <p className="text-sm font-mono text-[var(--text-primary)] break-all">
                {user.id}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Created</p>
              <p className="text-sm text-[var(--text-primary)]">
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Last Updated
              </p>
              <p className="text-sm text-[var(--text-primary)]">
                {formatDate(user.updatedAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Last Login</p>
              <p className="text-sm text-[var(--text-primary)]">
                {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Password Reset */}
      <Card>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Reset Password
        </h2>
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              New Password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 8 characters)"
            />
          </div>
          <Button onClick={handleResetPassword} variant="outline">
            Reset Password
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function UserDetailPage() {
  return (
    <ErrorBoundary variant="full" context="page-user-detail">
      <UserDetailPageContent />
    </ErrorBoundary>
  );
}
