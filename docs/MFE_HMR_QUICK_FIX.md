# MFE HMR Error - Quick Reference

## The Error

```
net::ERR_EMPTY_RESPONSE  - from localhost:5174/.__mf__temp/authMfe/localSharedImportMap.js
net::ERR_CONNECTION_REFUSED - from /@fs/Users/patea/.../node_modules/.vite/.../deps/...
```

## What It Means

The Micro Frontend development server is running, but:

- **HMR connection is not properly configured**
- **Module Federation can't resolve shared dependencies**
- **Vite is serving absolute file paths instead of modules**

## Root Cause

```typescript
// ❌ BEFORE (Incomplete HMR config)
hmr: {
  overlay: true,
}

// ✅ AFTER (Complete HMR config)
hmr: {
  host: 'localhost',
  port: 5174,           // Must match server port!
  protocol: 'http',
  overlay: true,
}
```

## Why This Happens

1. Vite tries to auto-detect HMR connection details
2. Auto-detection fails on `localhost` hostname
3. Falls back to absolute file paths via `/@fs/`
4. Module Federation can't parse these paths
5. Remote entries fail to load

## The Fix

**Add explicit HMR configuration** to each MFE's `vite.config.ts`:

```typescript
export default defineConfig(() => ({
  // ... other config ...
  server: {
    port: 5174, // The dev server port
    host: 'localhost',
    hmr: {
      host: 'localhost', // ← Add this
      port: 5174, // ← Match server port
      protocol: 'http', // ← Add this
      overlay: true,
    },
  },
}));
```

## Port Mapping

- Shell: 5173 → HMR port 5173
- Auth MFE: 5174 → HMR port 5174
- Chatbot MFE: 5175 → HMR port 5175
- Admin MFE: 5176 → HMR port 5176
- Profile MFE: 5177 → HMR port 5177

## Files to Check

```
apps/shell/vite.config.ts              ✅ Fixed
apps/auth-mfe/vite.config.ts           ✅ Fixed
apps/chatbot-mfe/vite.config.ts        ✅ Fixed
apps/admin-mfe/vite.config.ts          ✅ Fixed
apps/profile-mfe/vite.config.ts        ✅ Fixed
```

## How to Test

```bash
# 1. Start dev environment
npm run dev

# 2. Open browser
http://localhost:5173

# 3. Check browser console
# Should see NO errors about ERR_EMPTY_RESPONSE or ERR_CONNECTION_REFUSED

# 4. Check that MFEs load
# Auth MFE, Chatbot MFE, Admin MFE, Profile MFE should be accessible
```

## Success Indicators ✅

- [ ] No `net::ERR_EMPTY_RESPONSE` in console
- [ ] No `net::ERR_CONNECTION_REFUSED` in console
- [ ] No `/@fs/` paths in network requests
- [ ] `remoteEntry.js` loads successfully from each port
- [ ] HMR websocket connects without errors
- [ ] Hot module reloading works on file changes

## When to Use This

- Developing frontend locally with MFEs
- Running `npm run dev`
- Making changes to MFE code and expecting HMR

## Why Explicit HMR Config?

| Scenario   | Auto-detect | Explicit Config |
| ---------- | ----------- | --------------- |
| localhost  | ❌ Fails    | ✅ Works        |
| 127.0.0.1  | Maybe       | ✅ Works        |
| CI/CD      | ❌ Fails    | ✅ Works        |
| Docker     | ❌ Fails    | ✅ Works        |
| Production | N/A         | ✅ Works        |

## Key Takeaway

**Always explicitly configure HMR in Vite Module Federation apps.**

Never rely on auto-detection, especially with `localhost` hostname.

---

For detailed explanation: See `MFE_HMR_FIX_EXPLANATION.md`
