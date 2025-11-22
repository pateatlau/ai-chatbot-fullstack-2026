import { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * MfeErrorBoundary - Error boundary specifically for Module Federation MFE loading failures
 *
 * Catches errors during:
 * - Dynamic module import failures
 * - Module parsing/compilation errors
 * - Network failures when loading remote modules
 *
 * Provides:
 * - Friendly error messaging for MFE load failures
 * - Retry mechanism to attempt module reload
 * - Context about which MFE failed
 * - Error tracking with useErrorLogger
 */

export interface MfeErrorBoundaryProps {
  children: ReactNode;
  mfeName: string; // e.g., 'chatbot-mfe', 'auth-mfe'
  fallbackComponent?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // If true, error doesn't propagate to parent boundary
}

interface MfeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number; // Track retry attempts
  errorId: string;
}

export class MfeErrorBoundary extends Component<
  MfeErrorBoundaryProps,
  MfeErrorBoundaryState
> {
  constructor(props: MfeErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
      errorId: this.generateErrorId(),
    };
  }

  private generateErrorId(): string {
    return `mfe-error-${this.props.mfeName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<MfeErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error(
      `[MFE Error Boundary] ${this.props.mfeName} failed to load:`,
      error,
      errorInfo
    );

    // Callback for parent/monitoring systems
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Increment error count
    this.setState((prev) => ({
      errorCount: prev.errorCount + 1,
    }));

    // Log to tracking system (for Phase 5)
    // TODO: Send to error tracking backend with context:
    // {
    //   errorId: this.state.errorId,
    //   mfeName: this.props.mfeName,
    //   errorType: 'MFE_LOAD_FAILURE',
    //   message: error.message,
    //   componentStack: errorInfo.componentStack,
    //   timestamp: new Date().toISOString(),
    //   environment: import.meta.env.MODE,
    // }
  }

  handleRetry = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorId: this.generateErrorId(),
    });

    // Reload the page to force MFE module reload
    // Alternative: Could emit event to parent to retry loading specific MFE
    window.location.reload();
  };

  handleViewDetails = () => {
    // Could trigger modal or expand error details
    console.log('Error details:', {
      mfeName: this.props.mfeName,
      error: this.state.error,
      errorId: this.state.errorId,
      retryCount: this.state.errorCount,
    });
  };

  isCriticalError(): boolean {
    // Determine if this is a module loading error vs runtime error
    const errorMessage = this.state.error?.message || '';
    return (
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('Cannot find module') ||
      errorMessage.includes('Module not found')
    );
  }

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default error UI for MFE load failures
      const isCritical = this.isCriticalError();
      const isRetryable = this.state.errorCount < 3; // Allow up to 3 retries

      return (
        <div
          className={styles.errorBoundaryCompact}
          role="alert"
          aria-live="assertive"
        >
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <div className={styles.errorMessage}>
              <h3 className={styles.errorTitle}>
                {this.props.mfeName} Service Unavailable
              </h3>

              {isCritical ? (
                <p className={styles.errorDescription}>
                  Unable to load the {this.props.mfeName} module. This may be
                  due to a network issue or the service not running.
                </p>
              ) : (
                <p className={styles.errorDescription}>
                  An error occurred while loading {this.props.mfeName}. Please
                  try again.
                </p>
              )}

              {this.state.errorCount > 0 && (
                <p className={styles.errorHint}>
                  Retry attempt {this.state.errorCount} of 3
                </p>
              )}
            </div>
          </div>

          <div className={styles.errorActions}>
            {isRetryable && (
              <button
                onClick={this.handleRetry}
                className={styles.actionButtonPrimary}
                aria-label={`Retry loading ${this.props.mfeName}`}
              >
                {this.state.errorCount === 0 ? 'Retry' : 'Try Again'}
              </button>
            )}

            {this.state.errorCount >= 3 && (
              <p className={styles.errorWarn}>
                Maximum retry attempts reached. Please refresh the page or
                contact support.
              </p>
            )}

            <button
              onClick={this.handleViewDetails}
              className={styles.actionButtonSecondary}
              aria-label="View error details"
            >
              Details
            </button>
          </div>

          {/* Error ID for tracking */}
          <div className={styles.errorMeta}>
            <code>{this.state.errorId}</code>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MfeErrorBoundary;
