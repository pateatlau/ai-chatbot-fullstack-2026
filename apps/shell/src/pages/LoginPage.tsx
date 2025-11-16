import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { FormField } from '@myapp/frontend/ui-components';
import { useAuth, useToast } from '@ai-chatbot/hooks';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

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
      await login(data);
      toast.success('Login successful!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <div
        style={{
          padding: '20px',
          border: '1px solid #ccc',
          backgroundColor: '#fff',
        }}
      >
        <h2 style={{ margin: '0 0 10px 0' }}>Sign In</h2>
        <p style={{ margin: '0 0 20px 0' }}>
          Sign in to continue to your account
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '15px' }}>
            <FormField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <FormField
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              required
              {...register('password')}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#0066cc',
              color: '#fff',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <span>Don't have an account? </span>
            <Link to="/register">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
