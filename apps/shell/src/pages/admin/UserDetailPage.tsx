import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button } from '@myapp/frontend/ui-components';
import { useRequireRole, useApi, useToast } from '@ai-chatbot/hooks';

type UserDetail = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'inactive';
  stats: {
    conversations: number;
    messages: number;
    tokensUsed: number;
  };
};

export function UserDetailPage() {
  // Ensure only admins can access this page
  useRequireRole('ADMIN');

  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { put, del } = useApi();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, fetch from API
  const [user, setUser] = useState<UserDetail>({
    id: userId || '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER',
    createdAt: '2025-11-01',
    lastLogin: '2025-11-20',
    status: 'active',
    stats: {
      conversations: 45,
      messages: 324,
      tokensUsed: 125000,
    },
  });

  const activityLog = [
    { type: 'login', message: 'User logged in', time: '2 hours ago' },
    {
      type: 'conversation',
      message: 'Started new conversation',
      time: '3 hours ago',
    },
    { type: 'message', message: 'Sent 15 messages', time: '5 hours ago' },
    { type: 'login', message: 'User logged in', time: '1 day ago' },
  ];

  const handleRoleChange = async (newRole: 'USER' | 'ADMIN') => {
    setIsLoading(true);

    try {
      const updatedUser = await put(`/users/${userId}`, { role: newRole });
      setUser({ ...user, role: updatedUser.role });
      toast.success(`User role updated to ${newRole}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    setIsLoading(true);

    try {
      const updatedUser = await put(`/users/${userId}`, { status: newStatus });
      setUser({ ...user, status: updatedUser.status });
      toast.success(`User status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsLoading(true);

    try {
      await del(`/users/${userId}`);
      toast.success('User deleted successfully');
      navigate('/admin/users');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/users"
          className="inline-block mb-2 text-sm text-primary-600 hover:text-primary-700"
        >
          ← Back to Users
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
        <p className="mt-1 text-gray-600">View and manage user information</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* User Profile */}
          <Card>
            <div className="flex items-start gap-6">
              <div className="flex items-center justify-center w-20 h-20 text-2xl font-bold text-white rounded-full bg-linear-to-br from-primary-500 to-primary-700 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="mb-1 text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <p className="mb-3 text-gray-600">{user.email}</p>
                <div className="flex gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* User Stats */}
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Usage Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {user.stats.conversations}
                </div>
                <div className="text-sm text-gray-600">Conversations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {user.stats.messages}
                </div>
                <div className="text-sm text-gray-600">Messages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {(user.stats.tokensUsed / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-gray-600">AI Tokens</div>
              </div>
            </div>
          </Card>

          {/* Account Information */}
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Account Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User ID:</span>
                <span className="font-mono text-sm text-gray-900">
                  {user.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login:</span>
                <span className="text-sm text-gray-900">
                  {new Date(user.lastLogin).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Activity Log */}
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {activityLog.map((activity, index) => (
                <div
                  key={index}
                  className="flex gap-3 py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Role Management */}
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Role Management
            </h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Current Role
              </label>
              <select
                value={user.role}
                onChange={(e) =>
                  handleRoleChange(e.target.value as 'USER' | 'ADMIN')
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <p className="text-xs text-gray-500">
                Admins have full system access
              </p>
            </div>
          </Card>

          {/* Status Management */}
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Account Status
            </h3>
            <div className="space-y-3">
              <Button
                fullWidth
                variant={user.status === 'active' ? 'outline' : 'primary'}
                onClick={() =>
                  handleStatusChange(
                    user.status === 'active' ? 'inactive' : 'active'
                  )
                }
                disabled={isLoading}
              >
                {user.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
              <p className="text-xs text-gray-500">
                {user.status === 'active'
                  ? 'Deactivating will prevent user login'
                  : 'Activate to allow user login'}
              </p>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-red-600">
              Danger Zone
            </h3>
            <Button
              fullWidth
              variant="outline"
              onClick={handleDeleteUser}
              disabled={isLoading}
            >
              Delete User
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              This action cannot be undone. All user data will be permanently
              deleted.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
