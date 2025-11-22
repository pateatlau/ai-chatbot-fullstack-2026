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
  cn,
} from '@myapp/frontend/ui-components';
import { useAuthStore, useToastStore } from '@myapp/frontend/stores';
import { registerSchema, RegisterFormData } from '../schemas/auth.schema';
import { useRegister } from '@myapp/frontend/apollo-client';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

function RegisterContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const register = useRegister();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = data;
      const result = await register(
        registerData.email,
        registerData.password,
        registerData.name
      );

      if (result.data?.register) {
        const userData = result.data.register.user;

        // Store auth data - tokens are in HttpOnly cookies AND returned for API calls
        setAuth(userData, result.data.register.token, null);

        // Emit login event for other MFEs
        const eventBus = getEventBus();
        eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
          },
          timestamp: Date.now(),
        });

        addToast('Account created successfully!', 'success');

        // Use window.location.replace for reliable cross-MFE navigation
        // React Router navigate doesn't work reliably across federated modules
        window.location.replace('/dashboard');
      }
    } catch (err: any) {
      const errorMessage =
        err.message || 'Registration failed. Please try again.';
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
              Create account
            </h2>
            <p className={cn('mt-2 text-sm', 'text-[var(--text-secondary)]')}>
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
              {...formRegister('name')}
            />

            <FormField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              required
              {...formRegister('email')}
            />

            <FormField
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              hint="Must be at least 8 characters with uppercase, lowercase, number, and special character"
              required
              {...formRegister('password')}
            />

            <FormField
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              required
              {...formRegister('confirmPassword')}
            />

            <div>
              <label
                htmlFor="role"
                className={cn(
                  'block mb-2 text-sm font-medium',
                  'text-[var(--text-secondary)]'
                )}
              >
                Role
              </label>
              <select
                id="role"
                {...formRegister('role')}
                defaultValue="USER"
                className={cn(
                  'w-full px-3 py-2',
                  'border rounded-lg',
                  'border-[var(--border-default)]',
                  'bg-[var(--bg-primary)] text-[var(--text-primary)]',
                  'focus:outline-none focus:ring-2',
                  'focus:ring-[var(--border-focus)] focus:border-transparent',
                  'transition-all duration-200'
                )}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role?.message && (
                <p className="mt-1 text-sm text-[var(--status-error)]">
                  {errors.role.message}
                </p>
              )}
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                Select ADMIN to create an admin account
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className={cn(
                    'w-4 h-4 rounded',
                    'border-[var(--border-default)]',
                    'text-[var(--interactive-primary)]',
                    'focus:ring-[var(--interactive-primaryHover)]'
                  )}
                />
              </div>
              <div className="text-sm">
                <label htmlFor="terms" className="text-[var(--text-primary)]">
                  I agree to the{' '}
                  <a
                    href="#"
                    className={cn(
                      'font-medium',
                      'text-[var(--text-link)] hover:text-[var(--text-linkHover)]',
                      'transition-colors'
                    )}
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="#"
                    className={cn(
                      'font-medium',
                      'text-[var(--text-link)] hover:text-[var(--text-linkHover)]',
                      'transition-colors'
                    )}
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
              <span className="text-[var(--text-secondary)]">
                Already have an account?{' '}
              </span>
              <Link
                to="/login"
                className={cn(
                  'font-medium',
                  'text-[var(--text-link)] hover:text-[var(--text-linkHover)]',
                  'transition-colors'
                )}
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
