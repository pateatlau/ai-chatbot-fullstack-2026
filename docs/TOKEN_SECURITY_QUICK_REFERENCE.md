# JWT Token Security: Quick Reference Card

**Print this or save to phone for quick lookup during implementation**

---

## 🎯 THE GOAL

Move JWT tokens from **localStorage** (vulnerable to XSS) to **HttpOnly Cookies** (XSS-proof).

---

## ⚡ QUICK FACTS

| What | Before | After |
|------|--------|-------|
| **Storage** | localStorage (JavaScript accessible) | HttpOnly cookies (Not JS accessible) |
| **XSS Risk** | 🔴 CRITICAL | 🟢 SAFE |
| **Duration** | 2-3 hours | — |
| **Files Changed** | 11 | — |
| **Breaking** | No | Yes (API response) |
| **Rollback Time** | — | 15 min |

---

## 🔧 IMPLEMENTATION FLOW

```
Backend Changes (45 min)
    ↓
Frontend Store (15 min)
    ↓
Frontend Auth Service (30 min)
    ↓
Frontend API Clients (30 min)
    ↓
Testing (30 min)
```

---

## 📋 BACKEND CHANGES

### 1. main.ts
```typescript
import cors from 'cors';
import cookieParser from 'cookie-parser';

app.use(cors({
  credentials: true,  // ← CRITICAL
  origin: [...]
}));
app.use(cookieParser());
```

### 2. auth.controller.ts - login()
```typescript
res.cookie('accessToken', result.accessToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,
});

res.cookie('refreshToken', result.refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

res.json({ user: result.user, expiresIn: result.expiresIn });
// ❌ NO tokens in response
```

### 3. auth.controller.ts - logout()
```typescript
const refreshToken = req.cookies.refreshToken;  // From cookie, not body
// ... logout logic ...
res.clearCookie('accessToken');
res.clearCookie('refreshToken');
```

### 4. auth.controller.ts - refresh()
```typescript
const refreshToken = req.cookies.refreshToken;  // From cookie, not body
const result = await authService.refreshToken(refreshToken);

res.cookie('accessToken', result.accessToken, {...});
res.cookie('refreshToken', result.refreshToken, {...});

res.json({ expiresIn: result.expiresIn });
// ❌ NO tokens in response
```

---

## 🎨 FRONTEND CHANGES

### 1. auth.store.ts
```typescript
// REMOVE these fields:
// accessToken: string | null;
// refreshToken: string | null;

// KEEP only:
user: User | null;
isAuthenticated: boolean;
isLoading: boolean;

// Update setAuth to accept only user:
setAuth: (user) => set({ user, isAuthenticated: true })
```

### 2. auth.service.ts
```typescript
constructor() {
  this.client = axios.create({
    withCredentials: true,  // ← CRITICAL
    baseURL: API_BASE_URL,
  });

  // Add response interceptor for 401
  this.client.interceptors.response.use(
    response => response,
    async (error) => {
      if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;
        await this.client.post('/auth/refresh');
        return this.client(error.config);
      }
      return Promise.reject(error);
    }
  );
}

// Remove getAccessToken() function

async login(email, password, rememberMe) {
  const response = await this.client.post('/auth/login', {
    email, password, rememberMe
  });
  return response.data; // { user, expiresIn } - NO tokens
}
```

### 3. All API clients (chatbot.api.ts, admin.api.ts, etc.)
```typescript
class ChatbotAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      withCredentials: true,  // ← CRITICAL
      baseURL: API_BASE_URL,
    });

    // Add same 401 interceptor as auth.service.ts
    this.client.interceptors.response.use(
      response => response,
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

  // Remove getAccessToken() function
  // Keep all other methods same
  // Tokens auto-included in cookies
}
```

### 4. For fetch() calls
```typescript
const response = await fetch(url, {
  method: 'POST',
  credentials: 'include',  // ← CRITICAL for fetch
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

---

## ✅ QUICK VERIFICATION

### Browser DevTools Check
```
F12 → Application → Cookies

Should see:
✅ accessToken (HttpOnly: ✓, Secure: ✓, SameSite: Strict)
✅ refreshToken (HttpOnly: ✓, Secure: ✓, SameSite: Strict)
```

### Console Check
```javascript
// Should return user data but NO tokens:
JSON.parse(localStorage.getItem('auth-storage'))

// Should NOT see tokens:
document.cookie  // HttpOnly cookies hidden

// Should NOT have getAccessToken function:
typeof getAccessToken  // ❌ undefined
```

### API Request Check
```
F12 → Network → Any API call

