import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['USER', 'ADMIN', 'MODERATOR']),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain number')
      .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
