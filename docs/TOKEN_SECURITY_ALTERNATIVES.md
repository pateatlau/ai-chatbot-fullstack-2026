# JWT Token Storage Security: Alternatives to localStorage

**Document Type:** Security Architecture  
**Created:** November 18, 2025  
**Priority:** HIGH - Security Concern  
**Status:** Ready for Implementation

---

## ⚠️ SECURITY PROBLEM: Storing JWTs in localStorage

### Current Implementation (VULNERABLE)

```typescript
// Current code in auth.store.ts
persist(
  (set) => ({...}),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      user: state.user,
      accessToken: state.accessToken,      // ❌ VULNERABLE
      refreshToken: state.refreshToken,    // ❌ VULNERABLE
      isAuthenticated: state.isAuthenticated,
    }),
  }
);
```

### Why It's Vulnerable

| Attack Vector                  | Risk Level  | Impact                                                                                                                     |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| **XSS (Cross-Site Scripting)** | 🔴 CRITICAL | `localStorage` is accessible via JavaScript: `localStorage.getItem('auth-storage')` - Any XSS vulnerability exposes tokens |
| **DevTools Access**            | 🟠 HIGH     | Users/attackers can inspect localStorage in browser DevTools (F12)                                                         |
| **Malicious Extensions**       | 🟠 HIGH     | Browser extensions can read localStorage without user knowledge                                                            |
| **Man-in-the-Middle**          | 🟢 LOW      | Less risky if using HTTPS (which we do)                                                                                    |
| **Token Leakage in Logs**      | 🟠 HIGH     | Tokens visible in browser history, logs, screenshots                                                                       |

### Current Risk in Your Implementation

```
Login Response contains:
{
  accessToken: "eyJ...",           // 15 min expiry
  refreshToken: "eyJ...",          // 7 day expiry
  user: {...}
}

↓ Stored in localStorage as:
localStorage['auth-storage'] = {
  state: {
    user: {...},
    accessToken: "eyJ...",         // ❌ EXPOSED
    refreshToken: "eyJ...",        // ❌ EXPOSED (7 days!)
    isAuthenticated: true
  }
}

↓ Any XSS payload can access:
const authData = localStorage.getItem('auth-storage');
const tokens = JSON.parse(authData);
console.log(tokens.state.refreshToken);  // Attacker got 7-day access!
```

---

## ✅ SOLUTION 1: HttpOnly Secure Cookies (RECOMMENDED - Most Secure)

### How It Works

```
Browser              Backend Auth Service
  │                      │
  ├─ POST /auth/login    │
  │─────────────────────>│
  │                      ├─ Verify credentials
  │                      ├─ Generate tokens
  │                      ├─ Store refresh token in DB
  │<─────────────────────┤
  │ Set-Cookie: accessToken (HttpOnly, Secure, SameSite=Strict)
  │ Set-Cookie: refreshToken (HttpOnly, Secure, SameSite=Strict)
  │ Response JSON: { user, expiresIn }
  │                      │
  ├─ Automatically includes cookies in future requests
  │─────────────────────>│ GET /api/conversations
  │ (No manual header needed!)
  │
```

### Backend Changes (Express)

**Step 1: Configure Cookie Settings in auth.service or controller**

```typescript
// apps/auth-service/src/controllers/auth.controller.ts

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      // ✅ Set HttpOnly cookies instead of returning tokens in JSON
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true, // ❌ JavaScript cannot access
        secure: true, // ✅ Only sent over HTTPS
        sameSite: 'strict', // ✅ Prevents CSRF attacks
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
        domain: process.env.COOKIE_DOMAIN, // Set to your domain
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true, // ❌ JavaScript cannot access
        secure: true, // ✅ Only sent over HTTPS
        sameSite: 'strict', // ✅ Prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
      });

      // ✅ Return only user info, not tokens
      res.status(200).json({
        user: result.user,
        expiresIn: result.expiresIn,
        // ❌ NO accessToken or refreshToken in response body
      });
    } catch (error) {
      // ... error handling
    }
  }

  async logout(req: Request, res: Response) {
    try {
      // Get refresh token from cookie (not body)
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({ error: 'No token found' });
      }

      await authService.logout(refreshToken);

      // ✅ Clear cookies
      res.clearCookie('accessToken', {
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
      });
      res.clearCookie('refreshToken', {
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
      });

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      // ... error handling
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      // Get refresh token from cookies (not body)
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token' });
      }

      const result = await authService.refreshToken(refreshToken);

      // ✅ Set new HttpOnly cookies
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
      });

      res.status(200).json({
        expiresIn: result.expiresIn,
        // ❌ NO tokens in response
      });
    } catch (error) {
      // ... error handling
    }
  }
}
```

