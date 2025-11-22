import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Content rendered successfully</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      expect(
        screen.getByText('Content rendered successfully')
      ).toBeInTheDocument();
    });

    it('should pass through children unchanged', () => {
      const { container } = render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );
      expect(container.textContent).toContain('Test content');
    });
  });

  describe('Error Catching', () => {
    it('should catch render errors', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument();
    });

    it('should display error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should display error UI with full variant by default', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/Reload Application/i)).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should use custom context in error UI', () => {
      render(
        <ErrorBoundary context="test-context">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText(/Error in test-context/i)).toBeInTheDocument();
    });

    it('should call onError callback when error is caught', () => {
      const onErrorMock = jest.fn();
      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(onErrorMock).toHaveBeenCalled();
      const [error] = onErrorMock.mock.calls[0];
      expect(error.message).toBe('Test error message');
    });

    it('should use compact variant when specified', () => {
      render(
        <ErrorBoundary variant="compact">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText(/Error in ErrorBoundary/i)).toBeInTheDocument();
      expect(screen.getByText(/Reload/i)).toBeInTheDocument();
    });

    it('should use minimal variant when specified', () => {
      render(
        <ErrorBoundary variant="minimal">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback component', () => {
      const CustomFallback = <div>Custom error UI</div>;
      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    });

    it('should render custom fallback function with error', () => {
      const CustomFallback = (error: Error) => (
        <div>Error: {error.message}</div>
      );
      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
    });
  });

  describe('Error Details', () => {
    it('should show expandable details in full variant', () => {
      render(
        <ErrorBoundary variant="full">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText(/Error Details/i)).toBeInTheDocument();
    });

    it('should hide details when showDetails is false', () => {
      render(
        <ErrorBoundary variant="full" showDetails={false}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.queryByText(/Error Details/i)).not.toBeInTheDocument();
    });

    it('should include error ID in error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText(/error_/)).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset error state when Try Again is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument();

      // Reset
      const tryAgainButton = screen.getByText(/Try Again/i);
      expect(tryAgainButton).toBeInTheDocument();
    });
  });
});
