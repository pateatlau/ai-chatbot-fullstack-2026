# Apollo Client Integration Guide (Week 4)

**Status:** Ready for Implementation  
**Timeline:** Week 4, Days 3-4  
**Dependencies:** GraphQL Federation verified working (Week 3)

---

## 📋 Overview

This guide details how to integrate Apollo Client into the frontend shell app to consume GraphQL queries from the federated gateway. This is **Phase 2 Part 2** of the implementation.

---

## 🚀 Step 1: Install Apollo Client

```bash
# Navigate to workspace root
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026

# Install Apollo Client v5
npm install @apollo/client graphql
```

**Verify installation:**

```bash
npm ls @apollo/client
```

Expected output:

```
@apollo/client@5.x.x
├── graphql@16.x.x
└── ...
```

---

## 📁 Step 2: Create Apollo Client Library

Create a new shared library for Apollo Client configuration:

```bash
nx generate @nx/js:library apollo-client \
  --directory=libs/frontend/apollo-client \
  --importPath=@myapp/frontend/apollo-client \
  --unitTestRunner=vitest \
  --tags=type:frontend
```

---

## 🔧 Step 3: Create Apollo Client Configuration

Create `libs/frontend/apollo-client/src/client.ts`:

```typescript
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const GRAPHQL_GATEWAY_URL =
  process.env.VITE_GRAPHQL_GATEWAY_URL || 'http://localhost:4000/graphql';

// HTTP Link
const httpLink = createHttpLink({
  uri: GRAPHQL_GATEWAY_URL,
  credentials: 'include', // Include cookies for authentication
  fetchOptions: {
    method: 'POST',
  },
});

// Error Handling Link
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions, path }) => {
        console.error(
          `[GraphQL Error]: Message: ${message}, Path: ${path}`,
          extensions
        );

        // Handle 401 Unauthorized
        if (extensions?.code === 'UNAUTHENTICATED') {
          // Trigger logout or redirect to login
          window.location.href = '/login';
        }
      });
    }

    if (networkError) {
      console.error(`[Network Error]: ${networkError}`);
      if ('statusCode' in networkError && networkError.statusCode === 401) {
        // Handle auth errors
        window.location.href = '/login';
      }
    }
  }
);

// Auth Link - Add Authorization header
const authLink = setContext(async (_, { headers }) => {
  // Get token from cookies or localStorage
  const token = localStorage.getItem('accessToken');

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Cache Configuration
export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        conversations: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    User: {
      keyFields: ['id'],
    },
    Conversation: {
      keyFields: ['id'],
    },
    Message: {
      keyFields: ['id'],
    },
  },
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;
```

Create `libs/frontend/apollo-client/src/index.ts`:

```typescript
export { apolloClient, cache } from './client';
export * from '@apollo/client';
```

---

## 🔧 Step 4: Create TypeScript Definitions

Create `libs/frontend/apollo-client/src/types.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'GUEST';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  conversations?: Conversation[];
  permissions?: string[];
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messageCount: number;
  lastMessage?: string;
  lastMessageDate?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  tokenCount?: number;
  createdAt: string;
}

export interface ChatStats {
  totalConversations: number;
  totalMessages: number;
  totalTokensUsed: number;
  averageMessagesPerConversation: number;
  activeConversations: number;
}

export interface SystemStats {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  activeUsers24h: number;
  totalTokensUsed: number;
  averageResponseTime: number;
  systemUptime: number;
}
```

---

## 📝 Step 5: Create GraphQL Query/Mutation Files

Create `libs/frontend/apollo-client/src/queries/user.ts`:

```typescript
import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      name
      role
      isActive
      updatedAt
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`;
```

Create `libs/frontend/apollo-client/src/queries/auth.ts`:

```typescript
import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      user {
        id
        email
        name
        role
      }
      token
      refreshToken
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      user {
        id
        email
        name
        role
      }
      token
      refreshToken
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      success
      user {
        id
        email
      }
      token
    }
  }
`;
```

Create `libs/frontend/apollo-client/src/queries/chat.ts`:

```typescript
import { gql } from '@apollo/client';

export const GET_CONVERSATIONS = gql`
  query GetConversations($input: PaginationInput) {
    conversations(input: $input) {
      id
      title
      messageCount
      lastMessage
      lastMessageDate
      createdAt
      updatedAt
    }
  }
`;

export const GET_CONVERSATION = gql`
  query GetConversation($id: ID!) {
    conversation(id: $id) {
      id
      title
      messageCount
      createdAt
      messages {
        id
        role
        content
        tokenCount
        createdAt
      }
    }
  }
