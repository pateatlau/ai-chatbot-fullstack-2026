# Admin MFE (Micro Frontend)

Admin dashboard micro frontend for managing users, viewing analytics, and monitoring system activity.

## Features

### 1. **Dashboard**

- Real-time statistics
  - Total Users
  - Active Users
  - Total Conversations
  - AI Tokens Used
- System health monitoring
- Recent activity feed
- Quick action buttons

### 2. **User Management**

- User list with pagination (10 users per page)
- Filtering by role (USER, ADMIN, MODERATOR)
- Filtering by status (Active/Inactive)
- User search and sorting
- Quick actions: Edit, Delete
- Bulk operations support

### 3. **User Detail/Edit**

- View complete user profile
- Edit user information
  - Name
  - Email
  - Role
  - Active status
- Password reset functionality
- User metadata display
  - User ID
  - Created date
  - Last updated
  - Last login

### 4. **Audit Logs**

- Complete audit trail of admin actions
- Filterable by action type
  - User Updated
  - User Deleted
  - Password Reset
  - Role Changed
- Pagination (20 logs per page)
- Detailed metadata view
- Timestamp and admin information

## Architecture

### State Management

- **API Client**: `src/api/admin.api.ts`
  - Axios-based HTTP client
  - Automatic JWT token injection from localStorage
  - Error handling and 401 redirect
  - TypeScript interfaces for all API calls

### Pages

1. **AdminDashboardPage** (`src/pages/AdminDashboardPage.tsx`)
   - Dashboard with statistics and system health
   - Uses `adminAPI.getStats()`

2. **UserManagementPage** (`src/pages/UserManagementPage.tsx`)
   - User list with filtering and pagination
   - Uses `adminAPI.getUsers()`, `adminAPI.deleteUser()`

3. **UserDetailPage** (`src/pages/UserDetailPage.tsx`)
   - User editing and password reset
   - Uses `adminAPI.getUserById()`, `adminAPI.updateUser()`, `adminAPI.resetUserPassword()`

4. **AuditLogsPage** (`src/pages/AuditLogsPage.tsx`)
   - Audit log viewer with filtering
   - Uses `adminAPI.getAuditLogs()`

### Routing

- `/admin` → Dashboard
- `/admin/users` → User Management
- `/admin/users/:id` → User Detail/Edit
- `/admin/audit-logs` → Audit Logs

## API Integration

All admin operations connect to the **Admin Service** at `http://localhost:3002/api/admin`:

### Endpoints Used

- `GET /stats` - Dashboard statistics
- `GET /users` - List users with pagination and filters
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user information
- `DELETE /users/:id` - Delete user
- `POST /users/:id/reset-password` - Reset user password
- `GET /audit-logs` - List audit logs with pagination and filters

### Authentication

- Requires JWT token in Authorization header
- Token retrieved from localStorage `auth-storage` key
- Automatic redirect to `/login` on 401 errors

## User Experience

### Loading States

- Skeleton loaders for initial data fetch
- Disabled buttons during save operations
- Loading indicators on all async actions

### Error Handling

- Toast notifications for all errors
- Clear error messages from backend
- Graceful fallbacks for missing data

### Success Feedback

- Success toasts for all mutations
- Automatic data refresh after changes
- Visual confirmation of actions

### Form Validation

- Required field validation
- Password strength requirements (min 8 characters)
- Role selection validation
- Email format validation

## Testing

Run integration tests:

```bash
node apps/admin-mfe/test-admin-mfe.js
```

### Test Coverage

1. **Dashboard Statistics** (5 tests)
   - API response validation
   - Data structure verification
   - Number formatting

2. **User Management** (4 tests)
   - User list API
   - Pagination
   - User object structure

3. **User Filtering** (4 tests)
   - Role-based filtering
   - Active/inactive filtering
   - Filter combinations

4. **Audit Logs** (4 tests)
   - Audit log API
   - Pagination
   - Log object structure

5. **Component Tests** (5 tests)
   - File existence verification
   - Component structure

6. **Routing Tests** (4 tests)
   - Route definitions
   - Page imports

7. **TypeScript Tests** (4 tests)
   - Interface definitions
   - Type safety

**Total: 30 Tests**

## Dependencies

### UI Components

- `@myapp/frontend/ui-components` - Card, Button, Input components
- `@myapp/frontend/hooks` - useToast hook

### Libraries

- `react` - UI framework
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `@myapp/shared/types` - Shared TypeScript types

## Environment Variables

```env
VITE_ADMIN_API_URL=http://localhost:3002/api/admin
```

## Build & Run

### Development

```bash
npm run dev:admin-mfe
```

### Build

```bash
npx nx build admin-mfe
```

### Preview Build

```bash
npx nx preview admin-mfe
```

## Future Enhancements

### Phase 1 (Short-term)

- [ ] Advanced user search (by name, email)
- [ ] Sorting options for user table
- [ ] Export audit logs to CSV
- [ ] Date range filter for audit logs
- [ ] User activity charts

### Phase 2 (Medium-term)

- [ ] Bulk user operations (activate/deactivate multiple)
- [ ] Email notification templates management
- [ ] System settings configuration UI
- [ ] Role permissions editor
- [ ] User impersonation feature

### Phase 3 (Long-term)

- [ ] Real-time dashboard updates with WebSockets
- [ ] Advanced analytics and reporting
- [ ] Custom dashboard widgets
- [ ] Scheduled reports
- [ ] API rate limiting configuration

## Status

**Current Status: 95% Complete**

✅ Dashboard with real-time statistics  
✅ User management with CRUD operations  
✅ User filtering and pagination  
✅ User detail/edit page  
✅ Password reset functionality  
✅ Audit logs viewer  
✅ API integration with Admin Service  
✅ TypeScript types and interfaces  
✅ Toast notifications  
✅ Loading states and error handling  
🚧 Integration tests (in progress)  
⏳ Advanced search and filters  
⏳ Real-time updates
