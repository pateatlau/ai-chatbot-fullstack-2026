# Security Fix Summary: JWT Token Storage

**Date:** November 18, 2025  
**Priority:** 🔴 HIGH - Security Vulnerability  
**Status:** Ready for Implementation

---

## ⚡ EXECUTIVE SUMMARY

Your application is currently storing JWT tokens in `localStorage`, which is **vulnerable to XSS (Cross-Site Scripting) attacks**. An attacker with XSS access can steal your **7-day refresh token**, granting full account access.

**Recommendation:** Migrate to **HttpOnly Secure Cookies** (2-3 hour fix).

---

## 🚨 THE PROBLEM

### Current Vulnerable Implementation

```typescript
// apps/auth-service/src/controllers/auth.controller.ts
const result = await authService.login(validatedData);

// ❌ VULNERABLE: Tokens in response body
res.status(200).json({
  user: result.user,
  accessToken: result.accessToken, // ← In JSON!
  refreshToken: result.refreshToken, // ← In JSON!
  expiresIn: result.expiresIn,
});
```

```typescript
// libs/frontend/stores/src/lib/auth.store.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({...}),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,      // ❌ Persisted in localStorage!
        refreshToken: state.refreshToken,    // ❌ Persisted in localStorage!
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### Risk Exposure

```
localStorage['auth-storage'] = {
  state: {
    user: {...},
    accessToken: "eyJ...",        ❌ EXPOSED (15 min)
    refreshToken: "eyJ..."        ❌ EXPOSED (7 DAYS!)
  }
}

// Any XSS can steal it:
localStorage.getItem('auth-storage')
```

### Attack Scenarios

| Scenario                | How                                         | Damage                           | Likelihood  |
| ----------------------- | ------------------------------------------- | -------------------------------- | ----------- |
| **XSS Injection**       | Malicious script on page reads localStorage | Full account access for 7 days   | 🔴 CRITICAL |
| **Malicious Extension** | Browser extension with broad permissions    | Silent token theft               | 🟠 HIGH     |
| **Compromised CDN**     | Injected code from third-party library      | Automatic token exfiltration     | 🟠 HIGH     |
| **DevTools Access**     | Someone with browser open                   | Token visible in Application tab | 🟡 MEDIUM   |

---

## ✅ THE SOLUTION: HttpOnly Secure Cookies

### How It Works

```
Login Request
    ↓
Backend receives credentials
    ↓
Backend generates tokens
    ↓
Backend sets HttpOnly cookies (NOT in response body)
    ↓
Browser stores cookies securely (NOT accessible to JavaScript)
    ↓
Every API request auto-includes cookies
    ↓
Backend validates token from cookie
    ↓
✅ XSS cannot steal tokens (JavaScript cannot access HttpOnly cookies)
```

### Response Changes

**BEFORE (Vulnerable):**

```json
{
  "user": {...},
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 900
}
```

**AFTER (Secure):**

```
Set-Cookie: accessToken=eyJ...; HttpOnly; Secure; SameSite=Strict; Max-Age=900
Set-Cookie: refreshToken=eyJ...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

{
  "user": {...},
  "expiresIn": 900
}
```

---

## 📋 WHAT NEEDS TO CHANGE

### Backend Changes (6 locations)

1. **Add cookie parser middleware** → `apps/auth-service/src/main.ts`
2. **Configure CORS** → `apps/auth-service/src/main.ts`
3. **Update login endpoint** → `apps/auth-service/src/controllers/auth.controller.ts`
4. **Update refresh endpoint** → `apps/auth-service/src/controllers/auth.controller.ts`
5. **Update logout endpoint** → `apps/auth-service/src/controllers/auth.controller.ts`
6. **Update auth service** → `apps/auth-service/src/services/auth.service.prisma.ts`

### Frontend Changes (5 locations)

1. **Remove token persistence** → `libs/frontend/stores/src/lib/auth.store.ts`
2. **Update auth service** → `apps/auth-mfe/src/services/auth.service.ts`
3. **Update login component** → `apps/auth-mfe/src/pages/Login.tsx`
4. **Update API clients** → `apps/chatbot-mfe/src/api/chatbot.api.ts` (and others)
5. **Configure axios** → All API services

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Backend Setup (45 min)

```bash
# Install dependency
npm install cookie-parser

# Update: apps/auth-service/src/main.ts
# - Add cors middleware with credentials: true
# - Add cookie-parser middleware

# Update: apps/auth-service/src/controllers/auth.controller.ts
# - Add res.cookie() calls in login/refresh endpoints
# - Change refresh token retrieval from body to req.cookies
# - Add res.clearCookie() in logout endpoint

