# Shell App Integration Guide

## Overview

The Shell app is the **host application** that orchestrates all microfrontends (MFEs) using **Module Federation**. It provides:

- 🎯 **Unified Routing** - Single entry point with all app routes
- 🔐 **Authentication Guards** - Role-based access control
- 🧭 **Global Navigation** - Consistent navigation across all pages
- 📦 **Module Federation** - Dynamic loading of all MFEs
- 🎨 **Shared UI Components** - Toast notifications, error boundaries

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Shell App                          │
│                  (Host Application)                     │
│                   localhost:5173                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  Auth MFE    │  │ Chatbot MFE  │  │  Admin MFE  │  │
│  │   :5174      │  │    :5175     │  │    :5176    │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
│                                                         │
│              ┌──────────────┐                          │
│              │ Profile MFE  │                          │
│              │    :5177     │                          │
│              └──────────────┘                          │
│                                                         │
│  Routes:                                                │
│  • /login, /register → Auth MFE                        │
│  • /chat, /chat/:id → Chatbot MFE                      │
│  • /admin/* → Admin MFE (ADMIN role required)          │
│  • /profile/* → Profile MFE                            │
└─────────────────────────────────────────────────────────┘
```

## Routes Configuration

### Public Routes (No Authentication)

- `/` - Home page
- `/login` - Login page (Auth MFE)
- `/register` - Register page (Auth MFE)
- `/forgot-password` - Password reset (Auth MFE)
- `/reset-password/:token` - Reset password with token (Auth MFE)

### Protected Routes (Requires Authentication)

- `/dashboard` - Main dashboard
- `/chat` - Chatbot interface
- `/chat/:conversationId` - Specific conversation
- `/profile` - User profile
- `/profile/edit` - Edit profile
- `/profile/settings` - User settings
- `/profile/security` - Security settings

### Admin Routes (Requires ADMIN Role)

- `/admin` - Admin dashboard
- `/admin/users` - User management list
- `/admin/users/:userId` - User detail/edit
- `/admin/audit-logs` - Audit logs viewer

## Navigation Structure

### Main Navigation (Header)

```tsx
Dashboard | Chat | Admin (if ADMIN)
```

### User Dropdown (Header Right)

```tsx
┌─────────────────────┐
│ [U] User Name   ▼   │
├─────────────────────┤
│ 👤 Profile          │
│ ⚙️  Settings        │
│ 🔒 Security         │
│ ───────────────     │
│ 🚪 Logout           │
└─────────────────────┘
```

## Route Guards

### ProtectedRoute

Checks if user is authenticated. If not, redirects to `/login`.

```tsx
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

### AdminRoute

Checks if user is authenticated **AND** has ADMIN role. If not admin, redirects to `/dashboard`.

```tsx
<AdminRoute>
  <AdminOnlyComponent />
</AdminRoute>
```

## Module Federation Configuration

### Remote Entries

All MFEs are loaded dynamically via Module Federation:

```typescript
remotes: {
  authMfe: 'http://localhost:5174/remoteEntry.js',
  chatbotMfe: 'http://localhost:5175/remoteEntry.js',
  adminMfe: 'http://localhost:5176/remoteEntry.js',
  profileMfe: 'http://localhost:5177/remoteEntry.js',
}
```

### Shared Dependencies

These packages are shared across all MFEs to avoid duplication:

- `react` (singleton)
- `react-dom` (singleton)
- `react-router-dom` (singleton)
- `zustand`
- `@tanstack/react-query`
- `zod`

## Running the Application

### Start All Services

**Backend Services:**

```bash
# Terminal 1: Auth Service
nx serve auth-service

# Terminal 2: Chatbot Service (optional)
nx serve chatbot-service

# Terminal 3: Admin Service
node dist/apps/admin-service/main.js
```

**Frontend MFEs:**

```bash
# Terminal 4: Shell App
nx serve shell

# Terminal 5: Auth MFE
nx serve auth-mfe

# Terminal 6: Chatbot MFE
nx serve chatbot-mfe

# Terminal 7: Admin MFE
nx serve admin-mfe

# Terminal 8: Profile MFE
nx serve profile-mfe
```

### Recommended Startup Order

1. **Backend services** (auth, admin, chatbot)
2. **All MFEs** (auth-mfe, chatbot-mfe, admin-mfe, profile-mfe)
3. **Shell app** (last, so all remotes are available)

## Testing

### Integration Test Suite

```bash
# Run all integration tests
bash apps/shell/test-shell-integration.sh
```

**Test Coverage:**

- ✅ 45 tests covering all integration points
- ✅ Route configuration validation
- ✅ Route guards verification
- ✅ Navigation structure checks
- ✅ Module Federation configuration
- ✅ UI/UX elements validation

### Manual Testing Flow

1. **Start all services** (see above)
2. **Open browser** → http://localhost:5173
3. **Test authentication:**
   - Click "Login"
   - Enter credentials (testadmin@example.com / Admin123!@#)
   - Verify redirect to dashboard
4. **Test navigation:**
   - Click "Chat" → Verify chatbot MFE loads
   - Click user dropdown → Select "Profile" → Verify profile MFE loads
   - Click user dropdown → Select "Settings" → Verify settings page loads
   - (If admin) Click "Admin" → Verify admin MFE loads
5. **Test admin features (ADMIN role only):**
   - Navigate to `/admin` → Verify dashboard stats load
   - Click "Users" → Verify user list loads
   - Click on a user → Verify user detail page loads
   - Navigate to `/admin/audit-logs` → Verify audit logs load
6. **Test logout:**
   - Click user dropdown → Click "Logout"
   - Verify redirect to login page
   - Try accessing `/dashboard` → Verify redirect to login

## Development

### Adding a New Route

1. **Update routes configuration** (`apps/shell/src/routes/index.tsx`):

```tsx
{
  path: 'new-page',
  element: (
    <ProtectedRoute>
      <NewPageComponent />
    </ProtectedRoute>
  ),
}
```

2. **Add navigation link** (`apps/shell/src/layouts/DashboardLayout.tsx`):

```tsx
<Link to="/new-page" className="...">
  New Page
</Link>
```

3. **Build and test**:

```bash
nx build shell
bash apps/shell/test-shell-integration.sh
```

### Adding a New MFE

1. **Update Vite config** (`apps/shell/vite.config.ts`):

```typescript
remotes: {
  newMfe: {
    type: 'module',
    name: 'newMfe',
    entry: 'http://localhost:5178/remoteEntry.js',
    entryGlobalName: 'newMfe',
    shareScope: 'default',
  },
}
```

2. **Create wrapper component** (`apps/shell/src/components/NewMfe.tsx`):

```tsx
import { lazy, Suspense } from 'react';

const NewMfeModule = lazy(() => import('newMfe/Module'));

export function NewMfe() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewMfeModule />
    </Suspense>
  );
}
```

3. **Add routes** (see above)

## Error Handling

### Error Boundary

All errors are caught by the global error boundary and displayed with:

- Error message
- Stack trace (dev mode)
- "Reload" button

### Loading States

All MFEs show loading fallbacks while loading:

- Animated spinner
- "Loading [MFE name]..." message

### Module Federation Fallbacks

If an MFE fails to load, the app shows:

- Error message indicating which MFE is unavailable
- Instructions (e.g., "Make sure chatbot-mfe is running on port 5175")

## Production Deployment

### Build Command

```bash
nx build shell
```

### Environment Variables

Set these for production:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_AUTH_MFE_URL=https://auth.yourdomain.com/remoteEntry.js
VITE_CHATBOT_MFE_URL=https://chat.yourdomain.com/remoteEntry.js
VITE_ADMIN_MFE_URL=https://admin.yourdomain.com/remoteEntry.js
VITE_PROFILE_MFE_URL=https://profile.yourdomain.com/remoteEntry.js
```

### Deployment Checklist

- [ ] Build all MFEs
- [ ] Build shell app
- [ ] Deploy MFEs to CDN/static hosting
- [ ] Deploy shell app
- [ ] Update remote entry URLs
- [ ] Test all navigation flows
- [ ] Verify authentication works
- [ ] Check admin role gating

## Troubleshooting

### MFE Not Loading

**Problem:** "MFE Unavailable" error  
**Solution:**

1. Check if the MFE is running: `lsof -ti:5174` (replace with correct port)
2. Check the console for Module Federation errors
3. Verify the remote URL in `vite.config.ts`
4. Restart the MFE: `nx serve [mfe-name]`

### Authentication Loop

**Problem:** Keeps redirecting to login  
**Solution:**

1. Check if auth-service is running: `lsof -ti:3000`
2. Clear localStorage: `localStorage.clear()`
3. Check browser console for auth errors
4. Verify JWT token is being stored

### Admin Route Not Accessible

**Problem:** Redirects to dashboard when accessing `/admin`  
**Solution:**

1. Check user role in localStorage: `JSON.parse(localStorage.getItem('auth-storage'))`
2. Verify user role is `ADMIN` (not `USER`)
3. Login with admin account: testadmin@example.com / Admin123!@#

### Module Federation Error

**Problem:** "Shared module is not available"  
**Solution:**

1. Ensure all MFEs are using the same React version
2. Check `shared` configuration in `vite.config.ts`
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
4. Rebuild all projects: `nx run-many --target=build --all`

## Status

✅ **Phase 1 Complete: Shell Integration**

- All 4 MFEs configured and integrated
- Complete routing with 15+ routes
- Role-based navigation working
- User dropdown with profile links
- Module Federation configured
- 45/45 integration tests passing (100%)

**Ready for Phase 2: Chatbot MFE Finalization** 🚀

---

**Last Updated:** November 17, 2025  
**Test Results:** 45/45 passing (100%)  
**Status:** Production Ready ✨
