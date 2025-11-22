import { useState, useEffect } from 'react';
import { Card, Button, ErrorBoundary } from '@myapp/frontend/ui-components';
import { useToast } from '@myapp/frontend/hooks';
import { adminAPI, AuditLog } from '../api/admin.api';
import {
  useAdminStore,
  useAdminStoreInitialization,
} from '../store/admin.store';

function AuditLogsPageContent() {
  // Initialize admin store with event bus subscriptions
  useAdminStoreInitialization();

  // Get loading state from store
  const { isLoading: storeLoading } = useAdminStore();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<{
    action?: string;
  }>({});
  const toast = useToast();

  const limit = 20;

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAuditLogs({ page, limit, ...filters });
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('delete') || action.includes('reset')) {
      return 'bg-red-100 text-red-800';
    }
    if (action.includes('update') || action.includes('edit')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (action.includes('create') || action.includes('add')) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">
            Track all administrative actions and changes
          </p>
        </div>
        <Button onClick={loadLogs} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={filters.action || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  action: e.target.value || undefined,
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Actions</option>
              <option value="user_updated">User Updated</option>
              <option value="user_deleted">User Deleted</option>
              <option value="password_reset">Password Reset</option>
              <option value="role_changed">Role Changed</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-gray-600">
            Showing {logs.length} of {total} logs
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Target User
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-4" colSpan={5}>
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
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {log.adminEmail || 'Unknown Admin'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {log.adminId.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {log.targetUserEmail ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {log.targetUserEmail}
                          </div>
                          {log.targetUserId && (
                            <div className="text-xs text-gray-500 font-mono">
                              {log.targetUserId.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <details className="text-sm text-gray-600">
                          <summary className="cursor-pointer hover:text-gray-900">
                            View details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No details
                        </span>
                      )}
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
              disabled={page === 1 || loading}
              variant="outline"
            >
              Previous
            </Button>
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
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

export function AuditLogsPage() {
  return (
    <ErrorBoundary variant="full" context="page-audit-logs">
      <AuditLogsPageContent />
    </ErrorBoundary>
  );
}
