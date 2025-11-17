# Full-Stack Implementation Roadmap

## Parallel Frontend & Backend Development (Nx Monorepo)

**Version:** 5.0  
**Date:** November 17, 2025  
**Timeline:** 5 Weeks (35 days)  
**Team Composition:** 4-8 developers (2-4 Backend, 2-4 Frontend)  
**Architecture:** **Unified Monorepo (Nx) with Hybrid REST + GraphQL**

---

## 📋 PROJECT OVERVIEW

### Architecture Components

#### Backend Services

- **Auth Service** - JWT authentication, user management, REST + GraphQL subgraph
- **Chatbot Service** - OpenAI integration, SSE streaming, REST + GraphQL subgraph
- **Admin Service** - User management, analytics, REST + GraphQL subgraph
- **GraphQL Gateway** - Apollo Federation, unified API layer (Port 4000)
- **Database** - PostgreSQL 15 with Prisma ORM, MongoDB 7.0 with Mongoose
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
- **@myapp/frontend/stores** - Zustand stores
- **@myapp/frontend/hooks** - Custom React hooks
- **@myapp/frontend/utils** - Frontend utilities

### Planned Features

**Backend:**

- User authentication (JWT, refresh tokens) - REST
- User registration with validation - REST
- Password reset flow - REST
- **SSO with OAuth 2.0** - Google, GitHub (Priority 1-2)
- **Multi-Factor Authentication (MFA)** - TOTP, SMS, WebAuthn (Priority 1-3)
- Session management (Redis) - REST
- Chat conversations (CRUD) - REST
- Chat messages with OpenAI integration - REST + SSE
- Server-Sent Events (SSE) streaming - REST
- Rate limiting (10 msg/min)
- Admin user management - REST
- Admin analytics dashboard - **GraphQL (optimized)**
- Complex data queries - **GraphQL Federation**
- User profile aggregation - **GraphQL**
- Conversation list with stats - **GraphQL**
- Audit logging
- Database migrations (Prisma)
- Health check endpoints (database, Redis, OpenAI status)
- Health check metrics (response time, memory, uptime)
- CORS configuration
- Input validation (Zod)

**Frontend:**

- Module Federation architecture
- Shell host application
- Auth MFE (login, register, password reset)
- Chatbot MFE (chat interface, streaming)
- Admin MFE (user management, analytics)
- Profile MFE (settings, security)
- Responsive design (mobile, tablet, desktop)
- Dark/Light theme toggle
- Toast notifications
- Loading states
- Error boundaries
- Protected routes
- Role-based access control
- Markdown rendering for AI responses
- Code syntax highlighting

**Infrastructure:**

- Docker multi-stage builds (4 services)
- Docker Compose orchestration
- Nginx reverse proxy
- PostgreSQL 15 database
- MongoDB 7.0 database
- Redis 7 cache
- GitHub Actions CI/CD
- E2E testing automation
- Load testing scenarios (k6)
- Smoke test scripts
- Environment templates
- Health checks
- Security hardening

### 🔮 Optional Enhancements

**Priority 1 (High Value, Low Effort):**

- SSO with Google OAuth (~8-12 hours, $0/month)
- TOTP-based MFA (~6-8 hours, $0/month)
- Enhanced health checks with dependency status (~20 min)
- Profile MFE MSW handlers (~15 min)
- Swagger/OpenAPI documentation (~60 min) COMPLETED

**Priority 2 (Recommended):**

- GitHub OAuth integration (~4-6 hours, $0/month)
- SMS MFA with Twilio (~4-6 hours, $15-30/month)
- Prometheus metrics integration (~2 hours)

**Priority 3 (Long Term):**

- WebAuthn/FIDO2 support (~8-10 hours, $0/month)
- Auth0 enterprise SSO (~6-8 hours, $23-240/month)
- Multi-region deployment
- Advanced caching strategies
- WebSocket support for real-time features
- Machine learning model optimization
- Mobile applications (React Native)
- Advanced analytics platform

### 🎯 Target Achievements

- **Modern Architecture** - Microservices + Module Federation MFEs
- **Comprehensive Testing** - 250+ tests (unit, E2E, load)
- **Production Ready** - Docker, K8s, multi-cloud deployment
- **Security Hardened** - 0 vulnerabilities, best practices
- **Fully Documented** - 3,700+ lines of guides
- **Real-time Features** - SSE streaming for chat
- **Type Safe** - TypeScript + Zod throughout
- **Scalable** - Horizontal and vertical scaling ready
- **Fast Development** - Nx monorepo with intelligent caching

