# @myapp/frontend/apollo-client

Apollo Client library for GraphQL integration with the GraphQL Federation gateway.

## Features

- ✅ Apollo Client v3.x configuration with error handling
- ✅ JWT authentication with automatic token forwarding
- ✅ Query and mutation definitions for all services
- ✅ Custom React hooks for common operations
- ✅ Intelligent caching with type policies
- ✅ Error handling with auto-redirect on auth failures
- ✅ Health check queries

## Installation

```bash
npm install @myapp/frontend/apollo-client
```

## Usage

### Setup ApolloProvider in your app

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@myapp/frontend/apollo-client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
```

### Use authentication hooks

```typescript
import { useLogin, useMe } from '@myapp/frontend/apollo-client';

function LoginComponent() {
  const login = useLogin();
  const { data, loading } = useMe();

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.data?.login?.success) {
      console.log('Logged in!');
    }
  };

  return (
    <div>
      <p>User: {data?.me?.name}</p>
      <button onClick={() => handleLogin('user@example.com', 'password')}>
        Login
      </button>
    </div>
  );
}
```

### Use chat hooks

```typescript
import { useConversations, useSendMessage } from '@myapp/frontend/apollo-client';

function ChatComponent() {
  const { data: conversations, loading } = useConversations();
  const sendMessage = useSendMessage();

  const handleSendMessage = async (conversationId: string, content: string) => {
    const result = await sendMessage(conversationId, content);
    if (result.data?.sendMessage?.success) {
      console.log('Message sent!');
    }
  };

  return (
    <div>
      {conversations?.conversations?.map((conv: any) => (
        <div key={conv.id}>{conv.title}</div>
      ))}
    </div>
  );
}
```

## Environment Variables

Set the GraphQL gateway URL in your `.env` file:

```
VITE_GRAPHQL_GATEWAY_URL=http://localhost:4000/graphql
```

Or in production:

```
VITE_GRAPHQL_GATEWAY_URL=https://api.yourdomain.com/graphql
```

## API Reference

### Authentication Hooks

- `useMe()` - Get current user
- `useLogin()` - Login user
- `useRegister()` - Register new user
- `useLogout()` - Logout user
- `useRefreshToken()` - Refresh access token
- `useUpdateProfile()` - Update user profile
- `useChangePassword()` - Change user password

### Chat Hooks

- `useConversations()` - Get all conversations
- `useConversation(id)` - Get single conversation
- `useChatStats()` - Get chat statistics
- `useSearchConversations()` - Search conversations
- `useCreateConversation()` - Create new conversation
- `useUpdateConversation()` - Update conversation
- `useDeleteConversation()` - Delete conversation
- `useSendMessage()` - Send message
- `useDeleteMessage()` - Delete message

### Admin Hooks

- `useSystemStats()` - Get system statistics
- `useAuditLogs()` - Get audit logs
- `useUpdateUserRole()` - Update user role
- `useDeactivateUser()` - Deactivate user
- `useActivateUser()` - Activate user

## For More Information

See the [Apollo Client Integration Guide](/docs/APOLLO_CLIENT_INTEGRATION_GUIDE.md) for detailed setup instructions.
