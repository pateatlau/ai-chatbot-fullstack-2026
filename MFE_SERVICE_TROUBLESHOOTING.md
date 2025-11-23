# 🔧 Auth-MFE Service Unavailable - Troubleshooting Guide

**Issue:** auth-mfe module fails to load with "Service Unavailable" error  
**Root Cause:** Remote MFE services not running on expected ports  
**Date:** November 23, 2025

---

## 📋 DIAGNOSTIC INFORMATION

### Expected Services

| Service      | Port | Status         | RemoteEntry URL                      |
| ------------ | ---- | -------------- | ------------------------------------ |
| Shell (Host) | 5173 | ✅ Running     | N/A                                  |
| Auth MFE     | 5174 | ❌ Not Running | http://localhost:5174/remoteEntry.js |
| Chatbot MFE  | 5175 | ❌ Not Running | http://localhost:5175/remoteEntry.js |
| Admin MFE    | 5176 | ❌ Not Running | http://localhost:5176/remoteEntry.js |
| Profile MFE  | 5177 | ❌ Not Running | http://localhost:5177/remoteEntry.js |

### Backend Services

| Service         | Port | Purpose                       |
| --------------- | ---- | ----------------------------- |
| Auth Service    | 3000 | User authentication & profile |
| Chatbot Service | 3001 | Chat API & streaming          |
| Admin Service   | 3002 | Admin panel & analytics       |
| GraphQL Gateway | 4000 | Apollo Federation gateway     |

---

## 🚀 QUICK FIX (2 Options)

### Option A: Start All Services (Full Stack)

```bash
# From project root
npm run dev
```

This will start:

- Shell (5173)
- Auth MFE (5174)
- Chatbot MFE (5175)
- Admin MFE (5176)
- Profile MFE (5177)
- All backend services (3000, 3001, 3002, 4000)

**Expected output:**

```
✓ shell ready on http://localhost:5173
✓ auth-mfe ready on http://localhost:5174
✓ chatbot-mfe ready on http://localhost:5175
✓ admin-mfe ready on http://localhost:5176
✓ profile-mfe ready on http://localhost:5177
```

---

### Option B: Start Only MFEs (Frontend Only)

```bash
# Start all frontend MFEs in parallel
npm run dev:frontend

# Or individual services:
nx serve shell --open
nx serve auth-mfe --open
nx serve chatbot-mfe --open
nx serve admin-mfe --open
nx serve profile-mfe --open
```

---

### Option C: Start Only Backend

```bash
# Start all backend services
npm run dev:backend

# Or with docker-compose
docker-compose up -d
```

---

## 🔍 CURRENT STATE

**Currently Running:**

- ✅ Shell (5173) - Module Federation host application

**Not Running:**

- ❌ Auth MFE (5174)
- ❌ Chatbot MFE (5175)
- ❌ Admin MFE (5176)
- ❌ Profile MFE (5177)
- ❌ Backend Services (3000-3002, 4000)

---

## 📊 HOW MODULE FEDERATION WORKS

```
User visits: http://localhost:5173 (Shell)
                ↓
Shell tries to load remotes:
                ↓
  - authMfe from http://localhost:5174/remoteEntry.js
  - chatbotMfe from http://localhost:5175/remoteEntry.js
  - adminMfe from http://localhost:5176/remoteEntry.js
  - profileMfe from http://localhost:5177/remoteEntry.js
                ↓
If any remote fails → "Service Unavailable" error
```

---

## 🛠️ MANUAL VERIFICATION

### Test if auth-mfe would load:

```bash
# Try to access the remote entry point
curl -s http://localhost:5174/remoteEntry.js | head -20

# If you see connection refused:
# → Port 5174 is not listening
# → Auth MFE needs to be started

# If you see JavaScript code:
# → Port is listening
# → Check browser DevTools for loading errors
```

### Check which ports are listening:

```bash
# See all Node processes
ps aux | grep node

# Check specific ports
lsof -i :5173
lsof -i :5174
lsof -i :5175
lsof -i :5176
lsof -i :5177
```

---

## 📝 PACKAGE.JSON SCRIPTS

From root `package.json`, you should have:

```json
{
  "scripts": {
    "dev": "nx run-many --target=serve --all --parallel",
    "dev:backend": "nx run-many --target=serve --projects=tag:type:backend --parallel",
    "dev:frontend": "nx run-many --target=serve --projects=tag:type:frontend --parallel",
    "build": "nx run-many --target=build --all",
    "test": "nx run-many --target=test --all"
  }
}
```

---

## ✅ RESOLUTION STEPS

### Step 1: Start All Services

```bash
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026
npm run dev
```

### Step 2: Wait for All Services to Start

Watch terminal for:

```
✓ All services are ready
✓ Open http://localhost:5173 in your browser
```

### Step 3: Verify in Browser

1. Open http://localhost:5173
2. Check browser DevTools Console (F12)
3. Verify no "Service Unavailable" errors
4. Test navigation between MFEs

### Step 4: If Still Failing

1. Clear cache:

   ```bash
   rm -rf node_modules/.vite
   npm run reset
   ```

2. Rebuild everything:

   ```bash
   npm install
   npm run build
   npm run dev
   ```

3. Check error details in browser console

---

## 🎯 NEXT STEPS

**To prevent this in future:**

1. ✅ Always run `npm run dev` from project root
2. ✅ Don't manually start individual services
3. ✅ Use Nx task orchestration for proper sequencing
4. ✅ Check all ports 5173-5177 are listening before accessing app

---

## 📞 SUPPORT

If services fail to start:

1. **Check port conflicts:**

   ```bash
   # Kill any process using ports 5173-5177
   lsof -i :5173 | tail -1 | awk '{print $2}' | xargs kill -9
   ```

2. **Clear Node cache:**

   ```bash
   rm -rf dist node_modules/.vite
   npm install
   ```

3. **Check Nx daemon:**
   ```bash
   nx reset
   ```

---

**Status:** 🔴 NOT RUNNING  
**Action Required:** Start services with `npm run dev`  
**Estimated Time:** 30-60 seconds to fully start
