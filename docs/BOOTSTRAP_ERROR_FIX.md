# Bootstrap Error Fix - Testing Guide

## ✅ What Was Fixed

**Issue:** Dynamic import failure on `http://localhost:5173/src/bootstrap.tsx`

**Root Cause:** Apollo Client imports were happening before Module Federation runtime was fully initialized, causing module resolution to fail.

**Solution:** Lazy-load Apollo Client after Module Federation is ready using dynamic imports.

---

## 🚀 Testing the Fix

### Step 1: Clear Cache and Restart

```bash
# Kill any running servers
npm run kill:all

# Clear Vite cache
rm -rf node_modules/.vite

# Clear browser cache
# In Chrome DevTools → Network tab → uncheck "Disable cache"
```

### Step 2: Start Fresh

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:shell

# Wait for both to show READY status
```

### Step 3: Test in Browser

1. Open `http://localhost:5173`
2. Check browser console (F12)
3. Expected: No more "Failed to fetch dynamically imported module" error
4. Expected: Application should load normally

### Step 4: Verify Apollo Client is Working

1. Look for **GraphQLTest component** on page
2. You should see one of:
   - "Not authenticated. Please log in." (if not logged in)
   - User data including name, email, role (if already logged in)

### Step 5: Check Network Tab

1. Open DevTools → Network tab
2. Look for GraphQL requests to `http://localhost:4000/graphql`
3. If you see these, Apollo Client is working! ✓

---

## 🔍 What Changed

**File:** `apps/shell/src/bootstrap.tsx`

**Changes:**

- Removed top-level imports of `@apollo/client` and `@myapp/frontend/apollo-client`
- Apollo Client now imports dynamically after Module Federation initializes
- This prevents module resolution issues that happen during app startup

**Before:**

```typescript
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@myapp/frontend/apollo-client';
// This causes: Failed to fetch dynamically imported module error
```

**After:**

```typescript
const { ApolloProvider } = await import('@apollo/client');
const { apolloClient } = await import('@myapp/frontend/apollo-client');
// This works because Module Federation is already initialized
```

---

## ✅ If Still Having Issues

### Issue 1: Still seeing bootstrap error

**Solution:**

1. Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Check console for other errors
3. Verify backend services are running: `curl http://localhost:4000/graphql`

### Issue 2: GraphQLTest not visible

**Solution:**

1. Check that `apps/shell/src/components/GraphQLTest.tsx` exists
2. Verify it's being used in `apps/shell/src/app/app.tsx`
3. Check console for component rendering errors

### Issue 3: Apollo queries fail (401 error)

**Solution:**

1. This is expected if you're not logged in
2. Try logging in to get a token
3. After login, queries should work

### Issue 4: GraphQL gateway not responding

**Solution:**

```bash
# Check if gateway is running
curl http://localhost:4000/graphql

# If not, start backend services
npm run dev:backend
```

---

## 📊 Verification Checklist

- [ ] App loads without "Failed to fetch" error
- [ ] No TypeScript compilation errors
- [ ] GraphQLTest component visible on page
- [ ] Can see GraphQL requests in Network tab
- [ ] Authorization header present in GraphQL requests
- [ ] Can login and see user data
- [ ] Response times < 200ms

---

## 🎯 Next Steps

Once verified:

1. Proceed with Phase 2: Manual testing all GraphQL operations
2. Test authentication flow
3. Test chat operations
4. Verify caching is working

---

**Commit:** 17507a9  
**Branch:** develop  
**Status:** ✅ Fix deployed and pushed
