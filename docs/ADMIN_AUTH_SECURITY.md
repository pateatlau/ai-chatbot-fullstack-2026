# Admin Authentication & Security - Complete Guide

**Status:** ✅ All Issues Resolved  
**Last Updated:** November 22, 2025

---

## Overview

This document consolidates all admin authentication security fixes, including role-based access control (RBAC) and JWT token handling for admin routes.

---

## The Problem

Admin users could not access `/admin` routes. After login, navigating to admin pages resulted in:

- 401 Unauthorized errors
- Automatic logout and redirect to `/login`
- "No token provided" error messages

---

## Root Causes & Fixes

### 1. Missing Role Guards (FIXED)

**Problem:** Admin pages had no role validation, relying only on shell-level route guards.

**Fix:** Added defense-in-depth role validation:

```typescript
// Layer 1: Shell route guard (AdminRoute component)
// Layer 2: MFE root guard (AppContent in app.tsx)
// Layer 3: Page-level guards (each admin page)

// Example in AdminDashboardPage.tsx:
function AdminDashboardPageContent() {
  useRequireRole('ADMIN'); // Validates role, redirects if unauthorized
  // ... page content
}
```

**Files Modified:**

- `apps/admin-mfe/src/app/app.tsx` - Added MFE root guard
- `apps/admin-mfe/src/pages/AdminDashboardPage.tsx` - Added page guard
- `apps/admin-mfe/src/pages/UserManagementPage.tsx` - Added page guard
- `apps/admin-mfe/src/pages/UserDetailPage.tsx` - Added page guard
- `apps/admin-mfe/src/pages/AuditLogsPage.tsx` - Added page guard

---

### 2. Inconsistent Token Handling (FIXED)

**Problem:** Admin-service auth middleware only checked `Authorization` header, not cookies (unlike auth-service).

**Fix:** Updated middleware to check both token sources:

```typescript
// apps/admin-service/src/middleware/auth.middleware.ts
let token: string | null = null;

// Try Authorization header first (for API calls)
if (authHeader && authHeader.startsWith('Bearer ')) {
  token = authHeader.substring(7);
}
// Fall back to HttpOnly cookie (for same-domain)
else if (req.cookies?.accessToken) {
  token = req.cookies.accessToken;
}
```

**Files Modified:**

- `apps/admin-service/src/middleware/auth.middleware.ts` - Added cookie fallback
- `apps/admin-service/src/main.ts` - Added `cookie-parser` middleware

---

### 3. Token Persistence Strategy (CONTEXT)

**Development Environment:**

- Services run on different ports (shell: 5173, admin-service: 3002)
- Browsers block cookies cross-port (same-origin policy)
- **Solution:** Store tokens in localStorage + send via `Authorization` header
- Admin-mfe reads token from auth store → adds to request headers

**Production Environment:**

- All services behind API gateway on same domain
- HttpOnly cookies work across services
- **Solution:** Rely on HttpOnly cookies (more secure)
- Tokens NOT accessible to JavaScript (XSS protection)

**Implementation:**

```typescript
// libs/frontend/stores/src/lib/auth.store.ts
setAuth: (user, accessToken, refreshToken) => {
  set({
    user,
    accessToken: accessToken || null, // Stored for dev cross-port API calls
    refreshToken: refreshToken || null,
    isAuthenticated: true,
  });
},

partialize: (state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  accessToken: state.accessToken,    // Persisted to localStorage
  refreshToken: state.refreshToken,  // Also in HttpOnly cookies
})
```

---

### 4. Improved 401 Error Handling (FIXED)

**Problem:** Any 401 error immediately logged out the user, even if they were already logged out.

**Fix:** Check auth state before clearing:

```typescript
// apps/admin-mfe/src/api/admin.api.ts
if (error.response?.status === 401) {
  const { user, isAuthenticated, clearAuth } = useAuthStore.getState();

  // Only logout if user is actually authenticated
  if (user && isAuthenticated) {
    clearAuth();
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
}
```

---

## Security Architecture

### Defense-in-Depth Layers

```
┌─────────────────────────────────────────┐
│ Layer 1: Shell Route Guard (AdminRoute)│
│ - Checks isAuthenticated                │
│ - Checks user.role === 'ADMIN'          │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Layer 2: MFE Root Guard (AppContent)    │
│ - useRequireRole('ADMIN')                │
│ - Validates before any MFE routes render│
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Layer 3: Page Guards (Each Component)   │
│ - useRequireRole('ADMIN')                │
│ - Per-page role validation               │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Layer 4: API Middleware (Backend)       │
│ - authMiddleware: Validates JWT          │
│ - adminMiddleware: Checks role === ADMIN │
└─────────────────────────────────────────┘
```

### Token Flow

**Login:**

