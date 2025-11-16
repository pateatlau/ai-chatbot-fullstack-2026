# Chatbot Service - Complete Implementation

**Date:** November 16, 2025  
**Status:** ✅ **COMPLETE**  
**Service:** Chatbot Service (Week 2 - Backend)

---

## 🎯 Implementation Summary

The Chatbot Service is a complete microservice handling AI-powered conversations with streaming responses, rate limiting, and token tracking.

### Key Features Implemented

✅ **Conversation Management**

- Create, read, update, delete conversations
- Soft delete with recovery capability
- Pagination support
- User ownership verification

✅ **Message Handling**

- Send messages with streaming AI responses
- Server-Sent Events (SSE) for real-time updates
- Message history with pagination
- Soft delete for messages

✅ **OpenAI Integration**

- GPT-4o-mini model integration
- Streaming chat completions
- Context window management (last 10 messages)
- Token counting and tracking

✅ **Rate Limiting**

- 10 messages per minute per user
- Redis-based implementation
- Graceful degradation if Redis unavailable
- Rate limit headers in responses

✅ **Token Usage Tracking**

- Daily token usage per user
- Automatic aggregation
- Statistics endpoint

✅ **Security**

- JWT authentication on all routes
- User ownership verification
- Input validation
- SQL injection protection (Prisma)

---

## 📦 Technology Stack

| Component | Technology | Version |
| --------- | ---------- | ------- |
| Runtime   | Node.js    | 20+     |
| Framework | Express    | 4.21+   |
| Database  | PostgreSQL | 16+     |
| ORM       | Prisma     | 6.19+   |
| Cache     | Redis      | 7+      |
| AI        | OpenAI SDK | Latest  |
| Auth      | JWT        | 9.0+    |

---

## 🗄️ Database Schema

### Tables Created

**conversations**

```sql
- id: UUID (PK)
- userId: UUID
- title: VARCHAR(200)
- isDeleted: BOOLEAN
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
Indexes: [userId, createdAt], [userId, isDeleted]
```

**messages**

```sql
- id: UUID (PK)
- conversationId: UUID (FK -> conversations)
- role: VARCHAR ('user' | 'assistant')
- content: TEXT
- tokenCount: INTEGER
- isDeleted: BOOLEAN
- createdAt: TIMESTAMP
Index: [conversationId, createdAt]
```

**token_usage**

```sql
- id: UUID (PK)
- userId: UUID
- date: DATE
- tokens: INTEGER
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
Unique: [userId, date]
Index: [userId, date]
```

---

## 🔌 API Endpoints

### Health Check

```
GET /health
Response: { status: "ok", service: "chatbot-service" }
```

### Conversations

**Create Conversation**

```http
POST /api/chat/conversations
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "My Conversation" // optional
}

Response: 201
{
  "id": "uuid",
  "userId": "uuid",
  "title": "My Conversation",
  "isDeleted": false,
  "createdAt": "2025-11-16T...",
  "updatedAt": "2025-11-16T..."
}
```

**List Conversations**

```http
GET /api/chat/conversations?page=1&limit=20
Authorization: Bearer {token}

Response: 200
{
  "conversations": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "My Conversation",
      "isDeleted": false,
      "createdAt": "2025-11-16T...",
      "updatedAt": "2025-11-16T...",
      "_count": {
        "messages": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**Get Conversation**

```http
GET /api/chat/conversations/:id
Authorization: Bearer {token}

Response: 200
{
  "id": "uuid",
  "userId": "uuid",
  "title": "My Conversation",
  "isDeleted": false,
  "createdAt": "2025-11-16T...",
  "updatedAt": "2025-11-16T...",
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "role": "user",
      "content": "Hello!",
      "tokenCount": 2,
      "isDeleted": false,
      "createdAt": "2025-11-16T..."
    }
  ]
}
```

**Update Conversation**

```http
PATCH /api/chat/conversations/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title"
}

Response: 200
{
  "id": "uuid",
  "userId": "uuid",
  "title": "Updated Title",
  "isDeleted": false,
  "createdAt": "2025-11-16T...",
  "updatedAt": "2025-11-16T..."
}
```

**Delete Conversation**

```http
DELETE /api/chat/conversations/:id
Authorization: Bearer {token}

Response: 200
{
  "message": "Conversation deleted successfully"
}
```

### Messages

**Send Message (Streaming)**

```http
POST /api/chat/conversations/:id/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Tell me about TypeScript"
}

Response: 200 (Server-Sent Events)
Content-Type: text/event-stream

data: {"type":"userMessage","message":{...}}

data: {"type":"delta","content":"Type"}

data: {"type":"delta","content":"Script"}

data: {"type":"delta","content":" is"}

data: {"type":"complete","message":{...}}

Rate Limit: 10 requests per minute
Headers:
  X-RateLimit-Limit: 10
  X-RateLimit-Remaining: 9
```

**Get Messages**

```http
GET /api/chat/conversations/:id/messages?page=1&limit=50
Authorization: Bearer {token}

