# AI Chatbot Full-Stack Application

[![Architecture](https://img.shields.io/badge/Architecture-Microservices%20%2B%20MFE-blue)](#architecture)
[![API](https://img.shields.io/badge/API-REST%20%2B%20GraphQL-blue)](#architecture)
[![Nx](https://img.shields.io/badge/Monorepo-Nx-purple)](https://nx.dev)
[![Docker](https://img.shields.io/badge/Containerized-Docker-2496ED)](#quick-start)

An enterprise-grade AI chatbot application built with modern microservices backend and Module Federation micro-frontends, featuring hybrid REST + GraphQL APIs, comprehensive testing, CI/CD automation, and multi-platform deployment support.

**Timeline:** 10 weeks (70 days) | **Team Size:** 3-4 developers | **Phases:** Event Bus → GraphQL → Hybrid Database

## 🔒 SECURITY NOTICE

⚠️ **Action Required**: A security audit on November 21, 2025 identified **2 critical vulnerabilities** requiring immediate attention before deployment. See `SECURITY_AUDIT_NOV_2025.md` for full details and remediation steps.

**Critical Issues**:

1. Exposed secrets in repository (.env files)
2. CORS wildcard accepting any origin

**Immediate Actions**: Rotate API keys, fix CORS configuration, remove secrets from git history.

---

## ✨ Key Features

- 🎯 **Modern Architecture** - Microservices + Module Federation MFEs
- 🔀 **Hybrid API** - REST for CRUD + GraphQL for complex queries (Apollo Federation)
- 🏭️ **Nx Monorepo** - Intelligent caching, affected detection, parallel execution
- 🧪 **Comprehensive Testing** - Unit, E2E, integration, load testing
- 🔒 **Security First** - JWT auth, rate limiting, input validation, RBAC
- 🔐 **SSO + MFA** - Google/GitHub OAuth, TOTP/SMS 2FA (optional tiers)
- 📊 **Real-time Chat** - OpenAI integration with SSE streaming
- ⚡ **High Performance** - 50% faster dashboards with GraphQL optimization
- 🐳 **Multi-platform Deploy** - Docker, K8s, AWS, GCP, Azure
- 📚 **Fully Documented** - 3,700+ lines of implementation guides
- 🔄 **CI/CD Ready** - GitHub Actions workflows included

## Architecture

- **Backend**: 4 microservices (Auth, Admin, Chatbot, GraphQL Gateway) with Express + Prisma/Mongoose
- **API Layer**: Hybrid REST + GraphQL (Apollo Federation v2)
- **Authentication**: JWT + OAuth 2.0 SSO (Google, GitHub) + MFA (TOTP, SMS, WebAuthn)
- **Frontend**: Shell host + 4 remote MFEs (Auth, Chatbot, Admin, Profile)
- **Infrastructure**: PostgreSQL 15, MongoDB 7, Redis 7, Nginx reverse proxy
- **Testing**: Playwright (E2E), Jest (Unit), k6 (Load)
- **Build System**: Nx monorepo with intelligent caching

**API Strategy:**

- **REST**: Authentication, CRUD operations, file uploads, SSE streaming
- **GraphQL**: Complex data queries, admin dashboards, federated data fetching
- **Performance**: 50% faster admin dashboard (7 REST calls → 1 GraphQL query)

**Security Features:**

- **Priority 1** (🎉 Free): Google OAuth + TOTP MFA (self-hosted, $0/month)
- **Priority 2** (Recommended): GitHub OAuth + SMS MFA (+$15-30/month)
- **Priority 3** (Enterprise): WebAuthn + Auth0 SSO (+$25-240/month)

## Monorepo Structure

```
ai-chatbot-fullstack-2026/
├── apps/
│   ├── auth-service/        # Authentication microservice (REST + GraphQL subgraph)
│   ├── chatbot-service/     # Chatbot microservice (REST + GraphQL subgraph)
│   ├── admin-service/       # Admin microservice (REST + GraphQL subgraph)
│   ├── graphql-gateway/     # GraphQL Gateway (Apollo Federation - port 4000)
│   ├── shell/               # Shell app (host for MFEs)
│   ├── auth-mfe/            # Auth microfrontend (port 5174)
│   ├── chatbot-mfe/         # Chatbot microfrontend (port 5175)
│   ├── admin-mfe/           # Admin microfrontend (port 5176)
│   └── profile-mfe/         # Profile microfrontend (port 5177)
├── libs/
│   ├── shared/
│   │   ├── types/           # Zod schemas (API contracts)
│   │   ├── graphql-types/   # GraphQL schemas and types
│   │   └── utils/           # Common utilities
│   ├── backend/
│   │   ├── logger/          # Logging library
│   │   ├── metrics/         # Metrics library
│   │   ├── security/        # Security utilities
│   │   └── database/        # Database utilities
│   └── frontend/
│       ├── ui-components/   # Shared UI components
│       ├── api-client/      # REST API client
│       ├── graphql-client/  # Apollo Client (GraphQL)
│       ├── stores/          # Shared stores (Zustand)
│       └── utils/           # Frontend utilities
└── docker-compose.yml       # Local development services
```

## Quick Start

### Prerequisites

- Node.js v20 or higher
- Docker & Docker Compose
- npm (comes with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-chatbot-fullstack-2026
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start local services (PostgreSQL + Redis)**

   ```bash
   npm run docker:up
   ```

4. **Run database migrations**

   ```bash
   npm run prisma:migrate
   ```

5. **Start all applications**

   ```bash
   # Start all (backend + frontend)
   npm run dev

   # Or start separately
   npm run dev:backend    # Backend services only
   npm run dev:frontend   # Frontend apps only
   npm run dev:shell      # Shell app only
   ```

### Application URLs

- **Shell App**: http://localhost:5173
- **Auth MFE**: http://localhost:5174
- **Chatbot MFE**: http://localhost:5175
- **Admin MFE**: http://localhost:5176
- **Profile MFE**: http://localhost:5177
- **GraphQL Gateway**: http://localhost:4000/graphql (Apollo Studio)
- **Prisma Studio**: `npm run prisma:studio`

## Available Scripts

### Development

- `npm run dev` - Start all applications in parallel
- `npm run dev:backend` - Start backend services only
- `npm run dev:frontend` - Start frontend apps only
- `npm run dev:shell` - Start shell app only

### Building

- `npm run build` - Build all applications
- `npm run build:affected` - Build only affected projects

### Testing

**Unit Tests:**

- `npm run test` - Run all tests
- `npm run test:affected` - Run tests for affected projects
- `npm run test:watch` - Run tests in watch mode

**E2E Tests:**

- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:headed` - Run with browser visible
- `npm run test:e2e:ui` - Open Playwright UI mode
- `npm run test:e2e:report` - View test report

**Smoke Tests:**

- `npm run test:smoke` - Post-deployment validation (local)
- `npm run test:smoke:staging` - Test staging environment
- `npm run test:smoke:production` - Test production environment

**Load Tests:**

```bash
# Install k6 first: brew install k6
k6 run k6/load-test.js        # Normal load test
k6 run k6/stress-test.js      # Stress test (breaking point)
k6 run k6/spike-test.js       # Spike test (sudden surge)
k6 run k6/soak-test.js        # Soak test (memory leaks)
```

### Code Quality

- `npm run lint` - Lint all projects
- `npm run lint:affected` - Lint affected projects only
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check formatting

### Nx Tools

- `npm run graph` - View dependency graph
- `npm run affected:graph` - View affected projects graph
- `npm run reset` - Reset Nx cache

### Docker (Development)

- `npm run docker:up` - Start PostgreSQL and Redis
- `npm run docker:down` - Stop and remove containers
- `npm run docker:logs` - View container logs
- `npm run docker:ps` - List running containers

### Docker (Production)

- `npm run docker:build:prod` - Build all production images
- `npm run docker:up:prod` - Start production stack
- `npm run docker:down:prod` - Stop production stack
- `npm run docker:logs:prod` - View production logs
- `npm run docker:migrate:prod` - Run database migrations

### Deployment

**Quick Deploy (Docker Compose):**

```bash
npm run docker:build:prod
npm run docker:up:prod
npm run docker:migrate:prod
npm run test:smoke:production
```

**See full deployment guide:** [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)

### Prisma

- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:studio` - Open Prisma Studio GUI

## Development Workflow

### Backend Team

1. **Create new schemas in shared types**

   ```bash
   # Edit libs/shared/types/src/schemas/*.ts
   ```

2. **Update Prisma schema**

   ```bash
   # Edit apps/auth-service/prisma/schema.prisma
   npm run prisma:migrate
   ```

3. **Implement endpoints**
   ```bash
   nx serve auth-service
   ```

### Frontend Team

1. **Use shared types**

   ```typescript
   import { LoginSchema, type LoginInput } from '@myapp/shared/types';
   ```

2. **Develop MFE**

   ```bash
   nx serve auth-mfe
   ```

3. **Integrate with shell**
   ```bash
   nx serve shell
   ```

## Project Tags

Projects are tagged for dependency management:

- `type:backend` - Backend services
- `type:frontend` - Frontend applications
- `type:shared` - Shared libraries
- `scope:auth`, `scope:chatbot`, `scope:admin`, `scope:profile` - Feature scopes

## Module Boundaries

ESLint enforces strict module boundaries:

- Backend can only import: `type:backend`, `type:shared`
- Frontend can only import: `type:frontend`, `type:shared`
- Shared can only import: `type:shared`

## Key Technologies

### Backend

- Node.js v20 + TypeScript 5.3
- Express 4.18
- **GraphQL**: Apollo Server v4 + Apollo Federation v2
- **Authentication**: Passport.js + OAuth 2.0 (Google, GitHub)
- **MFA**: Speakeasy (TOTP), Twilio (SMS), @simplewebauthn (WebAuthn)
- Prisma 6.x ORM (PostgreSQL)
- Mongoose 8.x ODM (MongoDB)
- PostgreSQL 16
- MongoDB 7.0
- Redis 7
- Zod for validation
- OpenAI API integration

### Frontend

- React 18
- TypeScript 5.3
- Vite 5.x
- React Router v7
- **GraphQL**: Apollo Client v3
- Zustand v5 (state management)
- TanStack Query v5 (REST data fetching)
- Tailwind CSS v4
- Module Federation

### Build System

- Nx 22.x
- Intelligent caching
- Affected command detection
- Task orchestration

## 📋 Implementation Roadmap

This project follows a **strategic 10-week implementation plan** with three sequential phases, each building on the foundation of the previous one:

### 🔵 Phase 1: MFE Event Bus (Weeks 1-2, 10 dev-days)

**Goal:** Establish event-driven architecture for cross-MFE communication

- Event bus library in `libs/frontend/event-bus`
- Auth state synchronization (login, logout, token refresh)
- Toast notifications and cross-MFE events
- **Risk:** 🟢 Low | **Dependencies:** None | **Impact:** Immediate UX improvement

**Why First:** Foundation for other phases, no backend dependencies, high confidence builder

### 🟣 Phase 2: GraphQL + REST Hybrid API (Weeks 3-6, 18 dev-days)

**Goal:** Implement Apollo Federation gateway for 50% faster dashboards

- Apollo Federation gateway with auth, chatbot, admin subgraphs
- Apollo Client v5 frontend integration
- Admin dashboard migration (7 calls → 1 query)
- **Performance:** 378ms → 185ms (51% faster) | **Risk:** 🟡 Medium | **Backwards Compatible:** Yes

**Why Second:** Event Bus provides cache coordination, REST APIs remain functional, clear performance metrics

### 🟠 Phase 3: MongoDB + PostgreSQL Hybrid Database (Weeks 7-10, 15 dev-days)

**Goal:** Optimize storage with polyglot persistence (PostgreSQL for auth, MongoDB for chat)

- MongoDB cluster setup with indexing
- Dual-write pattern and data migration
- Gradual read path switching (10% → 25% → 100%)
- **Performance:** 30-40% faster message queries | **Risk:** 🔴 High | **Validation:** Critical

**Why Third:** Most complex phase, benefits from Phase 1-2 foundation, time to understand query patterns

### Key Statistics

| Phase                  | Duration     | Effort          | Deliverables                               |
| ---------------------- | ------------ | --------------- | ------------------------------------------ |
| **Phase 1: Event Bus** | 2 weeks      | 10 dev-days     | Event bus library, 4+ event types          |
| **Phase 2: GraphQL**   | 4 weeks      | 18 dev-days     | Apollo gateway, 3 subgraphs, Apollo Client |
| **Phase 3: Hybrid DB** | 4 weeks      | 15 dev-days     | MongoDB setup, data migration, cutover     |
| **TOTAL**              | **10 weeks** | **43 dev-days** | **Production-ready system**                |

### Implementation Order Rationale

**Why This Exact Sequence (Not Parallel)?**

- ✅ **Event Bus First:** No dependencies, enables foundation for cache coordination in Phase 2
- ✅ **GraphQL Second:** Uses Event Bus for cache invalidation, REST APIs work during migration, clear success metrics
- ✅ **Hybrid DB Last:** Most complex & risky, benefits from 4+ weeks of understanding query patterns, event bus + GraphQL abstract database complexity

**Anti-Patterns Avoided:**

- ❌ Database first: Complex sync without event bus
- ❌ GraphQL first: Cache invalidation nightmare without events
- ❌ All simultaneous: Impossible to debug or rollback

### Expected Deliverables

| Component            | Target Tests | Coverage | Features              |
| -------------------- | ------------ | -------- | --------------------- |
| **Backend Services** | 60+          | >80%     | REST + GraphQL APIs   |
| **Frontend MFEs**    | 150+         | >80%     | 5 microfrontends      |
| **E2E Tests**        | 50+          | 100%     | Critical user flows   |
| **Total**            | **260+**     | **>80%** | **Full-stack system** |

### 📚 Detailed Documentation

- **[CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md](./docs/CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md)** - Full technical roadmap with week-by-week breakdown
- **[EVENT_BUS_IMPLEMENTATION_PLAN.md](./docs/EVENT_BUS_IMPLEMENTATION_PLAN.md)** - Phase 1 detailed guide
- **[GRAPHQL_IMPLEMENTATION_PLAN.md](./docs/GRAPHQL_IMPLEMENTATION_PLAN.md)** - Phase 2 comprehensive strategy (50+ pages)
- **[HYBRID_POSTGRES_MONGODB_ROADMAP.md](./docs/HYBRID_POSTGRES_MONGODB_ROADMAP.md)** - Phase 3 migration plan

## 📚 Documentation

**Product & Planning:**

- [📋 Product Requirements Document (PRD)](./docs/PRODUCT_REQUIREMENTS_DOCUMENT.md) - Complete business requirements, user stories, use cases, success metrics, and product vision
- [🗺️ Technical Implementation Roadmap](./docs/CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md) - Detailed technical implementation guide (3,890+ lines)

**Essential Guides:**

- [📦 Production Deployment Guide](./docs/PRODUCTION_DEPLOYMENT.md) (800+ lines)
- [🧪 E2E Testing Guide](./docs/E2E_TESTING.md) (600+ lines)
- [⚡ Load Testing Guide](./k6/README.md) (200+ lines)
- [📊 Project Summary](./docs/PROJECT_SUMMARY.md) (Complete overview)

**Advanced Topics:**

- [🚀 Advanced MFE Routing Optimizations](./docs/ADVANCED_MFE_ROUTING_OPTIMIZATIONS.md) - Intelligent prefetching, predictive loading, dynamic MFE selection, service worker caching (95% faster navigation)

**Phase Reports:**

- [Phase 3: E2E Testing](./docs/PHASE_3_COMPLETION_REPORT.md)
- [Phase 4: Production Readiness](./docs/PHASE_4_COMPLETION_REPORT.md)

**External Resources:**

- [Nx Documentation](https://nx.dev)
- [Module Federation Guide](https://module-federation.io)
- [Playwright Documentation](https://playwright.dev)
- [k6 Load Testing](https://k6.io/docs)

**Alternative Implementations:**

- [📊 MongoDB Implementation Roadmap](./docs/MONGODB_IMPLEMENTATION_ROADMAP.md) - Adapt this project to use MongoDB + Mongoose instead of PostgreSQL + Prisma
- [🚀 Hybrid PostgreSQL + MongoDB Roadmap](./docs/HYBRID_POSTGRES_MONGODB_ROADMAP.md) - Enterprise-scale architecture with polyglot persistence (PostgreSQL for auth/admin, MongoDB for chat) + Nginx load balancing for 10M+ users

## 🚀 Deployment Platforms

**Supported Deployment Options:**

- ✅ **Docker Compose** - Single-server deployment (recommended)
- ✅ **Kubernetes** - Multi-server clusters with auto-scaling
- ✅ **AWS ECS** - Container orchestration on AWS
- ✅ **GCP Cloud Run** - Serverless containers on Google Cloud
- ✅ **Azure Container Instances** - Containers on Microsoft Azure
- ✅ **Vercel** - Frontend hosting (shell app)
- ✅ **Railway** - Full-stack deployment

See [Production Deployment Guide](./docs/PRODUCTION_DEPLOYMENT.md) for detailed instructions.

## 🔧 Performance Benchmarks

**Normal Load (100 users):**

- Response time: p(95) = 150-250ms ✅
- Error rate: < 0.5% ✅
- Throughput: ~3,000 req/s ✅

**Stress Load (1500 users):**

- Response time: p(95) = 1-2s ⚠️
- Error rate: 1-3% ⚠️
- Recovery: Yes ✅

## 📞 Support

**Documentation:** See [docs/](./docs) folder  
**Issues:** GitHub Issues  
**Security:** Report to security@your-domain.com

## 📄 License

MIT

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready (Authentication Verified November 21, 2025)  
**Last Updated**: November 21, 2025  
**Node Version**: 20.x  
**Nx Version**: 22.0.3
