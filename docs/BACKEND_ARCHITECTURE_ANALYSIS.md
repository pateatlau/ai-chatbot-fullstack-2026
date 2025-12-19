# Backend Architecture Analysis Report

**Date:** November 25, 2025  
**Analysis Type:** Comprehensive Backend System Architecture Review

---

## Executive Summary

The backend implements a **hybrid microservices architecture** with:

- ✅ **Proper service isolation** - 3 independent microservices + 1 gateway
- ⚠️ **Inconsistent database strategy** - Mix of shared and service-specific databases
- ✅ **GraphQL Federation** - Apollo Gateway composing 3 subgraphs
- ✅ **Dual REST + GraphQL APIs** - Each service exposes both interfaces
- ⚠️ **Incomplete database-per-service** - Only chatbot has separate DB, others share

**Critical Issue:** Chatbot service uses `chatbot_dev` database but schema is out of sync with workspace Prisma schema (missing `mongoId` column).

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER (MFEs)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Shell   │  │Auth MFE  │  │Chatbot   │  │Admin MFE │  │Profile   │ │
│  │  :5173   │  │  :5174   │  │MFE :5175 │  │  :5176   │  │MFE :5177 │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │              │             │              │        │
│       └─────────────┴──────────────┴─────────────┴──────────────┘        │
│                                    │                                     │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                         ┌───────────▼───────────┐
                         │  GraphQL Gateway      │
                         │  Apollo Federation    │
                         │  Port: 4000          │
                         │  ┌─────────────────┐ │
                         │  │ Rate Limiting   │ │
                         │  │ Complexity      │ │
                         │  │ Analysis        │ │
                         │  │ DataLoaders     │ │
                         │  └─────────────────┘ │
                         └───────┬───────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
    ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
    │  Auth Service    │ │ Chatbot Service  │ │ Admin Service    │
    │  Port: 3000      │ │ Port: 3001       │ │ Port: 3002       │
    │  ┌────────────┐  │ │ ┌────────────┐   │ │ ┌────────────┐   │
    │  │ REST API   │  │ │ │ REST API   │   │ │ │ REST API   │   │
    │  │ /api/auth  │  │ │ │ /api/chat  │   │ │ │ /api/admin │   │
    │  └────────────┘  │ │ └────────────┘   │ │ └────────────┘   │
    │  ┌────────────┐  │ │ ┌────────────┐   │ │ ┌────────────┐   │
    │  │ GraphQL    │  │ │ │ GraphQL    │   │ │ │ GraphQL    │   │
    │  │ Subgraph   │  │ │ │ Subgraph   │   │ │ │ Subgraph   │   │
    │  │ /graphql   │  │ │ │ /graphql   │   │ │ │ /graphql   │   │
    │  └────────────┘  │ │ └────────────┘   │ │ └────────────┘   │
    │                  │ │                  │ │                  │
    │  ┌────────────┐  │ │ ┌────────────┐   │ │                  │
    │  │ Prisma     │  │ │ │ Prisma     │   │ │ ┌────────────┐   │
    │  │ Client     │  │ │ │ Client     │   │ │ │ Prisma     │   │
    │  └──────┬─────┘  │ │ └──────┬─────┘   │ │ │ Client     │   │
    │         │        │ │        │         │ │ └──────┬─────┘   │
    │         │        │ │        │         │ │        │         │
    │         │        │ │ ┌──────▼─────┐   │ │        │         │
    │         │        │ │ │ MongoDB    │   │ │        │         │
    │         │        │ │ │ Mongoose   │   │ │        │         │
    │         │        │ │ │ (Dual-DB)  │   │ │        │         │
    │         │        │ │ └────────────┘   │ │        │         │
    └─────────┼────────┘ └─────────┼────────┘ └────────┼─────────┘
              │                    │                    │
              ▼                    ▼                    ▼
    ┌──────────────────────────────────────────────────────────┐
    │              DATABASE LAYER (INCONSISTENT)               │
    │                                                          │
    │  ┌─────────────┐     ┌─────────────┐     ┌──────────┐  │
    │  │ myapp_dev   │     │ chatbot_dev │     │ MongoDB  │  │
    │  │ PostgreSQL  │     │ PostgreSQL  │     │ :27017   │  │
    │  │ :5432       │     │ :5432       │     │          │  │
    │  │             │     │             │     │ Dual-    │  │
    │  │ Tables:     │     │ Tables:     │     │ Write    │  │
    │  │ - users     │     │ - convers.  │     │ Strategy │  │
    │  │ - sessions  │     │ - messages  │     │ (Phase3) │  │
    │  │ - admins    │     │ - tokens    │     │          │  │
    │  │ - audit_log │     │             │     │ 50/50    │  │
    │  │             │     │ ⚠️ Missing: │     │ Read     │  │
    │  │ Size: 8.3MB │     │   mongoId   │     │ Split    │  │
    │  └─────────────┘     └─────────────┘     └──────────┘  │
    │                                                          │
    │        Used by:          Used by:          Used by:     │
    │     Auth Service      Chatbot Service   Chatbot Service│
    │     Admin Service                                       │
    └──────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────┐
    │              SHARED INFRASTRUCTURE                        │
    │  ┌────────────┐                                          │
    │  │   Redis    │  Session cache, rate limiting            │
    │  │   :6379    │  Used by all services                    │
    │  └────────────┘                                          │
    └──────────────────────────────────────────────────────────┘