### 📊 Project Statistics

| Metric                | Base Project                              | With SSO/MFA (P1)          | With SSO/MFA (Full)        |
| --------------------- | ----------------------------------------- | -------------------------- | -------------------------- |
| **Total Projects**    | 20 (9 apps, 11 libs)                      | 20 (9 apps, 11 libs)       | 20 (9 apps, 11 libs)       |
| **Backend Services**  | 4 (Auth, Chatbot, Admin, GraphQL Gateway) | 4 + OAuth/MFA              | 4 + OAuth/MFA              |
| **API Protocols**     | REST + GraphQL (Hybrid)                   | REST + GraphQL + OAuth 2.0 | REST + GraphQL + OAuth 2.0 |
| **GraphQL Subgraphs** | 3 (Auth, Chatbot, Admin)                  | 3                          | 3                          |
| **Lines of Code**     | ~17,000+                                  | ~18,500+                   | ~20,000+                   |
| **Total Tests**       | 270+ (target)                             | 290+ (target)              | 310+ (target)              |
| **Test Coverage**     | ~85% (target)                             | ~85% (target)              | ~85% (target)              |
| **Documentation**     | 3,700+ lines                              | 4,500+ lines               | 5,000+ lines               |
| **Code Files**        | 330+                                      | 350+                       | 370+                       |
| **Dependencies**      | 90+ packages                              | 95+ packages               | 100+ packages              |
| **Development Time**  | ~14 hours                                 | ~26-30 hours               | ~44+ hours                 |
| **Target Completion** | 5 weeks (35 days)                         | 6 weeks (42 days)          | 7-8 weeks (49-56 days)     |
| **Monthly Cost**      | $5,750                                    | $5,750                     | $5,790-6,020               |

### 🚦 Production Readiness Checklist

#### Development Phase

- [ ] All tests passing (270+ tests target)
- [ ] Security audit complete (0 vulnerabilities)
- [ ] Performance benchmarks validated
- [ ] Documentation complete
- [ ] Docker images built and tested
- [ ] CI/CD pipelines configured
- [ ] Environment templates created
- [ ] Health checks implemented
- [ ] Error handling comprehensive
- [ ] Logging configured
- [ ] Rate limiting enabled

#### Pre-Launch Tasks

- [ ] Generate production secrets (openssl rand -base64 64)
- [ ] Create .env.prod files with real values
- [ ] Configure domain and SSL certificate
- [ ] Set up GitHub Secrets for CI/CD
- [ ] Configure Slack webhook for notifications
- [ ] Set up monitoring dashboards
- [ ] Configure backup scripts
- [ ] Test rollback procedures
- [ ] Perform security penetration testing
- [ ] Run final load tests on staging

#### Post-Launch Tasks

- [ ] 24-hour intensive monitoring
- [ ] User feedback collection
- [ ] Performance monitoring (RUM)
- [ ] Error tracking (Sentry)
- [ ] Weekly performance reviews
- [ ] Monthly security audits
- [ ] Quarterly dependency updates
- [ ] Feature usage analytics

### 🎯 Success Criteria

| Criteria                     | Target   | Notes                           |
| ---------------------------- | -------- | ------------------------------- |
| **Test Coverage**            | >80%     | Unit, integration, E2E tests    |
| **Unit Tests**               | >200     | Comprehensive component tests   |
| **E2E Tests**                | >50      | Critical user flows             |
| **Security Vulnerabilities** | 0        | Regular npm audit               |
| **API Response Time (p95)**  | <500ms   | Normal load conditions          |
| **Error Rate**               | <1%      | Production traffic              |
| **Lighthouse Score**         | >90      | Performance, accessibility, SEO |
| **Documentation**            | Complete | Architecture, API, deployment   |
| **Deployment Options**       | 3+       | Docker, K8s, cloud platforms    |
| **Timeline**                 | 5 weeks  | 35 days with parallel teams     |

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

## EXECUTIVE SUMMARY

This consolidated roadmap enables **parallel development** of the microservices backend and microfrontend architecture in a **unified Nx monorepo** with a **hybrid REST + GraphQL API strategy**. By using **Nx** for advanced build orchestration, intelligent caching, and code generation, both teams can work independently while maintaining tight integration with maximum efficiency and future scalability.

**Key Strategy:**

