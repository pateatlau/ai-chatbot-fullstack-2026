import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { FormField, Card, ErrorBoundary } from '@myapp/frontend/ui-components';
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
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                <svg
                  className="w-8 h-8 text-green-600"
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
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Check your email
              </h2>
              <p className="mb-6 text-gray-600">
                If an account exists with that email, you will receive password
                reset instructions shortly.
              </p>
              <p className="mb-4 text-sm text-gray-500">
                Didn't receive an email? Check your spam folder or try again.
              </p>
              <Link
                to="/login"
                className="inline-block px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
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
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Forgot password?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
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

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {isLoading ? 'Sending...' : 'Send reset instructions'}
            </button>

            <div className="text-sm text-center">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
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
