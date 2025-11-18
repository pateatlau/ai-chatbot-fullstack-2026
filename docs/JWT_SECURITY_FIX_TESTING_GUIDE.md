# JWT Security Fix - Testing Guide

**Purpose:** Quick reference for testing the HttpOnly cookie authentication implementation
**Audience:** QA, Testers, DevOps
**Last Updated:** 2024

---

## Quick Start Testing

### Test Environment Setup

```bash
# Start backend services
npm run dev:backend

# Start frontend services (in separate terminals)
npm run dev:auth-mfe
npm run dev:chatbot-mfe
npm run dev:shell

# Run tests
npm run test -- auth-service          # Integration tests
npm run test:e2e                      # E2E tests
npm run test:e2e:headed              # E2E with visual
```

---

## Browser DevTools Verification

### Cookies Tab (Application → Cookies)

After login, you should see:

| Cookie Name    | Value     | HttpOnly | Secure                  | SameSite |
| -------------- | --------- | -------- | ----------------------- | -------- |
| `accessToken`  | `eyJ0...` | ✅ Yes   | ⚠️ (dev: no, prod: yes) | Strict   |
| `refreshToken` | `eyJ0...` | ✅ Yes   | ⚠️ (dev: no, prod: yes) | Strict   |

**What to check:**

- ✅ Both cookies present after login
- ✅ HttpOnly: true (JavaScript cannot see value)
- ✅ SameSite: Strict (CSRF protection)
- ✅ Secure: false in dev, true in production
- ✅ Path: /
- ✅ Domain: localhost (dev) or your domain (prod)

### localStorage Tab (Application → Storage)

Should contain `auth-storage` with:

```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "..."
  },
  "isAuthenticated": true
}
```

**What to check:**

- ✅ NO `accessToken` field
- ✅ NO `refreshToken` field
- ✅ User data present
- ✅ isAuthenticated: true

---

## API Request Verification

### Network Tab - Login Request

1. Click Network tab
2. Login with credentials
3. Find POST `/api/auth/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response Headers (should have):**

```
Set-Cookie: accessToken=...; HttpOnly; Path=/; SameSite=Strict
Set-Cookie: refreshToken=...; HttpOnly; Path=/; SameSite=Strict
```

**Response Body (should NOT have):**

```json
{
  "user": { ... },
  "expiresIn": 900,
  "message": "Login successful"
  // NO accessToken
  // NO refreshToken
}
```

### Network Tab - Subsequent Requests

After login, make API requests:

1. Verify Cookie header is sent automatically:

```
Cookie: accessToken=...; refreshToken=...
```

2. Verify NO Authorization header
3. Verify request succeeds (200 OK)

---

## Test Cases

### Test 1: Login Flow

**Steps:**

1. Navigate to /login
2. Enter valid email and password
3. Click "Sign in"

**Expected Results:**

- ✅ Redirected to /dashboard
- ✅ User name displayed in header
- ✅ Cookies set in DevTools
- ✅ NO tokens in localStorage
- ✅ API requests succeed with cookies

**Pass/Fail:** ****\_\_\_****

---

### Test 2: Register Flow

**Steps:**

1. Navigate to /register
2. Fill in all required fields
3. Click "Create account"

**Expected Results:**

- ✅ Account created
- ✅ Redirected to login page (NOT dashboard)
- ✅ Can login with new credentials
- ✅ After login, cookies set
- ✅ User data in localStorage

**Pass/Fail:** ****\_\_\_****

---

### Test 3: Logout Flow

**Steps:**

1. Login with valid credentials
2. Click logout button
3. Verify redirected to login page

**Expected Results:**

- ✅ Cookies cleared from DevTools
- ✅ localStorage cleared (isAuthenticated: false)
- ✅ Cannot access protected pages
- ✅ API requests return 401
- ✅ Redirect to login on 401

**Pass/Fail:** ****\_\_\_****

---

### Test 4: Token Refresh

**Steps:**

1. Login
2. Wait for access token to expire (15 minutes)
3. Try to access protected resource

**Expected Results:**

- ✅ New access token issued
- ✅ Refresh token still valid
- ✅ Can continue using app
- ✅ No interruption to user experience

**Pass/Fail:** ****\_\_\_****

---

### Test 5: Cross-MFE Authentication

**Steps:**

1. Login in auth-mfe
2. Navigate to chatbot-mfe
3. Access protected chatbot endpoint

**Expected Results:**

- ✅ Authenticated in chatbot-mfe
- ✅ Cookies sent automatically
- ✅ API calls succeed
- ✅ No need to login again
- ✅ Same user data across MFEs

**Pass/Fail:** ****\_\_\_****

---

### Test 6: Session Persistence

**Steps:**

1. Login
2. Close browser tab (NOT browser)
3. Reopen tab and go to dashboard

**Expected Results:**

- ✅ User still logged in
- ✅ User data from localStorage
- ✅ Cookies still valid (not expired)
- ✅ API requests work

**Pass/Fail:** ****\_\_\_****

---

### Test 7: Session Expiry

**Steps:**

1. Login
2. Wait 15 minutes (or manually trigger token refresh)
3. Check if app still works

**Expected Results:**

- ✅ Access token refreshed automatically
- ✅ No interruption to user
- ✅ Refresh token still valid
- ✅ Can work for full 7 days

**Pass/Fail:** ****\_\_\_****

---

### Test 8: Logout from All Tabs

**Steps:**

1. Login in tab A
2. Open tab B to same app
3. Both tabs show logged in
4. Logout in tab A
5. Refresh tab B

**Expected Results:**

- ✅ Tab A: Redirected to login
- ✅ Tab B: Cookies cleared after refresh
- ✅ Tab B: Cannot access protected pages
- ✅ Both tabs sync correctly

**Pass/Fail:** ****\_\_\_****

---

### Test 9: CORS Preflight Requests

**Steps:**

1. Open Network tab
2. Login
3. Make API request from different origin (if applicable)

**Expected Results:**

- ✅ OPTIONS request succeeds (200 OK)
- ✅ Response includes CORS headers
- ✅ Actual request succeeds
- ✅ Cookies sent with request

**Pass/Fail:** ****\_\_\_****

---

### Test 10: XSS Vulnerability Check

**Steps:**

1. Open DevTools Console
2. Try to access token:

```javascript
// This should fail or be undefined
console.log(document.cookie);
```

**Expected Results:**

- ✅ Cookie value NOT accessible
- ✅ Document.cookie empty or has no accessToken
- ✅ HttpOnly flag prevents access
- ✅ JavaScript cannot steal token

**Pass/Fail:** ****\_\_\_****

---

### Test 11: Remember Me Functionality

**Steps:**

1. Login with "Remember me" checked
2. Close browser
3. Reopen browser

**Expected Results:**

- ✅ User info in localStorage
- ✅ "Remember me" preference saved
- ✅ User remains logged in
- ✅ Can continue without re-login

**Pass/Fail:** ****\_\_\_****

---

### Test 12: Multiple Devices

**Steps:**

1. Login on Device A
2. Login on Device B
3. Logout on Device A

**Expected Results:**

- ✅ Device A: Logged out
- ✅ Device B: Still logged in (separate session)
- ✅ Each device has separate cookies
- ✅ Logout on one device doesn't affect others

**Pass/Fail:** ****\_\_\_****

---

## Browser Compatibility

Test on:

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Compatibility Issues Found:**

---

---

## Performance Testing

### Login Time

- Expected: < 1000ms
- Actual: **\_\_**ms
- Status: ✅ / ⚠️ / ❌

### API Response Time

- Expected: < 500ms
- Actual: **\_\_**ms
- Status: ✅ / ⚠️ / ❌

### Token Refresh Time

- Expected: < 500ms
- Actual: **\_\_**ms
- Status: ✅ / ⚠️ / ❌

### Memory Usage

- Before: **\_\_**MB
- After: **\_\_**MB
- Change: **\_\_**MB
- Status: ✅ / ⚠️ / ❌

---

## Security Testing

### XSS Protection

- ✅ / ❌ HttpOnly flag prevents token access
- ✅ / ❌ JavaScript cannot read cookie value
- ✅ / ❌ Script injection cannot steal token

### CSRF Protection

- ✅ / ❌ SameSite=Strict blocks cross-origin
- ✅ / ❌ No CSRF tokens needed
- ✅ / ❌ POST from different origin blocked

### HTTPS Enforcement

- ✅ / ❌ Secure flag set in production
- ✅ / ❌ HTTP fallback fails in production
- ✅ / ❌ HSTS headers present

### Session Security

- ✅ / ❌ Session fixed on logout
- ✅ / ❌ Token blacklist works
- ✅ / ❌ Expired tokens rejected

---

## Integration Tests

### Command

```bash
npm run test -- auth-service
```

### Expected Output

```
PASS auth-service
  ✓ POST /api/auth/login (XX ms)
  ✓ POST /api/auth/register (XX ms)
  ✓ POST /api/auth/logout (XX ms)
  ✓ POST /api/auth/refresh (XX ms)
  ✓ GET /api/auth/me (XX ms)
  ...
  ✓ XX tests passed
