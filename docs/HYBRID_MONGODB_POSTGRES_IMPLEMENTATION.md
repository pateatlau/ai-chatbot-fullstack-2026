# Hybrid MongoDB + PostgreSQL Architecture: Implementation Plan

**Document Type:** Technical Implementation Guide  
**Last Updated:** November 18, 2025  
**Status:** Ready for Implementation  
**Timeline:** 2 weeks (10 working days)  
**Scope:** Chatbot Service Refactoring

---

## 🎯 Executive Summary

Implement a **hybrid database architecture** for the chatbot service:

- **PostgreSQL**: Conversations metadata, user references, transactional consistency
- **MongoDB**: Chat messages, embeddings, events, streaming state (high-throughput, schema-flexible)
- **Redis**: Hot cache, rate limiting, real-time state

This architecture provides 3-5x better write performance while maintaining data consistency where it matters.

---

## 📊 Quick Reference: What Goes Where

| Data Type              | Database   | Reason                                         |
| ---------------------- | ---------- | ---------------------------------------------- |
| Users, Sessions        | PostgreSQL | ACID, authentication, foreign keys             |
| Conversations Metadata | PostgreSQL | Referential integrity, analytics JOINs         |
| Chat Messages          | MongoDB    | High writes (10K/sec), schema flexibility, TTL |
| Message Embeddings     | MongoDB    | Vector search, large arrays (1536 dims)        |
| Conversation Context   | MongoDB    | Fast reads, embedded docs, TTL cleanup         |
| Streaming Sessions     | MongoDB    | Ephemeral data, high writes, TTL               |
| Analytics Events       | MongoDB    | Time-series data, flexible schema              |
| Hot Cache              | Redis      | Sub-ms reads, atomic operations, TTL           |

---

## 📋 Implementation Phases

### **PHASE 1: Infrastructure Setup (2 days)**

#### **1.1 Add MongoDB to Docker Compose**

- [ ] Update `docker-compose.yml` with MongoDB 7.0 container
- [ ] Configure authentication, volumes, health checks
- [ ] Add MongoDB network connectivity
- [ ] **Effort:** 2 hours | **Files:** `docker-compose.yml`

#### **1.2 Install Dependencies**

- [ ] `npm install mongoose @types/mongoose`
- [ ] `npm install mongoose-paginate-v2 mongoose-aggregate-paginate-v2`
- [ ] **Effort:** 30 minutes | **Files:** `package.json`

#### **1.3 Create Environment Configuration**

- [ ] Add `MONGODB_URL` to `.env.example`
- [ ] Document all MongoDB environment variables
- [ ] Add MongoDB connection pooling config
- [ ] **Effort:** 1 hour | **Files:** `.env.example`, `apps/chatbot-service/.env.example`

#### **1.4 Verify Setup**

- [ ] Run `docker-compose up -d`
- [ ] Verify MongoDB health check passes
- [ ] Test MongoDB connection from Node.js
- [ ] **Effort:** 1 hour

---

### **PHASE 2: Data Models (3 days)**

#### **2.1 Create Mongoose Models**

```
apps/chatbot-service/src/models/
├── message.model.ts          (Chat messages, indexes, TTL)
├── message-embedding.model.ts (Vector embeddings for semantic search)
├── conversation-context.model.ts (LLM context window cache)
├── streaming-session.model.ts    (SSE streaming state)
├── chat-event.model.ts           (Analytics events)
└── index.ts                       (Export all models)
```

- [ ] **Message Model** - Core messages collection with TTL
  - Fields: conversationId, userId, role, content, metadata, codeBlocks, attachments, createdAt, expiresAt
  - Indexes: { conversationId, userId, createdAt }, TTL on expiresAt
  - **Effort:** 3 hours

- [ ] **Message Embedding Model** - Vector search support
  - Fields: messageId, conversationId, embedding (1536 dims), content, createdAt
  - Indexes: vector index for Atlas Search, { userId, createdAt }
  - **Effort:** 2 hours

