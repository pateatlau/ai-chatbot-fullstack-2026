# Admin Service - Quick Start Guide

## What Was Built

A complete backend service for administrative operations with:

### Core Features

1. **User Management**: List, view, update, delete users, reset passwords
2. **Audit Logging**: Track all admin actions with detailed logs
3. **Analytics**: User statistics, growth metrics, conversation insights
4. **Security**: JWT auth, admin role verification, self-protection rules

### Architecture

```
apps/admin-service/
├── src/
│   ├── lib/
│   │   └── db.ts                    # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.middleware.ts       # JWT + admin verification
│   ├── services/
│   │   ├── admin.service.ts         # User management logic
│   │   └── audit.service.ts         # Audit logging
│   ├── controllers/
│   │   └── admin.controller.ts      # HTTP handlers
│   ├── routes/
│   │   └── admin.routes.ts          # Route definitions
│   └── main.ts                      # Express app
├── test-admin-service.js            # Integration tests
├── setup-test-users.js              # Test user creation
└── README.md                        # Complete documentation
```

## How to Test

### Step 1: Start Services

```bash
# Terminal 1: Auth Service
npm run dev:auth

# Terminal 2: Admin Service
npm run dev:admin
```

### Step 2: Create Test Users

```bash
# Create admin and regular user accounts
node apps/admin-service/setup-test-users.js

# Make first user an admin (run in psql or database client)
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

### Step 3: Run Tests

```bash
# Run full integration test suite
node apps/admin-service/test-admin-service.js
```

Expected output:

```
═══════════════════════════════════════
   Admin Service Integration Tests
═══════════════════════════════════════

Authentication
  ✓ Admin login successful
  ✓ Regular user login successful

Health Check
  ✓ Admin service health check

Authorization
  ✓ Reject request without token
  ✓ Reject non-admin user

User Management
  ✓ List users
  ✓ Get user by ID
  ✓ Update user
  ✓ Reset user password

Analytics
  ✓ Get overview stats

Audit Logging
  ✓ Get audit logs

Filtering & Pagination
  ✓ List users with filters

Security Checks
  ✓ Prevent admin self-deactivation

═══════════════════════════════════════
   Test Summary
═══════════════════════════════════════

  ✓ Passed: 13
  ✗ Failed: 0
  Total:  13
  Success Rate: 100.0%

All tests passed!
```

## Manual Testing with cURL

### 1. Login as Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!@#"}'

# Save the accessToken from response
export TOKEN="<your-access-token>"
```

### 2. List Users

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3002/api/admin/users
```

### 3. Get User Details

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3002/api/admin/users/<user-id>
```

### 4. Update User

```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","role":"ADMIN"}' \
  http://localhost:3002/api/admin/users/<user-id>
```

### 5. Reset Password

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3002/api/admin/users/<user-id>/reset-password
```

### 6. Get Statistics

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3002/api/admin/stats
```

### 7. Get Audit Logs

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3002/api/admin/audit-logs
```

## API Endpoints Summary

| Method | Endpoint                            | Description             | Auth  |
| ------ | ----------------------------------- | ----------------------- | ----- |
| GET    | /api/admin/users                    | List users with filters | Admin |
| GET    | /api/admin/users/:id                | Get user details        | Admin |
| PATCH  | /api/admin/users/:id                | Update user             | Admin |
| DELETE | /api/admin/users/:id                | Soft delete user        | Admin |
| POST   | /api/admin/users/:id/reset-password | Reset password          | Admin |
| GET    | /api/admin/stats                    | Get statistics          | Admin |
| GET    | /api/admin/audit-logs               | Get audit logs          | Admin |

## Key Features Demonstrated

### 1. Dynamic SQL with Filtering

Only updates fields that are provided, building SQL dynamically:

```typescript
updates.push(`name = $1`);
updates.push(`role = $2`);
// Result: UPDATE users SET name = $1, role = $2 WHERE id = $3
```

### 2. Audit Logging

Every admin action is logged:

```typescript
await AuditService.log(adminId, 'USER_UPDATED', targetUserId, {
  changes: { name: 'New Name' },
});
```

### 3. Security Checks

Prevents admins from breaking the system:

```typescript
// Can't deactivate yourself
if (id === adminId && isActive === false) {
  return res.status(400).json({ error: 'Cannot deactivate your own account' });
}
```

### 4. Pagination & Filtering

Supports complex queries:

```
GET /api/admin/users?page=1&pageSize=20&role=USER&isActive=true&search=john
```

## Database Schema

### audit_logs Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  "adminId" UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  "targetUserId" UUID REFERENCES users(id),
  metadata JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

## Next Steps

1. ✅ Test all endpoints manually or with test script
2. 🔲 Build Admin MFE frontend (dashboard UI)
3. 🔲 Add more analytics (charts, trends)
4. 🔲 Implement bulk operations
5. 🔲 Add export functionality (CSV, PDF reports)

## Troubleshooting

### Service won't start

- Check PostgreSQL is running: `npm run docker:ps`
- Verify environment variables in `.env`
- Check port 3002 is available: `lsof -i :3002`

### Tests failing

- Ensure Auth Service is running on port 3000
- Ensure Admin Service is running on port 3002
- Create test users first: `node apps/admin-service/setup-test-users.js`
- Set admin role in database

### 401 Unauthorized

- Token expired (15-minute lifetime)
- Login again to get new token

### 403 Forbidden

- User doesn't have ADMIN role
- Run: `UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';`

## Status

✅ **Complete** - Admin Service Backend (50% of Week 2 Admin Service goal)

- All endpoints implemented
- Audit logging functional
- Security measures in place
- Integration tests ready
- Documentation complete

🔲 **TODO** - Admin MFE Frontend

- Dashboard UI
- User management table
- Statistics charts
- Audit log viewer
