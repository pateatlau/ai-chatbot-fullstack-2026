# Hybrid MongoDB + PostgreSQL Architecture Diagram

**Document Type:** Architecture Reference  
**Last Updated:** November 18, 2025  
**Scope:** Chatbot Service with Hybrid Database Approach

---

## 🏗️ SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Browser / Web   │  │ Mobile Client    │  │  Desktop App     │      │
│  │  (React MFE)     │  │  (React Native)  │  │  (Electron)      │      │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘      │
│           │                     │                    │                  │
│           └─────────────────────┼────────────────────┘                  │
│                                 │                                        │
│                        HTTP/WebSocket                                    │
│                                 │                                        │
└─────────────────────────────────┼────────────────────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   API Gateway / Reverse   │
                    │   Proxy (Nginx/Traefik)   │
                    │                            │
                    │ • Rate Limiting            │
                    │ • Authentication          │
                    │ • SSL Termination         │
                    │ • Request Routing         │
                    └─────────────┬──────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼──────────┐  ┌──────────▼──────────┐  ┌──────────▼──────────┐
│  Auth Service    │  │  Chatbot Service    │  │  Admin Service      │
│  (Port 3000)     │  │  (Port 3001)        │  │  (Port 3002)        │
└────────┬─────────┘  └──────────┬──────────┘  └─────────┬───────────┘
         │                       │                       │
         │                       │                       │
     PostgreSQL           PostgreSQL + MongoDB      PostgreSQL
     (Users,             (Conversations)            (Analytics,
      Sessions)          (Messages)                  Reports)

         │                       │                       │
         │                       └───────────┬───────────┘
         │                                   │
         └───────────────────┬───────────────┘
                             │
         ┌───────────────────┴───────────────┐
         │                                   │
    ┌────▼─────────┐              ┌─────────▼───────┐
    │  PostgreSQL  │              │     MongoDB     │
    │  Database    │              │    Database     │
    └──────────────┘              └─────────────────┘
         │                               │
    ┌────▼─────────────────────┐  ┌──────▼─────────────────┐
    │ • Users Table             │  │ • messages             │
    │ • Sessions Table          │  │ • message_embeddings   │
    │ • Conversations Table     │  │ • conversation_context │
    │ • Password Reset Tokens   │  │ • streaming_sessions   │
    │ • Blacklisted Tokens      │  │ • chat_events          │
    │ • Audit Logs              │  │                        │
    └──────────────────────────┘  └────────────────────────┘
         │                               │
    ┌────▼──────────────────┐       ┌───▼──────────────┐
    │ Strong Consistency    │       │ High Throughput  │
    │ ACID Transactions     │       │ Flexible Schema  │
    │ Foreign Keys          │       │ TTL Cleanup      │
    │ Analytics JOINs       │       │ Sharding Ready   │
    └──────────────────────┘       └──────────────────┘
