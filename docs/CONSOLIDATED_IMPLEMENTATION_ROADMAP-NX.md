# Full-Stack Implementation Roadmap

## AI Chatbot Platform - Nx Monorepo Architecture

**Document Type:** Technical Implementation Guide  
**Audience:** Development Teams, Technical Leads, Project Managers, Architects  
**Version:** 8.1 (Updated November 21, 2025)  
**Last Updated:** November 21, 2025 - Authentication Flow Complete  
**Timeline:** 10 Weeks (70 days) - Sequential 3-Phase Implementation  
**Team Composition:** 3-4 developers  
**Architecture:** Unified Monorepo (Nx) with REST + GraphQL + Event Bus + Hybrid Database  
**Estimated Reading Time:** 60-90 minutes  
**Current Status:** ✅ Phase 1 Complete | 🔄 Phase 2 Infrastructure + Auth Flow Complete

**Quick Navigation:** [Strategic Priority Roadmap](#strategic-priority-roadmap-new) | [Executive Summary](#executive-summary) | [Prerequisites](#prerequisites) | [Week-by-Week Implementation](#week-by-week-implementation) | [Troubleshooting](#troubleshooting-guide) | [FAQ](#frequently-asked-questions)

---

## 🎯 REVISED IMPLEMENTATION ROADMAP (10-Week Plan)

> **Strategic Update:** November 18, 2025
>
> This represents the **optimal sequential implementation strategy** based on dependency analysis, risk mitigation, and architectural synergies. Following this order ensures each phase provides a foundation for the next, maximizing team productivity and minimizing rework.

### ✅ Phase 1: MFE Event Bus (Weeks 1-2, 10 dev-days) - **COMPLETE**

**Objective:** Establish event-driven foundation for cross-MFE communication

| Aspect             | Details                                          |
| ------------------ | ------------------------------------------------ |
| **Priority**       | 🟢 HIGH - Foundational                           |
| **Duration**       | 2 weeks (10 dev-days)                            |
| **Risk**           | 🟢 Low complexity, high confidence               |
| **Dependencies**   | None - completely independent                    |
| **Deliverables**   | Event bus library, auth sync, notifications      |
| **Success Metric** | All MFEs properly listening/responding to events |
| **Status**         | ✅ **100% COMPLETE** (November 19, 2025)         |
| **Completion**     | 70/70 hours delivered across 5 phases            |

**Week 1 Breakdown:** ✅ COMPLETE

- Day 1-2: Create `libs/frontend/event-bus` library with EventEmitter3 ✅
- Day 3-4: Implement auth events (login, logout, refresh, session-expired) ✅
- Day 5: Testing and documentation ✅

**Week 2 Breakdown:** ✅ COMPLETE

- Day 1-2: Toast/notification events implementation ✅
- Day 3-4: Cross-MFE navigation and data sync events ✅
- Day 5: Integration testing, complete event catalog ✅

**Actual Implementation (Extended):**

The Event Bus implementation was expanded into 5 comprehensive phases:

- **Phase 1:** Backend Services (10 hours) ✅
- **Phase 2:** Shared Stores & Testing (14 hours, 98 tests) ✅
- **Phase 3:** MFE Store Migration (14 hours, 8 tasks) ✅
- **Phase 4:** Component Refactoring (12 hours, 6 tasks) ✅
- **Phase 5:** DevTools & Production (20 hours, 6 tasks) ✅

**Total Delivered:** 70 hours, 8,289 lines of code, 134+ tests, 3,250+ lines of documentation

**Why Phase 1 First:**

- ✅ Low complexity, high confidence builder
- ✅ No backend dependencies or database changes
- ✅ Immediate user experience improvements
- ✅ Enables foundation for Phase 2 (GraphQL cache coordination)
- ✅ Team confidence booster before complex phases
- ✅ **COMPLETED:** Production-ready with comprehensive DevTools

**Implementation Highlights:**

```typescript
// Event bus core library (libs/shared/event-bus)
export class EventBus {
  emit(name: string, data: any): void
  subscribe(name: string, listener: Function): () => void
  once(name: string, listener: Function): () => void
  unsubscribe(name: string, listener?: Function): void
  getStats(): EventBusStats
}

// DevTools components (apps/shell/src/components/EventBusDevTools)
- EventHistoryViewer: Real-time event log with search/filter
- PerformanceMonitor: 5 metrics + event breakdown chart
- ConfigurationPanel: Production settings management
- Keyboard shortcut: Ctrl+Shift+E (Cmd+Shift+E Mac)

// Active usage across all MFEs
Auth MFE:    eventBus.emit('user:logged-in', userData)
Chatbot MFE: useEventBus('user:logged-in', handleLogin)
Profile MFE: useEventBus('theme:changed', updateTheme)
Admin MFE:   useEventBus('user:banned', refreshUserList)
Shell:       useEventBus('*', eventLogger) // 10+ events
```

**Documentation Delivered:**

- `EVENT_BUS_DEVELOPER_GUIDE.md` (700+ lines) - Complete API reference
- `EVENT_BUS_DEVTOOLS_GUIDE.md` (400+ lines) - DevTools user guide
- `EVENT_BUS_PRODUCTION_DEPLOYMENT.md` (600+ lines) - Production deployment
- `EVENT_DRIVEN_ARCHITECTURE_COMPLETE.md` (722 lines) - Project summary
- `PHASE5_COMPLETION_REPORT.md` (800 lines) - Final deliverables

**Key Code Patterns:**

```typescript
// Event bus foundation
import EventEmitter3 from 'eventemitter3';
const eventBus = new EventEmitter3();

// Auth events
eventBus.emit('auth:login', { user, accessToken });
eventBus.emit('auth:logout', {});
eventBus.emit('auth:token-refreshed', { accessToken });

// Cache invalidation events (used by Phase 2)
eventBus.emit('user:profile:updated', { userId, data });
```

---

### 🎯 Phase 2: GraphQL + REST Hybrid API (Weeks 3-6, 18 dev-days) - **IN PROGRESS**

**Objective:** Implement Apollo Federation gateway, build GraphQL subgraphs, migrate admin dashboard

| Aspect               | Details                                                 |
| -------------------- | ------------------------------------------------------- |
| **Priority**         | 🟡 MEDIUM-HIGH - Performance                            |
| **Duration**         | 4 weeks (18 dev-days)                                   |
| **Risk**             | 🟡 Medium - new technology, clear migration path        |
| **Dependencies**     | ✅ Phase 1 (Event Bus) - COMPLETE                       |
| **Deliverables**     | GraphQL gateway, 3 subgraphs, Apollo Client integration |
| **Performance Gain** | Admin dashboard: 378ms → 185ms (51% faster)             |
| **Success Metric**   | Dashboard loads in <200ms, 86% fewer API requests       |
| **Status**           | 🔄 **IN PROGRESS** (Gateway + Auth Flow Complete)       |
| **Completion**       | ~25% - Infrastructure ready, authentication verified    |

**Week 3: GraphQL Gateway Setup (5 dev-days)**

- Day 1-2: Apollo Federation gateway setup (port 4000)
- Day 3-4: Auth service GraphQL subgraph
- Day 5: Gateway routing, schema composition

**Week 4: Chatbot Subgraph & Frontend Integration (5 dev-days)**

- Day 1-2: Chatbot service GraphQL subgraph
- Day 3-4: Apollo Client v5 setup in frontend
- Day 5: Chat interface GraphQL queries, caching strategy

**Week 5: Admin Subgraph & Dashboard Migration (4 dev-days)**

- Day 1-2: Admin service GraphQL subgraph
- Day 3: Admin dashboard query migration
- Day 4: Performance verification, optimization

**Week 6: Testing & Stability (4 dev-days)**

- Day 1-2: Comprehensive testing (unit + E2E)
- Day 3: Performance profiling and optimization
- Day 4: Documentation, deployment readiness

**Why Phase 2 After Phase 1:**

- ✅ Event Bus provides cache invalidation mechanism
- ✅ REST APIs remain functional (zero breaking changes during rollout)
- ✅ Can migrate MFEs gradually
- ✅ Clear performance metrics for validation
- ✅ Team gains confidence before database migration

**Performance Impact:**

```
Admin Dashboard Current: 7 REST calls
GET /api/users
GET /api/conversations
GET /api/messages
GET /api/analytics
GET /api/stats
GET /api/trends
GET /api/export

Admin Dashboard GraphQL: 1 query
{
  users { id name email createdAt }
  conversations { id title messageCount }
  messages { id content timestamp }
  analytics { dashboardStats }
  stats { activeUsers conversionRate }
}

Result: 378ms → 185ms (51% faster)
Bandwidth: 2.4MB → 0.8MB (67% savings on mobile)
```

**Key Technologies:**

- Apollo Server v4 with Apollo Federation v2
- Apollo Client v5 for frontend
- GraphQL subscriptions for real-time updates
- Automatic field-level caching

---

### ✅ Phase 3: MongoDB + PostgreSQL Hybrid Database (Weeks 7-10, 15 dev-days)

**Objective:** Implement polyglot persistence - PostgreSQL for auth, MongoDB for chat

| Aspect               | Details                                           |
| -------------------- | ------------------------------------------------- |
| **Priority**         | 🟡 MEDIUM - Optimization, not critical            |
| **Duration**         | 4 weeks (15 dev-days)                             |
| **Risk**             | 🔴 High - data migration, requires validation     |
| **Dependencies**     | Phase 1 & 2 - abstract database complexity        |
| **Deliverables**     | MongoDB setup, dual-write pattern, data migration |
| **Performance Gain** | Message queries 30-40% faster                     |
| **Success Metric**   | Zero data loss, <2% query time increase           |

**Week 7: MongoDB Setup & Connection (4 dev-days)**

- Day 1: MongoDB cluster setup, indexing strategy
- Day 2-3: Connection pooling, backpressure handling
- Day 4: Replica set configuration, backup procedures

**Week 8: Data Migration Strategy (3 dev-days)**

- Day 1: Identify conversation/message records for migration
- Day 2: Implement dual-write pattern (write to both DBs)
- Day 3: Validate data consistency, run migration batches

**Week 9: Read Path Switching (4 dev-days)**

- Day 1-2: Switch read paths to MongoDB gradually
- Day 3: Monitor performance and query patterns
- Day 4: Rollback procedures, performance tuning

**Week 10: Complete Cutover & Validation (4 dev-days)**

- Day 1: Final dual-write validation
- Day 2: Complete cutover from PostgreSQL reads
- Day 3: Archive PostgreSQL data, cleanup
- Day 4: Load testing, production readiness

**Why Phase 3 After Phases 1 & 2:**

- ✅ Most complex, highest risk (requires extensive testing)
- ✅ By now, exact pain points known from GraphQL metrics
- ✅ Event Bus + GraphQL abstract database details
- ✅ Safer after other phases validated in production
- ✅ Gives team time to understand query patterns

---

## 📊 CURRENT IMPLEMENTATION STATUS (November 21, 2025)

### ✅ Completed Work

**Phase 1: Event Bus - 100% COMPLETE**

- ✅ 70/70 hours delivered
- ✅ 8,289 lines of code
- ✅ 134+ tests passing
- ✅ DevTools with keyboard shortcuts
- ✅ Production-ready with comprehensive documentation

**Phase 2: GraphQL Gateway - Infrastructure COMPLETE**

- ✅ Apollo Gateway server created (port 4000)
- ✅ 3 subgraph introspection polling configured
- ✅ JWT context forwarding implemented
- ✅ Health check endpoints (/health, /ready)
- ✅ CORS middleware configured
- ✅ Docker multi-stage build ready
- ✅ Environment setup scripts created

**Authentication Flow - 100% COMPLETE (November 21, 2025)**

- ✅ Cookie-based authentication working end-to-end
- ✅ HttpOnly cookies (accessToken, refreshToken)
- ✅ Module Federation bootstrap pattern (fixes RUNTIME-009 errors)
- ✅ Root route smart redirect (authenticated → /dashboard, unauthenticated → /login)
- ✅ All navigation routes verified: /login, /register, /dashboard, /chat, /admin, /profile
- ✅ CORS configured for credentials across all services
- ✅ Database unified (all services use myapp_dev)
- ✅ Logout event logger timestamp handling fixed

### 🔄 In Progress

**Phase 2: GraphQL Subgraphs - ~25% Complete**

- ⏳ Auth subgraph (pending GraphQL schema implementation)
- ⏳ Chatbot subgraph (pending GraphQL schema implementation)
- ⏳ Admin subgraph (pending GraphQL schema implementation)
- ⏳ Apollo Client frontend integration (pending)
- ⏳ Admin dashboard migration (pending)

### ⏳ Pending

**Phase 2 Remaining Work:**

- Week 3-4: GraphQL subgraph implementations
- Week 5: Apollo Client integration
- Week 6: Testing and performance optimization

**Phase 3: Hybrid Database**

- Not started (scheduled for Weeks 7-10)

### 🎯 Next Steps (Immediate)

1. **Commit authentication fixes** (uncommitted changes ready)
2. **Auth Service GraphQL Subgraph** (Week 3, Days 3-4)
   - Add /graphql endpoint to auth-service
   - Define User type with Federation directives
   - Implement query resolvers
   - Add federation reference resolution

3. **Chatbot Service GraphQL Subgraph** (Week 4, Days 1-2)
   - Add /graphql endpoint to chatbot-service
   - Define Conversation and Message types
   - Implement query resolvers

4. **Apollo Client Setup** (Week 4, Days 3-4)
   - Install Apollo Client in frontend
   - Configure cache policies
   - Set up authentication context

### 📁 Modified Files (November 21, 2025)

**Backend Services:**

- `apps/chatbot-service/src/middleware/auth.ts` - Cookie authentication support
- `apps/chatbot-service/src/main.ts` - Cookie-parser + CORS credentials
- `apps/chatbot-service/.env` - Database URL fix (chatbot_dev → myapp_dev)
- `apps/admin-service/src/main.ts` - CORS credentials configuration

**Frontend Applications:**

- `apps/shell/src/components/RootRedirect.tsx` (NEW) - Smart redirect component
- `apps/shell/src/routes/index.tsx` - Root route redirect logic
- `apps/shell/src/hooks/useEventDrivenStores.ts` - Timestamp validation
- `apps/*/src/main.tsx` (5 files) - Bootstrap pattern for Module Federation
- `apps/*/src/bootstrap.tsx` (5 NEW files) - Bootstrap implementation

**Documentation:**

- `PAUSE_CHECKPOINT.md` - Updated with authentication status
- `README.md` - Updated last modified date
- `CURRENT_STATE_SNAPSHOT.md` - Added authentication fixes section
- `docs/CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md` - This file

### ⚠️ Important Notes

1. **Uncommitted Changes:** Authentication fixes are ready but not yet committed
2. **All Services Working:** Complete authentication flow verified in browser
3. **No Breaking Changes:** All existing functionality remains intact
4. **Database Ready:** Prisma client regenerated, migrations up to date
5. **Next Phase Ready:** GraphQL gateway infrastructure complete, ready for subgraph implementation

---

**Database Allocation:**

```
PostgreSQL (Optimized):
├── users (auth, profiles, permissions)
├── sessions (JWT refresh tokens, blacklist)
├── analytics (user aggregates, statistics)
└── admin_logs (audit trail, compliance)

MongoDB (Document model):
├── conversations (hierarchical structure)
├── messages (time-series, indexed by timestamp)
├── attachments (files, metadata)
└── chat_analytics (message patterns)
```

**Data Migration Approach:**

```
Week 8: Dual-write phase
  PostgreSQL write → (mirror) → MongoDB write
  Queries still from PostgreSQL

Week 9: Gradual read switching
  10% → 25% → 50% → 75% → 90% traffic to MongoDB
  Monitor performance at each step

Week 10: Complete cutover
  100% reads from MongoDB
  PostgreSQL becomes archive/backup
```

---

### 🎯 Implementation Order Rationale

**Why this exact sequence? (Not parallel, not different order)**

#### ❌ Anti-Patterns to Avoid:

**Anti-Pattern 1: Start with Hybrid Database First**

```
Problem: Complex data sync without event bus foundation
- No way to coordinate state across MFEs
- Dual-write pattern causes stale data issues
- MFEs don't know database has changed
- High likelihood of data inconsistency bugs
Result: ❌ FAILED - Rollback required
```

**Anti-Pattern 2: Start with GraphQL First**

```
Problem: Cache invalidation nightmare without event bus
- Multiple copies of same data in Apollo cache
- No mechanism to invalidate caches across MFEs
- Stale data issues in different MFEs
- Complex cache coordination logic scattered everywhere
Result: ❌ FAILED - Architecture debt
```

**Anti-Pattern 3: Do All Three Simultaneously**

```
Problem: Overwhelming complexity, hard to debug
- Event bus bugs mixed with GraphQL bugs mixed with DB bugs
- Can't roll back individual phases
- Team context switching overload
- Production incidents likely
Result: ❌ FAILED - Emergency rollback
```

#### ✅ Why Event Bus → GraphQL → Hybrid DB is Optimal:

```
Phase 1: Event Bus (Foundation)
├─ Establishes event-driven thinking
├─ Creates cache invalidation mechanism
└─ Zero breaking changes to existing code

Phase 2: GraphQL (Performance Layer)
├─ Depends on: Event Bus for cache coordination ✅
├─ Builds on: Existing REST API (no breaking changes) ✅
├─ Enables: Clear performance metrics for Phase 3 ✅
└─ Risk reduced by: Previous phase groundwork

Phase 3: Hybrid Database (Optimization)
├─ Depends on: Event Bus for cross-DB coordination ✅
├─ Depends on: GraphQL abstraction (queries don't care about DB) ✅
├─ Benefits from: 4+ weeks of understanding query patterns
└─ Risk minimized by: Two successful previous phases ✅
```

---

### 🔗 Synergy Benefits

**Event Bus + GraphQL Synergy:**

```typescript
// GraphQL mutation emits event to invalidate caches
const mutation = gql`
  mutation updateUserProfile($data: UpdateUserInput!) {
    updateUserProfile(data: $data) {
      id
      name
      email
    }
  }
`;

// On completion, invalidate cache AND emit event
onCompleted: (data) => {
  eventBus.emit('user:profile:updated', {
    userId: data.updateUserProfile.id,
    timestamp: Date.now(),
  });
  // Apollo automatically evicts cached data
  apolloClient.cache.evict({
    id: `User:${data.updateUserProfile.id}`,
  });
};
```

**GraphQL + Hybrid Database Synergy:**

```typescript
// GraphQL subgraphs abstract database choice
// This query doesn't know or care which database it's reading from

const query = gql`
  query getConversation($id: ID!) {
    conversation(id: $id) {
      id
      messages {
        id
        content
        timestamp
      }
    }
  }
`;

// Resolver can point to MongoDB OR PostgreSQL
// Frontend doesn't change, only backend swaps database
```

**All Three Together (Complete Flow):**

```
1. User sends message
   ↓
2. Chatbot MFE → GraphQL mutation sendMessage
   ↓
3. API stores in PostgreSQL (Week 1-10) / MongoDB (Week 7-10)
   ↓
4. Event Bus emits 'message:sent' event
   ↓
5. Other MFEs listening to event bus receive update
   ↓
6. Admin MFE receiving 'message:sent' event
   ├─ Invalidates Apollo cache for conversation
   ├─ Fetches fresh GraphQL query
   ├─ Renders updated conversation view
   └─ All without polling or WebSocket

Result: Real-time synchronized MFEs with minimal coupling
```

---

### 📊 10-Week Timeline At A Glance

```
WEEK 1-2:  Event Bus Foundation
  Mon 1  Tue  Wed  Thu  Fri  Mon 2  Tue  Wed  Thu  Fri
  ████████████████████████████████████  (10 dev-days)

WEEK 3-6:  GraphQL + REST Hybrid
  Mon 3  Tue  Wed  Thu  Fri  Mon 4  Tue  Wed  Thu  Fri  ... Week 5-6
  ████████████████████████████████████████████████████████████  (18 dev-days)

WEEK 7-10: MongoDB + PostgreSQL Hybrid
  Mon 7  Tue  Wed  Thu  Fri  Mon 8  Tue  Wed  Thu  Fri  ... Week 9-10
  ████████████████████████████████████████████████████████  (15 dev-days)

TOTAL: 10 weeks = 70 calendar days = 43 dev-days work = 344 dev-hours
```

---

### 👥 Team Allocation

**Week 1-2 (Event Bus):**

- **Full team (3-4 devs):** All hands on deck
- **Goal:** High-quality foundation everyone understands

**Week 3-6 (GraphQL):**

- **Primary team (3 devs):** GraphQL gateway + subgraphs
- **Secondary team (1 dev):** Frontend Apollo Client integration
- **Parallel work:** Coordinate via established patterns

**Week 7-10 (Hybrid Database):**

- **Primary team (2 devs):** Database migration, dual-write pattern
- **Secondary team (1 dev):** Performance monitoring, optimization
- **Tertiary (1 dev):** Load testing, production readiness

### 📋 Success Criteria

| Phase              | Success Metric                        | Target           | Status        |
| ------------------ | ------------------------------------- | ---------------- | ------------- |
| Phase 1: Event Bus | All MFEs properly listening to events | 100%             | ✅ Verifiable |
| Phase 2: GraphQL   | Admin dashboard <200ms load time      | 185ms            | ✅ Measurable |
| Phase 2: GraphQL   | 86% reduction in API requests         | 1 query vs 7     | ✅ Measurable |
| Phase 3: Hybrid DB | Message queries 30-40% faster         | 30%+             | ✅ Verifiable |
| Phase 3: Hybrid DB | Zero data loss during migration       | 100% consistency | ✅ Critical   |
| Overall            | Production ready and documented       | Full coverage    | ✅ Achievable |

---

### 📁 Documentation References

**Phase 1 (Event Bus):**

- 📘 `EVENT_BUS_IMPLEMENTATION_PLAN.md` - 5-phase detailed roadmap
- 📘 `EVENT_BUS_CODE_EXAMPLES.md` - 50+ code examples
- 📘 `EVENT_BUS_STATE_MANAGEMENT_CLARIFICATION.md` - Architecture decisions

**Phase 2 (GraphQL):**

- 📘 `GRAPHQL_IMPLEMENTATION_PLAN.md` - Comprehensive strategy (50+ pages)
- 📘 `Appendix B: GraphQL Implementation Details` (below)
- 📘 Related: `COMPREHENSIVE_TEST_REPORT.md` - Testing patterns

**Phase 3 (Hybrid Database):**

- 📘 `HYBRID_POSTGRES_MONGODB_ROADMAP.md` - 6-8 week migration plan
- 📘 `HYBRID_MONGODB_POSTGRES_IMPLEMENTATION.md` - Schema design
- 📘 Related: `PRODUCTION_DEPLOYMENT.md` - Deployment strategy

---

---

## TABLE OF CONTENTS

### 📘 PART I: STRATEGIC OVERVIEW

- [Executive Summary](#executive-summary)
- [Project Overview](#-project-overview)
  - [Architecture Components](#architecture-components)
  - [Key Technologies](#key-technologies)
  - [Target Achievements](#-target-achievements)
- [Success Criteria & Metrics](#-success-criteria--metrics)
- [Team Structure](#team-structure)
  - [Backend Team](#backend-team-2-4-developers)
  - [Frontend Team](#frontend-team-2-4-developers)
  - [Shared Responsibilities](#shared-responsibilities)

### 🏗️ PART II: TECHNICAL ARCHITECTURE

- [Monorepo Architecture (Nx)](#monorepo-architecture)
  - [Why Nx?](#why-nx)
  - [Nx Monorepo Structure](#nx-monorepo-structure)
- [Hybrid API Architecture: REST + GraphQL](#hybrid-api-architecture-rest--graphql)
  - [Why Hybrid REST + GraphQL?](#why-hybrid-rest--graphql)
  - [Architecture Overview](#architecture-overview)
  - [API Responsibility Matrix](#api-responsibility-matrix)
  - [When to Use REST vs GraphQL](#when-to-use-rest-vs-graphql)
- [State Management Strategy](#state-management-strategy-hybrid-approach)
  - [Why Hybrid (Event Bus + Zustand)?](#why-hybrid-event-bus--zustand)
  - [Architecture Decision](#architecture-decision)
  - [State Management Decision Matrix](#state-management-decision-matrix)
  - [Benefits Summary](#benefits-summary)

### 📅 PART III: IMPLEMENTATION

- [Prerequisites](#prerequisites) ⚡ **START HERE**
  - [Development Environment](#development-environment)
  - [Cloud Services & Access](#cloud-services--access)
  - [Team Knowledge Requirements](#team-knowledge-requirements)
  - [Pre-Development Checklist](#pre-development-checklist)
- [Week-by-Week Implementation](#week-by-week-implementation)
  - [Week 1: Foundation & Setup](#week-1-foundation--setup)
  - [Week 2: Core Services & MFEs](#week-2-core-services--mfes)
  - [Week 3: Admin Service, GraphQL Gateway & Advanced MFEs](#week-3-admin-service-graphql-gateway--advanced-mfes)
  - [Week 4: Testing, Integration & Optimization](#week-4-testing-integration--optimization)
  - [Week 5: Deployment & Launch](#week-5-deployment--launch)
- [Coordination Mechanisms](#coordination-mechanisms)
- [Success Metrics](#success-metrics)
- [Risk Mitigation](#risk-mitigation)
- [Definition of Done](#definition-of-done)

### ⚙️ PART IV: OPERATIONS & TROUBLESHOOTING

- [Quick Start Guide](#quick-start-checklist)
  - [Day 1 Setup](#day-1-both-teams)
  - [Backend Team Day 1](#backend-team-day-1)
  - [Frontend Team Day 1](#frontend-team-day-1)
- [Risk Mitigation](#risk-mitigation)
  - [Technical Risks](#technical-risks)
  - [Process Risks](#process-risks)
  - [Deployment Risks](#deployment-risks)
- [Post-Launch Operations](#post-launch-ongoing)
- [Troubleshooting Guide](#troubleshooting-guide) 🔧
  - [Development Environment Issues](#development-environment-issues)
  - [Database Issues](#database-issues)
  - [API Integration Issues](#api-integration-issues)
  - [Docker & Deployment Issues](#docker--deployment-issues)
  - [Performance Issues](#performance-issues)
  - [Testing Issues](#testing-issues)
- [Frequently Asked Questions](#frequently-asked-questions) 💡
  - [Architecture & Design](#architecture--design)
  - [Development Workflow](#development-workflow)
  - [Testing](#testing)
  - [Deployment](#deployment)
  - [Security](#security)
  - [Performance](#performance)
  - [Nx Monorepo](#nx-monorepo)
  - [Cost & Scaling](#cost--scaling)

### 📎 APPENDICES

- [Appendix A: Detailed Feature Specifications](#appendix-a-detailed-feature-specifications)
- [Appendix B: GraphQL Implementation Details](#appendix-b-graphql-implementation-details)
- [Appendix C: Code Examples](#appendix-c-code-examples)
- [Appendix D: Glossary](#appendix-d-glossary)
- [Appendix E: Resources & References](#appendix-e-resources--references)

---

## EXECUTIVE SUMMARY

> **Document Purpose:** This roadmap guides parallel development of an enterprise AI chatbot platform using Nx monorepo architecture with hybrid REST + GraphQL APIs.

### What We're Building

An enterprise-grade AI chatbot application with a modern microservices backend and Module Federation micro-frontends. The platform enables:

- **Real-time AI conversations** with streaming responses (OpenAI integration)
- **Multi-tenant user management** with JWT authentication, SSO, and MFA
- **Admin analytics dashboard** with comprehensive user and conversation insights
- **Scalable architecture** supporting millions of users with horizontal scaling

### Strategic Approach

This roadmap follows a **security-first, architecture-second, scaling-third** approach with **three parallel initiatives** in a **unified Nx monorepo** with **hybrid REST + GraphQL API strategy** and **event-driven MFE architecture**.

**Key Differentiators:**

- **Security First (Week 1):** Fix critical JWT vulnerability (HttpOnly cookies) before scaling
- **Architecture Foundation (Weeks 1-3):** Event bus establishes zero-coupling MFE patterns
- **Scalable Infrastructure (Weeks 3-10):** PostgreSQL + MongoDB hybrid for 10M+ users
- **Monorepo Architecture:** Single Nx workspace housing frontend, backend, and shared packages
- **Hybrid API Layer:** REST for CRUD/streaming operations, GraphQL for complex data fetching
- **Nx Build System:** Intelligent task scheduling, computation caching, distributed execution
- **Code Generators:** Scaffolding tools for consistent project structure
- **Apollo Federation:** Unified GraphQL gateway across microservices
- **Event-Driven MFEs:** True micro-frontend independence with custom event bus

### Timeline & Deliverables (11-12 Week Strategic Roadmap)

| Phase       | Weeks | Focus Area            | Backend Deliverables                               | Frontend Deliverables                            | Priority    |
| ----------- | ----- | --------------------- | -------------------------------------------------- | ------------------------------------------------ | ----------- |
| **Phase 1** | 1-2   | Security + Foundation | JWT HttpOnly cookies, Auth Service, Docker setup   | Shell app, Event Bus Phase 1, shared libraries   | 🔴 CRITICAL |
| **Phase 2** | 3-6   | Hybrid Database       | PostgreSQL (Auth), MongoDB (Chatbot), hybrid setup | Event Bus Phases 2-5, MFE stores, components     | 🟡 HIGH     |
| **Phase 3** | 7-10  | Scaling & Integration | Admin Service, cross-service patterns, federation  | Chatbot MFE, Admin MFE, integration tests        | 🟢 MEDIUM   |
| **Phase 4** | 11-12 | Production Deployment | Blue-green deployment, monitoring, CI/CD           | Production builds, E2E tests, performance tuning | ✅ COMPLETE |

### Success Factors

✅ **Security First:** JWT tokens in HttpOnly cookies (OWASP-compliant, eliminates XSS vulnerability)  
✅ **Zero-Coupling MFEs:** Event bus + local Zustand stores enable true micro-frontend independence  
✅ **Enterprise Scale:** PostgreSQL + MongoDB hybrid handles 10M+ users, 100M+ messages/day  
✅ **Unified Nx Monorepo:** Intelligent caching and incremental builds (85% faster CI)  
✅ **Hybrid REST + GraphQL:** Apollo Federation with unified gateway for complex queries  
✅ **Shared Zod Schemas:** Type safety across all services and frontends  
✅ **Comprehensive Testing:** 275+ tests (>80% coverage) across all three initiatives  
✅ **Production-Ready:** Blue-green deployment, monitoring, observability, rollback strategies

---

## 📋 PROJECT OVERVIEW

> **Audience:** All team members, stakeholders  
> **Purpose:** Provide a high-level understanding of system architecture and components### Architecture Components

#### Backend Services

- **Auth Service** - JWT authentication, user management, REST + GraphQL subgraph
- **Chatbot Service** - OpenAI integration, SSE streaming, REST + GraphQL subgraph
- **Admin Service** - User management, analytics, REST + GraphQL subgraph
- **GraphQL Gateway** - Apollo Federation, unified API layer (Port 4000)
- **Database** - PostgreSQL 16 with Prisma ORM
- **Cache** - Redis 7 for sessions

#### Frontend Applications

- **Shell App** - Host application with routing and Module Federation
- **Auth MFE** - Login, registration, password reset
- **Chatbot MFE** - Chat interface, markdown rendering, streaming
- **Admin MFE** - User management, analytics dashboard
- **Profile MFE** - User settings, security

#### Shared Libraries

- **@myapp/shared/types** - Zod schemas for type safety
- **@myapp/shared/utils** - Common utilities
- **@myapp/shared/graphql-types** - Generated GraphQL types
- **@myapp/backend/logger** - Logging library
- **@myapp/backend/metrics** - Metrics library
- **@myapp/backend/security** - Security utilities
- **@myapp/backend/database** - Database utilities
- **@myapp/frontend/ui-components** - Shared UI components
- **@myapp/frontend/api-client** - REST API client with auth
- **@myapp/frontend/graphql-client** - Apollo Client for GraphQL
- **@myapp/frontend/event-bus** - Cross-MFE event communication
- **@myapp/frontend/stores** - Local Zustand stores (per MFE)
- **@myapp/frontend/hooks** - Custom React hooks
- **@myapp/frontend/utils** - Frontend utilities

### Key Technologies

| Layer              | Technologies                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Backend**        | Node.js 20, TypeScript 5.3, Express 4.18, PostgreSQL 16, Prisma 6.x, Redis 7.x, Apollo Federation, OpenAI API |
| **Frontend**       | React 18, Vite 5.x, Module Federation, Apollo Client, TanStack Query, Zustand, Tailwind CSS                   |
| **Infrastructure** | Docker, Kubernetes, GitHub Actions, Nx 22.x monorepo                                                          |
| **Testing**        | Playwright, Vitest, k6                                                                                        |
| **Shared**         | TypeScript 5.3, Zod 3.24 schemas                                                                              |

> 📝 See [Appendix A](#appendix-a-detailed-feature-specifications) for detailed specifications.

### 🎯 Target Achievements

**Phase 1 Deliverables (Security Foundation):**
✅ JWT tokens in HttpOnly Secure Cookies (eliminates XSS vulnerability)  
✅ CSRF protection with SameSite=Strict  
✅ Zero user experience impact from security migration

**Phase 1-3 Deliverables (Architecture + Scale):**
✅ Event-driven MFE architecture with zero coupling  
✅ PostgreSQL + MongoDB hybrid infrastructure for 10M+ users  
✅ Microservices + MFE architecture with 275+ tests (>80% coverage)  
✅ Production-ready deployment (Docker, K8s, multi-cloud)  
✅ Real-time SSE streaming with end-to-end type safety  
✅ Zero critical security vulnerabilities

**Optional Enhancements (Post-Launch):**

- **P1:** Google OAuth SSO, TOTP MFA (~14-20 hours)
- **P2:** GitHub OAuth, SMS MFA, Prometheus (~10-12 hours)
- **P3:** WebAuthn, Auth0 SSO, multi-region deployment

---

## 🎯 SUCCESS CRITERIA & METRICS

> **Purpose:** Define measurable success criteria and key performance indicators

### Quality Metrics

| Metric                       | Target     | Priority    | Notes                              |
| ---------------------------- | ---------- | ----------- | ---------------------------------- |
| **Test Coverage**            | >80%       | Must Have   | Unit, integration, E2E tests       |
| **Total Tests**              | 275+       | Must Have   | 220+ unit, 55+ E2E (3 initiatives) |
| **Security Vulnerabilities** | 0 critical | Must Have   | JWT fix, regular npm audit         |
| **API Response Time (p95)**  | <500ms     | Must Have   | Normal load conditions             |
| **Error Rate**               | <1%        | Must Have   | Production traffic                 |
| **Lighthouse Score**         | >90        | Should Have | Performance, accessibility, SEO    |
| **Documentation**            | Complete   | Must Have   | Architecture, API, deployment      |
| **Deployment Options**       | 3+         | Must Have   | Docker, K8s, cloud platforms       |

### Performance Benchmarks

| Operation                | Target | Acceptable | Notes                  |
| ------------------------ | ------ | ---------- | ---------------------- |
| Page Load Time           | <2s    | <3s        | First contentful paint |
| API Response (REST)      | <200ms | <500ms     | Simple queries (p95)   |
| API Response (GraphQL)   | <300ms | <600ms     | Complex queries (p95)  |
| Message Streaming Start  | <1s    | <2s        | Time to first token    |
| Database Query           | <50ms  | <100ms     | Typical queries (p95)  |
| Build Time (Full)        | <5min  | <10min     | CI/CD pipeline         |
| Build Time (Incremental) | <30s   | <1min      | Affected projects only |

### 🚦 Production Readiness Checklist

#### Development Phase (Weeks 1-10)

**JWT Security Fix (Week 1, Days 1-2):**

- [ ] HttpOnly Secure Cookies implemented
- [ ] CSRF protection enabled (SameSite=Strict)
- [ ] No tokens in localStorage
- [ ] Auto-refresh on 401 working
- [ ] All MFEs functioning post-migration
- [ ] Security test validated in F12

**Event Bus Foundation (Week 1-3):**

- [ ] Event-bus package created
- [ ] TypeScript types defined (15+ events)
- [ ] React hooks working (useEventListener, useEventEmitter)
- [ ] Unit tests passing (50+)
- [ ] Local Zustand stores per MFE
- [ ] Component refactoring complete

**Hybrid Database (Weeks 3-10):**

- [ ] PostgreSQL running with Prisma
- [ ] MongoDB running with Mongoose
- [ ] Auth Service on PostgreSQL
- [ ] Chatbot Service on MongoDB
- [ ] Admin Service on PostgreSQL
- [ ] Cross-service integration working

**General Development:**

- [ ] All tests passing (275+ tests target)
- [ ] Security audit complete (0 vulnerabilities, including JWT fix)
- [ ] Performance benchmarks validated
- [ ] Documentation complete (all 3 initiatives)
- [ ] Docker images built and tested
- [ ] CI/CD pipelines configured
- [ ] Environment templates created
- [ ] Health checks implemented
- [ ] Error handling comprehensive
- [ ] Logging configured
- [ ] Rate limiting enabled

#### Pre-Launch Tasks (Week 11)

- [ ] Generate production secrets (openssl rand -base64 64)
- [ ] Create .env.prod files with real values
- [ ] Configure domain and SSL certificate
- [ ] Set up GitHub Secrets for CI/CD
- [ ] Configure Slack webhook for notifications
- [ ] Set up monitoring dashboards
- [ ] Configure backup scripts
- [ ] Test rollback procedures (all 3 initiatives)
- [ ] Perform security penetration testing (JWT + APIs)
- [ ] Run final load tests on staging (10M users simulation)

#### Post-Launch Tasks (Week 12+)

- [ ] 24-hour intensive monitoring
- [ ] User feedback collection
- [ ] Performance monitoring (RUM)
- [ ] Error tracking (Sentry)
- [ ] Weekly performance reviews
- [ ] Monthly security audits (JWT, Event Bus, Hybrid DB)
- [ ] Quarterly dependency updates
- [ ] Feature usage analytics

### 🎯 Success Criteria

| Criteria                     | Target          | Initiative Focus   | Notes                                         |
| ---------------------------- | --------------- | ------------------ | --------------------------------------------- |
| **Test Coverage**            | >80%            | All 3              | Unit, integration, E2E tests                  |
| **Unit Tests**               | >220            | All 3              | Comprehensive component tests                 |
| **E2E Tests**                | >55             | All 3              | Critical user flows                           |
| **Security Vulnerabilities** | 0               | JWT Fix            | Regular npm audit + JWT validation            |
| **JWT Security**             | OWASP-compliant | JWT Fix            | HttpOnly, Secure, SameSite=Strict             |
| **API Response Time (p95)**  | <500ms          | Event Bus + Hybrid | Normal load conditions                        |
| **Error Rate**               | <1%             | Hybrid DB          | Production traffic                            |
| **Lighthouse Score**         | >90             | All 3              | Performance, accessibility, SEO               |
| **Documentation**            | Complete        | All 3              | Architecture, API, deployment                 |
| **Deployment Options**       | 3+              | All 3              | Docker, K8s, cloud platforms                  |
| **Timeline**                 | 11-12 weeks     | All 3              | Strategic prioritization with parallelization |

### 📝 Implementation Steps

1. **Week 1: Foundation & Setup**
   - Initialize Nx monorepo
   - Set up shared libraries and types
   - Configure Docker environment
   - Implement basic auth service

2. **Week 2: Core Services + SSO/MFA (Priority 1)**
   - Complete auth and chatbot services
   - **Implement Google OAuth 2.0 integration (8-12 hours)**
   - **Implement TOTP-based MFA (6-8 hours)**
   - Update database schema for OAuth and MFA
   - Build Auth MFE with OAuth buttons and MFA setup
   - Integrate Module Federation
   - Implement REST endpoints

3. **Week 3: Advanced Features + Optional SSO/MFA (Priority 2-3)**
   - Add GraphQL Gateway with Apollo Federation
   - Implement Admin service and MFE
   - Complete Chatbot MFE and Profile MFE
   - Set up subgraph architecture
   - **Optional: GitHub OAuth integration (4-6 hours)**
   - **Optional: SMS MFA with Twilio (4-6 hours)**

4. **Week 4: Testing & Optimization**
   - Comprehensive E2E testing
   - Performance optimization
   - Security hardening
   - Load testing

5. **Week 5: Deployment**
   - CI/CD pipeline setup
   - Docker containerization
   - Production deployment
   - Monitoring and observability

---

# PART II: TECHNICAL ARCHITECTURE

> **Section Overview:** Detailed look at architectural decisions, technology choices, and system design

## TEAM STRUCTURE

### Backend Team (2-4 developers)

**Responsibilities:**

- Microservices development (Auth, Chatbot, Admin)
- Database schema design and migrations
- API endpoint implementation
- Backend testing (unit, integration, E2E)
- AWS infrastructure provisioning
- Backend CI/CD pipeline

**Tech Stack:**

- Node.js v20 + TypeScript 5.3 + Express 4.18
- PostgreSQL 16 + Prisma 6.x
- **Apollo Server + Apollo Federation (GraphQL)**
- Redis 7.x + BullMQ
- AWS ECS Fargate, RDS, ElastiCache
- Zod 3.24 (validation)

### Frontend Team (2-4 developers)

**Responsibilities:**

- Micro-frontend development (Shell, Auth, Chatbot, Admin, Profile)
- UI/UX implementation
- State management (Event Bus for cross-MFE + Zustand for local + TanStack Query)
- Frontend testing (unit, integration, E2E)
- Design system implementation
- Frontend CI/CD pipeline

**Tech Stack:**

- React 18 + TypeScript 5.3 + Vite 5.x
- React Router v7 + Custom Event Bus + Zustand v5 + TanStack Query v5
- **Apollo Client (GraphQL) + REST API client**
- Tailwind CSS v4 + Radix UI
- Module Federation
- Zod 3.24 (validation)

### Shared Responsibilities

**Both teams contribute to:**

- Shared Zod schemas package
- API contract definition (REST + GraphQL schemas)
- GraphQL query/mutation definitions
- Integration testing (REST + GraphQL)
- Documentation (OpenAPI + GraphQL Schema)
- Deployment coordination

---

## STATE MANAGEMENT STRATEGY: HYBRID APPROACH

### Why Hybrid (Event Bus + Zustand)?

For true MFE independence and scalability, we use a **hybrid state management approach**:

**Event Bus** - Cross-MFE communication (loose coupling)
**Zustand** - Local state within each MFE (developer experience)

### Architecture Decision

| Use Case             | Solution        | Why                                  |
| -------------------- | --------------- | ------------------------------------ |
| User login/logout    | Event Bus       | All MFEs need to react independently |
| Theme changes        | Event Bus       | Global UI preference                 |
| Navigation commands  | Event Bus       | MFE-to-MFE routing                   |
| Global notifications | Event Bus       | Toast messages across boundaries     |
| Form state           | Zustand (local) | Isolated to single MFE               |
| Chat messages        | Zustand (local) | Chatbot MFE only                     |
| Admin filters        | Zustand (local) | Admin MFE only                       |
| API cache            | TanStack Query  | Server state management              |

### Benefits

**True MFE Independence:** Each MFE deploys independently with version freedom  
**Loose Coupling:** Events-based communication via contracts, not implementations  
**Clear Boundaries:** Namespaced events (`auth:*`, `chat:*`, `admin:*`) prevent conflicts

### Event Bus Implementation

**Library:** `libs/frontend/event-bus`

```typescript
// libs/frontend/event-bus/src/index.ts
type EventCallback<T = any> = (data: T) => void;

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();

  subscribe<T>(event: string, callback: EventCallback<T>) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.events.get(event)?.delete(callback);
    };
  }

  publish<T>(event: string, data?: T) {
    this.events.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  clear(event?: string) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export const eventBus = new EventBus();

// Type-safe event definitions
export const Events = {
  // Authentication
  USER_LOGIN: 'auth:user:login',
  USER_LOGOUT: 'auth:user:logout',
  TOKEN_REFRESH: 'auth:token:refresh',

  // Theme
  THEME_CHANGE: 'ui:theme:change',
  LANGUAGE_CHANGE: 'ui:language:change',

  // Navigation
  NAVIGATE_TO: 'nav:navigate:to',

  // Notifications
  SHOW_TOAST: 'ui:toast:show',
  SHOW_ERROR: 'ui:error:show',

  // Chat
  CONVERSATION_CREATED: 'chat:conversation:created',
  MESSAGE_RECEIVED: 'chat:message:received',
} as const;

// Type-safe event data interfaces
export interface UserLoginEvent {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  accessToken: string;
}

export interface ThemeChangeEvent {
  theme: 'light' | 'dark' | 'auto';
}

export interface NavigateEvent {
  path: string;
  replace?: boolean;
}

export interface ToastEvent {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
```

### Usage Examples

**Shell App (Publisher):**

```typescript
// apps/shell/src/App.tsx
import { eventBus, Events } from '@myapp/frontend/event-bus';

function App() {
  const handleLogin = (userData: UserLoginEvent) => {
    // Publish login event - all MFEs will react
    eventBus.publish(Events.USER_LOGIN, userData);
  };

  const handleThemeToggle = () => {
    eventBus.publish(Events.THEME_CHANGE, { theme: 'dark' });
  };

  return <RouterProvider router={router} />;
}
```

**Auth MFE (Publisher + Subscriber):**

```typescript
// apps/auth-mfe/src/hooks/useAuth.ts
import { eventBus, Events, UserLoginEvent } from '@myapp/frontend/event-bus';
import { create } from 'zustand';

// Local Zustand store for Auth MFE
interface AuthStore {
  isAuthenticated: boolean;
  user: UserLoginEvent | null;
  setUser: (user: UserLoginEvent) => void;
  logout: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  setUser: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    // Listen for logout events from other MFEs
    const unsubscribe = eventBus.subscribe(Events.USER_LOGOUT, () => {
      store.logout();
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginInput) => {
    const response = await apiClient.post('/auth/login', credentials);
    const userData = response.data;

    // Update local store
    store.setUser(userData);

    // Publish event for other MFEs
    eventBus.publish(Events.USER_LOGIN, userData);
  };

  return { ...store, login };
}
```

**Chatbot MFE (Subscriber):**

```typescript
// apps/chatbot-mfe/src/App.tsx
import { eventBus, Events } from '@myapp/frontend/event-bus';
import { create } from 'zustand';

// Local Zustand store for Chatbot MFE
interface ChatStore {
  messages: Message[];
  currentUser: UserLoginEvent | null;
  addMessage: (msg: Message) => void;
  setUser: (user: UserLoginEvent | null) => void;
}

const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  currentUser: null,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setUser: (user) => set({ currentUser: user }),
}));

function ChatbotApp() {
  const setUser = useChatStore((state) => state.setUser);

  useEffect(() => {
    // Listen for authentication events
    const unsubLogin = eventBus.subscribe(Events.USER_LOGIN, (data) => {
      setUser(data);
    });

    const unsubLogout = eventBus.subscribe(Events.USER_LOGOUT, () => {
      setUser(null);
    });

    return () => {
      unsubLogin();
      unsubLogout();
    };
  }, []);

  return <ChatInterface />;
}
```

**Profile MFE (Subscriber):**

```typescript
// apps/profile-mfe/src/App.tsx
import { eventBus, Events } from '@myapp/frontend/event-bus';
import { useState } from 'react';

function ProfileApp() {
  // This MFE uses simple React state instead of Zustand
  const [user, setUser] = useState<UserLoginEvent | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Listen for auth events
    const unsubLogin = eventBus.subscribe(Events.USER_LOGIN, setUser);
    const unsubLogout = eventBus.subscribe(Events.USER_LOGOUT, () => setUser(null));

    // Listen for theme changes
    const unsubTheme = eventBus.subscribe(Events.THEME_CHANGE, (data) => {
      setTheme(data.theme);
    });

    return () => {
      unsubLogin();
      unsubLogout();
      unsubTheme();
    };
  }, []);

  return <ProfileSettings user={user} theme={theme} />;
}
```

### State Management Decision Matrix

| Data Type            | Scope  | Solution                 | Example                             |
| -------------------- | ------ | ------------------------ | ----------------------------------- |
| Authentication state | Global | Event Bus → Local Store  | User login broadcasts to all MFEs   |
| Current user object  | Global | Event Bus → Local Store  | Each MFE stores user in own way     |
| Theme preference     | Global | Event Bus → Local Store  | UI preference across all MFEs       |
| Form input values    | Local  | Zustand/React State      | Login form in Auth MFE              |
| Modal open/closed    | Local  | Zustand/React State      | Delete confirmation in Admin MFE    |
| Chat messages        | Local  | Zustand + TanStack Query | Only Chatbot MFE needs these        |
| API responses        | Cache  | TanStack Query           | Server state management             |
| Optimistic updates   | Local  | Zustand + TanStack Query | Send message before server confirms |

### Benefits Summary

**For Development:**

- Each MFE team has full autonomy
- Can refactor internal state without affecting others
- Easy to understand ownership (events vs local state)
- Better testing (mock events easily)

**For Deployment:**

- True independent deployments
- No risk of state shape breaking changes
- Can hotfix one MFE without touching others
- Easier rollback strategies

**For Scaling:**

- Add new MFEs that listen to existing events
- No need to modify shared store structure
- Clear event contracts act as API documentation
- Future-proof for additional MFEs

---

## MONOREPO ARCHITECTURE

### Why Nx?

**Key Advantages:**

✅ **Intelligent Caching** - Never rebuild unchanged code (85% faster CI)
✅ **Affected Detection** - Test/build only changed projects  
✅ **Dependency Graph** - Visual project relationships (`nx graph`)  
✅ **Code Generators** - Consistent scaffolding for services/components  
✅ **Plugin Ecosystem** - Official support for Node, React, Vite, Next.js  
✅ **Boundary Enforcement** - Tags prevent architectural violations

### Nx Monorepo Structure

```
my-app-nx-monorepo/
├── nx.json                      # Nx configuration
├── package.json                 # Root dependencies
├── package-lock.json            # npm lock file
├── tsconfig.base.json           # Base TypeScript config
├── .eslintrc.json              # Shared ESLint config
├── .prettierrc                  # Prettier config
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI with Nx
│       └── deploy.yml          # Deployment
├── apps/                        # Applications (deployable)
│   ├── auth-service/           # Backend: Auth microservice
│   │   ├── project.json
│   │   ├── src/
│   │   ├── prisma/
│   │   └── Dockerfile
│   ├── chatbot-service/        # Backend: Chatbot microservice
│   ├── admin-service/          # Backend: Admin microservice
│   ├── shell/                  # Frontend: Shell app (host)
│   │   ├── project.json
│   │   ├── vite.config.ts
│   │   └── src/
│   ├── auth-mfe/               # Frontend: Auth microfrontend
│   ├── chatbot-mfe/            # Frontend: Chatbot microfrontend
│   ├── admin-mfe/              # Frontend: Admin microfrontend
│   └── profile-mfe/            # Frontend: Profile microfrontend
├── libs/                        # Shared libraries (reusable)
│   ├── shared/
│   │   ├── types/              # Shared Zod schemas
│   │   │   ├── project.json
│   │   │   └── src/
│   │   │       ├── schemas/
│   │   │       │   ├── user.schema.ts
│   │   │       │   ├── auth.schema.ts
│   │   │       │   ├── chat.schema.ts
│   │   │       │   └── admin.schema.ts
│   │   │       └── index.ts
│   │   └── utils/              # Common utilities
│   ├── backend/
│   │   ├── logger/             # Logging library
│   │   ├── metrics/            # Metrics library
│   │   ├── security/           # Security utilities
│   │   ├── database/           # Database utilities
│   │   └── testing/            # Test utilities
│   └── frontend/
│       ├── ui-components/      # Shared UI components
│       ├── api-client/         # API client
│       ├── stores/             # Shared stores
│       └── utils/              # Frontend utilities
├── tools/                       # Custom scripts and generators
│   ├── generators/
│   └── scripts/
└── docs/
    ├── architecture/
    └── README.md
```

**Key Differences from Traditional Monorepo:**

- **apps/** - Deployable applications (services, frontends)
- **libs/** - Reusable libraries (cannot be deployed directly)
- **project.json** - Per-project configuration (targets, tags, etc.)
- **nx.json** - Global Nx configuration
- **Generators** - Create new apps/libs with `nx generate`
- **Tags** - Enforce architectural boundaries (e.g., backend can't import frontend)

````

---

## HYBRID API ARCHITECTURE: REST + GraphQL

### Why Hybrid REST + GraphQL?

**REST for:** Auth flows, CRUD operations, file uploads, SSE streaming
**GraphQL for:** Complex queries, reducing over/under-fetching, flexible data needs

**Performance Gains:**
- Admin dashboard: 50% faster (7 REST calls → 1 GraphQL query)
- User profile: 60% less data transfer
- Mobile: 40% fewer round trips

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   REST       │  │   Apollo     │  │   MSW        │          │
│  │   Client     │  │   Client     │  │   Handlers   │          │
│  │   (axios)    │  │   (GraphQL)  │  │   (Testing)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘          │
│         │                  │                                      │
│         │                  │                                      │
└─────────┼──────────────────┼──────────────────────────────────────┘
          │                  │
          │ REST             │ GraphQL
          │                  │
┌─────────┼──────────────────┼──────────────────────────────────────┐
│         │                  │         API Gateway (Nginx)          │
│         │                  │         :80 (production)             │
│         │                  │                                      │
└─────────┼──────────────────┼──────────────────────────────────────┘
          │                  │
          ▼                  ▼
   ┌────────────┐    ┌──────────────────┐
   │ REST APIs  │    │ GraphQL Gateway  │
   │ (Direct)   │    │ Apollo Federation│
   │            │    │ Port: 4000       │
   └─────┬──────┘    └────────┬─────────┘
         │                    │
         │                    │ Federated Queries
         │                    ├────────────────┬────────────────┐
         │                    ▼                ▼                ▼
   ┌─────▼────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Auth Service │    │   Auth   │    │ Chatbot  │    │  Admin   │
   │ Port: 3000   │    │ Subgraph │    │ Subgraph │    │ Subgraph │
   │              │    │          │    │          │    │          │
   │ REST + GQL   │    └────┬─────┘    └────┬─────┘    └────┬─────┘
   └──────────────┘         │               │               │
   ┌──────────────┐         │               │               │
   │ Chatbot Svc  │         ▼               ▼               ▼
   │ Port: 3001   │    PostgreSQL      MongoDB         PostgreSQL
   │ REST + GQL   │    (Users/Auth)    (Chats)         (Analytics)
   └──────────────┘
   ┌──────────────┐
   │ Admin Service│
   │ Port: 3002   │
   │ REST + GQL   │
   └──────────────┘
```

### API Responsibility Matrix

| Operation | Protocol | Service | Reason |
|-----------|----------|---------|--------|
| Login / Logout | REST | Auth Service | Standard HTTP auth flow |
| Token Refresh | REST | Auth Service | Simple request/response |
| User Registration | REST | Auth Service | CRUD operation |
| Password Reset | REST | Auth Service | Email-triggered flow |
| **User Profile (full)** | **GraphQL** | Auth Subgraph | Includes roles, permissions, stats |
| Send Chat Message | REST | Chatbot Service | Direct write operation |
| **Conversation List** | **GraphQL** | Chatbot Subgraph | Nested data (messages, stats) |
| **Single Conversation** | **GraphQL** | Chatbot Subgraph | Messages + user info + metadata |
| Streaming Chat (SSE) | REST | Chatbot Service | Server-Sent Events |
| **Admin Dashboard** | **GraphQL** | Admin Subgraph | 7+ data points in 1 query |
| **User Analytics** | **GraphQL** | Admin Subgraph | Aggregations across services |
| Audit Log Export | REST | Admin Service | File download |
| System Health Check | REST | All Services | Simple ping |

### GraphQL Gateway Setup (Apollo Federation)

**Step 1: Install GraphQL Gateway Dependencies**

```bash
# Create GraphQL Gateway application
nx generate @nx/node:application graphql-gateway \
  --directory=apps/graphql-gateway \
  --framework=express \
  --tags=type:backend,scope:gateway

# Install Apollo Federation dependencies
cd apps/graphql-gateway
npm install @apollo/server @apollo/gateway @apollo/subgraph-js graphql graphql-tag
npm install --save-dev @graphql-tools/schema
```

**Step 2: Create GraphQL Gateway Server**

Create `apps/graphql-gateway/src/main.ts`:

```typescript
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { json } from 'body-parser';
import cors from 'cors';

const app = express();

// Apollo Gateway with Federation
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: 'http://localhost:3000/graphql' },
      { name: 'chatbot', url: 'http://localhost:3001/graphql' },
      { name: 'admin', url: 'http://localhost:3002/graphql' },
    ],
    // Poll for schema changes every 10 seconds
    pollIntervalInMs: 10000,
  }),
});

const server = new ApolloServer({
  gateway,
  // Enable introspection in development
  introspection: process.env.NODE_ENV !== 'production',
});

async function startServer() {
  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        // Pass auth token to subgraphs
        headers: {
          authorization: req.headers.authorization || '',
        },
      }),
    })
  );

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 GraphQL Gateway ready at http://localhost:${port}/graphql`);
  });
}

startServer();
```

**Step 3: Configure Gateway in Docker Compose**

Add to `docker-compose.yml`:

```yaml
graphql-gateway:
  build:
    context: .
    dockerfile: apps/graphql-gateway/Dockerfile
  ports:
    - "4000:4000"
  environment:
    - NODE_ENV=production
    - AUTH_SERVICE_URL=http://auth-service:3000
    - CHATBOT_SERVICE_URL=http://chatbot-service:3001
    - ADMIN_SERVICE_URL=http://admin-service:3002
  depends_on:
    - auth-service
    - chatbot-service
    - admin-service
  networks:
    - app-network
```

### Service Subgraph Implementation

#### Auth Service Subgraph

**Install Dependencies:**

```bash
cd apps/auth-service
npm install @apollo/subgraph graphql graphql-tag
```

**Create GraphQL Schema** - `apps/auth-service/src/graphql/schema.ts`:

```typescript
import { gql } from 'graphql-tag';

export const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  type User @key(fields: "id") {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    permissions: [String!]!
    createdAt: String!
    profile: UserProfile
    # Federation: Allow other subgraphs to extend User
  }

  type UserProfile {
    bio: String
    avatar: String
    phone: String
    timezone: String
  }

  enum UserRole {
    USER
    ADMIN
    MODERATOR
  }

  type Query {
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
  }

  type Mutation {
    updateProfile(input: UpdateProfileInput!): User!
    changePassword(input: ChangePasswordInput!): Boolean!
  }

  input UpdateProfileInput {
    name: String
    bio: String
    avatar: String
    phone: String
    timezone: String
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }
`;
```

**Create Resolvers** - `apps/auth-service/src/graphql/resolvers.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      const userId = context.user?.id;
      if (!userId) throw new Error('Unauthorized');

      return prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
    },

    user: async (_parent: any, { id }: { id: string }, context: any) => {
      // Check permissions
      if (!context.user?.permissions?.includes('read:users')) {
        throw new Error('Forbidden');
      }

      return prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      });
    },

    users: async (
      _parent: any,
      { limit = 20, offset = 0 }: { limit?: number; offset?: number },
      context: any
    ) => {
      if (!context.user?.permissions?.includes('read:users')) {
        throw new Error('Forbidden');
      }

      return prisma.user.findMany({
        take: limit,
        skip: offset,
        include: { profile: true },
      });
    },
  },

  Mutation: {
    updateProfile: async (
      _parent: any,
      { input }: { input: any },
      context: any
    ) => {
      const userId = context.user?.id;
      if (!userId) throw new Error('Unauthorized');

      return prisma.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          profile: {
            upsert: {
              create: input,
              update: input,
            },
          },
        },
        include: { profile: true },
      });
    },
  },

  User: {
    // Federation resolver: allows other subgraphs to reference User
    __resolveReference: async (reference: { id: string }) => {
      return prisma.user.findUnique({
        where: { id: reference.id },
        include: { profile: true },
      });
    },
  },
};
```

**Add GraphQL Endpoint to Express** - Update `apps/auth-service/src/main.ts`:

```typescript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { verifyToken } from './middleware/auth';

// ... existing Express setup ...

const apolloServer = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

await apolloServer.start();

app.use(
  '/graphql',
  express.json(),
  async (req, res, next) => {
    // Extract user from JWT for context
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        req.user = await verifyToken(token);
      } catch (err) {
        // Continue without user context
      }
    }
    next();
  },
  expressMiddleware(apolloServer, {
    context: async ({ req }) => ({
      user: (req as any).user,
    }),
  })
);

// REST endpoints remain as before
app.post('/auth/login', loginHandler);
app.post('/auth/refresh', refreshHandler);
// ...
```

#### Chatbot Service Subgraph

**Schema** - `apps/chatbot-service/src/graphql/schema.ts`:

```typescript
import { gql } from 'graphql-tag';

export const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  # Extend User from Auth subgraph
  extend type User @key(fields: "id") {
    id: ID! @external
    conversations: [Conversation!]!
    messageCount: Int!
    lastActiveAt: String
  }

  type Conversation @key(fields: "id") {
    id: ID!
    userId: ID!
    user: User!
    title: String!
    messages: [Message!]!
    messageCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Message {
    id: ID!
    conversationId: ID!
    role: MessageRole!
    content: String!
    tokens: Int
    createdAt: String!
  }

  enum MessageRole {
    USER
    ASSISTANT
    SYSTEM
  }

  type ConversationStats {
    totalConversations: Int!
    totalMessages: Int!
    averageMessagesPerConversation: Float!
    lastActiveAt: String
  }

  type Query {
    conversation(id: ID!): Conversation
    conversations(userId: ID!, limit: Int, offset: Int): [Conversation!]!
    conversationStats(userId: ID!): ConversationStats!
  }

  type Mutation {
    createConversation(title: String!): Conversation!
    deleteConversation(id: ID!): Boolean!
    renameConversation(id: ID!, title: String!): Conversation!
  }
`;
```

**Resolvers** - `apps/chatbot-service/src/graphql/resolvers.ts`:

```typescript
import mongoose from 'mongoose';
import { Conversation } from './models/conversation';
import { Message } from './models/message';

export const resolvers = {
  Query: {
    conversation: async (_: any, { id }: { id: string }, context: any) => {
      const conv = await Conversation.findById(id);
      if (!conv) throw new Error('Conversation not found');

      // Check ownership
      if (conv.userId !== context.user?.id && !context.user?.permissions?.includes('read:all-conversations')) {
        throw new Error('Forbidden');
      }

      return conv;
    },

    conversations: async (
      _: any,
      { userId, limit = 20, offset = 0 }: any,
      context: any
    ) => {
      // Only allow users to see their own conversations or admins to see all
      if (userId !== context.user?.id && !context.user?.permissions?.includes('read:all-conversations')) {
        throw new Error('Forbidden');
      }

      return Conversation.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .skip(offset);
    },

    conversationStats: async (_: any, { userId }: any, context: any) => {
      if (userId !== context.user?.id && !context.user?.permissions?.includes('read:all-conversations')) {
        throw new Error('Forbidden');
      }

      const conversations = await Conversation.find({ userId });
      const messageCount = await Message.countDocuments({
        conversationId: { $in: conversations.map(c => c._id) },
      });

      return {
        totalConversations: conversations.length,
        totalMessages: messageCount,
        averageMessagesPerConversation: conversations.length > 0
          ? messageCount / conversations.length
          : 0,
        lastActiveAt: conversations[0]?.updatedAt || null,
      };
    },
  },

  Conversation: {
    messages: async (parent: any) => {
      return Message.find({ conversationId: parent._id }).sort({ createdAt: 1 });
    },

    messageCount: async (parent: any) => {
      return Message.countDocuments({ conversationId: parent._id });
    },

    user: (parent: any) => {
      // Return reference - Auth subgraph will resolve
      return { __typename: 'User', id: parent.userId };
    },
  },

  User: {
    conversations: async (parent: any) => {
      return Conversation.find({ userId: parent.id }).sort({ updatedAt: -1 });
    },

    messageCount: async (parent: any) => {
      const conversations = await Conversation.find({ userId: parent.id });
      return Message.countDocuments({
        conversationId: { $in: conversations.map(c => c._id) },
      });
    },

    lastActiveAt: async (parent: any) => {
      const lastConv = await Conversation.findOne({ userId: parent.id })
        .sort({ updatedAt: -1 })
        .limit(1);
      return lastConv?.updatedAt || null;
    },
  },
};
```

#### Admin Service Subgraph

**Schema** - `apps/admin-service/src/graphql/schema.ts`:

```typescript
import { gql } from 'graphql-tag';

export const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  extend type User @key(fields: "id") {
    id: ID! @external
    analyticsData: UserAnalytics
  }

  type UserAnalytics {
    userId: ID!
    totalConversations: Int!
    totalMessages: Int!
    totalTokensUsed: Int!
    averageResponseTime: Float!
    lastActiveAt: String
    signupDate: String!
    isPremium: Boolean!
  }

  type SystemStats {
    totalUsers: Int!
    activeUsersToday: Int!
    totalConversations: Int!
    totalMessages: Int!
    averageTokensPerMessage: Float!
    systemHealth: String!
  }

  type AuditLog {
    id: ID!
    userId: ID!
    action: String!
    resource: String!
    details: String
    ipAddress: String
    timestamp: String!
  }

  type Query {
    systemStats: SystemStats!
    userAnalytics(userId: ID!): UserAnalytics
    allUserAnalytics(limit: Int, offset: Int): [UserAnalytics!]!
    auditLogs(userId: ID, limit: Int, offset: Int): [AuditLog!]!
  }
`;
```

**Resolvers** - `apps/admin-service/src/graphql/resolvers.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    systemStats: async (_: any, __: any, context: any) => {
      if (!context.user?.permissions?.includes('read:analytics')) {
        throw new Error('Forbidden');
      }

      const totalUsers = await prisma.user.count();
      const activeUsersToday = await prisma.user.count({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      // Aggregate from other services via federation
      return {
        totalUsers,
        activeUsersToday,
        totalConversations: 0, // Resolved by Chatbot subgraph
        totalMessages: 0, // Resolved by Chatbot subgraph
        averageTokensPerMessage: 0,
        systemHealth: 'healthy',
      };
    },

    userAnalytics: async (_: any, { userId }: any, context: any) => {
      if (!context.user?.permissions?.includes('read:analytics')) {
        throw new Error('Forbidden');
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      return {
        userId,
        totalConversations: 0, // Chatbot subgraph
        totalMessages: 0, // Chatbot subgraph
        totalTokensUsed: 0,
        averageResponseTime: 0,
        lastActiveAt: user.lastActiveAt,
        signupDate: user.createdAt,
        isPremium: user.role === 'PREMIUM',
      };
    },

    auditLogs: async (
      _: any,
      { userId, limit = 50, offset = 0 }: any,
      context: any
    ) => {
      if (!context.user?.permissions?.includes('read:audit-logs')) {
        throw new Error('Forbidden');
      }

      const where = userId ? { userId } : {};

      return prisma.auditLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { timestamp: 'desc' },
      });
    },
  },

  User: {
    analyticsData: async (parent: any, _: any, context: any) => {
      if (!context.user?.permissions?.includes('read:analytics')) {
        return null;
      }

      return prisma.userAnalytics.findUnique({
        where: { userId: parent.id },
      });
    },
  },
};
```

### Frontend GraphQL Integration

**Step 1: Install Apollo Client**

```bash
npm install @apollo/client graphql
```

**Step 2: Create Apollo Client Wrapper** - `libs/frontend/graphql-client/src/client.ts`:

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.VITE_GRAPHQL_GATEWAY_URL || 'http://localhost:4000/graphql',
});

// Add auth token to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        keyFields: ['id'],
      },
      Conversation: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

**Step 3: Add Apollo Provider to Shell** - Update `apps/shell/src/main.tsx`:

```typescript
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@myapp/frontend/graphql-client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ApolloProvider>
  </React.StrictMode>
);
```

**Step 4: Example Query Hook** - `libs/frontend/graphql-client/src/queries/user.ts`:

```typescript
import { gql, useQuery } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: ID!) {
    user(id: $userId) {
      id
      email
      name
      role
      permissions
      profile {
        bio
        avatar
        timezone
      }
      # From Chatbot subgraph
      messageCount
      lastActiveAt
      conversations(limit: 5) {
        id
        title
        messageCount
        updatedAt
      }
      # From Admin subgraph
      analyticsData {
        totalTokensUsed
        averageResponseTime
        isPremium
      }
    }
  }
`;

export function useUserProfile(userId: string) {
  return useQuery(GET_USER_PROFILE, {
    variables: { userId },
    skip: !userId,
  });
}
```

**Step 5: Example Admin Dashboard Query** - `apps/admin-mfe/src/queries/dashboard.ts`:

```typescript
import { gql, useQuery } from '@apollo/client';

export const GET_ADMIN_DASHBOARD = gql`
  query GetAdminDashboard {
    systemStats {
      totalUsers
      activeUsersToday
      totalConversations
      totalMessages
      systemHealth
    }

    allUserAnalytics(limit: 10) {
      userId
      totalConversations
      totalMessages
      totalTokensUsed
      lastActiveAt
      isPremium
    }

    auditLogs(limit: 20) {
      id
      userId
      action
      resource
      timestamp
    }
  }
`;

export function useAdminDashboard() {
  return useQuery(GET_ADMIN_DASHBOARD, {
    pollInterval: 30000, // Refresh every 30 seconds
  });
}
```

**Usage in Component:**

```typescript
import { useAdminDashboard } from './queries/dashboard';

export function AdminDashboard() {
  const { data, loading, error } = useAdminDashboard();

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="dashboard">
      <StatsCards stats={data.systemStats} />
      <UserAnalyticsTable users={data.allUserAnalytics} />
      <AuditLogFeed logs={data.auditLogs} />
    </div>
  );
}
```

### When to Use REST vs GraphQL

| Use Case | Choose | Why |
|----------|--------|-----|
| Login/Logout | REST | Standard HTTP auth, simple request/response |
| Token Refresh | REST | No complex data needs |
| Send Chat Message | REST | Direct write, no nested reads |
| File Upload | REST | Multipart form data |
| SSE Streaming | REST | Server-Sent Events protocol |
| Password Reset | REST | Email flow, no data fetching |
| User Profile Page | GraphQL | Combines user data + stats + conversations |
| Admin Dashboard | GraphQL | 7+ data points across 3 services |
| Conversation List | GraphQL | Nested messages + user info |
| Analytics Report | GraphQL | Aggregations across multiple sources |
| Search | GraphQL | Flexible filtering and sorting |
| Mobile App | GraphQL | Request only needed fields, save bandwidth |

### Performance Comparison

**Example: Admin Dashboard**

**Before (REST - 7 requests):**
```
GET /api/users/stats          → 45ms
GET /api/conversations/count  → 62ms
GET /api/messages/count       → 58ms
GET /api/analytics/tokens     → 73ms
GET /api/users/active         → 51ms
GET /api/system/health        → 22ms
GET /api/audit-logs?limit=20  → 67ms
────────────────────────────────────
Total: 378ms + network overhead
7 round trips
```

**After (GraphQL - 1 request):**
```
POST /graphql (combined query) → 185ms
────────────────────────────────────
Total: 185ms
1 round trip
```

**Result: 51% faster (378ms → 185ms)**

### Testing GraphQL

**Unit Tests** - Use `@apollo/server/testing`:

```typescript
import { ApolloServer } from '@apollo/server';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

describe('Auth Subgraph', () => {
  let server: ApolloServer;

  beforeAll(() => {
    server = new ApolloServer({ typeDefs, resolvers });
  });

  it('should fetch user profile', async () => {
    const result = await server.executeOperation({
      query: 'query { user(id: "123") { id email name } }',
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.user).toMatchObject({
      id: '123',
      email: expect.any(String),
      name: expect.any(String),
    });
  });
});
```

**Integration Tests** - Test Gateway with Subgraphs:

```typescript
import { ApolloGateway } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';

describe('GraphQL Gateway Integration', () => {
  it('should federate query across subgraphs', async () => {
    const result = await gateway.executeOperation({
      query: `
        query {
          user(id: "123") {
            id
            name
            conversations { id title }
            analyticsData { totalTokensUsed }
          }
        }
      `,
    });

    expect(result.data?.user.conversations).toBeDefined();
    expect(result.data?.user.analyticsData).toBeDefined();
  });
});
```

**E2E Tests** - Use Playwright:

```typescript
import { test, expect } from '@playwright/test';

test('Admin dashboard loads GraphQL data', async ({ page }) => {
  await page.goto('/admin/dashboard');

  // Intercept GraphQL request
  await page.route('**/graphql', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        data: {
          systemStats: {
            totalUsers: 1250,
            activeUsersToday: 487,
          },
        },
      }),
    });
  });

  await expect(page.locator('[data-testid="total-users"]')).toHaveText('1,250');
  await expect(page.locator('[data-testid="active-users"]')).toHaveText('487');
});
```

---

# PART III: IMPLEMENTATION

> **Section Overview:** Hands-on implementation guide with prerequisites, week-by-week tasks, coordination mechanisms, and definition of done

## PREREQUISITES

> **Target Audience:** 🎯 DevOps, Backend & Frontend Developers
> **Purpose:** Ensure all team members have required tools, access, and knowledge before starting development

### Development Environment

**Required Software:**

| Tool | Minimum Version | Purpose | Installation |
|------|----------------|---------|--------------|
| Node.js | v20.x LTS | Runtime environment | [nodejs.org](https://nodejs.org/) |
| npm | 10.x | Package manager | Bundled with Node.js |
| Nx CLI | 17.0.0+ | Monorepo orchestration | `npm i -g nx` |
| Docker Desktop | 24.x | Containerization | [docker.com](https://www.docker.com/) |
| PostgreSQL | 16.x | Database | [postgresql.org](https://www.postgresql.org/) or Docker |
| Git | 2.40+ | Version control | [git-scm.com](https://git-scm.com/) |
| VS Code | Latest | IDE (recommended) | [code.visualstudio.com](https://code.visualstudio.com/) |

**Recommended VS Code Extensions:**
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript and JavaScript Language Features
- Nx Console (`nrwl.angular-console`)
- Prisma (`prisma.prisma`)
- GraphQL (`graphql.vscode-graphql`)
- Docker (`ms-azuretools.vscode-docker`)
- REST Client (`humao.rest-client`)

**Optional Tools:**
- Postman or Insomnia (API testing)
- pgAdmin or DBeaver (Database GUI)
- k6 (Load testing)
- kubectl (Kubernetes deployment)

### Cloud Services & Access

**Required Accounts:**

✅ **GitHub** - Repository access, CI/CD workflows
✅ **Docker Hub** - Container registry (or alternative: AWS ECR, Google GCR)
✅ **OpenAI** - API access for chatbot service ($5 minimum credit)

**Optional Accounts** (for enhanced features):
- AWS (EC2, RDS, S3, CloudFront) - Cloud deployment
- Google Cloud (OAuth, Cloud Run) - SSO integration
- Sentry - Error tracking
- Nx Cloud - Distributed task execution & remote caching

**Required Environment Variables Template:**

Create `.env.template` files in each service directory:

```bash
# Auth Service
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
PORT=3001
NODE_ENV=development

# Chatbot Service
DATABASE_URL=postgresql://user:password@localhost:5432/chatbot_db
OPENAI_API_KEY=sk-...your-key-here
PORT=3002
NODE_ENV=development

# Admin Service
DATABASE_URL=postgresql://user:password@localhost:5432/admin_db
AUTH_SERVICE_URL=http://localhost:3001
PORT=3003
NODE_ENV=development
```

### Team Knowledge Requirements

**Backend:** TypeScript, Node.js/Express, PostgreSQL, REST APIs, JWT, Docker, Git
**Frontend:** React 18+, TypeScript, React Router, Module Federation, Vite, Git
**Bonus:** GraphQL, Prisma, Nx, TanStack Query, Playwright

### Pre-Development Checklist

**Setup:**
- [ ] GitHub repo + communication channels (Slack/Discord)
- [ ] Project management board (Jira/Linear/GitHub Projects)
- [ ] Daily standup (9 AM, 15 min) + weekly review (Friday, 1 hour)
- [ ] All software installed (Node.js, Docker, PostgreSQL, Git, VS Code)
- [ ] Environment variables configured
- [ ] OpenAI API account with credits

**Knowledge:**
- [ ] Teams review Nx, Express/Prisma (backend), Module Federation (frontend) docs
- [ ] Architecture diagrams reviewed
- [ ] TypeScript refresher completed if needed

---

## WEEK-BY-WEEK IMPLEMENTATION

> **⚠️ IMPORTANT:** This section has been updated to align with the **Strategic Priority Roadmap** (Section: 🎯 STRATEGIC PRIORITY ROADMAP)
>
> **Implementation Order:**
> 1. **Week 1-2:** JWT Security Fix (CRITICAL) + Event Bus Foundation
> 2. **Week 3-6:** Hybrid Database (PostgreSQL + MongoDB) + Event Bus Phases 2-5
> 3. **Week 7-10:** Testing, Scaling, Cross-service Integration
> 4. **Week 11-12:** Production Deployment
>
> For complete details on prioritization, team allocation, and dependencies, see: **`IMPLEMENTATION_PRIORITY_ROADMAP.md`**

## WEEK 1: Foundation & Setup (JWT Security Fix + Event Bus Phase 1)

**Objective:** Fix critical JWT security vulnerability and establish event-driven MFE foundation

### Day 1-2: Nx Monorepo Initialization (BOTH TEAMS TOGETHER)

**Step 1: Install Nx Globally (Optional but Recommended)**

```bash
# Install Nx CLI globally
npm install -g nx

# Verify installation
nx --version  # Should be 17.0.0 or higher
````

**Step 2: Create Nx Workspace**

```bash
# Create empty Nx workspace
npx create-nx-workspace@latest my-app-nx-monorepo

# When prompted, choose:
# ✔ Which stack do you want to use? · none (empty workspace)
# ✔ Package-based monorepo, integrated monorepo, or standalone project? · integrated
# ✔ Enable distributed caching? · Yes
# ✔ Would you like remote caching (Nx Cloud)? · Skip for now (can enable later)

cd my-app-nx-monorepo
```

**Step 3: Install Core Dependencies**

```bash
# Install Node/TypeScript plugins
npm install -D @nx/node @nx/js

# Install React/Vite plugins for frontend
npm install -D @nx/react @nx/vite

# Install testing libraries
npm install -D @nx/jest @nx/cypress vitest

# Install shared dependencies
npm install -D typescript @types/node
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier
```

**Step 4: Configure Nx**

Update `nx.json`:

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "defaultBase": "main",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/.eslintrc.json",
      "!{projectRoot}/eslint.config.js"
    ],
    "sharedGlobals": []
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "cache": true
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"],
      "cache": true
    },
    "serve": {
      "cache": false
    }
  },
  "generators": {
    "@nx/react": {
      "application": {
        "babel": false,
        "bundler": "vite",
        "style": "css",
        "linter": "eslint"
      }
    },
    "@nx/node": {
      "application": {
        "linter": "eslint"
      }
    }
  }
}
```

**Step 5: Configure TypeScript**

Update `tsconfig.base.json`:

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@myapp/shared/types": ["libs/shared/types/src/index.ts"],
      "@myapp/backend/logger": ["libs/backend/logger/src/index.ts"],
      "@myapp/backend/metrics": ["libs/backend/metrics/src/index.ts"],
      "@myapp/backend/security": ["libs/backend/security/src/index.ts"],
      "@myapp/frontend/ui-components": [
        "libs/frontend/ui-components/src/index.ts"
      ],
      "@myapp/frontend/api-client": ["libs/frontend/api-client/src/index.ts"]
    }
  },
  "exclude": ["node_modules", "tmp"]
}
```

**Step 6: Configure ESLint**

Update `.eslintrc.json`:

```json
{
  "root": true,
  "ignorePatterns": ["**/*"],
  "plugins": ["@nx"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "enforceBuildableLibDependency": true,
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "type:backend",
                "onlyDependOnLibsWithTags": ["type:backend", "type:shared"]
              },
              {
                "sourceTag": "type:frontend",
                "onlyDependOnLibsWithTags": ["type:frontend", "type:shared"]
              }
            ]
          }
        ]
      }
    },
    {
      "files": ["*.ts", "*.tsx"],
      "extends": ["plugin:@nx/typescript"],
      "rules": {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { "argsIgnorePattern": "^_" }
        ],
        "@typescript-eslint/no-explicit-any": "warn"
      }
    }
  ]
}
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

**Step 7: Generate Project Structure with Nx**

```bash
# Create shared types library
nx generate @nx/js:library types \
  --directory=libs/shared/types \
  --importPath=@myapp/shared/types \
  --unitTestRunner=vitest \
  --tags=type:shared

# Create backend libraries
nx generate @nx/node:library logger \
  --directory=libs/backend/logger \
  --importPath=@myapp/backend/logger \
  --tags=type:backend

nx generate @nx/node:library metrics \
  --directory=libs/backend/metrics \
  --importPath=@myapp/backend/metrics \
  --tags=type:backend

nx generate @nx/node:library security \
  --directory=libs/backend/security \
  --importPath=@myapp/backend/security \
  --tags=type:backend

# Create frontend libraries
nx generate @nx/react:library ui-components \
  --directory=libs/frontend/ui-components \
  --importPath=@myapp/frontend/ui-components \
  --style=css \
  --bundler=vite \
  --unitTestRunner=vitest \
  --tags=type:frontend

nx generate @nx/js:library api-client \
  --directory=libs/frontend/api-client \
  --importPath=@myapp/frontend/api-client \
  --unitTestRunner=vitest \
  --tags=type:frontend

# Create backend applications (microservices)
nx generate @nx/node:application auth-service \
  --directory=apps/auth-service \
  --framework=express \
  --tags=type:backend,scope:auth

nx generate @nx/node:application chatbot-service \
  --directory=apps/chatbot-service \
  --framework=express \
  --tags=type:backend,scope:chatbot

nx generate @nx/node:application admin-service \
  --directory=apps/admin-service \
  --framework=express \
  --tags=type:backend,scope:admin

# Create frontend applications (micro-frontends)
nx generate @nx/react:application shell \
  --directory=apps/shell \
  --bundler=vite \
  --style=css \
  --e2eTestRunner=cypress \
  --tags=type:frontend,scope:shell

nx generate @nx/react:application auth-mfe \
  --directory=apps/auth-mfe \
  --bundler=vite \
  --style=css \
  --tags=type:frontend,scope:auth

nx generate @nx/react:application chatbot-mfe \
  --directory=apps/chatbot-mfe \
  --bundler=vite \
  --style=css \
  --tags=type:frontend,scope:chatbot

nx generate @nx/react:application admin-mfe \
  --directory=apps/admin-mfe \
  --bundler=vite \
  --style=css \
  --tags=type:frontend,scope:admin

nx generate @nx/react:application profile-mfe \
  --directory=apps/profile-mfe \
  --bundler=vite \
  --style=css \
  --tags=type:frontend,scope:profile
```

**Step 8: Verify Nx Setup**

```bash
# View dependency graph
nx graph

# List all projects
nx show projects

# Show project details
nx show project @myapp/shared-types --web

# Run build for all projects
nx run-many --target=build --all

# Run affected tests
nx affected --target=test
```

**Step 9: Update Root package.json Scripts**

```json
{
  "name": "my-app-nx-monorepo",
  "version": "1.0.0",
  "license": "MIT",
  "scripts": {
    "dev": "nx run-many --target=serve --all",
    "dev:backend": "nx run-many --target=serve --projects=tag:type:backend",
    "dev:frontend": "nx run-many --target=serve --projects=tag:type:frontend",
    "build": "nx run-many --target=build --all",
    "build:affected": "nx affected --target=build",
    "test": "nx run-many --target=test --all",
    "test:affected": "nx affected --target=test",
    "lint": "nx run-many --target=lint --all",
    "lint:affected": "nx affected --target=lint",
    "format": "nx format:write",
    "format:check": "nx format:check",
    "graph": "nx graph",
    "affected:graph": "nx affected:graph",
    "reset": "nx reset"
  }
}
```

**Step 10: Initialize Git**

```bash
# Git is already initialized by create-nx-workspace
git add .
git commit -m "chore: initialize Nx monorepo with all projects"
```

**Checklist:**

- [ ] Nx CLI installed and verified
- [ ] Nx workspace created
- [ ] Core plugins installed (@nx/node, @nx/react, @nx/vite)
- [ ] nx.json configured with caching strategies
- [ ] TypeScript paths configured in tsconfig.base.json
- [ ] ESLint configured with module boundary rules
- [ ] Prettier configured
- [ ] Shared libraries created (types, logger, metrics, security)
- [ ] Backend applications created (3 microservices)
- [ ] Frontend applications created (shell + 4 MFEs)
- [ ] Tags configured for dependency constraints
- [ ] Dependency graph verified (`nx graph`)
- [ ] Git initialized with proper .gitignore

**Team Sync:** 30-min standup to explore Nx features and dependency graph### Day 2 (Continued): Shared Types Library Setup (BOTH TEAMS)

**Step 11: Add Zod Dependency to Shared Types**

```bash
# Install Zod in the shared types library
npm install --save zod

# The library was already created in Step 7 with Nx generators
# Nx automatically configured the TypeScript paths and project.json
```

**Step 12: Create Initial Zod Schemas**

Create `libs/shared/types/src/schemas/user.schema.ts`:

```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']),
  avatar: z.string().url().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateUserSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain number')
      .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
    name: z.string().min(2).max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
```

Create `libs/shared/types/src/schemas/auth.schema.ts`:

```typescript
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['USER', 'ADMIN', 'MODERATOR']),
  }),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
```

Create `libs/shared/types/src/schemas/chat.schema.ts`:

```typescript
import { z } from 'zod';

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: z.enum(['USER', 'ASSISTANT', 'SYSTEM']),
  content: z.string().min(1).max(10000),
  createdAt: z.string().datetime(),
});

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  content: z.string().min(1).max(10000),
});

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().max(200),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
```

Create `libs/shared/types/src/index.ts`:

```typescript
// Export all schemas and types
export * from './schemas/user.schema';
export * from './schemas/auth.schema';
export * from './schemas/chat.schema';
```

**Step 13: Build Shared Types Library**

```bash
# Build shared-types library with Nx
nx build shared-types

# Or build all projects
nx run-many --target=build --all

# Verify the build output
ls -la dist/libs/shared/types/
```

**Step 14: Using Shared Types in Backend Services**

The auth-service was created in Step 7 with the Nx generator. To use shared types:

```typescript
// In apps/auth-service/src/routes/auth.ts
import { LoginSchema, type LoginInput } from '@myapp/shared/types';

// Nx automatically resolves the import path based on tsconfig.base.json
// The dependency is enforced by the module boundary rules in .eslintrc.json
```

Install additional dependencies for auth-service:

```bash
# Install dependencies for the auth service
npm install --save express zod @prisma/client bcryptjs jsonwebtoken
npm install --save-dev @types/express @types/bcryptjs @types/jsonwebtoken tsx
```

**Step 15: Using Shared Types in Frontend Applications**

The shell app was created in Step 7 with the Nx generator. To use shared types:

```typescript
// In apps/shell/src/components/LoginForm.tsx
import { LoginSchema, type LoginInput } from '@myapp/shared/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Nx automatically resolves the import path
// Module boundary rules ensure frontend apps can import from shared libs
```

Install additional dependencies for the shell:

```bash
# Install dependencies for frontend apps
npm install --save react-router-dom zustand @tanstack/react-query axios
npm install --save-dev @hookform/resolvers react-hook-form
```

**Step 16: Verify Nx Project Dependencies**

```bash
# View the dependency graph to see how projects depend on shared-types
nx graph

# Show dependencies for a specific project
nx show project auth-service --web

# Test that the types can be imported (using Node.js)
node --loader tsx --eval "import('@myapp/shared/types').then(m => console.log(m.UserSchema))"

# Or build all projects to verify everything compiles
nx run-many --target=build --all
```

**Checklist:**

- [ ] shared-types library created with Nx generator
- [ ] Initial Zod schemas created (user, auth, chat)
- [ ] Schemas built successfully with `nx build shared-types`
- [ ] Backend services can import from @myapp/shared/types
- [ ] Frontend apps can import from @myapp/shared/types
- [ ] Nx dependency graph shows correct relationships
- [ ] TypeScript path mappings working in both environments
- [ ] Module boundary rules enforced by ESLint

**Team Sync:** 15-min standup to verify everyone can import shared types

### Day 3-4: Docker Setup & Package Initialization (BACKEND TEAM)

**Backend: Docker Compose for Local Development**

Create `docker-compose.yml` in monorepo root:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: myapp-postgres
    environment:
      POSTGRES_USER: myapp
      POSTGRES_PASSWORD: myapp_dev_password
      POSTGRES_DB: myapp_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U myapp']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: myapp-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

```bash
# Start services
docker-compose up -d

# Verify services are running
docker-compose ps
```

**Backend: Initialize Auth Service with Prisma**

```bash
# Initialize Prisma in the auth-service app
cd apps/auth-service
npx prisma init
```

Create `apps/auth-service/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("USER")
  avatar    String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions  Session[]

  @@map("users")
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

Create `.env`:

```bash
DATABASE_URL="postgresql://myapp:myapp_dev_password@localhost:5432/myapp_dev"
```

```bash
# Run migrations
cd apps/auth-service
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

**Checklist (Backend):**

- [ ] Docker Compose configured
- [ ] PostgreSQL running and accessible
- [ ] Redis running and accessible
- [ ] Prisma initialized in auth-service
- [ ] Initial User and Session models created
- [ ] Database migrations run successfully
- [ ] Prisma Client generated

### Day 3-4: Shell App & Vite Setup (FRONTEND TEAM)

**Frontend: Configure Shell Application**

The shell app was already created with Nx in Step 7. Now configure it:

```bash
# Install additional dependencies for Module Federation
npm install --save-dev @originjs/vite-plugin-federation
npm install --save-dev tailwindcss postcss autoprefixer

# Initialize Tailwind
cd apps/shell
npx tailwindcss init -p
```

Update `apps/shell/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        authMfe: 'http://localhost:5174/assets/remoteEntry.js',
        chatbotMfe: 'http://localhost:5175/assets/remoteEntry.js',
        adminMfe: 'http://localhost:5176/assets/remoteEntry.js',
        profileMfe: 'http://localhost:5177/assets/remoteEntry.js',
      },
      shared: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        '@tanstack/react-query',
        'zod',
      ],
    }),
  ],
  server: {
    port: 5173,
  },
  build: {
    target: 'esnext',
  },
});
```

Create `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
    },
  },
  plugins: [],
};
```

Create basic structure:

```bash
cd apps/shell
mkdir -p src/{components,pages,stores,lib}
```

Update `apps/shell/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

Create `apps/shell/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Checklist (Frontend):**

- [ ] Vite configured with React plugin
- [ ] Module Federation plugin configured
- [ ] Tailwind CSS initialized
- [ ] Basic shell structure created
- [ ] React Router setup
- [ ] TanStack Query provider setup
- [ ] Dev server starts successfully

**Team Sync:** End of Day 4 - 30-min integration review

### Day 5-7: Backend Package Initialization

- POST `/auth/login` (validated with LoginSchema)
- POST `/auth/refresh` (validated with RefreshTokenSchema)
- GET `/auth/me` (returns UserResponse)
- [ ] Implement JWT generation and verification
- [ ] Create RBAC middleware (check user roles)
- [ ] Write unit tests (>80% coverage target)
- [ ] Set up Testcontainers for integration tests
- [ ] Deploy to local Docker environment

**Frontend Team:**

- [ ] Build shared UI component library:
  - Button (Primary, Secondary, Outline, Ghost)
  - Input (Text, Password, Email)
  - Card, Modal, Toast
  - Form Field wrapper with error display
- [ ] Implement design system tokens in Tailwind config:
  ```javascript
  colors: {
    primary: { /* Indigo 50-950 */ },
    secondary: { /* Purple */ },
    // ... all design tokens
  }
  ```
- [ ] Create shared hooks:
  - `useAuth()` - Access auth store
  - `useDebounce()` - Debounce inputs
  - `useToast()` - Show notifications
- [ ] Start Auth MFE scaffolding:
  - Module Federation config
  - Route structure (`/auth/login`, `/auth/register`)
  - Basic layout

**SHARED TASK:**

- [ ] Backend: Publish API documentation (Swagger UI)
- [ ] Frontend: Configure MSW handlers based on real endpoints
- [ ] Review authentication flow end-to-end
- [ ] Document any schema changes needed

**End of Week 1 Deliverables:**

Monorepo structure for both teams  
Shared Zod schemas package  
Auth Service with core endpoints  
Shell application with routing  
Shared component library  
API mocking setup (MSW)  
CI/CD pipeline basics (lint, test, build)

**Week 1 Success Criteria:**

- Both teams can run projects locally
- Shared schemas published to npm/local registry
- Auth endpoints functional and documented
- Frontend can mock all backend APIs

---

## WEEK 2: Core Services & MFEs

**Objective:** Implement Auth + Chatbot services (Backend) and Auth + Profile MFEs (Frontend)

### Day 8-10: Auth & Chatbot Services / Auth MFE

**Backend Team:**

- [ ] **Complete Auth Service:**
  - POST `/auth/logout` (token blacklisting in Redis)
  - POST `/auth/forgot-password` (email with reset token)
  - POST `/auth/reset-password/:token`
  - Rate limiting on auth endpoints (5 attempts/15min)
  - Password hashing with bcryptjs (12 rounds)
  - Session management in Redis
  - Integration tests for all flows

- [ ] **Start Chatbot Service:**
  - Prisma schema (Conversation, Message models)
  - POST `/chat/conversations` (create new conversation)
  - GET `/chat/conversations` (list user's conversations)
  - GET `/chat/conversations/:id` (get single conversation)
  - POST `/chat/conversations/:id/messages` (send message)
  - OpenAI API integration setup
  - Basic streaming response (SSE)

**Frontend Team:**

- [ ] **Complete Auth MFE:**
  - **Login Page:**
    - Form with email + password validation (Zod)
    - React Hook Form + zodResolver
    - Submit mutation (TanStack Query)
    - Error handling (show field errors)
    - "Remember me" checkbox
    - Redirect to home on success
  - **Register Page:**
    - Form with validation (email, password, confirm password, name)
    - Password strength indicator
    - Submit mutation
    - Success message + redirect to login
  - **Forgot Password Page:**
    - Email input form
    - Success message
  - **Integration with Shell:**
    - Exposed via Module Federation
    - Routes: `/auth/login`, `/auth/register`, `/auth/forgot-password`
  - **Tests:**
    - Unit tests for all components
    - Integration tests for forms

- [ ] **Start Profile MFE:**
  - Module Federation setup
  - Basic layout and routing
  - Profile view page (read-only display)

**SHARED TASK:**

- [ ] Align on Chatbot API contract
- [ ] Update shared schemas if needed:
  ```typescript
  // Add to chat.schema.ts
  ConversationListSchema;
  CreateConversationSchema;
  MessageResponseSchema;
  ```
- [ ] Backend: Update Swagger docs
- [ ] Frontend: Update MSW handlers

**Daily Sync:** 15-min standup + weekly 30-min integration review (Day 10)

### Day 11-14: Chatbot Service Complete / Profile MFE Complete

**Backend Team:**

- [ ] **Complete Chatbot Service:**
  - PATCH `/chat/conversations/:id` (update title)
  - DELETE `/chat/conversations/:id` (soft delete)
  - GET `/chat/conversations/:id/messages` (paginated)
  - DELETE `/chat/messages/:id` (delete message)
  - Implement streaming response handling:
    - Server-Sent Events (SSE) for real-time
    - OpenAI streaming integration
    - Error handling in streams
  - Context window management (token counting)
  - Rate limiting (10 messages/minute per user)
  - Token usage tracking per user
  - BullMQ queue for async AI processing
  - Comprehensive tests (unit + integration)

- [ ] **Start Inter-Service Communication:**
  - BullMQ event bus setup
  - Publish events: `user.created`, `conversation.created`
  - HTTP client for service-to-service calls

**Frontend Team:**

- [ ] **Complete Profile MFE:**
  - **Profile Page:**
    - Display user info (name, email, avatar, role)
    - Fetch user data with TanStack Query
    - Loading and error states
  - **Edit Profile Page:**
    - Form with validation (UpdateUserSchema)
    - Avatar upload (with preview)
    - Submit mutation with optimistic update
    - Success toast notification
  - **Settings Page:**
    - Theme toggle (Light/Dark mode)
    - Notification preferences
    - Language selection (if applicable)
  - **Security Page:**
    - Change password form
    - 2FA setup (future)
    - Active sessions list
  - **Integration:**
    - Exposed via Module Federation
    - Routes: `/me/profile`, `/me/edit`, `/me/settings`, `/me/security`
    - Connected to AuthStore
  - **Tests:**
    - Unit tests for all components
    - Integration tests for mutations

- [ ] **Shell Enhancements:**
  - Navigation menu with all MFE links
  - User dropdown menu (profile, settings, logout)
  - Protected route guard (redirect to login if not authenticated)
  - Role-based route guard (hide admin links for non-admins)

**SHARED TASK:**

- [ ] Integration testing between Auth Service + Auth MFE
- [ ] Test token refresh flow
- [ ] Test error handling (401, 403, 500)
- [ ] Update documentation with new endpoints

**End of Week 2 Deliverables:**

Auth Service complete with all endpoints  
Chatbot Service with streaming AI responses  
Auth MFE production-ready  
Profile MFE production-ready  
Both integrated with Shell  
MSW handlers match real APIs

**Week 2 Success Criteria:**

- Frontend can authenticate using real backend APIs
- User can register, login, logout, reset password
- User can view and edit profile
- Chat service ready for frontend integration
- Test coverage >70% both teams

---

## WEEK 3: Admin Service, GraphQL Gateway & Advanced MFEs

**Objective:** Implement Admin service, GraphQL Gateway (Backend) and Chatbot + Admin MFEs with GraphQL (Frontend)

### Day 15-16: GraphQL Gateway Setup (BOTH TEAMS)

**Backend Team:**

- [ ] **Create GraphQL Gateway Application:**
  - Generate Nx app: `nx generate @nx/node:application graphql-gateway`
  - Install Apollo Federation dependencies
  - Configure Apollo Gateway with subgraph discovery
  - Set up Express server on port 4000
  - Add health check endpoint
  - Configure CORS for frontend access
  - Add to Docker Compose

- [ ] **Implement Auth Service Subgraph:**
  - Install @apollo/subgraph in auth-service
  - Create GraphQL schema with User type (federated entity)
  - Implement resolvers for:
    - `Query.me` - current user
    - `Query.user(id)` - single user
    - `Query.users` - paginated list
    - `Mutation.updateProfile`
  - Add `/graphql` endpoint to Express app
  - Add JWT authentication context
  - Test subgraph independently

- [ ] **Implement Chatbot Service Subgraph:**
  - Install @apollo/subgraph in chatbot-service
  - Create schema extending User type:
    - `User.conversations`
    - `User.messageCount`
    - `Query.conversation(id)`
    - `Query.conversations(userId)`
    - `Query.conversationStats(userId)`
  - Implement MongoDB resolvers
  - Test subgraph with federation

**Frontend Team:**

- [ ] **Apollo Client Setup:**
  - Create `@myapp/frontend/graphql-client` library
  - Install @apollo/client and graphql
  - Configure Apollo Client with:
    - HTTP link to Gateway (port 4000)
    - Auth link (JWT from localStorage)
    - InMemoryCache with type policies
  - Add ApolloProvider to Shell app
  - Create example queries in library

- [ ] **GraphQL Query/Mutation Hooks:**
  - Create `useUserProfile()` hook
  - Create `useConversations()` hook
  - Create `useConversationStats()` hook
  - Add TypeScript types generated from schema
  - Test hooks with MSW GraphQL handlers

**SHARED TASK:**

- [ ] Test federated queries across subgraphs
- [ ] Verify authentication flows work with Gateway
- [ ] Compare performance: REST (7 calls) vs GraphQL (1 call)
- [ ] Document GraphQL schema and example queries

### Day 17-18: Admin Service Basics / Chatbot MFE

**Backend Team:**

- [ ] **Admin Service - User Management:**
  - Prisma schema (AuditLog, Analytics)
  - GET `/admin/users` (paginated, filterable, sortable)
  - GET `/admin/users/:id` (single user details)
  - PATCH `/admin/users/:id` (update user - name, role, status)
  - DELETE `/admin/users/:id` (soft delete user)
  - POST `/admin/users/:id/reset-password` (admin reset)
  - Validate admin role for all endpoints
  - Audit logging for all actions
  - Integration tests

- [ ] **Service Integration:**
  - Event consumers in Admin service:
    - Listen to `user.created` → create audit log
    - Listen to `conversation.created` → update analytics
  - Circuit breaker for service calls
  - Retry logic with exponential backoff

**Frontend Team:**

- [ ] **Complete Chatbot MFE:**
  - **Chat Interface:**
    - Message list with virtualization (react-virtual)
    - Message bubbles (User vs AI styling)
    - Markdown rendering for AI responses
    - Code syntax highlighting
    - Loading indicator (typing animation)
  - **Message Input:**
    - Textarea with auto-resize
    - Character counter (max 10,000)
    - Send button with loading state
    - Enter to send (Shift+Enter for new line)
  - **Conversation Sidebar:**
    - List of conversations with title + preview
    - Create new conversation button
    - Delete conversation (with confirmation)
    - Rename conversation
    - Search/filter conversations
  - **Streaming Implementation:**
    - EventSource (SSE) for streaming messages
    - Append chunks to message in real-time
    - Error handling (reconnection logic)
    - Cancellation support
  - **State Management:**
    - Event Bus subscriptions (auth events, theme changes)
    - ChatStore (Zustand) for active conversation state (local to MFE)
    - TanStack Query for conversation list + history
    - Optimistic updates for sent messages
    - Publish conversation events for other MFEs if needed
  - **Integration:**
    - Module Federation exposed
    - Routes: `/chat`, `/chat/:conversationId`
  - **Tests:**
    - Unit tests for components
    - Integration tests for streaming

- [ ] **Shell Updates:**
  - Add Chatbot link to navigation
  - Integrate Chatbot MFE

**SHARED TASK:**

- [ ] Align on Admin API contract
- [ ] Update admin.schema.ts:
  ```typescript
  UserListSchema (with pagination)
  UserDetailSchema
  UpdateUserByAdminSchema
  AuditLogSchema
  AnalyticsSchema
  ```
- [ ] Backend: Update Swagger
- [ ] Frontend: Update MSW handlers

**Daily Sync:** 15-min standup

### Day 18-21: Admin Service Complete / Admin MFE Complete

**Backend Team:**

- [ ] **Admin Service - Analytics & Audit:**
  - Prisma schema (AuditLog, Analytics tables)
  - GET `/admin/analytics/overview` (user count, conversations, messages)
  - GET `/admin/analytics/users` (user growth over time)
  - GET `/admin/analytics/conversations` (conversation stats)
  - GET `/admin/audit-logs` (paginated, filterable)
  - POST `/admin/export/users` (CSV export)
  - POST `/admin/export/conversations` (JSON export)
  - POST `/admin/export/audit-logs` (CSV export)
  - Aggregation queries optimization
  - Caching strategy for analytics (Redis)
  - Background jobs for exports (BullMQ)

- [ ] **Admin Service GraphQL Subgraph:**
  - Create schema extending User type:
    - `User.analyticsData` (total conversations, messages, tokens)
    - `Query.systemStats` (dashboard overview)
    - `Query.userAnalytics(userId)` (individual analytics)
    - `Query.auditLogs` (paginated logs)
  - Implement resolvers with PostgreSQL aggregations
  - Add admin permission checks
  - Test federated queries combining all 3 subgraphs
  - Comprehensive tests

- [ ] **All Services Integration:**
  - End-to-end service communication tests
  - Event flow validation
  - GraphQL Gateway load testing (k6 with GraphQL)
  - Database query optimization
  - Performance comparison: REST vs GraphQL

**Frontend Team:**

- [ ] **Complete Admin MFE:**
  - **User Management Table:**
    - Paginated table with users
    - Columns: Name, Email, Role, Status, Created, Actions
    - Sorting (client-side or server-side)
    - Filtering by role, status, search
    - Actions: View, Edit, Delete, Reset Password
    - Bulk actions (select multiple users)
  - **User Detail Modal:**
    - View user full details (GraphQL query for nested data)
    - Combines user info + chat stats + analytics in 1 query
    - Edit form (name, role, status)
    - Activity history
    - Submit mutation with optimistic update
  - **Analytics Dashboard (GraphQL-powered):**
    - Single federated query for entire dashboard:
      ```graphql
      query AdminDashboard {
        systemStats {
          totalUsers
          activeUsersToday
          totalConversations
        }
        allUserAnalytics(limit: 10) {
          userId
          totalMessages
          isPremium
        }
        auditLogs(limit: 20) {
          id
          action
          timestamp
        }
      }
      ```
    - Overview cards (Total Users, Conversations, Messages)
    - Charts with Recharts:
      - User growth line chart
      - Conversation activity bar chart
      - Message volume area chart
    - Date range picker
    - Real-time polling (30s intervals)
    - Loading skeletons
    - **Performance: 50% faster than REST** (1 request vs 7)
  - **Audit Logs Table:**
    - Paginated table via GraphQL
    - Columns: Timestamp, User, Action, Resource, Details
    - Filtering by user, action, date range
    - Search functionality
  - **Export Functionality:**
    - Export buttons for each section (still uses REST for file downloads)
    - Show progress indicator
    - Download file on completion
  - **Role Guard:**
    - Entire Admin MFE protected by ADMIN role
    - Show 403 error for non-admin users
  - **Integration:**
    - Module Federation exposed
    - Routes: `/admin/users`, `/admin/analytics`, `/admin/audit-logs`
    - Uses Apollo Client for GraphQL queries
    - Falls back to REST for file operations
  - **Tests:**
    - Unit tests for all components
    - GraphQL query tests with MockedProvider
    - Integration tests for federated queries

- [ ] **All MFEs Polishing:**
  - Consistent error handling across all MFEs
  - Toast notifications for all actions
  - Loading states consistency
  - Responsive design validation

**SHARED TASK:**

- [ ] Full integration testing (all services + all MFEs)
- [ ] Test admin workflows end-to-end
- [ ] Performance testing
- [ ] Security review

**End of Week 3 Deliverables:**

Admin Service complete  
All backend services integrated  
Chatbot MFE with streaming  
Admin MFE with analytics  
All 5 MFEs integrated with Shell  
Event-driven architecture working

**Week 3 Success Criteria:**

- Full application functional (all features)
- Cross-service communication validated
- Real-time chat streaming working
- Admin analytics displaying correctly
- Test coverage >75% both teams

---

## WEEK 4: Testing, Integration & Optimization

**Objective:** Comprehensive testing, performance optimization, observability

### Day 22-24: Observability & Integration Testing

**Backend Team:**

- [ ] **Observability Implementation:**
  - CloudWatch Logs integration (structured logging)
  - Prometheus metrics collection:
    - HTTP request duration histogram
    - Active connections gauge
    - Error rate counter
    - Database query duration
    - AI token usage
  - X-Ray distributed tracing setup
  - Custom business metrics (users created, messages sent)
  - Grafana dashboards:
    - Service health dashboard
    - Business metrics dashboard
    - Error tracking dashboard
  - Alert rules (PagerDuty/Slack):
    - Error rate > 1%
    - P95 latency > 500ms
    - Database connection pool exhaustion
    - Redis connection failures

- [ ] **Integration Testing:**
  - End-to-end service tests
  - Event flow validation tests
  - Database transaction tests
  - Cache invalidation tests
  - Concurrency tests
  - **GraphQL Gateway Testing:**
    - Federated query tests (combining all 3 subgraphs)
    - Authentication context passing
    - Error handling across subgraphs
    - Schema composition validation

**Frontend Team:**

- [ ] **E2E Testing with Playwright:**
  - **Auth Flow:**
    - User registration → Login → Dashboard
    - Logout → Login again
    - Forgot password flow
  - **Chat Flow:**
    - Create conversation → Send messages → View streaming
    - Navigate between conversations
    - Delete conversation
  - **Profile Flow:**
    - View profile → Edit profile → Save → Verify
  - **Admin Flow (if ADMIN role):**
    - View users → Filter/sort → Edit user
    - View analytics → Verify data (GraphQL dashboard)
    - Export data

- [ ] **GraphQL Testing:**
  - Apollo Client MockedProvider tests
  - Test federated queries in components
  - Test optimistic updates
  - Test cache invalidation
  - Test error handling (network errors, GraphQL errors)

- [ ] **Integration Testing:**
  - Cross-MFE navigation
  - State synchronization (AuthStore across MFEs)
  - Error boundary testing
  - Module Federation fallback scenarios
  - Token refresh during active session
  - GraphQL + REST hybrid calls

- [ ] **Accessibility Testing:**
  - Run axe-core on all pages
  - Keyboard navigation testing
  - Screen reader testing (NVDA/JAWS)
  - Color contrast validation
  - Focus indicator visibility

**SHARED TASK:**

- [ ] Integration testing between frontend and backend
- [ ] Test real API calls (no mocking)
- [ ] Verify all error scenarios
- [ ] Load testing preparation

**Daily Sync:** 15-min standup + 30-min integration review (Day 24)

### Day 25-26: Performance Optimization

**Backend Team:**

- [ ] **Database Optimization:**
  - Add missing indexes (analyze slow query log)
  - Optimize N+1 queries (use Prisma includes)
  - Implement database connection pooling tuning
  - Add read replicas for analytics queries (if needed)

- [ ] **Caching Strategy:**
  - Redis caching for user sessions (15 min TTL)
  - Cache analytics data (5 min TTL)
  - Cache conversation lists (1 min TTL)
  - Implement cache warming for popular data

- [ ] **API Optimization:**
  - Response compression (gzip)
  - Request batching support
  - Pagination optimization
  - Rate limiting tuning
  - **GraphQL Query Optimization:**
    - Implement DataLoader for N+1 prevention
    - Query complexity analysis
    - Query depth limiting
    - Persisted queries for production

- [ ] **Load Testing:**
  - k6 scripts for all critical REST endpoints
  - k6 scripts for GraphQL Gateway
  - Test federated query performance
  - Measure REST vs GraphQL latency
  - Test scenarios:
    - 100 concurrent users (sustained load)
    - 500 concurrent users (peak load)
    - Gradual ramp-up test
    - Spike test
  - Identify bottlenecks
  - Optimize based on results

**Frontend Team:**

- [ ] **Bundle Optimization:**
  - Analyze bundle sizes (vite-bundle-visualizer)
  - Implement code splitting for large libraries
  - Lazy load MFEs (already done via Module Federation)
  - Optimize images (WebP, srcset)
  - Remove unused dependencies

- [ ] **Runtime Optimization:**
  - React.memo for expensive components
  - useMemo for expensive calculations
  - useCallback for stable functions
  - Virtualize long lists (react-virtual)
  - Debounce search inputs
  - Optimize re-renders (check with React DevTools Profiler)

- [ ] **Network Optimization:**
  - TanStack Query cache tuning (staleTime, cacheTime)
  - Prefetch data on hover (predictive prefetching)
  - Request cancellation on unmount
  - Parallel requests for independent data
  - Image lazy loading

- [ ] **Lighthouse Audits:**
  - Run Lighthouse on all pages
  - Fix performance issues (target score >90)
  - Fix accessibility issues (target score >95)
  - Fix SEO issues
  - Fix best practices issues

**SHARED TASK:**

- [ ] End-to-end performance testing
- [ ] Measure actual API latencies from frontend
- [ ] Validate Core Web Vitals (LCP, FID, CLS)

### Day 27-28: Security & Documentation

**Backend Team:**

- [ ] **Security Testing:**
  - OWASP ZAP automated scan
  - SQL injection testing
  - XSS testing
  - CSRF validation
  - JWT security review
  - Secrets rotation testing
  - Rate limiting validation

- [ ] **Security Hardening:**
  - Enable CORS with whitelist
  - Add security headers (Helmet.js)
  - Input sanitization review
  - Dependency vulnerability scan (Snyk)
  - Container image scanning (Trivy)

- [ ] **Documentation:**
  - OpenAPI/Swagger spec finalization
  - Architecture decision records (ADRs)
  - Deployment runbooks
  - Troubleshooting guides
  - API usage examples
  - Security documentation

**Frontend Team:**

- [ ] **Security Testing:**
  - XSS vulnerability testing
  - CSRF token validation
  - Secure storage validation (no sensitive data in localStorage)
  - Dependency vulnerability scan (npm audit)

- [ ] **Error Monitoring Setup:**
  - Integrate Sentry for error tracking
  - Add custom error boundaries with Sentry reporting
  - Add breadcrumbs for debugging context
  - Test error reporting

- [ ] **Analytics Setup:**
  - Google Analytics integration (if required)
  - Custom event tracking (button clicks, page views)
  - User journey tracking
  - Performance monitoring (RUM)

- [ ] **Documentation:**
  - Component library documentation (Storybook - optional)
  - State management guide
  - Routing guide
  - Testing guide
  - Deployment guide
  - Contributing guidelines

**SHARED TASK:**

- [ ] Security review meeting
- [ ] Documentation review
- [ ] Prepare for Week 5 deployment

**End of Week 4 Deliverables:**

Comprehensive observability (logs, metrics, traces)  
Full E2E test suite  
Performance optimized (backend + frontend)  
Security hardened  
Complete documentation  
Production-ready codebase

**Week 4 Success Criteria:**

- Test coverage >80% both teams
- Lighthouse score >90
- Security scan with zero critical issues
- Load testing validates performance targets
- All documentation complete

---

## WEEK 5: Deployment & Launch

**Objective:** Deploy to staging and production with zero downtime

### Day 29-30: Infrastructure & CI/CD

**Backend Team:**

- [ ] **AWS Infrastructure (Terraform):**
  - VPC, subnets, security groups
  - RDS PostgreSQL (Multi-AZ) - 3 databases
  - ElastiCache Redis (Cluster Mode)
  - ECS Cluster (Fargate)
  - Application Load Balancer + Target Groups
  - CloudWatch Log Groups
  - Secrets Manager for credentials
  - S3 buckets for backups
  - IAM roles and policies
  - Auto-scaling policies

- [ ] **CI/CD Pipeline (GitHub Actions):**
  - Workflow: `backend-deploy.yml`
  - Stages:
    1. Lint + Format check
    2. Type check (TypeScript)
    3. Unit tests
    4. Integration tests
    5. Security scan (Snyk, Trivy)
    6. Build Docker images
    7. Push to ECR
    8. Deploy to staging (auto)
    9. Smoke tests on staging
    10. Deploy to production (manual approval)
  - Rollback automation
  - Slack notifications

- [ ] **Database Migrations:**
  - Run migrations on staging
  - Test rollback procedure
  - Prepare production migration plan

**Frontend Team:**

- [ ] **Frontend Infrastructure:**
  - S3 buckets (staging, production)
  - CloudFront distributions
  - SSL certificates (ACM)
  - Route 53 DNS configuration
  - WAF rules

- [ ] **CI/CD Pipeline (GitHub Actions):**
  - Workflow: `frontend-deploy.yml`
  - Stages:
    1. Lint + Format check
    2. Type check (TypeScript)
    3. Unit tests
    4. Build all MFEs (staging env vars)
    5. Upload to S3 staging
    6. Invalidate CloudFront cache
    7. Smoke tests on staging
    8. Build all MFEs (production env vars)
    9. Deploy to production (manual approval)
  - Rollback automation (revert S3 objects)
  - Slack notifications

- [ ] **Environment Configuration:**
  - Staging environment variables
  - Production environment variables
  - Feature flags setup (if using)

**SHARED TASK:**

- [ ] Coordinate deployment schedules
- [ ] Prepare rollback procedures
- [ ] Set up monitoring dashboards

**Daily Sync:** 15-min standup + 1-hour deployment planning (Day 30)

### Day 31-33: Staging Deployment & Validation

**Backend Team:**

- [ ] Deploy all services to staging ECS
- [ ] Run database migrations
- [ ] Verify all health checks passing
- [ ] Smoke test all endpoints
- [ ] Check CloudWatch logs for errors
- [ ] Validate X-Ray traces
- [ ] Run load tests on staging
- [ ] Security scan on staging
- [ ] Fix any issues found

**Frontend Team:**

- [ ] Deploy all MFEs to staging S3 + CloudFront
- [ ] Verify Module Federation working
- [ ] Smoke test all pages
- [ ] Run E2E tests against staging backend
- [ ] Verify error tracking (Sentry) working
- [ ] Validate analytics tracking
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing
- [ ] Fix any issues found

**SHARED TASK:**

- [ ] Full integration testing on staging
- [ ] User acceptance testing (UAT)
- [ ] Performance validation
- [ ] Security validation
- [ ] Load testing with realistic traffic
- [ ] Document any issues and fixes
- [ ] Sign-off for production deployment

**Daily Sync:** 15-min standup + 1-hour UAT review (Day 33)

### Day 34-35: Production Deployment & Launch

**Backend Team:**

- [ ] **Production Deployment (Blue-Green):**
  - Deploy new version to "green" environment
  - Run smoke tests on green (0% traffic)
  - Shift 10% traffic to green → monitor for 15 min
  - Shift 25% traffic → monitor for 15 min
  - Shift 50% traffic → monitor for 15 min
  - Shift 100% traffic → monitor for 30 min
  - Mark "blue" as previous (for rollback)

- [ ] **Post-Deployment Validation:**
  - Verify all health checks passing
  - Check error rates (<0.1%)
  - Check P95 latency (<200ms)
  - Verify database connections healthy
  - Verify Redis connections healthy
  - Monitor CloudWatch dashboards
  - Monitor X-Ray traces
  - Check alert rules functioning

- [ ] **Monitoring (24-hour intensive):**
  - On-call rotation active
  - Monitor all metrics continuously
  - Respond to alerts immediately
  - Document any incidents

**Frontend Team:**

- [ ] **Production Deployment:**
  - Build all MFEs with production env vars
  - Upload to S3 production bucket
  - Invalidate CloudFront cache
  - Verify DNS resolving correctly
  - Test HTTPS working
  - Smoke test all pages

- [ ] **Post-Deployment Validation:**
  - Verify Module Federation working
  - Check all MFEs loading correctly
  - Verify authentication flow
  - Test all critical user journeys
  - Check Sentry for errors (should be minimal)
  - Verify analytics tracking
  - Check Lighthouse scores

- [ ] **Monitoring (24-hour intensive):**
  - Monitor Sentry for errors
  - Monitor analytics for user behavior
  - Monitor CloudFront metrics
  - Monitor Core Web Vitals (RUM)
  - Respond to issues immediately

**SHARED TASK:**

- [ ] Joint monitoring war room (Slack channel)
- [ ] Communication plan execution:
  - Internal announcement
  - Customer communication (if applicable)
  - Status page updates
- [ ] Incident response readiness
- [ ] Celebrate launch! 🎉

**Daily Sync:** Continuous communication during deployment

### Post-Launch (Ongoing)

**Backend Team:**

- [ ] Day 36-40: Intensive monitoring
- [ ] Weekly performance reviews
- [ ] Monthly security audits
- [ ] Continuous optimization

**Frontend Team:**

- [ ] Day 36-40: Intensive monitoring
- [ ] Weekly Lighthouse audits
- [ ] Monthly dependency updates
- [ ] User feedback incorporation

**SHARED TASK:**

- [ ] Post-launch retrospective (Day 40)
- [ ] Document lessons learned
- [ ] Update roadmap for Phase 2 features
- [ ] Celebrate success with team! 🚀

**End of Week 5 Deliverables:**

Staging environment fully functional  
Production deployment successful  
Zero-downtime deployment validated  
Monitoring and alerting active  
Team trained on operations  
Post-launch report

**Week 5 Success Criteria:**

- Production uptime >99.9%
- Error rate <0.1%
- P95 latency <200ms (backend)
- Lighthouse score >90 (frontend)
- Zero critical incidents
- Successful rollback tested (in staging)

---

## COORDINATION MECHANISMS

### Daily Standups (Both Teams Together)

**Time:** 9:00 AM daily (15 minutes)

**Format:**

1. Backend team updates (5 min)
2. Frontend team updates (5 min)
3. Blockers and dependencies (5 min)

**Key Questions:**

- What did you complete yesterday?
- What are you working on today?
- Any blockers or dependencies on the other team?
- Any schema changes needed?

### Weekly Integration Reviews

**Time:** Friday 2:00 PM (1 hour)

**Agenda:**

1. Demo completed features (both teams)
2. Integration testing results
3. Schema changes review
4. Next week planning
5. Risk assessment

### Shared Communication Channels

**Slack Channels:**

- `#fullstack-dev` - General development discussion
- `#api-contracts` - Schema and API contract discussions
- `#blockers` - Urgent blockers requiring immediate attention
- `#deployments` - Deployment coordination and monitoring

**Documentation:**

- Shared Notion/Confluence workspace
- OpenAPI/Swagger live documentation
- Architecture decision records (ADRs)
- Weekly progress reports

### API Contract Management

**Process:**

1. Backend team proposes new endpoint in OpenAPI spec
2. Frontend team reviews and approves/requests changes
3. Schema added to `@myapp/shared-types` package
4. Backend implements endpoint
5. Frontend updates MSW mock
6. Integration tested
7. Merged to main

**Contract-First Rules:**

- No breaking changes without version bump
- Backward compatibility maintained
- Deprecation notices given 2 weeks in advance
- All changes documented in changelog

---

## SUCCESS METRICS

### Backend Metrics

**Performance:**

- P50 latency: <100ms
- P95 latency: <200ms
- P99 latency: <500ms
- Throughput: >1000 req/sec per service
- Database query time: <50ms (P95)

**Reliability:**

- Uptime: >99.9%
- Error rate: <0.1%
- MTTR: <15 minutes

**Quality:**

- Test coverage: >80%
- Code quality: Grade A (SonarQube)
- Security: Zero critical vulnerabilities

### Frontend Metrics

**Performance:**

- Lighthouse score: >90
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1

**Quality:**

- Test coverage: >80%
- Accessibility score: >95
- TypeScript errors: 0
- ESLint warnings: <10

**User Experience:**

- Error rate: <0.5%
- Session duration: >5 minutes (average)
- Bounce rate: <30%

### Integration Metrics

**Development Velocity:**

- Story completion rate: >90%
- Sprint velocity: stable ±10%
- Pull request cycle time: <24 hours
- Deployment frequency: >2 per week

**Collaboration:**

- Schema change cycle time: <4 hours
- Blocker resolution time: <2 hours
- Code review time: <4 hours

---

## RISK MITIGATION

### Technical Risks

| Risk                          | Impact | Probability | Mitigation                                                   |
| ----------------------------- | ------ | ----------- | ------------------------------------------------------------ |
| Schema mismatch between FE/BE | High   | Medium      | Contract-first development, shared Zod schemas, daily syncs  |
| Backend delays block frontend | High   | Medium      | MSW mocking, parallel work on independent features           |
| Breaking API changes          | High   | Low         | API versioning, backward compatibility, deprecation notices  |
| Performance bottlenecks       | Medium | Medium      | Early load testing, performance budgets, monitoring          |
| Security vulnerabilities      | High   | Low         | Regular scans, security reviews, penetration testing         |
| Infrastructure issues         | High   | Low         | IaC with Terraform, staging environment, rollback procedures |
| Module Federation bugs        | Medium | Medium      | Thorough testing, fallback handling, version pinning         |

### Process Risks

| Risk                    | Impact | Probability | Mitigation                                                |
| ----------------------- | ------ | ----------- | --------------------------------------------------------- |
| Poor team communication | High   | Medium      | Daily standups, shared Slack channels, weekly reviews     |
| Scope creep             | Medium | High        | Strict sprint planning, change request process            |
| Dependency conflicts    | Medium | Medium      | Lock files, monorepo, shared dependency versions          |
| Testing gaps            | High   | Medium      | TDD practices, code review focus on tests, coverage gates |
| Documentation debt      | Medium | High        | Documentation in definition of done, weekly reviews       |

### Deployment Risks

| Risk                             | Impact   | Probability | Mitigation                                                  |
| -------------------------------- | -------- | ----------- | ----------------------------------------------------------- |
| Database migration failure       | Critical | Low         | Dry-run on staging, rollback scripts, backups               |
| Zero-downtime deployment failure | High     | Low         | Blue-green deployment, health checks, gradual traffic shift |
| Rollback complications           | High     | Medium      | Tested rollback procedures, database backward compatibility |
| DNS/CDN issues                   | High     | Low         | Pre-deployment validation, TTL management, monitoring       |

---

## DEFINITION OF DONE

### Backend Feature

- [ ] Code implemented and follows style guide
- [ ] Unit tests written (>80% coverage for new code)
- [ ] Integration tests written
- [ ] Zod schema added to shared package (if API change)
- [ ] OpenAPI spec updated
- [ ] Code reviewed and approved
- [ ] Merged to main branch
- [ ] Deployed to dev environment
- [ ] Smoke tested

### Frontend Feature

- [ ] Code implemented and follows style guide
- [ ] UI matches design system
- [ ] Responsive design working (mobile, tablet, desktop)
- [ ] Unit tests written (>80% coverage for new code)
- [ ] Integration tests written (if applicable)
- [ ] Accessibility tested (keyboard nav, screen reader)
- [ ] Code reviewed and approved
- [ ] Merged to main branch
- [ ] Deployed to dev environment
- [ ] Smoke tested

### Integration Task

- [ ] Backend API functional
- [ ] Frontend connected to real API (not mock)
- [ ] End-to-end flow tested
- [ ] Error handling validated
- [ ] Loading states working
- [ ] Toast notifications working
- [ ] Performance acceptable
- [ ] Both teams sign-off

---

## QUICK START CHECKLIST

### Day 1 (Both Teams)

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Set up environment variables (`.env` files)
- [ ] Start local services (Docker Compose for backend)
- [ ] Verify dev environment working
- [ ] Join Slack channels
- [ ] Review architecture documents
- [ ] Attend kickoff meeting

### Backend Team Day 1

- [ ] Start PostgreSQL + Redis (Docker)
- [ ] Run database migrations
- [ ] Seed test data
- [ ] Start Auth service (`nx serve auth-service`)
- [ ] Test `/health` endpoint
- [ ] Access Swagger docs (`http://localhost:4001/api-docs`)

### Frontend Team Day 1

- [ ] Start Shell app (`nx serve shell`)
- [ ] Verify hot reload working
- [ ] Access app (`http://localhost:5173`)
- [ ] Test MSW mocking working
- [ ] Verify Tailwind CSS working
- [ ] Check React DevTools working

---

# PART IV: OPERATIONS & TROUBLESHOOTING

> **Section Overview:** Production operations guidance, common issues, troubleshooting, and frequently asked questions

## TROUBLESHOOTING GUIDE

> **Target Audience:** 🎯 All Developers, DevOps, Support Teams  
> **Purpose:** Quick reference for common issues and their resolutions

### Development Environment Issues

#### Issue: Nx commands not working

**Symptoms:**

- `nx` command not found
- `nx serve` fails with module errors
- Cache corruption warnings

**Solutions:**

```bash
# Solution 1: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Solution 2: Clear Nx cache
nx reset

# Solution 3: Reinstall Nx globally
npm uninstall -g nx
npm install -g nx@latest

# Solution 4: Use npx instead
npx nx serve auth-service
```

**Prevention:**

- Keep Nx version consistent across team (`package.json` lock file)
- Use `.nvmrc` file to lock Node.js version
- Regularly run `nx migrate latest` for updates

---

#### Issue: Port already in use

**Symptoms:**

- `Error: listen EADDRINUSE: address already in use :::3001`
- Service won't start

**Solutions:**

```bash
# Find process using port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process by PID
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in project.json
```

**Prevention:**

- Use different ports for each service (3001, 3002, 3003...)
- Configure `project.json` port options
- Use Docker Compose for consistent port mapping

---

#### Issue: TypeScript errors after pulling changes

**Symptoms:**

- Type errors for existing code
- `Cannot find module` errors
- Zod schema mismatch errors

**Solutions:**

```bash
# Solution 1: Rebuild TypeScript
nx reset
nx build shared-types --skip-nx-cache

# Solution 2: Restart TypeScript server (VS Code)
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Solution 3: Clean install
rm -rf node_modules dist
npm install
nx build shared-types
```

**Prevention:**

- Always run `nx build shared-types` after pulling schema changes
- Configure IDE to auto-rebuild on file changes
- Use pre-commit hooks to validate TypeScript compilation

---

### Database Issues

#### Issue: Prisma migration failures

**Symptoms:**

- `Migration failed to apply`
- Database schema drift detected
- `Foreign key constraint violation`

**Solutions:**

```bash
# Solution 1: Reset database (DEVELOPMENT ONLY!)
cd apps/auth-service
npx prisma migrate reset --force

# Solution 2: Manual migration resolution
npx prisma migrate resolve --applied <migration_name>

# Solution 3: Generate new migration from schema
npx prisma migrate dev --name fix_schema

# Solution 4: Check database state
npx prisma migrate status
```

**Prevention:**

- Never edit applied migrations
- Always test migrations locally before pushing
- Use `prisma migrate dev --create-only` to review before applying
- Keep database schema in sync with Prisma schema

---

#### Issue: Database connection failures

**Symptoms:**

- `Error: Can't reach database server`
- `Connection terminated unexpectedly`
- Timeout errors

**Solutions:**

```bash
# Check PostgreSQL running
docker ps | grep postgres  # If using Docker
pg_isready -h localhost -p 5432  # If installed locally

# Restart PostgreSQL
docker-compose restart postgres  # Docker
brew services restart postgresql@16  # Homebrew

# Verify DATABASE_URL
echo $DATABASE_URL
# Should match: postgresql://user:password@localhost:5432/db_name

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Prevention:**

- Use Docker Compose for consistent database setup
- Document DATABASE_URL format in README
- Add database health check to service startup
- Use connection pooling (Prisma default)

---

### API Integration Issues

#### Issue: CORS errors in browser

**Symptoms:**

- `Access to fetch blocked by CORS policy`
- Preflight request fails
- Credentials not included

**Solutions:**

```typescript
// Backend: Update CORS configuration (Express)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Frontend: Include credentials in fetch
fetch(url, {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
});
```

**Prevention:**

- Configure CORS early in project setup
- Use environment variables for allowed origins
- Test with real frontend during development
- Document CORS requirements in API docs

---

#### Issue: JWT token expiration/invalid

**Symptoms:**

- 401 Unauthorized errors
- Token expired messages
- User logged out unexpectedly

**Solutions:**

```typescript
// Frontend: Implement token refresh logic
const refreshToken = async () => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include', // Send refresh token cookie
  });

  if (response.ok) {
    const { accessToken } = await response.json();
    // Update token in state/storage
    return accessToken;
  }

  // Redirect to login
  window.location.href = '/login';
};

// Backend: Verify token properly
import { verifyAccessToken } from '@myapp/shared/utils';

const token = req.headers.authorization?.split(' ')[1];
if (!token) throw new UnauthorizedError();

const payload = verifyAccessToken(token);
// Use payload.userId, payload.role, etc.
```

**Prevention:**

- Implement automatic token refresh (10 min before expiry)
- Use refresh tokens with longer expiration (7 days)
- Store tokens securely (httpOnly cookies for refresh, memory for access)
- Add token expiration monitoring

---

### Docker & Deployment Issues

#### Issue: Docker container won't start

**Symptoms:**

- Container exits immediately
- `Exited (1)` status
- Port binding failures

**Solutions:**

```bash
# Check container logs
docker logs <container-name>

# Check all containers
docker-compose logs

# Rebuild without cache
docker-compose build --no-cache

# Remove all containers and start fresh
docker-compose down -v
docker-compose up --build

# Check port conflicts
docker ps -a
```

**Common Fixes:**

- Missing environment variables → Add to `docker-compose.yml`
- Database not ready → Add `depends_on` with health check
- Port already in use → Change port mapping `3001:3001` → `3011:3001`

**Prevention:**

- Use `.dockerignore` to exclude `node_modules`
- Add health checks to all services
- Use Docker Compose v3+ with proper `depends_on` conditions
- Test Docker build locally before pushing

---

#### Issue: Kubernetes pod crashes

**Symptoms:**

- `CrashLoopBackOff` status
- `ImagePullBackOff` error
- Liveness probe failures

**Solutions:**

```bash
# Check pod status
kubectl get pods
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>
kubectl logs <pod-name> --previous  # Previous crashed instance

# Check resource limits
kubectl top pods

# Restart deployment
kubectl rollout restart deployment/<deployment-name>
```

**Common Fixes:**

- Image not found → Push to registry: `docker push`
- Resource limits too low → Increase in `deployment.yaml`
- Health check failing → Fix `/health` endpoint or increase timeout
- Environment variables missing → Add to ConfigMap/Secret

**Prevention:**

- Test Docker images locally before deploying
- Set appropriate resource requests/limits
- Implement proper health check endpoints
- Use readiness probes distinct from liveness probes

---

### Performance Issues

#### Issue: Slow API response times

**Symptoms:**

- Requests taking >2 seconds
- Database queries timing out
- High CPU usage

**Diagnostic Steps:**

```bash
# Enable Prisma query logging
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"

# Backend code - Add timing
console.time('getUserProfile');
const user = await prisma.user.findUnique({ where: { id } });
console.timeEnd('getUserProfile');

# Check database query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

# Monitor with k6 load testing
k6 run load-test.js
```

**Solutions:**

```typescript
// 1. Add database indexes
// In Prisma schema:
model User {
  id       String   @id @default(uuid())
  email    String   @unique
  username String   @unique

  @@index([email])  // Add index
  @@index([username])
}

// 2. Implement caching
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 600 }); // 10 min

// 3. Use select to fetch only needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, username: true, email: true }
});

// 4. Implement pagination
const users = await prisma.user.findMany({
  skip: (page - 1) * 20,
  take: 20
});
```

**Prevention:**

- Add indexes during schema design
- Implement caching for read-heavy operations
- Use database query analysis tools
- Set up performance monitoring (APM)
- Load test during development

---

#### Issue: Frontend slow rendering

**Symptoms:**

- Page takes >3 seconds to render
- Sluggish interactions
- High JavaScript execution time

**Diagnostic Steps:**

```bash
# Run Lighthouse audit
npm run lighthouse

# Profile in Chrome DevTools
# 1. Open DevTools → Performance tab
# 2. Click Record
# 3. Interact with app
# 4. Stop recording
# 5. Analyze flame graph
```

**Solutions:**

```typescript
// 1. Lazy load routes
const ChatbotMFE = React.lazy(() => import('chatbotMfe/App'));

// 2. Memoize expensive computations
const sortedUsers = useMemo(
  () => users.sort((a, b) => a.name.localeCompare(b.name)),
  [users]
);

// 3. Virtualize long lists
import { FixedSizeList } from 'react-window';

// 4. Debounce search inputs
import { useDebouncedCallback } from 'use-debounce';
const debouncedSearch = useDebouncedCallback(search, 300);

// 5. Use React.memo for expensive components
export const UserCard = React.memo(({ user }) => {
  // ...
});
```

**Prevention:**

- Code split by route
- Use production builds for testing
- Implement virtual scrolling for long lists
- Profile during development
- Set performance budgets

---

### Testing Issues

#### Issue: E2E tests flaky/failing

**Symptoms:**

- Tests pass locally, fail in CI
- Random timeouts
- "Element not found" errors

**Solutions:**

```typescript
// 1. Add proper waits
await page.waitForSelector('[data-testid="user-list"]', { state: 'visible' });

// 2. Increase timeouts for slow operations
await expect(page.locator('.toast')).toBeVisible({ timeout: 10000 });

// 3. Stabilize selectors
// ❌ Bad: await page.click('.button');
// ✅ Good: await page.click('[data-testid="submit-button"]');

// 4. Mock external APIs
await page.route('**/api/external/**', (route) => {
  route.fulfill({ status: 200, body: JSON.stringify({ data: 'mock' }) });
});

// 5. Run tests in order
test.describe.serial('User flow', () => {
  // Tests run sequentially
});
```

**Prevention:**

- Use `data-testid` attributes consistently
- Mock all external dependencies
- Add retry logic for flaky tests: `test.describe.configure({ retries: 2 })`
- Run tests in Docker for consistency
- Record videos on failure: `use: { video: 'retain-on-failure' }`

---

## FREQUENTLY ASKED QUESTIONS

> **Quick answers to common questions during development**

### Architecture & Design

**Q: Why use both REST and GraphQL?**

**A:** Hybrid approach leverages strengths of both:

- **REST:** CRUD operations, file uploads, SSE streaming, simple caching
- **GraphQL:** Complex data fetching, reducing over-fetching, type safety

Each service exposes REST endpoints and can optionally implement GraphQL resolvers federated through Apollo Gateway.

---

**Q: Why Nx monorepo instead of separate repositories?**

**A:** Nx monorepo provides:

- **Shared code** - Common types, utilities, UI components
- **Atomic changes** - Update API contract and consumers in single PR
- **Intelligent caching** - Only rebuild affected projects (85% faster CI)
- **Dependency graph** - Visual understanding of project relationships
- **Consistency** - Code generators enforce structure

For microservices in production, Nx can build separate Docker images per service.

---

**Q: Can we deploy microservices independently?**

**A:** Yes! Despite monorepo, services are deployable independently:

- Each service has its own `Dockerfile`
- Nx builds only affected projects
- Separate deployment manifests per service
- Can version and rollback services independently

Monorepo != monolith. You get independent deployment with shared code benefits.

---

### Development Workflow

**Q: How do frontend and backend teams coordinate API changes?**

**A:** Three-step process:

1. **Contract First** - Update Zod schemas in `libs/shared/types`
2. **Backend Implementation** - Implement endpoint matching schema
3. **Frontend Integration** - Types auto-generated from Zod schemas

Daily standups ensure both teams aware of API changes. Shared schema is single source of truth.

---

**Q: Can frontend develop without backend being ready?**

**A:** Yes, using Mock Service Worker (MSW) based on shared Zod schemas. Switch from mocks to real API by changing `VITE_API_URL` environment variable.

---

**Q: How do we handle database migrations across services?**

**A:** Each service owns its database and runs migrations independently using Prisma. Production: `prisma migrate deploy` in CI/CD.

---

**Q: What if I need data from another service's database?**

**A:** Never access directly. Use: (1) REST API calls between services, (2) GraphQL Federation via Apollo Gateway, or (3) Event-driven architecture.

---

### Testing

**Q: What's the difference between unit, integration, and E2E tests?**

**A:** Unit tests validate single functions (fast), integration tests verify modules work together (medium), E2E tests confirm full user flows (slow). Target: 80%+ unit coverage, integration for critical flows, 20-30 E2E tests for happy/error paths.

---

**Q: How do we test Module Federation integration?**

**A:** Three levels: (1) Component tests in isolation, (2) Integration tests loading remote MFEs in shell, (3) Playwright E2E tests navigating between MFEs.

---

### Deployment

**Q: What's the deployment strategy for production?**

**A:** Blue-green deployment with canary: Build → Staging tests → 10% canary → Monitor 1hr → Full rollout or instant rollback.

---

**Q: How do we handle environment variables in production?**

**A:** Use Kubernetes ConfigMaps (non-sensitive), Secrets (API keys, passwords), and External Secrets (AWS Secrets Manager). Never commit secrets to Git.

---

**Q: Can we deploy frontend and backend separately?**

**A:** Yes! They're decoupled:

- **Backend** - Deployed to AWS ECS, Google Cloud Run, or K8s
- **Frontend** - Deployed to S3 + CloudFront, Vercel, or Netlify

Frontend calls backend via `VITE_API_URL` environment variable. Update frontend environment config to point to production API URL.

---

### Security

**Q: How do we secure JWT tokens?**

**A:** Multi-layer security:

1. **Access tokens** - Short-lived (15 min), stored in memory
2. **Refresh tokens** - Long-lived (7 days), httpOnly cookies
3. **Token rotation** - New refresh token on each refresh
4. **Secure cookies** - `httpOnly`, `secure`, `sameSite: strict`

```typescript
// Backend: Set refresh token cookie
res.cookie('refreshToken', token, {
  httpOnly: true, // Not accessible via JavaScript
  secure: true, // HTTPS only
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Frontend: Access token in memory (Zustand store)
// Automatically included in requests via interceptor
```

Never store tokens in localStorage (vulnerable to XSS).

---

**Q: How do we implement role-based access control (RBAC)?**

**A:** Three-tier system:

1. **User model** - Has `role` field (`USER`, `ADMIN`, `SUPER_ADMIN`)
2. **Middleware** - Checks role before allowing access
3. **Frontend guards** - Hide UI elements based on role

```typescript
// Backend middleware
const requireRole = (roles: Role[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Route protection
app.delete('/api/users/:id',
  authenticate,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  deleteUser
);

// Frontend guard
{user.role === 'ADMIN' && (
  <Button onClick={deleteUser}>Delete User</Button>
)}
```

---

**Q: How do we prevent SQL injection and XSS attacks?**

**A:** Built-in protections: Prisma ORM uses parameterized queries (SQL injection), React escapes values by default (XSS), SameSite cookies prevent CSRF. Additional: Zod input validation, DOMPurify for rich text, express-rate-limit for API protection.

---

### Performance

**Q: What's the expected API latency?**

**A:** Targets (p95): Simple GET <100ms, Complex GET <300ms, POST/PUT <200ms, GraphQL <400ms, SSE streaming <500ms. Monitor with k6 and APM tools.

---

**Q: How do we optimize Module Federation performance?**

**A:** Strategies: Prefetching, code splitting, shared dependencies, CDN delivery, versioned caching. Results: 83% faster first load, 98% faster navigation, 60% smaller bundles. See [ADVANCED_MFE_ROUTING_OPTIMIZATIONS.md](./ADVANCED_MFE_ROUTING_OPTIMIZATIONS.md).

---

### Nx Monorepo

**Q: How do Nx caching and affected commands work?**

**A:** Nx hashes task inputs; if unchanged, restores cached output (85% faster CI). Remote caching via Nx Cloud shares cache across team. Commands: `nx affected:build`, `nx affected:test`, `nx affected:graph`.

---

**Q: How do we add a new microservice or MFE?**

**A:** Use Nx generators: `nx g @nx/node:application my-service` (backend) or `nx g @nx/react:application my-mfe` (frontend). Then update docker-compose.yml (service) or Module Federation config (MFE).

---

### Cost & Scaling

**Q: What's the estimated monthly cost for production?**

**A:** ~$180-470/month (10K users, 1M requests): Compute $50-100, Database $30-70, Redis $15-30, Storage $5-10, CDN $10-20, OpenAI $50-200, Monitoring $20-40. Optimize with spot instances, caching, compression.

---

**Q: How many users can this architecture handle?**

**A:** MVP: 1K-10K (single region), Growth: 10K-100K (load balancer + cache), Scale: 100K-1M (multi-region + replicas), Enterprise: 1M+ (K8s auto-scale). Bottlenecks: DB connections, OpenAI limits, memory, bandwidth. Load test with k6.

---

# APPENDICES

> **Reference materials, glossary, and supplementary documentation**

## APPENDIX A: DETAILED FEATURE SPECIFICATIONS

See [Key Technologies](#key-technologies) section for comprehensive technology stack including:

- Backend technologies (Node.js, Express, PostgreSQL, Prisma, Redis)
- Frontend technologies (React, Vite, Module Federation, Zustand, TanStack Query)
- Infrastructure & DevOps (Docker, Kubernetes, AWS/GCP, GitHub Actions)
- Shared utilities (Zod schemas, TypeScript types, ESLint, Prettier)

For feature-specific implementation details, refer to:

- [Week-by-Week Implementation](#week-by-week-implementation) - Development timeline
- [Backend Implementation](./MICROSERVICES_IMPLEMENTATION_ROADMAP.md) - Microservices details
- [Frontend Implementation](./MICROFRONTEND_IMPLEMENTATION_ROADMAP.md) - MFE architecture

---

## APPENDIX B: GRAPHQL IMPLEMENTATION DETAILS

See [Hybrid API Architecture: REST + GraphQL](#hybrid-api-architecture-rest--graphql) section for:

- Apollo Federation architecture
- Schema stitching strategies
- Query optimization patterns
- Resolver implementation examples
- GraphQL vs REST decision matrix

Key code examples:

- GraphQL Gateway setup (Week 3 implementation)
- Apollo Client integration with React
- GraphQL subscriptions for real-time data
- Error handling and caching strategies

---

## APPENDIX C: CODE EXAMPLES

Code examples are embedded throughout this document in relevant sections:

**Backend Examples:**

- [Week 1](#week-1-foundation--setup) - Nx monorepo setup, Prisma schema
- [Week 2](#week-2-core-services--mfes) - Auth service, JWT middleware, API endpoints
- [Week 3](#week-3-admin-service-graphql-gateway--advanced-mfes) - GraphQL resolvers, Apollo Federation
- [Week 4](#week-4-testing-integration--optimization) - Unit tests, integration tests, E2E tests

**Frontend Examples:**

- [Week 2](#week-2-core-services--mfes) - MFE setup, Module Federation config, auth flow
- [Week 3](#week-3-admin-service-graphql-gateway--advanced-mfes) - Apollo Client, GraphQL queries
- [Week 4](#week-4-testing-integration--optimization) - Playwright tests, MSW mocks

**Infrastructure Examples:**

- [Week 5](#week-5-deployment--launch) - Dockerfile, docker-compose.yml, Kubernetes manifests

---

## APPENDIX D: GLOSSARY

> **Key terms and acronyms used throughout this document**

| Term                      | Definition                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **MFE**                   | Micro-Frontend - Independent frontend application loaded at runtime via Module Federation                |
| **Module Federation**     | Webpack 5+ feature allowing dynamic loading of JavaScript modules from separate builds                   |
| **Nx**                    | Build system and monorepo tool providing intelligent caching, code generation, and dependency management |
| **Monorepo**              | Single repository containing multiple related projects (services, apps, libraries)                       |
| **Prisma**                | TypeScript ORM (Object-Relational Mapping) for type-safe database access                                 |
| **Zod**                   | TypeScript-first schema validation library used for API contracts and runtime validation                 |
| **JWT**                   | JSON Web Token - Compact, URL-safe token format for authentication                                       |
| **SSE**                   | Server-Sent Events - HTTP streaming protocol for real-time server-to-client communication                |
| **GraphQL**               | Query language for APIs allowing clients to request exactly the data they need                           |
| **Apollo Federation**     | Architecture for combining multiple GraphQL services into single unified graph                           |
| **REST**                  | Representational State Transfer - Architectural style for designing networked applications               |
| **CORS**                  | Cross-Origin Resource Sharing - Browser security feature controlling cross-origin requests               |
| **Docker**                | Containerization platform for packaging applications with their dependencies                             |
| **Kubernetes (K8s)**      | Container orchestration platform for automating deployment, scaling, and management                      |
| **CI/CD**                 | Continuous Integration / Continuous Deployment - Automated testing and deployment pipelines              |
| **MSW**                   | Mock Service Worker - API mocking library for testing and development                                    |
| **Playwright**            | End-to-end testing framework for web applications                                                        |
| **Vitest**                | Fast unit test framework for JavaScript/TypeScript                                                       |
| **TanStack Query**        | Data fetching and caching library (formerly React Query)                                                 |
| **Zustand**               | Lightweight state management library for React                                                           |
| **CDN**                   | Content Delivery Network - Distributed network for delivering content with low latency                   |
| **APM**                   | Application Performance Monitoring - Tools for tracking app performance and errors                       |
| **RPS**                   | Requests Per Second - Measure of throughput for APIs                                                     |
| **p95/p99**               | 95th/99th percentile - Metric showing latency for 95%/99% of requests                                    |
| **TTL**                   | Time To Live - Duration before cached data expires                                                       |
| **RBAC**                  | Role-Based Access Control - Security model assigning permissions based on user roles                     |
| **TOTP**                  | Time-Based One-Time Password - Algorithm for generating temporary authentication codes (MFA)             |
| **SSO**                   | Single Sign-On - Authentication scheme allowing one login for multiple systems                           |
| **XSS**                   | Cross-Site Scripting - Security vulnerability allowing injection of malicious scripts                    |
| **CSRF**                  | Cross-Site Request Forgery - Attack forcing authenticated users to execute unwanted actions              |
| **ORM**                   | Object-Relational Mapping - Technique for converting between incompatible type systems                   |
| **Canary Release**        | Deployment strategy releasing new version to small subset of users first                                 |
| **Blue-Green Deployment** | Strategy running two identical production environments, switching traffic between them                   |
| **Lighthouse**            | Automated tool for measuring web page quality (performance, accessibility, SEO)                          |
| **Hot Reload**            | Development feature updating application in browser without full refresh                                 |
| **Tree Shaking**          | Build optimization removing unused code from bundles                                                     |
| **Code Splitting**        | Technique dividing code into smaller chunks loaded on demand                                             |
| **Hydration**             | Process of attaching event listeners to server-rendered HTML                                             |
| **Idempotent**            | Operation that produces same result regardless of how many times it's executed                           |

---

## APPENDIX E: RESOURCES & REFERENCES

### Documentation

- **Backend:** [MICROSERVICES_IMPLEMENTATION_ROADMAP.md](./MICROSERVICES_IMPLEMENTATION_ROADMAP.md)
- **Frontend:** [MICROFRONTEND_IMPLEMENTATION_ROADMAP.md](./MICROFRONTEND_IMPLEMENTATION_ROADMAP.md)
- **API Contracts:** Swagger UI (running services)
- **Shared Schemas:** `libs/shared/types/README.md`

### Tools

- **Project Management:** Jira / Linear
- **Communication:** Slack
- **Documentation:** Notion / Confluence
- **Code Repository:** GitHub
- **CI/CD:** GitHub Actions
- **Monitoring:** Grafana, CloudWatch, Sentry

### Learning Resources

- **Zod:** https://zod.dev
- **Prisma:** https://www.prisma.io/docs
- **React Router v7:** https://reactrouter.com
- **TanStack Query:** https://tanstack.com/query
- **Module Federation:** https://module-federation.io
- **Terraform:** https://developer.hashicorp.com/terraform

---

## TEAM MOTIVATION

**Week 1:** Foundation - "Building the base for greatness"  
**Week 2:** Core Features - "Shipping value every day"  
**Week 3:** Advanced Features - "Pushing boundaries"  
**Week 4:** Quality - "Excellence through testing"  
**Week 5:** Launch - "Delivering to users"

**Remember:**

- Communication is key
- Ask for help early
- Celebrate small wins
- Focus on quality over speed
- Collaborate, don't compete

**Let's build something amazing together!**

---

**Last Updated:** November 15, 2025  
**Next Review:** End of Week 1  
**Document Owner:** Tech Lead / Engineering Manager
