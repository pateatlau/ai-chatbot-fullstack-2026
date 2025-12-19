# GraphQL Query Reference Guide

**For Quick Testing & Reference During Manual Service Verification**

---

## 📝 Common GraphQL Queries & Mutations

### Authentication Queries

#### Register New User

```graphql
mutation RegisterUser($input: RegisterInput!) {
  register(input: $input) {
    success
    message
    user {
      id
      email
      name
      role
      isActive
      createdAt
    }
    token
    refreshToken
  }
}
```

**Variables:**

```json
{
  "input": {
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }
}
```

---

#### Login User

```graphql
mutation LoginUser($input: LoginInput!) {
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
```

**Variables:**

```json
{
  "input": {
    "email": "user@example.com",
    "password": "SecurePass123!"
  }
}
```

---

#### Get Current User

```graphql
query GetMe {
  me {
    id
    email
    username
    firstName
    lastName
    role
    isActive
    createdAt
    updatedAt
  }
}
```

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

---

#### Logout

```graphql
mutation Logout {
  logout {
    success
    message
  }
}
```

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

---

### Chat Queries (Chatbot Service)

#### Create Conversation

```graphql
mutation CreateConversation($input: CreateConversationInput) {
  createConversation(input: $input) {
    id
    userId
    title
    messageCount
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "title": "My First Chat"
  }
}
```

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

---

#### Get User Conversations

```graphql
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
```

**Variables:**

```json
{
  "input": {
    "page": 1,
    "limit": 10
  }
}
```

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

---

#### Get Single Conversation with Messages

```graphql
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
```

**Variables:**

```json
{
  "id": "conversation-uuid"
}
```

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

---

#### Get Chat Statistics

```graphql
query GetChatStats {
  chatStats {
    totalConversations
    totalMessages
    totalTokensUsed
    averageMessagesPerConversation
    activeConversations
  }
}
```

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

---

#### Send Message

```graphql
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
```

**Variables:**

```json
{
  "conversationId": "conversation-uuid",
  "input": {
    "content": "Hello, how can you help me?"
  }
}
```

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

---

### Admin Queries (Admin Service)

#### Get System Statistics

```graphql
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
```

**Headers Required:**

```
Authorization: Bearer <admin-jwt-token>
```

---

#### Get Audit Logs

```graphql
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
```

**Variables:**

```json
{
  "input": {
    "page": 1,
    "limit": 50
  }
}
```

**Headers Required:**

```
Authorization: Bearer <admin-jwt-token>
```

---

#### Assign Admin Role

```graphql
mutation AssignRole($input: AssignRoleInput!) {
  assignRole(input: $input) {
    id
    userId
    role
    permissions
    isActive
    createdAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "userId": "user-uuid",
    "role": "ADMIN"
  }
}
```

**Headers Required:**

```
Authorization: Bearer <super-admin-jwt-token>
```

---

### Federation Queries (Cross-Service)

#### Get User with All Data (Auth + Chat + Admin)

```graphql
query GetUserWithAllData($userId: ID!) {
  user(id: $userId) {
    id
    email
    username
    firstName
    lastName
    role
    isActive
    createdAt
    # From Chatbot Service
    conversations {
      id
      title
      messageCount
      lastMessage
      updatedAt
    }
    # From Admin Service (if admin)
    permissions
  }
}
```

**Variables:**

```json
{
  "userId": "user-uuid"
}
```

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

---

## 🧪 cURL Examples for Testing

### Test Health Endpoint

```bash
curl http://localhost:4000/health
```

### Register via GraphQL

```bash
curl http://localhost:4000/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Register($input: RegisterInput!) { register(input: $input) { success user { id email } token } }",
    "variables": {
      "input": {
        "email": "test@example.com",
        "password": "SecurePass123!",
        "name": "Test User"
      }
    }
  }'
```

### Login via GraphQL

```bash
curl http://localhost:4000/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { success user { id email } token } }",
    "variables": {
      "input": {
        "email": "test@example.com",
        "password": "SecurePass123!"
      }
    }
  }'
```

### Get Current User (with Auth)

```bash
curl http://localhost:4000/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "query": "{ me { id email name role } }"
  }'
```

### Get User with Conversations (Federation)

```bash
curl http://localhost:4000/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "query": "{ user(id: \"<user-id>\") { id email conversations { id title messageCount } } }"
  }'
```

### Get System Stats (Admin)

```bash
curl http://localhost:4000/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -d '{
    "query": "{ systemStats { totalUsers totalConversations activeUsers24h } }"
  }'
```

---

## 📊 Response Examples

### Successful Registration Response

```json
{
  "data": {
    "register": {
      "success": true,
      "message": "Registration successful",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "test@example.com",
        "name": "Test User",
        "role": "USER",
        "isActive": true,
        "createdAt": "2025-11-22T10:30:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Error Response

```json
{
  "errors": [
    {
      "message": "Email already registered",
      "extensions": {
        "code": "EMAIL_EXISTS"
      }
    }
  ]
}
```

### Federation Query Response (User with Conversations)

```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "test@example.com",
      "name": "Test User",
      "role": "USER",
      "conversations": [
        {
          "id": "conv-001",
          "title": "My First Chat",
          "messageCount": 5,
          "lastMessage": "Thanks for your help!",
          "updatedAt": "2025-11-22T11:00:00.000Z"
        }
      ]
    }
  }
}
```

---

## 🔑 Environment Setup for Testing

### Get JWT Token for Testing

1. Register or login to get a token
2. Copy the `token` from response
3. Add to Authorization header: `Authorization: Bearer <token>`

### Admin Token Required for Admin Queries

- Only users with `role: "ADMIN"` can query admin endpoints
- Use `assignRole` mutation to upgrade a user to admin (requires current admin)

---

## 📍 Endpoint Mapping

| Service | GraphQL Endpoint              | Port | Description                   |
| ------- | ----------------------------- | ---- | ----------------------------- |
| Gateway | http://localhost:4000/graphql | 4000 | Federated endpoint (use this) |
| Auth    | http://localhost:3000/graphql | 3000 | Auth subgraph (debugging)     |
| Chatbot | http://localhost:3001/graphql | 3001 | Chatbot subgraph (debugging)  |
| Admin   | http://localhost:3002/graphql | 3002 | Admin subgraph (debugging)    |

---

## 💡 Tips for Testing

1. **Always use the Gateway endpoint** (4000) for queries that span services
2. **Include proper Authorization headers** for authenticated queries
3. **Use GraphQL Playground** at http://localhost:4000/graphql for easier query building
4. **Check service logs** if queries fail (run in separate terminals)
5. **Verify token isn't expired** if you get "Not authenticated" errors
6. **Test one service at a time** before testing federated queries

---

## 🚀 Quick Test Sequence

1. Check health: `curl http://localhost:4000/health`
2. Register user: Use RegisterUser mutation
3. Login: Use LoginUser mutation, copy token
4. Get current user: Use GetMe query with token
5. Create conversation: Use CreateConversation mutation
6. Send message: Use SendMessage mutation
7. Get conversations: Use GetConversations query
8. Test federation: Use GetUserWithAllData query
9. Get system stats: Use GetSystemStats query (if admin)

---

## 📚 Related Documentation

- **GRAPHQL_FEDERATION_VERIFICATION.md** - Setup and troubleshooting guide
- **CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md** - Full implementation roadmap
- **Apollo GraphQL Docs** - https://www.apollographql.com/docs/apollo-server/