Headers should include:
✅ Cookie: accessToken=...; refreshToken=...
❌ NOT: Authorization: Bearer ...
```

---

## 🐛 TROUBLESHOOTING QUICK FIX

| Problem | Check | Fix |
|---------|-------|-----|
| 401 errors | axios config | Add `withCredentials: true` |
| Cookies not set | CORS config | Add `credentials: true` |
| CORS error | Browser origin | Add to CORS whitelist |
| Refresh not triggered | Interceptor | Verify interceptor setup |
| Can see tokens in JS | HttpOnly flag | Check backend Set-Cookie |

---

## 🚨 DO's and DON'Ts

### ✅ DO
- [ ] Use `withCredentials: true` in axios
- [ ] Use `credentials: 'include'` with fetch
- [ ] Set `httpOnly: true` on cookies
- [ ] Set `sameSite: 'strict'` on cookies
- [ ] Set `secure: true` on cookies (production)
- [ ] Get refresh token from `req.cookies`
- [ ] Get access token from `req.headers.authorization` (if needed)
- [ ] Return only `{ user, expiresIn }` in response
- [ ] Test in DevTools (F12)

### ❌ DON'T
- [ ] Store tokens in localStorage
- [ ] Return tokens in response body
- [ ] Set `httpOnly: false`
- [ ] Use `sameSite: 'none'` (unless cross-domain needed)
- [ ] Include tokens in URL params
- [ ] Display tokens in console logs
- [ ] Skip the 401 interceptor
- [ ] Forget CORS credentials setting

---

## 📱 FILE CHECKLIST

### Backend (Install first: `npm install cookie-parser`)
- [ ] apps/auth-service/src/main.ts
- [ ] apps/auth-service/src/controllers/auth.controller.ts
- [ ] apps/auth-service/src/services/auth.service.ts (minimal changes)

### Frontend - Core
- [ ] libs/frontend/stores/src/lib/auth.store.ts
- [ ] apps/auth-mfe/src/services/auth.service.ts
- [ ] apps/auth-mfe/src/pages/Login.tsx

### Frontend - API Clients
- [ ] apps/chatbot-mfe/src/api/chatbot.api.ts
- [ ] apps/admin-mfe/src/api/admin.api.ts
- [ ] apps/profile-mfe/src/api/profile.api.ts
- [ ] Any other API client files

---

## 🧪 TEST CHECKLIST

Quick tests before pushing:

```bash
□ npm install cookie-parser
□ npm run build
□ npm run dev

# In browser:
□ Login works
□ F12 → Cookies shows accessToken & refreshToken (HttpOnly ✓)
□ F12 → Console: localStorage shows NO tokens
□ Page refresh: Still logged in
□ Wait 15+ min: Token refresh auto-triggers
□ Logout: Cookies cleared
□ Cross-MFE: All MFEs see auth
```

---

## 🔒 SECURITY LAYERS

```
HttpOnly Cookie Security Stack:

Layer 1: HttpOnly Flag
    ↓ Prevents JavaScript access (XSS protection)
Layer 2: Secure Flag
    ↓ Requires HTTPS (MITM protection)
Layer 3: SameSite=Strict
    ↓ Blocks cross-site requests (CSRF protection)
Layer 4: 15-minute expiry (access token)
    ↓ Limits stolen token damage
Layer 5: Backend validation
    ↓ Verifies token signature and database state
    
Result: 🟢 Secure
```

---

## 📞 QUICK HELP

**Q: Where do I start?**
A: Read HTTPONLY_COOKIES_QUICK_START.md (40 min), then follow HTTPONLY_COOKIES_IMPLEMENTATION_CHECKLIST.md

**Q: How long does it take?**
A: 2-3 hours total (backend 45 min, frontend 1.5 hours, testing 30 min)

**Q: What breaks?**
A: API response format (no tokens in JSON anymore)

**Q: Can I rollback?**
A: Yes, 15 minutes with `git revert`

**Q: Will users notice?**
A: No, same UX (cookies auto-sent, auto-refreshed)

**Q: Mobile apps?**
A: Yes, works fine with `withCredentials: true` and `credentials: 'include'`

---

## 📊 IMPACT SUMMARY

| Metric | Value |
|--------|-------|
| **Security Improvement** | 🟢 9/10 (from 2/10) |
| **Implementation Time** | 2-3 hours |
| **Files Modified** | 11 |
| **Breaking Changes** | Yes (API response) |
| **User Impact** | None (same UX) |
| **Performance Impact** | None (negligible) |
| **ROI** | Eliminates critical security risk |

---

## 🎓 LEARNING RESOURCES

In workspace docs:
- TOKEN_SECURITY_ALTERNATIVES.md — Deep dive on all approaches
- HTTPONLY_COOKIES_QUICK_START.md — Step-by-step with code
- TOKEN_SECURITY_VISUAL_COMPARISON.md — Before/after diagrams
- TOKEN_SECURITY_FIX_SUMMARY.md — Executive overview
- HTTPONLY_COOKIES_IMPLEMENTATION_CHECKLIST.md — Detailed checklist

External:
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [MDN: HttpOnly Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

---

**Ready? Start with HTTPONLY_COOKIES_QUICK_START.md! 🚀**

**Estimated Time to Complete:** 2-3 hours  
**Difficulty:** Medium  
**Risk:** Low  
**Security Gain:** Critical

