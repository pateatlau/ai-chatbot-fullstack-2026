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
import { loginSchema, LoginFormData } from '../schemas/auth.schema';
import { useLogin } from '@myapp/frontend/apollo-client';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await login(data.email, data.password);

      if (result.data?.login) {
        const userData = result.data.login.user;

        // Store auth data - tokens are in HttpOnly cookies AND returned for API calls
        setAuth(userData, result.data.login.token, null);

        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

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

        addToast('Login successful!', 'success');

        // Use window.location.replace for reliable cross-MFE navigation
        window.location.replace('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please try again.';
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
              Sign in
            </h2>
            <p className={cn('mt-2 text-sm', 'text-[var(--text-secondary)]')}>
              Welcome back! Please sign in to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              required
              {...register('password')}
            />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={cn(
                    'w-4 h-4 rounded',
                    'border-[var(--border-default)]',
                    'text-[var(--interactive-primary)]',
                    'focus:ring-[var(--interactive-primaryHover)]'
                  )}
                />
                <label
                  htmlFor="remember-me"
                  className={cn('ml-2 text-sm', 'text-[var(--text-primary)]')}
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className={cn(
                    'font-medium',
                    'text-[var(--text-link)] hover:text-[var(--text-linkHover)]',
                    'transition-colors'
                  )}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="text-sm text-center">
              <span className="text-[var(--text-secondary)]">
                Don't have an account?{' '}
              </span>
              <Link
                to="/register"
                className={cn(
                  'font-medium',
                  'text-[var(--text-link)] hover:text-[var(--text-linkHover)]',
                  'transition-colors'
                )}
              >
                Sign up
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function Login() {
  return (
    <ErrorBoundary variant="full" context="page-login">
      <LoginContent />
    </ErrorBoundary>
  );
}

export default Login;
