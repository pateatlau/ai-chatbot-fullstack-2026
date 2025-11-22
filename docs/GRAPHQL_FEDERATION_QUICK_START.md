# 🚀 GRAPHQL FEDERATION - QUICK START & INTEGRATION TESTING

## Overview

This guide explains how to start all 3 GraphQL subgraphs and the Apollo Gateway, then run comprehensive integration tests to verify federation is working correctly.

---

## 📋 Prerequisites

- Node.js v20+ installed
- PostgreSQL running locally (or configured in .env files)
- All npm packages installed (`npm install`)
- All services built (`nx build auth-service chatbot-service admin-service`)

---

## 🚀 Quick Start (4 Terminal Windows)

### Terminal 1: Start Auth Service (Port 3000)

```bash
npm run dev:auth
```

Expected output:

```
[ ready ] Auth Service running at http://localhost:3000
[ info  ] API endpoints: http://localhost:3000/api/auth
[ info  ] GraphQL: http://localhost:3000/graphql
```

---

### Terminal 2: Start Chatbot Service (Port 3001)

```bash
npm run dev:chatbot
```

Expected output:

```
[ ready ] Chatbot Service running at http://localhost:3001
[ info  ] API endpoints: http://localhost:3001/api/chatbot
[ info  ] GraphQL: http://localhost:3001/graphql
```

---

### Terminal 3: Start Admin Service (Port 3002)

```bash
npm run dev:admin
```

Expected output:

```
[ ready ] Admin Service running at http://localhost:3002
[ info  ] API endpoints: http://localhost:3002/api/admin
[ info  ] GraphQL: http://localhost:3002/graphql
```

---

### Terminal 4: Start GraphQL Gateway (Port 4000)

```bash
npm run dev:gateway
```

Expected output:

```
[ ready ] GraphQL Gateway running at http://localhost:4000
[ info  ] Apollo Gateway listening on http://localhost:4000
[ info  ] Composing subgraphs via IntrospectAndCompose...
```

**Wait 10-15 seconds** for the gateway to discover and compose all services.

---

## 🧪 Running Integration Tests

Once all 4 services are running, use a **5th terminal** to run the integration tests:

```bash
bash scripts/graphql-federation-tests.sh
```

### Expected Output

```
╔════════════════════════════════════════════════════════════╗
║ PHASE 2 - GRAPHQL FEDERATION INTEGRATION TESTS             ║
╚════════════════════════════════════════════════════════════╝

▶ Service Availability Checks
Checking if all services are running...
Auth Service:    http://localhost:3000/graphql
Chatbot Service: http://localhost:3001/graphql
Admin Service:   http://localhost:3002/graphql
Gateway:         http://localhost:4000

✅ Auth Service is responding
✅ Chatbot Service is responding
✅ Admin Service is responding

▶ Service Introspection & Schema Validation
✅ Auth Service schema has 45 types
✅ Chatbot Service schema has 38 types
✅ Admin Service schema has 42 types

▶ Gateway Federation Composition
✅ Gateway is responding to GraphQL queries
✅ Gateway has User type in schema
✅ Gateway has Conversation type (from Chatbot)
✅ Gateway has Admin type (from Admin service)

... (more tests)

✅ Passed:  25
❌ Failed:  0
⊘ Skipped: 0
─────────────────
Total:   25

Success Rate: 100%

═══════════════════════════════════════════════════════════
🎉 ALL TESTS PASSED - FEDERATION READY FOR INTEGRATION
═══════════════════════════════════════════════════════════
```

---

## 🔍 Manual Testing Examples

### 1. Test Auth Service Health

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{health}"}'
```

Response:

```json
{
  "data": {
    "health": "Auth Service OK"
  }
}
```

---

### 2. Test through Gateway

```bash
curl -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -d '{"query":"{health}"}'
```

---

### 3. Test Gateway Schema Composition

Check that all services are composed:

```bash
curl -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'
```

Look for these types in the response:

- `User` (from Auth Service)
- `Conversation` (from Chatbot Service)
- `Message` (from Chatbot Service)
- `Admin` (from Admin Service)
- `AuditLog` (from Admin Service)

---

### 4. Test Introspection for Federation Directives

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { types { name directives { name } } } }"
  }'
```

