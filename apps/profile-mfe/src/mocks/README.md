# Profile MFE MSW Mocking

This directory contains the MSW (Mock Service Worker) configuration for the Profile MFE.

## Usage

### Run with Real Backend (Default)

```bash
npm run dev:profile
```

Backend must be running on port 3000.

### Run with Mock API (No Backend Needed)

```bash
npm run dev:profile:mock
```

All API calls will be intercepted and handled by MSW.

## Mocked Endpoints

### Profile Management

- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update profile (name, avatar)

### Security

- `POST /api/users/change-password` - Change password

### Settings

- `GET /api/users/settings` - Get user preferences
- `PATCH /api/users/settings` - Update preferences (theme, language, notifications)

### Sessions

- `GET /api/users/sessions` - Get active sessions
- `DELETE /api/users/sessions/:id` - Revoke session

## Test Users

When using MSW mocks, these test users are pre-seeded:

### Admin User

- **Email**: `admin@example.com`
- **Password**: `Admin@123`
- **Role**: ADMIN

### Regular User

- **Email**: `user@example.com`
- **Password**: `User@123`
- **Role**: USER

## Features

- ✅ Realistic network delays
- ✅ JWT token validation
- ✅ Profile update validation
- ✅ Password strength validation
- ✅ Settings persistence (in-memory)
- ✅ Session management simulation
- ✅ Error scenarios (401, 404, 400)
