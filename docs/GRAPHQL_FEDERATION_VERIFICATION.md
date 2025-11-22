# GraphQL Federation Setup Verification Guide

**Date:** November 22, 2025  
**Phase:** 2 - GraphQL Implementation  
**Status:** ✅ Infrastructure Ready for Testing  
**Next Step:** Manual service startup and federated query testing

---

## 📋 Executive Summary

All three GraphQL subgraphs (Auth, Chatbot, Admin) and the Apollo Federation Gateway have been implemented and are **ready for manual testing**. This document provides step-by-step instructions for starting services and verifying the federation setup works end-to-end.

### Completed Components:

✅ **GraphQL Gateway** (`apps/graphql-gateway`)

- Apollo Federation v2 with IntrospectAndCompose
- Introspection polling every 10 seconds
- Port: 4000
- Subgraph URLs configured

✅ **Auth Service Subgraph** (`apps/auth-service`)

- User type with `@key` directive
- 10+ queries and mutations
- Federation reference resolver
- Port: 3000

✅ **Chatbot Service Subgraph** (`apps/chatbot-service`)

- Extends User type from Auth
- Conversation and Message types
- Pagination support
- Port: 3001

✅ **Admin Service Subgraph** (`apps/admin-service`)

- Extends User type from Auth
- System stats and audit logs
- Role management
- Port: 3002

---

## 🚀 Quick Start: Manual Service Startup

### Prerequisites

Ensure all dependencies are installed:

```bash
npm install
```

### Step 1: Start All Services (5 Terminal Windows)

**Terminal 1 - PostgreSQL (if using Docker):**

```bash
docker-compose up postgres redis
```

**Terminal 2 - Prisma Migration:**

```bash
npx prisma migrate dev
```

**Terminal 3 - Auth Service:**

```bash
nx serve auth-service
```

**Terminal 4 - Chatbot Service:**

```bash
nx serve chatbot-service
```

**Terminal 5 - Admin Service:**

```bash
nx serve admin-service
```

**Terminal 6 - GraphQL Gateway:**

```bash
nx serve graphql-gateway
```

### Expected Output

**GraphQL Gateway (http://localhost:4000):**

```
🚀 GraphQL Gateway running on http://localhost:4000/graphql
💚 Health check: http://localhost:4000/health
📊 Ready check: http://localhost:4000/ready

Connected subgraphs:
  - Auth:    http://localhost:3000/graphql
  - Chatbot: http://localhost:3001/graphql
  - Admin:   http://localhost:3002/graphql
```

**Each Service:**

```
✅ Apollo Server started
[ ready ] GraphQL endpoint at http://localhost:3XXX/graphql
```

---

## 📊 Testing GraphQL Federation

### Test 1: Health Checks

**Check Gateway Health:**

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T10:00:00.000Z",
  "uptime": 123.456
}
```

**Check Each Subgraph Health:**

```bash
# Auth
curl http://localhost:3000/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { health }"}'

# Chatbot
curl http://localhost:3001/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { health }"}'

# Admin
curl http://localhost:3002/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { health }"}'
```

### Test 2: Apollo Studio / GraphQL Playground

**Option A: Apollo Studio (Recommended)**

1. Open GraphQL Playground at: http://localhost:4000/graphql
2. Click "Explorer" tab to see all available queries

**Option B: Manual GraphQL Query via cURL**

**Register a User:**

```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation RegisterUser($input: RegisterInput!) { register(input: $input) { success message user { id email name role } token } }",
    "variables": {
      "input": {
        "email": "test@example.com",
        "password": "SecurePass123!",
        "name": "Test User"
      }
    }
  }'
```

Expected response:

```json
{
  "data": {
    "register": {
      "success": true,
      "message": "Registration successful",
      "user": {
        "id": "uuid-here",
        "email": "test@example.com",
        "name": "Test User",
        "role": "USER"
      },
      "token": "jwt-token-here"
    }
  }
}
```

**Login User:**

```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { success message user { id email name role } token } }",
    "variables": {
      "input": {
        "email": "test@example.com",
        "password": "SecurePass123!"
      }
    }
  }'
```

### Test 3: Federation - Get User with Conversations (Cross-Service)

This query combines data from **Auth**, **Chatbot**, and **Admin** subgraphs:

```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token-from-login>" \
  -d '{
    "query": "{
      user(id: \"<user-id>\") {
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
        analyticsData {
          totalTokensUsed
          averageResponseTime
          isPremium
        }
      }
    }"
  }'
```

Expected response:

```json
{
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "test@example.com",
      "name": "Test User",
      "role": "USER",
      "conversations": [
        {
          "id": "conv-1",
          "title": "My First Chat",
          "messageCount": 5,
          "createdAt": "2025-11-22T10:00:00Z"
        }
      ],
      "analyticsData": {
        "totalTokensUsed": 1250,
        "averageResponseTime": 0.85,
        "isPremium": false
      }
    }
  }
}
```

### Test 4: Federated Schema Composition

**Check that all subgraphs are properly composed:**

```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "__schema { types { name } }"
  }'
```

Should include types from all services:

- From Auth: `User`, `LoginInput`, `AuthResponse`, `LoginInput`
- From Chatbot: `Conversation`, `Message`, `ChatStats`
- From Admin: `Admin`, `SystemStats`, `AuditLog`

### Test 5: Introspection Check

Verify gateway is properly introspecting subgraphs:

```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "__schema { types { name kind } }"
  }' | jq 'length'
