# AI Chatbot Full-Stack Application - Nx Monorepo

A modern full-stack application built with microservices backend and microfrontend architecture, managed in a unified Nx monorepo.

## Architecture

- **Backend**: 3 microservices (Auth, Chatbot, Admin) built with Node.js, Express, and Prisma
- **Frontend**: Shell app + 4 microfrontends (Auth, Chatbot, Admin, Profile) with Module Federation
- **Shared Libraries**: Type-safe schemas with Zod, shared utilities, and UI components
- **Database**: PostgreSQL 16 + Redis 7
- **Build System**: Nx with intelligent caching and task orchestration

## Monorepo Structure

```
ai-chatbot-fullstack-2026/
├── apps/
│   ├── auth-service/        # Authentication microservice
│   ├── chatbot-service/     # Chatbot microservice
│   ├── admin-service/       # Admin microservice
│   ├── shell/               # Shell app (host for MFEs)
│   ├── auth-mfe/            # Auth microfrontend (port 5174)
│   ├── chatbot-mfe/         # Chatbot microfrontend (port 5175)
│   ├── admin-mfe/           # Admin microfrontend (port 5176)
│   └── profile-mfe/         # Profile microfrontend (port 5177)
├── libs/
│   ├── shared/
│   │   ├── types/           # Zod schemas (API contracts)
│   │   └── utils/           # Common utilities
│   ├── backend/
│   │   ├── logger/          # Logging library
│   │   ├── metrics/         # Metrics library
│   │   ├── security/        # Security utilities
│   │   └── database/        # Database utilities
│   └── frontend/
│       ├── ui-components/   # Shared UI components
│       ├── api-client/      # API client
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

- `npm run test` - Run all tests
- `npm run test:affected` - Run tests for affected projects
- `npm run test:watch` - Run tests in watch mode

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

### Docker

- `npm run docker:up` - Start PostgreSQL and Redis
- `npm run docker:down` - Stop and remove containers
- `npm run docker:logs` - View container logs

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
- Prisma 6.x ORM
- PostgreSQL 16
- Redis 7
- Zod for validation

### Frontend

- React 18
- TypeScript 5.3
- Vite 5.x
- React Router v7
- Zustand v5 (state management)
- TanStack Query v5 (data fetching)
- Tailwind CSS v4
- Module Federation

### Build System

- Nx 22.x
- Intelligent caching
- Affected command detection
- Task orchestration

## Phase 1 Setup Complete

Nx monorepo workspace initialized
All 19 projects generated (3 backend services, 5 frontend apps, 11 shared libraries)  
Shared types library with Zod schemas  
Docker Compose for local services  
Prisma ORM configured  
Module Federation configured  
Tailwind CSS set up  
TypeScript + ESLint configured  
Module boundary enforcement

**Next Steps**:

- [ ] Implement Auth Service endpoints
- [ ] Create UI component library
- [ ] Set up API mocking (MSW)
- [ ] Implement Auth MFE login/register flows
- [ ] Set up CI/CD pipeline

## Documentation

- [Implementation Roadmap](./docs/CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md)
- [Phase 1 Setup Summary](./docs/PHASE-1-SETUP-SUMMARY.md)
- [Quick Reference Guide](./docs/QUICK-REFERENCE.md)
- [Nx Documentation](https://nx.dev)
- [Module Federation Guide](https://module-federation.io)

## Team Collaboration

- **Daily Standups**: 9:00 AM (15 minutes)
- **Weekly Integration Reviews**: Friday 2:00 PM (1 hour)
- **Communication**: Slack channels #fullstack-dev, #api-contracts, #blockers

## License

MIT

---

**Last Updated**: November 15, 2025  
**Nx Version**: 22.0.3  
**Node Version**: 20.x  
**Status**: Phase 1 Foundation Complete