```

---

## 🔄 DETAILED CHATBOT SERVICE ARCHITECTURE

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         CHATBOT SERVICE (Port 3001)                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                         ROUTES LAYER                            │    │
│  ├──────────────────────────────────────────────────────────────────┤    │
│  │ • POST   /conversations              → Create conversation       │    │
│  │ • GET    /conversations              → List user conversations   │    │
│  │ • GET    /conversations/:id          → Get conversation details  │    │
│  │ • POST   /conversations/:id/messages → Send message             │    │
│  │ • GET    /conversations/:id/messages → Get message history      │    │
│  │ • POST   /conversations/:id/stream   → SSE stream response      │    │
│  │ • PATCH  /conversations/:id          → Archive conversation     │    │
│  │ • DELETE /conversations/:id          → Delete conversation      │    │
│  │ • GET    /health                     → Health check             │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                   │                                        │
│  ┌────────────────────────────────▼────────────────────────────────┐    │
│  │                      SERVICE LAYER                             │    │
│  ├──────────────────────────────────────────────────────────────────┤    │
│  │                                                                  │    │
│  │  ┌─────────────────────────┐     ┌──────────────────────────┐  │    │
│  │  │   Chat Service          │     │  Analytics Service       │  │    │
│  │  │                         │     │                          │  │    │
│  │  │ • createConversation()  │     │ • trackEvent()           │  │    │
│  │  │ • sendMessage()         │     │ • getUserStats()         │  │    │
│  │  │ • generateResponse()    │     │ • getConvStats()         │  │    │
│  │  │ • streamResponse()      │     │ • aggregateByType()      │  │    │
│  │  │ • getHistory()          │     │                          │  │    │
│  │  │ • archiveConv()         │     │                          │  │    │
│  │  │ • deleteConv()          │     │                          │  │    │
│  │  └────────┬────────────────┘     └──────────────┬───────────┘  │    │
│  │           │                                     │               │    │
│  │           └─────────────────┬───────────────────┘               │    │
│  │                             │                                   │    │
│  └─────────────────────────────┼───────────────────────────────────┘    │
│                                │                                        │
│  ┌─────────────────────────────▼───────────────────────────────────┐   │
│  │                   REPOSITORY LAYER                             │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │  ┌──────────────────────┐  ┌────────────────────────────────┐ │   │
│  │  │ PostgreSQL Repos     │  │ MongoDB Repos                  │ │   │
│  │  ├──────────────────────┤  ├────────────────────────────────┤ │   │
│  │  │ Conversation Repo:   │  │ Message Repo:                  │ │   │
│  │  │ • create()           │  │ • create()                     │ │   │
│  │  │ • findById()         │  │ • findById()                   │ │   │
│  │  │ • findByUserId()     │  │ • findByConversationId()       │ │   │
│  │  │ • updateMetadata()   │  │ • delete()                     │ │   │
│  │  │ • archive()          │  │ • getStats()                   │ │   │
│  │  │ • delete()           │  │                                │ │   │
│  │  │                      │  │ Message Embedding Repo:        │ │   │
│  │  │                      │  │ • create()                     │ │   │
│  │  │                      │  │ • findSimilar() [vector]       │ │   │
│  │  │                      │  │                                │ │   │
│  │  │                      │  │ Context Repo:                  │ │   │
│  │  │                      │  │ • get()                        │ │   │
│  │  │                      │  │ • set()                        │ │   │
│  │  │                      │  │ • invalidate()                 │ │   │
│  │  │                      │  │                                │ │   │
│  │  │                      │  │ Streaming Session Repo:        │ │   │
│  │  │                      │  │ • create()                     │ │   │
│  │  │                      │  │ • addChunk()                   │ │   │
│  │  │                      │  │ • markComplete()               │ │   │
│  │  │                      │  │                                │ │   │
│  │  │                      │  │ Chat Event Repo:               │ │   │
│  │  │                      │  │ • create()                     │ │   │
│  │  │                      │  │ • findByUserId()               │ │   │
│  │  │                      │  │ • aggregateByType()            │ │   │
│  │  └────────┬─────────────┘  └──────────────┬─────────────────┘ │   │
│  │           │                              │                   │   │
│  └───────────┼──────────────────────────────┼───────────────────┘   │
│              │                              │                       │
└──────────────┼──────────────────────────────┼───────────────────────┘
               │                              │
┌──────────────▼──────────────┐  ┌────────────▼──────────────┐
│    PostgreSQL Connection    │  │   MongoDB Connection      │
│                             │  │                          │
│ • DB: myapp_dev            │  │ • DB: chatbot_db         │
│ • Host: localhost:5432     │  │ • Host: localhost:27017  │
│ • Pool: 25 connections     │  │ • Pool: 50 connections   │
│ • Timeout: 5s              │  │ • Timeout: 5s            │
│                             │  │                          │
└─────────────┬───────────────┘  └────────────┬──────────────┘
              │                              │
   ┌──────────▼──────────────┐    ┌─────────▼─────────────┐
   │    PostgreSQL 16        │    │   MongoDB 7.0         │
   │    (Strong ACID)        │    │   (High Throughput)   │
   │                         │    │                       │
   │ TRANSACTIONAL DATA:     │    │ HIGH-VOLUME DATA:     │
   │ ✓ users                 │    │ ✓ messages            │
   │ ✓ sessions              │    │ ✓ embeddings          │
   │ ✓ conversations         │    │ ✓ contexts            │
   │ ✓ audit_logs            │    │ ✓ events              │
   │                         │    │ ✓ streaming_sessions  │
   │ GUARANTEES:             │    │                       │
   │ • ACID                  │    │ TTL Indexes:          │
   │ • Foreign Keys          │    │ • Auto-delete msgs    │
   │ • Cascade Deletes       │    │ • Auto-delete events  │
   │ • Referential Integrity │    │ • Cache expiration    │
   │                         │    │                       │
   └─────────────────────────┘    └───────────────────────┘
```

