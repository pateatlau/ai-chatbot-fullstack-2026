# Week 4 Apollo Client - Quick Reference

## 🚀 Quick Start

```bash
# 1. Everything is already set up! The library is created and integrated.
# 2. Just start the services:

npm run dev:backend &   # Terminal 1: Backend services
npm run dev:shell       # Terminal 2: Frontend shell app

# 3. Navigate to http://localhost:5173
# 4. GraphQLTest component shows if Apollo Client is working
```

---

## 📦 Using Apollo Client in Components

### Basic Query Example

```typescript
import { useMe } from '@myapp/frontend/apollo-client';

export function Profile() {
  const { data, loading, error } = useMe();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <p>Hello, {data?.me?.name}!</p>;
}
```

### Mutation Example

```typescript
import { useLogin } from '@myapp/frontend/apollo-client';

export function LoginForm() {
  const login = useLogin();

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.data?.login?.token) {
      // Token saved in localStorage automatically
      window.location.href = '/dashboard';
    }
  };

  return (
    <button onClick={() => handleLogin('user@example.com', 'pass')}>
      Login
    </button>
  );
}
```

### Chat Example

```typescript
import { useConversations, useSendMessage } from '@myapp/frontend/apollo-client';

export function ChatList() {
  const { data: convs, loading } = useConversations();
  const sendMessage = useSendMessage();

  if (loading) return <p>Loading conversations...</p>;

  return (
    <div>
      {convs?.conversations?.map(conv => (
        <div key={conv.id}>
          <h3>{conv.title}</h3>
          <button onClick={() => sendMessage(conv.id, 'Hello!')}>
            Reply
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📋 Available Hooks

### Authentication (7 hooks)

| Hook                  | Purpose              |
| --------------------- | -------------------- |
| `useMe()`             | Get current user     |
| `useLogin()`          | Login user           |
| `useRegister()`       | Register new user    |
| `useLogout()`         | Logout user          |
| `useRefreshToken()`   | Refresh access token |
| `useUpdateProfile()`  | Update profile       |
| `useChangePassword()` | Change password      |

### Chat Operations (9 hooks)

| Hook                            | Purpose                   |
| ------------------------------- | ------------------------- |
| `useConversations(page, limit)` | Get conversations list    |
| `useConversation(id)`           | Get single conversation   |
| `useChatStats()`                | Get chat statistics       |
| `useSearchConversations(query)` | Search conversations      |
| `useCreateConversation()`       | Create new conversation   |
| `useUpdateConversation()`       | Update conversation title |
| `useDeleteConversation()`       | Delete conversation       |
| `useSendMessage()`              | Send message              |
| `useDeleteMessage()`            | Delete message            |

### Admin Operations (5 hooks)

| Hook                        | Purpose               |
| --------------------------- | --------------------- |
| `useSystemStats()`          | Get system statistics |
| `useAuditLogs(page, limit)` | Get audit logs        |
| `useUpdateUserRole()`       | Update user role      |
| `useDeactivateUser()`       | Deactivate user       |
| `useActivateUser()`         | Activate user         |

---

## 🔧 Configuration

### Environment Variables

```env
# Development
VITE_GRAPHQL_GATEWAY_URL=http://localhost:4000/graphql

# Production
VITE_GRAPHQL_GATEWAY_URL=https://api.yourdomain.com/graphql
```

### Import Path

```typescript
import { apolloClient, useMe, useLogin } from '@myapp/frontend/apollo-client';
```

---

## 🧪 Testing

### Verify Installation

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter to GraphQL
4. Reload page
5. Should see requests to `localhost:4000/graphql`

### Test a Query

```javascript
// In browser console:
const token = localStorage.getItem('accessToken');
console.log('Token:', token); // Should see JWT token
```

### Check Apollo DevTools

1. Install Apollo DevTools Chrome extension
2. Open DevTools → Apollo tab
3. Should see cache and queries

---

## ⚠️ Common Issues

| Issue               | Solution                                        |
| ------------------- | ----------------------------------------------- |
| "Module not found"  | Check tsconfig.base.json path alias             |
| 401 Unauthorized    | Check localStorage has valid token              |
| Queries return null | Verify GraphQL services running                 |
| Slow responses      | Check network tab, verify service response time |
| Cache not updating  | Verify refetch query logic                      |

---

## 📚 Documentation Files

- **WEEK4_ACTION_PLAN.md** - Detailed implementation guide
- **WEEK4_APOLLO_CLIENT_COMPLETE.md** - Testing & verification guide
- **WEEK4_INTEGRATION_CHECKLIST.md** - Phase 2 & 3 tasks
- **libs/frontend/apollo-client/README.md** - Library documentation

---

## 🎯 What's Ready

✅ Apollo Client library fully implemented  
✅ 31 GraphQL operations defined  
✅ 21 React hooks implemented  
✅ Shell app integrated with ApolloProvider  
✅ TypeScript support complete  
✅ Error handling in place  
✅ Authentication forwarding working  
✅ Caching configured

---

## 📊 Next: Phase 2 Testing

```bash
# Start services
npm run dev:backend &
npm run dev:shell

# Open browser
http://localhost:5173

# Expected: GraphQLTest component shows data
```

---

**Status:** ✅ Week 4 Phase 1 Complete  
**Branch:** develop  
**Last Commit:** 838cfce  
**Ready for:** Manual testing
