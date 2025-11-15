# Frontend Hooks Library

Custom React hooks for the AI Chatbot application providing clean abstractions for authentication, API calls, and toast notifications.

## 📦 Installation

Import from `@ai-chatbot/hooks`:

```typescript
import { useAuth, useToast, useApi } from '@ai-chatbot/hooks';
```

## 🎯 Available Hooks

### 1. useAuth

Authentication hook with login, registration, logout, and role checking.

```tsx
const { user, isAuthenticated, login, logout, hasRole, isAdmin } = useAuth();

// Login
await login({ email: 'user@example.com', password: 'pass123' });

// Register
await register({ email, password, name, role: 'USER' });

// Logout
await logout();

// Check roles
if (hasRole('ADMIN')) {
  /* admin content */
}
if (hasRole(['ADMIN', 'MODERATOR'])) {
  /* moderator content */
}
```

### 2. useRequireAuth

Auto-redirect if not authenticated.

```tsx
const { user } = useRequireAuth(); // Redirects to /login if not authenticated
```

### 3. useRequireRole

Auto-redirect if missing required role.

```tsx
const { user } = useRequireRole('ADMIN'); // Redirects if not admin
const { user } = useRequireRole(['ADMIN', 'MODERATOR']); // Multiple roles (OR)
```

### 4. useToast

Clean toast notification interface.

```tsx
const toast = useToast();

toast.success('Operation successful!');
toast.error('Something went wrong');
toast.warning('Please be careful');
toast.info('FYI: New updates available');

// Custom duration
toast.success('Saved!', 10000); // 10 seconds

// Dismiss all
toast.dismissAll();
```

### 5. useAsyncToast

Promise-based toasts for async operations.

```tsx
const toast = useAsyncToast();

await toast.promise(saveUserData(), {
  loading: 'Saving...',
  success: 'Saved successfully!',
  error: 'Failed to save',
});
```

### 6. useApi

API calls with auth, token refresh, and error handling.

```tsx
const { get, post, put, patch, del } = useApi();

// GET with auto auth headers
const users = await get<User[]>('/users');

// POST with success toast
await post('/users', userData, {
  showSuccessToast: true,
  successMessage: 'User created!',
});

// DELETE
await del('/users/123');

// Custom error handling
await get('/admin/data', {
  onError: (error) => {
    if (error.response?.status === 403) navigate('/forbidden');
  },
});

// Disable error toasts
const api = useApi({ showErrorToast: false });
```

### 7. usePublicApi

API calls without authentication (for public endpoints).

```tsx
const { get } = usePublicApi();
const announcements = await get('/public/announcements');
```

## 🔄 Migration Example

**Before** (direct store usage):

```tsx
import { useAuthStore, useToastStore } from '@myapp/frontend/stores';
import axios from 'axios';

const { setAuth } = useAuthStore();
const { addToast } = useToastStore();

try {
  const response = await axios.post('/api/auth/login', data);
  setAuth(
    response.data.user,
    response.data.accessToken,
    response.data.refreshToken
  );
  addToast('Login successful!', 'success');
} catch (err) {
  addToast(err.response?.data?.message || 'Login failed', 'error');
}
```

**After** (with hooks):

```tsx
import { useAuth, useToast } from '@ai-chatbot/hooks';

const { login } = useAuth();
const toast = useToast();

try {
  await login(data);
  toast.success('Login successful!');
} catch (error) {
  toast.error(error.message);
}
```

## ✨ Benefits

- ✅ Cleaner, more readable code
- ✅ Better error messages
- ✅ Automatic token management
- ✅ Auto token refresh on 401
- ✅ Consistent API across app
- ✅ Easier to test
- ✅ TypeScript support
- ✅ Built-in toast notifications

## 🏗️ Architecture

```
Components → Custom Hooks (this library) → Zustand Stores
```

## 📚 Related Libraries

- `@myapp/frontend/stores` - Zustand stores
- `@myapp/frontend/ui-components` - UI components
- `@myapp/frontend/mocks` - MSW mocks

## ✅ Best Practices

```tsx
// ✅ Do: Use hooks
const { login } = useAuth();
const toast = useToast();

// ✅ Do: Handle errors
try {
  await login(credentials);
} catch (error) {
  toast.error(error.message);
}

// ✅ Do: Use role helpers
if (hasRole('ADMIN')) {
  /* ... */
}

// ❌ Don't: Import stores directly
import { useAuthStore } from '@myapp/frontend/stores'; // ❌

// ❌ Don't: Check roles manually
if (user?.role === 'ADMIN') {
  /* ... */
} // ❌
```

## 🐛 Troubleshooting

**"Cannot find module '@ai-chatbot/hooks'"**

```bash
nx build hooks
```

**Tag constraints error**
Check `project.json` has: `"tags": ["type:frontend", "type:hooks"]`

## 🧪 Testing

Run tests:

```bash
nx test hooks
```

## Building

```bash
nx build hooks
```