```
1. User submits credentials
2. Auth-service validates → generates JWT
3. Sets HttpOnly cookies (accessToken, refreshToken)
4. Returns user object (NO tokens in response)
5. Frontend stores user in auth store
6. Tokens persist to localStorage (dev) + cookies (prod)
```

**API Request:**

```
1. Admin page calls adminAPI.getStats()
2. Request interceptor reads token from localStorage
3. Adds: Authorization: Bearer <token>
4. Request sent to admin-service
5. Auth middleware checks:
   - Authorization header first ✓
   - Falls back to req.cookies.accessToken
6. JWT verified → request succeeds
```

---

## Testing

### Manual Test

1. **Login as admin:**

   ```
   URL: http://localhost:5173/login
   Email: admin@example.com
   Password: admin123
   ```

2. **Navigate to admin:**

   ```
   URL: http://localhost:5173/admin
   ```

3. **Expected results:**
   - ✅ Page stays on `/admin` (no redirect)
   - ✅ Dashboard displays statistics
   - ✅ No 401 errors in console
   - ✅ No error toasts

4. **Verify token in DevTools:**
   - Network tab → Find `GET /api/admin/stats`
   - Request Headers should show:
     ```
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

### Automated Test

```bash
./test-admin-auth.sh
```

Tests:

- ✅ Authorization header authentication
- ✅ Cookie authentication (fallback)
- ✅ Unauthorized request rejection

---

## Security Considerations

### Development (Current)

**Strategy:** localStorage + Authorization header

**Trade-offs:**

- ⚠️ Token accessible to JavaScript (XSS risk)
- ✅ Works cross-port in development
- ✅ Acceptable for dev environment

**Why:** Cross-port cookie restrictions require this workaround.

### Production (Recommended)

**Strategy:** HttpOnly cookies only

**Benefits:**

- ✅ XSS protection: Token NOT accessible to JavaScript
- ✅ CSRF protection: SameSite=Strict cookie attribute
- ✅ Secure transport: HTTPS + Secure flag
- ✅ Industry best practice

**Production Checklist:**

- [ ] All services behind API gateway on same domain
- [ ] HttpOnly cookies working (test same-origin)
- [ ] CONSIDER: Remove localStorage token persistence
- [ ] CONSIDER: Remove Authorization header logic
- [ ] Verify CORS allows credentials
- [ ] Ensure cookies have `Secure` flag

---

## Key Learnings

### 1. Middleware Consistency

All services handling authentication should use **identical token extraction logic**. Inconsistencies cause hard-to-debug 401 errors.

### 2. Cookie Parser Required

If middleware checks `req.cookies`, you MUST have `cookie-parser` middleware installed. Otherwise `req.cookies` is always `undefined`.

### 3. Defense-in-Depth

Multiple validation layers prevent security gaps:

- Shell guards prevent route access
- MFE guards prevent component rendering
- Page guards prevent content display
- API middleware prevents unauthorized data access

### 4. Environment-Specific Strategies

Different environments need different auth approaches:

- Dev: localStorage + headers (cross-port workaround)
- Prod: HttpOnly cookies (more secure)

---

## Files Modified

### Backend (2 files)

1. `apps/admin-service/src/middleware/auth.middleware.ts` - Added cookie fallback
2. `apps/admin-service/src/main.ts` - Added cookie-parser middleware

### Frontend (6 files)

1. `apps/admin-mfe/src/app/app.tsx` - Added MFE root guard
2. `apps/admin-mfe/src/pages/AdminDashboardPage.tsx` - Added page guard
3. `apps/admin-mfe/src/pages/UserManagementPage.tsx` - Added page guard
4. `apps/admin-mfe/src/pages/UserDetailPage.tsx` - Added page guard
5. `apps/admin-mfe/src/pages/AuditLogsPage.tsx` - Added page guard
6. `apps/admin-mfe/src/api/admin.api.ts` - Improved 401 handling

### Shared (1 file)

1. `libs/frontend/stores/src/lib/auth.store.ts` - Token persistence for dev

---

## Quick Reference

### Restart Backend Services

```bash
# Stop services (Ctrl+C)
npm run dev:backend
```

### Check Admin Service Health

```bash
curl http://localhost:3002/health
```

### View Auth Store in Browser

```javascript
// Console
localStorage.getItem('auth-storage');
```

### Create Admin User (if needed)

```bash
# Use Prisma Studio
npx prisma studio

# Navigate to User table
# Change role to "ADMIN"
```

---

## Status

- [x] All root causes identified
- [x] Defense-in-depth role guards implemented
- [x] Admin-service auth middleware updated
- [x] Cookie-parser middleware added
- [x] Token persistence strategy implemented
- [x] 401 error handling improved
- [x] All 21 projects building successfully
- [x] Manual testing successful
- [x] Admin routes fully functional

**Current State:** ✅ **FULLY OPERATIONAL**
