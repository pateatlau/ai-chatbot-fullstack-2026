import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  FormField,
  Card,
  Button,
  ErrorBoundary,
  ThemeToggle,
  cn,
} from '@myapp/frontend/ui-components';
import { useToastStore } from '@myapp/frontend/stores';
import { authService } from '../services/auth.service';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      addToast('Invalid reset token', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, data.password);
      addToast(
        'Password reset successfully! Please login with your new password.',
        'success'
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to reset password. The link may be expired or invalid.';
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        className={cn(
          'flex items-center justify-center min-h-screen',
          'px-4 py-12 sm:px-6 lg:px-8',
          'bg-[var(--bg-secondary)]',
          'transition-colors duration-200'
        )}
      >
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center">
              <div
                className={cn(
                  'flex items-center justify-center',
                  'w-16 h-16 mx-auto mb-4 rounded-full',
                  'bg-[var(--status-error)]/10'
                )}
              >
                <svg
                  className={cn('w-8 h-8', 'text-[var(--status-error)]')}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2
                className={cn(
                  'mb-2 text-2xl font-bold',
                  'text-[var(--text-primary)]'
                )}
              >
                Invalid Reset Link
              </h2>
              <p className={cn('mb-6', 'text-[var(--text-secondary)]')}>
                This password reset link is invalid or has expired.
              </p>
              <Link to="/forgot-password">
                <Button>Request new reset link</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center min-h-screen',
        'px-4 py-12 sm:px-6 lg:px-8',
        'bg-[var(--bg-secondary)]',
        'transition-colors duration-200'
      )}
    >
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Card>
          <div className="mb-8 text-center">
            <h2
              className={cn('text-3xl font-bold', 'text-[var(--text-primary)]')}
            >
              Reset your password
            </h2>
            <p className={cn('mt-2 text-sm', 'text-[var(--text-secondary)]')}>
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              label="New password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              hint="Must be at least 8 characters with uppercase, lowercase, number, and special character"
              required
              autoFocus
              {...register('password')}
            />

            <FormField
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Resetting password...' : 'Reset password'}
            </Button>

            <div className="text-sm text-center">
              <Link
                to="/login"
                className={cn(
                  'font-medium',
                  'text-[var(--text-link)] hover:text-[var(--text-linkHover)]',
                  'transition-colors'
                )}
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

export function ResetPassword() {
  return (
    <ErrorBoundary variant="full" context="page-reset-password">
      <ResetPasswordContent />
    </ErrorBoundary>
  );
}

export default ResetPassword;