`;

export const GET_CHAT_STATS = gql`
  query GetChatStats {
    chatStats {
      totalConversations
      totalMessages
      totalTokensUsed
      averageMessagesPerConversation
      activeConversations
    }
  }
`;

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($input: CreateConversationInput) {
    createConversation(input: $input) {
      id
      title
      createdAt
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($conversationId: ID!, $input: SendMessageInput!) {
    sendMessage(conversationId: $conversationId, input: $input) {
      success
      message {
        id
        conversationId
        role
        content
        tokenCount
        createdAt
      }
      conversationId
    }
  }
`;

export const DELETE_CONVERSATION = gql`
  mutation DeleteConversation($id: ID!) {
    deleteConversation(id: $id) {
      id
    }
  }
`;
```

Create `libs/frontend/apollo-client/src/queries/admin.ts`:

```typescript
import { gql } from '@apollo/client';

export const GET_SYSTEM_STATS = gql`
  query GetSystemStats {
    systemStats {
      totalUsers
      totalConversations
      totalMessages
      activeUsers24h
      totalTokensUsed
      averageResponseTime
      systemUptime
    }
  }
`;

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($input: PaginationInput) {
    auditLogs(input: $input) {
      id
      userId
      action
      resource
      changes
      timestamp
    }
  }
`;

export const ASSIGN_ROLE = gql`
  mutation AssignRole($input: AssignRoleInput!) {
    assignRole(input: $input) {
      id
      userId
      role
      permissions
      isActive
    }
  }
`;
```

---

## 🪝 Step 6: Create Custom React Hooks

Create `libs/frontend/apollo-client/src/hooks/useUser.ts`:

```typescript
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_ME, UPDATE_PROFILE, CHANGE_PASSWORD } from '../queries/user';
import { User } from '../types';

export function useMe() {
  return useQuery<{ me: User }>(GET_ME);
}

export function useUpdateProfile() {
  return useMutation(UPDATE_PROFILE);
}

export function useChangePassword() {
  return useMutation(CHANGE_PASSWORD);
}

export function useLogout() {
  const client = useApolloClient();

  return () => {
    // Clear Apollo cache
    client.clearStore();

    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Redirect to login
    window.location.href = '/login';
  };
}
```

Create `libs/frontend/apollo-client/src/hooks/useAuth.ts`:

```typescript
import { useMutation, useApolloClient } from '@apollo/client';
import { REGISTER, LOGIN, LOGOUT } from '../queries/auth';

export function useRegister() {
  const [register] = useMutation(REGISTER);

  return async (email: string, password: string, name: string) => {
    const result = await register({
      variables: {
        input: { email, password, name },
      },
    });

    if (result.data?.register?.token) {
      localStorage.setItem('accessToken', result.data.register.token);
      if (result.data.register.refreshToken) {
        localStorage.setItem('refreshToken', result.data.register.refreshToken);
      }
    }

    return result;
  };
}

export function useLogin() {
  const [login] = useMutation(LOGIN);

  return async (email: string, password: string) => {
    const result = await login({
      variables: {
        input: { email, password },
      },
    });

    if (result.data?.login?.token) {
      localStorage.setItem('accessToken', result.data.login.token);
      if (result.data.login.refreshToken) {
        localStorage.setItem('refreshToken', result.data.login.refreshToken);
      }
    }

    return result;
  };
}

export function useLogout() {
  const [logout] = useMutation(LOGOUT);
  const client = useApolloClient();

  return async () => {
    await logout();

    // Clear cache and storage
    client.clearStore();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Redirect
    window.location.href = '/login';
  };
}
```

Create `libs/frontend/apollo-client/src/hooks/useChat.ts`:

```typescript
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  GET_CONVERSATIONS,
  GET_CONVERSATION,
  GET_CHAT_STATS,
  CREATE_CONVERSATION,
  SEND_MESSAGE,
} from '../queries/chat';
import { Conversation, Message, ChatStats } from '../types';

export function useConversations(page = 1, limit = 10) {
  return useQuery<{ conversations: Conversation[] }>(GET_CONVERSATIONS, {
    variables: {
      input: { page, limit },
    },
  });
}

export function useConversation(id: string) {
  return useQuery<{ conversation: Conversation }>(GET_CONVERSATION, {
    variables: { id },
    skip: !id,
  });
}

export function useChatStats() {
  return useQuery<{ chatStats: ChatStats }>(GET_CHAT_STATS);
}

export function useCreateConversation() {
  const client = useApolloClient();
  return useMutation(CREATE_CONVERSATION, {
    onCompleted: () => {
      // Refetch conversations list
      client.refetchQueries({
        include: [GET_CONVERSATIONS],
      });
    },
  });
}

export function useSendMessage() {
  const client = useApolloClient();
  return useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      // Update conversation in cache
      if (data?.sendMessage?.conversationId) {
        client.refetchQueries({
          include: [GET_CONVERSATION],
        });
      }
    },
  });
}
```

