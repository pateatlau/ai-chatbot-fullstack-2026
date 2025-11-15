# MSW API Mocking - Quick Start Guide

## ✅ Setup Complete

MSW (Mock Service Worker) is now configured for the shell app!

## 🚀 Usage

### Run with Real Backend (Default)

```bash
npm run dev:shell
```

Backend must be running on port 3000.

### Run with Mock API (No Backend Needed)

```bash
npm run dev:shell:mock
```

All API calls will be intercepted and handled by MSW.

## 📝 Test Users

When using MSW mocks, these test users are pre-seeded:

### Admin User

- **Email**: `admin@example.com`
- **Password**: `Admin@123`
- **Role**: ADMIN

### Regular User

- **Email**: `user@example.com`
- **Password**: `User@123`
- **Role**: USER

## 🧪 Testing the Setup

1. **Start shell with mocks**:

   ```bash
   npm run dev:shell:mock
   ```

2. **Open browser**: http://localhost:5173

3. **Look for MSW indicator** in console:

   ```
   🎭 MSW mocking enabled
   🎭 Mock users seeded: 2
   [MSW] Mocking enabled.
   ```

4. **Test login**:
   - Navigate to /login
   - Use test credentials above
   - Should see success toast and redirect to dashboard

5. **Test registration**:
   - Navigate to /register
   - Create new user with any valid data
   - Should see success toast and redirect to dashboard
   - New user stored in memory (lost on refresh)

## 🔧 Configuration

### Environment Variables

**`.env.development`** (default):

```env
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost:3000/api
```

**`.env.mock`** (for mocking):

```env
VITE_USE_MOCKS=true
VITE_API_URL=http://localhost:3000/api
```

### Toggle Mocking at Runtime

You can also override with environment variable:

```bash
# Enable mocks
VITE_USE_MOCKS=true npm run dev:shell

# Disable mocks (use real API)
VITE_USE_MOCKS=false npm run dev:shell
```

## 📁 File Structure

```
libs/frontend/mocks/
├── src/
│   ├── handlers/
│   │   └── auth.handlers.ts    # Auth endpoint mocks
│   ├── browser.ts              # Browser MSW setup
│   ├── server.ts               # Node MSW setup (for tests)
│   └── index.ts                # Public exports

apps/shell/
├── public/
│   └── mockServiceWorker.js    # MSW service worker
├── src/
│   └── mocks/
│       ├── config.ts           # MSW initialization
│       └── README.md           # Documentation
└── .env.development            # Environment config
```

## 🎯 Mocked Endpoints

All endpoints have realistic delays and error handling:

### POST /api/auth/register

- ✅ Creates new user
- ✅ Returns user + tokens
- ❌ 409 if email exists
- ❌ 400 if validation fails
- Delay: 800ms

### POST /api/auth/login

- ✅ Validates credentials
- ✅ Returns user + tokens
- ❌ 401 if invalid credentials
- ❌ 400 if fields missing
- Delay: 600ms

### GET /api/auth/me

- ✅ Returns current user
- ✅ Validates Bearer token
- ❌ 401 if token invalid/expired
- ❌ 404 if user not found
- Delay: 300ms

### POST /api/auth/logout

- ✅ Always successful
- Delay: 200ms

### POST /api/auth/refresh

- ✅ Returns new tokens
- ✅ Validates refresh token
- ❌ 401 if token invalid/expired
- ❌ 400 if token missing
- Delay: 400ms

## 🐛 Debugging

### Check if MSW is Active

Open browser console and look for:

```
🎭 MSW mocking enabled
🎭 Mock users seeded: 2
[MSW] Mocking enabled.
```

### View Intercepted Requests

MSW logs all intercepted requests in the console:

```
[MSW] POST http://localhost:3000/api/auth/login (200 OK)
```

### Disable MSW Temporarily

In browser console:

```javascript
// Stop MSW
window.msw.worker.stop();

// Restart MSW
window.msw.worker.start();
```

## 🔄 Switching Between Mock and Real API

### During Development

You can switch without restarting:

1. Update `.env.development`:

   ```env
   VITE_USE_MOCKS=true  # or false
   ```

2. Refresh browser (Vite hot-reloads env variables)

### For Testing

Create separate run configurations:

```bash
# Always use real API
npm run dev:shell

# Always use mocks
npm run dev:shell:mock
```

## ✨ Features

- ✅ Realistic network delays
- ✅ JWT token generation and validation
- ✅ Token expiry simulation
- ✅ In-memory user database
- ✅ Error scenarios (401, 403, 404, 409)
- ✅ Pre-seeded test users
- ✅ Support for registration
- ✅ Automatic token refresh
- ✅ Console logging of requests
- ✅ Zero backend dependency

## 📦 Next Steps

1. ✅ MSW is configured and working
2. ⏳ Add more mock handlers (chatbot, admin endpoints)
3. ⏳ Create MSW setup for testing (Vitest integration)
4. ⏳ Add error scenario toggles (simulate network failures)
5. ⏳ Add response delay controls (fast/slow/offline modes)

## 🎉 Success!

You can now develop the frontend completely independently of the backend. Perfect for:

- Frontend-only development
- UI/UX iteration
- Error scenario testing
- Offline development
- Demo presentations

---

**Current Status**: ✅ MSW Fully Operational
**Shell App**: http://localhost:5173 (with mocks enabled)
**Backend Required**: ❌ No (when using mocks)
