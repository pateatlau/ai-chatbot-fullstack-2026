import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { FormField, Card } from '@myapp/frontend/ui-components';
import { useAuthStore, useToastStore } from '@myapp/frontend/stores';
import { registerSchema, RegisterFormData } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';

export function Register() {
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
      // Tokens are now in HttpOnly cookies, not in the response
      setAuth(response.user);

      // NOTE: setAuth() already emits USER_LOGGED_IN event via auth.store.ts
      // No need to emit duplicate event here

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
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
            <p className="mt-2 text-sm text-gray-600">
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Role
              </label>
              <select
                id="role"
                {...register('role')}
                defaultValue="USER"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
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
                  className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{' '}
                  <a
                    href="#"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="#"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

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
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="text-sm text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
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

export default Register;
