# Phase 2: GraphQL Implementation - Kickoff

**Branch:** `feature/graphql-implementation`  
**Start Date:** November 19, 2025  
**Target Completion:** December 17, 2025 (4 weeks)  
**Status:** 🚀 Implementation Started

---

## Week 1: Phase 1 - Foundation (GraphQL Gateway)

### Goal

Set up Apollo Federation Gateway and supporting infrastructure.

### Tasks

#### Day 1-2: Project Setup & Dependencies (4 hours)

```bash
# 1. Create graphql-gateway application
nx generate @nx/node:application graphql-gateway \
  --directory=apps/graphql-gateway \
  --framework=express \
  --tags=type:backend,scope:gateway \
  --skipFormat

# 2. Install GraphQL dependencies
cd apps/graphql-gateway
npm install @apollo/server @apollo/gateway @apollo/subgraph \
  graphql graphql-tag express cors dotenv
```

**Deliverable:** Gateway project created with dependencies installed

#### Day 2-3: Apollo Gateway Configuration (4 hours)

**File:** `apps/graphql-gateway/src/main.ts`

```typescript
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.GRAPHQL_GATEWAY_PORT || 4000;
const AUTH_SUBGRAPH_URL =
  process.env.AUTH_SUBGRAPH_URL || 'http://localhost:3000/graphql';
const CHATBOT_SUBGRAPH_URL =
  process.env.CHATBOT_SUBGRAPH_URL || 'http://localhost:3001/graphql';
const ADMIN_SUBGRAPH_URL =
  process.env.ADMIN_SUBGRAPH_URL || 'http://localhost:3002/graphql';

async function startServer() {
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: 'auth', url: AUTH_SUBGRAPH_URL },
        { name: 'chatbot', url: CHATBOT_SUBGRAPH_URL },
        { name: 'admin', url: ADMIN_SUBGRAPH_URL },
      ],
      pollIntervalInMs: 10000, // Poll every 10 seconds
    }),
  });

  const server = new ApolloServer({
    gateway,
    context: async ({ req }) => {
      // Extract JWT token from Authorization header
      const token = req.headers.authorization?.replace('Bearer ', '');
      return { token };
    },
  });

  await server.start();

  const app = express();

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
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

  // Start server
  app.listen(PORT, () => {
    console.log(
      `🚀 GraphQL Gateway running on http://localhost:${PORT}/graphql`
    );
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
```

**Deliverable:** Gateway configured and ready to connect to subgraphs

#### Day 4: Environment Configuration & Docker (3 hours)

**File:** `.env.local`

```bash
# GraphQL Gateway
GRAPHQL_GATEWAY_PORT=4000
AUTH_SUBGRAPH_URL=http://localhost:3000/graphql
CHATBOT_SUBGRAPH_URL=http://localhost:3001/graphql
ADMIN_SUBGRAPH_URL=http://localhost:3002/graphql

# Frontend
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

**File:** `apps/graphql-gateway/Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY dist/apps/graphql-gateway ./dist/

# Install production dependencies
RUN npm ci --omit=dev

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["node", "dist/main.js"]
```

**Deliverable:** Docker configuration ready

#### Day 5: Testing & Validation (3 hours)

```bash
# Build the project
nx build graphql-gateway

# Run locally
nx serve graphql-gateway

# Test health endpoint
curl http://localhost:4000/health
# Expected: {"status":"healthy","timestamp":"2025-11-19T..."}

# Test GraphQL endpoint (will fail until subgraphs running)
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

**Deliverable:** Gateway running and tested locally

---

## Phase 1 Success Criteria

✅ Gateway application created and running  
✅ Health check endpoint working  
✅ Docker configuration complete  
✅ Environment variables configured  
✅ Subgraph introspection configured  
✅ CORS enabled for frontend  
✅ Tests passing locally

---

## Timeline

| Task                         | Duration     | Days       | Status     |
| ---------------------------- | ------------ | ---------- | ---------- |
| Project Setup & Dependencies | 4 hours      | Day 1-2    | 🟡 Pending |
| Apollo Gateway Configuration | 4 hours      | Day 2-3    | 🟡 Pending |
| Env Config & Docker          | 3 hours      | Day 4      | 🟡 Pending |
| Testing & Validation         | 3 hours      | Day 5      | 🟡 Pending |
| **Phase 1 Total**            | **14 hours** | **5 days** | 🟡 Pending |

---

## Parallel Work: Phase 2 (Auth Subgraph)

While the gateway is being set up, begin designing the Auth subgraph:

**Pre-work (can start now):**

1. Review Auth service current structure
2. Design User GraphQL schema
3. Plan resolver implementations
4. Identify authorization patterns

---

## Infrastructure Checklist

- [ ] Port 4000 available
- [ ] Auth service running on 3000
- [ ] Chatbot service running on 3001
- [ ] Admin service running on 3002
- [ ] PostgreSQL running
- [ ] Redis running (for Phase 4)
- [ ] Docker available
- [ ] npm dependencies compatible

---

## Success Metrics (Week 1 End)

**Must Have:**

- ✅ Gateway running on port 4000
- ✅ Health check responding
- ✅ Docker image builds successfully
- ✅ Feature branch committed with code

**Nice to Have:**

- ✅ Dev environment documentation
- ✅ Team onboarded to feature branch
- ✅ First subgraph schema started

---

## Next: Phase 2 (Auth Subgraph) - Week 1-2

Once Phase 1 is complete:

1. **Add GraphQL endpoint to Auth service** (port 3000/graphql)
2. **Define User type with federation**
3. **Implement Query and Mutation resolvers**
4. **Add authorization middleware**
5. **Test federation with gateway**

Expected: Auth subgraph integrated with gateway by end of Week 2

---

## Documentation

- [PHASE2_GRAPHQL_REVIEW.md](./docs/PHASE2_GRAPHQL_REVIEW.md) - Plan overview
- [GRAPHQL_IMPLEMENTATION_PLAN.md](./docs/GRAPHQL_IMPLEMENTATION_PLAN.md) - Full technical details
- [Apollo Federation Docs](https://www.apollographql.com/docs/federation/)

---

**Status:** Phase 1 kickoff in progress 🚀