# Update: apps/auth-service/src/services/auth.service.prisma.ts
# - No changes needed (service level logic stays same)
```

### Step 2: Frontend Store (15 min)

```bash
# Update: libs/frontend/stores/src/lib/auth.store.ts
# - Remove accessToken field
# - Remove refreshToken field
# - Remove from partialize()
# - Update setAuth() to not accept tokens
# - Update clearAuth() to not clear tokens
```

### Step 3: Auth Service (30 min)

```bash
# Update: apps/auth-mfe/src/services/auth.service.ts
# - Add withCredentials: true to axios
# - Remove getAccessToken() function
# - Update response interceptor for 401 handling
# - Update login() to not extract tokens
```

### Step 4: Update Components (30 min)

```bash
# Update: apps/auth-mfe/src/pages/Login.tsx
# - Update login call to handle no tokens returned
# - Remove localStorage.setItem('rememberMe')

# Update: apps/chatbot-mfe/src/api/chatbot.api.ts
# - Add withCredentials: true
# - Remove Authorization header logic
# - Remove getAccessToken() function
# - Update response interceptor

# Same for: admin, profile, and any other MFE API files
```

### Step 5: Environment Setup (10 min)

```bash
# Add to .env:
COOKIE_DOMAIN=localhost
COOKIE_SECRET=dev-secret-key

# Add to .env.local:
VITE_AUTH_API_URL=http://localhost:3000/api
VITE_CHATBOT_API_URL=http://localhost:3001/api
# etc.
```

### Step 6: Testing (30 min)

```bash
# 1. Login
# 2. Check F12 → Application → Cookies
#    ✅ Should see accessToken and refreshToken with HttpOnly flag
# 3. Try in console: localStorage.getItem('auth-storage')
#    ✅ Should see user but NO tokens
# 4. Refresh page
#    ✅ Should remain logged in
# 5. Wait 15+ min or manually trigger token refresh
#    ✅ Should call POST /auth/refresh
```

---

## 📚 DOCUMENTATION PROVIDED

We've created 4 comprehensive guides:

1. **TOKEN_SECURITY_ALTERNATIVES.md** (Comprehensive)
   - Explains all 3 approaches
   - Complete security analysis
   - Implementation details for each approach
   - OWASP references

2. **HTTPONLY_COOKIES_QUICK_START.md** (Copy-Paste Ready)
   - Step-by-step implementation
   - All code snippets ready to use
   - Immediate action items
   - Troubleshooting guide

3. **TOKEN_SECURITY_VISUAL_COMPARISON.md** (Visual Reference)
   - Before/after diagrams
   - Attack vector comparison
   - Security layer visualization
   - Implementation impact table

4. **This document** (Summary)
   - Quick overview
   - Timeline and effort
   - What needs to change
   - Implementation checklist

---

## ⏱️ IMPLEMENTATION TIMELINE

| Phase                 | Duration           | Tasks                              | Status  |
| --------------------- | ------------------ | ---------------------------------- | ------- |
| **Planning**          | 30 min             | Review docs, decide approach       | 📋 NOW  |
| **Backend**           | 45 min             | Update auth service, middleware    | ⏳ TODO |
| **Frontend Store**    | 15 min             | Update Zustand store               | ⏳ TODO |
| **Frontend Services** | 30 min             | Update auth service & API clients  | ⏳ TODO |
| **Components**        | 30 min             | Update login, add cookies config   | ⏳ TODO |
| **Testing**           | 30 min             | Manual testing, verify security    | ⏳ TODO |
| **Deployment**        | 15 min             | Deploy to staging, then production | ⏳ TODO |
| **Monitoring**        | Ongoing            | Watch for 401/CORS errors          | ⏳ TODO |
|                       | **TOTAL: 3 hours** |                                    |

---

## ✅ IMPLEMENTATION CHECKLIST

### Planning

- [ ] Read TOKEN_SECURITY_ALTERNATIVES.md (full understanding)
- [ ] Read HTTPONLY_COOKIES_QUICK_START.md (implementation plan)
- [ ] Review TOKEN_SECURITY_VISUAL_COMPARISON.md (security benefits)
- [ ] Identify all API clients that need updates

### Backend (45 min)

- [ ] Install `npm install cookie-parser`
- [ ] Update apps/auth-service/src/main.ts (CORS + cookie-parser)
- [ ] Update apps/auth-service/src/controllers/auth.controller.ts:
  - [ ] login() endpoint - Add res.cookie() calls
  - [ ] refresh() endpoint - Get token from req.cookies
  - [ ] logout() endpoint - Clear cookies with res.clearCookie()
- [ ] Test with curl: `curl -i -b cookies.txt http://localhost:3000/auth/login -X POST -d "email=...&password=..."`

### Frontend - Core (1 hour)

- [ ] Update libs/frontend/stores/src/lib/auth.store.ts
  - [ ] Remove accessToken field
  - [ ] Remove refreshToken field
  - [ ] Remove from partialize()
  - [ ] Update setAuth() signature
- [ ] Update apps/auth-mfe/src/services/auth.service.ts
  - [ ] Add withCredentials: true to axios config
  - [ ] Remove getAccessToken() helper
  - [ ] Update response interceptor
- [ ] Update apps/auth-mfe/src/pages/Login.tsx
  - [ ] Update login handler for no tokens in response

### Frontend - API Clients (30 min)

