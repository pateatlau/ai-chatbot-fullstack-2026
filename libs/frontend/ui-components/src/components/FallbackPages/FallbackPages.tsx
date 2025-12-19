import React from 'react';
import styles from './FallbackPages.module.css';

/**
 * Offline Fallback Page
 */
export const OfflineFallback: React.FC<{ onRetry?: () => void }> = ({
  onRetry,
}) => (
  <div className={styles.fallbackContainer}>
    <div className={styles.fallbackContent}>
      <div className={styles.icon}>📡</div>
      <h1>You're Offline</h1>
      <p>It looks like you've lost your internet connection.</p>
      <div className={styles.actions}>
        {onRetry && (
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={onRetry}
          >
            Check Connection
          </button>
        )}
        <button
          className={styles.button}
          onClick={() => {
            // Load cached content
            console.log('Loading cached content');
          }}
        >
          Load Cached Data
        </button>
      </div>
    </div>
  </div>
);

/**
 * Loading Fallback Page
 */
export const LoadingFallback: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => (
  <div className={styles.fallbackContainer}>
    <div className={styles.fallbackContent}>
      <div className={styles.spinner}></div>
      <p>{message}</p>
    </div>
  </div>
);

/**
 * Feature Not Available Fallback
 */
export const NotAvailableFallback: React.FC<{ feature?: string }> = ({
  feature = 'Feature',
}) => (
  <div className={styles.fallbackContainer}>
    <div className={styles.fallbackContent}>
      <div className={styles.icon}>🚧</div>
      <h1>{feature} Not Available</h1>
      <p>This feature is temporarily unavailable. Please try again later.</p>
      <button
        className={`${styles.button} ${styles.primary}`}
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
    </div>
  </div>
);

/**
 * Access Denied Fallback
 */
export const AccessDeniedFallback: React.FC = () => (
  <div className={styles.fallbackContainer}>
    <div className={styles.fallbackContent}>
      <div className={styles.icon}>🔒</div>
      <h1>Access Denied</h1>
      <p>You don't have permission to access this resource.</p>
      <button
        className={`${styles.button} ${styles.primary}`}
        onClick={() => (window.location.href = '/')}
      >
        Go to Home
      </button>
    </div>
  </div>
);

/**
 * Error Occurred Fallback
 */
export const ErrorOccurredFallback: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'An error occurred', onRetry }) => (
  <div className={styles.fallbackContainer}>
    <div className={styles.fallbackContent}>
      <div className={styles.icon}>⚠️</div>
      <h1>Something Went Wrong</h1>
      <p>{message}</p>
      <div className={styles.actions}>
        {onRetry && (
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
        <button
          className={styles.button}
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    </div>
  </div>
);

/**
 * Session Expired Fallback
 */
export const SessionExpiredFallback: React.FC = () => (
  <div className={styles.fallbackContainer}>
    <div className={styles.fallbackContent}>
      <div className={styles.icon}>⏰</div>
      <h1>Session Expired</h1>
      <p>Your session has expired. Please log in again.</p>
      <button
        className={`${styles.button} ${styles.primary}`}
        onClick={() => (window.location.href = '/auth/login')}
      >
        Log In
      </button>
    </div>
  </div>
);

/**
 * Network Error Fallback
 */
export const NetworkErrorFallback: React.FC<{ onRetry?: () => void }> = ({
  onRetry,
}) => (
  <div className={styles.fallbackContainer}>
    <div className={styles.fallbackContent}>
      <div className={styles.icon}>🌐</div>
      <h1>Network Error</h1>
      <p>Unable to connect to the server. Please check your connection.</p>
      <div className={styles.actions}>
        {onRetry && (
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
        <button
          className={styles.button}
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    </div>
  </div>
);

export default {
  OfflineFallback,
  LoadingFallback,
  NotAvailableFallback,
  AccessDeniedFallback,
  ErrorOccurredFallback,
  SessionExpiredFallback,
  NetworkErrorFallback,
};
