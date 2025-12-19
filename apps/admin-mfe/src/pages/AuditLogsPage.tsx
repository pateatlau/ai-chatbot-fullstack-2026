import { useState, useEffect } from 'react';
import { Card, Button, ErrorBoundary } from '@myapp/frontend/ui-components';
import { useToast, useRequireRole } from '@myapp/frontend/hooks';
import { useAuditLogs } from '@myapp/frontend/apollo-client';
import { AuditLog } from '../api/admin.api';
import {
  useAdminStore,
  useAdminStoreInitialization,
} from '../store/admin.store';

function AuditLogsPageContent() {
  // Ensure only ADMIN users can access this page
  useRequireRole('ADMIN');

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

  // Use GraphQL query for audit logs
  const {
    data: logsData,
    loading: logsLoading,
    error: logsError,
    refetch,
  } = useAuditLogs(page, limit);

  // Update local state when GraphQL data changes
  useEffect(() => {
    if (logsData?.auditLogs) {
      setLogs(logsData.auditLogs);
      setTotal(logsData.auditLogs.length || 0);
    }
  }, [logsData]);

  // Handle loading and error states
  useEffect(() => {
    setLoading(logsLoading);
    if (logsError) {
      toast.error('Failed to load audit logs');
    }
  }, [logsLoading, logsError]);

  const loadLogs = async () => {
    refetch();
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
      return 'bg-[var(--status-error)]/10 text-[var(--status-error)]';
    }
    if (action.includes('update') || action.includes('edit')) {
      return 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]';
    }
    if (action.includes('create') || action.includes('add')) {
      return 'bg-[var(--status-success)]/10 text-[var(--status-success)]';
    }
    return 'bg-[var(--status-info)]/10 text-[var(--status-info)]';
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
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Audit Logs
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
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
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
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
              className="px-3 py-2 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            >
              <option value="">All Actions</option>
              <option value="user_updated">User Updated</option>
              <option value="user_deleted">User Deleted</option>
              <option value="password_reset">Password Reset</option>
              <option value="role_changed">Role Changed</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-[var(--text-secondary)]">
            Showing {logs.length} of {total} logs
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Target User
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--border-subtle)]"
                    >
                      <td className="px-4 py-4" colSpan={5}>
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
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-[var(--text-secondary)]"
                  >
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]"
                  >
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-[var(--text-primary)]">
                        {log.adminEmail || 'Unknown Admin'}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] font-mono">
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
                          <div className="text-sm text-[var(--text-primary)]">
                            {log.targetUserEmail}
                          </div>
                          {log.targetUserId && (
                            <div className="text-xs text-[var(--text-tertiary)] font-mono">
                              {log.targetUserId.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--text-tertiary)]">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <details className="text-sm text-[var(--text-secondary)]">
                          <summary className="cursor-pointer hover:text-[var(--text-primary)]">
                            View details
                          </summary>
                          <pre className="mt-2 text-xs bg-[var(--bg-secondary)] p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-sm text-[var(--text-tertiary)]">
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-default)]">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              variant="outline"
            >
              Previous
            </Button>
            <div className="text-sm text-[var(--text-secondary)]">
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
