import React from 'react';
import styles from './ErrorSuggestions.module.css';

export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  INTERNAL = 'INTERNAL',
  MODULE_FEDERATION = 'MODULE_FEDERATION',
  STATE = 'STATE',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorSuggestionsProps {
  error: Error;
  category: ErrorCategory;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

/**
 * ErrorSuggestions Component
 * Displays user-friendly error messages and suggested next steps
 */
export const ErrorSuggestions: React.FC<ErrorSuggestionsProps> = ({
  error,
  category,
  onRetry,
  onDismiss,
  showDetails = false,
}) => {
  const getSuggestionContent = () => {
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        return {
          icon: '🔐',
          title: 'Session Expired',
          description:
            'Your login session has expired. Please log in again to continue.',
          actions: [
            { label: 'Go to Login', primary: true, href: '/auth/login' },
            ...(onRetry ? [{ label: 'Try Again', onClick: onRetry }] : []),
          ],
        };

      case ErrorCategory.AUTHORIZATION:
        return {
          icon: '🚫',
          title: 'Access Denied',
          description: "You don't have permission to access this resource.",
          actions: [
            { label: 'Go Back', onClick: () => window.history.back() },
            { label: 'Contact Support', href: 'mailto:support@company.com' },
          ],
        };

      case ErrorCategory.NETWORK:
        return {
          icon: '🌐',
          title: 'Connection Lost',
          description: 'Please check your internet connection and try again.',
          actions: [
            ...(onRetry
              ? [{ label: 'Retry', primary: true, onClick: onRetry }]
              : []),
            { label: 'Offline Mode', href: '#' },
          ],
        };

      case ErrorCategory.VALIDATION:
        return {
          icon: '⚠️',
          title: 'Invalid Input',
          description: 'Please check the form for errors and try again.',
          actions: [
            ...(onRetry
              ? [{ label: 'Try Again', primary: true, onClick: onRetry }]
              : []),
            { label: 'Show Details', onClick: () => {} },
          ],
        };

      case ErrorCategory.MODULE_FEDERATION:
        return {
          icon: '📦',
          title: 'Feature Load Failed',
          description:
            'Failed to load this feature. Please try again in a moment.',
          actions: [
            ...(onRetry
              ? [{ label: 'Retry', primary: true, onClick: onRetry }]
              : []),
            { label: 'Refresh Page', onClick: () => window.location.reload() },
          ],
        };

      case ErrorCategory.STATE:
        return {
          icon: '⚙️',
          title: 'State Error',
          description:
            'The application encountered an internal error. Please refresh the page.',
          actions: [
            {
              label: 'Refresh Page',
              primary: true,
              onClick: () => window.location.reload(),
            },
            ...(onRetry ? [{ label: 'Try Again', onClick: onRetry }] : []),
          ],
        };

      default:
        return {
          icon: '❌',
          title: 'Oops! Something went wrong',
          description:
            error.message || 'An unexpected error occurred. Please try again.',
          actions: [
            ...(onRetry
              ? [{ label: 'Try Again', primary: true, onClick: onRetry }]
              : []),
            { label: 'Refresh Page', onClick: () => window.location.reload() },
          ],
        };
    }
  };

  const content = getSuggestionContent();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>{content.icon}</div>
        <h2 className={styles.title}>{content.title}</h2>
        <p className={styles.description}>{content.description}</p>

        {showDetails && (
          <details className={styles.details}>
            <summary>Error Details</summary>
            <pre className={styles.errorStack}>
              {error.stack || error.message}
            </pre>
          </details>
        )}

        <div className={styles.actions}>
          {content.actions.map((action, index) => (
            <button
              key={index}
              className={`${styles.actionButton} ${
                'primary' in action && action.primary ? styles.primary : ''
              }`}
              onClick={() => {
                if ('onClick' in action) {
                  action.onClick?.();
                } else if ('href' in action) {
                  window.location.href = action.href;
                }
              }}
            >
              {action.label}
            </button>
          ))}
        </div>

        {onDismiss && (
          <button className={styles.dismissButton} onClick={onDismiss}>
            ✕ Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorSuggestions;