- [ ] Update apps/chatbot-mfe/src/api/chatbot.api.ts
  - [ ] Add withCredentials: true
  - [ ] Remove getAccessToken() and Authorization header logic
- [ ] Update apps/admin-mfe/src/api/admin.api.ts (same changes)
- [ ] Update apps/profile-mfe/src/api/profile.api.ts (same changes)
- [ ] Update any other API client files

### Environment & Config (15 min)

- [ ] Add COOKIE_DOMAIN and COOKIE_SECRET to .env
- [ ] Add API URLs to .env.local
- [ ] Update docker-compose files if needed

### Testing (30 min)

- [ ] Start backend: `nx serve auth-service`
- [ ] Start frontend: `nx serve shell`
- [ ] Test login flow
- [ ] Verify cookies are set (F12 → Application → Cookies)
- [ ] Test XSS protection (verify tokens not in localStorage)
- [ ] Test page refresh maintains login
- [ ] Test token refresh (wait for 401 or trigger manually)
- [ ] Test logout clears cookies
- [ ] Cross-MFE test (all MFEs share auth context)

### Deployment

- [ ] Create feature flag (optional)
- [ ] Deploy to staging
- [ ] Smoke test on staging
- [ ] Deploy to production
- [ ] Monitor for errors (401, CORS)
- [ ] Gradual rollout (optional)

---

## 🔒 SECURITY BENEFITS

After implementing HttpOnly Cookies:

✅ **XSS Protection**: Tokens cannot be accessed by malicious JavaScript  
✅ **CSRF Protection**: SameSite=Strict prevents cross-site attacks  
✅ **MITM Prevention**: Secure flag ensures HTTPS-only transmission  
✅ **Automatic Expiry**: Tokens expire automatically in browser  
✅ **Transparent Refresh**: Token refresh happens silently  
✅ **Backend Control**: Server manages token lifecycle  
✅ **OWASP Compliant**: Follows security best practices

---

## ⚠️ BREAKING CHANGES

The API response format changes:

**BEFORE:**

```json
{
  "user": {...},
  "accessToken": "...",
  "refreshToken": "..."
}
```

**AFTER:**

```json
{
  "user": {...},
  "expiresIn": 900
}
```

**Impact:** Any client consuming login API must be updated.

**Mitigation:** Update all frontend services first, then deploy.

---

## 🐛 ROLLBACK PROCEDURE (If Needed)

If issues arise:

```bash
# 1. Revert code changes
git revert <commit-hash>

# 2. Restart services
npm run build
npm run dev

# 3. Monitor for resolution
# - Check auth logs
# - Check CORS errors
# - Check 401 errors

# 4. Fix and retry
```

**Estimated rollback time: 15 minutes**

---

## 📞 QUESTIONS TO CONSIDER

1. **Q: Will this break mobile apps?**
   - A: No, cookies work fine with `withCredentials: true` and `credentials: 'include'`

2. **Q: What about CORS issues?**
   - A: Ensure `credentials: true` in CORS config and `withCredentials: true` in axios

3. **Q: What if we need tokens in JavaScript?**
   - A: That's the point - we DON'T. Cookies are automatic.

4. **Q: Will this affect performance?**
   - A: No measurable difference (cookies are ~1KB)

5. **Q: What about multiple tabs/windows?**
   - A: All tabs share the same cookies (automatic session sync)

6. **Q: Can we still use refresh tokens?**
   - A: Yes, better than before (in HttpOnly cookies now)

---

## 🎯 NEXT STEPS

1. **Review Documentation**
   - Read HTTPONLY_COOKIES_QUICK_START.md (40 min)
   - Reference TOKEN_SECURITY_ALTERNATIVES.md for details

2. **Implement (2-3 hours)**
   - Follow step-by-step guide
   - Copy code snippets provided
   - Test as you go

3. **Deploy**
   - Start with staging
   - Verify security (F12 inspection)
   - Promote to production

4. **Monitor**
   - Watch for 401/CORS errors
   - Verify token refresh works
   - Check cookie flags in browser

---

## 📊 BEFORE vs AFTER

### BEFORE (Current - Vulnerable)

- ❌ Tokens in localStorage (XSS accessible)
- ❌ Tokens in JSON response body (leakage)
- ❌ Tokens visible in DevTools (easy inspection)
- ❌ Tokens accessible to malicious extensions
- ❌ No CSRF protection
- 🔴 **Security Score: 2/10**

### AFTER (Recommended - Secure)

- ✅ Tokens in HttpOnly cookies (XSS proof)
- ✅ No tokens in response body (leak-proof)
- ✅ Tokens hidden in DevTools (metadata only)
- ✅ Tokens inaccessible to extensions
- ✅ SameSite=Strict CSRF protection
- 🟢 **Security Score: 9/10**

---

**Recommendation:** Implement HttpOnly Cookies this week.  
**Priority:** 🔴 HIGH  
**Effort:** 2-3 hours  
**ROI:** Eliminates critical security vulnerability

Ready to proceed? Start with HTTPONLY_COOKIES_QUICK_START.md! 🚀
