# Week 4 Apollo Client Integration Checklist

## ✅ Phase 1: Library Implementation (COMPLETE)

- [x] Apollo Client library directory created
- [x] Client configuration file with error/auth/HTTP links
- [x] 31 GraphQL query/mutation definitions
- [x] 21 custom React hooks organized in 3 files
- [x] Shell app wrapped with ApolloProvider
- [x] TypeScript path alias configured
- [x] Environment variables (.env files)
- [x] Test component created
- [x] Documentation complete
- [x] 2 commits pushed to GitHub

**Status: ✅ 100% COMPLETE**  
**Commit:** 901284e  
**Files:** 17 created/modified, 1,805 lines added

---

## ⏳ Phase 2: Manual Testing (PENDING - NEXT)

### Prerequisites

- [ ] All GraphQL services running (auth, chatbot, admin, gateway)
- [ ] PostgreSQL database seeded with test data
- [ ] Apollo Client library builds without errors

### Testing Steps

#### 2.1: Verify Import Paths

```bash
# Check that the library can be imported
grep -r "from '@myapp/frontend/apollo-client'" apps/shell/src/
```

- [ ] Import paths resolve correctly
- [ ] No "Module not found" errors in IDE

#### 2.2: Start Services

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:shell

# Terminal 3: Monitor (optional)
tail -f logs/*.log
```

- [ ] All services start without errors
- [ ] Ports accessible: 3000, 3001, 3002, 4000, 5173

#### 2.3: Add GraphQLTest Component

Edit `apps/shell/src/app/app.tsx`:

```typescript
import { GraphQLTest } from '../components/GraphQLTest';

export function App() {
  return (
    <div>
      <GraphQLTest />
      {/* rest of app */}
    </div>
  );
}
```

- [ ] Component added to App
- [ ] No TypeScript errors
- [ ] App compiles successfully

#### 2.4: Test in Browser

Navigate to `http://localhost:5173`

- [ ] No console errors about ApolloProvider
- [ ] GraphQLTest component displays
- [ ] Component shows "Not authenticated. Please log in." (if not logged in)

#### 2.5: Test Authentication Flow

1. Open login page
2. Enter test credentials (test@example.com / password123)
3. Observe GraphQLTest component

- [ ] After login, GraphQLTest shows user data
- [ ] User data includes: name, email, role, isActive
- [ ] Access token stored in localStorage

#### 2.6: Verify Network Requests

Open browser DevTools → Network tab:

- [ ] GraphQL requests visible to localhost:4000/graphql
- [ ] Authorization header contains "Bearer <token>"
- [ ] Response time < 200ms
- [ ] Response includes GraphQL data

#### 2.7: Test Caching

1. Perform a query (useMe)
2. Wait a moment
3. Perform same query again

- [ ] Second request faster than first
- [ ] Apollo DevTools shows cache entries
- [ ] Cache size reasonable (<10MB)

#### 2.8: Test Error Handling

1. Remove access token: `localStorage.removeItem('accessToken')`
2. Refresh page
3. Try to access protected query

- [ ] Error message displayed or auto-redirect to login
- [ ] Console shows GraphQL error
- [ ] App doesn't crash

---

## 🔄 Phase 3: Component Integration (QUEUED - AFTER PHASE 2)

### Auth MFE Integration

- [ ] Import useLogin hook in Auth MFE
- [ ] Replace REST /login call with GraphQL mutation
- [ ] Import useMe hook for user context
- [ ] Replace REST /me call with GraphQL query
- [ ] Test login flow end-to-end
- [ ] Verify token stored and forwarded

### Chatbot MFE Integration

- [ ] Import useConversations hook
- [ ] Replace REST GET /conversations call
- [ ] Import useSendMessage hook
- [ ] Replace REST POST /message call
- [ ] Test message sending
- [ ] Verify real-time updates (subscription ready)

### Admin MFE Integration

- [ ] Import useSystemStats hook
- [ ] Replace REST /stats call
- [ ] Import useUpdateUserRole hook
- [ ] Replace REST PATCH /user/:id/role call
- [ ] Test admin operations
- [ ] Verify audit log entries

---

## 📊 Performance Validation

| Operation            | Target Time | Measured | Status |
| -------------------- | ----------- | -------- | ------ |
| useMe() (first load) | <100ms      | --       | ⏳     |
| useMe() (cached)     | <10ms       | --       | ⏳     |
| useConversations()   | <150ms      | --       | ⏳     |
| useSendMessage()     | <300ms      | --       | ⏳     |
| Cache initialization | <50ms       | --       | ⏳     |
| Error handling       | <10ms       | --       | ⏳     |

---

## 🧪 Test Scenarios

### Scenario 1: First Time User

1. Load app → Not authenticated
2. See login screen
3. Enter credentials
4. GraphQLTest shows user data ✓
5. useMe() query returns current user ✓

### Scenario 2: Token Refresh

1. User logged in
2. Access token expires (simulated)
3. App attempts query
4. Refresh mutation called automatically
5. Query retried with new token ✓

### Scenario 3: Network Error

1. Stop GraphQL gateway
2. Try to load data
3. Network error caught
4. Error message displayed
5. Retry option works ✓
6. Start gateway again
7. App recovers

### Scenario 4: Permission Denied

1. Admin hook called by non-admin user
2. Receives 403 Forbidden
3. Error message displays
4. App continues working ✓

---

## 📝 Sign-Off

### Phase 1 Complete By:

- Date: November 22, 2025
- Commits: 2 (25a34d3, 901284e)
- Status: ✅ 100% COMPLETE

### Phase 2 Testing:

- Date Started: [pending]
- Date Completed: [pending]
- Issues Found: [pending]
- Status: ⏳ PENDING

### Phase 3 Integration:

- Date Started: [pending]
- Date Completed: [pending]
- Components Migrated: [pending]
- Status: ⏳ PENDING

---

## 🚀 Ready to Begin Phase 2?

Run this command to start manual testing:

```bash
# Start backend services
npm run dev:backend &

# In new terminal - start frontend
npm run dev:shell

# Navigate to http://localhost:5173
# Look for GraphQLTest component
```

Expected: GraphQLTest component displays without errors
