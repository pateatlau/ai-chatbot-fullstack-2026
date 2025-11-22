import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import {
  FormField,
  Card,
  Button,
  ErrorBoundary,
  ThemeToggle,
} from '@myapp/frontend/ui-components';
import { useToastStore } from '@myapp/frontend/stores';
import { authService } from '../services/auth.service';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
      addToast(
        'Password reset instructions sent! Check your email.',
        'success'
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to send reset email. Please try again.';
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-bg-secondary sm:px-6 lg:px-8">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-[var(--status-success)]/10 rounded-full">
                <svg
                  className="w-8 h-8 text-feedback-success"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">
                Check your email
              </h2>
              <p className="mb-6 text-text-secondary">
                If an account exists with that email, you will receive password
                reset instructions shortly.
              </p>
              <p className="mb-4 text-sm text-text-tertiary">
                Didn't receive an email? Check your spam folder or try again.
              </p>
              <Link
                to="/login"
                className="inline-block px-4 py-2 text-sm font-medium text-text-link hover:text-text-linkHover"
              >
                ← Back to login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-bg-secondary sm:px-6 lg:px-8">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Card>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-text-primary">
              Forgot password?
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Enter your email address and we'll send you instructions to reset
              your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              required
              autoFocus
              {...register('email')}
            />

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send reset instructions'}
            </Button>

            <div className="text-sm text-center">
              <Link
                to="/login"
                className="font-medium text-text-link hover:text-text-linkHover"
              >
                ← Back to login
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  return (
    <ErrorBoundary variant="full" context="page-forgot-password">
      <ForgotPasswordContent />
    </ErrorBoundary>
  );
}

export default ForgotPassword;
