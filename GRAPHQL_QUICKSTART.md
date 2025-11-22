# GraphQL Federation - Quick Start Card

**Print this or keep in terminal for quick reference during testing**

---

## 🚀 Start Services (6 Terminals)

```bash
# Terminal 1: Database
docker-compose up postgres redis

# Terminal 2: Migrations
npx prisma migrate dev

# Terminal 3: Auth Service (Port 3000)
nx serve auth-service

# Terminal 4: Chatbot Service (Port 3001)
nx serve chatbot-service

# Terminal 5: Admin Service (Port 3002)
nx serve admin-service

# Terminal 6: GraphQL Gateway (Port 4000)
nx serve graphql-gateway
```

---

## ✅ Health Checks

```bash
# Check all services
curl http://localhost:4000/health
curl http://localhost:3000/graphql?query={health}
curl http://localhost:3001/graphql?query={health}
curl http://localhost:3002/graphql?query={health}
```

**Expected:** HTTP 200 responses from all

---

## 📝 Test Mutations (In Order)

### 1️⃣ Register User

```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Register($input: RegisterInput!) { register(input: $input) { success user { id email } token } }",
    "variables": { "input": { "email": "test@example.com", "password": "SecurePass123!", "name": "Test User" } }
  }' | jq .
```

**Save the token from response (use below)**

### 2️⃣ Login User

```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { success user { id email } token } }",
    "variables": { "input": { "email": "test@example.com", "password": "SecurePass123!" } }
  }' | jq .
```

### 3️⃣ Get Current User (Replace TOKEN)

```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "query": "{ me { id email name role } }"
  }' | jq .
```

### 4️⃣ Create Conversation

```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "query": "mutation { createConversation(input: { title: \"Test Chat\" }) { id title createdAt } }"
  }' | jq .
```

**Save the conversation ID (use below)**

### 5️⃣ Send Message (Replace CONV_ID)

```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "query": "mutation { sendMessage(conversationId: \"CONV_ID\", input: { content: \"Hello!\" }) { success message { id content } } }"
  }' | jq .
```

### 6️⃣ Federation Query - Get User with Conversations

```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "query": "{ me { id email conversations { id title messageCount } } }"
  }' | jq .
```

---

## 🌐 GraphQL Playground

Open in browser:

```
http://localhost:4000/graphql
```

**Features:**

- Schema explorer (right panel)
- Query builder (middle)
- Documentation (left panel)
- Execute queries instantly

---

## 🔍 Quick Troubleshooting

| Error                      | Solution                                                                |
| -------------------------- | ----------------------------------------------------------------------- |
| ECONNREFUSED :3000         | Auth service not running - check Terminal 3                             |
| ECONNREFUSED :4000         | Gateway not running - check Terminal 6                                  |
| "Not authenticated"        | Missing or invalid token - check Authorization header                   |
| "Email already registered" | User exists - login instead or use different email                      |
| Slow responses             | Check database is running (Terminal 1) and migrations done (Terminal 2) |
| GraphQL schema incomplete  | Wait 10 seconds for introspection polling - check logs                  |

---

## 📊 Expected Response Times

| Operation           | Time       | Status    |
| ------------------- | ---------- | --------- |
| Health check        | <10ms      | ✅        |
| User login          | 50-100ms   | ✅        |
| Get user data       | 30-50ms    | ✅        |
| Create conversation | 60-100ms   | ✅        |
| Send message        | 80-150ms   | ✅        |
| Federation query    | 100-200ms  | ✅        |
| **Total p95**       | **<200ms** | ✅ Target |

---

## 📚 Documentation Files

**For detailed reference:**

- `docs/GRAPHQL_FEDERATION_VERIFICATION.md` - Complete guide
- `docs/GRAPHQL_QUERY_REFERENCE.md` - All query examples
- `docs/WEEK3_COMPLETION_SUMMARY.md` - Status & next steps

---

## 🎯 Success Criteria (Check These)

- [ ] All services start and log "ready" or "GraphQL endpoint"
- [ ] Health endpoints return 200 OK
- [ ] Can register and receive JWT token
- [ ] Can login with existing user
- [ ] Can get current user with auth header
- [ ] Can create conversation
- [ ] Can send message
- [ ] Federation query returns user + conversations
- [ ] All responses under 200ms
- [ ] No CORS errors
- [ ] No "Not authenticated" errors (when token included)

---

## ⏭️ After Testing

1. **Document Results** - Note any issues or timings
2. **Review Schema** in GraphQL Playground
3. **Explore Queries** using Schema Explorer
4. **Plan Week 4** - Apollo Client integration
5. **Continue to Next Phase** when ready

---

## 💾 Quick Commands

```bash
# View all logs at once (new terminal)
nx show project shell
nx graph

# Check what's listening on ports
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :4000

# Restart everything
pkill -f "nx serve"
docker-compose down
```

---

**Created:** November 22, 2025  
**Phase:** 2 Week 3  
**Status:** ✅ Ready for Manual Testing
