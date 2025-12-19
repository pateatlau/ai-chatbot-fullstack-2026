import { useState, useEffect } from 'react';
import { Card, Button, ErrorBoundary } from '@myapp/frontend/ui-components';
import { useToast, useRequireRole } from '@myapp/frontend/hooks';
import { useUsers } from '@myapp/frontend/apollo-client';
import { adminAPI, User } from '../api/admin.api';
import {
  useAdminStore,
  useAdminStoreInitialization,
} from '../store/admin.store';

function UserManagementPageContent() {
  // Ensure only ADMIN users can access this page
  useRequireRole('ADMIN');

  // Initialize admin store with event bus subscriptions
  useAdminStoreInitialization();

  // Get state and actions from store
  const { users, isLoading, setUsers, setLoading } = useAdminStore();

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<{
    role?: string;
    isActive?: boolean;
  }>({});
  const toast = useToast();

  const limit = 10;

  // Use GraphQL query for users
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch,
  } = useUsers(page, limit);

  // Update store when GraphQL data changes
  useEffect(() => {
    if (usersData?.users) {
      const storeUsers = usersData.users.users.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.firstName || user.username || user.email,
        role: user.role,
        isActive: user.isActive,
        isBanned: false,
        lastLoginAt: null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      setUsers(storeUsers);
      setTotal(usersData.users.total);
    }
    // setUsers is a stable zustand action, doesn't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersData]);

  // Handle loading and error states
  useEffect(() => {
    setLoading(usersLoading);

    if (usersError) {
      toast.error('Failed to load user list');
    }
    // setLoading and toast are stable functions, don't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersLoading, usersError]);

  const loadUsers = async () => {
    refetch();
  };

  useEffect(() => {
    // Refetch when page or filters change
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success(`User "${userName}" has been deleted successfully`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-[var(--status-error)]/10 text-[var(--status-error)]';
      case 'MODERATOR':
        return 'bg-[var(--interactive-primary)]/10 text-[var(--interactive-primary)]';
      default:
        return 'bg-[var(--status-info)]/10 text-[var(--status-info)]';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            User Management
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button onClick={loadUsers} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Role
            </label>
            <select
              value={filters.role || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  role: e.target.value || undefined,
                }))
              }
              className="px-3 py-2 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="MODERATOR">Moderator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Status
            </label>
            <select
              value={
                filters.isActive === undefined
                  ? ''
                  : filters.isActive
                    ? 'active'
                    : 'inactive'
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  isActive:
                    e.target.value === ''
                      ? undefined
                      : e.target.value === 'active',
                }))
              }
              className="px-3 py-2 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-[var(--text-secondary)]">
            Showing {users.length} of {total} users
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Last Login
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-primary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--border-subtle)]"
                    >
                      <td className="px-4 py-4" colSpan={6}>
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4"></div>
                            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/2"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[var(--text-secondary)]"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {user.name}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {user.lastLoginAt
                        ? formatDate(user.lastLoginAt)
                        : 'Never'}
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/admin/users/${user.id}`}
                          className="text-sm text-[var(--interactive-primary)] hover:text-[var(--interactive-primaryHover)] font-medium"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="text-sm text-[var(--status-error)] hover:opacity-80 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-default)]">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              variant="outline"
            >
              Previous
            </Button>
            <div className="text-sm text-[var(--text-secondary)]">
              Page {page} of {totalPages}
            </div>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export function UserManagementPage() {
  return (
    <ErrorBoundary variant="full" context="page-users">
      <UserManagementPageContent />
    </ErrorBoundary>
  );
}