Response: 200
{
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "role": "user",
      "content": "Hello!",
      "tokenCount": 2,
      "isDeleted": false,
      "createdAt": "2025-11-16T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

**Delete Message**

```http
DELETE /api/chat/messages/:id
Authorization: Bearer {token}

Response: 200
{
  "message": "Message deleted successfully"
}
```

### Statistics

**Get Chat Stats**

```http
GET /api/chat/stats
Authorization: Bearer {token}

Response: 200
{
  "totalConversations": 15,
  "totalMessages": 230,
  "todayTokens": 12450
}
```

---

## 🚀 Running the Service

### Prerequisites

```bash
# PostgreSQL running
docker-compose up -d postgres

# Redis running
docker-compose up -d redis

# Environment variables set
cd apps/chatbot-service
cp .env.example .env
# Edit .env with your OPENAI_API_KEY
```

### Development

```bash
# Start the service
npm run dev:chatbot

# Service runs on http://localhost:3001
```

### Database Setup

```bash
# Generate Prisma Client
cd apps/chatbot-service
npx prisma generate

# Run migrations
npx prisma migrate dev

# View database
npx prisma studio
```

### Testing

```bash
# Run test script
./test-chatbot-service.sh

# Manual test with curl
curl http://localhost:3001/health
```

---

## 🏗️ Architecture

### Service Structure

```
apps/chatbot-service/
├── src/
│   ├── main.ts                    # Express app setup
│   ├── lib/
│   │   └── prisma.ts             # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication
│   │   └── rateLimit.ts          # Rate limiting with Redis
│   ├── routes/
│   │   └── chat.routes.ts        # All chat endpoints
│   └── services/
│       └── openai.service.ts     # OpenAI integration
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
├── .env                          # Environment variables
├── project.json                  # Nx configuration
└── tsconfig.json                 # TypeScript config
```

### Request Flow

```
Client Request
    ↓
Express Middleware (CORS, JSON parsing)
    ↓
Authentication Middleware (JWT verify)
    ↓
Rate Limit Middleware (Redis check)
    ↓
Route Handler
    ↓
Database Query (Prisma)
    ↓
OpenAI API (if sending message)
    ↓
Stream Response (SSE)
    ↓
Client
```

### OpenAI Integration Flow

```
1. User sends message
2. Fetch conversation history (last 10 messages)
3. Build context array with system prompt
4. Create streaming completion request
5. Stream tokens back to client via SSE
6. Save complete response to database
7. Track token usage
8. Update conversation timestamp
```

---

## 🔒 Security Features

### Authentication

- JWT token required on all `/api/chat/*` routes
- Token verified against same secret as auth-service
- User ID extracted from token payload

### Authorization

- Conversations filtered by userId
- Messages verified through conversation ownership
- No cross-user data access possible

### Rate Limiting

- Redis-based sliding window
- 10 requests per minute per user
- Returns 429 with retry-after header
- Fails open if Redis unavailable

### Input Validation

- Content max length: 10,000 characters
- Title max length: 200 characters
- UUID validation on IDs
- Zod schemas for type safety

---

## 📊 Performance Optimizations

### Database

- Indexes on frequently queried columns
- Composite indexes for filtered queries
- Soft deletes avoid data migration
- Pagination to limit result sets

### Caching

- Redis for rate limit counters
- Token usage cached by date
- Prisma query caching

### Streaming

- SSE for real-time updates
- Chunked responses reduce memory
- No buffering of full AI response

---

## 🧪 Testing

### Test Coverage

**Endpoint Tests**

- ✅ Create conversation
- ✅ List conversations
- ✅ Get conversation
- ✅ Update conversation
- ✅ Delete conversation
- ✅ Send message
- ✅ Get messages
- ✅ Delete message
- ✅ Get statistics
- ✅ Rate limiting

**Integration Tests**

- ✅ Authentication flow
- ✅ Rate limit enforcement
- ✅ Token tracking
- ✅ Soft delete behavior

### Running Tests

```bash
# Run test script
./test-chatbot-service.sh

# Expected output: All tests pass
# Note: Message sending may fail without valid OpenAI key
```

---

## 🌐 Environment Variables

```bash
# Required
DATABASE_URL="postgresql://user:pass@host:port/chatbot_dev"
OPENAI_API_KEY="sk-..."
JWT_SECRET="same-secret-as-auth-service"

# Optional
REDIS_URL="redis://localhost:6379"
PORT=3001
NODE_ENV=development
HOST=localhost
```

---

## 📈 Future Enhancements

### Planned for Phase 3

- ⏳ BullMQ for async AI processing
- ⏳ WebSocket support for bidirectional streaming
- ⏳ Multi-model support (GPT-4, Claude, etc.)
- ⏳ Conversation folders/categorization
- ⏳ Message editing and regeneration
- ⏳ Export conversations
- ⏳ Advanced analytics

### Potential Improvements

- Context window auto-management
- Embedding-based search
- Multi-language support
- Cost tracking per user
- Conversation sharing
- Voice message support

---

## 🐛 Known Issues

None currently identified.

---

## 📝 Notes

### OpenAI API Key

The service requires a valid OpenAI API key to generate AI responses. Without it:

- Conversations can still be created/managed
- Messages can be saved
- AI responses will fail with error

Get your API key from: https://platform.openai.com/api-keys

### Database

The service uses a separate database (`chatbot_dev`) from the auth service. This follows microservice architecture principles.

### Rate Limiting

Rate limits are per-user and stored in Redis. If Redis is unavailable, rate limiting is disabled (fail-open behavior).

---

## ✅ Checklist

**Implementation Complete**

- [x] Prisma schema defined
- [x] Database migrations created
- [x] All CRUD endpoints implemented
- [x] OpenAI integration working
- [x] Streaming responses functional
- [x] Rate limiting active
- [x] Token tracking implemented
- [x] Authentication middleware
- [x] Error handling
- [x] Test script created
- [x] Documentation complete
- [x] Build successful

**Ready for**

- [x] Frontend integration
- [x] Local testing
- [x] Integration with auth service
- [ ] Production deployment (Phase 4)

---

## 🔗 Related Services

- **Auth Service**: Provides JWT tokens (port 3000)
- **Admin Service**: Future service for management (port 3002)
- **Chatbot MFE**: Frontend for this service (Week 3)

---

**Service Status:** ✅ Production Ready (except BullMQ queue - optional enhancement)
