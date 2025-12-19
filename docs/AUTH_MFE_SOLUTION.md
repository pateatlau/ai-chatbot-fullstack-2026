# 🎯 AUTH-MFE SERVICE UNAVAILABLE - ROOT CAUSE & SOLUTION

**Date:** November 23, 2025  
**Issue:** Shell app cannot load auth-mfe remoteEntry.js  
**Root Cause:** Remote MFE services not fully initialized during development

---

## 📋 DIAGNOSIS SUMMARY

### What's Running
- ✅ **Shell** (5173) - Host application is responding
- ✅ **Chatbot MFE** (5175) - Partially responding with HTTP 200
- ⚠️ **Auth MFE** (5174) - Server present but returning HTTP 404 instead of remoteEntry.js
- ⚠️ **Admin MFE** (5176) - Server present but returning HTTP 404
- ⚠️ **Profile MFE** (5177) - Server present but returning HTTP 404
- 🔄 **Backend Services** - Running with Redis warnings (non-critical)

### Why This Happens

1. **Vite dev server starts** on port 5174
2. **But Module Federation compilation not complete** (remoteEntry.js not yet generated)
3. **Shell tries to load remoteEntry.js** from 5174 too early
4. **Gets HTTP 404** instead of the module entry point
5. **Shell app fails with "Service Unavailable"**

### Why Only Chatbot MFE Returns 200

Chatbot MFE on 5175 must have compiled its Module Federation configuration ahead of the others, or its build system completed first.

---

## ✅ SOLUTION: Start Services Properly

### Step 1: Ensure UI Components Built

```bash
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026
npm run build:ui-components
```

**Why:** UI components library is a dependency that all frontend apps import.

### Step 2: Start MFEs in Sequence (Give Each Time to Initialize)

**Option A: Parallel Start (Recommended)**

```bash
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026
npm run dev:frontend
```

This command:
- Uses `nx run-many --target=serve --projects=tag:type:frontend --parallel=5`
- Starts auth-mfe, chatbot-mfe, admin-mfe, profile-mfe, and shell in parallel
- Nx orchestrates dependencies properly
- Should wait for Module Federation to compile before shell loads remotes

**Wait for output:**
```
✓ shell ready on http://localhost:5173
✓ auth-mfe ready on http://localhost:5174
✓ chatbot-mfe ready on http://localhost:5175
✓ admin-mfe ready on http://localhost:5176
✓ profile-mfe ready on http://localhost:5177
```

### Step 3: Verify Shell App Loads

1. Open browser to http://localhost:5173
2. Open DevTools (F12)
3. Check Console tab
4. You should see:
   - ✅ No "Service Unavailable" errors
   - ✅ Apollo Client initialized
   - ✅ MFEs loaded and mounted
5. Test navigation (should see menu items for different modules)

---

## 🔧 IF STILL FAILING

### Method 1: Start MFEs Individually with Delays

```bash
# Terminal 1
npm run dev:chatbot-mfe
```

Wait for output: `ready in X ms`

```bash
# Terminal 2
npm run dev:auth-mfe
```

Wait for output: `ready in X ms`

```bash
# Terminal 3
npm run dev:admin-mfe
```

Wait for output: `ready in X ms`

```bash
# Terminal 4
npm run dev:profile-mfe
```

Wait for output: `ready in X ms`

```bash
# Terminal 5 - Only after all above show "ready"
npm run dev:shell
```

### Method 2: Full Stack One Command

```bash
# This includes both frontend AND backend
npm run dev
```

Expected output will show all services (3000, 3001, 3002, 4000, 5173, 5174, 5175, 5176, 5177)

### Method 3: Debug Individual MFE

```bash
# Check if remoteEntry.js actually generated
curl -s http://localhost:5174/remoteEntry.js | head -20

# If empty or 404, the Vite Module Federation plugin didn't compile yet
# Try serving with verbose output:
nx serve auth-mfe --verbose
```

---

## 🚨 CRITICAL POINTS

### Module Federation Requires All Remotes Ready

Shell app's `bootstrap.tsx` contains:
```tsx
const mfRuntime = await init({
  remotes: [
    { name: 'authMfe', entry: 'http://localhost:5174/remoteEntry.js' },
    { name: 'chatbotMfe', entry: 'http://localhost:5175/remoteEntry.js' },
    { name: 'adminMfe', entry: 'http://localhost:5176/remoteEntry.js' },
    { name: 'profileMfe', entry: 'http://localhost:5177/remoteEntry.js' },
  ],
});

await mfRuntime.init(); // <-- BLOCKS until all remotes load
```

**If ANY remote fails to respond → Shell app fails to initialize**

### Vite Dev Server Sequence

1. **Port opens** immediately (you can connect)
2. **HTTP 404** while Vite compiles
3. **HTTP 200 + remoteEntry.js** once Module Federation plugin finishes

This is why some MFEs return 404 - they're still compiling.

---

## 🎯 NEXT STEPS AFTER VERIFICATION

1. **Backend GraphQL Gateway**
   - Ensure auth/chatbot/admin services ready on 3000/3001/3002
   - Ensure Gateway running on 4000
   - Test with: `curl -X POST http://localhost:4000/graphql`

2. **Week 3 GraphQL Implementation** (Ready to start once frontend loads)
   - Implement auth-service GraphQL subgraph schema
   - Reference: `/GRAPHQL_SCHEMA_ANALYSIS.md`

3. **Performance Testing**
   - Load test all services with k6
   - Run: `npm run test:perf`

4. **End-to-End Testing**
   - Run Playwright tests
   - Command: `npm run test:e2e`

---

## 📝 KEY FILES

| File | Purpose |
|------|---------|
| `/apps/shell/src/bootstrap.tsx` | Module Federation initialization (awaits remotes) |
| `/apps/shell/vite.config.ts` | Federation plugin with 4 remotes configured |
| `/apps/auth-mfe/vite.config.ts` | Auth MFE Module Federation expose configuration |
| `/apps/auth-mfe/src/bootstrap.tsx` | Standalone auth-mfe app setup |
| `/package.json` | Scripts for dev:frontend, dev:backend, dev |

---

## 💡 DEBUGGING TIPS

### Check MFE is accepting connections
```bash
netstat -an | grep 5174
# Should show: tcp4  0 0 127.0.0.1.5174  LISTEN
```

### Test actual remoteEntry.js content
```bash
curl http://localhost:5174/remoteEntry.js | jq . 2>/dev/null || echo "Not valid JSON"
```

### Monitor Vite compilation in real-time
```bash
nx serve auth-mfe --verbose | grep -E "ready|error|built|compiling"
```

### Check if main CSS/JS files exist
```bash
curl -I http://localhost:5174/main.*.js
curl -I http://localhost:5174/style.*.css
```

---

## ✅ SUCCESS CRITERIA

Once shell app loads successfully:

- [ ] No "Service Unavailable" in console
- [ ] No errors in browser DevTools (F12 → Console)
- [ ] Can see shell UI with navigation
- [ ] Can click between different MFE sections
- [ ] Apollo Client DevTools extension shows queries
- [ ] All 4 MFEs mounted and functional

---

**Status:** Ready for full stack startup  
**Estimated Time:** 2-3 minutes for all services to initialize  
**Next:** Run `npm run dev:frontend` and wait for all services to show "ready"
