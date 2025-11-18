# Quick Start: Implementing HttpOnly Cookies (Step-by-Step)

**Time to Complete:** 2-3 hours  
**Difficulty:** Medium  
**Priority:** HIGH - Security Fix

---

## 🚀 QUICK IMPLEMENTATION (Copy-Paste Ready)

### STEP 1: Backend - Auth Service (30 min)

**File: `apps/auth-service/src/main.ts`**

```typescript
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// ✅ CORS with credentials
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      process.env.PRODUCTION_DOMAIN || 'http://localhost:5173',
    ],
    credentials: true, // ✅ CRITICAL
  })
);

// ✅ Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-secret'));
app.use(express.json());

// ... rest of your setup
```

**File: `apps/auth-service/src/controllers/auth.controller.ts`**

Replace the login method:

```typescript
async login(req: Request, res: Response) {
  try {
    const validatedData = LoginSchema.parse(req.body);
    const result = await authService.login(validatedData);

    // ✅ Set HttpOnly cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    // ✅ Return without tokens
    res.status(200).json({
      user: result.user,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid email or password' || error.message === 'Account is deactivated') {
        return res.status(401).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

async logout(req: Request, res: Response) {
  try {
    // ✅ Get from cookies, not body
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: 'No token found' });
    }

    const accessToken = req.headers.authorization?.substring(7);
    if (accessToken) {
      await authService.blacklistAccessToken(accessToken);
    }

    await authService.logout(refreshToken);

    // ✅ Clear cookies
    res.clearCookie('accessToken', { path: '/', domain: process.env.COOKIE_DOMAIN });
    res.clearCookie('refreshToken', { path: '/', domain: process.env.COOKIE_DOMAIN });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

async refreshToken(req: Request, res: Response) {
  try {
    // ✅ Get from cookies, not body
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const result = await authService.refreshToken(refreshToken);

    // ✅ Set new HttpOnly cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    res.status(200).json({
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid refresh token') {
        return res.status(401).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

### STEP 2: Frontend - Auth Store (15 min)

**File: `libs/frontend/stores/src/lib/auth.store.ts`**

Replace entire file:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      checkAuth: () => {
        // Check if still authenticated by verifying with backend
        // This validates the HttpOnly cookie is still valid
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // ❌ NOT persisting tokens (they're in HttpOnly cookies)
      }),
    }
  )
);
```

---

### STEP 3: Frontend - Auth Service (30 min)

**File: `apps/auth-mfe/src/services/auth.service.ts`**

Replace entire file:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/api';

export class AuthService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // ✅ CRITICAL: Send/receive cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ✅ Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // POST to refresh - cookies exchanged automatically
            // Backend sets new accessToken cookie
            const response = await this.client.post('/auth/refresh');

            // Retry original request with new token in cookie
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - redirect to login
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string, rememberMe = false) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
      rememberMe,
    });
    return response.data; // { user, expiresIn }
  }

  async register(data: { email: string; password: string; name: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
  }

  async refreshAccessToken() {
    const response = await this.client.post('/auth/refresh');
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.client.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  }
}

export const authService = new AuthService();
```

---

### STEP 4: Frontend - Login Component (15 min)

**File: `apps/auth-mfe/src/pages/Login.tsx`**

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { FormField, Card } from '@myapp/frontend/ui-components';
import { useAuthStore, useToastStore } from '@myapp/frontend/stores';
import { loginSchema, LoginFormData } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();

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
      // ✅ Login - cookies set automatically by backend
      const response = await authService.login(data.email, data.password, rememberMe);

      // ✅ Store user (not tokens)
      setAuth(response.user);

      addToast('Login successful!', 'success');

      // Navigate to dashboard
      window.location.replace('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
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
            <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
            <p className="mt-2 text-sm text-gray-600">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot password?
                </Link>
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
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-sm text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
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

export default Login;
```

---

### STEP 5: Update Other API Clients (30 min)

**File: `apps/chatbot-mfe/src/api/chatbot.api.ts`**

```typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:3001/api';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

class ChatbotAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // ✅ CRITICAL: Send/receive cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ✅ Auto-refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Refresh token from auth service
            const { authService } = await import('@myapp/auth-service');
            await authService.refreshAccessToken();

            return this.client(originalRequest);
          } catch (refreshError) {
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await this.client.get('/chat/conversations');
    return response.data.conversations;
  }

  async getConversation(
    id: string
  ): Promise<Conversation & { messages: Message[] }> {
    const response = await this.client.get(`/chat/conversations/${id}`);
    return response.data;
  }

  async createConversation(data: { title?: string }): Promise<Conversation> {
    const response = await this.client.post('/chat/conversations', data);
    return response.data;
  }

  async deleteConversation(id: string): Promise<void> {
    await this.client.delete(`/chat/conversations/${id}`);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await this.client.get(
      `/chat/conversations/${conversationId}/messages`
    );
    if (response.data.messages && Array.isArray(response.data.messages)) {
      return response.data.messages;
    }
    return Array.isArray(response.data) ? response.data : [];
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response = await this.client.post(
      `/chat/conversations/${conversationId}/messages`,
      { content }
    );
    return response.data;
  }

  async sendMessageStream(
    conversationId: string,
    content: string
  ): Promise<Response> {
    const response = await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        credentials: 'include', // ✅ Send cookies with fetch
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(
          errorJson.error || errorJson.message || 'Failed to send message'
        );
      } catch {
        throw new Error(
          errorText || `Request failed with status ${response.status}`
        );
      }
    }
    return response;
  }
}

export const chatbotAPI = new ChatbotAPI();
```

---

### STEP 6: Environment Variables

**Create/Update `.env` in backend:**

```bash
# .env (apps/auth-service)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
COOKIE_DOMAIN=localhost
COOKIE_SECRET=dev-secret-key
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800
```

**Create/Update `.env.local` in frontend:**

```bash
# .env.local (Root or apps/shell)
VITE_AUTH_API_URL=http://localhost:3000/api
VITE_CHATBOT_API_URL=http://localhost:3001/api
VITE_ADMIN_API_URL=http://localhost:3002/api
VITE_PROFILE_API_URL=http://localhost:3003/api
```

---

## ✅ TESTING CHECKLIST

```bash
# 1. Install dependencies
npm install cookie-parser

# 2. Start backend
nx serve auth-service

# 3. Start frontend
nx serve shell

# 4. Test login
- Open http://localhost:5173/auth/login
- Enter credentials
- F12 → Application → Cookies
- ✅ Should see 'accessToken' and 'refreshToken' with HttpOnly flag

# 5. Test XSS protection
- F12 → Console
- Type: localStorage.getItem('auth-storage')
- ✅ Should see user data but NO tokens

# 6. Test token refresh
- F12 → Network
- Refresh page (F5)
- ✅ Should see POST /auth/refresh (auto-called)
- ✅ New accessToken cookie set

# 7. Test logout
- Click logout
- F12 → Application → Cookies
- ✅ accessToken and refreshToken should be cleared

# 8. Cross-MFE test
- Open multiple MFEs in browser
- ✅ All should share same cookies
- ✅ All should access same auth context
```

---

## 🐛 TROUBLESHOOTING

**Issue: 401 errors after login**

```
Solution:
- Check CORS credentials: true in backend
- Check withCredentials: true in axios
- Check Set-Cookie headers in response (F12 → Network)
```

**Issue: Cookies not being set**

```
Solution:
- Verify HTTPS in production (not localhost)
- Check secure: true flag
- Check sameSite: 'strict' (may block if third-party)
- Verify domain matches
```

**Issue: CORS errors**

```
Solution:
- Add origin to CORS whitelist
- Add credentials: true to CORS
- Check preflight requests (OPTIONS)
```

**Issue: Logout not clearing cookies**

```
Solution:
- Verify clearCookie called with correct path and domain
- Clear manually in browser: F12 → Application → Delete cookies
```

---

## 📊 BEFORE & AFTER

### BEFORE (Vulnerable)

```
Login Response:
{
  user: {...},
  accessToken: "eyJ...",           ❌ In JSON body
  refreshToken: "eyJ..."           ❌ In JSON body
}

Frontend:
localStorage['auth-storage'] = {
  state: {
    user: {...},
    accessToken: "eyJ...",        ❌ EXPOSED to XSS
    refreshToken: "eyJ..."        ❌ EXPOSED to XSS
  }
}

Attack:
XSS payload: localStorage.getItem('auth-storage')
Result: ❌ Attacker gets 7-day token
```

### AFTER (Secure)

```
Login Response:
Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
{
  user: {...},
  expiresIn: 900
}

Frontend:
localStorage['auth-storage'] = {
  state: {
    user: {...},
    // ✅ NO TOKENS
  }
}

Attack:
XSS payload: localStorage.getItem('auth-storage')
Result: ✅ Attacker gets only user data, tokens safe in HttpOnly cookies
```

---

**Total Implementation Time:** 2-3 hours  
**Files Modified:** 5  
**Files Created:** 0  
**Breaking Changes:** Yes (API response changed - removed tokens from JSON)  
**Rollback Time:** 15 minutes

Ready to implement? 🚀
