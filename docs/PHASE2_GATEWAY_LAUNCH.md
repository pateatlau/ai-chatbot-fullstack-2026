# Phase 2: GraphQL Gateway - Launch Guide

**Status:** Phase 1 Day 1-2 Complete ✅  
**Date:** November 19, 2025  
**Gateway Port:** 4000  
**Status:** Ready to Test

---

## ✅ What Was Created

### 1. GraphQL Gateway Application

- **Location:** `apps/graphql-gateway`
- **Framework:** Express + Apollo Server + Apollo Gateway
- **Port:** 4000 (development)
- **Entry point:** `apps/graphql-gateway/src/main.ts`

### 2. Apollo Federation Setup

```typescript
// Connects to 3 subgraphs via introspection
Auth Subgraph:    http://localhost:3000/graphql
Chatbot Subgraph: http://localhost:3001/graphql
Admin Subgraph:   http://localhost:3002/graphql
```

### 3. Dependencies Added

```json
"@apollo/server": "^4.10.1"
"@apollo/gateway": "^2.6.1"
"@apollo/subgraph": "^2.6.1"
"@apollo/client": "^3.10.0"
"graphql": "^16.9.0"
"graphql-tag": "^2.12.6"
"dataloader": "^2.2.2"
```

### 4. Configuration Files

- ✅ `apps/graphql-gateway/project.json` - Nx configuration
- ✅ `apps/graphql-gateway/Dockerfile` - Production build
- ✅ `.env.local` - Environment variables (create with script below)

---

## 🚀 Next Steps: Launch the Gateway

### Step 1: Ensure Services Are Running

**Check Backend Services:**

```bash
# In separate terminals, start each service:
npm run dev:auth      # Port 3000
npm run dev:chatbot   # Port 3001
npm run dev:admin     # Port 3002
```

**Verify they're running:**

```bash
curl http://localhost:3000/health  # Auth
curl http://localhost:3001/health  # Chatbot
curl http://localhost:3002/health  # Admin
```

### Step 2: Configure Environment

**Create environment file:**

```bash
bash setup-graphql-env.sh
```

**Or manually set:**

```bash
export PORT=4000
export HOST=localhost
export AUTH_SUBGRAPH_URL=http://localhost:3000/graphql
export CHATBOT_SUBGRAPH_URL=http://localhost:3001/graphql
export ADMIN_SUBGRAPH_URL=http://localhost:3002/graphql
```

### Step 3: Build the Gateway

```bash
# Build the GraphQL gateway
nx build graphql-gateway

# Output should be in: dist/apps/graphql-gateway/
```

### Step 4: Start the Gateway

**Option A: Development Mode (with rebuild on changes)**

```bash
nx serve graphql-gateway
```

**Option B: Production Build (one-time)**

```bash
node dist/apps/graphql-gateway/main.js
```

**Expected output:**

```
✅ Apollo Server started
🚀 GraphQL Gateway running on http://localhost:4000/graphql
💚 Health check: http://localhost:4000/health
📊 Ready check: http://localhost:4000/ready

Connected subgraphs:
  - Auth:    http://localhost:3000/graphql
  - Chatbot: http://localhost:3001/graphql
  - Admin:   http://localhost:3002/graphql
```

---

## 🧪 Testing the Gateway

### Test 1: Health Check

```bash
curl http://localhost:4000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-11-19T10:30:00.000Z",
  "uptime": 45.234
}
```

### Test 2: Readiness Check

```bash
curl http://localhost:4000/ready

# Expected response:
{
  "ready": true,
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

### Test 3: GraphQL Query (once subgraphs have schemas)

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { types { name } } }"
  }'

# Expected: List of types from federated schema
```

### Test 4: Simple Schema Query

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { types { name } } }"
  }'
```

---

## 📦 Docker Build (Optional for now)

### Build Docker Image

```bash
docker build -t graphql-gateway:latest apps/graphql-gateway/
```

### Run in Docker

```bash
docker run -p 4000:4000 \
  -e AUTH_SUBGRAPH_URL=http://host.docker.internal:3000/graphql \
  -e CHATBOT_SUBGRAPH_URL=http://host.docker.internal:3001/graphql \
  -e ADMIN_SUBGRAPH_URL=http://host.docker.internal:3002/graphql \
  graphql-gateway:latest
```

---

## 🔗 Integration Points (Coming Next)

### Phase 2: Auth Subgraph

- Add GraphQL endpoint to `auth-service`
- Define User type with federation
- Implement resolvers
- Test with gateway

### Phase 3: Chatbot Subgraph

- Add GraphQL endpoint to `chatbot-service`
- Define Conversation & Message types
- Implement DataLoader for N+1 prevention

### Phase 4: Admin Subgraph

- Add GraphQL endpoint to `admin-service`
- Define SystemStats & Analytics types
- Implement Redis caching

### Phase 5: Frontend Integration

- Set up Apollo Client
- Migrate admin dashboard to GraphQL
- Replace 7 REST calls with 1 GraphQL query

---

## ✅ Checklist: Phase 1 Complete

- ✅ GraphQL Gateway application created
- ✅ Apollo Federation configured
- ✅ Dependencies added to package.json
- ✅ Port 4000 configured
- ✅ Health checks implemented
- ✅ Docker setup complete
- ✅ Environment configuration ready
- ✅ Feature branch created: `feature/graphql-implementation`

---

## 🎯 Success Metrics (Week 1 End)

**Must Have:**

- ✅ Gateway runs on http://localhost:4000
- ✅ Health check responds
- ✅ Subgraph introspection polling works
- ✅ Docker image builds

**Current Status:** Phase 1 (Days 1-2) Complete  
**Next: Days 3-5** Begin Phase 2 (Auth Subgraph)

---

## Troubleshooting

### Gateway Won't Start

```bash
# Check if port 4000 is in use
lsof -i :4000

# Kill existing process
kill -9 <PID>

# Or use a different port
PORT=4001 nx serve graphql-gateway
```

### Subgraph Connection Failed

```
Error: Failed to poll subgraph

Solution:
1. Ensure auth-service running: npm run dev:auth
2. Check it has GraphQL endpoint (Phase 2 task)
3. Verify URL in .env.local: AUTH_SUBGRAPH_URL=http://localhost:3000/graphql
```

### Apollo Server Errors

```bash
# Check logs for details
nx serve graphql-gateway 2>&1 | grep -i error

# Common issues:
- Missing dependencies: npm install @apollo/server
- Port already in use: kill process or change PORT
- Subgraph unreachable: check backend services running
```

---

## 📚 Next Documentation

1. **GRAPHQL_IMPLEMENTATION_PLAN.md** - Full implementation details
2. **PHASE2_GRAPHQL_REVIEW.md** - Comprehensive plan review
3. **CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md** - Master roadmap

---

**Gateway Status:** 🟢 READY FOR TESTING  
**Phase 1 Progress:** Phase 1 (Days 1-2 / 5) = 40% Complete  
**Next Milestone:** Begin Phase 2 (Auth Subgraph) - Days 3-4
