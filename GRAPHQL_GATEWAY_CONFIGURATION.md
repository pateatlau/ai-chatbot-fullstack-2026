# GraphQL Gateway - Apollo Federation Configuration Guide

**Status:** ✅ Ready for Subgraph Integration  
**Gateway Version:** Apollo Server 4.x with Apollo Gateway  
**Federation:** Apollo Federation v2  
**Last Updated:** November 19, 2025

---

## 📋 Executive Summary

The AI Chatbot Fullstack application uses **Apollo Federation** to create a unified GraphQL API from multiple microservices. The Gateway orchestrates requests across three subgraphs:

1. **Auth Subgraph** - User authentication and authorization
2. **Chatbot Subgraph** - Conversation and message management
3. **Admin Subgraph** - User management and system statistics

This approach enables:

- ✅ Independent service deployment
- ✅ Shared type definitions across services
- ✅ Unified GraphQL schema
- ✅ Cross-service type composition

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Client Application (React)                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Apollo Gateway (Port 4000)  │
        │   Introspect & Compose       │
        └──┬──────────────┬──────────┬──┘
           │              │          │
      ┌────▼─┐      ┌─────▼──┐   ┌──▼────┐
      │Auth  │      │Chatbot │   │Admin   │
      │Port  │      │Port    │   │Port    │
      │3000  │      │3001    │   │3002    │
      │      │      │        │   │        │
      └──────┘      └────────┘   └────────┘
```

---

## 🚀 Current Gateway Setup

### Location

```
apps/graphql-gateway/
├── src/
│   ├── main.ts              # Gateway entry point
│   └── environment.ts        # Configuration
├── .env                      # Environment variables
└── package.json
```

### Gateway Entry Point (`main.ts`)

```typescript
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

// Subgraph URLs - can be configured via environment
const AUTH_SUBGRAPH_URL =
  process.env.AUTH_SUBGRAPH_URL || 'http://localhost:3000/graphql';
const CHATBOT_SUBGRAPH_URL =
  process.env.CHATBOT_SUBGRAPH_URL || 'http://localhost:3001/graphql';
const ADMIN_SUBGRAPH_URL =
  process.env.ADMIN_SUBGRAPH_URL || 'http://localhost:3002/graphql';

