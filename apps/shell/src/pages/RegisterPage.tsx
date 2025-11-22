import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { FormField } from '@myapp/frontend/ui-components';
import { useAuth, useToast } from '@ai-chatbot/hooks';
import { z } from 'zod';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
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
    role: z.enum(['USER', 'ADMIN'], {
      message: 'Please select a valid role',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const toast = useToast();

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
      await registerUser(registerData);
      toast.success('Account created successfully!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      const errorMessage =
        err.message || 'Registration failed. Please try again.';
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
        <h2 style={{ margin: '0 0 10px 0' }}>Create Account</h2>
        <p style={{ margin: '0 0 20px 0' }}>
          Join us and start your journey today
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '15px' }}>
            <FormField
              label="Full name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              required
              {...register('name')}
            />
          </div>

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
              hint="Must be at least 8 characters with uppercase, lowercase, number, and special character"
              required
              {...register('password')}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <FormField
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Role <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              {...register('role')}
              defaultValue=""
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
              }}
            >
              <option value="">Select a role</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            {errors.role && (
              <p style={{ marginTop: '5px', color: 'red', fontSize: '14px' }}>
                {errors.role.message}
              </p>
            )}
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
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>

          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <span>Already have an account? </span>
            <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