**Step 2: Configure CORS and Cookie Middleware**

```typescript
// apps/auth-service/src/middleware/cors.ts
import cors from 'cors';

export const corsMiddleware = cors({
  origin: [
    'http://localhost:5173', // Shell
    'http://localhost:5174', // Auth MFE
    'http://localhost:5175', // Chatbot MFE
    'http://localhost:5176', // Admin MFE
    'http://localhost:5177', // Profile MFE
    process.env.PRODUCTION_DOMAIN, // Your production domain
  ],
  credentials: true, // ✅ CRITICAL: Allow cookies in CORS requests
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Step 3: Configure Cookie Parser Middleware**

```typescript
// apps/auth-service/src/main.ts
import cookieParser from 'cookie-parser';

app.use(corsMiddleware);
app.use(cookieParser(process.env.COOKIE_SECRET)); // For signed cookies
app.use(express.json());
```

### Frontend Changes (React)

**Step 1: Update auth.store.ts - No Token Storage**

```typescript
// libs/frontend/stores/src/lib/auth.store.ts
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
  // ❌ REMOVED: accessToken
  // ❌ REMOVED: refreshToken
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User) => void; // No tokens as parameters
  clearAuth: () => void;
  setUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      // ❌ No token fields
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
          // ❌ No tokens to clear
          isAuthenticated: false,
          isLoading: false,
        }),

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // ❌ Tokens NOT persisted (in HttpOnly cookies instead)
      }),
    }
  )
);
```

**Step 2: Update auth.service.ts - Cookies Handled Automatically**

```typescript
// apps/auth-mfe/src/services/auth.service.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/api';

export class AuthService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // ✅ CRITICAL: Send cookies automatically
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor handles token refresh automatically
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // POST /auth/refresh automatically includes refreshToken cookie
            // and sets new accessToken cookie
            await this.client.post('/auth/refresh');

            // Retry original request with new token
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

  async login(email: string, password: string, rememberMe: boolean) {
    // Cookies set automatically by backend
    const response = await this.client.post('/auth/login', {
      email,
      password,
      rememberMe,
    });
    return response.data; // { user, expiresIn } - NO tokens
  }

  async logout() {
    // Cookies cleared automatically by backend
    await this.client.post('/auth/logout');
  }

  async refreshAccessToken() {
    // New token set automatically in cookie by backend
    const response = await this.client.post('/auth/refresh');
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }
}
```

**Step 3: Update Login Component**

```typescript
// apps/auth-mfe/src/pages/Login.tsx
import { useState } from 'react';
import { useAuthStore } from '@myapp/frontend/stores';
import { authService } from '../services/auth.service';

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // Login - cookies set automatically
      const response = await authService.login(
        data.email,
        data.password,
        data.rememberMe
      );

      // Store user (not tokens)
      setAuth(response.user);

      window.location.replace('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      // Show error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... form code (same as before)
  );
}
```

**Step 4: Update API Clients (chatbot.api.ts, admin.api.ts, etc.)**

```typescript
// Before (VULNERABLE):
function getAccessToken(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return null;
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.accessToken || null;
  } catch {
    return null;
  }
}

// After (HttpOnly Cookies):
// ✅ NO getAccessToken() function needed!
// Cookies sent automatically by browser

class ChatbotAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // ✅ Send cookies automatically
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ✅ No manual Authorization header needed
    // Cookies handled by browser automatically

    // Still need refresh handling for streaming requests
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          await authService.refreshAccessToken();
          return this.client(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  async getConversations(): Promise<Conversation[]> {
    // ✅ Cookies sent automatically
    const response = await this.client.get<ConversationsResponse>(
      '/chat/conversations'
    );
    return response.data.conversations;
  }

  async sendMessageStream(
    conversationId: string,
    content: string
  ): Promise<Response> {
    // ✅ For fetch API, pass credentials
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
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response;
  }
}
```

### Security Benefits (HttpOnly Cookies)

| Feature                      | Benefit                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------- |
| **HttpOnly Flag**            | JavaScript cannot access token via `document.cookie` - even XSS cannot steal it |
| **Secure Flag**              | Cookie only sent over HTTPS - prevents MITM attacks                             |
| **SameSite=Strict**          | Cookie not sent in cross-site requests - prevents CSRF                          |
| **Automatic Refresh**        | Browser handles token refresh transparently                                     |
| **No localStorage**          | Eliminates localStorage as attack vector                                        |
| **Short-lived Access Token** | 15 min expiry limits damage if compromised                                      |

---

## ✅ SOLUTION 2: Hybrid Approach (Session + Memory)

### When to Use

- If you need some tokens accessible to JavaScript (e.g., for non-standard requests)
- If you want explicit control over token lifetime per session
- If you're migrating from localStorage gradually

### How It Works

```
1. Access Token (15 min):
   ├─ Storage: HttpOnly cookie (PREFERRED)
   └─ Also keep in memory for explicit access if needed

