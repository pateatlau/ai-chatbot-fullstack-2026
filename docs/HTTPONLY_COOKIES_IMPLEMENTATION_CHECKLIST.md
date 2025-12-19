# HttpOnly Cookies Implementation: Ready-to-Use Checklist

**Status:** Ready for Implementation  
**Time Estimate:** 2-3 hours  
**Difficulty:** Medium

---

## 📋 PRE-IMPLEMENTATION

- [ ] Read HTTPONLY_COOKIES_QUICK_START.md (40 min)
- [ ] Understand the current vulnerability (TOKEN_SECURITY_ALTERNATIVES.md section 1)
- [ ] Backup current code: `git checkout -b feature/secure-auth-tokens`
- [ ] Ensure all team members aware of breaking API change
- [ ] Prepare test accounts for validation

---

## 🔧 BACKEND IMPLEMENTATION (45 min)

### Install Dependencies

```bash
npm install cookie-parser
```

- [ ] Dependency installed

### Update apps/auth-service/src/main.ts

**Changes needed:**

- Import CORS and cookie-parser
- Configure CORS with `credentials: true`
- Add cookie-parser middleware

**Checklist:**

- [ ] Import statements added
- [ ] CORS configured with credentials: true
- [ ] All MFE origins in CORS list
- [ ] Production domain in CORS list
- [ ] Cookie parser added to middleware chain

**Verification:**

```bash
curl -i http://localhost:3000/auth/login
# Should show Set-Cookie headers in response
```

### Update apps/auth-service/src/controllers/auth.controller.ts

**login() method changes:**

- [ ] Remove tokens from response body
- [ ] Add res.cookie() for accessToken
  - [ ] httpOnly: true
  - [ ] secure: process.env.NODE_ENV === 'production'
  - [ ] sameSite: 'strict'
  - [ ] maxAge: 15 _ 60 _ 1000
- [ ] Add res.cookie() for refreshToken
  - [ ] httpOnly: true
  - [ ] secure: process.env.NODE_ENV === 'production'
  - [ ] sameSite: 'strict'
  - [ ] maxAge: 7 _ 24 _ 60 _ 60 _ 1000
- [ ] Response now only includes user and expiresIn

**logout() method changes:**

- [ ] Get refreshToken from req.cookies (not req.body)
- [ ] Add res.clearCookie() for accessToken
- [ ] Add res.clearCookie() for refreshToken
- [ ] Test: Cookies cleared after logout

**refreshToken() method changes:**

- [ ] Get refreshToken from req.cookies (not req.body)
- [ ] Set new accessToken cookie
- [ ] Set new refreshToken cookie
- [ ] Response doesn't include tokens

**Verification:**

```bash
# Test login
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Should show:
# Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict
# Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
# Response body should NOT contain accessToken or refreshToken
```

---

## 🎨 FRONTEND - STORE (15 min)

### Update libs/frontend/stores/src/lib/auth.store.ts

**Changes needed:**

- [ ] Remove `accessToken: string | null;` field
- [ ] Remove `refreshToken: string | null;` field
- [ ] Remove these from initial state (null)
- [ ] Remove from setAuth() parameters and logic
- [ ] Remove from clearAuth() logic
- [ ] Remove from partialize() in persist config
- [ ] Update setTokens() method (optional - may not be needed)

**Final structure should have only:**

```typescript
user: User | null;
isAuthenticated: boolean;
isLoading: boolean;
```

**Verification:**

```typescript
// After update, this should work:
const { user, isAuthenticated } = useAuthStore();

// And these should NOT exist:
// const { accessToken, refreshToken } = useAuthStore();  // ❌ Error
```

---

## 🔐 FRONTEND - AUTH SERVICE (30 min)

### Update apps/auth-mfe/src/services/auth.service.ts

**Constructor/Axios setup:**

- [ ] Add `withCredentials: true` to axios config
  ```typescript
  this.client = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // ← ADD THIS
    headers: { 'Content-Type': 'application/json' },
  });
  ```

**Response interceptor:**

- [ ] Check for 401 status
- [ ] If 401 and not already retried:
  - [ ] Set `originalRequest._retry = true`
  - [ ] Call `this.client.post('/auth/refresh')`
  - [ ] Retry original request
- [ ] On refresh failure, redirect to login

**Remove functions:**

- [ ] Delete `getAccessToken()` helper function
- [ ] Remove any manual Authorization header logic

**Update login():**

- [ ] Accepts email, password, rememberMe
- [ ] Returns `{ user, expiresIn }` (no tokens)
- [ ] Tokens automatically in cookies

**Verification:**

```typescript
// Should work:
const response = await authService.login(email, password);
console.log(response.user); // ✅ Exists
console.log(response.expiresIn); // ✅ Exists

// Should NOT work:
console.log(response.accessToken); // ❌ undefined
```

---

## 📱 FRONTEND - COMPONENTS (30 min)

### Update apps/auth-mfe/src/pages/Login.tsx

**Changes needed:**