```

Should show hundreds of types available.

---

## 🔍 Troubleshooting

### Issue: Gateway Connection Refused

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:3000`

**Solution:**

1. Ensure auth-service is running on port 3000
2. Check service logs for errors
3. Verify firewall isn't blocking localhost connections

```bash
# Check if port is listening
lsof -i :3000
lsof -i :3001
lsof -i :3002
```

### Issue: GraphQL Schema Not Composed

**Problem:** Gateway starts but shows incomplete schema

**Solution:**

1. Check subgraph URLs are correct in gateway
2. Verify each subgraph's `/graphql` endpoint responds
3. Check for syntax errors in schema definitions

```bash
# Test each subgraph's GraphQL endpoint
curl http://localhost:3000/graphql?query={__typename}
curl http://localhost:3001/graphql?query={__typename}
curl http://localhost:3002/graphql?query={__typename}
```

### Issue: Federation Errors

**Problem:** Apollo errors about federation directives

**Solution:**

1. Ensure `@apollo/subgraph` is installed in services
2. Verify `buildSubgraphSchema` is used (not `buildSchema`)
3. Check `@key` directives on types

```bash
# Verify subgraph dependencies
npm ls @apollo/subgraph @apollo/server
```

### Issue: Authentication Not Forwarded

**Problem:** Mutations return "Not authenticated" error

**Solution:**

1. Include Authorization header in requests:

```bash
-H "Authorization: Bearer <token>"
```

2. Verify context forwarding in gateway:

```typescript
context: async ({ req }: any) => ({
  token: req.headers.authorization?.replace('Bearer ', ''),
});
```

3. Verify context is passed to resolvers in each service

---

## 📈 Performance Testing

### Query Performance Baseline

After services are running, test performance with this query:

```bash
# Time the gateway query
time curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ user(id: \"test-id\") { id email role conversations { id title } } }"}'
```

**Expected Results:**

- Auth Service: <50ms
- Chatbot Service: <100ms (with DB query)
- Admin Service: <50ms
- Gateway Overhead: <20ms
- **Total: <200ms** (p95)

### Load Testing with k6

```bash
# Run basic load test
k6 run k6/graphql-load-test.js
```

Expected output should show response times under 500ms with 10 concurrent users.

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         Apollo GraphQL Gateway (Port 4000)          │
│         Introspection Polling (10s intervals)       │
└──────────────┬──────────────┬──────────────┬────────┘
               │              │              │
        ┌──────▼────┐  ┌──────▼────┐  ┌─────▼────┐
        │ Auth Sub  │  │ Chatbot   │  │ Admin    │
        │ (3000)    │  │ Sub (3001)│  │ Sub      │
        │           │  │           │  │ (3002)   │
        │ @key User │  │ @extends  │  │ @extends │
        │           │  │ User      │  │ User     │
        └──────┬────┘  └──────┬────┘  └────┬─────┘
               │              │             │
        ┌──────▼────┐  ┌──────▼────┐  ┌────▼─────┐
        │PostgreSQL │  │PostgreSQL │  │PostgreSQL│
        │ myapp_dev │  │ myapp_dev │  │myapp_dev │
        └───────────┘  └───────────┘  └──────────┘
```

---

## 🎯 Next Steps After Verification

### After confirming all tests pass:

1. **Apollo Client Integration** (Week 4, Days 3-4)
   - Install `@apollo/client` in frontend
   - Create Apollo Client configuration
   - Add ApolloProvider to Shell app
   - Implement first GraphQL query

2. **Migrate Admin Dashboard** (Week 5)
   - Convert 7 REST calls → 1 GraphQL query
   - Implement caching strategy
   - Verify 50%+ performance improvement

3. **Real-time Subscriptions** (Week 6+)
   - Implement WebSocket support in gateway
   - Add subscriptions for message streaming
   - Integrate with frontend

---

## 📝 Checklist for Successful Federation

- [ ] All services start without errors
- [ ] Each service logs "GraphQL endpoint ready"
- [ ] Gateway logs "Apollo Server started"
- [ ] Gateway shows all 3 subgraphs in startup logs
- [ ] Health checks return 200 OK
- [ ] Each subgraph's `/graphql` endpoint responds
- [ ] Federation introspection polling works (check logs every 10s)
- [ ] Can register a new user via mutation
- [ ] Can login and receive JWT token
- [ ] Can query user with cross-service fields
- [ ] Authorization header forwarding works
- [ ] Gateway schema includes types from all services

---

## 📚 Documentation References

- **Apollo Federation**: https://www.apollographql.com/docs/apollo-server/federation/
- **Apollo Server**: https://www.apollographql.com/docs/apollo-server/
- **GraphQL Best Practices**: https://graphql.org/learn/best-practices/

---

## 🔗 Related Files

- `apps/graphql-gateway/src/main.ts` - Gateway configuration
- `apps/auth-service/src/graphql/` - Auth subgraph
- `apps/chatbot-service/src/graphql/` - Chatbot subgraph
- `apps/admin-service/src/graphql/` - Admin subgraph
- `CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md` - Full roadmap context
