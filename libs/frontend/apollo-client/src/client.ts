import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const GRAPHQL_GATEWAY_URL =
  import.meta.env.VITE_GRAPHQL_GATEWAY_URL || 'http://localhost:4000/graphql';

// HTTP Link for GraphQL requests
const httpLink = createHttpLink({
  uri: GRAPHQL_GATEWAY_URL,
  credentials: 'include',
});

// Error Handling Link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(
        `[GraphQL Error] ${operation.operationName}: ${message}`,
        extensions
      );

      // Handle 401 Unauthorized - redirect to login
      if (extensions?.code === 'UNAUTHENTICATED') {
        console.warn('Authentication token invalid or expired');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }

      // Handle 403 Forbidden - insufficient permissions
      if (extensions?.code === 'FORBIDDEN') {
        console.warn('Insufficient permissions for this operation');
      }
    });
  }

  if (networkError) {
    console.error(`[Network Error]: ${networkError.message}`);

    // Handle connection errors
    if ('statusCode' in networkError) {
      if (networkError.statusCode === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      if (networkError.statusCode === 503) {
        console.error('GraphQL service unavailable');
      }
    }
  }
});

// Auth Link - Add Authorization header with JWT token
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken');

  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  };
});

// Cache Configuration with type policies
export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        conversations: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        conversation: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
    User: {
      keyFields: ['id'],
      fields: {
        conversations: {
          merge(existing = [], incoming = []) {
            return [...incoming];
          },
        },
      },
    },
    Conversation: {
      keyFields: ['id'],
      fields: {
        messages: {
          merge(existing = [], incoming = []) {
            return [...incoming];
          },
        },
      },
    },
    Message: {
      keyFields: ['id'],
    },
    SystemStats: {
      keyFields: false, // This is a singleton-like type
    },
    ChatStats: {
      keyFields: false, // This is a singleton-like type
    },
  },
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;