- [ ] **Conversation Context Model** - Context window cache
  - Fields: conversationId, contextWindow, totalTokens, expiresAt
  - Purpose: Avoid re-fetching last 20 messages on every query
  - TTL: 1 hour
  - **Effort:** 1.5 hours

- [ ] **Streaming Session Model** - SSE state tracking
  - Fields: sessionId, conversationId, status, chunks, startedAt, expiresAt
  - TTL: 10 minutes
  - **Effort:** 1.5 hours

- [ ] **Chat Event Model** - Analytics tracking
  - Fields: eventType, conversationId, userId, metadata, timestamp
  - Indexes: { userId, timestamp }, { eventType, timestamp }
  - **Effort:** 1 hour

#### **2.2 Update PostgreSQL Conversation Model**

```
// Add to Prisma schema:

model Conversation {
  id        String   @id @default(uuid())
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String   @db.VarChar(200)
  status    String   @default("active") // active, archived, deleted

  metadata  Json @default("{
    \"messageCount\": 0,
    \"totalTokens\": 0,
    \"lastActivity\": null,
    \"model\": \"gpt-4\"
  }")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, createdAt])
  @@index([userId, status])
}
```

- [ ] Update Prisma schema with new fields
- [ ] Add indexes for performance
- [ ] Generate Prisma client
- [ ] **Effort:** 2 hours | **Files:** `apps/auth-service/prisma/schema.prisma`

#### **2.3 Create Database Connection Manager**

```
apps/chatbot-service/src/database/
├── connection.ts      (MongoDB connection, singleton)
└── health.ts          (Health check logic)
```

- [ ] **connection.ts** - Singleton MongoDB connection manager
  - Connection pooling (maxPoolSize: 50, minPoolSize: 5)
  - Connection event handlers (reconnect, error, disconnected)
  - Graceful shutdown logic
  - **Effort:** 2 hours

- [ ] **health.ts** - Health check integration
  - MongoDB ping test
  - Connection status verification
  - **Effort:** 1 hour

---

### **PHASE 3: Repository Pattern (3 days)**

#### **3.1 Create MongoDB Repositories**

```
apps/chatbot-service/src/repositories/
├── message.repository.ts           (CRUD, pagination, aggregations)
├── message-embedding.repository.ts (Vector search, CRUD)
├── conversation-context.repository.ts (Cache operations)
├── streaming-session.repository.ts (SSE state management)
├── chat-event.repository.ts        (Event tracking, analytics)
└── index.ts
```

**Message Repository** - Core repository for messages

- Methods: `create()`, `findById()`, `findByConversationId()`, `deleteByConversationId()`, `getStats()`
- Pagination support with mongoose-paginate-v2
- Lean queries for performance
- **Effort:** 4 hours

**Message Embedding Repository** - Vector search

- Methods: `create()`, `findSimilar()` (vector search), `delete()`
- Integration with MongoDB Atlas Search
- **Effort:** 2 hours

**Conversation Context Repository** - Cache layer

- Methods: `get()`, `set()`, `invalidate()`
- TTL management
- **Effort:** 1.5 hours

**Streaming Session Repository** - SSE state

- Methods: `create()`, `addChunk()`, `markComplete()`, `findActive()`
- Auto-cleanup with TTL
- **Effort:** 1.5 hours

**Chat Event Repository** - Analytics

- Methods: `create()`, `findByUserId()`, `aggregateByType()`
- Time-series optimized queries
- **Effort:** 2 hours

**Effort Total:** ~11 hours

#### **3.2 Create PostgreSQL Repositories**

```
apps/chatbot-service/src/repositories/
├── conversation.repository.ts (CRUD, pagination, metadata updates)
└── index.ts
```

- [ ] **Conversation Repository**
  - Methods: `create()`, `findById()`, `findByUserId()`, `updateMetadata()`, `archive()`, `delete()`
  - Pagination with Prisma
  - FK validation
  - **Effort:** 3 hours | **Files:** `apps/chatbot-service/src/repositories/conversation.repository.ts`

---

### **PHASE 4: Service Layer Refactoring (3 days)**

#### **4.1 Create Chat Service**