```

### Results

- Total Tests: **\_\_**
- Passed: **\_\_**
- Failed: **\_\_**
- Status: ✅ / ⚠️ / ❌

### Failed Tests

If any failed, list them:

1. ***
2. ***
3. ***

---

## E2E Tests

### Command

```bash
npm run test:e2e
```

### Expected Output

```
Running 15 tests
  ✓ auth login flow (XXs)
  ✓ auth register flow (XXs)
  ✓ auth logout flow (XXs)
  ✓ protected page access (XXs)
  ...
  ✓ 15 tests passed
```

### Results

- Total Tests: **\_\_**
- Passed: **\_\_**
- Failed: **\_\_**
- Status: ✅ / ⚠️ / ❌

### Failed Tests

If any failed, list them:

1. ***
2. ***
3. ***

---

## Known Issues Found

| Issue                    | Severity | Workaround         | Status |
| ------------------------ | -------- | ------------------ | ------ |
| Example: Cookies not set | High     | Clear localStorage | Open   |
|                          |          |                    |        |
|                          |          |                    |        |

---

## Sign-Off

### QA Lead

- Name: ******\_\_\_******
- Date: ******\_\_\_******
- Status: ✅ PASS / ⚠️ CONDITIONAL / ❌ FAIL

### Notes

---

---

### Recommendations

---

---

---

## Rollback Plan

If critical issues found:

1. **Stop Services**

   ```bash
   npm run kill:all
   ```

2. **Revert Code**

   ```bash
   git revert <commit-hash>
   ```

3. **Rebuild**

   ```bash
   npm run build
   ```

4. **Restart**
   ```bash
   npm run dev
   ```

---

## Next Steps

- [ ] All tests passing
- [ ] All manual checks verified
- [ ] Security review approved
- [ ] Performance acceptable
- [ ] Browser compatibility confirmed
- [ ] Ready for staging deployment

**Gate Approval:** ******\_\_\_******
**Date:** ******\_\_\_******
