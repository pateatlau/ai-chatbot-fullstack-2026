import React, { Component, ErrorInfo, ReactNode } from 'react';
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
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  private readonly DEFAULT_CONTEXT = 'ErrorBoundary';

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Store component stack
    this.setState({
      errorInfo,
    });

    // Call user's error handler
    this.props.onError?.(error, errorInfo);

    // Log to console
    const context = this.props.context || this.DEFAULT_CONTEXT;
    console.error(`[${context}] Error caught:`, {
      error,
      errorInfo,
      errorId: this.state.errorId,
      variant: this.props.variant,
      timestamp: new Date().toISOString(),
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  renderFallback() {
    const { error, errorInfo, errorId } = this.state;
    const {
      variant = 'full',
      context = this.DEFAULT_CONTEXT,
      showDetails = true,
    } = this.props;

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
          showDetails
        );
      case 'compact':
        return this.renderCompactUI(error, errorId, context);
      case 'minimal':
        return this.renderMinimalUI(error);
      default:
        return this.renderFullUI(
          error,
          errorInfo,
          errorId,
          context,
          showDetails
        );
    }
  }

  private renderFullUI(
    error: Error | null,
    errorInfo: ErrorInfo | null,
    errorId: string,
    context: string,
    showDetails: boolean
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
    context: string
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
          </div>
        </div>

        <div className={styles.errorActionsCompact}>
          <button className={styles.buttonPrimary} onClick={this.handleReload}>
            Reload
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