2. Refresh Token (7 days):
   ├─ Storage: HttpOnly cookie ONLY (secure)
   └─ ❌ NEVER in memory, ❌ NEVER in localStorage

3. Backend validates refresh token:
   ├─ Always verify against database
   └─ Check if token is blacklisted
```

### Implementation

```typescript
// auth.store.ts - Only user data, no tokens
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // ❌ No tokens stored here
}

// auth.service.ts - Tokens in memory only during session
class AuthService {
  private accessTokenMemory: string | null = null;
  private accessTokenExpiry: number | null = null;

  async login(email: string, password: string) {
    const response = await fetch('/auth/login', {
      method: 'POST',
      credentials: 'include', // Get cookies
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // ✅ Keep access token in memory temporarily
    this.accessTokenMemory = data.accessToken;
    this.accessTokenExpiry = Date.now() + 15 * 60 * 1000;

    // ✅ Refresh token in HttpOnly cookie (automatic)
    return data;
  }

  getAccessToken(): string | null {
    // Return from memory if not expired
    if (
      this.accessTokenMemory &&
      this.accessTokenExpiry &&
      Date.now() < this.accessTokenExpiry
    ) {
      return this.accessTokenMemory;
    }
    return null;
  }

  clearAccessTokenMemory() {
    this.accessTokenMemory = null;
    this.accessTokenExpiry = null;
  }
}
```

### Security Level: **MEDIUM** (Better than localStorage, not as good as pure HttpOnly)

---

## ✅ SOLUTION 3: In-Memory Only (No Persistence)

### When to Use

- For high-security applications where logout on browser close is acceptable
- When you want zero data leakage even if browser is compromised
- Development/testing environments

### Implementation

```typescript
// auth.store.ts - No persistence at all
export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    setAuth: (user) => set({ user, isAuthenticated: true }),
    clearAuth: () => set({ user: null, isAuthenticated: false }),
  })
  // ❌ NO persist middleware
);
```

### Tradeoff

- ✅ Most secure (tokens never touch disk)
- ✅ XSS cannot steal persistent tokens
- ❌ User logged out on page refresh
- ❌ Terrible UX for production apps

---

## ⚙️ MIGRATION PLAN: localStorage → HttpOnly Cookies

### Phase 1: Backend Setup (2 days)

```
□ Install middleware: npm install cookie-parser
□ Add CORS credentials: true
□ Update auth.controller.ts - Set HttpOnly cookies
□ Update auth.service.ts - No tokens in response
□ Test with curl/Postman - Verify Set-Cookie headers
□ Deploy to staging
```

### Phase 2: Frontend Preparation (2 days)

```
□ Update axios instances - withCredentials: true
□ Add response interceptor - Handle token refresh
□ Update auth.store.ts - Remove token fields
□ Update auth.service.ts - Remove getAccessToken()
□ Update all API clients - Remove Authorization header logic
```

### Phase 3: Testing (3 days)

```
□ E2E test login flow
□ E2E test token refresh
□ E2E test logout
□ Test XSS vulnerability (try accessing localStorage in console)
□ Test CSRF protection (verify SameSite works)
□ Test across MFEs (cookies shared)
□ Performance test (cookie overhead minimal)
```

### Phase 4: Deployment (1 day)

```
□ Feature flag: Use HttpOnly cookies (default false)
□ Enable for 10% users
□ Monitor errors (401, 403)
□ Gradual rollout to 100%
□ Disable localStorage auth as fallback
□ Monitor browser console for security warnings
```

### Rollback Plan

```
If issues arise:
□ Revert to localStorage auth (existing code)
□ Keep HttpOnly cookies as secondary (belt-and-suspenders)
□ Fix issues and retry
```

---

## 🔄 ENVIRONMENT VARIABLES NEEDED

```bash
# .env.local (Frontend)
VITE_AUTH_API_URL=http://localhost:3000/api
VITE_CHATBOT_API_URL=http://localhost:3001/api
VITE_ADMIN_API_URL=http://localhost:3002/api
VITE_PROFILE_API_URL=http://localhost:3003/api

# .env (Backend - auth-service)
COOKIE_DOMAIN=localhost           # localhost for dev, yourdomain.com for prod
COOKIE_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
DATABASE_URL=postgresql://...
```

---

## ✅ CHECKLIST: HttpOnly Cookie Implementation

### Backend

- [ ] Install cookie-parser middleware
- [ ] Configure CORS with credentials: true
- [ ] Update login endpoint - Set HttpOnly cookies
- [ ] Update refresh endpoint - Set new HttpOnly cookies
- [ ] Update logout endpoint - Clear cookies
- [ ] Test with curl: `curl -i -b cookies.txt http://localhost:3000/auth/login`
- [ ] Verify Set-Cookie headers in response
- [ ] Test across different origins (CORS)