Should see `@link` and `@key` directives.

---

## 🔐 Testing with Authentication

To test authenticated endpoints, first get a JWT token:

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": { "id": "...", "email": "test@example.com" }
}
```

### 2. Use Token in GraphQL Query

```bash
curl -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"query":"{ me { id email } }"}'
```

---

## 📊 Service Architecture Verification

### Verify Each Service Has GraphQL Endpoint

```bash
# Auth Service GraphQL
curl http://localhost:3000/graphql -H "Content-Type: application/json" -d '{"query":"{__typename}"}'

# Chatbot Service GraphQL
curl http://localhost:3001/graphql -H "Content-Type: application/json" -d '{"query":"{__typename}"}'

# Admin Service GraphQL
curl http://localhost:3002/graphql -H "Content-Type: application/json" -d '{"query":"{__typename}"}'

# Gateway (should compose all)
curl http://localhost:4000 -H "Content-Type: application/json" -d '{"query":"{__typename}"}'
```

All should return `{"data":{"__typename":"Query"}}` or similar.

---

## 🛠️ Troubleshooting

### Gateway Not Composing Services

**Problem:** Gateway shows "failed to compose subgraphs"

**Solution:**

1. Check all 3 services are running and responding
2. Check services have `/graphql` endpoints
3. Look at gateway logs for specific error
4. Restart gateway with `npm run dev:gateway`

### Service Health Check Fails

**Problem:** `curl: (7) Failed to connect to localhost:3000`

**Solution:**

1. Check if service is running: `ps aux | grep npm`
2. Check for port conflicts: `lsof -i :3000`
3. Check service logs for startup errors
4. Try running `npm run dev:admin` directly to see errors

### GraphQL Queries Return Errors

**Problem:** `{"errors":[{"message":"Cannot query field 'conversations'"}]}`

**Solution:**

1. Verify you're hitting the right endpoint (check URL)
2. Check schema is loaded: `curl http://localhost:3001/graphql -d '{"query":"{__typename}"}'`
3. Check Prisma models are generated: `npx prisma generate`
4. Rebuild service: `nx build chatbot-service`

### Tests Report: "Service is not responding"

**Problem:** Tests fail at availability check

**Solution:**

1. Start all 4 services in separate terminals first
2. Wait 5-10 seconds for services to fully initialize
3. Verify connectivity: `curl -X POST http://localhost:3000/graphql -H "Content-Type: application/json" -d '{"query":"{health}"}'`

---

## 📈 Next Steps After Successful Integration Tests

Once all integration tests pass:

1. **Phase 3: Frontend Apollo Client Integration** (8 hours)
   - Setup Apollo Client in shell-mfe
   - Integrate with auth-mfe for token management
   - Add subscriptions in chatbot-mfe
   - Build admin-mfe UI components

2. **Phase 4: Testing & Production Deployment** (8 hours)
   - End-to-end integration tests
   - Load testing with k6
   - Docker containerization
   - Kubernetes deployment

---

## 📝 Log Files

Service logs are printed to the terminal. For persistent logs, you can:

```bash
# Capture Auth Service logs
npm run dev:auth > logs/auth-service.log 2>&1 &

# Capture all logs
npm run dev:auth > logs/auth.log 2>&1 &
npm run dev:chatbot > logs/chatbot.log 2>&1 &
npm run dev:admin > logs/admin.log 2>&1 &
npm run dev:gateway > logs/gateway.log 2>&1 &
```

---

## ✅ Verification Checklist

After running tests, verify:

- [ ] All 4 services are running without errors
- [ ] Integration tests show 100% pass rate
- [ ] Gateway has composed all 3 subgraphs
- [ ] Health queries return correct responses
- [ ] Schema introspection shows all types
- [ ] No errors in service logs
- [ ] Cross-service type resolution works

---

## 🎉 Success Criteria

**Integration Testing Complete When:**

✅ All services start successfully
✅ Gateway composes all 3 subgraphs
✅ Integration tests pass 100%
✅ Schema introspection works
✅ Health checks return OK
✅ No GraphQL errors on basic queries

**Ready to proceed to Phase 3: Frontend Apollo Integration**

---

Generated: November 19, 2025  
Last Updated: Phase 2.4 Complete