- [ ] Update login submit handler:
  - [ ] Call authService.login() (returns no tokens)
  - [ ] Call useAuthStore.setAuth(response.user) (new signature)
  - [ ] No token extraction or localStorage manipulation
- [ ] Remove "Remember me" localStorage logic (optional)

**Verification:**

- [ ] Login page loads
- [ ] Form submission works
- [ ] Redirects to dashboard on success
- [ ] Error messages display

---

## 🔗 FRONTEND - API CLIENTS (30 min)

### Update ALL API client files:

**Files to update:**

- [ ] apps/chatbot-mfe/src/api/chatbot.api.ts
- [ ] apps/admin-mfe/src/api/admin.api.ts (if exists)
- [ ] apps/profile-mfe/src/api/profile.api.ts (if exists)
- [ ] Any other MFE API files

**For each file:**

**Constructor/Axios:**

- [ ] Add `withCredentials: true` to axios config
- [ ] Remove getAccessToken() function (if present)
- [ ] Remove manual Authorization header logic

**Interceptors:**

- [ ] Add 401 response interceptor
- [ ] Call refresh on 401
- [ ] Retry original request

**fetch() calls:**

- [ ] If using fetch (not axios):
  - [ ] Add `credentials: 'include'` option
  - [ ] Example:
    ```typescript
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include', // ← ADD THIS
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    ```

**Verification per file:**

```bash
nx serve chatbot-mfe
# Navigate to a page that makes API call
# Check F12 → Network
# ✅ Should see Cookie header in request (auto-added by browser)
# ✅ Should NOT see Authorization header with token
```

---

## ⚙️ ENVIRONMENT CONFIGURATION (10 min)

### Backend - .env

- [ ] Add `COOKIE_DOMAIN=localhost` (or your domain)
- [ ] Add `COOKIE_SECRET=dev-secret-key` (generate proper secret for prod)
- [ ] Ensure these are referenced in auth.controller.ts

### Frontend - .env.local

- [ ] Ensure `VITE_AUTH_API_URL=http://localhost:3000/api`
- [ ] Ensure `VITE_CHATBOT_API_URL=http://localhost:3001/api` (if applicable)
- [ ] Add other service URLs as needed

### Docker (if applicable)

- [ ] Update docker-compose.yml environment variables
- [ ] Ensure COOKIE_DOMAIN set correctly

---

## 🧪 TESTING CHECKLIST (30 min)

### Pre-Test

- [ ] Both backend and frontend services running
- [ ] Browser DevTools open (F12)
- [ ] Clear browser data (cookies, localStorage, cache)

### Test 1: Login Flow

```bash
# Steps:
1. [ ] Navigate to http://localhost:5173/auth/login
2. [ ] Enter valid test credentials
3. [ ] Click "Sign in"
4. [ ] Should redirect to dashboard
5. [ ] Check F12 → Application → Cookies
   [ ] ✅ Should see 'accessToken' cookie
   [ ] ✅ Should see 'refreshToken' cookie
   [ ] ✅ Both should have HttpOnly flag (✓ check)
   [ ] ✅ Both should have Secure flag
   [ ] ✅ Both should have SameSite=Strict
```

### Test 2: Token Stored Securely

```bash
# Steps:
1. [ ] Still logged in from Test 1
2. [ ] F12 → Console
3. [ ] Type: JSON.parse(localStorage.getItem('auth-storage'))
4. [ ] Output should show:
   [ ] ✅ user object (email, name, role, etc.)
   [ ] ✅ isAuthenticated: true
   [ ] ✅ NO accessToken field
   [ ] ✅ NO refreshToken field
5. [ ] Verify tokens are NOT in localStorage output
```

### Test 3: XSS Protection

```bash
# Steps:
1. [ ] F12 → Console
2. [ ] Try to access tokens via JavaScript:
   type: document.cookie
3. [ ] Should see only non-HttpOnly cookies (if any)
   [ ] ✅ HttpOnly cookies NOT shown
   [ ] ✅ Tokens NOT accessible via JavaScript
```

### Test 4: Page Refresh

```bash
# Steps:
1. [ ] Still on dashboard
2. [ ] Press F5 (refresh page)
3. [ ] Should remain logged in
4. [ ] Check: useAuthStore.user should have data
   [ ] ✅ User object populated
   [ ] ✅ isAuthenticated: true
   [ ] ✅ No 401 errors
```

### Test 5: Token Refresh

```bash
# Steps:
1. [ ] Still logged in
2. [ ] F12 → Network tab
3. [ ] Wait 15+ minutes OR manually trigger token expiry
4. [ ] Make an API call
5. [ ] Should see:
   [ ] ✅ POST /auth/refresh request (auto-triggered)
   [ ] ✅ New accessToken cookie set
   [ ] ✅ Original request retried
   [ ] ✅ Response successful (200)
```

### Test 6: Logout