```
apps/chatbot-service/src/services/
├── chat.service.ts (Core chat logic)
└── index.ts
```

- [ ] **Conversation Management**
  - `createConversation()` - PostgreSQL
  - `getUserConversations()` - PostgreSQL + pagination
  - `archiveConversation()` - PostgreSQL
  - `deleteConversation()` - PostgreSQL + MongoDB cleanup
  - **Effort:** 2 hours

- [ ] **Message Handling**
  - `sendMessage()` - Save to MongoDB, update PostgreSQL metadata
  - `getMessageHistory()` - Fetch from MongoDB with pagination
  - `getContextWindow()` - Get last 20 messages from MongoDB or cache
  - **Effort:** 3 hours

- [ ] **OpenAI Integration**
  - `generateResponse()` - Call OpenAI, save to MongoDB
  - `streamResponse()` - SSE streaming with MongoDB tracking
  - Error handling and fallbacks
  - **Effort:** 3 hours

- [ ] **Analytics & Events**
  - `trackEvent()` - Create analytics events in MongoDB
  - `getUserStats()` - Aggregate from MongoDB
  - **Effort:** 1.5 hours

**Effort Total:** ~9.5 hours | **Files:** `apps/chatbot-service/src/services/chat.service.ts`

#### **4.2 Update Route Handlers**

```
apps/chatbot-service/src/routes/
├── chat.routes.ts (Updated with new service methods)
└── index.ts
```

- [ ] Update `/conversations` endpoints to use repositories
- [ ] Update `/messages` endpoints for MongoDB queries
- [ ] Add streaming endpoint for SSE
- [ ] Add error handling for dual-database operations
- [ ] **Effort:** 4 hours | **Files:** `apps/chatbot-service/src/routes/chat.routes.ts`

#### **4.3 Update Main Server File**

```
apps/chatbot-service/src/
├── main.ts (Updated with MongoDB connection)
```

- [ ] Replace Prisma initialization with MongoDB connection manager
- [ ] Update health check endpoints
- [ ] Add graceful shutdown for MongoDB
- [ ] Update dependency injection
- [ ] **Effort:** 2 hours | **Files:** `apps/chatbot-service/src/main.ts`

---

### **PHASE 5: Data Migration (2 days)**

#### **5.1 Create Migration Strategy**

```
apps/chatbot-service/src/scripts/
├── migrate-to-mongo.ts    (PostgreSQL → MongoDB migration)
├── verify-migration.ts    (Data validation)
└── rollback.ts            (Rollback script if needed)
```

**Migration Script**:

- [ ] Read all conversations from PostgreSQL
- [ ] For each conversation, migrate messages to MongoDB
- [ ] Verify message counts match
- [ ] Handle errors and retry logic
- [ ] **Effort:** 4 hours

**Verification Script**:

- [ ] Count messages in PostgreSQL vs MongoDB
- [ ] Verify no orphaned data
- [ ] Check data integrity
- [ ] **Effort:** 2 hours

**Rollback Script**:

- [ ] Restore from backups
- [ ] Clear MongoDB data
- [ ] Revert application code
- [ ] **Effort:** 1 hour

**Effort Total:** ~7 hours

#### **5.2 Create Zero-Downtime Migration Plan**

- [ ] Run dual-write: Write to both PostgreSQL and MongoDB
- [ ] Validate data consistency
- [ ] Gradually migrate read traffic to MongoDB
- [ ] Monitor for issues
- [ ] **Effort:** Documentation and planning

---

### **PHASE 6: Testing & Validation (2 days)**

#### **6.1 Unit Tests**

```
apps/chatbot-service/src/__tests__/
├── repositories/
│   ├── message.repository.spec.ts
│   ├── conversation.repository.spec.ts
│   └── ...
├── services/
│   └── chat.service.spec.ts
└── models/
    └── message.model.spec.ts
```

- [ ] MongoDB repository tests (create, read, pagination, TTL)
- [ ] PostgreSQL repository tests (CRUD, FK validation)
- [ ] Service layer tests (chat flow, error handling)
- [ ] **Effort:** 6 hours

