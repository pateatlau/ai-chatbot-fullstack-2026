import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorCategory, RecoveryAction } from '@myapp/frontend/hooks';
import styles from './ErrorBoundary.module.css';

export type ErrorBoundaryVariant = 'full' | 'compact' | 'minimal';

export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;

  /** Visual variant */
  variant?: ErrorBoundaryVariant;

  /** Custom fallback component or function */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);

  /** Error logging callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /** If true, error doesn't propagate to parent boundaries */
  isolate?: boolean;

  /** Context for better error identification */
  context?: string;

  /** Show detailed error info (stack trace, component stack) */
  showDetails?: boolean;

  /** Enable automatic error recovery */
  enableRecovery?: boolean;

  /** Recovery handler function */
  onRecovery?: (action: RecoveryAction) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  errorCategory: ErrorCategory | null;
  recoveryActions: Array<{ label: string; description: string }>;
  isRecovering: boolean;
  recoveryAttempts: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  private readonly DEFAULT_CONTEXT = 'ErrorBoundary';
  private recoveryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      errorCategory: null,
      recoveryActions: [],
      isRecovering: false,
      recoveryAttempts: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  private categorizeErrorAndGenerateRecovery(error: Error): {
    category: ErrorCategory;
    actions: Array<{ label: string; description: string }>;
  } {
    const errorMessage = error.message.toLowerCase();
    let category: ErrorCategory = ErrorCategory.UNKNOWN;
    const actions: Array<{ label: string; description: string }> = [];

    // Categorize error based on message patterns
    if (
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('401') ||
      errorMessage.includes('not authenticated')
    ) {
      category = ErrorCategory.AUTHENTICATION;
      actions.push({
        label: 'Refresh Session',
        description: 'Attempt to refresh your authentication session',
      });
      actions.push({
        label: 'Go to Login',
        description: 'Return to login page',
      });
    } else if (
      errorMessage.includes('forbidden') ||
      errorMessage.includes('403') ||
      errorMessage.includes('permission denied')
    ) {
      category = ErrorCategory.AUTHORIZATION;
      actions.push({
        label: 'Go to Home',
        description: 'Return to home page',
      });
    } else if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('503') ||
      errorMessage.includes('connection')
    ) {
      category = ErrorCategory.NETWORK;
      actions.push({
        label: 'Retry Request',
        description: 'Try the request again',
      });
      actions.push({
        label: 'Use Cached Data',
        description: 'Use previously cached data if available',
      });
    } else if (
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid')
    ) {
      category = ErrorCategory.VALIDATION;
      actions.push({
        label: 'Reset Form',
        description: 'Clear and reset the form',
      });
    } else if (
      errorMessage.includes('module') ||
      errorMessage.includes('loading') ||
      errorMessage.includes('chunk')
    ) {
      category = ErrorCategory.MODULE_FEDERATION;
      actions.push({
        label: 'Reload Module',
        description: 'Attempt to reload the module',
      });
      actions.push({
        label: 'Use Fallback UI',
        description: 'Display fallback interface',
      });
    } else if (
      errorMessage.includes('state') ||
      errorMessage.includes('redux')
    ) {
      category = ErrorCategory.STATE;
      actions.push({
        label: 'Restore State',
        description: 'Restore application state from backup',
      });
      actions.push({
        label: 'Reset State',
        description: 'Reset state to initial values',
      });
    } else {
      category = ErrorCategory.INTERNAL;
      actions.push({
        label: 'Try Again',
        description: 'Attempt to recover from the error',
      });
    }

    return { category, actions };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { category, actions } =
      this.categorizeErrorAndGenerateRecovery(error);

    // Store component stack and recovery info
    this.setState({
      errorInfo,
      errorCategory: category,
      recoveryActions: actions,
    });

    // Call user's error handler
    this.props.onError?.(error, errorInfo);

    // Log to console
    const context = this.props.context || this.DEFAULT_CONTEXT;
    console.error(`[${context}] Error caught:`, {
      error,
      errorInfo,
      errorId: this.state.errorId,
      category,
      availableRecoveryActions: actions,
      variant: this.props.variant,
      timestamp: new Date().toISOString(),
    });

    // Attempt automatic recovery if enabled
    if (this.props.enableRecovery) {
      this.attemptAutoRecovery(error, category);
    }
  }

  private attemptAutoRecovery(error: Error, category: ErrorCategory) {
    const maxAttempts = 3;

    if (this.state.recoveryAttempts >= maxAttempts) {
      console.warn('[ErrorBoundary] Max recovery attempts reached');
      return;
    }

    this.setState({
      isRecovering: true,
      recoveryAttempts: this.state.recoveryAttempts + 1,
    });

    // Auto-recovery strategy based on error category
    this.recoveryTimeoutId = setTimeout(() => {
      // For basic error boundary, we'll just reset and let the parent handle recovery
      // The parent component can implement more sophisticated recovery via onRecovery prop
      this.handleReset();
      this.setState({ isRecovering: false });
    }, 1000); // Wait 1 second before attempting recovery
  }

  handleReset = () => {
    // Clear any pending recovery timeout
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
      this.recoveryTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCategory: null,
      recoveryActions: [],
      isRecovering: false,
      recoveryAttempts: 0,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  componentWillUnmount() {
    // Clean up any pending recovery timeout
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
      this.recoveryTimeoutId = null;
    }
  }

  renderFallback() {
    const { error, errorInfo, errorId, isRecovering, recoveryActions } =
      this.state;
    const {
      variant = 'full',
      context = this.DEFAULT_CONTEXT,
      showDetails = true,
    } = this.props;

    // Show recovery UI while recovering
    if (isRecovering) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorHeader}>
            <span className={styles.errorIcon}>🔄</span>
            <h1 className={styles.errorTitle}>Recovering...</h1>
          </div>
          <p className={styles.errorMessage}>
            Attempting automatic recovery. Please stand by.
          </p>
        </div>
      );
    }

    if (this.props.fallback) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(error!, this.handleReset);
      }
      return this.props.fallback;
    }

    switch (variant) {
      case 'full':
        return this.renderFullUI(
          error,
          errorInfo,
          errorId,
          context,
          showDetails,
          recoveryActions
        );
      case 'compact':
        return this.renderCompactUI(error, errorId, context, recoveryActions);
      case 'minimal':
        return this.renderMinimalUI(error);
      default:
        return this.renderFullUI(
          error,
          errorInfo,
          errorId,
          context,
          showDetails,
          recoveryActions
        );
    }
  }

  private renderFullUI(
    error: Error | null,
    errorInfo: ErrorInfo | null,
    errorId: string,
    context: string,
    showDetails: boolean,
    recoveryActions?: Array<{ label: string; description: string }>
  ) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorHeader}>
          <span className={styles.errorIcon}>⚠️</span>
          <h1 className={styles.errorTitle}>Something Went Wrong</h1>
        </div>

        <div className={styles.errorContent}>
          <p className={styles.errorMessage}>
            {error?.message || 'Unknown error'}
          </p>

          {recoveryActions && recoveryActions.length > 0 && (
            <div className={styles.recoveryActions}>
              <h3 className={styles.recoveryTitle}>Suggested Actions</h3>
              <ul className={styles.recoveryList}>
                {recoveryActions.map((action, idx) => (
                  <li key={idx} className={styles.recoveryItem}>
                    <strong>{action.label}:</strong> {action.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showDetails && (
            <details className={styles.errorDetails}>
              <summary className={styles.detailsSummary}>Error Details</summary>

              <div className={styles.detailsBody}>
                <div className={styles.detailSection}>
                  <h3 className={styles.detailTitle}>Error ID</h3>
                  <code className={styles.detailCode}>{errorId}</code>
                </div>

                <div className={styles.detailSection}>
                  <h3 className={styles.detailTitle}>Context</h3>
                  <code className={styles.detailCode}>{context}</code>
                </div>

                {error && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailTitle}>Error Message</h3>
                    <code className={styles.detailCode}>
                      {error.toString()}
                    </code>
                  </div>
                )}

                {error?.stack && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailTitle}>Stack Trace</h3>
                    <pre className={styles.detailStack}>{error.stack}</pre>
                  </div>
                )}

                {errorInfo?.componentStack && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailTitle}>Component Stack</h3>
                    <pre className={styles.detailStack}>
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        <div className={styles.errorActions}>
          <button className={styles.buttonPrimary} onClick={this.handleReload}>
            Reload Application
          </button>
          <button className={styles.buttonSecondary} onClick={this.handleReset}>
            Try Again
          </button>
        </div>

        <p className={styles.errorHint}>
          If this problem persists, please contact support with Error ID:{' '}
          <code>{errorId}</code>
        </p>
      </div>
    );
  }

  private renderCompactUI(
    error: Error | null,
    errorId: string,
    context: string,
    recoveryActions?: Array<{ label: string; description: string }>
  ) {
    return (
      <div className={styles.errorContainerCompact}>
        <div className={styles.errorHeader}>
          <span className={styles.errorIcon}>⚠️</span>
          <div>
            <h2 className={styles.errorTitleCompact}>Error in {context}</h2>
            <p className={styles.errorMessageCompact}>
              {error?.message || 'An error occurred'}
            </p>
            {recoveryActions &&
              recoveryActions.length > 0 &&
              recoveryActions[0] && (
                <p className={styles.recoveryHint}>
                  Try: {recoveryActions[0].label}
                </p>
              )}
          </div>
        </div>

        <div className={styles.errorActionsCompact}>
          <button className={styles.buttonPrimary} onClick={this.handleReload}>
            Reload
          </button>
          <button className={styles.buttonSecondary} onClick={this.handleReset}>
            Try Again
          </button>
        </div>

        <p className={styles.errorHintSmall}>Error ID: {errorId}</p>
      </div>
    );
  }

  private renderMinimalUI(error: Error | null) {
    return (
      <div className={styles.errorContainerMinimal}>
        <p className={styles.errorMessageMinimal}>
          {error?.message || 'An error occurred'}
        </p>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