---

## 📊 DATA FLOW: Send Message

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      USER SENDS MESSAGE FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐
│  Client  │
└────┬─────┘
     │ POST /conversations/{id}/messages
     │ { "content": "Hello AI" }
     │
     ▼
┌────────────────────┐
│  Routes Handler    │
│  chat.routes.ts    │
└────────┬───────────┘
         │
         ▼
┌──────────────────────┐
│  Chat Service        │
│  sendMessage()       │
└──────────┬───────────┘
           │
           │ Step 1: Validate user & conversation
           ▼
    ┌──────────────────┐
    │  Check Auth      │
    │  Get User from   │
    │  PostgreSQL      │
    └──────┬───────────┘
           │
           │ Step 2: Save user message to MongoDB
           ▼
    ┌─────────────────────────────────┐
    │ Message Repository              │
    │ create({                        │
    │   conversationId,               │
    │   userId,                       │
    │   role: "user",                 │
    │   content,                      │
    │   createdAt: now(),             │
    │   expiresAt: now() + 90 days    │
    │ })                              │
    │                                 │
    │ MongoDB Insert ──┐              │
    │                  ├─ messages    │
    │                  │  collection  │
    │                  │              │
    │                  ▼              │
    │              ✓ Inserted         │
    └─────────────────────────────────┘
           │
           │ Step 3: Update PostgreSQL conversation metadata (async)
           ▼
    ┌─────────────────────────────────┐
    │ Conversation Repository         │
    │ updateMetadata({                │
    │   messageCount: +1,             │
    │   lastActivity: now()           │
    │ })                              │
    │                                 │
    │ PostgreSQL Update ─┐            │
    │                    ├─ conversations
    │                    │  table      │
    │                    │             │
    │                    ▼             │
    │                ✓ Updated         │
    └─────────────────────────────────┘
           │
           │ Step 4: Cache in Redis (optional)
           ▼
    ┌─────────────────────────────────┐
    │ Redis Cache                     │
    │ LPUSH conversation:{id}:msgs    │
    │ LTRIM ... (keep last 50)        │
    │                                 │
    │ Redis Insert ──┐                │
    │                ├─ Cache Layer   │
    │                ▼                │
    │            ✓ Cached             │
    └─────────────────────────────────┘
           │
           │ Step 5: Get LLM context from MongoDB
           ▼
    ┌─────────────────────────────────┐
    │ Context Repository              │
    │ getContextWindow(conversationId)│
    │                                 │
    │ Check cache first               │
    │ If expired/missing:             │
    │   - Fetch last 20 messages      │
    │   - From MongoDB messages table │
    │   - Store in context table      │
    │   - TTL: 1 hour                 │
    └──────────────┬──────────────────┘
                   │
                   │ Step 6: Call OpenAI API
                   ▼
            ┌─────────────────┐
            │   OpenAI API    │
            │   gpt-4 model   │
            │                 │
            │ Generate        │
            │ Response        │
            │                 │
            └────────┬────────┘
                     │
                     │ Step 7: Save assistant response to MongoDB
                     ▼
            ┌──────────────────────────────┐
            │ Message Repository           │
            │ create({                     │
            │   conversationId,            │
            │   userId,                    │
            │   role: "assistant",         │
            │   content: response,         │
            │   metadata: {                │
            │     tokens: usage.total,     │
            │     model: "gpt-4",          │
            │     responseTime: duration   │
            │   },                         │
            │   expiresAt: now() + 90 days│
            │ })                           │
            │                              │
            │ MongoDB Insert             │
            │          │                  │
            │          ▼                  │
            │      ✓ Inserted             │
            └──────────┬───────────────────┘
                       │
                       │ Step 8: Create embedding for semantic search
                       ▼
            ┌──────────────────────────────┐
            │ Message Embedding Repo       │
            │ create({                     │
            │   messageId,                 │
            │   conversationId,            │
            │   embedding: vector (1536),  │
            │   content: assistant_resp    │
            │ })                           │
            │                              │
            │ MongoDB Insert               │
            │          │                   │
            │          ▼                   │
            │      ✓ Inserted              │
            └──────────┬────────────────────┘
                       │
                       │ Step 9: Track event for analytics
                       ▼
            ┌──────────────────────────────┐
            │ Chat Event Repo              │
            │ create({                     │
            │   eventType: "message_recv"  │
            │   conversationId,            │
            │   userId,                    │
            │   metadata: {                │
            │     responseTime,            │
            │     tokenUsage,              │
            │     model: "gpt-4"           │
            │   },                         │
            │   timestamp: now()           │
            │ })                           │
            │                              │
            │ MongoDB Insert               │
            │          │                   │
            │          ▼                   │
            │      ✓ Inserted              │
            └──────────┬────────────────────┘
                       │
                       │ Step 10: Invalidate context cache
                       ▼
            ┌──────────────────────────────┐
            │ Context Repo                 │
            │ invalidate(conversationId)   │
            │ (so next message gets fresh) │
            └──────────────────────────────┘
                       │
                       ▼
            ┌────────────────────────────┐
            │  Return response to client │
            │  {                         │
            │    message: response,      │
            │    tokens: usage.total,    │
            │    timestamp: ...          │
            │  }                         │
            └────────────────────────────┘