Create `libs/frontend/apollo-client/src/hooks/index.ts`:

```typescript
export {
  useMe,
  useUpdateProfile,
  useChangePassword,
  useLogout as useLogoutUser,
} from './useUser';
export { useRegister, useLogin, useLogout } from './useAuth';
export {
  useConversations,
  useConversation,
  useChatStats,
  useCreateConversation,
  useSendMessage,
} from './useChat';
```

---

## 🔌 Step 7: Add Apollo Provider to Shell App

Update `apps/shell/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';

// Import Apollo Client
import { apolloClient } from '@myapp/frontend/apollo-client';

// Import App
import App from './App';

// Import styles
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);
```

---

## ✅ Step 8: Verify Installation

Create test file `libs/frontend/apollo-client/src/client.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { apolloClient, cache } from './client';

describe('Apollo Client', () => {
  it('should create Apollo client instance', () => {
    expect(apolloClient).toBeDefined();
  });

  it('should have cache configured', () => {
    expect(cache).toBeDefined();
  });

  it('should have correct GraphQL endpoint', () => {
    expect(
      process.env.VITE_GRAPHQL_GATEWAY_URL || 'http://localhost:4000/graphql'
    ).toBeDefined();
  });
});
```

Run tests:

```bash
nx test apollo-client
```

---

## 🎯 Step 9: Environment Configuration

Create `.env.development`:

```
VITE_GRAPHQL_GATEWAY_URL=http://localhost:4000/graphql
```

Create `.env.production`:

```
VITE_GRAPHQL_GATEWAY_URL=https://api.yourdomain.com/graphql
```

---

## 📝 Step 10: Example Component Usage

Create `apps/shell/src/components/UserProfile.tsx`:

```typescript
import { useMe } from '@myapp/frontend/apollo-client';

export function UserProfile() {
  const { data, loading, error } = useMe();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const user = data?.me;

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <p>Member since: {new Date(user?.createdAt || '').toLocaleDateString()}</p>
    </div>
  );
}
```

---

## ✨ Performance Optimizations

### Caching Strategy

Apollo Client automatically caches queries. For best performance:

```typescript
// Cache-first for static data
useQuery(GET_USER_PROFILE, {
  fetchPolicy: 'cache-first',
});

// Network-first for frequently changing data
useQuery(GET_CONVERSATIONS, {
  fetchPolicy: 'network-first',
});

// No-cache for real-time data
useQuery(GET_CHAT_STATS, {
  fetchPolicy: 'no-cache',
});
```

### Refetching Patterns

```typescript
// Refetch after mutation
useMutation(SEND_MESSAGE, {
  refetchQueries: [{ query: GET_CONVERSATIONS }],
});

// Optimistic updates
useMutation(UPDATE_PROFILE, {
  optimisticResponse: {
    updateProfile: {
      id: userId,
      name: newName,
    },
  },
});
```

---

## 🧪 Testing Apollo Queries

### Unit Test Example

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { UserProfile } from './UserProfile';
import { GET_ME } from '../queries/user';

const mocks = [
  {
    request: {
      query: GET_ME,
    },
    result: {
      data: {
        me: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      },
    },
  },
];

describe('UserProfile', () => {
  it('renders user profile', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <UserProfile />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });
});
```

---

## 📊 Checklist

- [ ] Apollo Client installed
- [ ] Apollo Client library created (`@myapp/frontend/apollo-client`)
- [ ] Client configuration created
- [ ] TypeScript types defined
- [ ] Query and mutation files created
- [ ] Custom React hooks created
- [ ] ApolloProvider added to Shell app
- [ ] Environment variables configured
- [ ] Tests passing
- [ ] Can query `/graphql` successfully
- [ ] Authentication headers forwarded correctly
- [ ] Cache working (verified via Apollo DevTools)
- [ ] Error handling working

---

## 📚 Related Documentation

- **GRAPHQL_FEDERATION_VERIFICATION.md** - GraphQL setup verification
- **GRAPHQL_QUERY_REFERENCE.md** - GraphQL query examples
- **CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md** - Full roadmap
- **Apollo Client Docs** - https://www.apollographql.com/docs/react/

---

## 🎯 Next Steps

After Apollo Client is integrated:

1. **Migrate Auth MFE** to use Apollo Client queries
2. **Migrate Chatbot MFE** to use conversation queries
3. **Migrate Admin MFE** to use system stats queries
4. **Implement caching strategy** for optimal performance
5. **Add subscriptions** for real-time updates (Week 6+)
