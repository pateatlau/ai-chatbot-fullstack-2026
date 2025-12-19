# Admin Service

Backend service for administrative operations including user management, audit logging, and analytics.

## Features

### User Management

- **List Users**: Paginated user listing with filtering and sorting
  - Filter by: role (USER/ADMIN), active status, search by name/email
  - Sort by: createdAt, name, email
  - Pagination support
- **View User**: Get detailed user information
- **Update User**: Modify user details (name, role, avatar, active status)
- **Delete User**: Soft delete users (sets isActive = false)
- **Reset Password**: Admin can generate temporary passwords for users

### Audit Logging

- Tracks all administrative actions
- Log entries include:
  - Admin ID (who performed the action)
  - Action type (USER_CREATED, USER_UPDATED, USER_DELETED, etc.)
  - Target user ID (who was affected)
  - Metadata (additional context)
  - Timestamp
- Paginated retrieval with filtering

### Analytics

- **Overview Statistics**:
  - Total users count
  - Active users count
  - User growth rate (30-day comparison)
  - Total conversations
  - Active conversations (last 7 days)
  - Average messages per conversation

### Security

- JWT authentication required for all endpoints
- Admin role verification
- Self-protection: Admins cannot deactivate or demote themselves
- Session invalidation on sensitive operations

## API Endpoints

### User Management

```
GET    /api/admin/users              - List users (with filters)
GET    /api/admin/users/:id          - Get user details
PATCH  /api/admin/users/:id          - Update user
DELETE /api/admin/users/:id          - Soft delete user
POST   /api/admin/users/:id/reset-password - Reset user password
```

### Analytics

```
GET    /api/admin/stats              - Get overview statistics
```

### Audit Logs

```
GET    /api/admin/audit-logs         - Get audit logs (with filters)
```

### Health

```
GET    /health                       - Health check endpoint
```

## Query Parameters

### List Users

- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 20)
- `sortBy` (string): Sort field - createdAt, name, email (default: createdAt)
- `sortOrder` (string): Sort direction - asc, desc (default: desc)
- `search` (string): Search in name and email
- `role` (string): Filter by role - USER, ADMIN
- `isActive` (boolean): Filter by active status

### Audit Logs

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `adminId` (string): Filter by admin ID
- `action` (string): Filter by action type
- `targetUserId` (string): Filter by target user ID

## Environment Variables

```bash
# Server
HOST=localhost
PORT=3002

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_dev
DB_USER=myapp
DB_PASSWORD=myapp

# JWT
JWT_SECRET=your-secret-key-here
```

## Development

### Start Service

```bash
npm run dev:admin
```

### Setup Test Users

```bash
node apps/admin-service/setup-test-users.js

# Then manually set admin role in database:
# UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

### Run Tests

```bash
# Prerequisites: Auth Service and Admin Service must be running
node apps/admin-service/test-admin-service.js
```

## Architecture

### Services

- **AdminService**: Business logic for user management and analytics
- **AuditService**: Audit logging with log creation and retrieval

### Middleware

- **authMiddleware**: JWT token verification
- **adminMiddleware**: Admin role verification

### Controllers

- **AdminController**: HTTP request handlers for all endpoints

### Database

- Uses PostgreSQL with connection pooling
- Tables: users, sessions, audit_logs, conversations, messages

## Example Requests

### List Users with Filters

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3002/api/admin/users?role=USER&isActive=true&page=1&pageSize=10"
```

### Update User

```bash
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","role":"ADMIN"}' \
  http://localhost:3002/api/admin/users/<user-id>
```

### Reset Password

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/admin/users/<user-id>/reset-password
```

### Get Statistics

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/admin/stats
```

## Testing

The test suite covers:

- ✓ Authentication (admin and regular user login)
- ✓ Authorization (token validation, admin role check)
- ✓ User management (list, view, update, delete, password reset)
- ✓ Analytics (overview statistics)
- ✓ Audit logging (log creation and retrieval)
- ✓ Filtering and pagination
- ✓ Security checks (self-protection rules)

13 integration tests validate all functionality.

## Next Steps

1. Test the admin service endpoints
2. Build Admin MFE frontend for the dashboard
3. Add more analytics endpoints (user growth chart, conversation trends)
4. Implement hard delete for GDPR compliance
5. Add bulk operations (bulk activate/deactivate users)