```

---

## 📊 DATA FLOW: Get Conversation History

```
┌──────────────────────────────────────────────────────────────────────┐
│            GET CONVERSATION HISTORY FLOW                             │
└──────────────────────────────────────────────────────────────────────┘

┌──────────┐
│  Client  │
└────┬─────┘
     │ GET /conversations/{id}/messages?page=1&limit=50
     │
     ▼
┌───────────────────┐
│ Routes Handler    │
└────────┬──────────┘
         │
         ▼
┌────────────────────────────┐
│ Chat Service               │
│ getMessageHistory()        │
└─────────┬──────────────────┘
          │
          │ Step 1: Get conversation from PostgreSQL
          ▼
   ┌──────────────────────────┐
   │ Conversation Repo        │
   │ findById(conversationId) │
   │                          │
   │ PostgreSQL Query:        │
   │ ┌──────────────────────┐ │
   │ │ SELECT * FROM        │ │
   │ │ conversations        │ │
   │ │ WHERE id = ?         │ │
   │ │ AND user_id = ?      │ │
   │ └──────────────────────┘ │
   │          │               │
   │          ▼               │
   │   ✓ Found                │
   │   (with metadata)        │
   └──────────┬───────────────┘
              │
              │ Step 2: Get messages from MongoDB with pagination
              ▼
      ┌───────────────────────────────┐
      │ Message Repository            │
      │ findByConversationId(          │
      │   conversationId,              │
      │   { page: 1, limit: 50 }      │
      │ )                              │
      │                                │
      │ MongoDB Query:                 │
      │ ┌────────────────────────────┐ │
      │ │ db.messages.find({         │ │
      │ │   conversationId: "id"     │ │
      │ │ })                          │ │
      │ │ .sort({ createdAt: -1 })   │ │
      │ │ .skip(0)                    │ │
      │ │ .limit(50)                  │ │
      │ │ .lean()                     │ │
      │ └────────────────────────────┘ │
      │          │                      │
      │          ▼                      │
      │   ✓ Retrieved (50 messages)     │
      │                                │
      │ Also get total count:           │
      │ db.messages.countDocuments({   │
      │   conversationId: "id"         │
      │ })                              │
      └───────────────┬────────────────┘
                      │
                      │ Step 3: Combine & format response
                      ▼
              ┌────────────────────────┐
              │ Combine Data:          │
              │ {                      │
              │   conversation: {      │
              │     id,                │
              │     title,             │
              │     userId,            │
              │     metadata,          │
              │     createdAt,         │
              │     updatedAt          │
              │   },                   │
              │   messages: [50 msgs], │
              │   pagination: {        │
              │     total: 500,        │
              │     pages: 10,         │
              │     page: 1,           │
              │     limit: 50          │
              │   }                    │
              │ }                      │
              └────────────┬───────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │ Return to Client (JSON)  │
              │ ~200ms response time     │
              └──────────────────────────┘
