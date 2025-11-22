import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import {
  FormField,
  Card,
  Button,
  ErrorBoundary,
  ThemeToggle,
} from '@myapp/frontend/ui-components';
import { useAuthStore, useToastStore } from '@myapp/frontend/stores';
import { registerSchema, RegisterFormData } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';

function RegisterContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authService.register(registerData);

      // Store auth data - tokens are in HttpOnly cookies AND returned for API calls
      setAuth(response.user, response.accessToken, null);

      addToast('Account created successfully!', 'success');

      // Use window.location.replace for reliable cross-MFE navigation
      // React Router navigate doesn't work reliably across federated modules
      window.location.replace('/dashboard');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Registration failed. Please try again.';
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-bg-secondary sm:px-6 lg:px-8">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Card>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-text-primary">
              Create account
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Sign up to get started with your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              label="Full name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <FormField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <FormField
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              hint="Must be at least 8 characters with uppercase, lowercase, number, and special character"
              required
              {...register('password')}
            />

            <FormField
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            <div>
              <label
                htmlFor="role"
                className="block mb-2 text-sm font-medium text-text-secondary"
              >
                Role
              </label>
              <select
                id="role"
                {...register('role')}
                defaultValue="USER"
                className="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent dark:border-border-hover dark:bg-bg-secondary"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role?.message && (
                <p className="mt-1 text-sm text-feedback-error">
                  {errors.role.message}
                </p>
              )}
              <p className="mt-1 text-xs text-text-tertiary">
                Select ADMIN to create an admin account
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 border-border-default rounded text-interactive-primary focus:ring-interactive-primaryHover dark:border-border-hover"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-text-primary">
                  I agree to the{' '}
                  <a
                    href="#"
                    className="font-medium text-text-link hover:text-text-linkHover"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="#"
                    className="font-medium text-text-link hover:text-text-linkHover"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="text-sm text-center">
              <span className="text-text-secondary">
                Already have an account?{' '}
              </span>
              <Link
                to="/login"
                className="font-medium text-text-link hover:text-text-linkHover"
              >
                Sign in
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function Register() {
  return (
    <ErrorBoundary variant="full" context="page-register">
      <RegisterContent />
    </ErrorBoundary>
  );
}

export default Register;
