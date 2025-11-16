# MSW Mocks Configuration

This directory contains Mock Service Worker (MSW) configuration for the shell app.

## Usage

### With Real Backend (Default)

```bash
npm run dev:shell
# or
VITE_USE_MOCKS=false npm run dev:shell
```

### With MSW Mocks

```bash
VITE_USE_MOCKS=true npm run dev:shell
```

## Mock Users

When MSW is enabled, the following test users are available:

### Admin User

- Email: `admin@example.com`
- Password: `Admin@123`
- Role: ADMIN

### Regular User

- Email: `user@example.com`
- Password: `User@123`
- Role: USER

## Creating New Users

You can also register new users through the registration form. All data is stored in memory and will be reset when you refresh the page.

## Features

- ✅ Realistic network delays (200-800ms)
- ✅ Token generation and validation
- ✅ Token expiry simulation
- ✅ Error scenarios (401, 403, 404, 409)
- ✅ In-memory user database
- ✅ Support for all auth endpoints:
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/me
  - POST /api/auth/logout
  - POST /api/auth/refresh

## Switching Between Real and Mock APIs

Update `.env.development` or use environment variable:

```bash
# Use real backend
VITE_USE_MOCKS=false npm run dev:shell

# Use mocks
VITE_USE_MOCKS=true npm run dev:shell
```

The MSW worker will only be loaded when `VITE_USE_MOCKS=true`.