```

---

## 📊 DATA FLOW: Delete Conversation (Cascade)

```
┌──────────────────────────────────────────────────────────────────────┐
│          DELETE CONVERSATION WITH CASCADE FLOW                        │
└──────────────────────────────────────────────────────────────────────┘

┌──────────┐
│  Client  │
└────┬─────┘
     │ DELETE /conversations/{id}
     │
     ▼
┌────────────────────────┐
│ Routes Handler         │
│ Verify Auth           │
└─────────┬──────────────┘
          │
          ▼
┌────────────────────────────────┐
│ Chat Service                   │
│ deleteConversation()           │
└─────────┬──────────────────────┘
          │
          │ Step 1: Start transaction on PostgreSQL
          ▼
   ┌──────────────────────────┐
   │ PostgreSQL Transaction   │
   │ BEGIN;                   │
   └────────┬─────────────────┘
            │
            │ Step 2: Delete conversation (FK constraint)
            ▼
     ┌─────────────────────────────────┐
     │ Conversation Repo               │
     │ delete(conversationId)          │
     │                                 │
     │ PostgreSQL:                     │
     │ DELETE FROM conversations       │
     │ WHERE id = ?                    │
     │ AND user_id = ?                 │
     │                                 │
     │ ✓ Deleted (1 row)              │
     └────────┬────────────────────────┘
              │
              │ Step 3: Commit PostgreSQL transaction
              ▼
     ┌─────────────────────────┐
     │ COMMIT;                 │
     │ ✓ Transaction complete  │
     └────────┬────────────────┘
              │
              │ Step 4: Delete from MongoDB (background job)
              ▼
     ┌──────────────────────────────────┐
     │ Queue Background Job:            │
     │ {                                │
     │   type: "delete_conversation",   │
     │   conversationId: "id",          │
     │   timestamp: now()               │
     │ }                                │
     │                                  │
     │ Job queued in Redis              │
     └────────┬─────────────────────────┘
              │
              │ (Async - execute soon)
              ▼
     ┌──────────────────────────────────┐
     │ MongoDB Cleanup Job              │
     │ Executes async:                  │
     │                                  │
     │ 1. Delete messages               │
     │    db.messages.deleteMany({      │
     │      conversationId: "id"        │
     │    })                            │
     │    ✓ Deleted (500 messages)      │
     │                                  │
     │ 2. Delete embeddings             │
     │    db.message_embeddings         │
     │    .deleteMany({                 │
     │      conversationId: "id"        │
     │    })                            │
     │    ✓ Deleted (500 embeddings)    │
     │                                  │
     │ 3. Delete events                 │
     │    db.chat_events.deleteMany({   │
     │      conversationId: "id"        │
     │    })                            │
     │    ✓ Deleted (1000 events)       │
     │                                  │
     │ 4. Delete context                │
     │    db.conversation_context       │
     │    .deleteMany({                 │
     │      conversationId: "id"        │
     │    })                            │
     │    ✓ Deleted (1 context)         │
     │                                  │
     │ Job completed successfully       │
     └────────┬─────────────────────────┘
              │
              ▼
     ┌─────────────────────────┐
     │ Log Success Event       │
     │ Cleanup completed       │
     └─────────────────────────┘

RESULT:
✓ PostgreSQL: Conversation deleted + referential integrity maintained
✓ MongoDB: All related data cleaned up (eventually)
✓ Redis: Cache auto-invalidated (TTL-based cleanup)
✓ No orphaned data across systems
```

---

## 🔌 DATABASE CONNECTIONS

```
┌─────────────────────────────────────────────────────────────────┐
│              CONNECTION POOL ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