#### **6.2 Integration Tests**

- [ ] Test full chat flow (PostgreSQL + MongoDB)
- [ ] Test cascade deletes (user deletion → conversation cleanup)
- [ ] Test streaming with MongoDB tracking
- [ ] Test error scenarios
- [ ] **Effort:** 4 hours

#### **6.3 Performance Tests**

```
apps/chatbot-service/src/scripts/
└── performance-test.ts
```

- [ ] Load test: 1000 messages/sec to MongoDB
- [ ] Query performance: Get 50 messages with pagination (<50ms)
- [ ] Context window fetch (<100ms)
- [ ] **Effort:** 2 hours

#### **6.4 Data Validation**

- [ ] All messages have conversationId reference
- [ ] All conversations have userId reference
- [ ] No orphaned messages (conversation deleted but messages remain)
- [ ] TTL indexes working (messages auto-delete after 90 days)
- [ ] **Effort:** 2 hours

**Effort Total:** ~14 hours

---

### **PHASE 7: Deployment & Monitoring (1 day)**

#### **7.1 Docker Updates**

```
apps/chatbot-service/
├── Dockerfile (Already supports Node 20)
└── docker-compose.yml (Add MongoDB service)
```

- [ ] Verify Dockerfile works with new dependencies
- [ ] Test build and run in Docker
- [ ] Add MongoDB to docker-compose
- [ ] **Effort:** 2 hours

#### **7.2 Environment Variables**

- [ ] Add `MONGODB_URL` to all deployment configs
- [ ] Add connection pooling settings
- [ ] Add TTL settings
- [ ] **Effort:** 1 hour

#### **7.3 Monitoring & Logging**

- [ ] Add MongoDB query logging for slow queries
- [ ] Add connection pool monitoring
- [ ] Add metrics for message write throughput
- [ ] Health check endpoints for both databases
- [ ] **Effort:** 2 hours

#### **7.4 Documentation**

- [ ] Update API documentation for hybrid approach
- [ ] Document schema changes
- [ ] Add troubleshooting guide
- [ ] **Effort:** 2 hours

**Effort Total:** ~7 hours

---

## 📅 Timeline Summary

| Phase             | Duration    | Effort       | Status   |
| ----------------- | ----------- | ------------ | -------- |
| 1: Infrastructure | 2 days      | 4.5 hours    | ⏳ Ready |
| 2: Data Models    | 3 days      | 12 hours     | ⏳ Ready |
| 3: Repositories   | 3 days      | 12 hours     | ⏳ Ready |
| 4: Service Layer  | 3 days      | 15.5 hours   | ⏳ Ready |
| 5: Migration      | 2 days      | 7 hours      | ⏳ Ready |
| 6: Testing        | 2 days      | 14 hours     | ⏳ Ready |
| 7: Deployment     | 1 day       | 7 hours      | ⏳ Ready |
| **TOTAL**         | **2 weeks** | **72 hours** |          |

---

## 🚀 Execution Strategy

### **Week 1: Foundation**

- **Day 1-2:** Phases 1 & 2 (Infrastructure + Models)
- **Day 3-4:** Phase 3 (Repositories)
- **Day 5:** Phase 4 start (Service Layer)

### **Week 2: Implementation & Testing**

- **Day 6-7:** Phase 4 complete + Phase 5 (Migration)
- **Day 8-9:** Phase 6 (Testing & Validation)
- **Day 10:** Phase 7 (Deployment) + Fixes

---

## 📋 Detailed Task Checklist

### Week 1, Day 1-2: Infrastructure

- [ ] Add MongoDB service to docker-compose.yml
- [ ] Test `docker-compose up -d` with MongoDB
- [ ] Verify MongoDB health check passes
- [ ] Add `MONGODB_URL` to .env files
- [ ] Update .gitignore for .env.local
- [ ] Test MongoDB connection from Node.js REPL
- [ ] Document connection string format
- [ ] Verify Docker compose networking

### Week 1, Day 1-2: Models