async function startServer() {
  try {
    // Apollo Gateway with Introspect & Compose
    const gateway = new ApolloGateway({
      supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
          { name: 'auth', url: AUTH_SUBGRAPH_URL },
          { name: 'chatbot', url: CHATBOT_SUBGRAPH_URL },
          { name: 'admin', url: ADMIN_SUBGRAPH_URL },
        ],
        pollIntervalInMs: 10000, // Poll every 10 seconds
        pollErrorFormatter: (e) => {
          console.error(`Failed to poll subgraph: ${e.message}`);
          return e;
        },
      }),
    });

    // Apollo Server configuration
    const server = new ApolloServer({
      gateway,
      context: async ({ req }: { req: any }) => {
        // Extract JWT from Authorization header
        const token = req.headers.authorization?.replace('Bearer ', '');
        return { token };
      },
    });

    // Start Apollo Server
    await server.start();
    console.log('✅ Apollo Server started');

    // Express app
    const app = express();

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Readiness check endpoint
    app.get('/ready', (req, res) => {
      res.json({
        ready: true,
        timestamp: new Date().toISOString(),
      });
    });

    // GraphQL endpoint
    app.use(
      '/graphql',
      cors<cors.CorsRequest>(),
      express.json({ limit: '50mb' }),
      expressMiddleware(server, {
        context: async ({ req }) => ({
          token: req.headers.authorization?.replace('Bearer ', ''),
        }),
      })
    );

    // Start Express server
    app.listen(port, host, () => {
      console.log(
        `🚀 GraphQL Gateway running on http://${host}:${port}/graphql`
      );
      console.log(`💚 Health check: http://${host}:${port}/health`);
      console.log(`📊 Ready check: http://${host}:${port}/ready`);
      console.log(`\nConnected subgraphs:`);
      console.log(`  - Auth:    ${AUTH_SUBGRAPH_URL}`);
      console.log(`  - Chatbot: ${CHATBOT_SUBGRAPH_URL}`);
      console.log(`  - Admin:   ${ADMIN_SUBGRAPH_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

### Environment Variables

Create `.env` in `apps/graphql-gateway/`:

```bash
# Gateway Configuration
PORT=4000
HOST=localhost
NODE_ENV=development

# Subgraph URLs
AUTH_SUBGRAPH_URL=http://localhost:3000/graphql
CHATBOT_SUBGRAPH_URL=http://localhost:3001/graphql
ADMIN_SUBGRAPH_URL=http://localhost:3002/graphql

# For production with Docker
# AUTH_SUBGRAPH_URL=http://auth-service:3000/graphql
# CHATBOT_SUBGRAPH_URL=http://chatbot-service:3001/graphql
# ADMIN_SUBGRAPH_URL=http://admin-service:3002/graphql
```

### Running the Gateway

```bash
# Development
nx serve graphql-gateway

# With watch mode
nx serve graphql-gateway --watch

# With custom port
PORT=5000 nx serve graphql-gateway

# With custom subgraph URLs
AUTH_SUBGRAPH_URL=http://auth:3000/graphql npx nx serve graphql-gateway
```

---

## 📡 Subgraph Requirements

Each subgraph service must expose a GraphQL endpoint at `/graphql` with:

### 1. GraphQL Schema with Federation Directives

Example (Auth Service schema):

```graphql
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0")

type User @key(fields: "id") {
  id: ID!
  email: String!
  name: String
  role: String!
  createdAt: DateTime!
}

type Query {
  me(token: String!): User
  user(id: ID!): User @auth
}

type Mutation {
  login(email: String!, password: String!): AuthPayload!
  logout: Boolean!
}

type AuthPayload {
  accessToken: String!
  refreshToken: String!
  user: User!
}
```

### 2. Apollo Subgraph Setup

```typescript
// In each service main.ts
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { typeDefs, resolvers } from './schema';

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0")
  
  type Query {
    # Your queries
  }
`;

const server = new ApolloServer({
  schema: buildSubgraphSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});
```

### 3. Required Exports

Each service should export:

- ✅ GraphQL schema with `@federation` directives
- ✅ Type definitions with `@key` directives
- ✅ Reference resolver functions
- ✅ Health check endpoint (`/health`)
- ✅ GraphQL endpoint (`/graphql`)

---

## 🔗 Federation Type Composition

### Key Directive Usage

Define entities with the `@key` directive:

```graphql
# Auth Service - Defines User entity
type User @key(fields: "id") {
  id: ID!
  email: String!
  name: String!
  role: String!
}

# Chatbot Service - References User
extend type User @key(fields: "id") {
  id: ID! @external
  conversations: [Conversation!]!
}

# Admin Service - References User
extend type User @key(fields: "id") {
  id: ID! @external
  auditLogs: [AuditLog!]!
}
```

### Entity Reference Resolvers

```typescript
// In Chatbot Service resolvers
const resolvers = {
  User: {
    __resolveReference: async (user) => {
      // Fetch conversations for this user
      return {
        id: user.id,
        conversations: await getConversations(user.id),
      };
    },
  },
};
```

---

## 🔀 Composition Strategy

### Introspect & Compose (Current)

```typescript
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: 'http://localhost:3000/graphql' },
      { name: 'chatbot', url: 'http://localhost:3001/graphql' },
      { name: 'admin', url: 'http://localhost:3002/graphql' },
    ],
    pollIntervalInMs: 10000,
  }),
});
```

**Pros:**

- ✅ No build step required
- ✅ Dynamic schema composition
- ✅ Automatic subgraph discovery
- ✅ Suitable for development

**Cons:**

- ⚠️ Network call overhead
- ⚠️ Polling latency

### Managed Federation (Production)

```typescript
import { ApolloGateway } from '@apollo/gateway';

const gateway = new ApolloGateway({
  supergraphSdl: process.env.APOLLO_SCHEMA_CONFIG_DELIVERY_ENDPOINT,
  // Use Apollo Studio for schema management
});
```

**Pros:**

- ✅ Schema versioning
- ✅ Composition validation
- ✅ Production-ready
- ✅ Apollo Studio integration

### Static Supergraph (Build-time)

```bash
# Create supergraph.graphql at build time
rover supergraph compose \
  --config supergraph-config.yaml \
  > supergraph.graphql
```

Then reference in gateway:

```typescript
import fs from 'fs';
import path from 'path';

const supergraphSdl = fs.readFileSync(
  path.join(__dirname, 'supergraph.graphql'),
  'utf-8'
);

const gateway = new ApolloGateway({ supergraphSdl });
```

---

## 📊 Gateway Endpoints

### GraphQL Endpoint

```
POST http://localhost:4000/graphql
```

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request:**

```graphql
query GetUser {
  me {
    id
    email
    name
    role
  }
}
```

### Health Check

```
GET http://localhost:4000/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-19T10:30:00Z",
  "uptime": 3600
}
```

### Readiness Check

```
GET http://localhost:4000/ready
```

**Response:**

```json
{
  "ready": true,
  "timestamp": "2025-11-19T10:30:00Z"
}
```

---

## 🔍 Monitoring & Debugging

### View Composed Schema

```bash
# Using Apollo CLI
apollo graph introspect http://localhost:4000/graphql

# Or query introspection
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{__schema{types{name}}}"}'
```

### Enable Debug Logging

```typescript
// In main.ts
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [...],
    pollIntervalInMs: 10000,
    logger: {
      info(msg) { console.log(`[Gateway Info] ${msg}`); },
      error(msg) { console.error(`[Gateway Error] ${msg}`); },
      warn(msg) { console.warn(`[Gateway Warn] ${msg}`); },
    },
  }),
});
```

### Check Subgraph Connection

```bash
# Test Auth Subgraph
curl http://localhost:3000/health

# Test Chatbot Subgraph
curl http://localhost:3001/health

# Test Admin Subgraph
curl http://localhost:3002/health
```

---

## 🛠️ Federation Setup Checklist

### Phase 1: Service Preparation

- [ ] Each service has GraphQL schema with `@federation` directives
- [ ] Each service implements `@key` directives for entities
- [ ] Each service has reference resolvers implemented
- [ ] Each service exposes `/graphql` endpoint
- [ ] Each service has `/health` endpoint
- [ ] Services configured with CORS for gateway access

### Phase 2: Gateway Configuration

- [ ] Gateway configured with all subgraph URLs
- [ ] Environment variables properly set
- [ ] JWT token handling in context
- [ ] Health and readiness endpoints working
- [ ] Gateway can start without errors

### Phase 3: Schema Composition

- [ ] Gateway successfully introspects all subgraphs
- [ ] No conflicting type definitions
- [ ] All entity references properly resolved
- [ ] Cross-service queries working

### Phase 4: Testing

- [ ] Can execute queries across subgraphs
- [ ] Authentication context passed to subgraphs
- [ ] Error handling working properly
- [ ] Monitoring and logging functional

---

## 📝 Example Queries

### Query Users with Conversations

```graphql
query GetUserWithConversations {
  me {
    id
    email
    name
    role
    conversations {
      id
      title
      messageCount
      createdAt
    }
  }
}
```

### Query Admin Stats

```graphql
query GetAdminStats {
  stats {
    totalUsers
    totalConversations
    totalMessages
    activeUsers
    averageMessagesPerConversation
  }
}
```

### Mutation: Create Conversation

```graphql
mutation CreateConversation {
  createConversation(input: { title: "My Chat" }) {
    id
    title
    createdAt
    user {
      id
      email
    }
  }
}
```

---

## 🚨 Troubleshooting

### Gateway Cannot Connect to Subgraph

**Symptom:** Error in logs about unreachable subgraph

**Solution:**

```bash
# 1. Check subgraph is running
curl http://localhost:3000/health

# 2. Check URL in environment
echo $AUTH_SUBGRAPH_URL

# 3. Test direct GraphQL connection
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{__typename}"}'

# 4. Check network connectivity
ping localhost:3000
```

### Type Composition Errors

**Symptom:** "Apollo Gateway Error: Cannot construct a schema"

**Solution:**

```bash
# Verify each schema is valid
apollo schema check --localSchemaFile=schema.graphql

# Check for conflicting type names
# Make sure @key directives use unique fields
# Ensure reference resolvers are implemented
```

### Token Not Passed to Subgraph

**Symptom:** Authenticated queries fail

**Solution:**

```typescript
// Ensure context includes token in gateway
context: async ({ req }) => ({
  token: req.headers.authorization?.replace('Bearer ', ''),
});

// Subgraph resolvers receive context
const resolvers = {
  Query: {
    me: async (_, __, { token }) => {
      // Verify token
    },
  },
};
```

### Polling Issues

**Symptom:** Schema not updating or excessive polling logs

**Solution:**

```typescript
// Adjust polling interval
pollIntervalInMs: 30000, // 30 seconds instead of 10

// Or increase error tolerance
supergraphSdl: new IntrospectAndCompose({
  subgraphs: [...],
  pollIntervalInMs: 30000,
  maxPollAttempts: 5,
  pollTimeoutInMs: 5000,
});
```

---

## 🎯 Next Steps for Federation

### Phase 1: Current Status ✅

- [x] Gateway infrastructure in place
- [x] Subgraph URLs configured
- [x] Health checks implemented

### Phase 2: Service Federation

- [ ] Add GraphQL schema to each service
- [ ] Implement @federation directives
- [ ] Add entity reference resolvers
- [ ] Test schema composition

### Phase 3: Integration

- [ ] Cross-service queries
- [ ] Shared type composition
- [ ] Authentication propagation
- [ ] Error handling

### Phase 4: Production

- [ ] Apollo Studio integration (managed federation)
- [ ] Schema versioning
- [ ] Composition validation
- [ ] Monitoring and tracing

---

## 📚 Resources

- [Apollo Federation Documentation](https://www.apollographql.com/docs/federation/)
- [Apollo Subgraph Setup](https://www.apollographql.com/docs/federation/subgraph-spec/)
- [Apollo Gateway Guide](https://www.apollographql.com/docs/federation/managed-federation/setup/)
- [Apollo CLI](https://www.apollographql.com/docs/rover/)
- [Federation Examples](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-gateway/examples)

---

## 📊 Performance Considerations

### Composition Time

- **Introspect & Compose:** ~100-500ms per poll
- **Static Supergraph:** ~0ms (pre-built)
- **Managed Federation:** ~1-2 seconds (cached)

### Query Resolution

- **Single-service query:** ~10-50ms
- **Cross-service query:** ~20-100ms (depends on resolvers)
- **With N+1 prevention:** ~10-30ms

### Scalability

- Recommended max: 5-10 subgraphs
- Each subgraph should be independently scalable
- Gateway itself is stateless and horizontally scalable

---

**Last Updated:** November 19, 2025  
**Status:** ✅ Ready for Subgraph Implementation  
**Maintained by:** Development Team