PostgreSQL Connection Pool:
┌──────────────────────────────────────────────────┐
│ Prisma Client (Connection Manager)               │
├──────────────────────────────────────────────────┤
│ Pool Configuration:                              │
│ • Min Connections: 5                             │
│ • Max Connections: 25                            │
│ • Idle Timeout: 5 minutes                        │
│ • Connection Timeout: 10 seconds                 │
│                                                  │
│ Connection States:                               │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                        │
│ │  │ │  │ │  │ │  │ │  │ (Active: 3)           │
│ └──┘ └──┘ └──┘ └──┘ └──┘                        │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                        │
│ │  │ │  │ │  │ │  │ │  │ (Idle: 2)             │
│ └──┘ └──┘ └──┘ └──┘ └──┘                        │
│                                                  │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
        ┌────────────────────────┐
        │  PostgreSQL Server     │
        │  (localhost:5432)      │
        └────────────────────────┘

MongoDB Connection Pool:
┌──────────────────────────────────────────────────┐
│ Mongoose Client (Connection Manager)             │
├──────────────────────────────────────────────────┤
│ Pool Configuration:                              │
│ • Max Pool Size: 50                              │
│ • Min Pool Size: 5                               │
│ • Max Idle Time: 60 seconds                      │
│ • Connection Timeout: 5 seconds                  │
│                                                  │
│ Connection States:                               │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐        │
│ │  │ │  │ │  │ │  │ │  │ │  │ │  │ │  │ (8)   │
│ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘        │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                        │
│ │  │ │  │ │  │ │  │ │  │ (5 waiting)            │
│ └──┘ └──┘ └──┘ └──┘ └──┘                        │
│                                                  │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
        ┌────────────────────────┐
        │  MongoDB Server        │
        │  (localhost:27017)     │
        └────────────────────────┘

Redis Connection Pool:
┌──────────────────────────────────────────────────┐
│ IORedis Client (Connection Manager)              │
├──────────────────────────────────────────────────┤
│ Configuration:                                   │
│ • Single Connection (Singleton)                  │
│ • Auto-reconnect: enabled                        │
│ • Retry Strategy: exponential backoff            │
│ • Offline Queue: enabled                         │
│                                                  │
│ Connection State:                                │
│ ┌────────────────────────────────────┐           │
│ │         ✓ Connected                │           │
│ │   Ping: <1ms                       │           │
│ │   Commands: 50/sec                 │           │
│ └────────────────────────────────────┘           │
│                                                  │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
        ┌────────────────────────┐
        │  Redis Server          │
        │  (localhost:6379)      │
        └────────────────────────┘
```

---

## 🎯 CONSISTENCY MODEL

```
┌──────────────────────────────────────────────────────────────┐
│          CONSISTENCY GUARANTEES BY DATA TYPE                 │
└──────────────────────────────────────────────────────────────┘

STRONG CONSISTENCY (PostgreSQL):
┌─────────────────────────────────────────────────────────────┐
│ • User authentication (users table)                         │
│ • Session management (sessions table)                       │
│ • Conversation ownership (FK to users)                      │
│ • Conversation deletion (cascades)                          │
│ • Password reset tokens (expiration)                        │
│ • Blacklisted tokens (revocation)                           │
│                                                             │
│ Guarantees:                                                 │
│ ✓ ACID Transactions                                         │
│ ✓ Foreign Key Constraints                                   │
│ ✓ Immediate Consistency                                     │
│ ✓ No Data Loss                                              │
└─────────────────────────────────────────────────────────────┘

EVENTUAL CONSISTENCY (MongoDB → PostgreSQL):
┌─────────────────────────────────────────────────────────────┐
│ • Message counts (updated async)                            │
│ • Total tokens (synced periodically)                        │
│ • Last activity timestamp (delayed)                         │
│ • User statistics (computed periodically)                   │
│                                                             │
│ Guarantees:                                                 │
│ ✓ Eventual correctness                                      │
│ ✓ High performance (no blocking writes)                     │
│ ✓ Async reconciliation jobs                                 │
│ ✓ Nightly verification                                      │
└─────────────────────────────────────────────────────────────┘

HIGH THROUGHPUT (MongoDB):
┌─────────────────────────────────────────────────────────────┐
│ • Chat messages (independent writes)                        │
│ • Message embeddings (write-once)                           │
│ • Streaming session state (ephemeral)                       │
│ • Analytics events (time-series)                            │
│                                                             │
│ Guarantees:                                                 │
│ ✓ 10K+ writes/sec                                           │
│ ✓ Sub-100ms queries                                         │
│ ✓ Horizontal scalability                                    │
│ ✓ TTL auto-cleanup                                          │
└─────────────────────────────────────────────────────────────┘

