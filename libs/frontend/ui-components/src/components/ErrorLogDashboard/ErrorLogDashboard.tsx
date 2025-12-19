import React, { useState, useEffect } from 'react';
import styles from './ErrorLogDashboard.module.css';

interface ErrorLogEntry {
  id: string;
  errorId: string;
  message: string;
  app: string;
  page?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';
  timestamp: string;
  userId?: string;
}

interface ErrorStats {
  totalErrors: number;
  errorsByApp: Array<{ app: string; count: number }>;
  errorsBySeverity: Array<{ severity: string; count: number }>;
  criticalErrors: number;
  resolvedErrors: number;
  unresolvedErrors: number;
}

/**
 * Error Log Dashboard - Admin component for monitoring application errors
 * Displays error statistics, recent errors, and filtering/management capabilities
 */
export const ErrorLogDashboard: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLogEntry[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<
    string | undefined
  >();
  const [selectedApp, setSelectedApp] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');

  /**
   * Fetch errors and statistics from GraphQL backend
   */
  const fetchErrorData = React.useCallback(async () => {
    setLoading(true);
    try {
      const query = `
        query GetErrorDashboard(
          $limit: Int!
          $offset: Int!
          $severity: ErrorSeverity
          $app: String
          $status: ErrorStatus
        ) {
          errorLogs(
            limit: $limit
            offset: $offset
            severity: $severity
            app: $app
            status: $status
          ) {
            id
            errorId
            message
            app
            page
            severity
            status
            timestamp
            userId
          }
          errorStats {
            totalErrors
            errorsByApp {
              app
              count
            }
            errorsBySeverity {
              severity
              count
            }
            criticalErrors
            resolvedErrors
            unresolvedErrors
          }
        }
      `;

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            limit: 50,
            offset: 0,
            severity: selectedSeverity,
            app: selectedApp,
            status: selectedStatus,
          },
        }),
      });

      const result = await response.json();

      if (result.data) {
        setErrors(result.data.errorLogs);
        setStats(result.data.errorStats);
      }
    } catch (error) {
      console.error('Failed to fetch error data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSeverity, selectedApp, selectedStatus]);

  useEffect(() => {
    fetchErrorData();
    const interval = setInterval(fetchErrorData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchErrorData]);

  /**
   * Update error status
   */
  const updateErrorStatus = async (errorId: string, status: string) => {
    try {
      const query = `
        mutation UpdateErrorStatus($id: ID!, $status: ErrorStatus!) {
          updateErrorLogStatus(id: $id, status: $status) {
            id
            status
          }
        }
      `;

      await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { id: errorId, status },
        }),
      });

      await fetchErrorData();
    } catch (error) {
      console.error('Failed to update error status:', error);
    }
  };

  /**
   * Get severity badge color
   */
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'CRITICAL':
        return '#dc2626';
      case 'HIGH':
        return '#ea580c';
      case 'MEDIUM':
        return '#ca8a04';
      case 'LOW':
        return '#16a34a';
      default:
        return '#6b7280';
    }
  };

  /**
   * Get status badge text
   */
  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'NEW':
        return '🆕 New';
      case 'ACKNOWLEDGED':
        return '👁️ Acknowledged';
      case 'INVESTIGATING':
        return '🔍 Investigating';
      case 'RESOLVED':
        return '✅ Resolved';
      default:
        return status;
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Error Log Dashboard</h1>
        <button
          onClick={fetchErrorData}
          disabled={loading}
          className={styles.refreshBtn}
        >
          {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalErrors}</div>
            <div className={styles.statLabel}>Total Errors</div>
          </div>
          <div
            className={styles.statCard}
            style={{ borderTopColor: '#dc2626' }}
          >
            <div className={styles.statValue}>{stats.criticalErrors}</div>
            <div className={styles.statLabel}>Critical</div>
          </div>
          <div
            className={styles.statCard}
            style={{ borderTopColor: '#16a34a' }}
          >
            <div className={styles.statValue}>{stats.resolvedErrors}</div>
            <div className={styles.statLabel}>Resolved</div>
          </div>
          <div
            className={styles.statCard}
            style={{ borderTopColor: '#ea580c' }}
          >
            <div className={styles.statValue}>{stats.unresolvedErrors}</div>
            <div className={styles.statLabel}>Unresolved</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={selectedSeverity || ''}
          onChange={(e) => setSelectedSeverity(e.target.value || undefined)}
          className={styles.filterSelect}
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">🔴 Critical</option>
          <option value="HIGH">🟠 High</option>
          <option value="MEDIUM">🟡 Medium</option>
          <option value="LOW">🟢 Low</option>
        </select>

        <select
          value={selectedApp || ''}
          onChange={(e) => setSelectedApp(e.target.value || undefined)}
          className={styles.filterSelect}
        >
          <option value="">All Apps</option>
          <option value="shell">Shell</option>
          <option value="auth-mfe">Auth MFE</option>
          <option value="profile-mfe">Profile MFE</option>
          <option value="admin-mfe">Admin MFE</option>
          <option value="chatbot-mfe">Chatbot MFE</option>
        </select>

        <select
          value={selectedStatus || ''}
          onChange={(e) => setSelectedStatus(e.target.value || undefined)}
          className={styles.filterSelect}
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className={styles.filterSelect}
        >
          <option value="timestamp">Sort by Time</option>
          <option value="severity">Sort by Severity</option>
        </select>
      </div>

      {/* Error List */}
      <div className={styles.errorList}>
        {loading ? (
          <div className={styles.loading}>Loading errors...</div>
        ) : errors.length === 0 ? (
          <div className={styles.empty}>No errors found</div>
        ) : (
          errors.map((error) => (
            <div key={error.id} className={styles.errorItem}>
              <div className={styles.errorHeader}>
                <div
                  className={styles.severityDot}
                  style={{ backgroundColor: getSeverityColor(error.severity) }}
                  title={error.severity}
                />
                <div className={styles.errorInfo}>
                  <div className={styles.errorMessage}>{error.message}</div>
                  <div className={styles.errorMeta}>
                    {error.app && (
                      <span className={styles.badge}>{error.app}</span>
                    )}
                    {error.page && (
                      <span className={styles.badge}>{error.page}</span>
                    )}
                    <span className={styles.timestamp}>
                      {new Date(error.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.errorFooter}>
                <span className={styles.statusBadge}>
                  {getStatusBadge(error.status)}
                </span>
                <div className={styles.actions}>
                  {error.status !== 'RESOLVED' && (
                    <>
                      {error.status !== 'ACKNOWLEDGED' && (
                        <button
                          onClick={() =>
                            updateErrorStatus(error.id, 'ACKNOWLEDGED')
                          }
                          className={styles.actionBtn}
                          title="Mark as acknowledged"
                        >
                          Acknowledge
                        </button>
                      )}
                      {error.status !== 'INVESTIGATING' && (
                        <button
                          onClick={() =>
                            updateErrorStatus(error.id, 'INVESTIGATING')
                          }
                          className={styles.actionBtn}
                          title="Mark as investigating"
                        >
                          Investigate
                        </button>
                      )}
                      <button
                        onClick={() => updateErrorStatus(error.id, 'RESOLVED')}
                        className={`${styles.actionBtn} ${styles.resolveBtn}`}
                        title="Mark as resolved"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ErrorLogDashboard;