- **Monorepo Architecture:** Single Nx workspace housing frontend, backend, and shared packages
- **Hybrid API Layer:** REST for CRUD/streaming, GraphQL for complex data fetching
- **Nx Build System:** Intelligent task scheduling, computation caching, distributed execution
- **Code Generators:** Scaffolding tools for consistent project structure
- **Dependency Graph:** Visual understanding of project dependencies
- **Apollo Federation:** Unified GraphQL gateway across microservices
- **Week 1:** Foundation (Nx monorepo setup + shared types)
- **Week 2:** Core Services (Backend: Auth + Chatbot with REST, Frontend: Auth + Profile MFEs)
- **Week 3:** Advanced Features (Backend: Admin + GraphQL Gateway, Frontend: Chatbot + Admin MFEs)
- **Week 4:** Testing & Integration (both teams integrate + E2E testing + GraphQL queries)
- **Week 5:** Deployment (parallel staging/production deployment)

**Success Factors:**

Unified Nx monorepo with intelligent caching  
Shared Zod schemas as API contract  
**Hybrid REST + GraphQL for optimal performance**  
**Apollo Federation for microservices integration**  
Incremental builds (rebuild only affected projects)  
Distributed task execution (local & CI)  
Code generators for consistency  
Dependency graph visualization  
Mock APIs for frontend independence  
Daily sync meetings between teams  
Clear API documentation (OpenAPI + GraphQL Schema)  
Parallel CI/CD pipelines with Nx Cloud

---

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

- Microfrontend development (Shell, Auth, Chatbot, Admin, Profile)
- UI/UX implementation
- State management (Zustand + TanStack Query)
- Frontend testing (unit, integration, E2E)
- Design system implementation
- Frontend CI/CD pipeline

**Tech Stack:**

- React 18 + TypeScript 5.3 + Vite 5.x
- React Router v7 + Zustand v5 + TanStack Query v5
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

## MONOREPO ARCHITECTURE

### Why Nx?

**Nx Advantages for Scalability:**

- **Intelligent Task Scheduling** - Runs tasks in optimal order based on dependency graph
- **Computation Caching** - Never rebuild the same code twice (local + distributed)
- **Dependency Graph Visualization** - Understand project relationships (`nx graph`)
- **Code Generators** - Scaffold services, components, libraries with consistent structure
- **Affected Commands** - Run tasks only for changed projects (`nx affected:test`)
- **Nx Cloud** - Distributed task execution and remote caching (optional)
- **Plugin Ecosystem** - Official plugins for Node, React, Vite, Next.js, etc.
- **Migration Scripts** - Automated updates for breaking changes
- **Built for Scale** - Used by Google, Microsoft, Cisco (1000+ projects)
- **Integrated Tooling** - ESLint, Jest, Cypress, Storybook preconfigured

**Nx vs Alternatives:**

| Feature            | Nx                | Turborepo | pnpm/yarn workspaces |
| ------------------ | ----------------- | --------- | -------------------- |
| Build Caching      | Advanced          | Good      | None                 |
| Task Orchestration | Intelligent       | Simple    | Manual               |
| Dependency Graph   | Visual + Analysis | Basic     | None                 |
| Code Generators    | Extensive         | None      | None                 |
| Affected Detection | Built-in          | Basic     | None                 |
| Plugin Ecosystem   | Rich              | Limited   | None                 |
| Remote Caching     | Nx Cloud          | Built-in  | None                 |
| Learning Curve     | Medium            | Low       | Low                  |
| Scalability        | Excellent         | Good      | Limited              |

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

This architecture combines the strengths of both REST and GraphQL to optimize different use cases:

**REST APIs are ideal for:**
- Authentication flows (login, logout, token refresh)
- Simple CRUD operations (create user, update profile)
- File uploads/downloads
- Streaming responses (Server-Sent Events for chat)
- Operations that map cleanly to HTTP verbs

**GraphQL is ideal for:**
- Complex data fetching with multiple relationships (admin dashboards)
- Reducing network requests (5+ REST calls → 1 GraphQL query)
- Flexible client-driven queries (mobile vs web different data needs)
- Real-time subscriptions (chat notifications, live updates)
- Reducing over-fetching and under-fetching

**Performance Impact:**
- Admin dashboard: **50% faster** (350ms → 175ms) by combining 7 REST calls into 1 GraphQL query
- User profile page: **60% less data transferred** by requesting only needed fields
- Mobile app: **40% fewer round trips** with nested query support

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

## WEEK-BY-WEEK IMPLEMENTATION

## WEEK 1: Foundation & Setup

**Objective:** Establish unified Nx monorepo infrastructure, tooling, and shared contracts

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

# Create frontend applications (microfrontends)
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
    - ChatStore (Zustand) for active conversation
    - TanStack Query for conversation list + history
    - Optimistic updates for sent messages
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

## RESOURCES

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
