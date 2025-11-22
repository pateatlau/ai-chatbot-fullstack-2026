# Week 4 Action Plan: Apollo Client Integration

**Date Created:** November 22, 2025  
**Phase:** 2 Week 4 (Ready to Start)  
**Duration:** 3-4 hours  
**Prerequisites:** GraphQL Federation verified working (Week 3 ✅)

---

## 🎯 Objective

Connect the frontend Shell app to the GraphQL federation gateway using Apollo Client v5, enabling GraphQL queries from React components.

---

## ✅ Pre-Work Checklist (Verify Before Starting)

- [ ] GraphQL services are running and tested (from Week 3)
- [ ] Can query GraphQL gateway at `http://localhost:4000/graphql`
- [ ] All federation queries return data correctly
- [ ] Response times are acceptable (<200ms)

---

## 📋 Step-by-Step Implementation

### Phase 1: Setup Apollo Client Library (30 minutes)

#### Step 1.1: Install Apollo Client

```bash
npm install @apollo/client graphql
```

**Verify installation:**

```bash
npm ls @apollo/client graphql
```

#### Step 1.2: Generate Apollo Client Library

```bash
nx generate @nx/js:library apollo-client \
  --directory=libs/frontend/apollo-client \
  --importPath=@myapp/frontend/apollo-client \
  --unitTestRunner=vitest \
  --tags=type:frontend
```

#### Step 1.3: Update tsconfig.base.json Path

Add to `tsconfig.base.json` in `paths` section:

```json
"@myapp/frontend/apollo-client": [
  "libs/frontend/apollo-client/src/index.ts"
]
```

### Phase 2: Create Apollo Client Configuration (45 minutes)

#### Step 2.1: Create Client Configuration

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
  credentials: 'include',
});

// Error Handling Link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`[GraphQL Error]: ${message}`, extensions);

      // Handle 401 Unauthorized
      if (extensions?.code === 'UNAUTHENTICATED') {
        window.location.href = '/login';
      }
    });
  }

  if (networkError) {
    console.error(`[Network Error]: ${networkError}`);
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      window.location.href = '/login';
    }
  }
});

// Auth Link - Add Authorization header
const authLink = setContext((_, { headers }) => {
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

#### Step 2.2: Create Index Export

Create `libs/frontend/apollo-client/src/index.ts`:

```typescript
export { apolloClient, cache } from './client';
export * from '@apollo/client';
```

### Phase 3: Create GraphQL Queries and Hooks (45 minutes)

#### Step 3.1: Create Query Definitions

Create `libs/frontend/apollo-client/src/queries/index.ts`:

```typescript
import { gql } from '@apollo/client';

// Authentication Queries
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

// Chat Queries
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
```

#### Step 3.2: Create Custom Hooks

Create `libs/frontend/apollo-client/src/hooks/useAuth.ts`:

```typescript
import { useMutation, useApolloClient, useQuery } from '@apollo/client';
import { GET_ME, REGISTER, LOGIN, LOGOUT } from '../queries';

export function useMe() {
  return useQuery(GET_ME);
}

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
    client.clearStore();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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
  CREATE_CONVERSATION,
  SEND_MESSAGE,
} from '../queries';

export function useConversations(page = 1, limit = 10) {
  return useQuery(GET_CONVERSATIONS, {
    variables: {
      input: { page, limit },
    },
  });
}

export function useConversation(id: string) {
  return useQuery(GET_CONVERSATION, {
    variables: { id },
    skip: !id,
  });
}

export function useCreateConversation() {
  const client = useApolloClient();
  return useMutation(CREATE_CONVERSATION, {
    onCompleted: () => {
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
export { useMe, useRegister, useLogin, useLogout } from './useAuth';
export {
  useConversations,
  useConversation,
  useCreateConversation,
  useSendMessage,
} from './useChat';
```

### Phase 4: Integrate ApolloProvider into Shell App (30 minutes)

#### Step 4.1: Update Shell App Main

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

### Phase 5: Test Apollo Client Integration (30 minutes)

#### Step 5.1: Create Example Component

Create `apps/shell/src/components/TestGraphQL.tsx`:

```typescript
import { useMe } from '@myapp/frontend/apollo-client';

export function TestGraphQL() {
  const { data, loading, error } = useMe();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const user = data?.me;

  return (
    <div>
      <h2>GraphQL Test</h2>
      <p>User: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

#### Step 5.2: Test in App

Add TestGraphQL component to your App component temporarily to verify Apollo Client is working.

#### Step 5.3: Verify in Browser DevTools

1. Open browser DevTools → Network tab
2. Filter to GraphQL requests
3. Verify requests are being sent to `http://localhost:4000/graphql`
4. Check response times and data format

### Phase 6: Environment Configuration (15 minutes)

#### Step 6.1: Create Environment Files

Create `.env.development`:

```
VITE_GRAPHQL_GATEWAY_URL=http://localhost:4000/graphql
```

Create `.env.production`:

```
VITE_GRAPHQL_GATEWAY_URL=https://your-api-domain.com/graphql
```

---

## 🧪 Verification Checklist

After completing all steps:

- [ ] Apollo Client library created (`@myapp/frontend/apollo-client`)
- [ ] Client configuration created with auth support
- [ ] Query and mutation definitions created
- [ ] Custom React hooks created
- [ ] ApolloProvider added to Shell app
- [ ] Environment variables configured
- [ ] Can import hooks in components
- [ ] Queries execute successfully
- [ ] Authentication headers forwarded
- [ ] Cache working (check Apollo DevTools)
- [ ] Error handling working
- [ ] Response times acceptable (<200ms)

---

## ⚡ Quick Troubleshooting

| Issue               | Solution                                      |
| ------------------- | --------------------------------------------- |
| Module not found    | Verify tsconfig path alias is added           |
| Query fails         | Check GraphQL gateway is running              |
| "Not authenticated" | Verify authorization header is being sent     |
| Slow responses      | Check network tab, verify gateway performance |
| Cache not working   | Verify InMemoryCache is configured correctly  |

---

## 🎯 Success Criteria

✅ Frontend connected to GraphQL gateway  
✅ Can execute queries from React components  
✅ Authentication working (JWT tokens forwarded)  
✅ Cache reducing duplicate requests  
✅ Error handling working properly  
✅ Response times under 200ms (p95)

---

## 📝 Next Steps After Week 4

Once Apollo Client is integrated:

1. **Migrate Auth MFE** to use Apollo Client queries
2. **Migrate Chatbot MFE** to use conversation queries
3. **Implement optimistic updates** for better UX
4. **Week 5: Dashboard migration** (7 REST → 1 GraphQL query)

---

## 📚 Reference Documentation

- `docs/APOLLO_CLIENT_INTEGRATION_GUIDE.md` - Detailed guide
- `docs/GRAPHQL_QUERY_REFERENCE.md` - Query examples
- `docs/GRAPHQL_FEDERATION_VERIFICATION.md` - GraphQL setup

---

**Ready to start Week 4? Begin with "Phase 1: Setup Apollo Client Library" above!**