### Frontend

- [ ] Update auth.store.ts - Remove token persistence
- [ ] Update auth.service.ts - Add withCredentials: true
- [ ] Update all API clients - withCredentials: true
- [ ] Remove getAccessToken() helpers
- [ ] Update response interceptor - Auto token refresh
- [ ] Test login in browser - Verify cookies set (F12 → Application → Cookies)
- [ ] Test XSS protection - Try accessing tokens in console
- [ ] Test logout - Verify cookies cleared

### Testing

- [ ] Manual login test across all MFEs
- [ ] Token refresh on 401
- [ ] Logout clears cookies
- [ ] Page refresh maintains login
- [ ] Cross-site cookie sharing (all MFEs on same domain)
- [ ] XSS attempt - Verify no token access
- [ ] DevTools inspection - Verify HttpOnly flag

### Monitoring

- [ ] Track 401 errors (token refresh issues)
- [ ] Track CORS errors (credentials issues)
- [ ] Monitor cookie rejection logs
- [ ] Check for SameSite warnings

---

## 📊 COMPARISON: All Approaches

```
┌────────────────────┬──────────────┬─────────────┬────────────────┐
│ Approach           │ Security     │ Persistence │ User Experience│
├────────────────────┼──────────────┼─────────────┼────────────────┤
│ localStorage       │ 🔴 CRITICAL  │ ✅ Full     │ ✅ Excellent   │
│ (Current)          │ (XSS exposed)│             │ (Stays login)  │
├────────────────────┼──────────────┼─────────────┼────────────────┤
│ HttpOnly Cookies   │ 🟢 EXCELLENT │ ✅ Full     │ ✅ Excellent   │
│ (RECOMMENDED)      │ (XSS safe)   │             │ (Stays login)  │
├────────────────────┼──────────────┼─────────────┼────────────────┤
│ Hybrid             │ 🟡 GOOD      │ ✅ Full     │ ✅ Excellent   │
│ (Session + Memory) │ (Partial)    │             │ (Stays login)  │
├────────────────────┼──────────────┼─────────────┼────────────────┤
│ Memory Only        │ 🟢 EXCELLENT │ ❌ None     │ 🔴 Poor        │
│                    │ (Most secure)│ (Lost on F5)│ (Logout on F5) │
└────────────────────┴──────────────┴─────────────┴────────────────┘
```

---

## 🔐 ADDITIONAL SECURITY LAYERS (Beyond Token Storage)

Even with HttpOnly cookies, implement these:

### 1. CSRF Protection

```typescript
// Backend: Generate CSRF token on GET requests
app.get('/api/csrf-token', (req, res) => {
  const csrfToken = generateRandomToken();
  req.session.csrfToken = csrfToken;
  res.json({ csrfToken });
});

// Frontend: Include in POST/PUT/PATCH requests
const csrfToken = await fetch('/api/csrf-token').then((r) => r.json());
axios.post('/api/conversations', data, {
  headers: { 'X-CSRF-Token': csrfToken.csrfToken },
});
```

### 2. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later.',
});

app.post('/auth/login', loginLimiter, authController.login);
```

### 3. Token Rotation

```typescript
// After each refresh, old token becomes invalid
async refreshToken(refreshToken: string) {
  // Verify old refresh token
  // Issue new refresh + access tokens
  // Invalidate old refresh token in DB
  // Optional: Delete all other sessions for security
}
```

### 4. Device Fingerprinting

```typescript
// Optional: Validate request device matches login device
const fingerprint = hash(userAgent + ipAddress);
if (storedFingerprint !== fingerprint) {
  // Suspicious activity - require re-auth
}
```

---

## 🚨 IMPLEMENTATION PRIORITY

**Phase 1 - IMMEDIATE (This Week):**

- Implement HttpOnly Cookie storage
- This is the highest priority security fix

**Phase 2 - SOON (Next Week):**

- Add CSRF protection
- Add rate limiting on auth endpoints

**Phase 3 - LATER (Future):**

- Device fingerprinting
- Anomaly detection
- Session activity logging

---

## 📝 REFERENCES

- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP: SessionManagement Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [MDN: HttpOnly Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [SameSite Cookie Explained](https://web.dev/samesite-cookies-explained/)

---

**Document Version:** 1.0  
**Created:** November 18, 2025  
**Severity:** 🔴 HIGH - Security Vulnerability  
**Recommendation:** Implement HttpOnly Cookies (Solution 1) immediately
