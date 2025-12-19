# 🧪 WEEK 3 INTEGRATION TEST - Priority 1 Execution

**Date:** November 23, 2025  
**Phase:** Priority 1 - Verify Full Stack Integration  
**Objective:** Validate all Week 3 work before proceeding to Week 4

---

## 📋 TEST PLAN

### Step 1: Schema Fixes ✅ COMPLETE

- ✅ Fixed User type to match database (name instead of firstName/lastName)
- ✅ Added avatar field to schema and resolvers
- ✅ Updated all User response objects in auth subgraph
- ✅ Aligned GraphQL schema with PostgreSQL data model

### Step 2: Service Startup

**Command to start full stack:**

```bash
npm run dev
```

**Expected services:**

- Shell App: http://localhost:5173
- Auth MFE: http://localhost:5174
- Chatbot MFE: http://localhost:5175
- Admin MFE: http://localhost:5176
- Profile MFE: http://localhost:5177
- Auth Service: http://localhost:3000/graphql
- Chatbot Service: http://localhost:3001/graphql
- Admin Service: http://localhost:3002/graphql
- GraphQL Gateway: http://localhost:4000/graphql

### Step 3: Automated Integration Tests

**Command to run tests:**

```bash
npm run test:graphql:integration
```

**Tests include:**

1. Gateway health check
2. Auth service health check
3. Schema introspection
4. Query type validation
5. Mutation type validation
6. Auth query operations (me query)
7. Auth mutation operations (register)
8. Federation support verification

---

## 🚀 MANUAL TESTING GUIDE

If automated tests fail, use these manual tests:

### Test Auth Service Direct Access

```bash
# Health check
curl http://localhost:3000/health

# GraphQL endpoint
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'
```

### Test Gateway with Schema Introspection

```bash
# Full schema
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'

# Check User type
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __type(name: \"User\") { name fields { name type { kind } } } }"}'

# Check Query type
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __type(name: \"Query\") { name fields { name } } }"}'
```

### Test Unauthenticated Query (Expected to fail with proper error)

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ me { id email name } }"}'

# Expected response:
# {
#   "errors": [
#     {
#       "message": "Not authenticated",
#       "extensions": { "code": "UNAUTHENTICATED" }
#     }
#   ]
# }
```

### Test Register Mutation

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(input: { email: \"test@example.com\", password: \"Test123!\" name: \"Test User\" }) { success message user { id email name role avatar } token } }"
  }'
```

### Test Login Mutation (after registration)

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: { email: \"test@example.com\", password: \"Test123!\" }) { success message user { id email name role avatar } token } }"
  }'
```

---

## ✅ SUCCESS CRITERIA

### Week 3 Completion Checklist

- [ ] **Gateway running** - All 3 subgraphs discovered
- [ ] **Schema composed** - All types available in gateway
- [ ] **Auth queries work** - me, user, users queries valid
- [ ] **Auth mutations work** - register, login mutations valid
- [ ] **Federation working** - User type has @key directive
- [ ] **Error handling** - Proper "Not authenticated" errors
- [ ] **Database connected** - User data persists
- [ ] **All tests pass** - npm run test:graphql:integration passes

---

## 📊 RESULTS MATRIX

| Component             | Test            | Expected       | Status       |
| --------------------- | --------------- | -------------- | ------------ |
| **Gateway**           | Health check    | HTTP 200       | ⏳ To verify |
| **Auth Service**      | Health check    | HTTP 200       | ⏳ To verify |
| **Schema**            | Introspection   | All types      | ⏳ To verify |
| **Query.me**          | Unauthenticated | Error 401      | ⏳ To verify |
| **Mutation.register** | Valid input     | User created   | ⏳ To verify |
| **Mutation.login**    | Valid creds     | Token received | ⏳ To verify |
| **Federation**        | User type       | @key fields    | ⏳ To verify |

---

## 🔧 TROUBLESHOOTING

### Issue: Port already in use

```bash
# Kill existing processes
npm run kill:all

# Wait
sleep 3

# Try again
npm run dev
```

### Issue: Gateway not connecting to subgraph

1. Verify auth service running: `curl http://localhost:3000/health`
2. Check gateway logs for connection errors
3. Verify environment variables: `echo $AUTH_SUBGRAPH_URL`

### Issue: Schema composition fails

1. Check if auth service started successfully
2. Verify GraphQL endpoint exists: `curl http://localhost:3000/graphql`
3. Check subgraph exports types with @key directive

### Issue: Database connection errors

1. Verify PostgreSQL running: `npm run db:status`
2. Check DATABASE_URL in .env
3. Run migrations: `npx prisma migrate deploy`

---

## 📝 NEXT STEPS AFTER VALIDATION

**If all tests pass:**

1. ✅ Document findings
2. ✅ Commit all changes
3. ✅ Begin Week 4 Chatbot subgraph
4. ✅ Week 4 estimated start: Tomorrow morning

**If tests fail:**

1. ✅ Identify root cause
2. ✅ Fix issues
3. ✅ Re-run tests
4. ✅ Iterate until passing

---

## 📎 RELATED DOCUMENTATION

- `PHASE2_COMPLETION_STATUS.md` - Week 3 overview
- `GRAPHQL_SCHEMA_ANALYSIS.md` - Schema requirements
- `apps/auth-service/src/graphql/schema.ts` - Auth schema
- `apps/graphql-gateway/src/main.ts` - Gateway config

---

**Test Status:** 🟡 READY TO EXECUTE  
**Next Action:** Run `npm run dev` then `npm run test:graphql:integration`  
**Estimated Time:** 30-45 minutes for full verification
