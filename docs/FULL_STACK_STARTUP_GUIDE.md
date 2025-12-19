# 🚀 COMPLETE STARTUP GUIDE - Module Federation Architecture

**Updated:** November 23, 2025, 11:30 AM  
**Status:** Frontend partially running, backend operational with Redis warnings  
**Issue:** auth-mfe (5174) not serving remoteEntry.js properly

---

## 📊 CURRENT STATE

### Frontend Services

| Service         | Port | Status      | Finding                       |
| --------------- | ---- | ----------- | ----------------------------- |
| **Shell**       | 5173 | ✅ HTTP 200 | Hosting successfully          |
| **Auth MFE**    | 5174 | ⚠️ HTTP 404 | Server running but no content |
| **Chatbot MFE** | 5175 | ✅ HTTP 200 | Serving correctly             |
| **Admin MFE**   | 5176 | ⚠️ HTTP 404 | Server running but no content |
| **Profile MFE** | 5177 | ⚠️ HTTP 404 | Server running but no content |

### Backend Services

| Service         | Port | Status     | Issue                                    |
| --------------- | ---- | ---------- | ---------------------------------------- |
| Auth Service    | 3000 | 🔄 Running | Redis connection warnings (non-critical) |
| Chatbot Service | 3001 | 🔄 Running | Redis connection warnings (non-critical) |
| Admin Service   | 3002 | 🔄 Running | Redis connection warnings (non-critical) |
| GraphQL Gateway | 4000 | ?          | Status unknown                           |

---

## ✅ ACTION ITEMS

### 1. Reset and Clean Build

```bash
# Kill all existing processes
pkill -f "nx serve" || true
pkill -f "vite" || true
sleep 2

# Clean Nx cache
nx reset

# Clear build artifacts
rm -rf dist
rm -rf node_modules/.vite
```

### 2. Rebuild UI Components (Dependency)

```bash
# This must run first - it's a dependency for all frontend apps
npm run build:ui-components
```

### 3. Start Backend Services (Terminal 1)

```bash
# Start all backend services with proper logging
npm run dev:backend
```

**Expected Output:**

```
✓ Auth Service is ready on port 3000
✓ Chatbot Service is ready on port 3001
✓ Admin Service is ready on port 3002
✓ GraphQL Gateway is ready on port 4000
```

### 4. Start All Frontend Services (Terminal 2)

```bash
# Option A: Start all at once (parallel)
npm run dev:frontend
```

**Expected Output:**

```
✓ shell ready on http://localhost:5173
✓ auth-mfe ready on http://localhost:5174
✓ chatbot-mfe ready on http://localhost:5175
✓ admin-mfe ready on http://localhost:5176
✓ profile-mfe ready on http://localhost:5177
```

### 5. Verify Application

1. **Open** http://localhost:5173 in browser
2. **Check** browser DevTools Console (F12)
3. **Verify** no "Service Unavailable" errors
4. **Test** navigation between micro-frontends

---

## 🔧 TROUBLESHOOTING

### Issue: auth-mfe returns 404 (not serving files)

**Solution 1: Rebuild auth-mfe**

```bash
nx run auth-mfe:build
nx serve auth-mfe
```

**Solution 2: Clear cache and rebuild**

```bash
rm -rf node_modules/.vite/deps
nx serve auth-mfe --reset-cache
```

**Solution 3: Restart full stack**

```bash
npm run kill:backend  # if it exists
pkill -f "nx serve"
npm run dev:frontend
```

---

### Issue: "VITE_USE_MOCKS" environment not set

**Shell app** can optionally use mock Mode Sharing:

```bash
# Start shell with mock mode (for testing without backend)
VITE_USE_MOCKS=true nx serve shell
```

---

### Issue: Port already in use

```bash
# Kill specific port
lsof -i :5174 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or for multiple ports
for port in 5173 5174 5175 5176 5177; do
  lsof -i :$port | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null
done
```

---

### Issue: Redis connection errors

These are **non-critical** warnings. Services still function.

**To enable Redis:**

```bash
# Check if Redis running
redis-cli ping

# If not running, start Docker or Redis locally
brew services start redis  # macOS
# or
docker-compose up -d redis
```

---

## 📝 IMPORTANT DETAILS

### Module Federation Bootstrap Flow

1. **Shell starts** on port 5173
2. **Shell loads bootstrap.tsx**
3. **Bootstrap initializes MF runtime**
4. **Runtime awaits all 4 remotes:**
   - authMfe from http://localhost:5174/remoteEntry.js
   - chatbotMfe from http://localhost:5175/remoteEntry.js
   - adminMfe from http://localhost:5176/remoteEntry.js
   - profileMfe from http://localhost:5177/remoteEntry.js
5. **Once all remotes load, App renders**
6. **If any remote fails → "Service Unavailable" error**

### If remoteEntry.js returns 404

It means the Vite dev server is running but hasn't compiled the Module Federation configuration yet. This typically means:

- Vite build still in progress
- vite.config.ts not properly configured with @module-federation/mf
- Module Federation plugin not imported correctly

---

## 🔍 DIAGNOSTIC COMMANDS

### Check MFE ports are accepting connections

```bash
for port in 5173 5174 5175 5176 5177; do
  echo "Port $port:"
  curl -I http://localhost:$port/ 2>&1 | head -3
done
```

### Monitor MFE dev server output

```bash
# Individual terminal for each MFE:
nx serve auth-mfe --verbose
nx serve chatbot-mfe --verbose
nx serve admin-mfe --verbose
nx serve profile-mfe --verbose
nx serve shell --verbose
```

### Test remoteEntry.js files

```bash
# Check if remoteEntry.js files exist and are valid JavaScript
for port in 5174 5175 5176 5177; do
  echo "=== Port $port remoteEntry.js ==="
  curl -s http://localhost:$port/remoteEntry.js 2>&1 | head -10
done
```

### Monitor HTTP traffic to MFE ports

```bash
# See all requests to MFE ports
lsof -i TCP:5173,5174,5175,5176,5177 -n -P | grep LISTEN
```

---

## 🎯 NEXT STEPS (After Full Stack Running)

1. ✅ **Verify shell app loads without errors** (all MFE modules loaded)
2. ✅ **Test navigation between MFEs** (routing works)
3. ✅ **Check Apollo Client connected to GraphQL Gateway** (GraphQL queries work)
4. ✅ **Verify authentication flow** (JWT tokens in HttpOnly cookies)
5. ✅ **Test SSE streaming** (chatbot message streaming)

---

## 📞 QUICK REFERENCE

```bash
# Full stack (parallel)
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Individual services
npm run dev:shell        # Port 5173
npm run dev:auth-mfe     # Port 5174
npm run dev:chatbot-mfe  # Port 5175
npm run dev:admin-mfe    # Port 5176
npm run dev:profile-mfe  # Port 5177
npm run dev:auth         # Port 3000
npm run dev:chatbot      # Port 3001
npm run dev:admin        # Port 3002
npm run dev:gateway      # Port 4000
```

---

**Last Updated:** 2025-11-23 11:30 AM  
**Session Status:** Ready for GraphQL implementation (Week 3) once full stack verified