CACHE LAYER (Redis):
┌─────────────────────────────────────────────────────────────┐
│ • Active conversation IDs                                   │
│ • Recent message cache (last 50)                            │
│ • Rate limit counters                                       │
│ • User typing indicators                                    │
│ • WebSocket connection mappings                             │
│                                                             │
│ Guarantees:                                                 │
│ ✓ <1ms response time                                        │
│ ✓ Atomic operations                                         │
│ ✓ TTL-based expiration                                      │
│ ✓ Auto-cleanup on restart                                   │
└─────────────────────────────────────────────────────────────┘

RECONCILIATION STRATEGY:
┌─────────────────────────────────────────────────────────────┐
│ Scheduled Nightly Job (2:00 AM):                            │
│                                                             │
│ FOR each conversation:                                      │
│   1. Count actual messages in MongoDB                       │
│   2. Compare with message_count in PostgreSQL              │
│   3. If mismatch:                                           │
│      UPDATE conversations SET metadata = {...}             │
│   4. Log discrepancy for investigation                      │
│   5. Alert if difference > 5%                               │
│                                                             │
│ Expected discrepancies:                                     │
│ • <1% (normal async lag)                                    │
│ • Reconciled within 24 hours                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 SCALABILITY ROADMAP

```
┌──────────────────────────────────────────────────────────────┐
│           SCALING FROM 10K TO 1M USERS                       │
└──────────────────────────────────────────────────────────────┘

PHASE 1: 10K - 100K USERS (Current)
┌─────────────────────────────────────────────────────────────┐
│ Architecture:                                               │
│ • PostgreSQL: Single instance                              │
│ • MongoDB: Single instance                                 │
│ • Redis: Single instance                                   │
│ • 1 Region                                                 │
│                                                             │
│ Bottlenecks:                                               │
│ • PostgreSQL connections (25 pool limit)                   │
│ • MongoDB disk space (50GB+)                               │
│ • Network bandwidth (1Gbps)                                │
│                                                             │
│ Optimizations:                                             │
│ • Connection pooling (PgBouncer)                           │
│ • Database indexing                                        │
│ • Query caching (Redis)                                    │
│ • Message TTL cleanup (90 days)                            │
│                                                             │
│ Cost: ~$300-500/month                                      │
└─────────────────────────────────────────────────────────────┘

PHASE 2: 100K - 1M USERS (+ 6 months)
┌─────────────────────────────────────────────────────────────┐
│ Architecture:                                               │
│ • PostgreSQL: Read replicas + primary                      │
│ • MongoDB: Sharded cluster (3 shards)                      │
│ • Redis: Cluster mode (3 masters + replicas)               │
│ • 2 Regions (active-passive)                               │
│                                                             │
│ Changes:                                                    │
│ • Shard MongoDB by userId                                  │
│ • Read replicas for analytics                              │
│ • Multi-region failover                                    │
│ • Load balancer                                            │
│ • CDN for frontend                                         │
│                                                             │
│ Cost: ~$2,000-3,000/month                                  │
└─────────────────────────────────────────────────────────────┘

PHASE 3: 1M+ USERS (+ 12 months)
┌─────────────────────────────────────────────────────────────┐
│ Architecture:                                               │
│ • PostgreSQL: Multi-region Aurora                          │
│ • MongoDB: Global cluster (6+ regions)                     │
│ • Redis: Global replication                                │
│ • 5+ Regions (active-active)                               │
│                                                             │
│ Changes:                                                    │
│ • Distributed system with service mesh                     │
│ • Event streaming (Kafka)                                  │
│ • Global database replication                              │
│ • Edge computing (Lambda@Edge)                             │
│ • Autonomous scaling                                       │
│                                                             │
│ Cost: ~$10,000+/month                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                            │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Layer 1: API Gateway Security                              │
├─────────────────────────────────────────────────────────────┤
│ • HTTPS/TLS encryption (all traffic)                       │
│ • Rate limiting (100 req/min per IP)                       │
│ • DDoS protection (Cloudflare)                             │
│ • WAF rules (OWASP Top 10)                                 │
│ • Request validation & sanitization                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Authentication & Authorization                    │
├─────────────────────────────────────────────────────────────┤
│ • JWT tokens (15 min expiry)                               │
│ • Refresh tokens (7 days expiry)                           │
│ • Token blacklist (PostgreSQL)                             │
│ • RBAC (role-based access control)                         │
│ • User context validation                                   │
│ • Conversation ownership verification                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Database Security                                 │
├─────────────────────────────────────────────────────────────┤
│ PostgreSQL:                                                 │
│ • User authentication (username/password)                  │
│ • Connection encryption (SSL)                              │
│ • Parameterized queries (prevent SQL injection)            │
│ • Audit logging                                            │
│                                                             │
│ MongoDB:                                                    │
│ • User authentication (username/password)                  │
│ • Connection encryption (SSL)                              │
│ • No public internet exposure                              │
│ • Network isolation (VPC)                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Data Protection                                    │
├─────────────────────────────────────────────────────────────┤
│ • Encryption at rest (PostgreSQL + MongoDB)                │
│ • Encryption in transit (TLS 1.3)                          │
│ • Secrets management (environment variables)               │
│ • PII masking in logs                                      │
│ • Data retention policies                                  │
│ • Automatic backup encryption                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Monitoring & Incident Response                    │
├─────────────────────────────────────────────────────────────┤
│ • Real-time security alerting                              │
│ • Audit trail for all operations                           │
│ • Anomaly detection                                        │
│ • Regular security scans                                   │
│ • Incident response runbook                                │
│ • Security compliance checks (GDPR, CCPA)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Performance Metrics & SLAs

```
┌──────────────────────────────────────────────────────────────┐
│              PERFORMANCE TARGETS                             │
└──────────────────────────────────────────────────────────────┘