- [ ] Create message.model.ts with full schema
- [ ] Create message-embedding.model.ts
- [ ] Create conversation-context.model.ts
- [ ] Create streaming-session.model.ts
- [ ] Create chat-event.model.ts
- [ ] Add all indexes (including TTL)
- [ ] Test model creation in MongoDB
- [ ] Update Prisma schema for PostgreSQL
- [ ] Run Prisma migrations
- [ ] Generate Prisma client

### Week 1, Day 3-4: Repositories

- [ ] Create conversation.repository.ts (PostgreSQL)
- [ ] Create message.repository.ts (MongoDB)
- [ ] Create message-embedding.repository.ts (MongoDB)
- [ ] Create conversation-context.repository.ts (MongoDB)
- [ ] Create streaming-session.repository.ts (MongoDB)
- [ ] Create chat-event.repository.ts (MongoDB)
- [ ] Test all CRUD operations
- [ ] Test pagination methods
- [ ] Test error handling

### Week 1, Day 5: Service Layer (Start)

- [ ] Create chat.service.ts
- [ ] Implement createConversation()
- [ ] Implement sendMessage() with dual-write
- [ ] Implement getMessageHistory()
- [ ] Test service methods locally

### Week 2, Day 6-7: Service Layer (Complete) + Migration

- [ ] Complete generateResponse() with OpenAI
- [ ] Implement streamResponse() for SSE
- [ ] Add all error handling
- [ ] Update route handlers (chat.routes.ts)
- [ ] Update main.ts with MongoDB connection
- [ ] Create migration script
- [ ] Create verification script
- [ ] Test migration on local environment

### Week 2, Day 8-9: Testing

- [ ] Write unit tests (repositories)
- [ ] Write integration tests (full chat flow)
- [ ] Write performance tests
- [ ] Run load tests (1000 msgs/sec)
- [ ] Validate data consistency
- [ ] Test error scenarios
- [ ] Test graceful shutdown
- [ ] Document test results

### Week 2, Day 10: Deployment

- [ ] Verify Docker build
- [ ] Test docker-compose up
- [ ] Verify health checks
- [ ] Set up monitoring
- [ ] Update documentation
- [ ] Prepare deployment runbook
- [ ] Create rollback plan
- [ ] Get team sign-off

---

## ⚠️ Risk Mitigation

### **Risk 1: Data Inconsistency Between MongoDB and PostgreSQL**

- **Mitigation:**
  - Always update PostgreSQL first (source of truth for conversations)
  - Implement reconciliation job (nightly)
  - Add comprehensive logging
  - **Owner:** Backend Lead

### **Risk 2: MongoDB Connection Failures**

- **Mitigation:**
  - Implement circuit breaker pattern
  - Add fallback for read failures (cache → PostgreSQL)
  - Monitor connection pool health
  - **Owner:** Infrastructure

### **Risk 3: Migration Data Loss**

- **Mitigation:**
  - Backup PostgreSQL before migration
  - Run migration on staging first
  - Verify data counts match
  - Keep rollback script ready
  - **Owner:** Database Admin

### **Risk 4: Performance Degradation**

- **Mitigation:**
  - Run load tests before deployment
  - Monitor query performance post-deploy
  - Have rollback plan if performance drops
  - **Owner:** DevOps

---

## 🎯 Success Criteria

- ✅ All tests passing (unit, integration, performance)
- ✅ Message write throughput > 5K msgs/sec (target: 10K/sec)
- ✅ Message query time < 50ms (p95)
- ✅ Zero data loss during migration
- ✅ Data consistency verified between PostgreSQL and MongoDB
- ✅ Graceful shutdown tested and working
- ✅ Monitoring and alerting configured
- ✅ Documentation complete

---

## 📞 Support & Handoff

- **Database Schemas:** [Link to Models Documentation]
- **API Endpoints:** [Link to API Documentation]
- **Troubleshooting Guide:** [Link to Troubleshooting]
- **Runbook:** [Link to Deployment Runbook]

---

**Document Owner:** Backend Team  
**Next Review:** After Phase 3 Completion  
**Last Updated:** November 18, 2025
