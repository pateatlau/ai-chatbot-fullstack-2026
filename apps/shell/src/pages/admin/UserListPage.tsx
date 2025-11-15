import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '@myapp/frontend/ui-components';
import { useRequireRole, useApi, useToast } from '@ai-chatbot/hooks';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'inactive';
};

export function UserListPage() {
  // Ensure only admins can access this page
  useRequireRole('ADMIN');

  const { del } = useApi();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created'>('created');

  // Mock data - in real app, this would come from API
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
      createdAt: '2025-11-01',
      lastLogin: '2025-11-20',
      status: 'active',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'ADMIN',
      createdAt: '2025-10-15',
      lastLogin: '2025-11-21',
      status: 'active',
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'USER',
      createdAt: '2025-11-10',
      lastLogin: '2025-11-19',
      status: 'active',
    },
    {
      id: '4',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'USER',
      createdAt: '2025-11-05',
      lastLogin: '2025-11-15',
      status: 'inactive',
    },
  ];

  const [users] = useState<User[]>(mockUsers);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'email') return a.email.localeCompare(b.email);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      await del(`/users/${userId}`);
      toast.success('User deleted successfully');
      // In real app, refetch users list
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">View and manage all users</p>
        </div>
        <Button disabled>Add User (Coming Soon)</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">Users Only</option>
              <option value="ADMIN">Admins Only</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'name' | 'email' | 'created')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="created">Date Created</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {users.length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Active Users</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {users.filter((u) => u.status === 'active').length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Admins</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {users.filter((u) => u.role === 'ADMIN').length}
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Created
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="font-medium text-gray-900 hover:text-primary-600"
                    >
                      {user.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/users/${user.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found matching your criteria
            </div>
          )}
        </div>
      </Card>

      {/* Pagination (placeholder) */}
      {sortedUsers.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {sortedUsers.length} of {users.length} users
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled>
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