API Response Times (p95):
┌─────────────────────────────────────────────────────────────┐
│ POST   /conversations          Create conv:  <100ms         │
│ GET    /conversations          List convs:   <200ms         │
│ GET    /conversations/:id      Get conv:     <100ms         │
│ POST   /conversations/:id/msg  Send msg:     <500ms         │
│ GET    /conversations/:id/msg  Get history:  <200ms         │
│ POST   /conversations/:id/stream Stream:     <1000ms        │
└─────────────────────────────────────────────────────────────┘

Database Query Times:
┌─────────────────────────────────────────────────────────────┐
│ PostgreSQL:                                                 │
│ • SELECT conversation (indexed):     <10ms                 │
│ • SELECT user conversations:         <50ms (1000 records)   │
│ • UPDATE metadata:                   <20ms                 │
│                                                             │
│ MongoDB:                                                    │
│ • INSERT message:                    <5ms                  │
│ • FIND by conversationId (indexed):  <20ms (100 records)    │
│ • AGGREGATE stats:                   <100ms                │
└─────────────────────────────────────────────────────────────┘

Throughput:
┌─────────────────────────────────────────────────────────────┐
│ • Message inserts: 10,000/sec (peak)                        │
│ • API requests: 5,000/sec (per instance)                    │
│ • Database connections: 25 (PostgreSQL), 50 (MongoDB)       │
│ • Cache operations: 50,000/sec                              │
└─────────────────────────────────────────────────────────────┘

Availability:
┌─────────────────────────────────────────────────────────────┐
│ Service Level Targets:                                      │
│ • Uptime SLA:           99.9% (43 min downtime/month)       │
│ • Error Rate:           <0.1%                               │
│ • Health Check:         Every 10 seconds                    │
│ • Recovery Time:        <5 minutes                          │
│ • Max Incident Impact:  <1% of users                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Document References

- **Data Models:** HYBRID_MONGODB_POSTGRES_IMPLEMENTATION.md
- **Detailed Flows:** Refer to implementation guide
- **Deployment:** See Docker Compose configuration
- **Monitoring:** Health check endpoints & metrics collection
- **Recovery:** Backup and rollback procedures

---

**Last Updated:** November 18, 2025  
**Architecture Owner:** Backend Team  
**Review Frequency:** Quarterly or after major changes
