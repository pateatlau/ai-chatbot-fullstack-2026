# Production Security Checklist

## ⚠️ CRITICAL: JWT Token Storage Security

### Current State (Development)

- **Environment**: Microservices on different localhost ports
- **Problem**: Browser blocks HttpOnly cookies across different ports (same-origin policy)
- **Workaround**: JWT token stored in localStorage and sent via Authorization header
- **Security Risk**: ⚠️ **VULNERABLE TO XSS ATTACKS** - JavaScript can access token

### Required Production Configuration

#### 1. Infrastructure Setup

All services must be behind a single domain/API gateway:

```
Frontend:  https://app.example.com
API Gateway: https://api.example.com
  ├─ Auth Service:    /auth/*
  ├─ Admin Service:   /admin/*
  ├─ Chatbot Service: /chatbot/*
  └─ Profile Service: /profile/*
```

#### 2. Code Changes Required

**File: `libs/frontend/stores/src/lib/auth.store.ts`**

```typescript
// REMOVE accessToken from partialize
partialize: (state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  // accessToken: state.accessToken, // ❌ REMOVE THIS LINE
});
```

**File: `apps/admin-mfe/src/api/admin.api.ts`**

```typescript
// REMOVE the Authorization header interceptor entirely
// Or check for production and skip the header:
this.client.interceptors.request.use((config) => {
  // In production, rely on HttpOnly cookies only
  if (import.meta.env.DEV) {
    // Dev-only Authorization header code
  }
  return config;
});
```

**File: `apps/auth-mfe/src/pages/Register.tsx` & `Login.tsx`**

```typescript
// Remove accessToken parameter
setAuth(response.user); // Don't pass accessToken
```

**File: `apps/auth-service/src/controllers/auth.controller.ts`**

```typescript
// Optional: Don't return accessToken in response (only in cookie)
res.status(200).json({
  user: result.user,
  // accessToken: result.accessToken, // ❌ REMOVE - cookie is enough
  expiresIn: result.expiresIn,
  message: 'Login successful',
});
```

#### 3. Cookie Configuration for Production

Ensure cookies are configured correctly:

```typescript
res.cookie('accessToken', token, {
  httpOnly: true, // ✅ Cannot be accessed by JavaScript
  secure: true, // ✅ Only sent over HTTPS
  sameSite: 'strict', // ✅ CSRF protection (change to strict in prod)
  domain: '.example.com', // ✅ Works across subdomains
  path: '/',
  maxAge: 15 * 60 * 1000,
});
```

#### 4. Security Headers

Add these to your API gateway/reverse proxy:

```nginx
# Nginx example
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

#### 5. Environment Variables

Set these in production:

```bash
NODE_ENV=production
FRONTEND_URL=https://app.example.com
API_URL=https://api.example.com
COOKIE_DOMAIN=.example.com
```

### Security Comparison

| Aspect         | Development (Current)   | Production (Required) |
| -------------- | ----------------------- | --------------------- |
| Token Storage  | localStorage            | HttpOnly Cookie ONLY  |
| JS Access      | ✅ Yes (XSS vulnerable) | ❌ No (XSS protected) |
| Cross-Port     | Works                   | N/A (same domain)     |
| HTTPS Required | No                      | Yes                   |
| XSS Risk       | ⚠️ HIGH                 | ✅ LOW                |

### Testing Production Security

1. **Token Storage Check**

   ```javascript
   // In browser console - should return null in production
   localStorage.getItem('auth-storage');
   // Should NOT contain accessToken field
   ```

2. **Cookie Verification**
   - Open DevTools → Application → Cookies
   - Verify `accessToken` cookie has:
     - ✅ HttpOnly flag
     - ✅ Secure flag
     - ✅ SameSite = strict
     - ✅ Domain matches your production domain

3. **XSS Test**
   ```javascript
   // This should NOT work in production
   document.cookie; // Should not show accessToken
   ```

### Additional Production Hardening

1. **Content Security Policy (CSP)**
   - Prevent inline scripts
   - Whitelist allowed script sources
   - Block eval() and Function()

2. **Rate Limiting**
   - Implement on auth endpoints
   - Prevent brute force attacks

3. **CORS Configuration**
   - Only allow your production domains
   - No wildcard origins in production

4. **Token Rotation**
   - Implement token refresh mechanism
   - Short-lived access tokens (15 min)
   - Longer-lived refresh tokens (7 days)

5. **Audit Logging**
   - Log all authentication events
   - Monitor for suspicious patterns
   - Alert on multiple failed logins

## Pre-Deployment Verification

- [ ] All services deployed behind API gateway on same domain
- [ ] AccessToken removed from localStorage persistence
- [ ] Authorization header interceptor disabled in production
- [ ] HttpOnly cookies configured correctly
- [ ] HTTPS enabled and enforced
- [ ] Security headers configured
- [ ] CSP policy implemented
- [ ] Rate limiting enabled
- [ ] CORS restricted to production domains
- [ ] Token rotation working
- [ ] Audit logging in place
- [ ] XSS/CSRF protections verified
- [ ] Penetration testing completed

## References

- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