```

---

## Service Details

### 1. Auth Service (Port 3000)

**Responsibilities:**

- User authentication (register, login, logout)
- JWT token generation and validation
- Session management
- Password reset
- OAuth integration (planned)

**Technology Stack:**

- Express.js
- Prisma ORM
- JWT authentication
- Apollo Server (subgraph)
- Redis for sessions

**Database:** `myapp_dev` (shared)

**API Endpoints:**

- REST: `/api/auth/*`
- GraphQL: `/graphql` (subgraph)

**Models Owned:**

- User
- Session
- PasswordResetToken
- BlacklistedToken

**Key Features:**

- JWT context builder for GraphQL
- Cookie-based authentication
- CORS configured for all MFEs
- Swagger documentation

---

### 2. Chatbot Service (Port 3001)

**Responsibilities:**

- AI chat conversations
- Message history
- Token usage tracking
- OpenAI integration
- MongoDB migration (Phase 3)

**Technology Stack:**

- Express.js
- Prisma ORM (PostgreSQL)
- Mongoose (MongoDB - dual-write)
- OpenAI API
- Apollo Server (subgraph)
- Redis for caching

**Database:** `chatbot_dev` (service-specific) ⚠️

**API Endpoints:**

- REST: `/api/chat/*`
- GraphQL: `/graphql` (subgraph)

**Models Owned:**

- Conversation
- Message
- TokenUsage

**Key Features:**

- **Dual-Database Strategy** (Phase 3):
  - PostgreSQL: Primary (being phased out)
  - MongoDB: Target (migration in progress)
  - Dual-write: Writes to both DBs
  - Read-switcher: 50% PostgreSQL, 50% MongoDB
  - Data migration service
- SSE streaming for real-time responses
- Read-switcher service with configurable traffic distribution

**⚠️ Critical Issue:**

- `chatbot_dev` database missing `mongoId` column
- Workspace Prisma schema includes `mongoId`
- Schema drift detected
- Service crashes on `/chat` route

---

### 3. Admin Service (Port 3002)

**Responsibilities:**

- User role management
- Admin operations
- Audit logging
- System monitoring

**Technology Stack:**

- Express.js
- Prisma ORM
- Apollo Server (subgraph)
- JWT authentication

**Database:** `myapp_dev` (shared)

**API Endpoints:**

- REST: `/api/admin/*`
- GraphQL: `/graphql` (subgraph)

**Models Owned:**

- Admin
- AuditLog

**Key Features:**

- Role-based access control (RBAC)
- Comprehensive audit logging
- Admin dashboard queries

---

### 4. GraphQL Gateway (Port 4000)

**Responsibilities:**

- Compose federated GraphQL schema
- Route queries to appropriate subgraphs
- Request forwarding and auth propagation
- Query complexity analysis
- Rate limiting

**Technology Stack:**

- Apollo Gateway
- Apollo Federation v2
- Express.js

**Features:**

- **Subgraph Composition:**
  - auth: `localhost:3000/graphql`
  - chatbot: `localhost:3001/graphql`
  - admin: `localhost:3002/graphql`
- **Security:**
  - Query complexity limits (max 1000)
  - Query depth limits (max 5)
  - Rate limiting middleware
- **Performance:**
  - DataLoaders for batching
  - Request caching
  - Schema polling (10s interval)
- **Auth Propagation:**
  - Forwards JWT tokens to subgraphs
  - Maintains auth context

---

## Database Architecture Analysis

### Current State: HYBRID (Inconsistent)

**Option A: Shared Database** (Currently used by auth + admin)

- Database: `myapp_dev`
- Size: 8.3MB
- Tables: users, sessions, password_reset_tokens, blacklisted_tokens, admins, audit_logs
- Used by: Auth Service, Admin Service
- Prisma Schema: `/prisma/schema.prisma` (workspace root)
- ✅ Pros: Simple, no sync issues, easier development
- ❌ Cons: Violates microservices principles, tight coupling

**Option B: Service-Specific Database** (Partially implemented)

- Database: `chatbot_dev`
- Size: 7.6MB
- Tables: conversations, messages, token_usage
- Used by: Chatbot Service
- Prisma Schema: Both workspace root AND service-specific
- ✅ Pros: True isolation, independent scaling
- ❌ Cons: Currently broken - schema drift

### The Fundamental Problem

**The architecture is caught between two paradigms:**

1. **Shared Database (Monolith Pattern)**
   - Simple but violates microservices
   - Auth + Admin currently using this

2. **Database-Per-Service (True Microservices)**
   - Chatbot attempting this
   - But implementation is incomplete and broken

**Root Cause of Current Issue:**

```
Workspace Prisma Schema (/prisma/schema.prisma)
  └─> Has mongoId field in Conversation model
  └─> Generates client to node_modules/.prisma/client
  └─> Migration exists but only ran on myapp_dev

Chatbot Service
  └─> Configured to use chatbot_dev database
  └─> Using workspace Prisma client (with mongoId)
  └─> Database missing mongoId column
  └─> CRASH on query execution
```

---

## Prisma Client Architecture

**Current Setup: SHARED PRISMA CLIENT**

```
/prisma/schema.prisma (workspace root)
  ├─> Contains ALL models (User, Session, Conversation, Message, Admin, etc.)
  ├─> Generates to: node_modules/.prisma/client
  └─> Used by ALL services via: import { PrismaClient } from '@prisma/client'

All services import the SAME Prisma Client
  ├─> Auth Service    → @prisma/client (all models visible)
  ├─> Chatbot Service → @prisma/client (all models visible)
  └─> Admin Service   → @prisma/client (all models visible)
```

**Problem:** Services can access models they shouldn't own (violates bounded context)

**True Microservices Approach Would Be:**

```
/apps/auth-service/prisma/schema.prisma
  └─> Only User, Session, PasswordResetToken, BlacklistedToken
  └─> Generates to: node_modules/.prisma/client-auth

/apps/chatbot-service/prisma/schema.prisma
  └─> Only Conversation, Message, TokenUsage
  └─> Generates to: node_modules/.prisma/client-chatbot

/apps/admin-service/prisma/schema.prisma
  └─> Only Admin, AuditLog
  └─> Generates to: node_modules/.prisma/client-admin
```

---

## Migration History Analysis

### Workspace-Level Migrations (`/prisma/migrations/`)

```
20251120032025_initial_schema
  ├─> Created: users, sessions, password_reset_tokens, blacklisted_tokens
  ├─> Created: conversations, messages, token_usage
  ├─> Created: admins, audit_logs
  └─> Applied to: myapp_dev ✅

20251123134401_add_mongo_id_to_conversation
  ├─> ALTER TABLE conversations ADD COLUMN mongoId TEXT
  └─> Applied to: myapp_dev ✅
```

### Service-Level Migrations

**Auth Service** (`/apps/auth-service/prisma/migrations/`)

```
20251115185953_init
  └─> Old migration (auth models only)
20251115212706_add_updated_at_to_sessions
  └─> Added updatedAt to sessions
```

**Chatbot Service** (`/apps/chatbot-service/prisma/migrations/`)

```
20251115185026_init
  └─> Old migration (chatbot models only)
  └─> DOES NOT include mongoId field
```

**Admin Service** (`/apps/admin-service/prisma/migrations/`)

```
(empty - no migrations)
```

**Conclusion:** Service-specific migrations are outdated and not synchronized with workspace schema.

---

## API Strategy: Hybrid REST + GraphQL

### REST APIs (Service-Specific)

**Auth Service** (`/api/auth`)

- POST `/register` - User registration
- POST `/login` - User login
- POST `/logout` - User logout
- POST `/refresh` - Token refresh
- POST `/forgot-password` - Password reset request
- POST `/reset-password` - Password reset

**Chatbot Service** (`/api/chat`)

- POST `/conversations` - Create conversation
- GET `/conversations` - List conversations
- POST `/conversations/:id/messages` - Send message
- GET `/conversations/:id/messages` - Get messages
- DELETE `/conversations/:id` - Delete conversation
- GET `/stream` - SSE streaming

**Admin Service** (`/api/admin`)

- GET `/users` - List users
- PUT `/users/:id/role` - Update user role
- GET `/audit-logs` - Get audit logs
- POST `/admins` - Create admin

### GraphQL APIs (Federated)

**Gateway** (`/graphql` - Port 4000)

- Composes all subgraphs
- Single unified schema

**Auth Subgraph**

```graphql
type User @key(fields: "id") {
  id: ID!
  email: String!
  name: String!
  role: String!
  avatar: String
  isActive: Boolean!
}

type Query {
  me: User
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
}
```

**Chatbot Subgraph**

```graphql
type Conversation @key(fields: "id") {
  id: ID!
  userId: String!
  title: String!
  messages: [Message!]!
  createdAt: String!
}

type Query {
  conversations(input: ConversationsInput): [Conversation!]!
  conversation(id: ID!): Conversation
}

type Mutation {
  createConversation(input: CreateConversationInput!): Conversation!
  sendMessage(input: SendMessageInput!): Message!
}
```

**Admin Subgraph**

```graphql
type Admin {
  id: ID!
  userId: String!
  role: String!
  permissions: [String!]!
}

type Query {
  admins: [Admin!]!
  auditLogs(limit: Int): [AuditLog!]!
}

type Mutation {
  assignRole(userId: ID!, role: String!): User!
}
```

---

## Environment Configuration

### Workspace Root (`.env`)

```
DATABASE_URL=postgresql://myapp:myapp_dev_password@localhost:5432/myapp_dev
MONGODB_URI=mongodb://localhost:27017/myapp
REDIS_URL=redis://localhost:6379
JWT_SECRET=my-super-secret-jwt-key...
PHASE3_MONGODB_READ_PERCENTAGE=50
```

### Chatbot Service (`.env.local`)

```
DATABASE_URL=postgresql://myapp:myapp_dev_password@localhost:5432/chatbot_dev
MONGODB_URI=mongodb://localhost:27017/myapp
OPENAI_API_KEY=sk-proj-...
```

**Issue:** Chatbot service overrides DATABASE_URL to use `chatbot_dev`

---

## Critical Issues Identified

### 🔴 Issue #1: Schema Drift - Chatbot Database Out of Sync

**Severity:** Critical (Service Crash)

**Problem:**

- Workspace Prisma schema has `mongoId` field
- Migration applied to `myapp_dev` ✅
- Migration NOT applied to `chatbot_dev` ❌
- Chatbot service crashes on query execution

**Error:**

```
The column `conversations.mongoId` does not exist in the current database.
```

**Impact:** `/chat` route completely broken

---

### ⚠️ Issue #2: Architectural Inconsistency

**Severity:** High (Design Flaw)

**Problem:**

- Auth + Admin services share `myapp_dev` (monolith pattern)
- Chatbot service uses `chatbot_dev` (microservice pattern)
- Inconsistent paradigm across services

**Impact:**

- Violates microservices principles
- Difficult to scale independently
- Unclear data ownership

---

### ⚠️ Issue #3: Shared Prisma Client Violates Bounded Context

**Severity:** Medium (Design Smell)

**Problem:**

- All services use same Prisma client
- All models visible to all services
- Chatbot service can theoretically access User/Admin models
- Auth service can access Conversation models

**Impact:**

- Breaks domain-driven design
- Tight coupling between services
- Risk of unauthorized data access

---

## Recommendations

### Option A: Fully Commit to Microservices (Recommended)

**Approach:** True database-per-service with service-specific schemas

**Implementation:**

1. Create separate databases: `auth_dev`, `chatbot_dev`, `admin_dev`
2. Create service-specific Prisma schemas:
   - `/apps/auth-service/prisma/schema.prisma` (User, Session only)
   - `/apps/chatbot-service/prisma/schema.prisma` (Conversation, Message only)
   - `/apps/admin-service/prisma/schema.prisma` (Admin, AuditLog only)
3. Generate separate Prisma clients per service
4. Run migrations independently per service
5. Remove workspace-level Prisma schema

**Pros:**

- ✅ True microservices architecture
- ✅ Independent scaling and deployment
- ✅ Clear data ownership
- ✅ Fault isolation

**Cons:**

- ❌ More complex setup
- ❌ Requires data duplication for cross-service queries
- ❌ Federation becomes more important

**Effort:** 2-3 days

---

### Option B: Revert to Shared Database (Quick Fix)

**Approach:** All services use `myapp_dev`

**Implementation:**

1. Remove `chatbot_dev` database
2. Update chatbot `.env.local` to use `myapp_dev`
3. Keep workspace-level Prisma schema
4. All services connect to same database
5. Remove service-specific Prisma directories

**Pros:**

- ✅ Simple and fast to implement
- ✅ No schema drift issues
- ✅ Easier development

**Cons:**

- ❌ Not true microservices
- ❌ Violates architectural principles
- ❌ Single point of failure
- ❌ Cannot scale databases independently

**Effort:** 1-2 hours

---

### Option C: Hybrid with Clear Boundaries (Pragmatic)

**Approach:** Shared database but with clear service boundaries

**Implementation:**

1. Use `myapp_dev` for all services
2. Create service-specific Prisma schemas (views of full schema)
3. Use GraphQL Federation as primary API boundary
4. Restrict direct database access via code reviews
5. Plan migration to separate DBs in future

**Pros:**

- ✅ Maintains development simplicity
- ✅ Establishes logical boundaries
- ✅ Easy to migrate later
- ✅ Quick fix for current issue

**Cons:**

- ❌ Still technically not microservices
- ❌ Relies on discipline, not enforcement

**Effort:** 4-6 hours

---

## Immediate Action Required

**To fix the current crash:**

1. **Quick Fix (5 minutes):**

   ```bash
   # Option 1: Run migration on chatbot_dev
   DATABASE_URL="postgresql://myapp:myapp_dev_password@localhost:5432/chatbot_dev" \
   npx prisma migrate deploy --schema=./prisma/schema.prisma

   # Option 2: Switch to myapp_dev
   # Remove apps/chatbot-service/.env.local
   # Service will use workspace .env
   ```

2. **Restart chatbot service**

3. **Verify `/chat` route works**

4. **Make architectural decision** (Option A, B, or C)

---

## Conclusion

The backend demonstrates **solid microservices foundations** with proper service isolation, GraphQL Federation, and dual API strategy. However, the **database layer is inconsistent**, mixing shared and service-specific databases without a clear strategy.

**The architecture is 70% microservices but 30% monolith.**

**Critical Path:**

1. Fix immediate chatbot crash (migrate or switch DB)
2. Choose architectural direction (A, B, or C)
3. Execute migration plan
4. Update documentation
5. Establish governance for future changes

**Recommendation:** Start with **Option B** (shared DB) to unblock development, then plan migration to **Option A** (true microservices) in Phase 4.