```bash
# Steps:
1. [ ] Still logged in
2. [ ] Click logout button
3. [ ] Should redirect to login page
4. [ ] Check F12 → Application → Cookies
   [ ] ✅ accessToken cookie cleared
   [ ] ✅ refreshToken cookie cleared
   [ ] ✅ No cookies remain
5. [ ] Check localStorage:
   [ ] ✅ auth-storage cleared
   [ ] ✅ user set to null
   [ ] ✅ isAuthenticated: false
```

### Test 7: CSRF Protection

```bash
# Steps:
1. [ ] Open another website in different tab
2. [ ] Try to make request to your API:
   fetch('http://localhost:5173/api/conversations',
     {method: 'POST'})
3. [ ] Should fail with CORS error
   [ ] ✅ SameSite=Strict blocks request
   [ ] ✅ Cookie NOT sent to different domain
```

### Test 8: Cross-MFE Authentication

```bash
# Steps:
1. [ ] Login on Shell (localhost:5173)
2. [ ] Verify auth in console: useAuthStore.user
3. [ ] Open Chatbot MFE (localhost:5175) in new tab
4. [ ] Check Chatbot's useAuthStore.user
   [ ] ✅ Should have user data
   [ ] ✅ Should show isAuthenticated: true
5. [ ] Repeat for other MFEs
   [ ] ✅ All MFEs share same auth state
```

### Test 9: API Calls

```bash
# Steps:
1. [ ] Logged in
2. [ ] Make API call (e.g., get conversations)
3. [ ] F12 → Network tab
4. [ ] Inspect request headers:
   [ ] ✅ Cookie header present with tokens
   [ ] ✅ Authorization header NOT needed
5. [ ] Response should be successful (200)
```

### Test 10: Error Handling

```bash
# Steps:
1. [ ] Manually delete accessToken cookie (F12 → Cookies → Delete)
2. [ ] Make API call
3. [ ] Should trigger refresh:
   [ ] ✅ 401 response
   [ ] ✅ Auto-calls POST /auth/refresh
   [ ] ✅ New token set
   [ ] ✅ Request retried
   [ ] ✅ Final response successful
```

---

## 📊 VALIDATION CHECKLIST

### Security Validation

- [ ] Tokens NOT in localStorage
- [ ] Tokens NOT in JSON response
- [ ] Tokens NOT accessible via JavaScript
- [ ] HttpOnly flag set on cookies
- [ ] Secure flag set on cookies
- [ ] SameSite=Strict set on cookies
- [ ] CSRF protection working

### Functionality Validation

- [ ] Login works
- [ ] Page refresh maintains session
- [ ] Token refresh works
- [ ] Logout clears cookies
- [ ] All MFEs share auth context
- [ ] API calls include tokens
- [ ] Error handling (401) works

### Browser Compatibility

- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅

---

## 🚀 DEPLOYMENT

### Staging Deployment

- [ ] Build backend: `nx build auth-service`
- [ ] Build frontend: `nx build shell`
- [ ] Deploy to staging environment
- [ ] Run full test suite again
- [ ] Verify in F12 DevTools
- [ ] Monitor logs for errors

### Production Deployment

- [ ] Create git commit with message: "feat: migrate JWT storage to HttpOnly cookies"
- [ ] Create pull request
- [ ] Code review
- [ ] Merge to main
- [ ] Deploy to production
- [ ] Monitor errors (401, CORS, etc.)
- [ ] Check application logs

### Monitoring

- [ ] Watch error logs for 401 errors (shouldn't increase)
- [ ] Watch error logs for CORS errors (shouldn't increase)
- [ ] Monitor API performance (should be same or better)
- [ ] Check user reports for authentication issues

---

## ✅ POST-IMPLEMENTATION

- [ ] All tests passing
- [ ] Security validation complete
- [ ] No user-facing errors
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Team trained on new architecture
- [ ] Update API documentation (no tokens in response body)
- [ ] Update developer guide (localStorage not used for tokens)

---

## 🔄 ROLLBACK PROCEDURE (If Needed)

If critical issues arise:

```bash
# 1. Revert code
git revert <commit-hash>

# 2. Rebuild and redeploy
nx build auth-service
nx build shell
# Deploy previous version

# 3. Verify
# - Check cookies cleared
# - Check login works
# - Check API works

# 4. Analyze what went wrong
# - Check logs
# - Check CORS config
# - Check cookie settings

# 5. Fix and retry
```

**Estimated rollback time: 15 minutes**

---

## 📝 NOTES

**Important:**

- This is a BREAKING CHANGE for API clients
- All frontend services must be updated together
- Backend must be updated first (or alongside)
- Test thoroughly before production

**Tips:**

- Use `withCredentials: true` in axios, not just in one place
- Use `credentials: 'include'` with fetch API
- Verify CORS credentials setting is true
- Test in incognito window to ensure cookies work fresh

**Common Issues:**

- 401 errors: Check withCredentials in axios
- Cookies not set: Check CORS credentials: true
- CORS errors: Check origin in CORS config
- Token not refreshing: Check interceptor is set up

---

**Ready to start? Begin with step 1 of Backend Implementation above! 🚀**
