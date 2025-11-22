import { useState, useEffect } from 'react';
import { Card, Button, ErrorBoundary } from '@myapp/frontend/ui-components';
import { useToast } from '@myapp/frontend/hooks';
import { adminAPI, User } from '../api/admin.api';
import {
  useAdminStore,
  useAdminStoreInitialization,
} from '../store/admin.store';

function UserManagementPageContent() {
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

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers({ page, limit, ...filters });

      // Convert API users to store format
      const storeUsers = data.users.map((user) => ({
        ...user,
        isBanned: false, // API doesn't provide this, set default
        createdAt: user.createdAt,
        updatedAt: user.updatedAt || user.createdAt,
      }));

      setUsers(storeUsers);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
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
        return 'bg-red-100 text-red-800';
      case 'MODERATOR':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="MODERATOR">Moderator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-gray-600">
            Showing {users.length} of {total} users
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Last Login
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-4" colSpan={6}>
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
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
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {user.lastLoginAt
                        ? formatDate(user.lastLoginAt)
                        : 'Never'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/admin/users/${user.id}`}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              variant="outline"
            >
              Previous
            </Button>
            <div className="text-sm text-gray-600">
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
