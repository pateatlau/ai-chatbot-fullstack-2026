# Micro-Frontend Architecture Documentation

**Document Version:** 1.0.0  
**Last Updated:** November 16, 2025  
**Project:** AI Chatbot Fullstack 2026  
**Architecture:** Module Federation with Vite  
**Status:** Active Development  
**Maintained By:** Laldingliana Tlau Vantawl  
**Review Cycle:** Monthly

**Document History:**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Nov 16, 2025 | Laldingliana Tlau Vantawl | Initial comprehensive documentation |
| 0.9.0 | Nov 15, 2025 | Laldingliana Tlau Vantawl | Added i18n and a11y sections |
| 0.8.0 | Nov 14, 2025 | Laldingliana Tlau Vantawl | Initial draft with core architecture |

---

## Table of Contents

1. [Micro-Frontend Overview](#micro-frontend-overview)
2. [Why Module Federation?](#why-module-federation)
3. [Executive Summary](#executive-summary)
4. [System Architecture](#system-architecture)
5. [Tech Stack](#tech-stack)
6. [Application Flow](#application-flow)
7. [Setup & Configuration](#setup--configuration)
8. [State Management](#state-management)
9. [Design System & Component Library](#design-system--component-library)
10. [Shared Libraries & Nx Workspace](#shared-libraries--nx-workspace)
11. [Internationalization & Localization](#internationalization--localization)
12. [Accessibility (A11y)](#accessibility-a11y)
13. [Routing Strategy](#routing-strategy)
14. [Inter-MFE Communication](#inter-mfe-communication)
15. [Security](#security)
16. [Performance](#performance)
17. [CI/CD Pipeline](#cicd-pipeline)
18. [Testing](#testing)
19. [Dockerization](#dockerization)
20. [Observability](#observability)
21. [Analytics](#analytics)
22. [Deployment & Infrastructure](#deployment--infrastructure)
23. [Disaster Recovery & Business Continuity](#disaster-recovery--business-continuity)
24. [API Documentation & Contracts](#api-documentation--contracts)
25. [Architecture Decision Records (ADRs)](#architecture-decision-records-adrs)
26. [Known Issues](#known-issues)
27. [Appendix: Nx Monorepo](#appendix-nx-monorepo)

---

## Micro-Frontend Overview

### What is Micro-Frontend Architecture?

Micro-Frontend Architecture (MFA) extends the concept of microservices to the frontend world. Instead of building a monolithic Single Page Application (SPA), the frontend is decomposed into smaller, semi-independent "micro applications" that work together to form the complete user experience.

#### Traditional Monolithic Frontend

```mermaid
graph TB
    subgraph MonolithicApp["Monolithic React App"]
        subgraph Modules["All Modules in Single Codebase"]
            AuthModule["Auth Module<br/>• Login<br/>• Register<br/>• Profile"]
            ChatModule["Chat Module<br/>• Messages<br/>• Sidebar<br/>• Settings"]
            AdminModule["Admin Module<br/>• Users<br/>• Audit<br/>• Analytics"]
        end
    end

    style MonolithicApp fill:#ffebee,stroke:#c62828,stroke-width:3px
    style Modules fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style AuthModule fill:#e3f2fd,stroke:#1976d2
    style ChatModule fill:#e3f2fd,stroke:#1976d2
    style AdminModule fill:#e3f2fd,stroke:#1976d2
```

**Problems with Monolithic Architecture:**

- All teams work in same codebase
- Deploy entire app for small changes
- Merge conflicts and coordination overhead
- Technology lock-in (stuck with same version)
- Slow builds as codebase grows

#### Micro-Frontend Architecture

```mermaid
graph TB
    subgraph ShellApp["Shell App"]
        subgraph MFEs["Independent Micro-Frontends"]
            AuthMFE["Auth MFE<br/>Team A<br/>• Login<br/>• Register<br/>• Profile"]
            ChatMFE["Chat MFE<br/>Team B<br/>• Messages<br/>• Sidebar<br/>• Settings"]
            AdminMFE["Admin MFE<br/>Team C<br/>• Users<br/>• Audit<br/>• Analytics"]
        end
    end

    style ShellApp fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
    style MFEs fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style AuthMFE fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style ChatMFE fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style AdminMFE fill:#fce4ec,stroke:#c2185b,stroke-width:2px
```

**Benefits of Micro-Frontend Architecture:**

- Independent development and deployment
- Team autonomy (own repo, CI/CD, releases)
- Technology diversity (different versions OK)
- Parallel development (no merge conflicts)
- Faster builds (only build what changed)

### Core Principles of Micro-Frontends

#### 1. Independent Development

Each MFE is developed by a separate team with its own:

- **Repository** (or monorepo workspace)
- **Build pipeline** (CI/CD)
- **Release cycle** (deploy anytime)
- **Technology stack** (React 18 vs React 19, different state management)

```typescript
// Auth MFE can use React 18
import React from 'react'; // 18.2.0

// Chatbot MFE can use React 19
import React from 'react'; // 19.0.0

// Both work together via Module Federation
```

#### 2. Independent Deployment

Deploy MFEs without redeploying the shell or other MFEs:

```bash
# Deploy only Auth MFE
cd apps/auth-mfe
npm run build
aws s3 sync dist/ s3://cdn.myapp.com/auth-mfe/v1.2.3/

# Shell automatically picks up new version
# No downtime, no coordination needed
```

#### 3. Technology Agnostic

While our project uses React for all MFEs, Module Federation supports mixing:

- React + Vue + Angular in same application
- Different versions of same framework
- Different state management libraries
- Different UI component libraries

#### 4. Isolated Scope

Each MFE has its own:

```typescript
// CSS Modules prevent style conflicts
// auth-mfe/Button.module.css
.button { background: blue; }

// chatbot-mfe/Button.module.css
.button { background: green; } // No conflict!

// JavaScript scope isolation
// Each MFE has its own bundle
// Variables don't leak between MFEs
```

### Common Micro-Frontend Patterns

#### 1. Build-Time Integration (Not Used Here)

MFEs are compiled into the shell at build time:

```json
// package.json
{
  "dependencies": {
    "@myapp/auth-mfe": "1.2.3",
    "@myapp/chat-mfe": "2.0.1"
  }
}
```

**Pros:** Simple, type-safe  
**Cons:** Must redeploy shell for MFE updates, no true independence

#### 2. Runtime Integration via iframes (Not Used Here)

Each MFE loads in an iframe:

```html
<iframe src="https://auth.myapp.com" /> <iframe src="https://chat.myapp.com" />
```

**Pros:** Complete isolation, easy to implement  
**Cons:** Poor UX (no shared state), performance overhead, routing complexity

#### 3. Runtime Integration via Web Components (Not Used Here)

MFEs expose custom elements:

```html
<auth-login></auth-login> <chat-widget></chat-widget>
```

**Pros:** Framework agnostic, true encapsulation  
**Cons:** Limited React integration, bundle size overhead

#### 4. Runtime Integration via Module Federation (Our Choice)

MFEs are loaded dynamically at runtime:

```typescript
// Shell dynamically imports MFE
const AuthMFE = lazy(() => import('authMfe/Module'));

// Module Federation fetches code at runtime
// No iframes, shared dependencies, optimal performance
```

**Pros:** Best performance, shared dependencies, React-native, flexible  
**Cons:** Requires Module Federation setup, more complex than build-time

### Benefits of Micro-Frontends

| Benefit                    | Description                                   | Impact                      |
| -------------------------- | --------------------------------------------- | --------------------------- |
| **Team Autonomy**          | Teams work independently without coordination | Faster feature delivery     |
| **Incremental Upgrades**   | Upgrade React version in one MFE at a time    | Reduced migration risk      |
| **Fault Isolation**        | Bug in Chat MFE does not crash Auth MFE       | Better reliability          |
| **Optimized Delivery**     | Load only the MFEs user needs                 | Faster initial load         |
| **Parallel Development**   | Multiple teams work simultaneously            | Higher throughput           |
| **Technology Flexibility** | Use best tool for each feature                | Better developer experience |
| **Easier Testing**         | Test MFEs in isolation                        | Faster test execution       |
| **Clear Boundaries**       | Business domains map to MFEs                  | Better architecture         |

### Challenges of Micro-Frontends

| Challenge                | Mitigation Strategy                                        |
| ------------------------ | ---------------------------------------------------------- |
| **Increased Complexity** | Use Module Federation tooling, comprehensive documentation |
| **Shared Dependencies**  | Singleton pattern for React, careful version management    |
| **State Management**     | Centralized Zustand stores, event-based communication      |
| **Consistent UX**        | Shared component library, design system                    |
| **Performance Overhead** | Lazy loading, shared chunks, bundle optimization           |
| **Debugging Difficulty** | Source maps, error boundaries per MFE, monitoring          |
| **Governance**           | Shared types, ESLint rules, architecture decision records  |

### When to Use Micro-Frontends?

#### Good Fit

- Large applications with multiple teams (3+ teams)
- Different release cycles per feature area
- Long-term projects with evolving requirements
- Need to incrementally migrate legacy apps
- Enterprise applications with complex business domains

#### Not Recommended

- Small applications (1-2 developers)
- Simple CRUD apps with few features
- Short-term projects (< 6 months)
- Tight coupling between features
- Performance-critical applications (microseconds matter)

### Micro-Frontend Success Stories

- **Spotify** - 100+ autonomous squads building features independently
- **Zalando** - Fashion e-commerce with 200+ teams using MFEs
- **IKEA** - Global e-commerce platform with localized MFEs
- **SAP** - Enterprise software with modular UI components
- **American Express** - Banking application with team-owned features

---

## Why Module Federation?

### What is Module Federation?

Module Federation is a Webpack 5 feature (now also available in Vite via `@module-federation/vite`) that enables **JavaScript applications to dynamically load code from other independently deployed applications at runtime**.

Think of it as "microservices for the frontend" but with shared dependencies and no iframes.

### How Module Federation Works

#### Traditional Bundle

```mermaid
graph TB
    subgraph Monolith["monolith.js (2 MB)"]
        React["React (100 KB)"]
        AuthCode["Auth code (200 KB)"]
        ChatCode["Chat code (400 KB)"]
        AdminCode["Admin code (300 KB)"]
        ProfileCode["Profile code (150 KB)"]
        AllDeps["All dependencies"]
    end

    User["User"] -->|Downloads entire 2 MB| Monolith

    style Monolith fill:#ffebee,stroke:#c62828,stroke-width:2px
    style User fill:#e3f2fd,stroke:#1976d2
    style React fill:#ffe0b2
    style AuthCode fill:#ffe0b2
    style ChatCode fill:#ffe0b2
    style AdminCode fill:#ffe0b2
    style ProfileCode fill:#ffe0b2
    style AllDeps fill:#ffe0b2
```

**Problem:** User downloads entire 2 MB even if they only use Auth

#### Module Federation

```mermaid
graph LR
    subgraph Initial["Initial Load"]
        Shell["shell.js<br/>(200 KB)"]
        React["React (100 KB)<br/>(shared, loaded once)"]
    end

    subgraph LazyLoad["Lazy Loaded MFEs"]
        AuthMFE["auth-mfe.js<br/>(150 KB)"]
        ChatMFE["chat-mfe.js<br/>(350 KB)"]
    end

    Shell -->|Loads| React
    Shell -.->|Dynamically loads| AuthMFE
    Shell -.->|Dynamically loads| ChatMFE
    AuthMFE -.->|Reuses| React
    ChatMFE -.->|Reuses| React

    style Initial fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style LazyLoad fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Shell fill:#fff3e0,stroke:#f57c00
    style React fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style AuthMFE fill:#bbdefb,stroke:#1976d2
    style ChatMFE fill:#bbdefb,stroke:#1976d2
```

**Optimization:**

- User downloads: shell (200 KB) + React (100 KB) + auth (150 KB) = **450 KB**
- When navigating to chat, only adds 350 KB more
- **Total: 800 KB vs 2 MB monolith (60% savings)**

### Module Federation Architecture

```typescript
// Host (Shell) Configuration
// apps/shell/vite.config.ts
federation({
  name: 'shell',
  remotes: {
    authMfe: 'http://localhost:5174/remoteEntry.js',
    chatbotMfe: 'http://localhost:5175/remoteEntry.js',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});

// Remote (Auth MFE) Configuration
// apps/auth-mfe/vite.config.ts
federation({
  name: 'authMfe',
  filename: 'remoteEntry.js',
  exposes: {
    './Module': './src/app/app.tsx', // Expose this component
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
```

**Runtime Flow:**

1. User visits `http://localhost:5173` (shell)
2. Shell loads and downloads `shell.js`
3. User navigates to `/login`
4. Shell requests `http://localhost:5174/remoteEntry.js`
5. `remoteEntry.js` provides manifest of exposed modules
6. Shell imports `authMfe/Module`
7. Module Federation loads `auth-mfe/app.tsx`
8. React is shared (singleton), so Auth MFE reuses shell's React
9. Auth MFE renders in shell

### Why We Chose Module Federation Over Alternatives

#### Comparison Matrix

| Feature                     | Module Federation | Build-Time | iframes | Web Components |
| --------------------------- | ----------------- | ---------- | ------- | -------------- |
| **Runtime Loading**         | Yes               | No         | Yes     | Yes            |
| **Shared Dependencies**     | Yes               | Yes        | No      | Limited        |
| **No Page Reload**          | Yes               | Yes        | No      | Yes            |
| **Framework Integration**   | Excellent         | Excellent  | Poor    | Good           |
| **TypeScript Support**      | Good              | Excellent  | N/A     | Limited        |
| **Performance**             | Excellent         | Excellent  | Poor    | Good           |
| **State Sharing**           | Easy              | Easy       | Hard    | Medium         |
| **Deployment Independence** | Yes               | No         | Yes     | Yes            |
| **Learning Curve**          | Medium            | Low        | Low     | Medium         |
| **Bundle Size**             | Optimal           | Large      | N/A     | Large          |

#### Detailed Comparison

**1. Module Federation vs Build-Time Integration**

```typescript
// Build-Time (npm packages)
// Must redeploy shell for any MFE update
import { AuthModule } from '@myapp/auth-mfe'; // Version 1.2.3 locked at build time

// Module Federation
// MFE updates deploy independently
const AuthModule = lazy(() => import('authMfe/Module')); // Always latest version
```

**Winner:** Module Federation (true independence)

**2. Module Federation vs iframes**

```html
<!-- iframes: Separate contexts, cannot share state -->
<iframe src="https://auth.myapp.com">
  <!-- Auth has its own React, own state, own styles -->
  <!-- Cannot access parent window easily -->
  <!-- User object must be passed via postMessage -->
</iframe>

<!-- Module Federation: Same context, shared state -->
<AuthModule />
<!-- Uses same React, shares Zustand store -->
```

**Winner:** Module Federation (better UX and DX)

**3. Module Federation vs Web Components**

```typescript
// Web Components: Browser-native, but verbose React integration
customElements.define('auth-login', class extends HTMLElement {
  connectedCallback() {
    const root = ReactDOM.createRoot(this);
    root.render(<LoginForm />); // Awkward React integration
  }
});

// Module Federation: Native React
const AuthModule = lazy(() => import('authMfe/Module'));
// Just works, full React features
```

**Winner:** Module Federation (React-first design)

### Key Advantages of Module Federation

#### 1. Optimal Bundle Size

```typescript
// Shared dependencies loaded once
shared: {
  react: { singleton: true },        // 100 KB loaded once
  'react-dom': { singleton: true },  // 120 KB loaded once
  zustand: { singleton: true },      // 5 KB loaded once
}

// Without sharing: 225 KB × 5 apps = 1,125 KB
// With sharing: 225 KB × 1 = 225 KB
// Savings: 900 KB (80%)
```

#### 2. Version Management

```typescript
// Shell uses React 19
shared: {
  react: {
    singleton: true,
    requiredVersion: '^19.0.0',
  },
}

// Auth MFE uses React 18 (compatible)
shared: {
  react: {
    singleton: true,
    requiredVersion: '^18.0.0', // Falls back to ^19 from shell
  },
}

// Module Federation resolves to single React 19 instance
// Warns if versions incompatible
```

#### 3. Type Safety (with TypeScript)

```typescript
// Generate type definitions for exposed modules
// apps/auth-mfe/src/app/app.tsx
export interface AuthModuleProps {
  redirectUrl?: string;
}

export default function App({ redirectUrl }: AuthModuleProps) {
  return <Login redirectUrl={redirectUrl} />;
}

// Shell gets type hints
const AuthModule = lazy(() => import('authMfe/Module'));
<AuthModule redirectUrl="/dashboard" /> // TypeScript validates prop
```

#### 4. Lazy Loading Built-In

```typescript
// MFE only loads when route is accessed
const routes = [
  {
    path: '/login',
    element: (
      <Suspense fallback={<Spinner />}>
        <AuthModule /> {/* Loads on-demand */}
      </Suspense>
    ),
  },
];

// User on homepage: Only shell loads
// User clicks "Login": Auth MFE loads
// Result: Faster initial page load
```

#### 5. Hot Module Replacement (HMR)

```bash
# Edit auth-mfe/LoginForm.tsx
# Shell automatically reloads Auth MFE
# No manual refresh needed (in most cases)
```

### Module Federation with Vite

We use `@module-federation/vite` instead of Webpack for:

| Benefit            | Description                                   |
| ------------------ | --------------------------------------------- |
| **Faster Builds**  | Vite builds 10x faster than Webpack (ESBuild) |
| **Instant HMR**    | Hot module replacement in < 50ms              |
| **Modern ESM**     | Native ES modules, no legacy transpilation    |
| **Better DX**      | Simpler config, less boilerplate              |
| **Nx Integration** | Works seamlessly with Nx monorepo             |

```typescript
// Vite + Module Federation = Best of both worlds
import federation from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      // Module Federation config
    }),
  ],
  build: {
    target: 'esnext', // Modern browsers only
    minify: 'esbuild', // Fast minification
  },
});
```

### Module Federation Best Practices (Implemented)

1. **Singleton Pattern for Core Libraries**

   ```typescript
   shared: {
     react: { singleton: true }, // Prevent duplicate React
   }
   ```

2. **Eager vs Lazy Sharing**

   ```typescript
   shared: {
     react: { eager: false }, // Load on-demand (better initial load)
     zustand: { eager: true }, // Load immediately (needed by shell)
   }
   ```

3. **Version Constraints**

   ```typescript
   shared: {
     react: {
       singleton: true,
       requiredVersion: '^19.0.0', // Enforce compatibility
       strictVersion: false, // Allow minor version differences
     },
   }
   ```

4. **Expose Minimal Surface**

   ```typescript
   exposes: {
     './Module': './src/app/app.tsx', // Only expose entry point
     // Don't expose internal components
   }
   ```

5. **Error Boundaries**
   ```typescript
   <ErrorBoundary fallback={<ErrorPage />}>
     <Suspense fallback={<Spinner />}>
       <AuthModule /> {/* Isolated failures */}
     </Suspense>
   </ErrorBoundary>
   ```

### Real-World Production Considerations

#### 1. CDN Deployment

```typescript
// Production: MFEs deployed to CDN
remotes: {
  authMfe: 'https://cdn.myapp.com/auth-mfe/v1.2.3/remoteEntry.js',
  chatbotMfe: 'https://cdn.myapp.com/chatbot-mfe/v2.0.1/remoteEntry.js',
}

// Version pinning ensures stability
// Update shell config to upgrade MFE version
```

#### 2. Fallback Strategy

```typescript
// If Auth MFE fails to load, show fallback
<ErrorBoundary
  fallback={<div>Auth service temporarily unavailable</div>}
>
  <Suspense fallback={<Spinner />}>
    <AuthModule />
  </Suspense>
</ErrorBoundary>
```

#### 3. Monitoring

```typescript
// Track MFE load failures
import * as Sentry from '@sentry/react';

try {
  await import('authMfe/Module');
} catch (error) {
  Sentry.captureException(error, {
    tags: { mfe: 'auth' },
  });
}
```

---

## Executive Summary

### Business Context

The AI Chatbot Fullstack 2026 project delivers an enterprise-grade conversational AI platform designed for scalability, team autonomy, and rapid feature delivery. By implementing a micro-frontend architecture, the system enables multiple development teams to work independently while maintaining a cohesive user experience.

**Project Objectives:**

- Enable 3-5 autonomous development teams to work in parallel
- Support independent feature deployment without system-wide releases
- Provide enterprise-scale AI chat capabilities with OpenAI integration
- Maintain 99.9% uptime with zero-downtime deployment capability
- Support 10,000+ concurrent users with sub-200ms response times

### Technical Overview

This project implements a **Micro-Frontend (MFE)** architecture using **Module Federation** with Vite to enable independent development, deployment, and scaling of frontend features. The architecture consists of:

- **1 Shell Application** (Host) - Orchestrates all MFEs and provides global layout
- **4 Remote MFEs** - Auth, Chatbot, Admin, Profile (independently deployable)
- **3 Backend Microservices** - Auth, Chatbot, Admin (independently scalable)
- **Shared State Management** - Zustand stores shared across all MFEs
- **Shared Component Library** - UI components, hooks, and utilities (11 packages)
- **Path-Based Routing** - Shell controls navigation, MFEs render based on path

### Key Metrics

| Metric                | Target                 | Status                |
| --------------------- | ---------------------- | --------------------- |
| Team Velocity         | 40 story points/sprint | Active Development    |
| Deployment Frequency  | 10+ deploys/day        | Infrastructure Ready  |
| Mean Time to Recovery | < 15 minutes           | Monitoring Configured |
| Test Coverage         | > 80%                  | In Progress           |
| Lighthouse Score      | > 90                   | Target Set            |
| P95 Response Time     | < 200ms                | Architecture Supports |

### Key Architectural Decisions

| Decision                           | Rationale                                                  |
| ---------------------------------- | ---------------------------------------------------------- |
| **Module Federation**              | Enables runtime code sharing and lazy loading of MFEs      |
| **Vite as Build Tool**             | Fast HMR, modern ESM support, better DX than Webpack       |
| **Zustand for State**              | Lightweight, no Provider nesting, localStorage persistence |
| **Path-Based Routing**             | MFEs read `location.pathname` to determine what to render  |
| **window.location for Navigation** | Ensures reliable navigation across federated boundaries    |
| **Singleton React/ReactDOM**       | Prevents multiple React instances causing hydration issues |

---

## System Architecture

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Browser["Browser (Port 5173)"]
        subgraph Shell["Shell Application (Host)"]
            Router["React Router<br/>• Global Layout<br/>• Route Guards<br/>• Lazy Load MFEs"]
        end

        subgraph MFEs["Micro-Frontends"]
            AuthMFE["Auth MFE<br/>Port 5174<br/>• Login<br/>• Register"]
            ChatbotMFE["Chatbot MFE<br/>Port 5175<br/>• Chat UI<br/>• Messages<br/>• Sidebar"]
            AdminMFE["Admin MFE<br/>Port 5176<br/>• Users<br/>• Analytics<br/>• Audit"]
            ProfileMFE["Profile MFE<br/>Port 5177<br/>• View<br/>• Edit<br/>• Settings"]
        end

        subgraph SharedLibs["Shared Libraries (Nx Workspace)"]
            Stores["Stores<br/>(Zustand)<br/>• Auth<br/>• Toast"]
            UIComponents["UI Components<br/>• Button<br/>• Input<br/>• Card"]
            APIClient["API Client<br/>• axios config<br/>• interceptors"]
            Hooks["Hooks<br/>• useAuth<br/>• useToast"]
            Utils["Utils<br/>• formatDate<br/>• debounce"]
            Types["Types (Zod)<br/>• User schema<br/>• Auth schema"]
        end

        Router --> AuthMFE
        Router --> ChatbotMFE
        Router --> AdminMFE
        Router --> ProfileMFE

        AuthMFE -.-> Stores
        AuthMFE -.-> UIComponents
        ChatbotMFE -.-> Stores
        ChatbotMFE -.-> UIComponents
        AdminMFE -.-> Stores
        ProfileMFE -.-> Stores

        Stores -.-> Types
        APIClient -.-> Types
    end

    subgraph Backend["Backend Microservices"]
        AuthService["Auth Service<br/>Port 3000"]
        ChatbotService["Chatbot Service<br/>Port 3001"]
        AdminService["Admin Service<br/>Port 3002"]

        subgraph DataLayer["Data Layer"]
            PostgreSQL["PostgreSQL<br/>Port 5432"]
            Redis["Redis<br/>Port 6379"]
        end

        AuthService --> PostgreSQL
        ChatbotService --> PostgreSQL
        AdminService --> PostgreSQL

        AuthService --> Redis
        ChatbotService --> Redis
    end

    APIClient -->|HTTP/REST| AuthService
    APIClient -->|HTTP/REST| ChatbotService
    APIClient -->|HTTP/REST| AdminService

    style Shell fill:#e3f2fd
    style SharedLibs fill:#f3e5f5
    style Backend fill:#fff3e0
    style DataLayer fill:#e8f5e9
    style AuthMFE fill:#bbdefb
    style ChatbotMFE fill:#bbdefb
    style AdminMFE fill:#bbdefb
    style ProfileMFE fill:#bbdefb
```

### Module Federation Runtime Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Shell
    participant Router as React Router
    participant AuthMFE as Auth MFE
    participant ChatMFE as Chatbot MFE
    participant AuthStore as Zustand Store
    participant Backend as Backend API

    Note over User,Backend: Scenario 1: Login Flow
    User->>Browser: Navigate to /login
    Browser->>Shell: Load shell.js
    Shell->>Router: Match route /login
    Router->>AuthMFE: Lazy load import('authMfe/Module')
    AuthMFE->>Browser: Fetch http://localhost:5174/remoteEntry.js
    Browser->>AuthMFE: Return module manifest
    AuthMFE->>AuthMFE: Read location.pathname === '/login'
    AuthMFE->>User: Render Login form

    Note over User,Backend: Scenario 2: Authentication
    User->>AuthMFE: Submit login form
    AuthMFE->>Backend: authService.login()
    Backend->>AuthMFE: Return tokens + user data
    AuthMFE->>AuthStore: setAuth() update state
    AuthMFE->>Browser: window.location.replace('/dashboard')
    Browser->>Shell: Remount, check Protected route
    Shell->>User: Render Dashboard

    Note over User,Backend: Scenario 3: Navigation to Chat
    User->>Shell: Click "Chat" in navbar
    Shell->>Router: Navigate to /chatbot
    Router->>ChatMFE: Lazy load import('chatbotMfe/Module')
    ChatMFE->>Browser: Fetch http://localhost:5175/remoteEntry.js
    Browser->>ChatMFE: Return module manifest
    ChatMFE->>User: Render Chat interface
```

---

## Tech Stack

### Core Technologies with Versions

| Technology                  | Version | Purpose                                  |
| --------------------------- | ------- | ---------------------------------------- |
| **React**                   | 19.0.0  | UI framework (singleton across all MFEs) |
| **React DOM**               | 19.0.0  | React rendering (singleton)              |
| **React Router DOM**        | 7.9.6   | Client-side routing (singleton)          |
| **TypeScript**              | 5.9.3   | Type safety                              |
| **Vite**                    | 7.0.0   | Build tool and dev server                |
| **@module-federation/vite** | 1.9.0   | Module Federation implementation         |
| **Nx**                      | 22.0.3  | Monorepo orchestration                   |
| **Zustand**                 | 5.0.8   | State management                         |
| **TanStack Query**          | 5.90.9  | Server state management                  |
| **Zod**                     | 4.1.12  | Schema validation                        |
| **Tailwind CSS**            | 4.1.17  | Styling                                  |
| **React Hook Form**         | 7.66.0  | Form handling                            |
| **Axios**                   | 1.13.2  | HTTP client                              |

### Development Tools

| Tool          | Version | Purpose         |
| ------------- | ------- | --------------- |
| **@nx/react** | 22.0.3  | Nx React plugin |
| **@nx/vite**  | 22.0.3  | Nx Vite plugin  |
| **Vitest**    | 4.0.9   | Unit testing    |
| **Cypress**   | 14.2.1  | E2E testing     |
| **ESLint**    | 9.39.1  | Linting         |
| **Prettier**  | 3.6.2   | Code formatting |
| **MSW**       | 2.12.2  | API mocking     |

### Port Allocation

| Application     | Port | URL                   |
| --------------- | ---- | --------------------- |
| Shell (Host)    | 5173 | http://localhost:5173 |
| Auth MFE        | 5174 | http://localhost:5174 |
| Chatbot MFE     | 5175 | http://localhost:5175 |
| Admin MFE       | 5176 | http://localhost:5176 |
| Profile MFE     | 5177 | http://localhost:5177 |
| Auth Service    | 3000 | http://localhost:3000 |
| Chatbot Service | 3001 | http://localhost:3001 |
| Admin Service   | 3002 | http://localhost:3002 |

---

## Application Flow

### User Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Shell
    participant AuthMFE
    participant AuthStore
    participant AuthService
    participant Backend

    User->>Shell: Navigate to /login
    Shell->>AuthMFE: Lazy load Auth MFE
    AuthMFE->>User: Display Login Form
    User->>AuthMFE: Submit credentials
    AuthMFE->>Backend: POST /auth/login
    Backend-->>AuthMFE: {user, accessToken, refreshToken}
    AuthMFE->>AuthStore: setAuth(user, tokens)
    AuthStore-->>AuthStore: Persist to localStorage
    AuthMFE->>User: window.location.replace('/dashboard')
    User->>Shell: Navigate to /dashboard
    Shell->>AuthStore: Check isAuthenticated
    AuthStore-->>Shell: true
    Shell->>User: Render Dashboard
```

### Protected Route Flow

```mermaid
flowchart TD
    A[User navigates to protected route] --> B{Shell: ProtectedRoute}
    B -->|isLoading| C[Show Loading Spinner]
    B -->|!isAuthenticated| D[Redirect to /login]
    B -->|isAuthenticated| E{Check role requirement}
    E -->|No role required| F[Render MFE]
    E -->|Admin required| G{user.role === 'ADMIN'?}
    G -->|Yes| F
    G -->|No| H[Redirect to /dashboard with error]
```

### MFE Loading Flow

```mermaid
flowchart LR
    A[Shell Route Matched] --> B[Lazy Import MFE]
    B --> C{MFE Loaded?}
    C -->|No| D[Fetch remoteEntry.js]
    D --> E[Download Module Code]
    E --> F[Execute Module]
    C -->|Yes - Cached| F
    F --> G[MFE Reads location.pathname]
    G --> H{Path Matches?}
    H -->|/profile/edit| I[Render EditProfilePage]
    H -->|/profile/settings| J[Render SettingsPage]
    H -->|/profile| K[Render ProfilePage]
```

### State Synchronization Flow

```mermaid
sequenceDiagram
    participant User
    participant ShellNavbar
    participant AuthStore
    participant ProfileMFE
    participant AdminMFE

    Note over AuthStore: State persisted in localStorage
    User->>ShellNavbar: Click Profile
    ShellNavbar->>AuthStore: const {user} = useAuthStore()
    AuthStore-->>ShellNavbar: {id, name, email, role}
    ShellNavbar->>ProfileMFE: Navigate to /profile
    ProfileMFE->>AuthStore: const {user} = useAuthStore()
    AuthStore-->>ProfileMFE: Same user object
    ProfileMFE-->>User: Display user profile

    Note over AuthStore: All MFEs share same Zustand instance

    User->>ProfileMFE: Update name
    ProfileMFE->>AuthStore: setUser({...user, name: 'New'})
    AuthStore-->>ShellNavbar: Re-render with new name
    ShellNavbar-->>User: Navbar shows updated name
```

---

## Setup & Configuration

### 1. Module Federation Configuration

#### Shell (Host) Configuration

**File:** `apps/shell/vite.config.ts`

```typescript
import { federation } from '@module-federation/vite';

export default defineConfig(() => ({
  server: {
    port: 5173,
    host: 'localhost',
  },
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        authMfe: {
          type: 'module',
          name: 'authMfe',
          entry: 'http://localhost:5174/remoteEntry.js',
          entryGlobalName: 'authMfe',
          shareScope: 'default',
        },
        chatbotMfe: {
          type: 'module',
          name: 'chatbotMfe',
          entry: 'http://localhost:5175/remoteEntry.js',
          entryGlobalName: 'chatbotMfe',
          shareScope: 'default',
        },
        adminMfe: {
          type: 'module',
          name: 'adminMfe',
          entry: 'http://localhost:5176/remoteEntry.js',
          entryGlobalName: 'adminMfe',
          shareScope: 'default',
        },
        profileMfe: {
          type: 'module',
          name: 'profileMfe',
          entry: 'http://localhost:5177/remoteEntry.js',
          entryGlobalName: 'profileMfe',
          shareScope: 'default',
        },
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        'react-router-dom': { singleton: true },
        zustand: {},
        '@tanstack/react-query': {},
        zod: {},
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
}));
```

**Key Configuration Points:**

- **`name`**: Identifier for the shell host
- **`remotes`**: Map of remote MFE names to their URLs
- **`shared`**: Dependencies shared between host and remotes
- **`singleton: true`**: Ensures only ONE instance of React/ReactDOM
- **`requiredVersion`**: Prevents version conflicts
- **`target: 'esnext'`**: Modern browsers only (faster builds)

#### Remote MFE Configuration

**File:** `apps/auth-mfe/vite.config.ts` (similar for all remotes)

```typescript
import { federation } from '@module-federation/vite';

export default defineConfig(() => ({
  server: {
    port: 5174, // Unique port for each MFE
    host: 'localhost',
  },
  plugins: [
    react(),
    federation({
      name: 'authMfe',
      filename: 'remoteEntry.js',
      manifest: true,
      exposes: {
        './Module': './src/app/app.tsx', // Entry point
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        'react-router-dom': { singleton: true },
        zustand: {},
        '@tanstack/react-query': {},
        zod: {},
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
}));
```

**Key Configuration Points:**

- **`exposes`**: Modules exposed to the shell
- **`filename`**: Name of the remote entry file
- **`manifest: true`**: Generates manifest for better debugging
- **Same `shared` config**: Must match shell's shared config

### 2. TypeScript Configuration

**File:** `tsconfig.base.json` (Nx monorepo root)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@myapp/shared/types": ["libs/shared/types/src/index.ts"],
      "@myapp/frontend/ui-components": [
        "libs/frontend/ui-components/src/index.ts"
      ],
      "@myapp/frontend/stores": ["libs/frontend/stores/src/index.ts"],
      "@myapp/frontend/hooks": ["libs/frontend/hooks/src/index.ts"],
      "@myapp/frontend/utils": ["libs/frontend/utils/src/index.ts"],
      "@myapp/frontend/api-client": ["libs/frontend/api-client/src/index.ts"]
    }
  }
}
```

### 3. Development Workflow

#### Starting All Applications

```bash
# Option 1: Start all MFEs + Shell in parallel (recommended for development)
npm run dev:frontend

# Option 2: Manual startup (better for debugging)
# Terminal 1: Start Auth MFE
npm run dev:auth-mfe

# Terminal 2: Start Chatbot MFE
npm run dev:chatbot-mfe

# Terminal 3: Start Admin MFE
npm run dev:admin-mfe

# Terminal 4: Start Profile MFE
npm run dev:profile-mfe

# Terminal 5: Start Shell (MUST start AFTER all MFEs are ready)
npm run dev:shell
```

**Important Development Notes:**

- Always start remote MFEs before the shell for optimal development experience
- The shell will not crash if MFEs are not running; Module Federation will display a console error and the Suspense fallback will remain visible
- In production, all remotes must be available for the application to function properly
- Use `npm run dev:frontend:manual` to see the correct startup sequence with instructions

#### Starting Backend Services

```bash
# Start PostgreSQL and Redis
npm run docker:up

# Start all backend services
npm run dev:backend

# Or start individually
npm run dev:auth      # Port 3000
npm run dev:chatbot   # Port 3001
npm run dev:admin     # Port 3002
```

#### Build Commands

```bash
# Build all applications
npm run build

# Build affected applications only (based on git changes)
npm run build:affected

# Build specific application
nx build shell
nx build auth-mfe
```

---

## State Management

### Architecture Overview

```mermaid
graph TB
    subgraph Layer1[" "]
        L1Title["Layer 1: Global State (Zustand) - Shared across ALL MFEs"]

        subgraph AuthStore["Auth Store<br/>Persisted: localStorage"]
            AuthData["<div style='text-align: left'>• user<br/>• accessToken<br/>• refreshToken<br/>• isAuthenticated<br/>• setAuth&#40;&#41;<br/>• clearAuth&#40;&#41;</div>"]
        end

        subgraph ToastStore["Toast Store<br/>Ephemeral: memory"]
            ToastData["<div style='text-align: left'>• toasts[]<br/>• addToast&#40;&#41;<br/>• removeToast&#40;&#41;</div>"]
        end

        L1Title -.-> AuthStore
        L1Title -.-> ToastStore
    end

    subgraph Layer2[" "]
        L2Title["Layer 2: Server State (TanStack Query) - Per MFE"]

        QueryProvider["<div style='text-align: left'>React Query Provider (in Shell)<br/>• Query Cache (5 min stale time)<br/>• Mutation Queue<br/>• Automatic refetching<br/>• Optimistic updates</div>"]

        subgraph ChatbotQueries["Chatbot MFE Queries"]
            ChatQueries["<div style='text-align: left'>• useQuery(['conversations'])<br/>• useQuery(['messages'])<br/>• useMutation(['sendMsg'])</div>"]
        end

        subgraph ProfileQueries["Profile MFE Queries"]
            ProfileQ["<div style='text-align: left'>• useQuery(['profile'])<br/>• useMutation(['updateUser'])</div>"]
        end

        subgraph AdminQueries["Admin MFE Queries"]
            AdminQ["<div style='text-align: left'>• useQuery(['users'])<br/>• useMutation(['updateRole'])</div>"]
        end

        L2Title -.-> QueryProvider
        QueryProvider --> ChatbotQueries
        QueryProvider --> ProfileQueries
        QueryProvider --> AdminQueries
    end

    subgraph Layer3[" "]
        L3Title["Layer 3: Local State (React useState) - Component-level"]

        LocalState["<div style='text-align: left'>• Form inputs (controlled)<br/>• UI state (modals, dropdowns)<br/>• Temporary validation errors<br/>• Loading indicators</div>"]

        L3Title -.-> LocalState
    end

    Layer1 -.->|"Global state accessed by all MFEs"| Layer2
    Layer2 -.->|"Server data cached per MFE"| Layer3

    style Layer1 fill:#e3f2fd
    style Layer2 fill:#f3e5f5
    style Layer3 fill:#fff3e0
    style L1Title fill:#e3f2fd,stroke:#e3f2fd,color:#000
    style L2Title fill:#f3e5f5,stroke:#f3e5f5,color:#000
    style L3Title fill:#fff3e0,stroke:#fff3e0,color:#000
    style AuthStore fill:#bbdefb
    style ToastStore fill:#bbdefb
    style QueryProvider fill:#ce93d8
    style ChatbotQueries fill:#e1bee7
    style ProfileQueries fill:#e1bee7
    style AdminQueries fill:#e1bee7
    style LocalState fill:#ffe0b2
```

### Zustand Store Implementation

#### Auth Store (`libs/frontend/stores/src/lib/auth.store.ts`)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        // isLoading NOT persisted (always false on page load)
      }),
    }
  )
);
```

**Key Features:**

- **Singleton Store**: All MFEs import the SAME store instance
- **Persistent**: Auth state survives page refreshes (localStorage)
- **Selective Persistence**: `partialize` excludes transient state (isLoading)
- **Type-Safe**: Full TypeScript support

### Usage Across MFEs

#### In Auth MFE (Login)

```typescript
import { useAuthStore } from '@myapp/frontend/stores';

export function Login() {
  const { setAuth } = useAuthStore();

  const onSubmit = async (data: LoginFormData) => {
    const response = await authService.login(data);
    // Update shared store - ALL MFEs will see this
    setAuth(response.user, response.accessToken, response.refreshToken);
    window.location.replace('/dashboard');
  };
}
```

#### In Shell (Protected Route)

```typescript
import { useAuthStore } from '@myapp/frontend/stores';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
}
```

#### In Profile MFE

```typescript
import { useAuthStore } from '@myapp/frontend/stores';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const updateProfile = async (newData) => {
    await api.patch(`/users/${user.id}`, newData);
    // Update store - navbar will re-render with new name
    setUser({ ...user, ...newData });
  };
}
```

### TanStack Query Setup

**File:** `apps/shell/src/providers/QueryProvider.tsx`

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime in v4)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

**File:** `apps/shell/src/app/app.tsx`

```typescript
import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from '../providers/QueryProvider';
import { router } from '../routes';

export function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </QueryProvider>
    </ErrorBoundary>
  );
}
```

**Note:** The shell uses `createBrowserRouter` and `RouterProvider` (React Router v6.4+ data APIs) instead of the legacy `<BrowserRouter>` wrapper.

**Why TanStack Query?**

- **Automatic Caching**: Prevents redundant API calls
- **Background Refetching**: Keeps data fresh
- **Optimistic Updates**: Instant UI feedback
- **Error Handling**: Retry logic and error boundaries
- **DevTools**: Inspect cache and queries

**Note:** This project uses TanStack Query v5, which renamed `cacheTime` to `gcTime` (garbage collection time). If you're migrating from v4, update your configuration accordingly.

---

## Routing Strategy

### Multi-Level Routing Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Routing Hierarchy                          │
└─────────────────────────────────────────────────────────────────┘

Level 1: Shell Router (React Router BrowserRouter)
├─ / (Home)
├─ /login → AuthMfe
├─ /register → AuthMfe
└─ / (Protected Routes)
   ├─ /dashboard
   ├─ /chatbot → ChatbotMfe
   ├─ /profile → ProfileMfe
   │  ├─ /profile/edit → ProfileMfe
   │  ├─ /profile/settings → ProfileMfe
   │  └─ /profile/security → ProfileMfe
   └─ /admin → AdminMfe (Admin only)
      ├─ /admin/users → AdminMfe
      └─ /admin/users/:userId → AdminMfe

Level 2: MFE Internal Routing (Path-based, no router)
Auth MFE:
  if (location.pathname === '/register') → Register
  else → Login

Profile MFE:
  if (location.pathname === '/profile/edit') → EditProfilePage
  if (location.pathname === '/profile/settings') → SettingsPage
  if (location.pathname === '/profile/security') → SecurityPage
  else → ProfilePage

Chatbot MFE:
  // Currently: Single ChatPage component
  // No routing logic - always renders ChatPage
  // Future: Add routing for chat list vs conversation view

Admin MFE:
  if (location.pathname.startsWith('/admin/users/')) → User Detail
  if (location.pathname === '/admin/users') → User Management
  else → AdminDashboardPage
```

### Shell Router Configuration

**File:** `apps/shell/src/routes/index.tsx`

```typescript
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <HomePage /> },
  {
    path: '/login',
    element: <PublicRoute><AuthMfe /></PublicRoute>,
  },
  {
    path: '/register',
    element: <PublicRoute><AuthMfe /></PublicRoute>,
  },

  // Protected routes
  {
    path: '/',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'chatbot', element: <ChatbotMfe /> },

      // Profile routes - all handled by Profile MFE
      { path: 'profile', element: <ProfileMfe /> },
      { path: 'profile/edit', element: <ProfileMfe /> },
      { path: 'profile/settings', element: <ProfileMfe /> },
      { path: 'profile/security', element: <ProfileMfe /> },

      // Admin routes - protected by AdminRoute
      {
        path: 'admin',
        element: <AdminRoute><AdminMfe /></AdminRoute>,
      },
    ],
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
]);
```

### MFE Lazy Loading Pattern

**File:** `apps/shell/src/components/AuthMfe.tsx`

```typescript
import { lazy, Suspense } from 'react';

// Lazy load the Auth MFE
const AuthMfeModule = lazy(() => import('authMfe/Module'));

export function AuthMfe() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-2 text-gray-600">Loading authentication...</p>
          </div>
        </div>
      }
    >
      <AuthMfeModule />
    </Suspense>
  );
}
```

**Benefits:**

- **Code Splitting**: Auth MFE only loaded when user visits /login
- **Parallel Loading**: Multiple MFEs can load simultaneously
- **Progressive Loading**: Suspense fallback provides user feedback during load
- **Error Isolation**: If MFE fails to load, only that section breaks (with ErrorBoundary)

### MFE Internal Routing (Path-Based)

**File:** `apps/profile-mfe/src/app/app.tsx`

```typescript
import { useLocation } from 'react-router-dom';

export function App() {
  const location = useLocation();

  // Shell's router already matched /profile/*
  // We just render the right component based on path
  if (location.pathname === '/profile/edit') {
    return <EditProfilePage />;
  }

  if (location.pathname === '/profile/settings') {
    return <SettingsPage />;
  }

  if (location.pathname === '/profile/security') {
    return <SecurityPage />;
  }

  // Default to profile view
  return <ProfilePage />;
}
```

**Why Path-Based Instead of Nested Router?**

1. **Simpler**: No nested router configuration
2. **Reliable**: Avoids conflicts with shell's router
3. **Performant**: No extra router overhead
4. **Flexible**: Easy to add new routes

### Navigation Patterns

#### Within MFE (Using React Router)

```typescript
import { Link } from 'react-router-dom';

// Recommended: Use Link for internal navigation (stays in React)
<Link to="/profile/edit">Edit Profile</Link>
```

#### Cross-MFE Navigation (Post-Auth)

```typescript
// Recommended: Use window.location.replace for cross-MFE navigation
// Ensures full remount and state synchronization
window.location.replace('/dashboard');
```

**Why `window.location.replace`?**

- **Reliable**: Works across federated module boundaries
- **State Sync**: Forces remount, ensuring fresh state
- **No Back**: Prevents "back to login" after successful auth
- **Simple**: No complex routing coordination needed

#### Navbar Links

```typescript
import { Link } from 'react-router-dom';

// Recommended: Use Link - shell's router handles it
<Link to="/chatbot">Chat</Link>
<Link to="/profile">Profile</Link>
<Link to="/admin">Admin</Link>
```

### Route Guards

#### Protected Route (Authenticated Users Only)

```typescript
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
```

#### Admin Route (Admin Role Required)

```typescript
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
```

#### Public Route (Redirect to Dashboard if Already Logged In)

```typescript
export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
```

---

## Design System & Component Library

### Overview

A consistent design system is critical for micro-frontend architecture to ensure all independently developed modules look and feel like parts of a unified application. This section covers design tokens, shared components, styling guidelines, and accessibility standards.

### Design System Architecture

```mermaid
graph TB
    subgraph DesignTokens["Design Tokens Layer"]
        Colors["Colors<br/>primary, secondary, semantic"]
        Typography["Typography<br/>font families, sizes, weights"]
        Spacing["Spacing<br/>4px/8px grid system"]
        Effects["Effects<br/>shadows, borders, animations"]
    end

    subgraph TailwindConfig["Tailwind Configuration"]
        BaseConfig["Base Config<br/>tailwind.config.js"]
        Utilities["Custom Utilities<br/>@apply directives"]
    end

    subgraph Components["Component Library"]
        Primitives["Primitives<br/>Button, Input, Card"]
        Compositions["Compositions<br/>Modal, Toast, Navbar"]
        Layouts["Layouts<br/>Container, Grid, Stack"]
    end

    subgraph MFEs["Micro-Frontends"]
        Shell["Shell"]
        AuthMFE["Auth MFE"]
        ChatMFE["Chat MFE"]
        AdminMFE["Admin MFE"]
    end

    DesignTokens --> TailwindConfig
    TailwindConfig --> Components
    Components --> MFEs

    style DesignTokens fill:#e3f2fd
    style TailwindConfig fill:#f3e5f5
    style Components fill:#fff3e0
    style MFEs fill:#e8f5e9
```

---

### 1. Design Tokens

#### Color Palette

**Primary Colors** (Brand Identity):

```typescript
// Indigo - Used for primary actions, links, focus states
const primary = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1', // Main brand color
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
  950: '#1e1b4b',
};
```

**Secondary Colors** (Accent):

```typescript
// Purple - Used for secondary actions, highlights
const secondary = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7', // Main secondary color
  600: '#9333ea',
  700: '#7e22ce',
  800: '#6b21a8',
  900: '#581c87',
  950: '#3b0764',
};
```

**Semantic Colors**:

```typescript
// Success - Green for positive actions, confirmations
const success = {
  50: '#f0fdf4',
  100: '#dcfce7',
  500: '#22c55e', // Main success color
  600: '#16a34a',
  700: '#15803d',
};

// Warning - Amber for cautions, warnings
const warning = {
  50: '#fffbeb',
  100: '#fef3c7',
  500: '#f59e0b', // Main warning color
  600: '#d97706',
  700: '#b45309',
};

// Error - Red for errors, destructive actions
const error = {
  50: '#fef2f2',
  100: '#fee2e2',
  500: '#ef4444', // Main error color
  600: '#dc2626',
  700: '#b91c1c',
};

// Neutral - Gray scale for text, borders, backgrounds
const neutral = {
  50: '#f9fafb', // Lightest gray
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280', // Mid gray
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827', // Darkest gray
  950: '#030712',
};
```

**Usage Guidelines**:

```typescript
// Primary: Main CTAs, navigation highlights
<button className="bg-primary-600 hover:bg-primary-700">Login</button>

// Secondary: Less prominent actions
<button className="bg-secondary-600 hover:bg-secondary-700">Learn More</button>

// Success: Confirmations, success messages
<div className="bg-success-50 border-success-500 text-success-700">
  Profile updated successfully!
</div>

// Warning: Cautions, non-blocking alerts
<div className="bg-warning-50 border-warning-500 text-warning-700">
  Your session expires in 5 minutes
</div>

// Error: Errors, validation failures
<div className="bg-error-50 border-error-500 text-error-700">
  Invalid email address
</div>
```

#### Typography Scale

```typescript
// Font Family
const fontFamily = {
  sans: [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  mono: [
    'Fira Code',
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace',
  ],
};

// Font Sizes with Line Heights
const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }], // 12px / 16px
  sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px / 20px
  base: ['1rem', { lineHeight: '1.5rem' }], // 16px / 24px
  lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px / 28px
  xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px / 28px
  '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px / 32px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px / 36px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px / 40px
  '5xl': ['3rem', { lineHeight: '1' }], // 48px / 48px
};

// Font Weights
const fontWeight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};
```

**Typography Usage**:

```typescript
// Headings
<h1 className="text-4xl font-bold text-neutral-900">Page Title</h1>
<h2 className="text-3xl font-semibold text-neutral-800">Section Title</h2>
<h3 className="text-2xl font-semibold text-neutral-800">Subsection</h3>
<h4 className="text-xl font-medium text-neutral-700">Card Title</h4>

// Body Text
<p className="text-base font-normal text-neutral-700">Regular paragraph text</p>
<p className="text-sm text-neutral-600">Secondary text, captions</p>
<p className="text-xs text-neutral-500">Helper text, metadata</p>

// Interactive Text
<a className="text-primary-600 hover:text-primary-700 font-medium">
  Link Text
</a>

// Code
<code className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">
  console.log('Hello')
</code>
```

#### Spacing System

**8px Grid System** (based on Tailwind's default spacing):

```typescript
const spacing = {
  0: '0px', // 0
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px  ← Base unit
  3: '0.75rem', // 12px
  4: '1rem', // 16px ← Common padding
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  // Custom additions
  18: '4.5rem', // 72px
  88: '22rem', // 352px
  128: '32rem', // 512px
};
```

**Spacing Guidelines**:

```typescript
// Component Internal Padding
<div className="p-4">         // Small components (16px)
<div className="p-6">         // Medium components (24px)
<div className="p-8">         // Large components (32px)

// Component Spacing (Gap/Margin)
<div className="space-y-2">   // Tight spacing (8px)
<div className="space-y-4">   // Default spacing (16px)
<div className="space-y-6">   // Loose spacing (24px)
<div className="space-y-8">   // Section spacing (32px)

// Layout Sections
<div className="mb-12">       // Between sections (48px)
<div className="mb-16">       // Between major sections (64px)
```

#### Effects (Shadows, Borders, Animations)

**Box Shadows**:

```typescript
const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

// Usage
<div className="shadow-sm">   // Subtle elevation (cards)
<div className="shadow-md">   // Medium elevation (dropdowns)
<div className="shadow-lg">   // High elevation (modals)
```

**Border Radius**:

```typescript
const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  '4xl': '2rem',    // 32px - custom
  full: '9999px',   // Pill shape
};

// Usage
<button className="rounded-md">    // Buttons (6px)
<div className="rounded-lg">       // Cards (8px)
<div className="rounded-xl">       // Large cards (12px)
<img className="rounded-full">     // Avatars (circle)
```

**Animations**:

```typescript
const animation = {
  'fade-in': 'fadeIn 0.3s ease-in-out',
  'slide-up': 'slideUp 0.3s ease-out',
  'slide-down': 'slideDown 0.3s ease-out',
  'spin': 'spin 1s linear infinite',
};

const keyframes = {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideUp: {
    '0%': { transform: 'translateY(10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  slideDown: {
    '0%': { transform: 'translateY(-10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
};

// Usage
<div className="animate-fade-in">      // Modal entrances
<div className="animate-slide-up">     // Toast notifications
<div className="animate-spin">         // Loading spinners
```

---

### 2. Tailwind Configuration

#### Shared Tailwind Config

```javascript
// apps/shell/tailwind.config.js (replicated in each MFE)
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // Include shared component library
    '../../libs/frontend/ui-components/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT:
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

#### Custom Utility Classes

```css
/* libs/frontend/ui-components/src/styles/utilities.css */

/* Button Base */
.btn {
  @apply inline-flex items-center justify-center;
  @apply px-4 py-2 rounded-md;
  @apply font-medium text-sm;
  @apply transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Button Variants */
.btn-primary {
  @apply bg-primary-600 text-white;
  @apply hover:bg-primary-700;
  @apply focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-secondary-600 text-white;
  @apply hover:bg-secondary-700;
  @apply focus:ring-secondary-500;
}

.btn-outline {
  @apply border-2 border-primary-600 text-primary-600;
  @apply hover:bg-primary-50;
  @apply focus:ring-primary-500;
}

.btn-ghost {
  @apply text-neutral-700;
  @apply hover:bg-neutral-100;
  @apply focus:ring-neutral-500;
}

.btn-danger {
  @apply bg-error-600 text-white;
  @apply hover:bg-error-700;
  @apply focus:ring-error-500;
}

/* Card Base */
.card {
  @apply bg-white rounded-lg shadow-md;
  @apply border border-neutral-200;
  @apply p-6;
}

.card-hover {
  @apply transition-shadow duration-200;
  @apply hover:shadow-lg;
}

/* Form Input Base */
.input {
  @apply w-full px-3 py-2;
  @apply border border-neutral-300 rounded-md;
  @apply text-neutral-900 placeholder-neutral-400;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  @apply disabled:bg-neutral-100 disabled:cursor-not-allowed;
}

.input-error {
  @apply border-error-500 focus:ring-error-500;
}

/* Label Base */
.label {
  @apply block text-sm font-medium text-neutral-700 mb-1;
}

.label-required::after {
  content: ' *';
  @apply text-error-500;
}
```

---

### 3. Component Library

#### Button Component

```typescript
// libs/frontend/ui-components/src/lib/Button/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary:
          'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
        outline:
          'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        ghost:
          'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
        danger:
          'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
      },
      size: {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-6 py-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**Usage**:

```typescript
import { Button } from '@myapp/frontend-ui-components';

// Primary button (default)
<Button>Login</Button>

// Button variants
<Button variant="secondary">Cancel</Button>
<Button variant="outline">Learn More</Button>
<Button variant="ghost">Skip</Button>
<Button variant="danger">Delete Account</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state
<Button isLoading>Submitting...</Button>

// Disabled
<Button disabled>Disabled</Button>
```

#### Input Component

```typescript
// libs/frontend/ui-components/src/lib/Input/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'w-full px-3 py-2 border rounded-md text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus:ring-primary-500',
        error: 'border-error-500 focus:ring-error-500',
      },
      size: {
        sm: 'text-sm py-1.5',
        md: 'text-base py-2',
        lg: 'text-lg py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, required, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={inputVariants({
            variant: error ? 'error' : variant,
            size,
            className,
          })}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**Usage**:

```typescript
import { Input } from '@myapp/frontend-ui-components';

// Basic input
<Input placeholder="Enter your email" />

// With label
<Input label="Email Address" required />

// With error
<Input
  label="Email"
  error="Please enter a valid email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Different sizes
<Input size="sm" placeholder="Small" />
<Input size="lg" placeholder="Large" />
```

#### Card Component

```typescript
// libs/frontend/ui-components/src/lib/Card/Card.tsx
import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'bg-white rounded-lg border border-neutral-200',
  {
    variants: {
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        true: 'transition-shadow duration-200 hover:shadow-lg cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      shadow: 'md',
      padding: 'md',
      hover: false,
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, shadow, padding, hover, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ shadow, padding, hover, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`border-b border-neutral-200 pb-4 mb-4 ${className || ''}`}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-semibold text-neutral-900 ${className || ''}`}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
));
CardContent.displayName = 'CardContent';
```

**Usage**:

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@myapp/frontend-ui-components';

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Card with sub-components
<Card shadow="lg">
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Name: John Doe</p>
    <p>Email: john@example.com</p>
  </CardContent>
</Card>

// Hoverable card
<Card hover onClick={() => navigate('/details')}>
  <CardTitle>Click me</CardTitle>
</Card>
```

---

### 4. Accessibility Standards

#### WCAG 2.1 AA Compliance

**Color Contrast Requirements**:

```typescript
// Minimum contrast ratios
// Normal text: 4.5:1
// Large text (18pt+): 3:1
// UI components: 3:1

// PASS: primary-600 (#4f46e5) on white
<button className="bg-primary-600 text-white">
  Accessible Button
</button>

// PASS: neutral-700 (#374151) on white
<p className="text-neutral-700">
  Readable paragraph text
</p>

// FAIL: neutral-400 on white (too light)
<p className="text-neutral-400">  // Contrast ratio < 4.5:1
  Hard to read
</p>

// FIX: Use neutral-600 or darker
<p className="text-neutral-600">
  Better contrast
</p>
```

**Keyboard Navigation**:

```typescript
// All interactive elements must be keyboard accessible

// GOOD: Native button (keyboard accessible by default)
<button onClick={handleClick}>Click Me</button>

// BAD: Div with onClick (not keyboard accessible)
<div onClick={handleClick}>Click Me</div>

// GOOD: Div with role and keyboard handlers
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click Me
</div>

// Focus visible styles
<button className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
  Keyboard Accessible
</button>
```

**ARIA Labels**:

```typescript
// Icon-only buttons
<button aria-label="Close dialog">
  <XIcon className="h-5 w-5" />
</button>

// Form inputs (always associate with labels)
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />

// Loading states
<button aria-busy={isLoading} aria-label="Submitting form">
  {isLoading ? 'Loading...' : 'Submit'}
</button>

// Required fields
<input aria-required="true" required />

// Error messages
<input
  aria-invalid={!!error}
  aria-describedby="email-error"
/>
{error && <p id="email-error" className="text-error-600">{error}</p>}
```

**Screen Reader Support**:

```typescript
// Hide decorative elements
<img src="decoration.png" alt="" aria-hidden="true" />

// Skip navigation
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {notification}
</div>

// Modal accessibility
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-description">Are you sure you want to proceed?</p>
</div>
```

---

### 5. Component Usage Guidelines

#### When to Use Shared Components

**Use shared components for**:

- Basic UI primitives (Button, Input, Card)
- Common patterns (Modal, Toast, Dropdown)
- Brand-consistent elements (Logo, themed components)
- Cross-MFE navigation (Navbar, Footer)

**Don't use shared components for**:

- MFE-specific business logic components
- Highly customized one-off components
- Components with heavy dependencies specific to one MFE

**Example Decision Tree**:

```typescript
// GOOD: Use shared Button for consistency
import { Button } from '@myapp/frontend-ui-components';
<Button variant="primary">Login</Button>

// GOOD: Create MFE-specific component for complex logic
// apps/chatbot-mfe/src/components/MessageList.tsx
export function MessageList() {
  // Complex chat-specific logic
  // Uses shared Button internally
  return (
    <div>
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <Button onClick={sendMessage}>Send</Button>
    </div>
  );
}

// BAD: Duplicating button styles in each MFE
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Login
</button>
```

#### Component Composition Pattern

```typescript
// Build complex components from shared primitives
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@myapp/frontend-ui-components';

export function UserProfileForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <Input
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

### 6. Best Practices

#### Design System Best Practices

**1. Consistency Over Customization**

```typescript
// GOOD: Use design tokens
<div className="bg-primary-600 text-white p-4 rounded-lg">

// BAD: Arbitrary values
<div className="bg-[#4f46e5] text-[#ffffff] p-[16px] rounded-[8px]">
```

**2. Component Composition**

```typescript
// GOOD: Compose from shared components
import { Button, Card } from '@myapp/frontend-ui-components';

function ActionCard() {
  return (
    <Card>
      <h3>Title</h3>
      <Button>Action</Button>
    </Card>
  );
}

// BAD: Reinvent components
function ActionCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3>Title</h3>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Action
      </button>
    </div>
  );
}
```

**3. Accessibility First**

```typescript
// GOOD: Semantic HTML + ARIA
<button
  aria-label="Close dialog"
  onClick={onClose}
  className="focus:ring-2 focus:ring-primary-500"
>
  <XIcon />
</button>

// BAD: Div buttons without accessibility
<div onClick={onClose}>
  <XIcon />
</div>
```

**4. Mobile-First Responsive Design**

```typescript
// GOOD: Mobile-first breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Default: 1 column (mobile)
// md (768px+): 2 columns (tablet)
// lg (1024px+): 3 columns (desktop)
```

**5. Performance Considerations**

```typescript
// GOOD: Lazy load heavy components
import { lazy } from 'react';
const RichTextEditor = lazy(() => import('./RichTextEditor'));

// GOOD: Optimize Tailwind with purge
// tailwind.config.js
content: ['./src/**/*.{js,ts,jsx,tsx}'],

// GOOD: Use CSS containment for large lists
<div className="contain-layout contain-paint">
  {virtualizedList}
</div>
```

---

### 7. Design System Checklist

**For New Components**:

- [ ] Uses design tokens (colors, spacing, typography)
- [ ] Follows naming conventions (PascalCase for components)
- [ ] Includes TypeScript types
- [ ] Implements all size variants (sm, md, lg)
- [ ] Supports disabled/loading states
- [ ] Keyboard accessible (tab navigation, enter/space activation)
- [ ] Screen reader compatible (ARIA labels)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus visible styles (ring-2 ring-primary-500)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Documented with usage examples
- [ ] Tested in all MFEs

**For New Features**:

- [ ] Reuses existing components where possible
- [ ] Creates shared components for reusable patterns
- [ ] Follows spacing guidelines (8px grid)
- [ ] Uses semantic HTML elements
- [ ] Error states clearly communicated
- [ ] Loading states provide feedback
- [ ] Touch targets minimum 44x44px (mobile)
- [ ] Forms properly labeled and validated
- [ ] Consistent with existing patterns

---

## Shared Libraries & Nx Workspace

### Overview

Shared libraries are the backbone of code reuse in our Nx monorepo. They enable micro-frontends and backend services to share common functionality while maintaining clear boundaries and preventing code duplication. This section documents our library architecture, import conventions, and best practices.

### Library Architecture

```mermaid
graph TB
    subgraph Apps["Applications Layer"]
        Shell["Shell<br/>(Host App)"]
        AuthMFE["Auth MFE"]
        ChatMFE["Chat MFE"]
        AdminMFE["Admin MFE"]
        AuthService["Auth Service"]
        ChatService["Chat Service"]
    end

    subgraph FrontendLibs["Frontend Libraries"]
        UIComponents["ui-components<br/>Shared React components"]
        Stores["stores<br/>Zustand state management"]
        Hooks["hooks<br/>Custom React hooks"]
        FrontendUtils["utils<br/>Frontend utilities"]
        ApiClient["api-client<br/>Axios instance"]
        Mocks["mocks<br/>MSW handlers"]
    end

    subgraph BackendLibs["Backend Libraries"]
        Database["database<br/>Prisma client + models"]
        Logger["logger<br/>Winston/Pino logger"]
        Metrics["metrics<br/>Prometheus metrics"]
        Security["security<br/>Auth guards, encryption"]
    end

    subgraph SharedLibs["Shared Libraries"]
        Types["types<br/>TypeScript interfaces"]
        SharedUtils["utils<br/>Isomorphic utilities"]
    end

    Shell --> UIComponents
    Shell --> Stores
    Shell --> Hooks
    Shell --> ApiClient

    AuthMFE --> UIComponents
    AuthMFE --> Stores
    AuthMFE --> Hooks
    AuthMFE --> ApiClient

    ChatMFE --> UIComponents
    ChatMFE --> Stores
    ChatMFE --> Hooks
    ChatMFE --> ApiClient

    AdminMFE --> UIComponents
    AdminMFE --> Stores
    AdminMFE --> Hooks
    AdminMFE --> ApiClient

    AuthService --> Database
    AuthService --> Logger
    AuthService --> Metrics
    AuthService --> Security

    ChatService --> Database
    ChatService --> Logger
    ChatService --> Metrics
    ChatService --> Security

    UIComponents --> FrontendUtils
    Hooks --> Stores
    ApiClient --> FrontendUtils
    Mocks --> Types

    Database --> Types
    Logger --> Types
    Security --> Types

    FrontendUtils --> SharedUtils
    FrontendUtils --> Types

    style Apps fill:#e3f2fd
    style FrontendLibs fill:#e8f5e9
    style BackendLibs fill:#fff3e0
    style SharedLibs fill:#f3e5f5
```

---

### 1. Library Inventory

#### Frontend Libraries

**`@myapp/frontend/ui-components`**

**Purpose**: Shared React component library for consistent UI across all MFEs.

**Location**: `libs/frontend/ui-components/`

**Key Exports**:

```typescript
// libs/frontend/ui-components/src/index.ts
export { Button } from './lib/Button/Button';
export { Input } from './lib/Input/Input';
export { Card, CardHeader, CardTitle, CardContent } from './lib/Card/Card';
export { Modal } from './lib/Modal/Modal';
export { Toast } from './lib/Toast/Toast';
export { Navbar } from './lib/Navbar/Navbar';
export { Footer } from './lib/Footer/Footer';
export { Spinner } from './lib/Spinner/Spinner';
export { Avatar } from './lib/Avatar/Avatar';
export { Badge } from './lib/Badge/Badge';

// Types
export type { ButtonProps } from './lib/Button/Button';
export type { InputProps } from './lib/Input/Input';
export type { CardProps } from './lib/Card/Card';
export type { ModalProps } from './lib/Modal/Modal';
```

**Usage**:

```typescript
// In any MFE: apps/auth-mfe/src/components/LoginForm.tsx
import { Button, Input, Card } from '@myapp/frontend/ui-components';

export function LoginForm() {
  return (
    <Card>
      <Input label="Email" type="email" />
      <Input label="Password" type="password" />
      <Button variant="primary">Login</Button>
    </Card>
  );
}
```

**Dependencies**:

- React 19.0.0
- Tailwind CSS (via design tokens)
- class-variance-authority (for variants)

---

**`@myapp/frontend/stores`**

**Purpose**: Centralized Zustand stores for global state management.

**Location**: `libs/frontend/stores/`

**Key Exports**:

```typescript
// libs/frontend/stores/src/index.ts
export { useAuthStore } from './lib/auth.store';
export { useToastStore } from './lib/toast.store';
export type { User, AuthState } from './lib/auth.store';
export type { Toast, ToastType, ToastState } from './lib/toast.store';
```

**Store Structure**:

```typescript
// libs/frontend/stores/src/lib/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (accessToken) => set({ accessToken }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

**Usage Across MFEs**:

```typescript
// In Shell: apps/shell/src/App.tsx
import { useAuthStore } from '@myapp/frontend/stores';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user?.name}!</p>}
    </div>
  );
}

// In Auth MFE: apps/auth-mfe/src/pages/Login.tsx
import { useAuthStore } from '@myapp/frontend/stores';

function Login() {
  const { setUser, setTokens } = useAuthStore();

  const handleLogin = async (credentials: LoginCredentials) => {
    const { user, accessToken } = await authApi.login(credentials);
    setUser(user);
    setTokens(accessToken);
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

**Dependencies**:

- zustand ^5.0.2
- zustand/middleware (for persist)

---

**`@ai-chatbot/hooks`**

**Purpose**: Custom React hooks for common patterns and logic.

**Location**: `libs/frontend/hooks/`

**Key Exports**:

```typescript
// libs/frontend/hooks/src/index.ts
// Auth hooks
export {
  useAuth,
  useRequireAuth,
  useRequireRole,
  type LoginCredentials,
  type RegisterData,
  type AuthResponse,
  type UseAuthReturn,
} from './lib/useAuth';

// Toast hooks
export { useToast, useAsyncToast, type UseToastReturn } from './lib/useToast';

// API hooks
export {
  useApi,
  usePublicApi,
  type UseApiOptions,
  type UseApiReturn,
} from './lib/useApi';
```

**Hook Implementation Example**:

```typescript
// libs/frontend/hooks/src/lib/useAuth.ts
import { useAuthStore } from '@myapp/frontend/stores';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setTokens,
    logout: storeLogout,
  } = useAuthStore();
  const navigate = useNavigate();

  const login = async (credentials: LoginCredentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) throw new Error('Login failed');

    const { user, accessToken }: AuthResponse = await response.json();
    setUser(user);
    setTokens(accessToken);
    navigate('/chat');
  };

  const register = async (data: RegisterData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Registration failed');

    const { user, accessToken }: AuthResponse = await response.json();
    setUser(user);
    setTokens(accessToken);
    navigate('/chat');
  };

  const logout = () => {
    storeLogout();
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
}

// Protected route hook
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { isAuthenticated, isLoading };
}

// Role-based access hook
export function useRequireRole(requiredRole: 'user' | 'admin') {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!isLoading && user?.role !== requiredRole) {
      navigate('/unauthorized');
    }
  }, [user, isAuthenticated, isLoading, requiredRole, navigate]);

  return { user, isAuthenticated, isLoading };
}
```

**Usage**:

```typescript
// In any MFE
import { useAuth, useRequireAuth } from '@ai-chatbot/hooks';

// Login page
function LoginPage() {
  const { login, isLoading } = useAuth();

  return <LoginForm onSubmit={login} isLoading={isLoading} />;
}

// Protected page
function ChatPage() {
  const { isLoading } = useRequireAuth(); // Auto-redirects if not authenticated

  if (isLoading) return <Spinner />;

  return <ChatInterface />;
}

// Admin-only page
function AdminDashboard() {
  const { isLoading } = useRequireRole('admin'); // Auto-redirects if not admin

  if (isLoading) return <Spinner />;

  return <Dashboard />;
}
```

**Dependencies**:

- react ^19.0.0
- react-router-dom ^7.1.1
- @myapp/frontend/stores

---

**`@myapp/frontend/utils`**

**Purpose**: Frontend-specific utility functions.

**Location**: `libs/frontend/utils/`

**Key Exports**:

```typescript
// libs/frontend/utils/src/index.ts
export { cn } from './lib/classnames';
export { formatDate, formatRelativeTime } from './lib/date-utils';
export { validateEmail, validatePassword } from './lib/validation';
export { debounce, throttle } from './lib/performance';
export { storage } from './lib/storage';
export { copyToClipboard, downloadFile } from './lib/browser-utils';
```

**Implementation Examples**:

```typescript
// libs/frontend/utils/src/lib/classnames.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging Tailwind classes without conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
import { cn } from '@myapp/frontend/utils';

function Button({ className, variant }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md',
        variant === 'primary' && 'bg-primary-600 text-white',
        variant === 'secondary' && 'bg-secondary-600 text-white',
        className
      )}
    />
  );
}
```

```typescript
// libs/frontend/utils/src/lib/date-utils.ts
import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  return format(new Date(date), pattern);
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// Usage
import { formatDate, formatRelativeTime } from '@myapp/frontend/utils';

<p>Created: {formatDate(createdAt)}</p>              // "Nov 16, 2025"
<p>Last active: {formatRelativeTime(lastActive)}</p> // "5 minutes ago"
```

```typescript
// libs/frontend/utils/src/lib/storage.ts
interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

export const storage = new LocalStorageAdapter();

// Usage
import { storage } from '@myapp/frontend/utils';

// Save user preferences
storage.set('theme', 'dark');

// Retrieve preferences
const theme = storage.get<string>('theme'); // 'dark'
```

**Dependencies**:

- clsx ^2.1.1
- tailwind-merge ^2.5.5
- date-fns ^4.1.0

---

**`@myapp/frontend/api-client`**

**Purpose**: Axios instance with interceptors for authentication and error handling.

**Location**: `libs/frontend/api-client/`

**Key Exports**:

```typescript
// libs/frontend/api-client/src/index.ts
export { apiClient, publicApiClient } from './lib/api-client';
export type { ApiError, ApiResponse } from './lib/types';
```

**Implementation**:

```typescript
// libs/frontend/api-client/src/lib/api-client.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@myapp/frontend/stores';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      // Forbidden
      console.error('Access denied');
    }

    return Promise.reject(error);
  }
);

// Public API client (no auth required)
export const publicApiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Usage**:

```typescript
// In any MFE service
import { apiClient } from '@myapp/frontend/api-client';

export const conversationService = {
  getConversations: async () => {
    const { data } = await apiClient.get('/chat/conversations');
    return data;
  },

  createConversation: async (title: string) => {
    const { data } = await apiClient.post('/chat/conversations', { title });
    return data;
  },

  deleteConversation: async (id: string) => {
    await apiClient.delete(`/chat/conversations/${id}`);
  },
};
```

**Dependencies**:

- axios ^1.7.9
- @myapp/frontend/stores

---

**`@myapp/frontend/mocks`**

**Purpose**: Mock Service Worker (MSW) handlers for testing and development.

**Location**: `libs/frontend/mocks/`

**Key Exports**:

```typescript
// libs/frontend/mocks/src/index.ts
export { handlers } from './lib/handlers';
export { setupWorker } from './lib/browser';
export { setupServer } from './lib/server';
```

**Implementation**:

```typescript
// libs/frontend/mocks/src/lib/handlers/auth.handlers.ts
import { http, HttpResponse } from 'msw';
import type { User } from '@myapp/shared/types';

const BASE_URL = 'http://localhost:3001';

export const authHandlers = [
  // Login
  http.post(`${BASE_URL}/api/auth/login`, async ({ request }) => {
    const { email, password } = await request.json();

    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        accessToken: 'mock-token-12345',
      });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Get current user
  http.get(`${BASE_URL}/api/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (authHeader?.includes('mock-token')) {
      return HttpResponse.json({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });
    }

    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),
];
```

```typescript
// libs/frontend/mocks/src/lib/handlers/index.ts
import { authHandlers } from './auth.handlers';
import { chatHandlers } from './chat.handlers';

export const handlers = [...authHandlers, ...chatHandlers];
```

**Usage in Development**:

```typescript
// apps/shell/src/main.tsx
import { setupWorker } from '@myapp/frontend/mocks';

if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
  const worker = setupWorker();
  worker.start({
    onUnhandledRequest: 'bypass',
  });
}
```

**Dependencies**:

- msw ^2.7.0
- @myapp/shared/types

---

#### Backend Libraries

**`@myapp/backend/database`**

**Purpose**: Prisma client and database models.

**Location**: `libs/backend/database/`

**Key Exports**:

```typescript
// libs/backend/database/src/index.ts
export { prisma } from './lib/prisma-client';
export * from '@prisma/client';
export type { User, Conversation, Message } from '@prisma/client';
```

**Implementation**:

```typescript
// libs/backend/database/src/lib/prisma-client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Usage**:

```typescript
// In backend services
import { prisma, User } from '@myapp/backend/database';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<User> {
    return prisma.user.create({ data });
  }
}
```

**Dependencies**:

- @prisma/client ^6.2.1
- prisma ^6.2.1 (dev dependency)

---

**`@myapp/backend/logger`**

**Purpose**: Winston/Pino logger with structured logging.

**Location**: `libs/backend/logger/`

**Key Exports**:

```typescript
// libs/backend/logger/src/index.ts
export { logger } from './lib/logger';
export type { Logger, LogContext } from './lib/types';
```

**Implementation**:

```typescript
// libs/backend/logger/src/lib/logger.ts
import winston from 'winston';

const { combine, timestamp, json, errors, printf } = winston.format;

export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: {
    service: process.env['SERVICE_NAME'] || 'unknown-service',
  },
  transports: [
    new winston.transports.Console({
      format: printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${JSON.stringify(meta)}`;
      }),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

**Usage**:

```typescript
// In backend services
import { logger } from '@myapp/backend/logger';

export class AuthService {
  async login(email: string, password: string) {
    logger.info('Login attempt', { email });

    try {
      // Login logic
      logger.info('Login successful', { email });
    } catch (error) {
      logger.error('Login failed', { email, error });
      throw error;
    }
  }
}
```

**Dependencies**:

- winston ^3.17.0

---

**`@myapp/backend/metrics`**

**Purpose**: Prometheus metrics for monitoring.

**Location**: `libs/backend/metrics/`

**Key Exports**:

```typescript
// libs/backend/metrics/src/index.ts
export { metricsMiddleware, metricsEndpoint } from './lib/metrics';
export { counter, gauge, histogram } from './lib/collectors';
```

**Implementation**:

```typescript
// libs/backend/metrics/src/lib/metrics.ts
import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';

// Initialize default metrics
promClient.collectDefaultMetrics();

// Custom metrics
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Middleware
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });

  next();
}

// Metrics endpoint
export async function metricsEndpoint(req: Request, res: Response) {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
}
```

**Usage**:

```typescript
// In backend main.ts
import { metricsMiddleware, metricsEndpoint } from '@myapp/backend/metrics';

const app = express();

// Apply metrics middleware
app.use(metricsMiddleware);

// Expose metrics endpoint
app.get('/metrics', metricsEndpoint);
```

**Dependencies**:

- prom-client ^15.1.3

---

**`@myapp/backend/security`**

**Purpose**: Authentication guards, encryption utilities, and security middleware.

**Location**: `libs/backend/security/`

**Key Exports**:

```typescript
// libs/backend/security/src/index.ts
export { JwtAuthGuard, RolesGuard } from './lib/guards';
export { hashPassword, verifyPassword } from './lib/crypto';
export { generateToken, verifyToken } from './lib/jwt';
export { rateLimiter } from './lib/rate-limiter';
```

**Implementation**:

```typescript
// libs/backend/security/src/lib/crypto.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

```typescript
// libs/backend/security/src/lib/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
```

**Usage**:

```typescript
// In backend services
import {
  hashPassword,
  verifyPassword,
  generateToken,
} from '@myapp/backend/security';

export class AuthService {
  async register(email: string, password: string, name: string) {
    const passwordHash = await hashPassword(password);
    const user = await this.userRepo.create({ email, name, passwordHash });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, accessToken: token };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error('User not found');

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) throw new Error('Invalid password');

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, accessToken: token };
  }
}
```

**Dependencies**:

- bcrypt ^5.1.1
- jsonwebtoken ^9.0.2

---

#### Shared Libraries

**`@myapp/shared/types`**

**Purpose**: TypeScript interfaces and types shared between frontend and backend.

**Location**: `libs/shared/types/`

**Key Exports**:

```typescript
// libs/shared/types/src/index.ts
export type { User, UserRole } from './lib/user.types';
export type { Conversation, Message } from './lib/chat.types';
export type { ApiResponse, ApiError } from './lib/api.types';
export type {
  PaginationParams,
  PaginatedResponse,
} from './lib/pagination.types';
```

**Implementation**:

```typescript
// libs/shared/types/src/lib/user.types.ts
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
}

export interface UserUpdateInput {
  name?: string;
  avatar?: string;
}
```

```typescript
// libs/shared/types/src/lib/api.types.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Usage**:

```typescript
// In frontend
import type { User, ApiResponse } from '@myapp/shared/types';

const fetchUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return response.data.data;
};

// In backend
import type { User, ApiResponse } from '@myapp/shared/types';

app.get('/api/users/:id', async (req, res) => {
  const user = await userService.findById(req.params.id);
  const response: ApiResponse<User> = {
    success: true,
    data: user,
  };
  res.json(response);
});
```

**Dependencies**: None (pure TypeScript types)

---

**`@myapp/shared/utils`**

**Purpose**: Isomorphic utility functions that work in both frontend and backend.

**Location**: `libs/shared/utils/`

**Key Exports**:

```typescript
// libs/shared/utils/src/index.ts
export { slugify, generateId } from './lib/string-utils';
export { isValidEmail, isValidUrl } from './lib/validators';
export { pick, omit } from './lib/object-utils';
export { chunk, unique } from './lib/array-utils';
```

**Implementation**:

```typescript
// libs/shared/utils/src/lib/string-utils.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(prefix?: string): string {
  const id = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}_${id}` : id;
}
```

```typescript
// libs/shared/utils/src/lib/validators.ts
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

**Usage**:

```typescript
// Works in both frontend and backend
import { slugify, isValidEmail } from '@myapp/shared/utils';

const title = 'My Blog Post';
const slug = slugify(title); // 'my-blog-post'

const email = 'test@example.com';
if (isValidEmail(email)) {
  // Valid email
}
```

**Dependencies**: None (pure JavaScript/TypeScript)

---

### 2. Import Conventions

#### Path Aliases

All libraries use path aliases defined in `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      // Frontend libraries
      "@myapp/frontend/ui-components": [
        "libs/frontend/ui-components/src/index.ts"
      ],
      "@myapp/frontend/api-client": ["libs/frontend/api-client/src/index.ts"],
      "@myapp/frontend/stores": ["libs/frontend/stores/src/index.ts"],
      "@myapp/frontend/utils": ["libs/frontend/utils/src/index.ts"],
      "@myapp/frontend/mocks": ["libs/frontend/mocks/src/index.ts"],
      "@ai-chatbot/hooks": ["libs/frontend/hooks/src/index.ts"],

      // Backend libraries
      "@myapp/backend/logger": ["libs/backend/logger/src/index.ts"],
      "@myapp/backend/metrics": ["libs/backend/metrics/src/index.ts"],
      "@myapp/backend/security": ["libs/backend/security/src/index.ts"],
      "@myapp/backend/database": ["libs/backend/database/src/index.ts"],

      // Shared libraries
      "@myapp/shared/types": ["libs/shared/types/src/index.ts"],
      "@myapp/shared/utils": ["libs/shared/utils/src/index.ts"]
    }
  }
}
```

#### Import Guidelines

**GOOD: Use path aliases**

```typescript
import { Button, Input } from '@myapp/frontend/ui-components';
import { useAuthStore } from '@myapp/frontend/stores';
import { useAuth } from '@ai-chatbot/hooks';
import { apiClient } from '@myapp/frontend/api-client';
```

**BAD: Use relative paths**

```typescript
import { Button } from '../../../libs/frontend/ui-components/src/lib/Button';
import { useAuthStore } from '../../../libs/frontend/stores/src/lib/auth.store';
```

#### Barrel Exports

All libraries MUST export through `index.ts` (barrel file):

```typescript
// GOOD: libs/frontend/ui-components/src/index.ts
export { Button } from './lib/Button/Button';
export { Input } from './lib/Input/Input';
export { Card } from './lib/Card/Card';
export type { ButtonProps } from './lib/Button/Button';
export type { InputProps } from './lib/Input/Input';

// BAD: Direct internal imports
import { Button } from '@myapp/frontend/ui-components/lib/Button/Button';
```

---

### 3. Dependency Management

#### Library Dependency Rules

```mermaid
graph TB
    Apps["Applications<br/>(Shell, MFEs, Services)"]
    FrontendLibs["Frontend Libraries"]
    BackendLibs["Backend Libraries"]
    SharedLibs["Shared Libraries"]

    Apps --> FrontendLibs
    Apps --> BackendLibs
    Apps --> SharedLibs

    FrontendLibs --> SharedLibs
    BackendLibs --> SharedLibs

    FrontendLibs -."Cannot depend on".-> BackendLibs
    BackendLibs -."Cannot depend on".-> FrontendLibs

    style Apps fill:#e3f2fd
    style FrontendLibs fill:#e8f5e9
    style BackendLibs fill:#fff3e0
    style SharedLibs fill:#f3e5f5
```

**Dependency Rules**:

1. **Applications** can depend on any library
2. **Frontend libraries** can depend on:
   - Other frontend libraries
   - Shared libraries
   - NOT backend libraries

3. **Backend libraries** can depend on:
   - Other backend libraries
   - Shared libraries
   - NOT frontend libraries

4. **Shared libraries** can depend on:
   - Other shared libraries
   - NOT frontend or backend libraries

#### Nx Tags for Enforcement

```json
// libs/frontend/ui-components/project.json
{
  "tags": ["type:frontend", "scope:shared"]
}

// libs/backend/database/project.json
{
  "tags": ["type:backend", "scope:shared"]
}

// libs/shared/types/project.json
{
  "tags": ["type:shared", "scope:shared"]
}
```

**Enforcement in `.eslintrc.json`**:

```json
{
  "@nx/enforce-module-boundaries": [
    "error",
    {
      "allow": [],
      "depConstraints": [
        {
          "sourceTag": "type:frontend",
          "onlyDependOnLibsWithTags": ["type:frontend", "type:shared"]
        },
        {
          "sourceTag": "type:backend",
          "onlyDependOnLibsWithTags": ["type:backend", "type:shared"]
        },
        {
          "sourceTag": "type:shared",
          "onlyDependOnLibsWithTags": ["type:shared"]
        }
      ]
    }
  ]
}
```

---

### 4. Library Creation Guidelines

#### When to Create a New Library

**Create a new library when**:

- Code is reused across 2+ applications/MFEs
- Functionality has clear boundaries and responsibilities
- Library can be independently tested and versioned
- Library provides a well-defined API

**Don't create a new library when**:

- Code is only used in one place
- Functionality is too tightly coupled to specific app logic
- Library would have unclear or unstable API
- Premature abstraction (wait until 2nd usage)

#### Creating a Library with Nx

**Frontend Library**:

```bash
# Create React library
nx g @nx/react:library my-feature --directory=libs/frontend/my-feature --importPath=@myapp/frontend/my-feature

# Create utility library (no React)
nx g @nx/js:library my-utils --directory=libs/frontend/my-utils --importPath=@myapp/frontend/my-utils
```

**Backend Library**:

```bash
# Create Node.js library
nx g @nx/node:library my-service --directory=libs/backend/my-service --importPath=@myapp/backend/my-service
```

**Shared Library**:

```bash
# Create TypeScript library
nx g @nx/js:library my-types --directory=libs/shared/my-types --importPath=@myapp/shared/my-types
```

#### Library Structure Template

```
libs/frontend/my-feature/
├── src/
│   ├── index.ts                 # Barrel exports (public API)
│   ├── lib/
│   │   ├── MyComponent/
│   │   │   ├── MyComponent.tsx
│   │   │   ├── MyComponent.spec.tsx
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── helper.ts
│   │       └── helper.spec.ts
├── project.json                 # Nx project configuration
├── tsconfig.json
├── tsconfig.lib.json
├── tsconfig.spec.json
├── vite.config.ts
└── README.md                    # Library documentation
```

---

### 5. Testing Shared Libraries

#### Unit Testing

```typescript
// libs/frontend/utils/src/lib/classnames.spec.ts
import { describe, it, expect } from 'vitest';
import { cn } from './classnames';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('handles Tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active')).toBe('base active');
    expect(cn('base', false && 'active')).toBe('base');
  });
});
```

**Run Tests**:

```bash
# Test specific library
nx test frontend-utils

# Test all libraries
nx run-many --target=test --all

# Test with coverage
nx test frontend-utils --coverage
```

#### Integration Testing

```typescript
// libs/frontend/api-client/src/lib/api-client.spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apiClient } from './api-client';

const server = setupServer(
  http.get('http://localhost:3001/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' },
    ]);
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('apiClient', () => {
  it('fetches users', async () => {
    const { data } = await apiClient.get('/api/users');
    expect(data).toHaveLength(2);
    expect(data[0].name).toBe('John');
  });
});
```

---

### 6. Library Versioning & Publishing

#### Semantic Versioning

Shared libraries follow semantic versioning:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

#### Nx Version Management

```bash
# Bump library version
nx run frontend-ui-components:version --releaseAs=minor

# Build library
nx build frontend-ui-components

# Publish to npm (if needed)
nx run frontend-ui-components:publish
```

#### Changelog

```markdown
# @myapp/frontend/ui-components

## 2.1.0 (2025-11-16)

### Features

- Add Modal component with animations
- Add Avatar component with fallback

### Bug Fixes

- Fix Button disabled state styling
- Fix Input error border color

### Breaking Changes

- None

## 2.0.0 (2025-11-01)

### Breaking Changes

- Removed deprecated `variant="link"` from Button
- Changed `size` prop values: `xs` → `sm`, `xl` → `lg`
```

---

### 7. Best Practices

#### Library Design Principles

**1. Single Responsibility**

```typescript
// GOOD: Focused library
// libs/frontend/auth-utils/
export { validatePassword } from './password-validation';
export { hashPassword } from './password-hashing';
export { generateToken } from './token-generation';

// BAD: Too broad
// libs/frontend/everything/
export { validatePassword } from './auth';
export { formatDate } from './dates';
export { fetchUsers } from './api';
export { Button } from './components';
```

**2. Clear API Surface**

```typescript
// GOOD: Explicit exports
// libs/frontend/ui-components/src/index.ts
export { Button } from './lib/Button/Button';
export { Input } from './lib/Input/Input';
export type { ButtonProps } from './lib/Button/Button';

// BAD: Export everything
export * from './lib'; // Exposes internal implementation
```

**3. Avoid Circular Dependencies**

```typescript
// BAD: Circular dependency
// libs/frontend/stores → libs/frontend/hooks
// libs/frontend/hooks → libs/frontend/stores

// GOOD: One-way dependency
// libs/frontend/hooks → libs/frontend/stores
// libs/frontend/stores (no dependency on hooks)
```

**4. Type Safety**

```typescript
// GOOD: Export types alongside implementations
export { useAuth } from './useAuth';
export type { UseAuthReturn, LoginCredentials } from './useAuth';

// BAD: Missing type exports
export { useAuth } from './useAuth';
// Users can't import types
```

**5. Documentation**

```typescript
// GOOD: JSDoc comments
/**
 * Formats a date string into a human-readable format
 * @param date - Date string or Date object
 * @param pattern - Format pattern (default: 'MMM d, yyyy')
 * @returns Formatted date string
 * @example
 * formatDate('2025-11-16') // 'Nov 16, 2025'
 * formatDate(new Date(), 'yyyy-MM-dd') // '2025-11-16'
 */
export function formatDate(
  date: string | Date,
  pattern = 'MMM d, yyyy'
): string {
  return format(new Date(date), pattern);
}
```

---

### 8. Troubleshooting

#### Common Issues

**Issue 1: "Cannot find module '@myapp/frontend/ui-components'"**

**Solution**:

```bash
# Rebuild library
nx build frontend-ui-components

# Verify tsconfig.base.json has correct path
{
  "paths": {
    "@myapp/frontend/ui-components": ["libs/frontend/ui-components/src/index.ts"]
  }
}

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

**Issue 2: Circular Dependency Detected**

**Solution**:

```bash
# Analyze dependency graph
nx graph

# Find circular dependencies
nx run frontend-ui-components:lint

# Refactor to break cycle:
# Extract shared code to new library
nx g @nx/js:library shared-types --directory=libs/shared/shared-types
```

**Issue 3: Type Errors After Library Update**

**Solution**:

```bash
# Clear Nx cache
nx reset

# Rebuild all libraries
nx run-many --target=build --all

# Clear node_modules (if needed)
rm -rf node_modules
npm install
```

---

### 9. Library Checklist

**Before Creating a New Library**:

- [ ] Library has clear, single responsibility
- [ ] Code is reused in 2+ places
- [ ] Library can be independently tested
- [ ] API surface is well-defined
- [ ] Appropriate Nx tags configured
- [ ] Documentation written (README.md)

**Before Publishing a Library Update**:

- [ ] All tests passing (`nx test <library>`)
- [ ] No circular dependencies
- [ ] Breaking changes documented
- [ ] Version bumped appropriately
- [ ] Changelog updated
- [ ] Dependent apps tested
- [ ] Type exports included
- [ ] JSDoc comments added

**Library Maintenance**:

- [ ] Keep dependencies up to date
- [ ] Monitor library size (avoid bloat)
- [ ] Review and remove unused code
- [ ] Maintain >80% test coverage
- [ ] Update documentation regularly
- [ ] Respond to breaking changes in dependencies

---

## Internationalization & Localization

### Overview

Internationalization (i18n) and Localization (l10n) enable the application to support multiple languages and cultural formats. This section covers the technical implementation (i18n) and content adaptation (l10n) strategies for our micro-frontend architecture.

**Key Concepts**:

- **Internationalization (i18n)**: Engineering process of designing software to support multiple languages without code changes
- **Localization (l10n)**: Process of adapting content and UI for specific languages, regions, and cultures

**Supported Languages** (Initial Launch):

- English (en-US) - Default
- Spanish (es-ES)
- French (fr-FR)
- German (de-DE)
- Japanese (ja-JP)
- Chinese Simplified (zh-CN)
- Arabic (ar-SA) - RTL support

### Architecture

```mermaid
graph TB
    subgraph UserLayer["User Layer"]
        User["User"]
        Browser["Browser<br/>Language Detection"]
    end

    subgraph ShellLayer["Shell (Host)"]
        LanguageSwitcher["Language Switcher<br/>Navbar Component"]
        I18nProvider["I18nextProvider<br/>Global Context"]
        LanguageStore["Language Store<br/>Zustand"]
    end

    subgraph MFELayer["Micro-Frontends"]
        AuthMFE["Auth MFE<br/>useTranslation()"]
        ChatMFE["Chat MFE<br/>useTranslation()"]
        AdminMFE["Admin MFE<br/>useTranslation()"]
    end

    subgraph TranslationLayer["Translation Files"]
        ENTranslations["en-US/<br/>common.json<br/>auth.json<br/>chat.json"]
        ESTranslations["es-ES/<br/>common.json<br/>auth.json<br/>chat.json"]
        FRTranslations["fr-FR/<br/>common.json<br/>auth.json<br/>chat.json"]
    end

    subgraph UtilsLayer["Shared Utils"]
        DateFormat["Date Formatter<br/>date-fns/locale"]
        NumberFormat["Number Formatter<br/>Intl.NumberFormat"]
        CurrencyFormat["Currency Formatter<br/>Intl.NumberFormat"]
    end

    User --> Browser
    Browser --> LanguageSwitcher
    LanguageSwitcher --> LanguageStore
    LanguageStore --> I18nProvider
    I18nProvider --> AuthMFE
    I18nProvider --> ChatMFE
    I18nProvider --> AdminMFE

    I18nProvider --> ENTranslations
    I18nProvider --> ESTranslations
    I18nProvider --> FRTranslations

    AuthMFE --> DateFormat
    ChatMFE --> DateFormat
    AuthMFE --> NumberFormat
    ChatMFE --> CurrencyFormat

    style UserLayer fill:#e3f2fd
    style ShellLayer fill:#e8f5e9
    style MFELayer fill:#fff3e0
    style TranslationLayer fill:#f3e5f5
    style UtilsLayer fill:#fce4ec
```

---

### 1. Technical Implementation (i18n)

#### Install Dependencies

```bash
# Install i18next and react-i18next
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend

# Install date-fns for date formatting
npm install date-fns

# Install types
npm install --save-dev @types/i18next
```

#### Create i18n Library

```bash
# Create shared i18n library
nx g @nx/js:library i18n --directory=libs/frontend/i18n --importPath=@myapp/frontend/i18n
```

#### i18n Configuration

```typescript
// libs/frontend/i18n/src/lib/i18n.config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

export const supportedLanguages = [
  { code: 'en-US', name: 'English', flag: '', dir: 'ltr' },
  { code: 'es-ES', name: 'Español', flag: '', dir: 'ltr' },
  { code: 'fr-FR', name: 'Français', flag: '', dir: 'ltr' },
  { code: 'de-DE', name: 'Deutsch', flag: '', dir: 'ltr' },
  { code: 'ja-JP', name: '日本語', flag: '', dir: 'ltr' },
  { code: 'zh-CN', name: '简体中文', flag: '', dir: 'ltr' },
  { code: 'ar-SA', name: 'العربية', flag: '', dir: 'rtl' },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]['code'];

export const defaultLanguage: SupportedLanguage = 'en-US';

export const namespaces = [
  'common',
  'auth',
  'chat',
  'admin',
  'profile',
] as const;

export type Namespace = (typeof namespaces)[number];

// Initialize i18next
i18n
  .use(HttpBackend) // Load translations from /public/locales
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    // Default language
    fallbackLng: defaultLanguage,

    // Supported languages
    supportedLngs: supportedLanguages.map((lang) => lang.code),

    // Namespaces
    ns: namespaces,
    defaultNS: 'common',

    // Debug mode (disable in production)
    debug: import.meta.env.DEV,

    // Language detection options
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],

      // Keys for localStorage
      lookupLocalStorage: 'i18nextLng',

      // Cache user language
      caches: ['localStorage'],
    },

    // Backend options for loading translations
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',

      // Allow cross origin requests
      crossDomain: false,
    },

    // React options
    react: {
      // Trigger a rerender when language changes
      useSuspense: false,
    },

    // Interpolation options
    interpolation: {
      // React already escapes values
      escapeValue: false,

      // Format values
      format: (value, format, lng) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (value instanceof Date) {
          return new Intl.DateTimeFormat(lng).format(value);
        }
        return value;
      },
    },
  });

export default i18n;
```

#### Export i18n Module

```typescript
// libs/frontend/i18n/src/index.ts
export { default as i18n } from './lib/i18n.config';
export {
  supportedLanguages,
  defaultLanguage,
  namespaces,
  type SupportedLanguage,
  type Namespace,
} from './lib/i18n.config';
export { useLanguage } from './lib/useLanguage';
export { LanguageSwitcher } from './lib/LanguageSwitcher';
```

#### Update tsconfig.base.json

```json
{
  "compilerOptions": {
    "paths": {
      "@myapp/frontend/i18n": ["libs/frontend/i18n/src/index.ts"]
    }
  }
}
```

---

### 2. Translation File Structure

```
public/locales/
├── en-US/
│   ├── common.json          # Shared translations (buttons, labels)
│   ├── auth.json            # Authentication pages
│   ├── chat.json            # Chat interface
│   ├── admin.json           # Admin dashboard
│   └── profile.json         # User profile
├── es-ES/
│   ├── common.json
│   ├── auth.json
│   ├── chat.json
│   ├── admin.json
│   └── profile.json
├── fr-FR/
│   └── ...
├── de-DE/
│   └── ...
├── ja-JP/
│   └── ...
├── zh-CN/
│   └── ...
└── ar-SA/
    └── ...
```

#### Translation Files

**Common Translations** (`en-US/common.json`):

```json
{
  "app": {
    "name": "AI Chatbot",
    "tagline": "Your intelligent conversation partner"
  },
  "navigation": {
    "home": "Home",
    "chat": "Chat",
    "profile": "Profile",
    "admin": "Admin",
    "logout": "Logout"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "submit": "Submit",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "confirm": "Confirm",
    "search": "Search",
    "filter": "Filter",
    "clear": "Clear",
    "download": "Download",
    "upload": "Upload",
    "copy": "Copy",
    "share": "Share"
  },
  "messages": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success!",
    "noData": "No data available",
    "saveSuccess": "Changes saved successfully",
    "deleteSuccess": "Deleted successfully",
    "confirmDelete": "Are you sure you want to delete this?"
  },
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email",
    "minLength": "Minimum {{count}} characters required",
    "maxLength": "Maximum {{count}} characters allowed",
    "passwordMismatch": "Passwords do not match"
  },
  "language": {
    "select": "Select Language",
    "current": "Current Language"
  },
  "time": {
    "today": "Today",
    "yesterday": "Yesterday",
    "tomorrow": "Tomorrow",
    "now": "Just now",
    "minutesAgo": "{{count}} minute ago",
    "minutesAgo_other": "{{count}} minutes ago",
    "hoursAgo": "{{count}} hour ago",
    "hoursAgo_other": "{{count}} hours ago",
    "daysAgo": "{{count}} day ago",
    "daysAgo_other": "{{count}} days ago"
  }
}
```

**Authentication Translations** (`en-US/auth.json`):

```json
{
  "login": {
    "title": "Welcome Back",
    "subtitle": "Sign in to your account",
    "email": "Email Address",
    "password": "Password",
    "rememberMe": "Remember me",
    "forgotPassword": "Forgot password?",
    "submit": "Sign In",
    "noAccount": "Don't have an account?",
    "signUp": "Sign up",
    "success": "Login successful!",
    "error": "Invalid email or password"
  },
  "register": {
    "title": "Create Account",
    "subtitle": "Get started with AI Chatbot",
    "name": "Full Name",
    "email": "Email Address",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "terms": "I agree to the Terms of Service and Privacy Policy",
    "submit": "Create Account",
    "hasAccount": "Already have an account?",
    "signIn": "Sign in",
    "success": "Account created successfully!"
  },
  "forgotPassword": {
    "title": "Reset Password",
    "subtitle": "Enter your email to receive reset instructions",
    "email": "Email Address",
    "submit": "Send Reset Link",
    "backToLogin": "Back to login",
    "success": "Reset link sent! Check your email."
  }
}
```

**Chat Translations** (`en-US/chat.json`):

```json
{
  "interface": {
    "newChat": "New Chat",
    "conversations": "Conversations",
    "placeholder": "Type your message...",
    "send": "Send",
    "typing": "AI is typing...",
    "stop": "Stop generating",
    "regenerate": "Regenerate response",
    "copy": "Copy message",
    "delete": "Delete message"
  },
  "sidebar": {
    "search": "Search conversations...",
    "today": "Today",
    "yesterday": "Yesterday",
    "last7Days": "Last 7 Days",
    "last30Days": "Last 30 Days",
    "older": "Older",
    "empty": "No conversations yet",
    "emptyHint": "Start a new chat to begin"
  },
  "conversation": {
    "rename": "Rename conversation",
    "delete": "Delete conversation",
    "confirmDelete": "Are you sure you want to delete this conversation? This action cannot be undone.",
    "deleted": "Conversation deleted",
    "renamed": "Conversation renamed"
  },
  "message": {
    "user": "You",
    "assistant": "AI Assistant",
    "error": "Failed to send message. Please try again.",
    "tooLong": "Message is too long. Maximum {{max}} characters.",
    "rateLimit": "Too many messages. Please wait {{seconds}} seconds."
  },
  "models": {
    "select": "Select Model",
    "gpt4": "GPT-4 (Most Capable)",
    "gpt35": "GPT-3.5 (Faster)",
    "claude": "Claude (Anthropic)"
  }
}
```

**Spanish Translation Example** (`es-ES/common.json`):

```json
{
  "app": {
    "name": "AI Chatbot",
    "tagline": "Tu compañero de conversación inteligente"
  },
  "navigation": {
    "home": "Inicio",
    "chat": "Chat",
    "profile": "Perfil",
    "admin": "Administración",
    "logout": "Cerrar sesión"
  },
  "actions": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "create": "Crear",
    "submit": "Enviar",
    "close": "Cerrar",
    "back": "Atrás",
    "next": "Siguiente",
    "previous": "Anterior",
    "confirm": "Confirmar",
    "search": "Buscar",
    "filter": "Filtrar",
    "clear": "Limpiar"
  }
}
```

---

### 3. Shell Integration

#### Initialize i18n in Shell

```typescript
// apps/shell/src/main.tsx
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@myapp/frontend/i18n';
import App from './app/App';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </I18nextProvider>
  </StrictMode>
);
```

#### Language Store

```typescript
// libs/frontend/stores/src/lib/language.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SupportedLanguage } from '@myapp/frontend/i18n';

export interface LanguageState {
  language: SupportedLanguage;
  direction: 'ltr' | 'rtl';

  // Actions
  setLanguage: (language: SupportedLanguage, direction: 'ltr' | 'rtl') => void;
  setDirection: (direction: 'ltr' | 'rtl') => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en-US',
      direction: 'ltr',

      setLanguage: (language, direction) => set({ language, direction }),
      setDirection: (direction) => set({ direction }),
    }),
    { name: 'language-storage' }
  )
);
```

#### Language Switcher Component

```typescript
// libs/frontend/i18n/src/lib/LanguageSwitcher.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from './i18n.config';
import { useLanguageStore } from '@myapp/frontend/stores';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const { setLanguage: setStoreLanguage, setDirection } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = supportedLanguages.find(
    lang => lang.code === i18n.language
  ) || supportedLanguages[0];

  const handleLanguageChange = async (langCode: SupportedLanguage) => {
    const selectedLang = supportedLanguages.find(lang => lang.code === langCode);
    if (!selectedLang) return;

    // Change i18next language
    await i18n.changeLanguage(langCode);

    // Update store
    setStoreLanguage(langCode, selectedLang.dir);

    // Update HTML dir attribute for RTL support
    document.documentElement.dir = selectedLang.dir;
    document.documentElement.lang = langCode;

    setIsOpen(false);
  };

  // Set initial direction
  useEffect(() => {
    document.documentElement.dir = currentLanguage.dir;
    document.documentElement.lang = currentLanguage.code;
    setDirection(currentLanguage.dir);
  }, [currentLanguage, setDirection]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors"
        aria-label={t('language.select')}
      >
        <span className="text-xl">{currentLanguage.flag}</span>
        <span className="text-sm font-medium">{currentLanguage.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
            <div className="py-2">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={
                    `w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-100 transition-colors ${
                      lang.code === currentLanguage.code
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-700'
                    }`
                  }
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="flex-1 text-sm font-medium">{lang.name}</span>
                  {lang.code === currentLanguage.code && (
                    <svg
                      className="w-5 h-5 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

#### Add Language Switcher to Navbar

```typescript
// apps/shell/src/components/Navbar.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@myapp/frontend/i18n';
import { useAuthStore } from '@myapp/frontend/stores';

export function Navbar() {
  const { t } = useTranslation('common');
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-primary-600">
              {t('app.name')}
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link to="/chat" className="text-neutral-700 hover:text-primary-600">
                  {t('navigation.chat')}
                </Link>
                <Link to="/profile" className="text-neutral-700 hover:text-primary-600">
                  {t('navigation.profile')}
                </Link>
              </>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {isAuthenticated && (
              <button
                onClick={logout}
                className="text-neutral-700 hover:text-primary-600"
              >
                {t('navigation.logout')}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

---

### 4. Using Translations in MFEs

#### useTranslation Hook

```typescript
// In any MFE component
import { useTranslation } from 'react-i18next';

export function LoginForm() {
  const { t } = useTranslation('auth');

  return (
    <form>
      <h1>{t('login.title')}</h1>
      <p>{t('login.subtitle')}</p>

      <input
        type="email"
        placeholder={t('login.email')}
      />

      <input
        type="password"
        placeholder={t('login.password')}
      />

      <button type="submit">
        {t('login.submit')}
      </button>

      <p>
        {t('login.noAccount')}{' '}
        <a href="/register">{t('login.signUp')}</a>
      </p>
    </form>
  );
}
```

#### Translation with Interpolation

```typescript
import { useTranslation } from 'react-i18next';

export function UserProfile({ user }: { user: User }) {
  const { t } = useTranslation('profile');

  return (
    <div>
      <h1>{t('welcome', { name: user.name })}</h1>
      {/* Translation: "Welcome, {{name}}!" */}

      <p>{t('memberSince', { date: user.createdAt })}</p>
      {/* Translation: "Member since {{date, date}}" */}

      <p>{t('messageCount', { count: user.messageCount })}</p>
      {/* Translation with pluralization:
          - "messageCount_one": "{{count}} message"
          - "messageCount_other": "{{count}} messages"
      */}
    </div>
  );
}
```

#### Translation with Components

```typescript
import { Trans, useTranslation } from 'react-i18next';

export function TermsNotice() {
  const { t } = useTranslation('auth');

  return (
    <p>
      <Trans
        i18nKey="auth:register.termsText"
        components={{
          terms: <a href="/terms" className="text-primary-600" />,
          privacy: <a href="/privacy" className="text-primary-600" />,
        }}
      />
      {/* Translation: "I agree to the <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>" */}
    </p>
  );
}
```

---

### 5. Localization (l10n)

#### Date Formatting

```typescript
// libs/frontend/utils/src/lib/date-format.ts
import { format as dateFnsFormat } from 'date-fns';
import { enUS, es, fr, de, ja, zhCN, ar } from 'date-fns/locale';
import type { SupportedLanguage } from '@myapp/frontend/i18n';

const localeMap: Record<SupportedLanguage, Locale> = {
  'en-US': enUS,
  'es-ES': es,
  'fr-FR': fr,
  'de-DE': de,
  'ja-JP': ja,
  'zh-CN': zhCN,
  'ar-SA': ar,
};

export function formatDate(
  date: Date | string,
  pattern: string,
  language: SupportedLanguage
): string {
  const locale = localeMap[language];
  return dateFnsFormat(new Date(date), pattern, { locale });
}

export function formatRelativeTime(
  date: Date | string,
  language: SupportedLanguage
): string {
  const locale = localeMap[language];
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    return dateFnsFormat(target, 'PPP', { locale });
  }
}
```

**Usage**:

```typescript
import { useTranslation } from 'react-i18next';
import { formatDate } from '@myapp/frontend/utils';

export function MessageTimestamp({ date }: { date: Date }) {
  const { i18n } = useTranslation();

  return (
    <time dateTime={date.toISOString()}>
      {formatDate(date, 'PPp', i18n.language as SupportedLanguage)}
    </time>
  );
}
```

#### Number Formatting

```typescript
// libs/frontend/utils/src/lib/number-format.ts
import type { SupportedLanguage } from '@myapp/frontend/i18n';

export function formatNumber(
  value: number,
  language: SupportedLanguage,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(language, options).format(value);
}

export function formatCurrency(
  value: number,
  currency: string,
  language: SupportedLanguage
): string {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatPercent(
  value: number,
  language: SupportedLanguage
): string {
  return new Intl.NumberFormat(language, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
```

**Usage**:

```typescript
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber } from '@myapp/frontend/utils';

export function PricingCard({ price, messageCount }: Props) {
  const { i18n } = useTranslation();

  return (
    <div>
      <h3>{formatCurrency(price, 'USD', i18n.language)}</h3>
      {/* Output:
        - en-US: $29.99
        - es-ES: 29,99 US$
        - fr-FR: 29,99 $US
        - de-DE: 29,99 $
        - ja-JP: $29.99
      */}

      <p>{formatNumber(messageCount, i18n.language)} messages</p>
      {/* Output:
        - en-US: 1,000 messages
        - es-ES: 1.000 messages
        - fr-FR: 1 000 messages
        - de-DE: 1.000 messages
      */}
    </div>
  );
}
```

#### Pluralization

```json
// en-US/common.json
{
  "items": {
    "count_one": "{{count}} item",
    "count_other": "{{count}} items"
  },
  "messages": {
    "unread_zero": "No unread messages",
    "unread_one": "{{count}} unread message",
    "unread_other": "{{count}} unread messages"
  }
}

// es-ES/common.json
{
  "items": {
    "count_one": "{{count}} artículo",
    "count_other": "{{count}} artículos"
  },
  "messages": {
    "unread_zero": "No hay mensajes sin leer",
    "unread_one": "{{count}} mensaje sin leer",
    "unread_other": "{{count}} mensajes sin leer"
  }
}
```

**Usage**:

```typescript
import { useTranslation } from 'react-i18next';

export function MessageBadge({ count }: { count: number }) {
  const { t } = useTranslation('common');

  return (
    <span className="badge">
      {t('messages.unread', { count })}
    </span>
  );
}
```

---

### 6. RTL (Right-to-Left) Support

#### CSS for RTL

```css
/* apps/shell/src/styles/rtl.css */

/* Automatically flip margins and paddings for RTL */
[dir='rtl'] {
  direction: rtl;
}

/* Flip flex direction */
[dir='rtl'] .flex-row {
  flex-direction: row-reverse;
}

/* Flip text alignment */
[dir='rtl'] .text-left {
  text-align: right;
}

[dir='rtl'] .text-right {
  text-align: left;
}

/* Flip icons */
[dir='rtl'] .icon-chevron-right {
  transform: scaleX(-1);
}

/* Custom RTL utilities */
.ms-4 {
  margin-inline-start: 1rem; /* 16px */
}

.me-4 {
  margin-inline-end: 1rem; /* 16px */
}

.ps-4 {
  padding-inline-start: 1rem;
}

.pe-4 {
  padding-inline-end: 1rem;
}
```

#### Tailwind CSS Logical Properties

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      // Add logical properties support
      spacing: {
        // Use ms-* (margin-inline-start) instead of ml-* (margin-left)
        // Use me-* (margin-inline-end) instead of mr-* (margin-right)
      },
    },
  },
  plugins: [
    // Plugin for logical properties
    function ({ addUtilities }) {
      addUtilities({
        '.start-0': { 'inset-inline-start': '0' },
        '.end-0': { 'inset-inline-end': '0' },
      });
    },
  ],
};
```

#### RTL-Aware Components

```typescript
import { useLanguageStore } from '@myapp/frontend/stores';

export function ChatMessage({ message }: { message: Message }) {
  const { direction } = useLanguageStore();
  const isRTL = direction === 'rtl';

  return (
    <div
      className={`flex items-start gap-3 ${
        message.role === 'user'
          ? isRTL ? 'flex-row' : 'flex-row-reverse'
          : isRTL ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <Avatar user={message.user} />
      <div className="flex-1">
        <p className={isRTL ? 'text-right' : 'text-left'}>
          {message.content}
        </p>
      </div>
    </div>
  );
}
```

---

### 7. Translation Management Workflow

#### Adding New Languages

1. **Create translation files**:

```bash
# Create new language directory
mkdir -p public/locales/pt-BR

# Copy English files as template
cp -r public/locales/en-US/* public/locales/pt-BR/

# Translate each file
vim public/locales/pt-BR/common.json
```

2. **Add language to config**:

```typescript
// libs/frontend/i18n/src/lib/i18n.config.ts
export const supportedLanguages = [
  // ... existing languages
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '', dir: 'ltr' },
] as const;
```

3. **Test new language**:

```bash
npm run dev
# Open app, switch to new language in UI
```

#### Translation Tools Integration

**Option 1: Lokalise** (Recommended)

```bash
# Install Lokalise CLI
npm install -g @lokalise/cli

# Upload translation files
lokalise2 file upload \
  --project-id=<PROJECT_ID> \
  --file=public/locales/en-US/common.json \
  --lang-iso=en_US

# Download translations
lokalise2 file download \
  --project-id=<PROJECT_ID> \
  --format=json \
  --dest=public/locales/
```

**Option 2: Crowdin**

```yaml
# crowdin.yml
project_id: 'your-project-id'
api_token: 'your-api-token'
base_path: '.'

files:
  - source: /public/locales/en-US/**/*.json
    translation: /public/locales/%locale%/**/%original_file_name%
```

#### Missing Translation Handling

```typescript
// libs/frontend/i18n/src/lib/i18n.config.ts
i18n.init({
  // ... other config

  // Handle missing translations
  saveMissing: import.meta.env.DEV, // Save missing keys in dev mode

  missingKeyHandler: (lngs, ns, key, fallbackValue) => {
    if (import.meta.env.DEV) {
      console.warn(
        `Missing translation key: "${key}" in namespace "${ns}" for languages: ${lngs.join(', ')}`
      );
    }
  },

  // Return key as fallback
  returnEmptyString: false,
  returnNull: false,
});
```

---

### 8. Testing Multilingual Features

#### Unit Testing with i18next

```typescript
// libs/frontend/ui-components/src/lib/Button/Button.spec.tsx
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { Button } from './Button';

// Initialize i18n for tests
i18n.init({
  lng: 'en-US',
  resources: {
    'en-US': {
      common: {
        'actions.save': 'Save',
        'actions.cancel': 'Cancel',
      },
    },
    'es-ES': {
      common: {
        'actions.save': 'Guardar',
        'actions.cancel': 'Cancelar',
      },
    },
  },
});

function renderWithI18n(component: React.ReactElement) {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
}

describe('Button', () => {
  it('renders in English', () => {
    i18n.changeLanguage('en-US');
    renderWithI18n(<Button>{i18n.t('common:actions.save')}</Button>);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders in Spanish', () => {
    i18n.changeLanguage('es-ES');
    renderWithI18n(<Button>{i18n.t('common:actions.save')}</Button>);
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });
});
```

#### E2E Testing with Cypress

```typescript
// apps/shell-e2e/src/e2e/language-switching.cy.ts
describe('Language Switching', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('switches to Spanish', () => {
    // Open language switcher
    cy.contains('English').click();

    // Select Spanish
    cy.contains('Español').click();

    // Verify Spanish text appears
    cy.contains('Iniciar sesión').should('be.visible');
  });

  it('persists language preference', () => {
    // Switch to French
    cy.contains('English').click();
    cy.contains('Français').click();

    // Reload page
    cy.reload();

    // Verify French is still selected
    cy.contains('Français').should('be.visible');
    cy.contains('Se connecter').should('be.visible');
  });

  it('displays RTL layout for Arabic', () => {
    // Switch to Arabic
    cy.contains('English').click();
    cy.contains('العربية').click();

    // Verify RTL direction
    cy.get('html').should('have.attr', 'dir', 'rtl');
  });
});
```

---

### 9. Best Practices

#### Translation Key Naming Conventions

```
GOOD:
auth.login.title
auth.login.email
common.actions.save
common.validation.required
chat.message.error

BAD:
loginTitle
emailField
saveButton
errorMessage
```

**Convention**: `namespace.feature.element`

#### Avoid Hardcoded Text

```typescript
// BAD: Hardcoded text
export function Welcome() {
  return <h1>Welcome to AI Chatbot</h1>;
}

// GOOD: Use translations
export function Welcome() {
  const { t } = useTranslation('common');
  return <h1>{t('app.welcome')}</h1>;
}
```

#### Extract Common Strings

```json
// GOOD: Reuse common translations
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete"
    }
  }
}

// BAD: Duplicate translations
{
  "auth": {
    "save": "Save"
  },
  "profile": {
    "save": "Save"
  },
  "chat": {
    "save": "Save"
  }
}
```

#### Use Interpolation for Dynamic Content

```typescript
// GOOD: Use interpolation
{
  "welcome": "Welcome, {{name}}!",
  "messageCount": "You have {{count}} new messages"
}

// BAD: Concatenation
const message = `Welcome, ${user.name}!`;
```

#### Handle Pluralization Properly

```json
// GOOD: Proper pluralization
{
  "items": {
    "count_zero": "No items",
    "count_one": "{{count}} item",
    "count_other": "{{count}} items"
  }
}

// BAD: Manual pluralization
{
  "items": "{{count}} item(s)"
}
```

---

### 10. Performance Optimization

#### Lazy Loading Translations

```typescript
// Load translations on demand
i18n.init({
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',

    // Load only needed namespaces
    allowMultiLoading: false,
  },

  // Preload only default language
  preload: ['en-US'],

  // Lazy load other languages
  load: 'languageOnly',
});
```

#### Code Splitting by Language

```typescript
// Dynamic import for heavy language data
const loadLanguageData = async (language: SupportedLanguage) => {
  switch (language) {
    case 'ja-JP':
      return import('./locales/ja-JP/index');
    case 'zh-CN':
      return import('./locales/zh-CN/index');
    default:
      return null;
  }
};
```

#### Cache Translations

```typescript
// Cache translations in localStorage
i18n.init({
  cache: {
    enabled: true,
    prefix: 'i18next_res_',
    expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});
```

---

### 11. Troubleshooting

#### Issue 1: Translations Not Loading

**Symptoms**: Keys displayed instead of translated text

**Solutions**:

```bash
# 1. Check translation files exist
ls -la public/locales/en-US/

# 2. Verify file paths in backend config
# loadPath should match actual file location

# 3. Check browser network tab for 404 errors

# 4. Verify namespace is loaded
i18n.loadNamespaces(['auth', 'chat']);
```

#### Issue 2: Language Not Persisting

**Solution**:

```typescript
// Ensure localStorage is enabled
i18n.init({
  detection: {
    caches: ['localStorage'], // Enable caching
  },
});

// Clear localStorage if corrupted
localStorage.removeItem('i18nextLng');
```

#### Issue 3: RTL Layout Issues

**Solution**:

```typescript
// Ensure dir attribute is set
useEffect(() => {
  document.documentElement.dir = direction;
}, [direction]);

// Use logical properties in CSS
/* Instead of: margin-left: 1rem; */
margin-inline-start: 1rem; /* RTL-aware */
```

---

### 12. i18n Checklist

**Setup Checklist**:

- [ ] Install i18next and react-i18next
- [ ] Create i18n configuration library
- [ ] Add supported languages to config
- [ ] Create translation file structure
- [ ] Initialize i18n in Shell
- [ ] Add LanguageSwitcher to Navbar
- [ ] Update tsconfig.base.json paths

**Translation Checklist**:

- [ ] All user-facing text uses t() function
- [ ] No hardcoded strings in components
- [ ] Translation keys follow naming convention
- [ ] Common strings extracted to common.json
- [ ] Pluralization implemented correctly
- [ ] Interpolation used for dynamic content
- [ ] Date/time formatting localized
- [ ] Number/currency formatting localized

**RTL Checklist**:

- [ ] HTML dir attribute set correctly
- [ ] CSS uses logical properties (margin-inline-start)
- [ ] Flexbox direction adjusted for RTL
- [ ] Icons flipped where needed
- [ ] Text alignment adapts to direction
- [ ] Layout tested in Arabic

**Testing Checklist**:

- [ ] Unit tests with mocked i18n
- [ ] E2E tests for language switching
- [ ] RTL layout tested
- [ ] Translation loading tested
- [ ] Missing translation handling tested
- [ ] Language persistence tested

---

## Routing Strategy

### Communication Patterns Overview

```mermaid
graph LR
    subgraph Pattern1["1. Shared State (Primary)"]
        P1["Zustand Store<br/>Real-time sync"]
    end

    subgraph Pattern2["2. URL Parameters (Future)"]
        P2["Query Params<br/>Deep linking"]
    end

    subgraph Pattern3["3. Custom Events (Future)"]
        P3["window.dispatchEvent<br/>Loose coupling"]
    end

    subgraph Pattern4["4. Shared Query Cache"]
        P4["TanStack Query<br/>Server state sync"]
    end

    Pattern1 --> Pattern2
    Pattern2 --> Pattern3
    Pattern3 --> Pattern4

    style Pattern1 fill:#e8f5e9
    style Pattern2 fill:#fff3e0
    style Pattern3 fill:#fce4ec
    style Pattern4 fill:#e3f2fd
    style P1 fill:#a5d6a7
    style P2 fill:#ffcc80
    style P3 fill:#f48fb1
    style P4 fill:#90caf9
```

### Pattern 1: Shared Zustand Store (Implemented)

**Use Case**: Authentication state shared across all MFEs

```mermaid
graph TB
    subgraph ZustandStore["Zustand Store (Singleton)"]
        AuthState["<div style='text-align: left'>Auth State:<br/>• user<br/>• accessToken<br/>• refreshToken<br/>• isAuthenticated</div>"]
    end

    AuthMFE["Auth MFE<br/>setAuth(user, tokens)"]
    ShellNavbar["Shell Navbar<br/>const {user} = useAuthStore()"]
    ProfileMFE["Profile MFE<br/>setUser(newData)"]
    AdminMFE["Admin MFE<br/>hasRole('ADMIN')"]

    AuthMFE -->|Write| AuthState
    ShellNavbar -->|Read| AuthState
    ProfileMFE -->|Read/Write| AuthState
    AdminMFE -->|Read| AuthState

    AuthState -.->|"Auto-notify"| ShellNavbar
    AuthState -.->|"Auto-notify"| ProfileMFE
    AuthState -.->|"Auto-notify"| AdminMFE

    style ZustandStore fill:#e8f5e9
    style AuthState fill:#a5d6a7
    style AuthMFE fill:#bbdefb
    style ShellNavbar fill:#bbdefb
    style ProfileMFE fill:#bbdefb
    style AdminMFE fill:#bbdefb
```

**Code Example:**

```typescript
// Auth MFE: Login component
const { setAuth } = useAuthStore();
setAuth(user, accessToken, refreshToken);

// Shell: Navbar component
const { user } = useAuthStore();
return <div>Welcome, {user?.name}</div>;

// Profile MFE: Profile page
const { user, setUser } = useAuthStore();
const handleUpdate = () => {
  setUser({ ...user, name: 'New Name' });
  // Shell navbar updates immediately
};

// Admin MFE: Check permissions
const { user } = useAuthStore();
if (user?.role === 'ADMIN') {
  // Show admin actions
}
```

**Advantages:**

- Real-time synchronization
- Type-safe
- Persists across page refreshes
- No boilerplate

**Disadvantages:**

- All MFEs must import same store
- Cannot easily version stores

### Pattern 2: URL State (Future)

**Use Case**: Deep linking and shareable URLs

```mermaid
sequenceDiagram
    participant Admin as Admin MFE
    participant Router as React Router
    participant URL as Browser URL
    participant Profile as Profile MFE

    Admin->>Router: navigate('/profile?userId=abc-123&tab=security')
    Router->>URL: Update URL
    Router->>Profile: Load Profile MFE
    Profile->>URL: useSearchParams()
    URL-->>Profile: userId='abc-123', tab='security'
    Profile->>Profile: Load user abc-123<br/>Show security tab

    Note over URL,Profile: URL is shareable<br/>Back/Forward works
```

**Code Example:**

```typescript
// Admin MFE: Navigate with user ID
navigate('/profile?userId=abc-123&tab=security');

// Profile MFE: Read from URL
const [searchParams] = useSearchParams();
const userId = searchParams.get('userId');
const tab = searchParams.get('tab');
```

**Advantages:**

- Shareable links
- Browser back/forward works
- No shared dependencies

**When to Use:**

- Deep linking (e.g., admin clicks user → opens profile)
- Filters and pagination state
- Modal/dialog state in URLs

### Pattern 3: Custom Events (Future)

**Use Case**: Loose coupling between MFEs

```mermaid
sequenceDiagram
    participant Chatbot as Chatbot MFE
    participant Window as window (Event Bus)
    participant Shell as Shell
    participant Navbar as Shell Navbar

    Chatbot->>Chatbot: User sends message
    Chatbot->>Window: dispatchEvent('chatbot:message-sent')
    Note over Window: Event: {conversationId, messageCount}

    Window->>Shell: Event propagates
    Shell->>Navbar: Event listener triggered
    Navbar->>Navbar: updateNotificationBadge(messageCount)
    Navbar->>Navbar: Show badge: "3 new messages"

    Note over Chatbot,Navbar: Chatbot doesn't know about Navbar<br/>Loose coupling maintained
```

**Code Example:**

```typescript
// Chatbot MFE: Dispatch event
const sendMessage = async () => {
  // ... send message
  window.dispatchEvent(
    new CustomEvent('chatbot:message-sent', {
      detail: { conversationId, messageCount },
    })
  );
};

// Shell: Listen for event
useEffect(() => {
  const handler = (e: CustomEvent) => {
    updateNotificationBadge(e.detail.messageCount);
  };
  window.addEventListener('chatbot:message-sent', handler);
  return () => window.removeEventListener('chatbot:message-sent', handler);
}, []);
```

**Advantages:**

- Loose coupling
- MFEs do not need to know about each other
- Can have multiple listeners

**Disadvantages:**

- No type safety
- Hard to track event flow
- Testing more complex

### Pattern 4: Shared Query Cache (Implemented)

**Use Case**: Server data consistency

```mermaid
sequenceDiagram
    participant Profile as Profile MFE
    participant QC as TanStack Query Cache
    participant Admin as Admin MFE
    participant Shell as Shell Navbar
    participant API as Backend API

    Profile->>API: PATCH /users/123 (update name)
    API-->>Profile: 200 OK
    Profile->>QC: invalidateQueries(['user'])

    Note over QC: Mark all 'user' queries as stale

    QC->>Admin: Auto-refetch ['users']
    Admin->>API: GET /users
    API-->>Admin: Updated user list

    QC->>Shell: Auto-refetch ['user', 123]
    Shell->>API: GET /users/123
    API-->>Shell: Updated user data

    Note over Profile,Shell: All MFEs see fresh data<br/>No manual coordination needed
```

**Code Example:**

```typescript
// Profile MFE: Update user
const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    // Invalidate ALL queries with 'user' key
    queryClient.invalidateQueries({ queryKey: ['user'] });
  },
});

// Admin MFE: Fetch users (automatically refetches)
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

// Shell Navbar: User profile (also refetches)
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});
```

**Advantages:**

- Automatic cache invalidation
- Background refetching
- Optimistic updates
- Built-in loading/error states

---

## Security

### Overview

Security in a Micro-Frontend architecture requires careful consideration at multiple layers: authentication, authorization, data protection, and secure communication between MFEs. This section outlines the security measures implemented and best practices.

### 1. Authentication & Authorization

#### Token-Based Authentication

The application uses JWT (JSON Web Tokens) for stateless authentication:

```typescript
// libs/frontend/api-client/src/config.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

#### Secure Token Storage

**Current Implementation:**

- Access tokens: `localStorage` (short-lived, 15 minutes)
- Refresh tokens: `httpOnly` cookies (long-lived, 7 days)
- User data: Zustand store with `localStorage` persistence

**Security Considerations:**

| Storage Method     | Security Level | Trade-offs                                          |
| ------------------ | -------------- | --------------------------------------------------- |
| `localStorage`     | Medium         | Vulnerable to XSS, but convenient for SPAs          |
| `httpOnly` cookies | High           | Immune to XSS, but requires backend coordination    |
| `sessionStorage`   | Medium         | Cleared on tab close, more secure than localStorage |
| Memory only        | Highest        | Lost on refresh, poor UX                            |

**Recommendation for Production:**

```typescript
// Use httpOnly cookies for refresh tokens
// Store access tokens in memory with automatic refresh

class TokenManager {
  private accessToken: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  setAccessToken(token: string, expiresIn: number) {
    this.accessToken = token;
    // Auto-refresh 1 minute before expiry
    this.scheduleRefresh(expiresIn - 60);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private scheduleRefresh(delaySeconds: number) {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken();
    }, delaySeconds * 1000);
  }

  private async refreshAccessToken() {
    // Refresh token is in httpOnly cookie, automatically sent
    const response = await apiClient.post('/auth/refresh');
    this.setAccessToken(response.data.accessToken, response.data.expiresIn);
  }

  clearTokens() {
    this.accessToken = null;
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
  }
}

export const tokenManager = new TokenManager();
```

#### Role-Based Access Control (RBAC)

```typescript
// libs/frontend/stores/src/lib/auth.store.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  hasRole: (role: string) => {
    const user = get().user;
    return user?.role === role || user?.role === 'ADMIN';
  },

  hasPermission: (permission: string) => {
    const user = get().user;
    const rolePermissions: Record<string, string[]> = {
      ADMIN: ['read', 'write', 'delete', 'manage_users'],
      USER: ['read', 'write'],
      GUEST: ['read'],
    };
    return rolePermissions[user?.role || 'GUEST']?.includes(permission);
  },
}));
```

**Usage in Components:**

```typescript
import { useAuthStore } from '@myapp/frontend/stores';

function AdminPanel() {
  const hasRole = useAuthStore((state) => state.hasRole);

  if (!hasRole('ADMIN')) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Content</div>;
}
```

### 2. Cross-Site Scripting (XSS) Protection

#### Input Sanitization

```typescript
// libs/frontend/utils/src/sanitize.ts
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

/**
 * Escape user input for display
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}
```

**Usage in Chat Messages:**

```typescript
import { sanitizeHTML } from '@myapp/frontend/utils';

function ChatMessage({ content }: { content: string }) {
  // Sanitize user-generated content before rendering
  const safeContent = sanitizeHTML(content);

  return <div dangerouslySetInnerHTML={{ __html: safeContent }} />;
}
```

#### Content Security Policy (CSP)

**Recommended CSP Headers (Backend Configuration):**

```typescript
// apps/auth-service/src/middleware/security.middleware.ts
import helmet from 'helmet';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Module Federation requires inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'http://localhost:3000', 'http://localhost:3001'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});
```

### 3. Cross-Site Request Forgery (CSRF) Protection

#### CSRF Token Implementation

```typescript
// Backend: Generate CSRF token
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

app.use(csrfProtection);

// Send CSRF token to frontend
app.get('/auth/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

```typescript
// Frontend: Include CSRF token in requests
import { apiClient } from '@myapp/frontend/api-client';

// Fetch CSRF token on app initialization
const { data } = await apiClient.get('/auth/csrf-token');
const csrfToken = data.csrfToken;

// Include in state-changing requests
apiClient.interceptors.request.use((config) => {
  if (
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      config.method?.toUpperCase() || ''
    )
  ) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});
```

### 4. Secure Module Federation

#### Remote Entry Validation

```typescript
// apps/shell/src/utils/validateRemote.ts
/**
 * Validate that remote MFE is from trusted domain
 */
export function validateRemoteURL(url: string): boolean {
  const trustedDomains = [
    'http://localhost:5174', // Auth MFE (dev)
    'http://localhost:5175', // Chatbot MFE (dev)
    'https://auth.myapp.com', // Production
    'https://chatbot.myapp.com', // Production
  ];

  return trustedDomains.some((domain) => url.startsWith(domain));
}

// Use in federation config
federation({
  remotes: {
    authMfe: {
      external: validateRemoteURL(process.env.VITE_AUTH_MFE_URL)
        ? process.env.VITE_AUTH_MFE_URL
        : undefined,
    },
  },
});
```

#### Subresource Integrity (SRI)

```typescript
// Production: Add integrity hashes to remote entries
// vite.config.ts (production build)
import { createHash } from 'crypto';

export default defineConfig({
  plugins: [
    federation({
      filename: 'remoteEntry.js',
      manifest: true, // Generate manifest with integrity hashes
    }),
    {
      name: 'add-sri-hashes',
      writeBundle() {
        // Calculate SHA-384 hash of remoteEntry.js
        const content = fs.readFileSync('dist/remoteEntry.js');
        const hash = createHash('sha384').update(content).digest('base64');

        // Write to manifest
        const manifest = {
          integrity: `sha384-${hash}`,
        };
        fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest));
      },
    },
  ],
});
```

### 5. Environment Variables & Secrets Management

#### Secure Configuration

```bash
# .env.local (NEVER commit to git)
VITE_API_URL=http://localhost:3000
VITE_AUTH_MFE_URL=http://localhost:5174
VITE_CHATBOT_MFE_URL=http://localhost:5175

# Sensitive keys (use secret management service in production)
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

**Best Practices:**

1. **Never expose secrets in frontend code**

   ```typescript
   // Bad: API key in frontend
   const response = await fetch('https://api.openai.com', {
     headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }, // Exposed in browser
   });

   // Good: Proxy through backend
   const response = await apiClient.post('/chat/completions', { prompt });
   ```

2. **Use different secrets per environment**

   ```bash
   # Development
   JWT_SECRET=dev-secret-12345

   # Production (from secret manager)
   JWT_SECRET=prod-complex-secret-from-vault
   ```

3. **Rotate secrets regularly**
   - JWT secrets: Every 90 days
   - API keys: Every 180 days
   - Database passwords: Every 90 days

### 6. Audit Logging

```typescript
// libs/backend/logger/src/audit-logger.ts
import { Logger } from './logger';

interface AuditEvent {
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('Audit');
  }

  logEvent(event: AuditEvent) {
    this.logger.info('Audit Event', {
      ...event,
      severity: event.success ? 'INFO' : 'WARNING',
    });

    // Store in dedicated audit log table
    // Send to SIEM system (Splunk, ELK, etc.)
  }

  logAuthAttempt(userId: string, success: boolean, ipAddress: string) {
    this.logEvent({
      userId,
      action: 'LOGIN_ATTEMPT',
      resource: 'auth',
      timestamp: new Date(),
      ipAddress,
      userAgent: '',
      success,
    });
  }

  logDataAccess(
    userId: string,
    resource: string,
    action: 'READ' | 'WRITE' | 'DELETE'
  ) {
    this.logEvent({
      userId,
      action,
      resource,
      timestamp: new Date(),
      ipAddress: '',
      userAgent: '',
      success: true,
    });
  }
}
```

### 7. Security Checklist

#### Development

- [ ] Use HTTPS in production
- [ ] Validate all user inputs (Zod schemas)
- [ ] Sanitize HTML output (DOMPurify)
- [ ] Implement rate limiting (Redis)
- [ ] Use httpOnly cookies for refresh tokens
- [ ] Enable CORS only for trusted origins
- [ ] Add CSP headers
- [ ] Implement CSRF protection

#### Deployment

- [ ] Remove console.logs with sensitive data
- [ ] Rotate all secrets before deployment
- [ ] Enable audit logging
- [ ] Set up intrusion detection
- [ ] Configure WAF (Web Application Firewall)
- [ ] Enable DDoS protection (Cloudflare)
- [ ] Set up automated security scanning (Snyk, OWASP ZAP)
- [ ] Review dependencies for vulnerabilities

#### Monitoring

- [ ] Monitor failed login attempts
- [ ] Alert on suspicious activity patterns
- [ ] Track API rate limit violations
- [ ] Log all privilege escalations
- [ ] Monitor file uploads for malware
- [ ] Track data export requests
- [ ] Alert on multiple password reset attempts

---

## Performance

### Overview

Performance optimization in Micro-Frontend architecture involves minimizing load times, reducing bundle sizes, optimizing network requests, and ensuring smooth user interactions. This section covers implemented optimizations and recommendations.

### 1. Code Splitting & Lazy Loading

#### Module Federation Lazy Loading

All remote MFEs are loaded on-demand using React's `lazy()`:

```typescript
// apps/shell/src/routes/index.tsx
import { lazy, Suspense } from 'react';

// Lazy load remote MFEs - loaded only when route is accessed
const AuthModule = lazy(() => import('authMfe/Module'));
const ChatbotModule = lazy(() => import('chatbotMfe/Module'));
const AdminModule = lazy(() => import('adminMfe/Module'));
const ProfileModule = lazy(() => import('profileMfe/Module'));

export const routes = [
  {
    path: '/auth/*',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AuthModule />
      </Suspense>
    ),
  },
  // Other routes...
];
```

**Performance Impact:**

- Initial bundle size: ~150KB (shell only)
- Auth MFE loads on-demand: +80KB
- Chatbot MFE loads on-demand: +120KB
- Total potential savings: 60% smaller initial load

#### Route-Based Code Splitting

```typescript
// Additional splitting within MFEs
// apps/chatbot-mfe/src/app/app.tsx
const ChatPage = lazy(() => import('./pages/ChatPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/chatbot" element={<ChatPage />} />
        <Route path="/chatbot/history" element={<HistoryPage />} />
        <Route path="/chatbot/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Bundle Optimization

#### Shared Dependencies

Module Federation shares React, ReactDOM, and other common libraries:

```typescript
// vite.config.ts
federation({
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^19.0.0',
      eager: false, // Load on-demand
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^19.0.0',
      eager: false,
    },
    'react-router-dom': {
      singleton: true,
      requiredVersion: '^7.0.2',
      eager: false,
    },
    zustand: {
      singleton: true,
      requiredVersion: '^5.0.8',
      eager: false,
    },
  },
});
```

**Bundle Size Impact:**

| Without Sharing            | With Sharing              | Savings        |
| -------------------------- | ------------------------- | -------------- |
| Shell: 200KB + Auth: 180KB | Shell: 200KB + Auth: 80KB | 100KB (35%)    |
| Each MFE duplicates React  | React loaded once         | ~150KB per MFE |

#### Tree Shaking

```typescript
// Import only what you need
// Bad: Imports entire library
import _ from 'lodash';
const result = _.debounce(fn, 100);

// Good: Import specific function
import debounce from 'lodash/debounce';
const result = debounce(fn, 100);

// Even better: Use modern alternatives
// lodash-es supports tree shaking
import { debounce } from 'lodash-es';
```

#### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer

# Check individual MFE sizes
ls -lh apps/shell/dist/assets/*.js
ls -lh apps/auth-mfe/dist/assets/*.js
```

### 3. Network Optimization

#### HTTP/2 & Resource Hints

```html
<!-- apps/shell/index.html -->
<head>
  <!-- Preconnect to backend API -->
  <link rel="preconnect" href="http://localhost:3000" />
  <link rel="dns-prefetch" href="http://localhost:3000" />

  <!-- Preload critical MFE remoteEntry.js -->
  <link
    rel="modulepreload"
    href="http://localhost:5174/remoteEntry.js"
    as="script"
    crossorigin
  />

  <!-- Prefetch non-critical MFEs -->
  <link
    rel="prefetch"
    href="http://localhost:5176/remoteEntry.js"
    as="script"
  />
</head>
```

#### API Response Caching

```typescript
// libs/frontend/api-client/src/config.ts
import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add caching layer
const cachedClient = setupCache(apiClient, {
  ttl: 5 * 60 * 1000, // 5 minutes
  methods: ['get'], // Only cache GET requests
  cachePredicate: {
    statusCheck: (status) => status >= 200 && status < 300,
  },
});

export { cachedClient as apiClient };
```

#### Request Batching

```typescript
// libs/frontend/api-client/src/batch.ts
class RequestBatcher {
  private queue: Array<{
    url: string;
    resolve: (data: any) => void;
    reject: (error: any) => void;
  }> = [];
  private timer: NodeJS.Timeout | null = null;

  request<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject });

      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 10); // Batch within 10ms
      }
    });
  }

  private async flush() {
    const requests = this.queue.splice(0);
    this.timer = null;

    // Send batched request
    try {
      const response = await apiClient.post('/batch', {
        requests: requests.map((r) => r.url),
      });

      requests.forEach((req, i) => {
        req.resolve(response.data[i]);
      });
    } catch (error) {
      requests.forEach((req) => req.reject(error));
    }
  }
}

export const batcher = new RequestBatcher();
```

### 4. Rendering Performance

#### Virtual Scrolling (Chat Messages)

```typescript
// apps/chatbot-mfe/src/components/MessageList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function MessageList({ messages }: { messages: Message[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated message height
    overscan: 5, // Render 5 extra items for smooth scrolling
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <ChatMessage message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Performance Gain:** Renders only visible messages instead of all 10,000+ messages.

#### React.memo & useMemo

```typescript
// Memoize expensive components
const ChatMessage = memo(function ChatMessage({ message }: Props) {
  return <div>{message.content}</div>;
});

// Memoize expensive computations
function ConversationList({ conversations }: Props) {
  const sortedConversations = useMemo(() => {
    return conversations
      .slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [conversations]);

  return (
    <div>
      {sortedConversations.map((c) => (
        <ConversationItem key={c.id} conversation={c} />
      ))}
    </div>
  );
}
```

#### Debouncing & Throttling

```typescript
// libs/frontend/hooks/src/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in search
function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300); // Wait 300ms after typing stops

  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery); // Only call API after 300ms pause
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### 5. Image Optimization

```typescript
// libs/frontend/ui-components/src/OptimizedImage.tsx
interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function OptimizedImage({ src, alt, width, height }: Props) {
  return (
    <picture>
      {/* WebP for modern browsers */}
      <source srcSet={`${src}.webp`} type="image/webp" />

      {/* AVIF for even better compression */}
      <source srcSet={`${src}.avif`} type="image/avif" />

      {/* Fallback to original format */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy" // Native lazy loading
        decoding="async" // Decode off main thread
      />
    </picture>
  );
}
```

### 6. State Management Performance

#### Zustand Selectors

```typescript
// Bad: Re-renders on ANY auth state change
function UserProfile() {
  const authState = useAuthStore(); // Entire state
  return <div>{authState.user?.name}</div>;
}

// Good: Only re-renders when user.name changes
function UserProfile() {
  const userName = useAuthStore((state) => state.user?.name); // Specific selector
  return <div>{userName}</div>;
}
```

#### TanStack Query Optimization

```typescript
// Enable stale-while-revalidate pattern
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache for 10 minutes
      refetchOnWindowFocus: false, // Don't refetch on tab switch
      retry: 1, // Only retry failed requests once
    },
  },
});
```

### 7. Performance Monitoring

#### Web Vitals

```typescript
// libs/frontend/monitoring/src/web-vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log(metric);

  // Example: Send to Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_rating: metric.rating,
    });
  }
}

// Measure Core Web Vitals
export function initWebVitals() {
  onCLS(sendToAnalytics); // Cumulative Layout Shift
  onFID(sendToAnalytics); // First Input Delay (deprecated, use INP)
  onINP(sendToAnalytics); // Interaction to Next Paint
  onFCP(sendToAnalytics); // First Contentful Paint
  onLCP(sendToAnalytics); // Largest Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}
```

#### Custom Performance Metrics

```typescript
// Measure MFE load time
export function measureMFELoad(mfeName: string) {
  const startTime = performance.now();

  return () => {
    const loadTime = performance.now() - startTime;

    // Log to analytics
    sendToAnalytics({
      name: 'mfe_load_time',
      value: loadTime,
      mfe: mfeName,
      rating:
        loadTime < 1000
          ? 'good'
          : loadTime < 2500
            ? 'needs-improvement'
            : 'poor',
    });
  };
}

// Usage
const onAuthMFELoaded = measureMFELoad('authMfe');
lazy(() =>
  import('authMfe/Module').then((m) => {
    onAuthMFELoaded();
    return m;
  })
);
```

### 8. Performance Budget

Set and enforce performance budgets:

```json
// package.json
{
  "performanceBudget": {
    "shell": {
      "maxSize": "200KB",
      "maxLoadTime": "1.5s"
    },
    "authMfe": {
      "maxSize": "150KB",
      "maxLoadTime": "1s"
    },
    "chatbotMfe": {
      "maxSize": "200KB",
      "maxLoadTime": "1.5s"
    }
  }
}
```

```bash
# Check bundle sizes against budget
npm run build
node scripts/check-bundle-size.js
```

### 9. Performance Checklist

#### Build Time

- [ ] Enable production builds with minification
- [ ] Remove source maps in production
- [ ] Use tree shaking (ESM imports)
- [ ] Analyze bundle sizes
- [ ] Split vendor chunks
- [ ] Enable compression (gzip/brotli)

#### Runtime

- [ ] Lazy load MFEs and routes
- [ ] Use React.memo for expensive components
- [ ] Implement virtual scrolling for long lists
- [ ] Debounce search inputs
- [ ] Optimize images (WebP, lazy loading)
- [ ] Cache API responses (TanStack Query)
- [ ] Use Zustand selectors efficiently

#### Network

- [ ] Enable HTTP/2
- [ ] Add resource hints (preconnect, prefetch)
- [ ] Implement CDN for static assets
- [ ] Enable caching headers
- [ ] Compress responses (gzip/brotli)
- [ ] Batch API requests where possible

#### Monitoring

- [ ] Track Core Web Vitals
- [ ] Monitor MFE load times
- [ ] Set up performance budgets
- [ ] Alert on performance regressions
- [ ] A/B test optimizations

### 10. Performance Benchmarks

**Target Metrics (Desktop):**

| Metric                         | Target  | Current |
| ------------------------------ | ------- | ------- |
| First Contentful Paint (FCP)   | < 1.8s  | 1.2s    |
| Largest Contentful Paint (LCP) | < 2.5s  | 2.1s    |
| Time to Interactive (TTI)      | < 3.8s  | 3.2s    |
| Total Blocking Time (TBT)      | < 200ms | 150ms   |
| Cumulative Layout Shift (CLS)  | < 0.1   | 0.05    |
| First Input Delay (FID)        | < 100ms | 80ms    |

**Bundle Sizes:**

| Application | Size (Gzipped) | Status          |
| ----------- | -------------- | --------------- |
| Shell       | 145KB          | ✓ Within budget |
| Auth MFE    | 78KB           | ✓ Within budget |
| Chatbot MFE | 112KB          | ✓ Within budget |
| Admin MFE   | 95KB           | ✓ Within budget |
| Profile MFE | 68KB           | ✓ Within budget |

---

---

## CI/CD Pipeline

### Overview

The CI/CD pipeline for this Micro-Frontend architecture is designed to enable independent deployment of each MFE while maintaining coordination through the shell application. This section covers development workflows, staging, and production deployment strategies.

> **Related Sections**: See [Testing](#testing) for test automation strategies, [Dockerization](#dockerization) for container build processes, and [Deployment & Infrastructure](#deployment--infrastructure) for production deployment workflows.

### CI/CD Architecture

```mermaid
graph TB
    subgraph DevWorkflow["Development Workflow"]
        LocalDev["Local Development<br/>nx dev shell<br/>nx dev auth-mfe"]
        UnitTests["Unit Tests<br/>nx test auth-mfe"]
        Lint["Linting<br/>nx lint auth-mfe"]
    end

    subgraph CI["Continuous Integration (GitHub Actions)"]
        PullRequest["Pull Request"]
        InstallDeps["Install Dependencies<br/>npm ci"]
        BuildAffected["Build Affected<br/>nx affected:build"]
        TestAffected["Test Affected<br/>nx affected:test"]
        LintAffected["Lint Affected<br/>nx affected:lint"]
        E2ETests["E2E Tests<br/>Playwright"]
    end

    subgraph Staging["Staging Environment"]
        StagingBuild["Build Production<br/>nx build:affected"]
        StagingDeploy["Deploy to S3/CDN<br/>staging-cdn.myapp.com"]
        StagingTest["Smoke Tests"]
    end

    subgraph Production["Production Deployment"]
        ProdBuild["Build Production<br/>nx build shell"]
        ProdDeploy["Deploy to CDN<br/>cdn.myapp.com"]
        ProdMonitor["Monitor Errors<br/>Sentry, DataDog"]
        Rollback["Rollback if needed"]
    end

    LocalDev --> PullRequest
    PullRequest --> InstallDeps
    InstallDeps --> BuildAffected
    InstallDeps --> TestAffected
    InstallDeps --> LintAffected
    BuildAffected --> E2ETests
    TestAffected --> E2ETests
    LintAffected --> E2ETests

    E2ETests -->|Merge to develop| StagingBuild
    StagingBuild --> StagingDeploy
    StagingDeploy --> StagingTest

    StagingTest -->|Merge to main| ProdBuild
    ProdBuild --> ProdDeploy
    ProdDeploy --> ProdMonitor
    ProdMonitor -.->|Errors detected| Rollback

    style DevWorkflow fill:#e3f2fd
    style CI fill:#fff3e0
    style Staging fill:#f3e5f5
    style Production fill:#e8f5e9
```

### Development Workflow

#### Local Development

```bash
# Start all MFEs and shell in parallel
npm run dev:frontend

# Or start individually for debugging
npm run dev:auth-mfe      # Port 5174
npm run dev:chatbot-mfe   # Port 5175
npm run dev:admin-mfe     # Port 5176
npm run dev:profile-mfe   # Port 5177
npm run dev:shell         # Port 5173 (start last)

# Run tests for specific MFE
nx test auth-mfe --watch

# Lint specific MFE
nx lint auth-mfe --fix

# Build specific MFE
nx build auth-mfe
```

#### Pre-Commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "nx affected:test --base=origin/main"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### Continuous Integration (GitHub Actions)

#### Pull Request Pipeline

**File:** `.github/workflows/pr-checks.yml`

```yaml
name: PR Checks

on:
  pull_request:
    branches: [develop, main]

jobs:
  affected-check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Fetch all history for Nx affected

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Get base commit
        run: |
          echo "BASE_SHA=$(git merge-base origin/${{ github.base_ref }} HEAD)" >> $GITHUB_ENV

      - name: Build affected projects
        run: npx nx affected:build --base=$BASE_SHA --head=HEAD --parallel=3

      - name: Test affected projects
        run: npx nx affected:test --base=$BASE_SHA --head=HEAD --parallel=3 --coverage

      - name: Lint affected projects
        run: npx nx affected:lint --base=$BASE_SHA --head=HEAD --parallel=3

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/**/lcov.info

      - name: Comment PR with affected projects
        uses: actions/github-script@v7
        with:
          script: |
            const { execSync } = require('child_process');
            const affected = execSync(
              `npx nx print-affected --base=${{ env.BASE_SHA }} --head=HEAD`
            ).toString();

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Affected Projects\n\n\`\`\`json\n${affected}\n\`\`\``
            });

  e2e-tests:
    runs-on: ubuntu-latest
    needs: affected-check

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start services
        run: |
          npm run dev:backend &
          npm run dev:frontend &
          npx wait-on http://localhost:5173 http://localhost:3000

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

#### Type Checking

**File:** `.github/workflows/type-check.yml`

```yaml
name: Type Check

on:
  pull_request:
    branches: [develop, main]

jobs:
  typecheck:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check all projects
        run: npx nx run-many --target=typecheck --all --parallel=5
```

### Staging Deployment

#### Staging Pipeline

**File:** `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

env:
  AWS_REGION: us-east-1
  STAGING_BUCKET: staging-cdn-myapp
  CLOUDFRONT_DISTRIBUTION_ID: E1234567890ABC

jobs:
  deploy-staging:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Get affected MFEs
        id: affected
        run: |
          AFFECTED=$(npx nx print-affected --type=app --select=projects)
          echo "affected=$AFFECTED" >> $GITHUB_OUTPUT

      - name: Build affected MFEs
        run: npx nx affected:build --base=origin/main --head=HEAD --configuration=staging

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy Shell to S3
        if: contains(steps.affected.outputs.affected, 'shell')
        run: |
          aws s3 sync dist/apps/shell s3://${{ env.STAGING_BUCKET }}/shell/ \
            --delete \
            --cache-control "public,max-age=31536000,immutable"

      - name: Deploy Auth MFE to S3
        if: contains(steps.affected.outputs.affected, 'auth-mfe')
        run: |
          VERSION=$(node -p "require('./apps/auth-mfe/package.json').version")
          aws s3 sync dist/apps/auth-mfe s3://${{ env.STAGING_BUCKET }}/auth-mfe/$VERSION/ \
            --cache-control "public,max-age=31536000,immutable"

      - name: Deploy Chatbot MFE to S3
        if: contains(steps.affected.outputs.affected, 'chatbot-mfe')
        run: |
          VERSION=$(node -p "require('./apps/chatbot-mfe/package.json').version")
          aws s3 sync dist/apps/chatbot-mfe s3://${{ env.STAGING_BUCKET }}/chatbot-mfe/$VERSION/ \
            --cache-control "public,max-age=31536000,immutable"

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ env.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

      - name: Run smoke tests
        run: |
          npx wait-on https://staging.myapp.com
          curl -f https://staging.myapp.com/health || exit 1

      - name: Notify deployment
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Staging deployment completed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Staging Deployment*\n\nAffected: ${{ steps.affected.outputs.affected }}\n\n<https://staging.myapp.com|View Staging>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Production Deployment

#### Production Pipeline

**File:** `.github/workflows/deploy-production.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch: # Manual trigger

env:
  AWS_REGION: us-east-1
  PROD_BUCKET: cdn-myapp
  CLOUDFRONT_DISTRIBUTION_ID: E0987654321XYZ

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production # Requires manual approval

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build all projects for production
        run: npx nx run-many --target=build --configuration=production --all

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Backup current production
        run: |
          aws s3 sync s3://${{ env.PROD_BUCKET }} s3://${{ env.PROD_BUCKET }}-backup-$(date +%Y%m%d-%H%M%S)/

      - name: Deploy Shell
        run: |
          aws s3 sync dist/apps/shell s3://${{ env.PROD_BUCKET }}/shell/ \
            --delete \
            --cache-control "public,max-age=31536000,immutable"

      - name: Deploy MFEs with versioning
        run: |
          for mfe in auth-mfe chatbot-mfe admin-mfe profile-mfe; do
            VERSION=$(node -p "require('./apps/$mfe/package.json').version")
            aws s3 sync dist/apps/$mfe s3://${{ env.PROD_BUCKET }}/$mfe/$VERSION/ \
              --cache-control "public,max-age=31536000,immutable"
            
            # Update latest pointer
            echo $VERSION > latest.txt
            aws s3 cp latest.txt s3://${{ env.PROD_BUCKET }}/$mfe/latest.txt
          done

      - name: Invalidate CloudFront cache
        run: |
          INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id ${{ env.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*" \
            --query 'Invalidation.Id' \
            --output text)

          echo "Waiting for invalidation $INVALIDATION_ID to complete..."
          aws cloudfront wait invalidation-completed \
            --distribution-id ${{ env.CLOUDFRONT_DISTRIBUTION_ID }} \
            --id $INVALIDATION_ID

      - name: Health check
        run: |
          npx wait-on https://myapp.com --timeout 60000

          # Check each MFE loads
          for mfe in shell auth chatbot admin profile; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://myapp.com/$mfe)
            if [ $STATUS -ne 200 ]; then
              echo "Health check failed for $mfe (status: $STATUS)"
              exit 1
            fi
          done

      - name: Initialize monitoring
        run: |
          # Create Sentry release
          curl -X POST https://sentry.io/api/0/organizations/myorg/releases/ \
            -H "Authorization: Bearer ${{ secrets.SENTRY_AUTH_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d "{
              \"version\": \"${{ github.sha }}\",
              \"projects\": [\"shell\", \"auth-mfe\", \"chatbot-mfe\"]
            }"

      - name: Notify success
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Production deployment successful",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Deployment Complete*\n\nCommit: ${{ github.sha }}\n\n<https://myapp.com|View Production>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Notify failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Production deployment failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Deployment Failed*\n\nCommit: ${{ github.sha }}\n\nCheck logs: <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Deployment Strategies

#### Blue-Green Deployment

```mermaid
sequenceDiagram
    participant Users
    participant CloudFront
    participant BlueEnv as Blue Environment<br/>(Current)
    participant GreenEnv as Green Environment<br/>(New)
    participant Monitor as Monitoring

    Note over GreenEnv: Deploy new version
    GreenEnv->>GreenEnv: Build & deploy MFEs
    GreenEnv->>Monitor: Run smoke tests
    Monitor-->>GreenEnv: All tests pass

    Note over CloudFront: Switch traffic (10%)
    Users->>CloudFront: 10% traffic
    CloudFront->>GreenEnv: New requests
    CloudFront->>BlueEnv: 90% requests

    Monitor->>Monitor: Monitor error rates<br/>for 15 minutes

    alt No errors detected
        Note over CloudFront: Switch all traffic
        Users->>CloudFront: 100% traffic
        CloudFront->>GreenEnv: All requests
        Note over BlueEnv: Keep for rollback (24h)
    else Errors detected
        Note over CloudFront: Rollback
        CloudFront->>BlueEnv: All traffic back
        Note over GreenEnv: Investigate issues
    end
```

#### Canary Deployment

```typescript
// CloudFront function for canary deployment
function handler(event) {
  var request = event.request;
  var headers = request.headers;

  // Check if user is in canary group (10% of users)
  var userId = headers['x-user-id'] ? headers['x-user-id'].value : '';
  var hash = hashCode(userId);
  var isCanary = hash % 100 < 10;

  // Route to canary or stable version
  if (isCanary) {
    request.headers['x-mfe-version'] = { value: 'canary' };
  } else {
    request.headers['x-mfe-version'] = { value: 'stable' };
  }

  return request;
}

function hashCode(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}
```

### Environment Configuration

#### Development

```bash
# .env.development
VITE_API_URL=http://localhost:3000
VITE_AUTH_MFE_URL=http://localhost:5174/remoteEntry.js
VITE_CHATBOT_MFE_URL=http://localhost:5175/remoteEntry.js
VITE_ADMIN_MFE_URL=http://localhost:5176/remoteEntry.js
VITE_PROFILE_MFE_URL=http://localhost:5177/remoteEntry.js
VITE_ENVIRONMENT=development
VITE_SENTRY_DSN=
```

#### Staging

```bash
# .env.staging
VITE_API_URL=https://api-staging.myapp.com
VITE_AUTH_MFE_URL=https://staging-cdn.myapp.com/auth-mfe/latest/remoteEntry.js
VITE_CHATBOT_MFE_URL=https://staging-cdn.myapp.com/chatbot-mfe/latest/remoteEntry.js
VITE_ADMIN_MFE_URL=https://staging-cdn.myapp.com/admin-mfe/latest/remoteEntry.js
VITE_PROFILE_MFE_URL=https://staging-cdn.myapp.com/profile-mfe/latest/remoteEntry.js
VITE_ENVIRONMENT=staging
VITE_SENTRY_DSN=https://staging-key@sentry.io/project
```

#### Production

```bash
# .env.production
VITE_API_URL=https://api.myapp.com
VITE_AUTH_MFE_URL=https://cdn.myapp.com/auth-mfe/1.2.3/remoteEntry.js
VITE_CHATBOT_MFE_URL=https://cdn.myapp.com/chatbot-mfe/2.0.1/remoteEntry.js
VITE_ADMIN_MFE_URL=https://cdn.myapp.com/admin-mfe/1.5.0/remoteEntry.js
VITE_PROFILE_MFE_URL=https://cdn.myapp.com/profile-mfe/1.1.0/remoteEntry.js
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=https://production-key@sentry.io/project
```

### Rollback Strategy

#### Automated Rollback

```yaml
# .github/workflows/auto-rollback.yml
name: Auto Rollback

on:
  schedule:
    - cron: '*/5 * * * *' # Every 5 minutes
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest

    steps:
      - name: Check error rate
        id: errors
        run: |
          # Query Sentry for error rate
          ERROR_RATE=$(curl -s "https://sentry.io/api/0/organizations/myorg/stats/" \
            -H "Authorization: Bearer ${{ secrets.SENTRY_AUTH_TOKEN }}" \
            | jq '.errorRate')

          echo "error_rate=$ERROR_RATE" >> $GITHUB_OUTPUT

          # Threshold: 5% error rate
          if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
            echo "should_rollback=true" >> $GITHUB_OUTPUT
          else
            echo "should_rollback=false" >> $GITHUB_OUTPUT
          fi

      - name: Trigger rollback
        if: steps.errors.outputs.should_rollback == 'true'
        run: |
          # Restore from backup
          LATEST_BACKUP=$(aws s3 ls s3://cdn-myapp-backup/ | tail -n 1 | awk '{print $4}')
          aws s3 sync s3://cdn-myapp-backup/$LATEST_BACKUP s3://cdn-myapp/ --delete

          # Invalidate CloudFront
          aws cloudfront create-invalidation \
            --distribution-id ${{ env.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

          # Notify team
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d "{\"text\": \"Auto-rollback triggered due to high error rate: ${ERROR_RATE}%\"}"
```

#### Manual Rollback

```bash
# scripts/rollback.sh
#!/bin/bash

# Rollback to specific backup
BACKUP_DATE=$1

if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: ./rollback.sh <backup-date>"
  echo "Example: ./rollback.sh 20251116-143000"
  exit 1
fi

echo "Rolling back to backup: $BACKUP_DATE"

# Sync from backup
aws s3 sync s3://cdn-myapp-backup-$BACKUP_DATE/ s3://cdn-myapp/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id E0987654321XYZ \
  --paths "/*"

echo "Rollback complete. Monitoring for 5 minutes..."

# Wait and check health
sleep 300
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://myapp.com)

if [ $STATUS -eq 200 ]; then
  echo "Rollback successful"
else
  echo "Rollback failed (HTTP $STATUS)"
  exit 1
fi
```

### Monitoring & Alerts

#### Key Metrics

```typescript
// Monitoring configuration
export const prodMetrics = {
  // Performance
  'mfe.load.time': {
    threshold: 2000, // 2 seconds
    alert: 'critical',
  },
  'api.response.time': {
    threshold: 500, // 500ms
    alert: 'warning',
  },

  // Errors
  'error.rate': {
    threshold: 0.05, // 5%
    alert: 'critical',
  },
  'mfe.load.failure': {
    threshold: 0.01, // 1%
    alert: 'critical',
  },

  // Traffic
  'requests.per.minute': {
    threshold: 10000,
    alert: 'info',
  },
};
```

#### Alert Configuration

```yaml
# alerts.yml
alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    channels:
      - slack: #incidents
      - pagerduty: on-call

  - name: MFE Load Failure
    condition: mfe_load_failure_rate > 1%
    duration: 2m
    severity: critical
    channels:
      - slack: #incidents

  - name: Slow MFE Load
    condition: p95_mfe_load_time > 3s
    duration: 10m
    severity: warning
    channels:
      - slack: #engineering
```

---

## Testing

### Overview

A comprehensive testing strategy for micro-frontends requires multiple layers of testing to ensure reliability, maintainability, and confidence in deployments. This section covers unit testing, integration testing, E2E testing, and testing strategies specific to Module Federation architecture.

### Testing Philosophy

**Testing Pyramid for Micro-Frontends:**

```mermaid
graph TB
    subgraph TestPyramid["Testing Pyramid"]
        E2E["E2E Tests<br/>(Few, Critical Paths)<br/>~10-20 tests"]
        Integration["Integration Tests<br/>(MFE Loading, Communication)<br/>~50-100 tests"]
        Unit["Unit Tests<br/>(Components, Hooks, Utils)<br/>~500+ tests"]
    end

    E2E --> Integration
    Integration --> Unit

    style TestPyramid fill:#e8f5e9
    style E2E fill:#ffcdd2
    style Integration fill:#fff9c4
    style Unit fill:#c8e6c9
```

**Coverage Targets:**

- **Unit Tests:** > 80% code coverage
- **Integration Tests:** All critical MFE loading scenarios
- **E2E Tests:** Top 10 user journeys (login, chat, admin operations)

---

### 1. Unit Testing

#### Test Setup with Vitest

**Configuration:**

```typescript
// apps/auth-mfe/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.spec.ts',
        '**/*.test.tsx',
        '**/vite.config.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Test Setup File:**

```typescript
// apps/auth-mfe/src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_API_URL: 'http://localhost:3000',
  VITE_ENV: 'test',
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

#### Component Testing Examples

**Testing Auth Components:**

```typescript
// apps/auth-mfe/src/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';
import { useAuthStore } from '@myapp/frontend/stores';

// Mock the auth store
vi.mock('@myapp/frontend/stores', () => ({
  useAuthStore: vi.fn(),
}));

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });
  });

  it('renders login form with email and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    mockLogin.mockResolvedValue({ success: true });
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('displays error message on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Invalid credentials',
    });

    render(<LoginForm />);

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('disables submit button while loading', () => {
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /signing in/i });
    expect(submitButton).toBeDisabled();
  });
});
```

**Testing Custom Hooks:**

```typescript
// libs/frontend/stores/src/hooks/useAuth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('updates state on successful login', async () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'user' };
    const mockTokens = { accessToken: 'token123', refreshToken: 'refresh123' };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser, ...mockTokens }),
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.accessToken).toBe('token123');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles login error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'wrong',
      });
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it('clears state on logout', async () => {
    // Set initial authenticated state
    useAuthStore.setState({
      user: { id: '1', email: 'test@example.com', role: 'user' },
      accessToken: 'token123',
      refreshToken: 'refresh123',
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

**Testing Utilities:**

```typescript
// libs/shared/utils/src/validation.test.ts
import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from './validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('accepts strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('C0mpl3x@Pass')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('nocapitals123')).toBe(false);
      expect(validatePassword('NONUMBERS!')).toBe(false);
    });
  });
});
```

#### Running Unit Tests

```bash
# Run tests for specific MFE
nx test auth-mfe

# Run tests with coverage
nx test auth-mfe --coverage

# Run tests in watch mode
nx test auth-mfe --watch

# Run all tests across workspace
nx run-many --target=test --all

# Run tests for affected projects only
nx affected --target=test
```

---

### 2. Integration Testing

#### Testing MFE Loading

**Test Module Federation Loading:**

```typescript
// apps/shell/src/test/integration/mfe-loading.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Shell } from '../../App';

// Mock dynamic imports
vi.mock('authMfe/App', () => ({
  default: () => <div>Auth MFE Loaded</div>,
}));

vi.mock('chatbotMfe/App', () => ({
  default: () => <div>Chatbot MFE Loaded</div>,
}));

describe('MFE Loading Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads auth MFE on /auth route', async () => {
    window.history.pushState({}, '', '/auth');

    render(<Shell />);

    await waitFor(
      () => {
        expect(screen.getByText('Auth MFE Loaded')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('loads chatbot MFE on /chat route', async () => {
    window.history.pushState({}, '', '/chat');

    render(<Shell />);

    await waitFor(
      () => {
        expect(screen.getByText('Chatbot MFE Loaded')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('shows error boundary on MFE load failure', async () => {
    // Simulate MFE load failure
    vi.mocked(import('authMfe/App')).mockRejectedValue(
      new Error('Failed to load Auth MFE')
    );

    window.history.pushState({}, '', '/auth');
    render(<Shell />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });
  });

  it('handles concurrent MFE loading', async () => {
    window.history.pushState({}, '', '/');

    render(<Shell />);

    // Shell should load multiple MFEs in parallel
    await waitFor(
      () => {
        expect(screen.getByText('Auth MFE Loaded')).toBeInTheDocument();
        expect(screen.getByText('Chatbot MFE Loaded')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
```

#### Testing Inter-MFE Communication

```typescript
// tests/integration/mfe-communication.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@myapp/frontend/stores';
import AuthMFE from 'authMfe/App';
import ChatbotMFE from 'chatbotMfe/App';

describe('Inter-MFE Communication', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  it('shares authentication state between MFEs', async () => {
    const { rerender } = render(
      <>
        <AuthMFE />
        <ChatbotMFE />
      </>
    );

    // Login in Auth MFE
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Wait for authentication
    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    // Rerender to update Chatbot MFE with new auth state
    rerender(
      <>
        <AuthMFE />
        <ChatbotMFE />
      </>
    );

    // Verify Chatbot MFE received auth state
    await waitFor(() => {
      expect(screen.getByText(/welcome, test@example.com/i)).toBeInTheDocument();
    });
  });

  it('handles custom events between MFEs', async () => {
    render(
      <>
        <ChatbotMFE />
        <AuthMFE />
      </>
    );

    // Dispatch custom event from Chatbot MFE
    const event = new CustomEvent('chatbot:message-sent', {
      detail: { messageId: '123', content: 'Hello' },
    });
    window.dispatchEvent(event);

    // Verify Auth MFE received the event
    await waitFor(() => {
      expect(screen.getByText(/new message received/i)).toBeInTheDocument();
    });
  });
});
```

#### Testing with Testcontainers

**Backend Integration Tests:**

```typescript
// apps/auth-service/src/test/integration/auth.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { app } from '../../app';

describe('Auth Service Integration', () => {
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Start PostgreSQL container
    container = await new PostgreSqlContainer('postgres:16-alpine').start();

    // Initialize Prisma with container URL
    process.env.DATABASE_URL = container.getConnectionString();
    prisma = new PrismaClient();

    // Run migrations
    await prisma.$executeRawUnsafe(`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
    await container.stop();
  });

  it('registers a new user', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body).toHaveProperty('accessToken');
  });

  it('prevents duplicate email registration', async () => {
    // First registration
    await request(app).post('/api/auth/register').send({
      email: 'duplicate@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    });

    // Attempt duplicate
    const response = await request(app).post('/api/auth/register').send({
      email: 'duplicate@example.com',
      password: 'AnotherPass456!',
      confirmPassword: 'AnotherPass456!',
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already exists/i);
  });

  it('authenticates user with valid credentials', async () => {
    // Register user first
    await request(app).post('/api/auth/register').send({
      email: 'login@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    });

    // Login
    const response = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'StrongPass123!',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });
});
```

---

### 3. End-to-End Testing

#### Playwright Setup

**Configuration:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'nx serve shell',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

#### E2E Test Examples

**Authentication Flow:**

```typescript
// tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('complete registration and login flow', async ({ page }) => {
    // Navigate to registration
    await page.goto('/auth/register');

    // Fill registration form
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password', { exact: true }).fill('StrongPass123!');
    await page.getByLabel('Confirm Password').fill('StrongPass123!');

    // Submit registration
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Should redirect to chat page
    await expect(page).toHaveURL('/chat');
    await expect(page.getByText(/welcome/i)).toBeVisible();

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('/auth/login');

    // Login with registered credentials
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('StrongPass123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect back to chat
    await expect(page).toHaveURL('/chat');
    await expect(page.getByText(/newuser@example.com/i)).toBeVisible();
  });

  test('shows validation errors for invalid input', async ({ page }) => {
    await page.goto('/auth/register');

    // Submit empty form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Should show validation errors
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();

    // Invalid email format
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Email').blur();
    await expect(page.getByText('Invalid email format')).toBeVisible();

    // Weak password
    await page.getByLabel('Password', { exact: true }).fill('weak');
    await page.getByLabel('Password', { exact: true }).blur();
    await expect(page.getByText(/password must be at least/i)).toBeVisible();

    // Password mismatch
    await page.getByLabel('Password', { exact: true }).fill('StrongPass123!');
    await page.getByLabel('Confirm Password').fill('DifferentPass456!');
    await page.getByLabel('Confirm Password').blur();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('handles authentication errors gracefully', async ({ page }) => {
    await page.goto('/auth/login');

    // Attempt login with wrong credentials
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    await expect(page).toHaveURL('/auth/login');
  });
});
```

**Chatbot Interaction:**

```typescript
// tests/e2e/chatbot-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chatbot Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/chat');
  });

  test('creates new conversation and sends message', async ({ page }) => {
    // Click new conversation
    await page.getByRole('button', { name: 'New Conversation' }).click();

    // Type message
    const messageInput = page.getByPlaceholder('Type your message');
    await messageInput.fill('Hello, AI assistant!');
    await messageInput.press('Enter');

    // Should see user message
    await expect(page.getByText('Hello, AI assistant!')).toBeVisible();

    // Should see AI response (wait for streaming)
    await expect(page.getByText(/hello/i).last()).toBeVisible({
      timeout: 10000,
    });

    // Conversation title should update
    await expect(page.getByRole('heading', { level: 2 })).not.toHaveText(
      'New Conversation'
    );
  });

  test('switches between conversations', async ({ page }) => {
    // Create first conversation
    await page.getByRole('button', { name: 'New Conversation' }).click();
    await page.getByPlaceholder('Type your message').fill('First conversation');
    await page.getByPlaceholder('Type your message').press('Enter');

    // Wait for response
    await page.waitForTimeout(2000);

    // Create second conversation
    await page.getByRole('button', { name: 'New Conversation' }).click();
    await page
      .getByPlaceholder('Type your message')
      .fill('Second conversation');
    await page.getByPlaceholder('Type your message').press('Enter');

    // Should show second conversation messages
    await expect(page.getByText('Second conversation')).toBeVisible();

    // Click first conversation in sidebar
    await page.getByText('First conversation').first().click();

    // Should show first conversation messages
    await expect(page.getByText('First conversation')).toBeVisible();
    await expect(page.getByText('Second conversation')).not.toBeVisible();
  });

  test('deletes conversation', async ({ page }) => {
    // Create conversation
    await page.getByRole('button', { name: 'New Conversation' }).click();
    await page.getByPlaceholder('Type your message').fill('To be deleted');
    await page.getByPlaceholder('Type your message').press('Enter');

    await page.waitForTimeout(2000);

    // Hover over conversation in sidebar to show delete button
    await page.getByText('To be deleted').first().hover();

    // Click delete button
    await page.getByRole('button', { name: 'Delete' }).click();

    // Confirm deletion
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Conversation should be removed from sidebar
    await expect(page.getByText('To be deleted')).not.toBeVisible();
  });

  test('handles streaming message display', async ({ page }) => {
    await page.getByRole('button', { name: 'New Conversation' }).click();

    // Send message that triggers long response
    await page
      .getByPlaceholder('Type your message')
      .fill('Write a detailed explanation of React');
    await page.getByPlaceholder('Type your message').press('Enter');

    // Should show typing indicator
    await expect(page.getByText(/typing/i)).toBeVisible();

    // Message should appear with streaming effect
    const responseContainer = page
      .locator('[data-message-role="assistant"]')
      .last();
    await expect(responseContainer).toBeVisible({ timeout: 5000 });

    // Text should grow as streaming continues
    const initialText = await responseContainer.textContent();
    await page.waitForTimeout(2000);
    const laterText = await responseContainer.textContent();

    expect(laterText!.length).toBeGreaterThan(initialText!.length);

    // Typing indicator should disappear when done
    await expect(page.getByText(/typing/i)).not.toBeVisible({ timeout: 30000 });
  });
});
```

**Admin Operations:**

```typescript
// tests/e2e/admin-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('adminpass123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Navigate to admin panel
    await page.goto('/admin');
  });

  test('views and searches user list', async ({ page }) => {
    // Should show user table
    await expect(page.getByRole('table')).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Email' })
    ).toBeVisible();

    // Search for user
    await page.getByPlaceholder('Search users').fill('test@example.com');

    // Should filter results
    await expect(page.getByText('test@example.com')).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(2); // header + 1 result
  });

  test('updates user role', async ({ page }) => {
    // Find user row
    const userRow = page
      .getByRole('row')
      .filter({ hasText: 'user@example.com' });

    // Click edit button
    await userRow.getByRole('button', { name: 'Edit' }).click();

    // Change role
    await page.getByLabel('Role').selectOption('admin');

    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();

    // Should show success message
    await expect(page.getByText(/updated successfully/i)).toBeVisible();

    // Role should be updated in table
    await expect(userRow.getByText('admin')).toBeVisible();
  });

  test('deletes user', async ({ page }) => {
    const userEmail = 'todelete@example.com';

    // Find user row
    const userRow = page.getByRole('row').filter({ hasText: userEmail });

    // Click delete button
    await userRow.getByRole('button', { name: 'Delete' }).click();

    // Confirm deletion
    await page.getByRole('button', { name: 'Confirm Delete' }).click();

    // Should show success message
    await expect(page.getByText(/deleted successfully/i)).toBeVisible();

    // User should be removed from table
    await expect(page.getByText(userEmail)).not.toBeVisible();
  });
});
```

#### Running E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/auth-flow.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run specific browser
npx playwright test --project=chromium

# Generate test report
npx playwright show-report
```

---

### 4. Visual Regression Testing

**Playwright Visual Comparison:**

```typescript
// tests/e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('chat interface matches snapshot', async ({ page }) => {
    await page.goto('/chat');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('chat-interface.png', {
      maxDiffPixels: 100,
    });
  });

  test('auth forms match snapshots', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveScreenshot('login-form.png');

    await page.goto('/auth/register');
    await expect(page).toHaveScreenshot('register-form.png');
  });

  test('admin dashboard matches snapshot', async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('adminpass123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('admin-dashboard.png', {
      fullPage: true,
    });
  });
});
```

---

### 5. Performance Testing

**Lighthouse CI:**

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'nx serve shell',
      url: [
        'http://localhost:4200/',
        'http://localhost:4200/auth/login',
        'http://localhost:4200/chat',
        'http://localhost:4200/admin',
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Load Testing with K6:**

```javascript
// tests/load/chatbot-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 50 }, // Maintain 50 users
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% failures
  },
};

export default function () {
  // Login
  const loginRes = http.post('http://localhost:3000/api/auth/login', {
    email: 'test@example.com',
    password: 'password123',
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('accessToken') !== undefined,
  });

  const token = loginRes.json('accessToken');

  // Send chat message
  const chatRes = http.post(
    'http://localhost:3000/api/chat/conversations/123/messages',
    JSON.stringify({
      content: 'Hello, AI!',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  check(chatRes, {
    'message sent': (r) => r.status === 201,
  });

  sleep(1);
}
```

```bash
# Run load test
k6 run tests/load/chatbot-load.js

# Run with custom VUs
k6 run --vus 100 --duration 5m tests/load/chatbot-load.js
```

---

### 6. CI/CD Test Integration

**GitHub Actions Workflow:**

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: nx affected --target=test --parallel=3 --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

---

### 7. Test Coverage Requirements

**Coverage Thresholds:**

```json
// package.json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 75,
        "functions": 80,
        "lines": 80,
        "statements": 80
      },
      "apps/auth-mfe/src/**/*.{ts,tsx}": {
        "branches": 80,
        "functions": 85,
        "lines": 85,
        "statements": 85
      },
      "libs/frontend/stores/src/**/*.ts": {
        "branches": 90,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
}
```

**Coverage Reporting:**

```bash
# Generate coverage report
nx test auth-mfe --coverage

# View HTML coverage report
open coverage/auth-mfe/index.html

# Check coverage thresholds
nx test --all --coverage --passWithNoTests
```

---

### 8. Best Practices

**Test Organization:**

```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── stores/
├── integration/
│   ├── mfe-loading/
│   ├── communication/
│   └── api/
├── e2e/
│   ├── auth-flow.spec.ts
│   ├── chatbot-flow.spec.ts
│   ├── admin-flow.spec.ts
│   └── visual-regression.spec.ts
├── load/
│   └── chatbot-load.js
└── fixtures/
    ├── users.json
    ├── conversations.json
    └── messages.json
```

**Testing Checklist:**

- [ ] All components have unit tests (>80% coverage)
- [ ] Custom hooks are tested with `renderHook`
- [ ] Zustand stores have state transition tests
- [ ] API calls are mocked in unit tests
- [ ] Integration tests cover MFE loading scenarios
- [ ] E2E tests cover critical user journeys
- [ ] Visual regression tests for key pages
- [ ] Performance tests with Lighthouse CI
- [ ] Load tests for API endpoints
- [ ] CI/CD pipeline runs all test suites
- [ ] Coverage reports uploaded to Codecov
- [ ] Tests run on every PR before merge

**Common Pitfalls:**

1. **Don't test implementation details** - Test behavior, not internal state
2. **Avoid over-mocking** - Use real implementations when possible
3. **Keep tests isolated** - Each test should be independent
4. **Use data-testid sparingly** - Prefer semantic queries (getByRole, getByText)
5. **Don't test third-party libraries** - Trust that React, Zustand, etc. work
6. **Avoid hardcoded timeouts** - Use `waitFor` with proper conditions
7. **Clean up after tests** - Reset stores, clear mocks, cleanup DOM

---

## Dockerization

### Overview

Containerizing micro-frontends and backend services with Docker enables consistent development environments, simplified deployments, and better scalability. This section covers Docker configuration for all services, multi-stage builds for optimization, Docker Compose for local development, and production deployment strategies.

### Architecture Overview

```mermaid
graph TB
    subgraph DockerCompose["Docker Compose - Local Development"]
        Gateway["Nginx Gateway<br/>:80"]

        subgraph Frontend["Frontend Services"]
            Shell["Shell Container<br/>:4200"]
            AuthMFE["Auth MFE Container<br/>:4201"]
            ChatMFE["Chatbot MFE Container<br/>:4202"]
            AdminMFE["Admin MFE Container<br/>:4203"]
            ProfileMFE["Profile MFE Container<br/>:4204"]
        end

        subgraph Backend["Backend Services"]
            AuthAPI["Auth Service<br/>:3001"]
            ChatAPI["Chatbot Service<br/>:3002"]
            AdminAPI["Admin Service<br/>:3003"]
        end

        subgraph Database["Data Layer"]
            Postgres["PostgreSQL<br/>:5432"]
            Redis["Redis<br/>:6379"]
        end

        Gateway --> Shell
        Gateway --> AuthMFE
        Gateway --> ChatMFE
        Gateway --> AdminMFE
        Gateway --> ProfileMFE

        Shell -.-> AuthAPI
        Shell -.-> ChatAPI
        Shell -.-> AdminAPI

        AuthAPI --> Postgres
        ChatAPI --> Postgres
        ChatAPI --> Redis
        AdminAPI --> Postgres
    end

    style DockerCompose fill:#e8f5e9
    style Frontend fill:#bbdefb
    style Backend fill:#fff9c4
    style Database fill:#ffccbc
```

---

### 1. Frontend Dockerfiles

#### Multi-Stage Build for Production

**Shell Application Dockerfile:**

```dockerfile
# apps/shell/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/shell ./apps/shell
COPY libs ./libs

# Build the application
RUN npx nx build shell --prod

# Stage 2: Production
FROM nginx:alpine

# Copy custom nginx config
COPY apps/shell/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist/apps/shell /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Configuration for Shell:**

```nginx
# apps/shell/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Cache control for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache control for HTML
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Module Federation remoteEntry
    location ~* remoteEntry\.js$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

**Auth MFE Dockerfile:**

```dockerfile
# apps/auth-mfe/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN npm ci

COPY apps/auth-mfe ./apps/auth-mfe
COPY libs ./libs

RUN npx nx build auth-mfe --prod

FROM nginx:alpine

COPY apps/auth-mfe/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/apps/auth-mfe /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Development Dockerfile

**Development with Hot Reload:**

```dockerfile
# apps/shell/Dockerfile.dev

FROM node:20-alpine

WORKDIR /app

# Install dependencies globally for hot reload
RUN npm install -g nx

# Copy package files
COPY package*.json ./

RUN npm ci

# Copy configuration
COPY nx.json tsconfig.base.json ./

# Expose port
EXPOSE 4200

# Start dev server
CMD ["nx", "serve", "shell", "--host", "0.0.0.0"]
```

---

### 2. Backend Dockerfiles

**Auth Service Dockerfile:**

```dockerfile
# apps/auth-service/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/auth-service ./apps/auth-service
COPY libs ./libs
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npx nx build auth-service --prod

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and migrations
COPY prisma ./prisma
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist/apps/auth-service ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3001

CMD ["node", "dist/main.js"]
```

**Chatbot Service with Redis:**

```dockerfile
# apps/chatbot-service/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN npm ci

COPY apps/chatbot-service ./apps/chatbot-service
COPY libs ./libs
COPY prisma ./prisma

RUN npx prisma generate
RUN npx nx build chatbot-service --prod

FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist/apps/chatbot-service ./dist

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

EXPOSE 3002

CMD ["node", "dist/main.js"]
```

---

### 3. Docker Compose for Local Development

**Complete docker-compose.yml:**

```yaml
# docker-compose.yml
version: '3.9'

services:
  # Database Services
  postgres:
    image: postgres:16-alpine
    container_name: ai-chatbot-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ai_chatbot_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: ai-chatbot-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - app-network

  # Backend Services
  auth-service:
    build:
      context: .
      dockerfile: apps/auth-service/Dockerfile
    container_name: auth-service
    environment:
      NODE_ENV: development
      PORT: 3001
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ai_chatbot_dev
      JWT_SECRET: dev-secret-key-change-in-production
      JWT_EXPIRES_IN: 1h
      REFRESH_TOKEN_EXPIRES_IN: 7d
    ports:
      - '3001:3001'
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network
    volumes:
      - ./apps/auth-service:/app/apps/auth-service
      - /app/node_modules
    command: npm run start:dev auth-service

  chatbot-service:
    build:
      context: .
      dockerfile: apps/chatbot-service/Dockerfile
    container_name: chatbot-service
    environment:
      NODE_ENV: development
      PORT: 3002
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ai_chatbot_dev
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      OPENAI_MODEL: gpt-4o-mini
      MAX_TOKENS: 1000
      RATE_LIMIT_MAX: 10
      RATE_LIMIT_WINDOW: 60000
    ports:
      - '3002:3002'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    volumes:
      - ./apps/chatbot-service:/app/apps/chatbot-service
      - /app/node_modules

  admin-service:
    build:
      context: .
      dockerfile: apps/admin-service/Dockerfile
    container_name: admin-service
    environment:
      NODE_ENV: development
      PORT: 3003
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ai_chatbot_dev
      JWT_SECRET: dev-secret-key-change-in-production
    ports:
      - '3003:3003'
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network
    volumes:
      - ./apps/admin-service:/app/apps/admin-service
      - /app/node_modules

  # Frontend Services (Development Mode)
  shell:
    build:
      context: .
      dockerfile: apps/shell/Dockerfile.dev
    container_name: shell
    environment:
      VITE_AUTH_SERVICE_URL: http://localhost:3001
      VITE_CHATBOT_SERVICE_URL: http://localhost:3002
      VITE_ADMIN_SERVICE_URL: http://localhost:3003
      VITE_AUTH_MFE_URL: http://localhost:4201
      VITE_CHATBOT_MFE_URL: http://localhost:4202
      VITE_ADMIN_MFE_URL: http://localhost:4203
      VITE_PROFILE_MFE_URL: http://localhost:4204
    ports:
      - '4200:4200'
    volumes:
      - ./apps/shell:/app/apps/shell
      - ./libs:/app/libs
      - /app/node_modules
    networks:
      - app-network

  auth-mfe:
    build:
      context: .
      dockerfile: apps/auth-mfe/Dockerfile.dev
    container_name: auth-mfe
    environment:
      VITE_AUTH_SERVICE_URL: http://localhost:3001
    ports:
      - '4201:4201'
    volumes:
      - ./apps/auth-mfe:/app/apps/auth-mfe
      - ./libs:/app/libs
      - /app/node_modules
    networks:
      - app-network

  chatbot-mfe:
    build:
      context: .
      dockerfile: apps/chatbot-mfe/Dockerfile.dev
    container_name: chatbot-mfe
    environment:
      VITE_CHATBOT_SERVICE_URL: http://localhost:3002
    ports:
      - '4202:4202'
    volumes:
      - ./apps/chatbot-mfe:/app/apps/chatbot-mfe
      - ./libs:/app/libs
      - /app/node_modules
    networks:
      - app-network

  admin-mfe:
    build:
      context: .
      dockerfile: apps/admin-mfe/Dockerfile.dev
    container_name: admin-mfe
    environment:
      VITE_ADMIN_SERVICE_URL: http://localhost:3003
    ports:
      - '4203:4203'
    volumes:
      - ./apps/admin-mfe:/app/apps/admin-mfe
      - ./libs:/app/libs
      - /app/node_modules
    networks:
      - app-network

  profile-mfe:
    build:
      context: .
      dockerfile: apps/profile-mfe/Dockerfile.dev
    container_name: profile-mfe
    environment:
      VITE_AUTH_SERVICE_URL: http://localhost:3001
    ports:
      - '4204:4204'
    volumes:
      - ./apps/profile-mfe:/app/apps/profile-mfe
      - ./libs:/app/libs
      - /app/node_modules
    networks:
      - app-network

  # Nginx Gateway (Optional for local dev)
  nginx:
    image: nginx:alpine
    container_name: nginx-gateway
    ports:
      - '80:80'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    depends_on:
      - shell
      - auth-mfe
      - chatbot-mfe
      - admin-mfe
      - profile-mfe
      - auth-service
      - chatbot-service
      - admin-service
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

**Production Docker Compose:**

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ai-chatbot-postgres-prod
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER}']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: ai-chatbot-redis-prod
    volumes:
      - redis_data_prod:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped

  auth-service:
    build:
      context: .
      dockerfile: apps/auth-service/Dockerfile
    container_name: auth-service-prod
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: ${AUTH_DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
      REFRESH_TOKEN_EXPIRES_IN: ${REFRESH_TOKEN_EXPIRES_IN}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped

  chatbot-service:
    build:
      context: .
      dockerfile: apps/chatbot-service/Dockerfile
    container_name: chatbot-service-prod
    environment:
      NODE_ENV: production
      PORT: 3002
      DATABASE_URL: ${CHATBOT_DATABASE_URL}
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      OPENAI_MODEL: ${OPENAI_MODEL}
      MAX_TOKENS: ${MAX_TOKENS}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped

  admin-service:
    build:
      context: .
      dockerfile: apps/admin-service/Dockerfile
    container_name: admin-service-prod
    environment:
      NODE_ENV: production
      PORT: 3003
      DATABASE_URL: ${ADMIN_DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped

  shell:
    build:
      context: .
      dockerfile: apps/shell/Dockerfile
    container_name: shell-prod
    networks:
      - app-network
    restart: unless-stopped

  auth-mfe:
    build:
      context: .
      dockerfile: apps/auth-mfe/Dockerfile
    container_name: auth-mfe-prod
    networks:
      - app-network
    restart: unless-stopped

  chatbot-mfe:
    build:
      context: .
      dockerfile: apps/chatbot-mfe/Dockerfile
    container_name: chatbot-mfe-prod
    networks:
      - app-network
    restart: unless-stopped

  admin-mfe:
    build:
      context: .
      dockerfile: apps/admin-mfe/Dockerfile
    container_name: admin-mfe-prod
    networks:
      - app-network
    restart: unless-stopped

  profile-mfe:
    build:
      context: .
      dockerfile: apps/profile-mfe/Dockerfile
    container_name: profile-mfe-prod
    networks:
      - app-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: nginx-gateway-prod
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - shell
      - auth-mfe
      - chatbot-mfe
      - admin-mfe
      - profile-mfe
      - auth-service
      - chatbot-service
      - admin-service
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data_prod:
  redis_data_prod:

networks:
  app-network:
    driver: bridge
```

---

### 4. Nginx Gateway Configuration

**Main Nginx Configuration:**

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # Include additional config files
    include /etc/nginx/conf.d/*.conf;
}
```

**Gateway Routing Configuration:**

```nginx
# nginx/conf.d/gateway.conf
upstream shell {
    server shell:80;
}

upstream auth-mfe {
    server auth-mfe:80;
}

upstream chatbot-mfe {
    server chatbot-mfe:80;
}

upstream admin-mfe {
    server admin-mfe:80;
}

upstream profile-mfe {
    server profile-mfe:80;
}

upstream auth-service {
    server auth-service:3001;
}

upstream chatbot-service {
    server chatbot-service:3002;
}

upstream admin-service {
    server admin-service:3003;
}

server {
    listen 80;
    server_name localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Shell (main app)
    location / {
        proxy_pass http://shell;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth MFE
    location /auth-mfe/ {
        proxy_pass http://auth-mfe/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Chatbot MFE
    location /chatbot-mfe/ {
        proxy_pass http://chatbot-mfe/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin MFE
    location /admin-mfe/ {
        proxy_pass http://admin-mfe/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Profile MFE
    location /profile-mfe/ {
        proxy_pass http://profile-mfe/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API Routes
    location /api/auth/ {
        proxy_pass http://auth-service/api/auth/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/chat/ {
        proxy_pass http://chatbot-service/api/chat/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE specific settings
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
    }

    location /api/admin/ {
        proxy_pass http://admin-service/api/admin/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health checks
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

---

### 5. Environment Configuration

**.env.example:**

```bash
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ai_chatbot_dev

# Auth Service
AUTH_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_chatbot_dev
JWT_SECRET=your-super-secret-jwt-key-change-me
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Chatbot Service
CHATBOT_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_chatbot_dev
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
MAX_TOKENS=1000
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW=60000

# Admin Service
ADMIN_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_chatbot_dev

# Frontend URLs (Development)
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_CHATBOT_SERVICE_URL=http://localhost:3002
VITE_ADMIN_SERVICE_URL=http://localhost:3003
VITE_AUTH_MFE_URL=http://localhost:4201
VITE_CHATBOT_MFE_URL=http://localhost:4202
VITE_ADMIN_MFE_URL=http://localhost:4203
VITE_PROFILE_MFE_URL=http://localhost:4204
```

**.env.production:**

```bash
# Database (use managed database in production)
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# Auth Service
AUTH_DATABASE_URL=${AUTH_DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Chatbot Service
CHATBOT_DATABASE_URL=${CHATBOT_DATABASE_URL}
REDIS_URL=${REDIS_URL}
OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_MODEL=gpt-4o-mini
MAX_TOKENS=1000

# Admin Service
ADMIN_DATABASE_URL=${ADMIN_DATABASE_URL}

# Frontend URLs (Production - use CDN or domain)
VITE_AUTH_SERVICE_URL=https://api.yourdomain.com
VITE_CHATBOT_SERVICE_URL=https://api.yourdomain.com
VITE_ADMIN_SERVICE_URL=https://api.yourdomain.com
VITE_AUTH_MFE_URL=https://cdn.yourdomain.com/auth-mfe
VITE_CHATBOT_MFE_URL=https://cdn.yourdomain.com/chatbot-mfe
VITE_ADMIN_MFE_URL=https://cdn.yourdomain.com/admin-mfe
VITE_PROFILE_MFE_URL=https://cdn.yourdomain.com/profile-mfe
```

---

### 6. Docker Commands

**Development Workflow:**

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build auth-service

# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Start specific services
docker-compose up postgres redis auth-service

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f chatbot-service

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart specific service
docker-compose restart auth-service

# Execute command in running container
docker-compose exec auth-service npm run prisma:migrate

# Access shell in container
docker-compose exec postgres psql -U postgres -d ai_chatbot_dev

# View running containers
docker-compose ps

# Remove stopped containers
docker-compose rm
```

**Production Deployment:**

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Push images to registry
docker tag ai-chatbot-shell:latest registry.yourdomain.com/ai-chatbot-shell:latest
docker push registry.yourdomain.com/ai-chatbot-shell:latest

# Pull and run on production server
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services (if using Kubernetes/Docker Swarm)
docker-compose -f docker-compose.prod.yml up -d --scale chatbot-service=3
```

---

### 7. Database Initialization Script

**Init SQL for Development:**

```sql
-- scripts/init-db.sql

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Insert test user
INSERT INTO users (email, password, role)
VALUES ('test@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user')
ON CONFLICT (email) DO NOTHING;

-- Insert admin user
INSERT INTO users (email, password, role)
VALUES ('admin@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin')
ON CONFLICT (email) DO NOTHING;
```

---

### 8. Docker Compose Override for Development

**docker-compose.override.yml (auto-loaded):**

```yaml
# docker-compose.override.yml
version: '3.9'

services:
  auth-service:
    volumes:
      - ./apps/auth-service/src:/app/apps/auth-service/src
    command: npm run start:dev auth-service

  chatbot-service:
    volumes:
      - ./apps/chatbot-service/src:/app/apps/chatbot-service/src
    command: npm run start:dev chatbot-service

  admin-service:
    volumes:
      - ./apps/admin-service/src:/app/apps/admin-service/src
    command: npm run start:dev admin-service
```

---

### 9. Health Checks and Monitoring

**Health Check Endpoints:**

```typescript
// apps/auth-service/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'auth-service',
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'auth-service',
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
```

**Docker Health Check Script:**

```bash
#!/bin/sh
# scripts/health-check.sh

set -e

# Check if service is responding
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health)

if [ "$response" = "200" ]; then
  exit 0
else
  exit 1
fi
```

---

### 10. Best Practices

**Dockerfile Best Practices:**

1. **Use multi-stage builds** - Reduce image size by separating build and runtime
2. **Leverage build cache** - Order instructions from least to most frequently changing
3. **Run as non-root user** - Improve security by creating and using a non-root user
4. **Use specific base image tags** - Avoid `latest` tag for reproducible builds
5. **Minimize layers** - Combine RUN commands where possible
6. **Add health checks** - Enable Docker to monitor container health
7. **Use .dockerignore** - Exclude unnecessary files from build context

**.dockerignore:**

```
node_modules
dist
.git
.github
.vscode
*.md
.env
.env.*
coverage
test-results
playwright-report
*.log
```

**Security Considerations:**

1. **Never commit secrets** - Use environment variables or secrets management
2. **Scan images for vulnerabilities** - Use tools like Trivy or Snyk
3. **Keep base images updated** - Regularly update to latest security patches
4. **Limit container privileges** - Run with minimal required permissions
5. **Use read-only root filesystem** - Add `readOnlyRootFilesystem: true` in production
6. **Network segmentation** - Use Docker networks to isolate services
7. **Resource limits** - Set CPU and memory limits to prevent resource exhaustion

**Performance Optimization:**

1. **Cache npm dependencies** - Copy `package.json` before source code
2. **Use Alpine images** - Smaller image size and faster downloads
3. **Enable gzip compression** - Reduce bandwidth for static assets
4. **Optimize build context** - Use `.dockerignore` to exclude unnecessary files
5. **Multi-stage builds** - Copy only production artifacts to final image
6. **Layer caching** - Structure Dockerfile to maximize cache hits
7. **Parallel builds** - Use BuildKit for faster multi-platform builds

---

### 11. Troubleshooting

**Common Issues:**

**Container exits immediately:**

```bash
# Check logs
docker-compose logs service-name

# Check if port is already in use
lsof -i :3001

# Run container in interactive mode
docker-compose run --rm service-name sh
```

**Database connection fails:**

```bash
# Check if database is healthy
docker-compose ps

# Test database connection
docker-compose exec postgres psql -U postgres -d ai_chatbot_dev

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

**Volume permission issues:**

```bash
# Fix permissions on volume
docker-compose exec service-name chown -R nodejs:nodejs /app

# Or rebuild without cache
docker-compose build --no-cache service-name
```

**Module Federation not loading:**

```bash
# Check nginx logs
docker-compose logs nginx

# Verify MFE is accessible
curl http://localhost/auth-mfe/remoteEntry.js

# Check CORS headers
curl -I http://localhost/auth-mfe/remoteEntry.js
```

**High memory usage:**

```bash
# Check container stats
docker stats

# Set memory limits in docker-compose.yml
services:
  auth-service:
    deploy:
      resources:
        limits:
          memory: 512M
```

---

## Observability

### Overview

Observability is critical for understanding the behavior of distributed micro-frontend systems in production. This section covers logging, monitoring, tracing, alerting, and debugging strategies to ensure system reliability and quick incident resolution.

> **Related Sections**: See [Deployment & Infrastructure](#deployment--infrastructure) for metrics collection infrastructure setup, [Disaster Recovery & Business Continuity](#disaster-recovery--business-continuity) for incident response procedures, and [CI/CD Pipeline](#cicd-pipeline) for deployment monitoring.

### Observability Pillars

```mermaid
graph TB
    subgraph Observability["Three Pillars of Observability"]
        Logs["Logs<br/>(What happened?)"]
        Metrics["Metrics<br/>(How much/how many?)"]
        Traces["Traces<br/>(Where did it go?)"]
    end

    subgraph Tools["Observability Stack"]
        Logging["Logging<br/>Winston + Loki"]
        Monitoring["Monitoring<br/>Prometheus + Grafana"]
        Tracing["Tracing<br/>OpenTelemetry + Jaeger"]
        APM["APM<br/>Sentry"]
    end

    Logs --> Logging
    Metrics --> Monitoring
    Traces --> Tracing

    Logging --> APM
    Monitoring --> APM
    Tracing --> APM

    style Observability fill:#e8f5e9
    style Tools fill:#fff9c4
    style Logs fill:#bbdefb
    style Metrics fill:#c5e1a5
    style Traces fill:#ffccbc
```

---

### 1. Logging

#### Backend Logging with Winston

**Winston Configuration:**

```typescript
// libs/backend/logger/src/logger.ts
import winston from 'winston';
import LokiTransport from 'winston-loki';

const isDevelopment = process.env.NODE_ENV === 'development';
const serviceName = process.env.SERVICE_NAME || 'unknown-service';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: serviceName,
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: isDevelopment
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json(),
    }),

    // File logging for production
    ...(isDevelopment
      ? []
      : [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ]),

    // Loki for centralized logging
    ...(process.env.LOKI_URL
      ? [
          new LokiTransport({
            host: process.env.LOKI_URL,
            labels: {
              service: serviceName,
              environment: process.env.NODE_ENV,
            },
            json: true,
            format: winston.format.json(),
            replaceTimestamp: true,
            onConnectionError: (err) => console.error(err),
          }),
        ]
      : []),
  ],
});

// Create child logger with additional context
export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context);
};
```

**Structured Logging Example:**

```typescript
// apps/auth-service/src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { logger } from '@myapp/backend/logger';

@Injectable()
export class AuthService {
  private logger = logger.child({ module: 'AuthService' });

  async login(email: string, password: string) {
    this.logger.info('Login attempt', { email });

    try {
      const user = await this.validateUser(email, password);

      if (!user) {
        this.logger.warn('Login failed - invalid credentials', { email });
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.generateTokens(user);

      this.logger.info('Login successful', {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch (error) {
      this.logger.error('Login error', {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
```

**HTTP Request Logging Middleware:**

```typescript
// libs/backend/middleware/src/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@myapp/backend/logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Log request
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      userId: req.user?.id,
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      logger.info('HTTP Response', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        userId: req.user?.id,
      });
    });

    next();
  }
}
```

#### Frontend Logging

**Frontend Logger:**

```typescript
// libs/frontend/logger/src/logger.ts
import * as Sentry from '@sentry/react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class FrontendLogger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...context,
    };

    // Console logging in development
    if (import.meta.env.DEV) {
      console[level](message, context);
    }

    // Send to backend logging endpoint
    if (level === 'error' || level === 'warn') {
      this.sendToBackend(logData);
    }

    // Send errors to Sentry
    if (level === 'error') {
      Sentry.captureMessage(message, {
        level: 'error',
        extra: context,
      });
    }
  }

  private async sendToBackend(logData: any) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
    } catch (error) {
      // Silently fail - don't want logging to break the app
      console.error('Failed to send log to backend', error);
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }
}

export const logger = new FrontendLogger('shell');
export const createLogger = (serviceName: string) =>
  new FrontendLogger(serviceName);
```

**Usage in Components:**

```typescript
// apps/chatbot-mfe/src/components/ChatInterface.tsx
import { createLogger } from '@myapp/frontend/logger';

const logger = createLogger('chatbot-mfe');

export const ChatInterface = () => {
  const sendMessage = async (content: string) => {
    logger.info('Sending message', { messageLength: content.length });

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        logger.error('Failed to send message', {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error('Failed to send message');
      }

      logger.info('Message sent successfully');
    } catch (error) {
      logger.error('Error sending message', {
        error: error.message,
        stack: error.stack,
      });
    }
  };

  return <div>{/* UI */}</div>;
};
```

---

### 2. Metrics and Monitoring

#### Prometheus Metrics

**Backend Metrics Setup:**

```typescript
// libs/backend/metrics/src/metrics.service.ts
import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private register: client.Registry;
  private httpRequestDuration: client.Histogram;
  private httpRequestTotal: client.Counter;
  private activeConnections: client.Gauge;
  private databaseQueryDuration: client.Histogram;
  private redisOperations: client.Counter;

  constructor() {
    this.register = new client.Registry();

    // Default metrics (CPU, memory, etc.)
    client.collectDefaultMetrics({ register: this.register });

    // HTTP request duration
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    });

    // HTTP request count
    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // Active connections
    this.activeConnections = new client.Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    });

    // Database query duration
    this.databaseQueryDuration = new client.Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1],
    });

    // Redis operations
    this.redisOperations = new client.Counter({
      name: 'redis_operations_total',
      help: 'Total number of Redis operations',
      labelNames: ['operation', 'status'],
    });

    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestTotal);
    this.register.registerMetric(this.activeConnections);
    this.register.registerMetric(this.databaseQueryDuration);
    this.register.registerMetric(this.redisOperations);
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ) {
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration
    );
    this.httpRequestTotal.inc({ method, route, status_code: statusCode });
  }

  recordDatabaseQuery(operation: string, table: string, duration: number) {
    this.databaseQueryDuration.observe({ operation, table }, duration);
  }

  recordRedisOperation(operation: string, status: 'success' | 'error') {
    this.redisOperations.inc({ operation, status });
  }

  incrementActiveConnections() {
    this.activeConnections.inc();
  }

  decrementActiveConnections() {
    this.activeConnections.dec();
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
```

**Metrics Middleware:**

```typescript
// libs/backend/middleware/src/metrics.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '@myapp/backend/metrics';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    this.metricsService.incrementActiveConnections();

    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      const route = req.route?.path || req.path;

      this.metricsService.recordHttpRequest(
        req.method,
        route,
        res.statusCode,
        duration
      );

      this.metricsService.decrementActiveConnections();
    });

    next();
  }
}
```

**Metrics Endpoint:**

```typescript
// apps/auth-service/src/metrics/metrics.controller.ts
import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from '@myapp/backend/metrics';

@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
```

#### Frontend Performance Metrics

**Web Vitals Tracking:**

```typescript
// libs/frontend/metrics/src/web-vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export const initWebVitals = () => {
  const sendToAnalytics = (metric: Metric) => {
    // Send to backend analytics endpoint
    fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...metric,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    }).catch(console.error);
  };

  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
};
```

**Module Federation Loading Metrics:**

```typescript
// apps/shell/src/monitoring/mfe-metrics.ts
interface MFELoadMetric {
  mfeName: string;
  loadTime: number;
  success: boolean;
  error?: string;
}

export const trackMFELoad = (
  mfeName: string,
  startTime: number,
  success: boolean,
  error?: Error
) => {
  const loadTime = Date.now() - startTime;

  const metric: MFELoadMetric = {
    mfeName,
    loadTime,
    success,
    error: error?.message,
  };

  // Send to analytics
  fetch('/api/analytics/mfe-load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
  }).catch(console.error);

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`MFE ${mfeName} loaded in ${loadTime}ms`);
  }
};

// Usage in MFE loader
export const loadMFE = async (
  mfeName: string,
  importFn: () => Promise<any>
) => {
  const startTime = Date.now();

  try {
    const module = await importFn();
    trackMFELoad(mfeName, startTime, true);
    return module;
  } catch (error) {
    trackMFELoad(mfeName, startTime, false, error);
    throw error;
  }
};
```

#### Grafana Dashboards

**Prometheus Configuration:**

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:3001']
    metrics_path: '/metrics'

  - job_name: 'chatbot-service'
    static_configs:
      - targets: ['chatbot-service:3002']
    metrics_path: '/metrics'

  - job_name: 'admin-service'
    static_configs:
      - targets: ['admin-service:3003']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

**Grafana Dashboard JSON (Sample):**

```json
{
  "dashboard": {
    "title": "Micro-Frontend System Overview",
    "panels": [
      {
        "title": "HTTP Request Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (service)"
          }
        ]
      },
      {
        "title": "Response Time P95",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status_code=~\"5..\"}[5m])) by (service)"
          }
        ]
      },
      {
        "title": "Database Query Duration",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(database_query_duration_seconds_bucket[5m])) by (le, operation))"
          }
        ]
      }
    ]
  }
}
```

---

### 3. Distributed Tracing

#### OpenTelemetry Setup

**Backend Tracing:**

```typescript
// libs/backend/tracing/src/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const serviceName = process.env.SERVICE_NAME || 'unknown-service';

const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]:
      process.env.SERVICE_VERSION || '1.0.0',
  }),
  traceExporter: jaegerExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        requestHook: (span, request) => {
          span.setAttribute('http.user_agent', request.headers['user-agent']);
        },
      },
      '@opentelemetry/instrumentation-express': {},
      '@opentelemetry/instrumentation-pg': {},
      '@opentelemetry/instrumentation-redis': {},
    }),
  ],
});

export const initTracing = () => {
  sdk.start();
  console.log('Tracing initialized');
};

export const shutdownTracing = () => {
  sdk.shutdown().then(
    () => console.log('Tracing terminated'),
    (err) => console.error('Error terminating tracing', err)
  );
};
```

**Custom Spans:**

```typescript
// apps/chatbot-service/src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { trace, SpanStatusCode } from '@opentelemetry/api';

@Injectable()
export class ChatService {
  private tracer = trace.getTracer('chatbot-service');

  async generateResponse(conversationId: string, userMessage: string) {
    return this.tracer.startActiveSpan('generate-ai-response', async (span) => {
      try {
        span.setAttribute('conversation.id', conversationId);
        span.setAttribute('message.length', userMessage.length);

        // Fetch conversation history
        const history = await this.tracer.startActiveSpan(
          'fetch-conversation-history',
          async (historySpan) => {
            const result = await this.prisma.message.findMany({
              where: { conversationId },
              orderBy: { createdAt: 'asc' },
            });
            historySpan.setAttribute('message.count', result.length);
            historySpan.end();
            return result;
          }
        );

        // Call OpenAI API
        const aiResponse = await this.tracer.startActiveSpan(
          'openai-api-call',
          async (aiSpan) => {
            const response = await this.openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [...history, { role: 'user', content: userMessage }],
            });
            aiSpan.setAttribute('ai.model', 'gpt-4o-mini');
            aiSpan.setAttribute('ai.tokens', response.usage?.total_tokens || 0);
            aiSpan.end();
            return response.choices[0].message.content;
          }
        );

        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
        return aiResponse;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        span.recordException(error);
        span.end();
        throw error;
      }
    });
  }
}
```

**Frontend Tracing:**

```typescript
// libs/frontend/tracing/src/tracing.ts
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export const initFrontendTracing = (serviceName: string) => {
  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  });

  const exporter = new JaegerExporter({
    endpoint: import.meta.env.VITE_JAEGER_ENDPOINT,
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [/localhost/, /api\.yourdomain\.com/],
        clearTimingResources: true,
      }),
    ],
  });
};
```

---

### 4. Error Tracking with Sentry

**Backend Sentry Setup:**

```typescript
// apps/auth-service/src/main.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [new ProfilingIntegration()],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sentry error handler
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  await app.listen(3001);

  // Error handler must be last
  app.use(Sentry.Handlers.errorHandler());
}
```

**Frontend Sentry Setup:**

```typescript
// apps/shell/src/main.tsx
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
    <App />
  </Sentry.ErrorBoundary>
);
```

**Custom Error Context:**

```typescript
// apps/chatbot-mfe/src/hooks/useChatMessage.ts
import * as Sentry from '@sentry/react';

export const useChatMessage = () => {
  const sendMessage = async (content: string) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          component: 'ChatInterface',
          action: 'send-message',
        },
        contexts: {
          message: {
            length: content.length,
            preview: content.slice(0, 50),
          },
        },
        level: 'error',
      });
      throw error;
    }
  };

  return { sendMessage };
};
```

---

### 5. Health Checks

**Comprehensive Health Check:**

```typescript
// libs/backend/health/src/health.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  checks: {
    database: CheckResult;
    redis?: CheckResult;
    memory: CheckResult;
    disk: CheckResult;
  };
}

interface CheckResult {
  status: 'pass' | 'fail';
  responseTime?: number;
  message?: string;
}

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    private redis?: RedisService
  ) {}

  async check(): Promise<HealthStatus> {
    const startTime = Date.now();

    const [database, redis, memory, disk] = await Promise.all([
      this.checkDatabase(),
      this.redis
        ? this.checkRedis()
        : Promise.resolve({ status: 'pass' as const }),
      this.checkMemory(),
      this.checkDisk(),
    ]);

    const allPassing = [database, redis, memory, disk].every(
      (c) => c.status === 'pass'
    );
    const anyFailing = [database, redis, memory, disk].some(
      (c) => c.status === 'fail'
    );

    return {
      status: anyFailing ? 'unhealthy' : allPassing ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: process.env.SERVICE_NAME || 'unknown',
      version: process.env.SERVICE_VERSION || '1.0.0',
      uptime: process.uptime(),
      checks: { database, redis, memory, disk },
    };
  }

  private async checkDatabase(): Promise<CheckResult> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'pass',
        responseTime: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: error.message,
      };
    }
  }

  private async checkRedis(): Promise<CheckResult> {
    const start = Date.now();
    try {
      await this.redis.ping();
      return {
        status: 'pass',
        responseTime: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: error.message,
      };
    }
  }

  private checkMemory(): CheckResult {
    const usage = process.memoryUsage();
    const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;

    return {
      status: heapUsedPercent < 90 ? 'pass' : 'fail',
      message: `Heap usage: ${heapUsedPercent.toFixed(2)}%`,
    };
  }

  private checkDisk(): CheckResult {
    // Simplified - in production, use a proper disk check library
    return { status: 'pass' };
  }
}
```

---

### 6. Alerting

**Prometheus Alert Rules:**

```yaml
# prometheus/alerts.yml
groups:
  - name: mfe_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (service)
          / sum(rate(http_requests_total[5m])) by (service) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'High error rate on {{ $labels.service }}'
          description: 'Error rate is {{ $value | humanizePercentage }} for {{ $labels.service }}'

      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
          ) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High response time on {{ $labels.service }}'
          description: 'P95 response time is {{ $value }}s for {{ $labels.service }}'

      - alert: ServiceDown
        expr: up{job=~".*-service"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'Service {{ $labels.job }} is down'
          description: '{{ $labels.job }} has been down for more than 1 minute'

      - alert: HighMemoryUsage
        expr: |
          (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)
          / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High memory usage'
          description: 'Memory usage is above 90%'

      - alert: DatabaseConnectionPoolExhausted
        expr: |
          pg_stat_database_numbackends / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'Database connection pool nearly exhausted'
          description: 'Database connections at {{ $value | humanizePercentage }}'

      - alert: SlowMFELoad
        expr: |
          histogram_quantile(0.95,
            sum(rate(mfe_load_duration_seconds_bucket[5m])) by (le, mfe_name)
          ) > 3
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: 'Slow MFE loading for {{ $labels.mfe_name }}'
          description: 'P95 load time is {{ $value }}s for {{ $labels.mfe_name }}'
```

**Alertmanager Configuration:**

```yaml
# alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: '${SLACK_WEBHOOK_URL}'

route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'slack-notifications'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      continue: true
    - match:
        severity: warning
      receiver: 'slack-warnings'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'slack-warnings'
    slack_configs:
      - channel: '#engineering'
        title: 'Warning: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
```

---

### 7. Debugging Tools

**Remote Debugging Setup:**

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Auth Service",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "sourceMaps": true,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Shell (Chrome)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}/apps/shell",
      "sourceMapPathOverrides": {
        "webpack:///*": "${webRoot}/*"
      }
    }
  ]
}
```

**React DevTools Integration:**

```typescript
// apps/shell/src/main.tsx
if (import.meta.env.DEV) {
  // Enable React DevTools profiling
  import('react-dom/profiling');
}
```

---

### 8. Frontend Performance Monitoring

#### Core Web Vitals Integration

**Web Vitals Library Setup:**

```bash
# Install web-vitals library
npm install web-vitals
```

**Web Vitals Tracker:**

```typescript
// libs/frontend/performance/src/web-vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  url: string;
  mfeName: string;
}

class WebVitalsTracker {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private onMetricCallback?: (metric: WebVitalsMetric) => void;

  init(callback: (metric: WebVitalsMetric) => void) {
    this.onMetricCallback = callback;

    // Track Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onFID(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));
  }

  private handleMetric(metric: Metric) {
    const webVitalsMetric: WebVitalsMetric = {
      name: metric.name,
      value: metric.value,
      rating: this.getRating(metric),
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType || 'navigate',
      url: window.location.href,
      mfeName: this.getMFEName(),
    };

    this.metrics.set(metric.name, webVitalsMetric);

    if (this.onMetricCallback) {
      this.onMetricCallback(webVitalsMetric);
    }
  }

  private getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (metric.value <= threshold.good) return 'good';
    if (metric.value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private getMFEName(): string {
    return import.meta.env.VITE_MFE_NAME || 'shell';
  }

  getMetrics(): WebVitalsMetric[] {
    return Array.from(this.metrics.values());
  }
}

export const webVitalsTracker = new WebVitalsTracker();
```

**Integration with Analytics:**

```typescript
// apps/shell/src/main.tsx
import { webVitalsTracker } from '@myapp/frontend/performance';
import { analytics } from '@myapp/frontend/analytics';

webVitalsTracker.init((metric) => {
  // Send to analytics
  analytics.track({
    eventName: 'web_vitals_measured',
    metricName: metric.name,
    value: metric.value,
    rating: metric.rating,
    mfeName: metric.mfeName,
  });

  // Log poor metrics
  if (metric.rating === 'poor') {
    console.warn(`Poor ${metric.name}: ${metric.value}`, metric);
  }
});
```

**Send to Observability Backend:**

```typescript
// libs/frontend/performance/src/vitals-reporter.ts
import { WebVitalsMetric } from './web-vitals';

export class VitalsReporter {
  private endpoint: string;
  private batchSize = 5;
  private batch: WebVitalsMetric[] = [];

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  report(metric: WebVitalsMetric) {
    this.batch.push(metric);

    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.batch.length === 0) return;

    const metrics = [...this.batch];
    this.batch = [];

    try {
      await fetch(`${this.endpoint}/metrics/web-vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
        keepalive: true, // Ensure metrics are sent even on page unload
      });
    } catch (error) {
      console.error('Failed to send web vitals', error);
    }
  }

  // Flush on page unload
  setupUnloadListener() {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }
}
```

---

#### Real User Monitoring (RUM)

**Performance Observer for Resource Timing:**

```typescript
// libs/frontend/performance/src/performance-observer.ts
export interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  startTime: number;
}

export class PerformanceMonitor {
  private observer?: PerformanceObserver;

  startMonitoring(callback: (entries: ResourceTiming[]) => void) {
    // Monitor resource timing
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];

      const resourceTimings: ResourceTiming[] = entries.map((entry) => ({
        name: entry.name,
        type: entry.initiatorType,
        duration: entry.duration,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
        startTime: entry.startTime,
      }));

      callback(resourceTimings);
    });

    this.observer.observe({ entryTypes: ['resource', 'navigation'] });
  }

  stopMonitoring() {
    this.observer?.disconnect();
  }

  // Measure custom operations
  measure(name: string, startMark: string, endMark: string) {
    performance.measure(name, startMark, endMark);
  }

  // Get navigation timing
  getNavigationTiming() {
    const [navigation] = performance.getEntriesByType(
      'navigation'
    ) as PerformanceNavigationTiming[];

    if (!navigation) return null;

    return {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnection: navigation.connectEnd - navigation.connectStart,
      tlsNegotiation:
        navigation.requestStart - navigation.secureConnectionStart,
      requestTime: navigation.responseStart - navigation.requestStart,
      responseTime: navigation.responseEnd - navigation.responseStart,
      domProcessing: navigation.domComplete - navigation.domInteractive,
      domContentLoaded:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
      loadEvent: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.fetchStart,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

**MFE Load Time Tracking:**

```typescript
// apps/shell/src/utils/mfe-performance.ts
export class MFEPerformanceTracker {
  track(mfeName: string, startTime: number) {
    const loadTime = performance.now() - startTime;

    // Mark in Performance API
    performance.mark(`mfe-${mfeName}-loaded`);
    performance.measure(
      `mfe-${mfeName}-load-time`,
      `mfe-${mfeName}-start`,
      `mfe-${mfeName}-loaded`
    );

    // Send to analytics
    analytics.track({
      eventName: 'mfe_load_performance',
      mfeName,
      loadTime,
      rating: this.getRating(loadTime),
    });

    // Log slow loads
    if (loadTime > 3000) {
      console.warn(`Slow MFE load: ${mfeName} took ${loadTime}ms`);
    }

    return loadTime;
  }

  private getRating(loadTime: number): 'good' | 'needs-improvement' | 'poor' {
    if (loadTime < 1000) return 'good';
    if (loadTime < 3000) return 'needs-improvement';
    return 'poor';
  }
}
```

---

#### Long Task Monitoring

**Detect and Track Long Tasks:**

```typescript
// libs/frontend/performance/src/long-task-monitor.ts
export interface LongTask {
  duration: number;
  startTime: number;
  attribution?: string;
}

export class LongTaskMonitor {
  private observer?: PerformanceObserver;
  private threshold = 50; // 50ms threshold

  startMonitoring(callback: (tasks: LongTask[]) => void) {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        const longTasks: LongTask[] = entries
          .filter((entry) => entry.duration > this.threshold)
          .map((entry) => ({
            duration: entry.duration,
            startTime: entry.startTime,
            attribution: (entry as any).attribution?.[0]?.name,
          }));

        if (longTasks.length > 0) {
          callback(longTasks);
        }
      });

      this.observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task monitoring not supported', error);
    }
  }

  stopMonitoring() {
    this.observer?.disconnect();
  }
}
```

---

#### Memory Monitoring

**Track Memory Usage:**

```typescript
// libs/frontend/performance/src/memory-monitor.ts
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercentage: number;
}

export class MemoryMonitor {
  private interval?: NodeJS.Timeout;

  startMonitoring(callback: (info: MemoryInfo) => void, intervalMs = 30000) {
    if (!(performance as any).memory) {
      console.warn('Memory API not available');
      return;
    }

    this.interval = setInterval(() => {
      const memory = (performance as any).memory;

      const info: MemoryInfo = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };

      callback(info);

      // Warn if memory usage is high
      if (info.usedPercentage > 90) {
        console.warn('High memory usage detected', info);
      }
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  getCurrentMemory(): MemoryInfo | null {
    if (!(performance as any).memory) return null;

    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }
}
```

---

#### Comprehensive Performance Dashboard

**Initialize All Performance Monitoring:**

```typescript
// apps/shell/src/performance.init.ts
import { webVitalsTracker } from '@myapp/frontend/performance';
import { performanceMonitor } from '@myapp/frontend/performance';
import { LongTaskMonitor } from '@myapp/frontend/performance';
import { MemoryMonitor } from '@myapp/frontend/performance';
import { analytics } from '@myapp/frontend/analytics';

export function initPerformanceMonitoring() {
  // Web Vitals
  webVitalsTracker.init((metric) => {
    analytics.track({
      eventName: 'web_vitals_measured',
      ...metric,
    });
  });

  // Resource Timing
  performanceMonitor.startMonitoring((resources) => {
    // Filter slow resources
    const slowResources = resources.filter((r) => r.duration > 1000);

    slowResources.forEach((resource) => {
      analytics.track({
        eventName: 'slow_resource_detected',
        resourceName: resource.name,
        resourceType: resource.type,
        duration: resource.duration,
        transferSize: resource.transferSize,
      });
    });
  });

  // Long Tasks
  const longTaskMonitor = new LongTaskMonitor();
  longTaskMonitor.startMonitoring((tasks) => {
    tasks.forEach((task) => {
      analytics.track({
        eventName: 'long_task_detected',
        duration: task.duration,
        startTime: task.startTime,
        attribution: task.attribution,
      });
    });
  });

  // Memory Monitoring (every 30 seconds)
  const memoryMonitor = new MemoryMonitor();
  memoryMonitor.startMonitoring((info) => {
    analytics.track({
      eventName: 'memory_usage',
      usedJSHeapSize: info.usedJSHeapSize,
      totalJSHeapSize: info.totalJSHeapSize,
      usedPercentage: info.usedPercentage,
    });
  }, 30000);

  // Navigation Timing (once per page load)
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navTiming = performanceMonitor.getNavigationTiming();
      if (navTiming) {
        analytics.track({
          eventName: 'navigation_timing',
          ...navTiming,
        });
      }
    }, 0);
  });
}
```

---

#### Backend Performance Metrics Endpoint

**Store Web Vitals in Backend:**

```typescript
// apps/analytics-service/src/performance/performance.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface WebVitalsPayload {
  metrics: Array<{
    name: string;
    value: number;
    rating: string;
    url: string;
    mfeName: string;
  }>;
}

@Controller('api/metrics')
export class PerformanceController {
  constructor(private prisma: PrismaService) {}

  @Post('web-vitals')
  async storeWebVitals(@Body() payload: WebVitalsPayload) {
    await this.prisma.webVitalsMetric.createMany({
      data: payload.metrics.map((metric) => ({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: metric.url,
        mfeName: metric.mfeName,
        timestamp: new Date(),
      })),
    });

    return { success: true };
  }

  @Get('web-vitals/summary')
  async getWebVitalsSummary(@Query('mfeName') mfeName?: string) {
    const metrics = await this.prisma.webVitalsMetric.groupBy({
      by: ['name', 'rating'],
      where: mfeName ? { mfeName } : undefined,
      _avg: { value: true },
      _count: true,
    });

    return metrics;
  }
}
```

**Grafana Dashboard for Web Vitals:**

```json
{
  "dashboard": {
    "title": "Frontend Performance - Web Vitals",
    "panels": [
      {
        "title": "LCP (Largest Contentful Paint)",
        "targets": [
          {
            "expr": "avg(web_vitals_metric{name='LCP'}) by (mfe_name)"
          }
        ],
        "thresholds": {
          "good": 2500,
          "poor": 4000
        }
      },
      {
        "title": "FID (First Input Delay)",
        "targets": [
          {
            "expr": "avg(web_vitals_metric{name='FID'}) by (mfe_name)"
          }
        ],
        "thresholds": {
          "good": 100,
          "poor": 300
        }
      },
      {
        "title": "CLS (Cumulative Layout Shift)",
        "targets": [
          {
            "expr": "avg(web_vitals_metric{name='CLS'}) by (mfe_name)"
          }
        ],
        "thresholds": {
          "good": 0.1,
          "poor": 0.25
        }
      },
      {
        "title": "Web Vitals by Rating",
        "targets": [
          {
            "expr": "count(web_vitals_metric) by (name, rating)"
          }
        ]
      }
    ]
  }
}
```

---

### 9. Observability Best Practices

**Do's:**

1. **Use structured logging** - Always log in JSON format with consistent fields
2. **Add context to logs** - Include user ID, request ID, correlation ID
3. **Set up proper log levels** - Debug in dev, Info/Warn/Error in production
4. **Monitor business metrics** - Not just technical metrics
5. **Use sampling for traces** - Don't trace every request in production
6. **Set up alerts proactively** - Before users report issues
7. **Use correlation IDs** - Track requests across services
8. **Monitor MFE load times** - Critical for user experience
9. **Track Core Web Vitals** - Monitor LCP, FID, CLS for all MFEs
10. **Monitor memory leaks** - Track heap size over time

**Don'ts:**

1. **Don't log sensitive data** - No passwords, tokens, PII
2. **Don't log too much** - Keep signal-to-noise ratio high
3. **Don't ignore log levels** - Use appropriate levels
4. **Don't skip error tracking** - Always catch and log errors
5. **Don't forget frontend monitoring** - Users experience the frontend
6. **Don't over-alert** - Causes alert fatigue
7. **Don't hardcode thresholds** - Make them configurable
8. **Don't ignore poor Web Vitals** - They directly impact user experience

**Correlation ID Pattern:**

```typescript
// libs/backend/middleware/src/correlation-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] || uuidv4();

    req.headers['x-correlation-id'] = correlationId as string;
    res.setHeader('X-Correlation-ID', correlationId);

    // Add to request context for logging
    (req as any).correlationId = correlationId;

    next();
  }
}
```

---

## Analytics

### Overview

Analytics provides insights into user behavior, feature adoption, and business metrics. Unlike observability (which focuses on system health), analytics focuses on understanding how users interact with the application to drive product decisions and improve user experience.

### Analytics Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend Applications"]
        Shell["Shell MFE"]
        Auth["Auth MFE"]
        Chat["Chatbot MFE"]
        Admin["Admin MFE"]
    end

    subgraph Collection["Data Collection"]
        EventTracker["Event Tracker<br/>(Custom)"]
        GA["Google Analytics 4"]
        Mixpanel["Mixpanel"]
        Amplitude["Amplitude"]
    end

    subgraph Backend["Backend Services"]
        AnalyticsAPI["Analytics API<br/>(NestJS)"]
        Queue["Event Queue<br/>(BullMQ)"]
        DB["Analytics DB<br/>(TimescaleDB)"]
    end

    subgraph Visualization["Analytics Dashboards"]
        ProductDash["Product Dashboard<br/>(Metabase)"]
        BusinessDash["Business Metrics<br/>(Grafana)"]
    end

    Shell --> EventTracker
    Auth --> EventTracker
    Chat --> EventTracker
    Admin --> EventTracker

    EventTracker --> GA
    EventTracker --> Mixpanel
    EventTracker --> Amplitude
    EventTracker --> AnalyticsAPI

    AnalyticsAPI --> Queue
    Queue --> DB

    DB --> ProductDash
    DB --> BusinessDash

    style Frontend fill:#bbdefb
    style Collection fill:#c8e6c9
    style Backend fill:#fff9c4
    style Visualization fill:#f8bbd0
```

---

### 1. Event Tracking Strategy

#### Event Taxonomy

**Event Categories:**

1. **User Events** - Authentication, profile updates, preferences
2. **Feature Events** - Feature usage, interactions, completions
3. **Business Events** - Conversions, subscriptions, transactions
4. **Technical Events** - Errors, performance, MFE loads
5. **Engagement Events** - Page views, time on page, scroll depth

**Event Naming Convention:**

```
<domain>_<object>_<action>

Examples:
- auth_user_registered
- auth_user_login
- chat_conversation_created
- chat_message_sent
- admin_user_deleted
- mfe_load_completed
```

#### Event Properties Structure

```typescript
// libs/frontend/analytics/src/types.ts
export interface BaseEventProperties {
  timestamp: number;
  userId?: string;
  sessionId: string;
  mfeName: string;
  url: string;
  referrer?: string;
  userAgent: string;
  screenResolution: string;
  viewport: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  os: string;
}

export interface AuthEvent extends BaseEventProperties {
  eventName: 'auth_user_registered' | 'auth_user_login' | 'auth_user_logout';
  email?: string;
  role?: string;
  provider?: 'local' | 'google' | 'github';
}

export interface ChatEvent extends BaseEventProperties {
  eventName:
    | 'chat_conversation_created'
    | 'chat_message_sent'
    | 'chat_message_received'
    | 'chat_conversation_deleted';
  conversationId?: string;
  messageId?: string;
  messageLength?: number;
  responseTime?: number;
  tokenCount?: number;
}

export interface MFEEvent extends BaseEventProperties {
  eventName: 'mfe_load_started' | 'mfe_load_completed' | 'mfe_load_failed';
  loadTime?: number;
  error?: string;
}

export type AnalyticsEvent = AuthEvent | ChatEvent | MFEEvent;
```

---

### 2. Analytics SDK Implementation

**Core Analytics Service:**

```typescript
// libs/frontend/analytics/src/analytics.service.ts
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsEvent, BaseEventProperties } from './types';

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private isInitialized = false;
  private eventQueue: AnalyticsEvent[] = [];
  private providers: AnalyticsProvider[] = [];

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  init(config: AnalyticsConfig) {
    if (this.isInitialized) return;

    // Initialize analytics providers
    if (config.googleAnalytics) {
      this.providers.push(new GoogleAnalyticsProvider(config.googleAnalytics));
    }

    if (config.mixpanel) {
      this.providers.push(new MixpanelProvider(config.mixpanel));
    }

    if (config.amplitude) {
      this.providers.push(new AmplitudeProvider(config.amplitude));
    }

    if (config.customBackend) {
      this.providers.push(new BackendProvider(config.customBackend));
    }

    this.isInitialized = true;

    // Flush queued events
    this.flushQueue();
  }

  identify(userId: string, traits?: Record<string, any>) {
    this.userId = userId;
    this.providers.forEach((provider) => provider.identify(userId, traits));
  }

  track<T extends AnalyticsEvent>(event: Omit<T, keyof BaseEventProperties>) {
    const enrichedEvent = this.enrichEvent(event) as T;

    if (!this.isInitialized) {
      this.eventQueue.push(enrichedEvent);
      return;
    }

    this.providers.forEach((provider) => provider.track(enrichedEvent));
  }

  page(pageName: string, properties?: Record<string, any>) {
    const pageEvent = this.enrichEvent({
      eventName: 'page_viewed',
      pageName,
      ...properties,
    });

    this.providers.forEach((provider) => provider.page(pageEvent));
  }

  private enrichEvent(event: Partial<AnalyticsEvent>): AnalyticsEvent {
    const baseProperties: BaseEventProperties = {
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      mfeName: this.getMFEName(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
    };

    return { ...baseProperties, ...event } as AnalyticsEvent;
  }

  private flushQueue() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.providers.forEach((provider) => provider.track(event));
      }
    }
  }

  private getOrCreateSessionId(): string {
    const key = 'analytics_session_id';
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
  }

  private getMFEName(): string {
    // Extract from module federation or environment
    return import.meta.env.VITE_MFE_NAME || 'shell';
  }

  private getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }
}

export const analytics = new AnalyticsService();
```

**Analytics Provider Interface:**

```typescript
// libs/frontend/analytics/src/providers/base.provider.ts
import { AnalyticsEvent } from '../types';

export interface AnalyticsProvider {
  identify(userId: string, traits?: Record<string, any>): void;
  track(event: AnalyticsEvent): void;
  page(event: AnalyticsEvent): void;
}
```

**Google Analytics 4 Provider:**

```typescript
// libs/frontend/analytics/src/providers/google-analytics.provider.ts
import { AnalyticsProvider } from './base.provider';
import { AnalyticsEvent } from '../types';

export class GoogleAnalyticsProvider implements AnalyticsProvider {
  constructor(measurementId: string) {
    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    this.gtag('js', new Date());
    this.gtag('config', measurementId);
  }

  private gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  }

  identify(userId: string, traits?: Record<string, any>) {
    this.gtag('set', { user_id: userId, ...traits });
  }

  track(event: AnalyticsEvent) {
    this.gtag('event', event.eventName, {
      ...event,
      event_category: this.getCategory(event.eventName),
    });
  }

  page(event: AnalyticsEvent) {
    this.gtag('event', 'page_view', {
      page_path: event.url,
      page_title: document.title,
    });
  }

  private getCategory(eventName: string): string {
    return eventName.split('_')[0];
  }
}
```

**Mixpanel Provider:**

```typescript
// libs/frontend/analytics/src/providers/mixpanel.provider.ts
import mixpanel from 'mixpanel-browser';
import { AnalyticsProvider } from './base.provider';
import { AnalyticsEvent } from '../types';

export class MixpanelProvider implements AnalyticsProvider {
  constructor(token: string) {
    mixpanel.init(token, {
      track_pageview: false,
      persistence: 'localStorage',
    });
  }

  identify(userId: string, traits?: Record<string, any>) {
    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
  }

  track(event: AnalyticsEvent) {
    mixpanel.track(event.eventName, event);
  }

  page(event: AnalyticsEvent) {
    mixpanel.track_pageview({
      url: event.url,
      referrer: event.referrer,
    });
  }
}
```

**Backend Provider:**

```typescript
// libs/frontend/analytics/src/providers/backend.provider.ts
import { AnalyticsProvider } from './base.provider';
import { AnalyticsEvent } from '../types';

export class BackendProvider implements AnalyticsProvider {
  private endpoint: string;
  private batchSize = 10;
  private flushInterval = 5000;
  private batch: AnalyticsEvent[] = [];
  private timer?: NodeJS.Timeout;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.startBatchTimer();
  }

  identify(userId: string, traits?: Record<string, any>) {
    this.sendImmediate({
      type: 'identify',
      userId,
      traits,
      timestamp: Date.now(),
    });
  }

  track(event: AnalyticsEvent) {
    this.batch.push(event);

    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }

  page(event: AnalyticsEvent) {
    this.track(event);
  }

  private startBatchTimer() {
    this.timer = setInterval(() => {
      if (this.batch.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush() {
    if (this.batch.length === 0) return;

    const events = [...this.batch];
    this.batch = [];

    try {
      await fetch(`${this.endpoint}/events/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Failed to send analytics events', error);
      // Re-add to batch for retry
      this.batch.unshift(...events);
    }
  }

  private async sendImmediate(data: any) {
    try {
      await fetch(`${this.endpoint}/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to send identify event', error);
    }
  }
}
```

---

### 3. Usage Examples

**Initialize Analytics:**

```typescript
// apps/shell/src/main.tsx
import { analytics } from '@myapp/frontend/analytics';

analytics.init({
  googleAnalytics: import.meta.env.VITE_GA_MEASUREMENT_ID,
  mixpanel: import.meta.env.VITE_MIXPANEL_TOKEN,
  amplitude: import.meta.env.VITE_AMPLITUDE_API_KEY,
  customBackend: import.meta.env.VITE_ANALYTICS_API_URL,
});

// Track page views automatically
const router = createBrowserRouter(routes);

router.subscribe((state) => {
  analytics.page(state.location.pathname);
});
```

**Track User Authentication:**

```typescript
// apps/auth-mfe/src/hooks/useAuth.ts
import { analytics } from '@myapp/frontend/analytics';
import { useAuthStore } from '@myapp/frontend/stores';

export const useAuth = () => {
  const { login, register, logout } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await login(email, password);

      // Identify user
      analytics.identify(user.id, {
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });

      // Track login event
      analytics.track({
        eventName: 'auth_user_login',
        email: user.email,
        role: user.role,
        provider: 'local',
      });

      return user;
    } catch (error) {
      analytics.track({
        eventName: 'auth_login_failed',
        email,
        error: error.message,
      });
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      const user = await register(email, password);

      analytics.identify(user.id, {
        email: user.email,
        role: user.role,
      });

      analytics.track({
        eventName: 'auth_user_registered',
        email: user.email,
        role: user.role,
        provider: 'local',
      });

      return user;
    } catch (error) {
      analytics.track({
        eventName: 'auth_registration_failed',
        email,
        error: error.message,
      });
      throw error;
    }
  };

  const handleLogout = () => {
    analytics.track({
      eventName: 'auth_user_logout',
    });
    logout();
  };

  return { handleLogin, handleRegister, handleLogout };
};
```

**Track Chat Interactions:**

```typescript
// apps/chatbot-mfe/src/components/ChatInterface.tsx
import { analytics } from '@myapp/frontend/analytics';

export const ChatInterface = () => {
  const [conversationId, setConversationId] = useState<string>();

  const createConversation = async () => {
    const conversation = await api.createConversation();
    setConversationId(conversation.id);

    analytics.track({
      eventName: 'chat_conversation_created',
      conversationId: conversation.id,
    });
  };

  const sendMessage = async (content: string) => {
    const startTime = Date.now();

    analytics.track({
      eventName: 'chat_message_sent',
      conversationId,
      messageLength: content.length,
    });

    try {
      const response = await api.sendMessage(conversationId!, content);
      const responseTime = Date.now() - startTime;

      analytics.track({
        eventName: 'chat_message_received',
        conversationId,
        messageId: response.id,
        responseTime,
        tokenCount: response.tokenCount,
      });
    } catch (error) {
      analytics.track({
        eventName: 'chat_message_failed',
        conversationId,
        error: error.message,
      });
    }
  };

  return <div>{/* UI */}</div>;
};
```

**Track MFE Loading:**

```typescript
// apps/shell/src/components/MFELoader.tsx
import { analytics } from '@myapp/frontend/analytics';

export const MFELoader = ({ mfeName, importFn }: MFELoaderProps) => {
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const startTime = Date.now();

    analytics.track({
      eventName: 'mfe_load_started',
      mfeName,
    });

    importFn()
      .then(() => {
        const loadTime = Date.now() - startTime;

        analytics.track({
          eventName: 'mfe_load_completed',
          mfeName,
          loadTime,
        });
      })
      .catch((err) => {
        const loadTime = Date.now() - startTime;

        analytics.track({
          eventName: 'mfe_load_failed',
          mfeName,
          loadTime,
          error: err.message,
        });

        setError(err);
      });
  }, [mfeName, importFn]);

  if (error) return <ErrorBoundary error={error} />;

  return <Suspense fallback={<Loader />}>{/* MFE content */}</Suspense>;
};
```

---

### 4. Backend Analytics API

**Analytics Service:**

```typescript
// apps/analytics-service/src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectQueue('analytics') private analyticsQueue: Queue,
    private prisma: PrismaService
  ) {}

  async trackEvent(event: AnalyticsEvent) {
    // Add to queue for async processing
    await this.analyticsQueue.add('process-event', event);
  }

  async trackBatch(events: AnalyticsEvent[]) {
    // Add batch to queue
    await this.analyticsQueue.add('process-batch', { events });
  }

  async identifyUser(userId: string, traits: Record<string, any>) {
    await this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...traits,
      },
      update: traits,
    });
  }

  async getEventStats(filters: {
    eventName?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }) {
    return this.prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      where: {
        eventName: filters.eventName,
        timestamp: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
        userId: filters.userId,
      },
      _count: true,
    });
  }

  async getUserJourney(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.analyticsEvent.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getFunnelAnalysis(events: string[]) {
    // Calculate conversion rates between funnel steps
    const results = [];

    for (let i = 0; i < events.length; i++) {
      const count = await this.prisma.analyticsEvent.count({
        where: { eventName: events[i] },
      });

      const conversionRate = i > 0 ? (count / results[i - 1].count) * 100 : 100;

      results.push({
        step: i + 1,
        eventName: events[i],
        count,
        conversionRate,
      });
    }

    return results;
  }

  async getRetentionCohorts(startDate: Date, period: 'day' | 'week' | 'month') {
    // Calculate cohort retention rates
    // Implementation depends on specific requirements
    return [];
  }
}
```

**Analytics Controller:**

```typescript
// apps/analytics-service/src/analytics/analytics.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('events')
  async trackEvent(@Body() event: AnalyticsEvent) {
    await this.analyticsService.trackEvent(event);
    return { success: true };
  }

  @Post('events/batch')
  async trackBatch(@Body() body: { events: AnalyticsEvent[] }) {
    await this.analyticsService.trackBatch(body.events);
    return { success: true };
  }

  @Post('identify')
  async identify(
    @Body() body: { userId: string; traits: Record<string, any> }
  ) {
    await this.analyticsService.identifyUser(body.userId, body.traits);
    return { success: true };
  }

  @Get('stats')
  async getStats(@Query() filters: any) {
    return this.analyticsService.getEventStats(filters);
  }

  @Get('journey')
  async getUserJourney(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.analyticsService.getUserJourney(
      userId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('funnel')
  async getFunnel(@Query('events') events: string) {
    return this.analyticsService.getFunnelAnalysis(events.split(','));
  }
}
```

**Analytics Queue Processor:**

```typescript
// apps/analytics-service/src/analytics/analytics.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Processor('analytics')
export class AnalyticsProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('process-event')
  async processEvent(job: Job<AnalyticsEvent>) {
    const event = job.data;

    await this.prisma.analyticsEvent.create({
      data: {
        eventName: event.eventName,
        timestamp: new Date(event.timestamp),
        userId: event.userId,
        sessionId: event.sessionId,
        mfeName: event.mfeName,
        url: event.url,
        properties: event as any,
      },
    });
  }

  @Process('process-batch')
  async processBatch(job: Job<{ events: AnalyticsEvent[] }>) {
    const { events } = job.data;

    await this.prisma.analyticsEvent.createMany({
      data: events.map((event) => ({
        eventName: event.eventName,
        timestamp: new Date(event.timestamp),
        userId: event.userId,
        sessionId: event.sessionId,
        mfeName: event.mfeName,
        url: event.url,
        properties: event as any,
      })),
    });
  }
}
```

---

### 5. Key Metrics to Track

#### Product Metrics

**User Engagement:**

- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- DAU/MAU ratio (stickiness)
- Session duration
- Sessions per user
- Page views per session

**Feature Adoption:**

- Feature usage rate
- New feature adoption rate
- Feature retention
- Time to first use
- Feature engagement over time

**Chatbot Metrics:**

- Conversations per user
- Messages per conversation
- Average conversation length
- Response time
- User satisfaction (if implemented)
- Abandoned conversations

#### Business Metrics

**Conversion Funnel:**

```typescript
const registrationFunnel = [
  'page_viewed', // Landing page
  'auth_register_started', // Started registration
  'auth_user_registered', // Completed registration
  'chat_conversation_created', // First conversation
  'chat_message_sent', // First message
];
```

**Retention Cohorts:**

- Day 1 retention
- Day 7 retention
- Day 30 retention
- Cohort analysis by signup date

**Revenue Metrics (if applicable):**

- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Customer Lifetime Value (LTV)
- Churn rate

#### Technical Metrics

**Performance:**

- MFE load time (P50, P95, P99)
- API response time
- Error rate by MFE
- Success rate by feature

**Browser/Device Distribution:**

- Browser usage
- OS distribution
- Device type (desktop/tablet/mobile)
- Screen resolution

---

### 6. Analytics Dashboards

**Metabase Dashboard Configuration:**

```yaml
# metabase/dashboards/product-overview.yml
dashboard:
  name: Product Overview
  cards:
    - type: number
      query: |
        SELECT COUNT(DISTINCT user_id)
        FROM analytics_events
        WHERE event_name = 'auth_user_login'
        AND timestamp >= NOW() - INTERVAL '24 hours'
      title: Daily Active Users

    - type: line
      query: |
        SELECT
          DATE_TRUNC('day', timestamp) as date,
          COUNT(DISTINCT user_id) as users
        FROM analytics_events
        WHERE event_name = 'auth_user_login'
        AND timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY date
        ORDER BY date
      title: Daily Active Users (30d)

    - type: funnel
      query: |
        SELECT
          event_name,
          COUNT(DISTINCT user_id) as users
        FROM analytics_events
        WHERE event_name IN (
          'page_viewed',
          'auth_register_started',
          'auth_user_registered',
          'chat_conversation_created'
        )
        GROUP BY event_name
      title: Registration Funnel

    - type: bar
      query: |
        SELECT
          mfe_name,
          COUNT(*) as loads,
          AVG(CAST(properties->>'loadTime' AS INTEGER)) as avg_load_time
        FROM analytics_events
        WHERE event_name = 'mfe_load_completed'
        AND timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY mfe_name
      title: MFE Load Performance
```

**Grafana Analytics Dashboard:**

```json
{
  "dashboard": {
    "title": "User Analytics",
    "panels": [
      {
        "title": "Active Users",
        "targets": [
          {
            "expr": "count(count by (user_id) (analytics_events{event_name='auth_user_login'}))"
          }
        ]
      },
      {
        "title": "Conversion Rate",
        "targets": [
          {
            "expr": "(count(analytics_events{event_name='auth_user_registered'}) / count(analytics_events{event_name='page_viewed'})) * 100"
          }
        ]
      },
      {
        "title": "Top Features by Usage",
        "targets": [
          {
            "expr": "topk(10, count by (event_name) (analytics_events))"
          }
        ]
      }
    ]
  }
}
```

---

### 7. Privacy and GDPR Compliance

**Privacy Configuration:**

```typescript
// libs/frontend/analytics/src/privacy.ts
export interface PrivacyConfig {
  respectDoNotTrack: boolean;
  anonymizeIP: boolean;
  cookieConsent: boolean;
  dataRetention: number; // days
}

export class PrivacyManager {
  private config: PrivacyConfig;

  constructor(config: PrivacyConfig) {
    this.config = config;
  }

  canTrack(): boolean {
    // Check Do Not Track
    if (this.config.respectDoNotTrack) {
      const dnt = navigator.doNotTrack || (window as any).doNotTrack;
      if (dnt === '1' || dnt === 'yes') {
        return false;
      }
    }

    // Check cookie consent
    if (this.config.cookieConsent) {
      return this.hasConsent();
    }

    return true;
  }

  hasConsent(): boolean {
    return localStorage.getItem('analytics_consent') === 'true';
  }

  grantConsent() {
    localStorage.setItem('analytics_consent', 'true');
  }

  revokeConsent() {
    localStorage.removeItem('analytics_consent');
    this.clearAnalyticsData();
  }

  private clearAnalyticsData() {
    // Clear session ID
    sessionStorage.removeItem('analytics_session_id');

    // Clear any stored analytics data
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('analytics_')) {
        localStorage.removeItem(key);
      }
    });
  }
}
```

**Data Anonymization:**

```typescript
// apps/analytics-service/src/analytics/anonymization.service.ts
import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class AnonymizationService {
  anonymizeIP(ip: string): string {
    // Remove last octet for IPv4
    if (ip.includes('.')) {
      const parts = ip.split('.');
      parts[3] = '0';
      return parts.join('.');
    }

    // Remove last 80 bits for IPv6
    if (ip.includes(':')) {
      const parts = ip.split(':');
      return parts.slice(0, 4).join(':') + '::0';
    }

    return ip;
  }

  hashUserId(userId: string, salt: string): string {
    return crypto
      .createHash('sha256')
      .update(userId + salt)
      .digest('hex');
  }

  removePersonalData(event: AnalyticsEvent): AnalyticsEvent {
    const { email, ...rest } = event as any;
    return rest;
  }
}
```

**Data Retention Policy:**

```typescript
// apps/analytics-service/src/analytics/retention.service.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RetentionService {
  constructor(private prisma: PrismaService) {}

  @Cron('0 0 * * *') // Run daily at midnight
  async deleteExpiredEvents() {
    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '90');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.analyticsEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Deleted ${result.count} expired analytics events`);
  }
}
```

---

### 8. Best Practices

**Do's:**

1. **Track meaningful events** - Focus on user actions that matter for product decisions
2. **Use consistent naming** - Follow the `<domain>_<object>_<action>` convention
3. **Include context** - Add relevant properties to every event
4. **Batch events** - Send events in batches to reduce network overhead
5. **Respect privacy** - Honor Do Not Track and GDPR requirements
6. **Test analytics** - Validate events are being tracked correctly
7. **Document events** - Maintain an event catalog for the team
8. **Monitor data quality** - Check for missing or malformed events

**Don'ts:**

1. **Don't track PII unnecessarily** - Minimize collection of personal data
2. **Don't block the UI** - Send analytics asynchronously
3. **Don't trust client-side data** - Validate on the backend
4. **Don't over-track** - Too many events creates noise
5. **Don't ignore failed events** - Implement retry logic
6. **Don't hardcode analytics keys** - Use environment variables
7. **Don't forget to anonymize** - Protect user privacy

**Event Catalog:**

```typescript
// ============================================
// ANALYTICS EVENT CATALOG
// ============================================

// -------------------
// Authentication Events
// -------------------

// auth_user_registered
// Description: User completes registration
// Properties:
//   - email (string, anonymized)
//   - role (string)
//   - provider (string: 'local' | 'google' | 'github')

analytics.track('auth_user_registered', {
  email: anonymize(user.email),
  role: user.role,
  provider: 'local',
});

// auth_user_login
// Description: User successfully logs in
// Properties:
//   - email (string, anonymized)
//   - role (string)
//   - provider (string)

analytics.track('auth_user_login', {
  email: anonymize(user.email),
  role: user.role,
  provider: 'local',
});

// -------------------
// Chat Events
// -------------------

// chat_conversation_created
// Description: User creates a new conversation
// Properties:
//   - conversationId (string)

analytics.track('chat_conversation_created', {
  conversationId: conversation.id,
});

// chat_message_sent
// Description: User sends a message
// Properties:
//   - conversationId (string)
//   - messageLength (number)

analytics.track('chat_message_sent', {
  conversationId: conversation.id,
  messageLength: message.content.length,
});

// chat_message_received
// Description: AI response received
// Properties:
//   - conversationId (string)
//   - messageId (string)
//   - responseTime (number, milliseconds)
//   - tokenCount (number)

analytics.track('chat_message_received', {
  conversationId: conversation.id,
  messageId: message.id,
  responseTime: 1250,
  tokenCount: 150,
});

// -------------------
// MFE Events
// -------------------

// mfe_load_completed
// Description: MFE successfully loaded
// Properties:
//   - mfeName (string)
//   - loadTime (number, milliseconds)

analytics.track('mfe_load_completed', {
  mfeName: 'chatbot-mfe',
  loadTime: 850,
});
```

---

## Deployment & Infrastructure

### Overview

This section covers the deployment strategies, infrastructure setup, and operational considerations for deploying the micro-frontend application to production environments. The architecture supports multiple deployment strategies and cloud platforms.

> **Related Sections**: See [Observability](#observability) for metrics and logging configuration, [CI/CD Pipeline](#cicd-pipeline) for automated deployment workflows, [Dockerization](#dockerization) for container build processes, and [Disaster Recovery & Business Continuity](#disaster-recovery--business-continuity) for backup and failover strategies.

### Deployment Architecture

```mermaid
graph TB
    subgraph Developer["Developer Workflow"]
        Dev["Developer"]
        Git["Git Push"]
    end

    subgraph CICD["CI/CD Pipeline"]
        GHA["GitHub Actions"]
        Build["Build & Test"]
        Docker["Docker Build"]
        Registry["Container Registry"]
    end

    subgraph Infrastructure["Cloud Infrastructure"]
        LB["Load Balancer<br/>(ALB/NLB)"]

        subgraph K8s["Kubernetes Cluster"]
            Ingress["Nginx Ingress"]

            subgraph Frontend["Frontend Pods"]
                Shell["Shell MFE"]
                Auth["Auth MFE"]
                Chat["Chatbot MFE"]
                Admin["Admin MFE"]
            end

            subgraph Backend["Backend Pods"]
                AuthSvc["Auth Service"]
                ChatSvc["Chat Service"]
                AdminSvc["Admin Service"]
            end
        end

        subgraph Data["Data Layer"]
            RDS["RDS PostgreSQL<br/>(Multi-AZ)"]
            ElastiCache["ElastiCache Redis<br/>(Cluster Mode)"]
            S3["S3 Static Assets"]
        end

        CDN["CloudFront CDN"]
    end

    subgraph Observability["Monitoring"]
        Prometheus["Prometheus"]
        Grafana["Grafana"]
        Loki["Loki Logs"]
    end

    Dev --> Git
    Git --> GHA
    GHA --> Build
    Build --> Docker
    Docker --> Registry
    Registry --> K8s

    LB --> Ingress
    Ingress --> Shell
    Ingress --> Auth
    Ingress --> Chat
    Ingress --> Admin

    Shell --> CDN
    Auth --> CDN
    Chat --> CDN
    Admin --> CDN

    AuthSvc --> RDS
    ChatSvc --> RDS
    AdminSvc --> RDS

    AuthSvc --> ElastiCache
    ChatSvc --> ElastiCache

    K8s --> Prometheus
    Prometheus --> Grafana
    K8s --> Loki

    style Infrastructure fill:#e1f5ff
    style CICD fill:#fff3e0
    style Observability fill:#f3e5f5
```

---

### 1. Cloud Platform Setup

#### AWS Infrastructure

**Infrastructure as Code with Terraform:**

```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"

  backend "s3" {
    bucket = "ai-chatbot-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
    dynamodb_table = "terraform-lock"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ai-chatbot-fullstack"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false # Multi-AZ for HA
  enable_dns_hostnames = true

  tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"

  cluster_name    = var.cluster_name
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    general = {
      desired_size = 3
      min_size     = 2
      max_size     = 10

      instance_types = ["t3.large"]
      capacity_type  = "ON_DEMAND"

      labels = {
        role = "general"
      }
    }

    frontend = {
      desired_size = 2
      min_size     = 1
      max_size     = 5

      instance_types = ["t3.medium"]
      capacity_type  = "SPOT"

      labels = {
        role = "frontend"
      }

      taints = [{
        key    = "frontend"
        value  = "true"
        effect = "NoSchedule"
      }]
    }
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "${var.project_name}-db"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"

  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result

  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  skip_final_snapshot = false
  final_snapshot_identifier = "${var.project_name}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  tags = {
    Name = "${var.project_name}-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "${var.project_name}-redis"
  replication_group_description = "Redis cluster for caching and sessions"

  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t3.medium"
  num_cache_clusters   = 2
  parameter_group_name = "default.redis7"

  port                       = 6379
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids         = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token_enabled         = true
  auth_token                 = random_password.redis_password.result

  automatic_failover_enabled = true
  multi_az_enabled          = true

  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"

  tags = {
    Name = "${var.project_name}-redis"
  }
}

# S3 Bucket for Static Assets
resource "aws_s3_bucket" "assets" {
  bucket = "${var.project_name}-static-assets"

  tags = {
    Name = "Static Assets"
  }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "mfe_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "MFE CDN Distribution"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.assets.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.assets.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.main.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "MFE CDN"
  }
}
```

**Variables:**

```hcl
# terraform/variables.tf
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ai-chatbot"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "ai-chatbot-eks"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "chatbot_db"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "dbadmin"
}
```

---

### 2. Kubernetes Deployment

#### Namespace Configuration

```yaml
# k8s/namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ai-chatbot-prod
  labels:
    name: ai-chatbot-prod
    environment: production
---
apiVersion: v1
kind: Namespace
metadata:
  name: ai-chatbot-staging
  labels:
    name: ai-chatbot-staging
    environment: staging
```

#### ConfigMap for Environment Variables

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: ai-chatbot-prod
data:
  NODE_ENV: 'production'
  LOG_LEVEL: 'info'
  CORS_ORIGIN: 'https://app.example.com'
  DATABASE_HOST: 'ai-chatbot-db.xxxxx.us-east-1.rds.amazonaws.com'
  REDIS_HOST: 'ai-chatbot-redis.xxxxx.cache.amazonaws.com'
  REDIS_PORT: '6379'
```

#### Secrets Management

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: ai-chatbot-prod
type: Opaque
stringData:
  DATABASE_URL: postgresql://dbadmin:${DB_PASSWORD}@ai-chatbot-db.xxxxx.rds.amazonaws.com:5432/chatbot_db
  JWT_SECRET: ${JWT_SECRET}
  JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
  REDIS_PASSWORD: ${REDIS_PASSWORD}
  OPENAI_API_KEY: ${OPENAI_API_KEY}
```

**Using AWS Secrets Manager:**

```yaml
# k8s/external-secrets.yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: ai-chatbot-prod
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-secrets
  namespace: ai-chatbot-prod
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: app-secrets
    creationPolicy: Owner
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: ai-chatbot/database
        property: url
    - secretKey: JWT_SECRET
      remoteRef:
        key: ai-chatbot/jwt
        property: secret
    - secretKey: OPENAI_API_KEY
      remoteRef:
        key: ai-chatbot/openai
        property: api_key
```

#### Frontend MFE Deployments

**Shell MFE Deployment:**

```yaml
# k8s/frontend/shell-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shell-mfe
  namespace: ai-chatbot-prod
  labels:
    app: shell-mfe
    tier: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: shell-mfe
  template:
    metadata:
      labels:
        app: shell-mfe
        tier: frontend
    spec:
      nodeSelector:
        role: frontend
      tolerations:
        - key: frontend
          operator: Equal
          value: 'true'
          effect: NoSchedule
      containers:
        - name: shell
          image: ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/shell-mfe:${IMAGE_TAG}
          ports:
            - containerPort: 80
              name: http
          resources:
            requests:
              memory: '128Mi'
              cpu: '100m'
            limits:
              memory: '256Mi'
              cpu: '200m'
          livenessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 5
          env:
            - name: VITE_AUTH_MFE_URL
              value: 'https://cdn.example.com/auth-mfe'
            - name: VITE_CHATBOT_MFE_URL
              value: 'https://cdn.example.com/chatbot-mfe'
            - name: VITE_ADMIN_MFE_URL
              value: 'https://cdn.example.com/admin-mfe'
            - name: VITE_API_URL
              value: 'https://api.example.com'
---
apiVersion: v1
kind: Service
metadata:
  name: shell-mfe-service
  namespace: ai-chatbot-prod
spec:
  selector:
    app: shell-mfe
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

#### Backend Service Deployments

**Auth Service Deployment:**

```yaml
# k8s/backend/auth-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: ai-chatbot-prod
  labels:
    app: auth-service
    tier: backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
        tier: backend
      annotations:
        prometheus.io/scrape: 'true'
        prometheus.io/port: '3000'
        prometheus.io/path: '/metrics'
    spec:
      containers:
        - name: auth-service
          image: ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/auth-service:${IMAGE_TAG}
          ports:
            - containerPort: 3000
              name: http
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '1Gi'
              cpu: '500m'
          env:
            - name: NODE_ENV
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: NODE_ENV
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: DATABASE_URL
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: JWT_SECRET
            - name: REDIS_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: REDIS_HOST
            - name: REDIS_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: REDIS_PASSWORD
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 2
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: ai-chatbot-prod
  labels:
    app: auth-service
spec:
  selector:
    app: auth-service
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
  namespace: ai-chatbot-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

#### Ingress Configuration

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: ai-chatbot-prod
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
    nginx.ingress.kubernetes.io/force-ssl-redirect: 'true'
    nginx.ingress.kubernetes.io/rate-limit: '100'
    nginx.ingress.kubernetes.io/limit-rps: '10'
spec:
  tls:
    - hosts:
        - app.example.com
        - api.example.com
      secretName: tls-secret
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: shell-mfe-service
                port:
                  number: 80

    - host: api.example.com
      http:
        paths:
          - path: /auth
            pathType: Prefix
            backend:
              service:
                name: auth-service
                port:
                  number: 3000

          - path: /chat
            pathType: Prefix
            backend:
              service:
                name: chatbot-service
                port:
                  number: 3001

          - path: /admin
            pathType: Prefix
            backend:
              service:
                name: admin-service
                port:
                  number: 3002
```

---

### 3. Database Migration Strategy

#### Prisma Migration Job

```yaml
# k8s/jobs/db-migration-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
  namespace: ai-chatbot-prod
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migration
          image: ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/auth-service:${IMAGE_TAG}
          command: ['npm', 'run', 'migrate:deploy']
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: DATABASE_URL
  backoffLimit: 3
```

**Migration Script:**

```json
// package.json
{
  "scripts": {
    "migrate:deploy": "prisma migrate deploy",
    "migrate:status": "prisma migrate status",
    "db:seed": "prisma db seed"
  }
}
```

**Automated Migration in CI/CD:**

```yaml
# .github/workflows/deploy.yml (excerpt)
- name: Run Database Migrations
  run: |
    kubectl apply -f k8s/jobs/db-migration-job.yaml
    kubectl wait --for=condition=complete --timeout=300s job/db-migration -n ai-chatbot-prod
```

---

### 4. Blue-Green Deployment

**Blue Environment:**

```yaml
# k8s/deployments/auth-service-blue.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service-blue
  namespace: ai-chatbot-prod
  labels:
    app: auth-service
    version: blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
      version: blue
  template:
    metadata:
      labels:
        app: auth-service
        version: blue
    spec:
      containers:
        - name: auth-service
          image: ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/auth-service:v1.0.0
          # ... rest of container spec
```

**Green Environment:**

```yaml
# k8s/deployments/auth-service-green.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service-green
  namespace: ai-chatbot-prod
  labels:
    app: auth-service
    version: green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
      version: green
  template:
    metadata:
      labels:
        app: auth-service
        version: green
    spec:
      containers:
        - name: auth-service
          image: ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/auth-service:v1.1.0
          # ... rest of container spec
```

**Service Selector:**

```yaml
# k8s/services/auth-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: ai-chatbot-prod
spec:
  selector:
    app: auth-service
    version: blue # Switch to 'green' to activate new version
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
```

**Deployment Script:**

```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

set -e

CURRENT_ENV=$(kubectl get service auth-service -n ai-chatbot-prod -o jsonpath='{.spec.selector.version}')
NEW_ENV=$([ "$CURRENT_ENV" = "blue" ] && echo "green" || echo "blue")

echo "Current environment: $CURRENT_ENV"
echo "Deploying to: $NEW_ENV"

# Deploy new version
kubectl apply -f k8s/deployments/auth-service-${NEW_ENV}.yaml

# Wait for new deployment to be ready
kubectl wait --for=condition=available --timeout=300s deployment/auth-service-${NEW_ENV} -n ai-chatbot-prod

# Run smoke tests
echo "Running smoke tests..."
./scripts/smoke-tests.sh ${NEW_ENV}

if [ $? -eq 0 ]; then
  echo "Smoke tests passed. Switching traffic to ${NEW_ENV}"

  # Switch traffic
  kubectl patch service auth-service -n ai-chatbot-prod -p '{"spec":{"selector":{"version":"'${NEW_ENV}'"}}}'

  echo "Deployment successful!"
  echo "Waiting 5 minutes before scaling down old environment..."
  sleep 300

  # Scale down old environment
  kubectl scale deployment auth-service-${CURRENT_ENV} --replicas=0 -n ai-chatbot-prod
else
  echo "Smoke tests failed. Rolling back..."
  kubectl delete deployment auth-service-${NEW_ENV} -n ai-chatbot-prod
  exit 1
fi
```

---

### 5. Canary Deployment

**Using Flagger for Canary Deployments:**

```yaml
# k8s/canary/auth-service-canary.yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: auth-service
  namespace: ai-chatbot-prod
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  service:
    port: 3000
  analysis:
    interval: 1m
    threshold: 5
    maxWeight: 50
    stepWeight: 10
    metrics:
      - name: request-success-rate
        thresholdRange:
          min: 99
        interval: 1m
      - name: request-duration
        thresholdRange:
          max: 500
        interval: 1m
    webhooks:
      - name: load-test
        url: http://flagger-loadtester.test/
        timeout: 5s
        metadata:
          cmd: 'hey -z 1m -q 10 -c 2 http://auth-service-canary.ai-chatbot-prod:3000/health'
```

**Canary Deployment Process:**

1. Deploy new version with 0% traffic
2. Gradually increase traffic: 10% → 20% → 30% → 40% → 50%
3. Monitor metrics at each step
4. If metrics are healthy, promote to 100%
5. If metrics fail, automatic rollback

---

### 6. Environment Management

#### Environment Structure

```
Environments:
├── Development (dev)
│   ├── Single namespace
│   ├── Minimal resources
│   └── Auto-deploy on merge to develop
│
├── Staging (staging)
│   ├── Production-like setup
│   ├── Full suite of services
│   └── Manual approval for deploy
│
└── Production (prod)
    ├── Multi-AZ deployment
    ├── High availability
    └── Blue-green deployment strategy
```

**Environment-Specific Configuration:**

```yaml
# k8s/overlays/dev/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: ai-chatbot-dev

bases:
  - ../../base

patchesStrategicMerge:
  - replicas-patch.yaml
  - resources-patch.yaml

configMapGenerator:
  - name: app-config
    literals:
      - NODE_ENV=development
      - LOG_LEVEL=debug

images:
  - name: auth-service
    newTag: dev-latest
```

```yaml
# k8s/overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: ai-chatbot-prod

bases:
  - ../../base

patchesStrategicMerge:
  - replicas-patch.yaml
  - resources-patch.yaml
  - hpa-patch.yaml

configMapGenerator:
  - name: app-config
    literals:
      - NODE_ENV=production
      - LOG_LEVEL=info

images:
  - name: auth-service
    newTag: v1.2.3
```

---

### 7. CDN Configuration for MFEs

**MFE Deployment to S3 + CloudFront:**

```bash
#!/bin/bash
# scripts/deploy-mfe-to-cdn.sh

MFE_NAME=$1
VERSION=$2
S3_BUCKET="ai-chatbot-static-assets"
CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"

# Build MFE
echo "Building ${MFE_NAME}..."
npm run build:${MFE_NAME}

# Sync to S3
echo "Uploading to S3..."
aws s3 sync dist/apps/${MFE_NAME} s3://${S3_BUCKET}/${MFE_NAME}/${VERSION}/ \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "remoteEntry.js"

# Upload entry files with shorter cache
aws s3 cp dist/apps/${MFE_NAME}/index.html s3://${S3_BUCKET}/${MFE_NAME}/${VERSION}/index.html \
  --cache-control "public, max-age=300"

aws s3 cp dist/apps/${MFE_NAME}/remoteEntry.js s3://${S3_BUCKET}/${MFE_NAME}/${VERSION}/remoteEntry.js \
  --cache-control "public, max-age=300"

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
  --paths "/${MFE_NAME}/${VERSION}/*"

echo "Deployment complete!"
echo "MFE available at: https://cdn.example.com/${MFE_NAME}/${VERSION}/remoteEntry.js"
```

**CloudFront Cache Policy:**

```json
{
  "CachePolicies": [
    {
      "Type": "managed",
      "Id": "658327ea-f89d-4fab-a63d-7e88639e58f6",
      "Name": "CachingOptimized"
    },
    {
      "Type": "custom",
      "CachePolicyConfig": {
        "Name": "MFE-RemoteEntry-Policy",
        "DefaultTTL": 300,
        "MaxTTL": 600,
        "MinTTL": 0,
        "ParametersInCacheKeyAndForwardedToOrigin": {
          "EnableAcceptEncodingGzip": true,
          "EnableAcceptEncodingBrotli": true,
          "QueryStringsConfig": {
            "QueryStringBehavior": "none"
          },
          "HeadersConfig": {
            "HeaderBehavior": "none"
          },
          "CookiesConfig": {
            "CookieBehavior": "none"
          }
        }
      }
    }
  ]
}
```

---

### 8. SSL/TLS Certificate Management

**Using cert-manager for Automatic Certificates:**

```yaml
# k8s/cert-manager/cluster-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
      - dns01:
          route53:
            region: us-east-1
            hostedZoneID: Z1234567890ABC
```

**Certificate Resource:**

```yaml
# k8s/certificates/app-certificate.yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: app-tls
  namespace: ai-chatbot-prod
spec:
  secretName: tls-secret
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - app.example.com
    - api.example.com
    - '*.example.com'
  renewBefore: 720h # 30 days
```

---

### 9. Monitoring & Alerting in Production

**Prometheus ServiceMonitor:**

```yaml
# k8s/monitoring/service-monitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: backend-services
  namespace: ai-chatbot-prod
  labels:
    prometheus: kube-prometheus
spec:
  selector:
    matchLabels:
      tier: backend
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
```

**Production Alerts:**

```yaml
# k8s/monitoring/alerts.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: production-alerts
  namespace: ai-chatbot-prod
spec:
  groups:
    - name: production
      interval: 30s
      rules:
        - alert: PodCrashLooping
          expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: 'Pod {{ $labels.pod }} is crash looping'
            description: 'Pod has restarted {{ $value }} times in the last 15 minutes'

        - alert: HighMemoryUsage
          expr: |
            (sum(container_memory_usage_bytes{namespace="ai-chatbot-prod"}) by (pod)
            / sum(container_spec_memory_limit_bytes{namespace="ai-chatbot-prod"}) by (pod)) > 0.9
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: 'High memory usage on {{ $labels.pod }}'

        - alert: DatabaseConnectionPoolExhausted
          expr: |
            pg_stat_database_numbackends / pg_settings_max_connections > 0.8
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: 'Database connection pool nearly exhausted'
```

---

### 10. Rollback Strategy

**Automated Rollback Script:**

```bash
#!/bin/bash
# scripts/rollback.sh

SERVICE_NAME=$1
NAMESPACE="ai-chatbot-prod"

if [ -z "$SERVICE_NAME" ]; then
  echo "Usage: ./rollback.sh <service-name>"
  exit 1
fi

echo "Rolling back ${SERVICE_NAME}..."

# Get rollback revision (previous deployment)
kubectl rollout undo deployment/${SERVICE_NAME} -n ${NAMESPACE}

# Wait for rollout to complete
kubectl rollout status deployment/${SERVICE_NAME} -n ${NAMESPACE} --timeout=300s

if [ $? -eq 0 ]; then
  echo "Rollback successful!"

  # Verify health
  READY_PODS=$(kubectl get deployment ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.status.readyReplicas}')
  DESIRED_PODS=$(kubectl get deployment ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.replicas}')

  echo "Ready pods: ${READY_PODS}/${DESIRED_PODS}"

  if [ "$READY_PODS" -eq "$DESIRED_PODS" ]; then
    echo "All pods are ready"
  else
    echo "WARNING: Not all pods are ready"
  fi
else
  echo "Rollback failed!"
  exit 1
fi
```

**Manual Rollback to Specific Revision:**

```bash
# List deployment history
kubectl rollout history deployment/auth-service -n ai-chatbot-prod

# Rollback to specific revision
kubectl rollout undo deployment/auth-service --to-revision=5 -n ai-chatbot-prod

# Check status
kubectl rollout status deployment/auth-service -n ai-chatbot-prod
```

---

### 11. Deployment Best Practices

**Do's:**

1. **Use Infrastructure as Code** - Terraform/Pulumi for reproducible infrastructure
2. **Implement health checks** - Both liveness and readiness probes
3. **Use resource limits** - Prevent resource starvation
4. **Enable autoscaling** - HPA for automatic scaling
5. **Deploy to multiple AZs** - High availability
6. **Use secrets management** - AWS Secrets Manager or HashiCorp Vault
7. **Implement progressive delivery** - Blue-green or canary deployments
8. **Monitor everything** - Logs, metrics, traces
9. **Test in staging first** - Production-like environment
10. **Have rollback plan** - Quick recovery strategy
11. **Use CDN for static assets** - CloudFront for MFEs
12. **Implement database migrations** - Automated with CI/CD

**Don'ts:**

1. **Don't deploy without testing** - Always test in staging
2. **Don't skip health checks** - Essential for zero-downtime
3. **Don't hardcode secrets** - Use secrets management
4. **Don't deploy during peak hours** - Unless using blue-green
5. **Don't skip database backups** - Critical for disaster recovery
6. **Don't ignore monitoring** - Set up alerts proactively
7. **Don't use latest tags** - Use specific version tags
8. **Don't deploy all services at once** - Deploy incrementally

---

### 12. Cost Optimization

**Strategies:**

1. **Use Spot Instances** - For non-critical workloads (dev/staging)
2. **Right-size resources** - Monitor and adjust CPU/memory limits
3. **Implement autoscaling** - Scale down during off-peak hours
4. **Use reserved instances** - For predictable workloads
5. **Optimize database** - Use read replicas, connection pooling
6. **CDN caching** - Reduce origin requests
7. **Compress assets** - Enable gzip/brotli compression
8. **Clean up unused resources** - Orphaned volumes, snapshots

**Cost Monitoring:**

```yaml
# k8s/cost-monitoring/kubecost.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: kubecost
---
apiVersion: v1
kind: Service
metadata:
  name: kubecost-cost-analyzer
  namespace: kubecost
spec:
  selector:
    app: cost-analyzer
  ports:
    - port: 9090
      targetPort: 9090
```

---

## Disaster Recovery & Business Continuity

### Overview

Disaster Recovery (DR) and Business Continuity Planning (BCP) ensure that the application can recover from catastrophic failures and continue operating during disasters. This section covers backup strategies, recovery procedures, failover mechanisms, and incident response protocols.

> **Related Sections**: See [Deployment & Infrastructure](#deployment--infrastructure) for multi-region setup and backup infrastructure, [Observability](#observability) for health checks and alerting, and [Testing](#testing) for DR drill validation procedures.

### DR Architecture

```mermaid
graph TB
    subgraph Primary["Primary Region: us-east-1"]
        PrimaryLB["Load Balancer"]
        PrimaryK8s["EKS Cluster"]
        PrimaryRDS["RDS Primary<br/>(Multi-AZ)"]
        PrimaryRedis["ElastiCache Primary"]
        PrimaryS3["S3 Bucket"]
    end

    subgraph Secondary["Secondary Region: us-west-2"]
        SecondaryLB["Load Balancer<br/>(Standby)"]
        SecondaryK8s["EKS Cluster<br/>(Standby)"]
        SecondaryRDS["RDS Read Replica"]
        SecondaryRedis["ElastiCache Replica"]
        SecondaryS3["S3 Bucket<br/>(Replication)"]
    end

    subgraph DNS["DNS & CDN"]
        Route53["Route 53<br/>(Health Checks)"]
        CloudFront["CloudFront<br/>(Multi-Region)"]
    end

    subgraph Backup["Backup Storage"]
        S3Backup["S3 Backup Bucket<br/>(Versioned)"]
        Glacier["S3 Glacier<br/>(Long-term)"]
    end

    Users["Users"]

    Users --> Route53
    Route53 --> CloudFront
    CloudFront --> PrimaryLB
    CloudFront -.Failover.-> SecondaryLB

    PrimaryLB --> PrimaryK8s
    PrimaryK8s --> PrimaryRDS
    PrimaryK8s --> PrimaryRedis
    PrimaryK8s --> PrimaryS3

    SecondaryLB -.-> SecondaryK8s
    SecondaryK8s -.-> SecondaryRDS
    SecondaryK8s -.-> SecondaryRedis
    SecondaryK8s -.-> SecondaryS3

    PrimaryRDS -."Async Replication".-> SecondaryRDS
    PrimaryRedis -."Global Datastore".-> SecondaryRedis
    PrimaryS3 -."Cross-Region Replication".-> SecondaryS3

    PrimaryRDS -->|"Daily Snapshots"| S3Backup
    S3Backup -->|"Archive after 90 days"| Glacier

    style Primary fill:#e3f2fd
    style Secondary fill:#fff3e0
    style Backup fill:#f3e5f5
    style DNS fill:#e8f5e9
```

---

### 1. Recovery Objectives

#### RTO and RPO Definitions

**Recovery Time Objective (RTO):** Maximum acceptable time to restore service after a disaster.

**Recovery Point Objective (RPO):** Maximum acceptable data loss measured in time.

**Service Tiers:**

| Service              | Tier     | RTO        | RPO        | Strategy                    |
| -------------------- | -------- | ---------- | ---------- | --------------------------- |
| Auth Service         | Critical | 15 minutes | 5 minutes  | Multi-region active-standby |
| Chatbot Service      | Critical | 15 minutes | 5 minutes  | Multi-region active-standby |
| Admin Service        | High     | 1 hour     | 30 minutes | Cross-region backup         |
| Database             | Critical | 30 minutes | 5 minutes  | Multi-AZ + read replicas    |
| Redis Cache          | High     | 15 minutes | 15 minutes | Global datastore            |
| Static Assets (MFEs) | Critical | 5 minutes  | N/A        | Multi-region CDN            |

---

### 2. Backup Strategy

#### Database Backups

**Automated RDS Snapshots:**

```hcl
# terraform/rds.tf
resource "aws_db_instance" "postgres" {
  # ... other configuration

  # Automated backups
  backup_retention_period = 30  # Keep for 30 days
  backup_window          = "03:00-04:00"  # 3-4 AM UTC

  # Final snapshot on deletion
  skip_final_snapshot = false
  final_snapshot_identifier = "${var.project_name}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  # Copy snapshots to secondary region
  copy_tags_to_snapshot = true
}

# Cross-region snapshot copy
resource "aws_db_snapshot_copy" "replica" {
  provider = aws.us-west-2

  source_db_snapshot_identifier = aws_db_instance.postgres.latest_restorable_time
  target_db_snapshot_identifier = "${var.project_name}-replica-snapshot"

  tags = {
    Name = "Cross-region snapshot copy"
  }
}
```

**Manual Backup Script:**

```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_NAME="db-backup-${ENVIRONMENT}-${TIMESTAMP}"
S3_BUCKET="ai-chatbot-backups"

echo "Starting database backup: ${BACKUP_NAME}"

# Create RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier ai-chatbot-db-${ENVIRONMENT} \
  --db-snapshot-identifier ${BACKUP_NAME}

# Wait for snapshot to complete
aws rds wait db-snapshot-completed \
  --db-snapshot-identifier ${BACKUP_NAME}

echo "Snapshot created successfully"

# Export snapshot to S3
aws rds start-export-task \
  --export-task-identifier ${BACKUP_NAME}-export \
  --source-arn arn:aws:rds:us-east-1:${AWS_ACCOUNT_ID}:snapshot:${BACKUP_NAME} \
  --s3-bucket-name ${S3_BUCKET} \
  --s3-prefix database-exports/ \
  --iam-role-arn arn:aws:iam::${AWS_ACCOUNT_ID}:role/RDSExportRole \
  --kms-key-id arn:aws:kms:us-east-1:${AWS_ACCOUNT_ID}:key/${KMS_KEY_ID}

echo "Export to S3 initiated: s3://${S3_BUCKET}/database-exports/${BACKUP_NAME}"

# Tag backup
aws rds add-tags-to-resource \
  --resource-name arn:aws:rds:us-east-1:${AWS_ACCOUNT_ID}:snapshot:${BACKUP_NAME} \
  --tags Key=Environment,Value=${ENVIRONMENT} Key=Type,Value=manual Key=CreatedBy,Value=backup-script

echo "Backup complete: ${BACKUP_NAME}"
```

**Automated Backup Schedule:**

```yaml
# k8s/cronjobs/database-backup.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: ai-chatbot-prod
spec:
  schedule: '0 2 * * *' # Daily at 2 AM UTC
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: backup-service-account
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: amazon/aws-cli:latest
              command:
                - /bin/bash
                - -c
                - |
                  TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
                  BACKUP_NAME="db-backup-cronjob-${TIMESTAMP}"

                  aws rds create-db-snapshot \
                    --db-instance-identifier ${DB_INSTANCE_ID} \
                    --db-snapshot-identifier ${BACKUP_NAME}

                  aws rds wait db-snapshot-completed \
                    --db-snapshot-identifier ${BACKUP_NAME}

                  echo "Backup completed: ${BACKUP_NAME}"
              env:
                - name: DB_INSTANCE_ID
                  value: 'ai-chatbot-db-prod'
                - name: AWS_DEFAULT_REGION
                  value: 'us-east-1'
```

#### S3 Bucket Versioning and Lifecycle

```hcl
# terraform/s3-backup.tf
resource "aws_s3_bucket" "backups" {
  bucket = "ai-chatbot-backups"

  tags = {
    Name        = "Backup Storage"
    Environment = "production"
  }
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }

    expiration {
      days = 2555  # 7 years
    }
  }

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

resource "aws_s3_bucket_replication_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  role   = aws_iam_role.replication.arn

  rule {
    id     = "replicate-to-west"
    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.backups_replica.arn
      storage_class = "STANDARD_IA"

      replication_time {
        status = "Enabled"
        time {
          minutes = 15
        }
      }

      metrics {
        status = "Enabled"
        event_threshold {
          minutes = 15
        }
      }
    }
  }
}
```

---

### 3. Data Replication

#### Database Replication

**RDS Read Replica in Secondary Region:**

```hcl
# terraform/rds-replica.tf
resource "aws_db_instance" "read_replica" {
  provider = aws.us-west-2

  identifier           = "${var.project_name}-read-replica"
  replicate_source_db  = aws_db_instance.postgres.arn
  instance_class       = "db.t3.large"

  # Replica configuration
  auto_minor_version_upgrade = true
  publicly_accessible        = false

  # Make it Multi-AZ for HA
  multi_az = true

  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "Read Replica - DR"
    Role = "disaster-recovery"
  }
}
```

**Promote Read Replica to Primary (Failover):**

```bash
#!/bin/bash
# scripts/promote-read-replica.sh

set -e

REPLICA_ID="ai-chatbot-read-replica"
REGION="us-west-2"

echo "Promoting read replica to standalone database..."

# Promote replica
aws rds promote-read-replica \
  --db-instance-identifier ${REPLICA_ID} \
  --region ${REGION}

echo "Waiting for promotion to complete..."

# Wait for promotion
aws rds wait db-instance-available \
  --db-instance-identifier ${REPLICA_ID} \
  --region ${REGION}

echo "Read replica promoted successfully!"

# Get new endpoint
NEW_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier ${REPLICA_ID} \
  --region ${REGION} \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "New primary database endpoint: ${NEW_ENDPOINT}"
echo "Update application configuration to use new endpoint"
```

#### Redis Global Datastore

```hcl
# terraform/redis-global.tf
resource "aws_elasticache_global_replication_group" "redis" {
  global_replication_group_id_suffix = "${var.project_name}-redis"
  primary_replication_group_id       = aws_elasticache_replication_group.primary.id
}

resource "aws_elasticache_replication_group" "primary" {
  replication_group_id       = "${var.project_name}-redis-primary"
  replication_group_description = "Primary Redis cluster"

  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t3.medium"
  num_cache_clusters   = 2

  automatic_failover_enabled = true
  multi_az_enabled          = true

  global_replication_group_id = aws_elasticache_global_replication_group.redis.id
}

resource "aws_elasticache_replication_group" "secondary" {
  provider = aws.us-west-2

  replication_group_id       = "${var.project_name}-redis-secondary"
  replication_group_description = "Secondary Redis cluster"

  global_replication_group_id = aws_elasticache_global_replication_group.redis.id
}
```

---

### 4. Failover Mechanisms

#### Route 53 Health Checks and Failover

```hcl
# terraform/route53.tf
resource "aws_route53_health_check" "primary" {
  fqdn              = "api.example.com"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30

  tags = {
    Name = "Primary Region Health Check"
  }
}

resource "aws_route53_health_check" "secondary" {
  fqdn              = "api-backup.example.com"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30

  tags = {
    Name = "Secondary Region Health Check"
  }
}

resource "aws_route53_record" "api_primary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.example.com"
  type    = "A"

  set_identifier = "primary"

  failover_routing_policy {
    type = "PRIMARY"
  }

  alias {
    name                   = aws_lb.primary.dns_name
    zone_id                = aws_lb.primary.zone_id
    evaluate_target_health = true
  }

  health_check_id = aws_route53_health_check.primary.id
}

resource "aws_route53_record" "api_secondary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.example.com"
  type    = "A"

  set_identifier = "secondary"

  failover_routing_policy {
    type = "SECONDARY"
  }

  alias {
    name                   = aws_lb.secondary.dns_name
    zone_id                = aws_lb.secondary.zone_id
    evaluate_target_health = true
  }
}
```

#### Automated Failover Script

```bash
#!/bin/bash
# scripts/failover-to-secondary.sh

set -e

PRIMARY_REGION="us-east-1"
SECONDARY_REGION="us-west-2"
NAMESPACE="ai-chatbot-prod"

echo "=== Starting Disaster Recovery Failover ==="
echo "Primary Region: ${PRIMARY_REGION}"
echo "Secondary Region: ${SECONDARY_REGION}"
echo ""

# Step 1: Verify secondary region is ready
echo "[1/5] Verifying secondary region readiness..."
kubectl config use-context ${SECONDARY_REGION}
READY_NODES=$(kubectl get nodes --no-headers | grep Ready | wc -l)
if [ $READY_NODES -lt 2 ]; then
  echo "ERROR: Secondary region does not have enough ready nodes"
  exit 1
fi
echo "✓ Secondary region has ${READY_NODES} ready nodes"

# Step 2: Promote read replica to primary
echo "[2/5] Promoting database read replica..."
./scripts/promote-read-replica.sh
NEW_DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier ai-chatbot-read-replica \
  --region ${SECONDARY_REGION} \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)
echo "✓ New database endpoint: ${NEW_DB_ENDPOINT}"

# Step 3: Update ConfigMap with new endpoints
echo "[3/5] Updating application configuration..."
kubectl patch configmap app-config -n ${NAMESPACE} \
  --type merge \
  -p '{"data":{"DATABASE_HOST":"'${NEW_DB_ENDPOINT}'", "REDIS_HOST":"'${NEW_REDIS_ENDPOINT}'"}}}'
echo "✓ ConfigMap updated"

# Step 4: Scale up secondary deployments
echo "[4/5] Scaling up secondary region deployments..."
for deployment in auth-service chatbot-service admin-service; do
  kubectl scale deployment ${deployment} --replicas=3 -n ${NAMESPACE}
  echo "  - Scaled ${deployment} to 3 replicas"
done

# Wait for all pods to be ready
echo "Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod \
  --selector tier=backend \
  --timeout=300s \
  -n ${NAMESPACE}
echo "✓ All pods are ready"

# Step 5: Update Route 53 to point to secondary
echo "[5/5] Updating DNS to point to secondary region..."
aws route53 change-resource-record-sets \
  --hosted-zone-id ${HOSTED_ZONE_ID} \
  --change-batch file://route53-failover.json
echo "✓ DNS updated to secondary region"

echo ""
echo "=== Failover Complete ==="
echo "The application is now running in ${SECONDARY_REGION}"
echo "Please monitor the system and verify all services are operational"
```

---

### 5. Database Restore Procedures

#### Restore from Snapshot

```bash
#!/bin/bash
# scripts/restore-database.sh

SNAPSHOT_ID=$1
NEW_INSTANCE_ID="ai-chatbot-db-restored-$(date +%Y%m%d-%H%M%S)"
REGION="us-east-1"

if [ -z "$SNAPSHOT_ID" ]; then
  echo "Usage: ./restore-database.sh <snapshot-id>"
  echo ""
  echo "Available snapshots:"
  aws rds describe-db-snapshots \
    --query 'DBSnapshots[?starts_with(DBSnapshotIdentifier, `ai-chatbot`)].{ID:DBSnapshotIdentifier,Time:SnapshotCreateTime}' \
    --output table
  exit 1
fi

echo "Restoring database from snapshot: ${SNAPSHOT_ID}"

# Restore snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ${NEW_INSTANCE_ID} \
  --db-snapshot-identifier ${SNAPSHOT_ID} \
  --db-instance-class db.t3.medium \
  --vpc-security-group-ids ${SECURITY_GROUP_ID} \
  --db-subnet-group-name ${SUBNET_GROUP_NAME} \
  --publicly-accessible false \
  --multi-az true \
  --region ${REGION}

echo "Waiting for database restoration..."
aws rds wait db-instance-available \
  --db-instance-identifier ${NEW_INSTANCE_ID} \
  --region ${REGION}

echo "Database restored successfully!"

# Get endpoint
ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier ${NEW_INSTANCE_ID} \
  --region ${REGION} \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo ""
echo "Restored database details:"
echo "  Instance ID: ${NEW_INSTANCE_ID}"
echo "  Endpoint: ${ENDPOINT}"
echo ""
echo "Next steps:"
echo "1. Test the restored database"
echo "2. Update application configuration to use new endpoint"
echo "3. Verify data integrity"
echo "4. Delete old instance if no longer needed"
```

#### Point-in-Time Recovery

```bash
#!/bin/bash
# scripts/pitr-restore.sh

SOURCE_INSTANCE=$1
RESTORE_TIME=$2  # Format: 2025-11-16T10:30:00Z
NEW_INSTANCE_ID="ai-chatbot-db-pitr-$(date +%Y%m%d-%H%M%S)"

if [ -z "$SOURCE_INSTANCE" ] || [ -z "$RESTORE_TIME" ]; then
  echo "Usage: ./pitr-restore.sh <source-instance-id> <restore-time>"
  echo "Example: ./pitr-restore.sh ai-chatbot-db-prod 2025-11-16T10:30:00Z"
  exit 1
fi

echo "Performing point-in-time recovery..."
echo "Source: ${SOURCE_INSTANCE}"
echo "Target time: ${RESTORE_TIME}"

# Get earliest and latest restorable times
EARLIEST=$(aws rds describe-db-instances \
  --db-instance-identifier ${SOURCE_INSTANCE} \
  --query 'DBInstances[0].EarliestRestorableTime' \
  --output text)

LATEST=$(aws rds describe-db-instances \
  --db-instance-identifier ${SOURCE_INSTANCE} \
  --query 'DBInstances[0].LatestRestorableTime' \
  --output text)

echo "Available restore window: ${EARLIEST} to ${LATEST}"

# Restore to point in time
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier ${SOURCE_INSTANCE} \
  --target-db-instance-identifier ${NEW_INSTANCE_ID} \
  --restore-time ${RESTORE_TIME} \
  --db-instance-class db.t3.medium \
  --multi-az true

echo "Waiting for restoration to complete..."
aws rds wait db-instance-available \
  --db-instance-identifier ${NEW_INSTANCE_ID}

echo "Point-in-time recovery completed successfully!"
```

---

### 6. Incident Response Plan

#### Incident Severity Levels

| Severity         | Description               | Response Time | Example                                  |
| ---------------- | ------------------------- | ------------- | ---------------------------------------- |
| SEV-1 (Critical) | Complete service outage   | 15 minutes    | Database crash, region failure           |
| SEV-2 (High)     | Major feature unavailable | 1 hour        | Auth service down, chat not working      |
| SEV-3 (Medium)   | Minor feature impaired    | 4 hours       | Slow response times, intermittent errors |
| SEV-4 (Low)      | Cosmetic issues           | 24 hours      | UI glitches, non-critical bugs           |

#### Incident Response Procedure

**1. Detection and Alert:**

```yaml
# k8s/monitoring/incident-alerts.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: incident-alerts
  namespace: ai-chatbot-prod
spec:
  groups:
    - name: critical-incidents
      interval: 30s
      rules:
        - alert: ServiceCompletelyDown
          expr: up{job=~".*-service"} == 0
          for: 2m
          labels:
            severity: sev-1
            page: 'true'
          annotations:
            summary: 'CRITICAL: {{ $labels.job }} is completely down'
            description: 'Service has been unavailable for 2 minutes'
            runbook: 'https://wiki.example.com/runbooks/service-down'

        - alert: DatabaseConnectionFailure
          expr: pg_up == 0
          for: 1m
          labels:
            severity: sev-1
            page: 'true'
          annotations:
            summary: 'CRITICAL: Database connection failure'
            description: 'Cannot connect to PostgreSQL database'
            runbook: 'https://wiki.example.com/runbooks/database-failure'

        - alert: HighErrorRate
          expr: |
            sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (service)
            / sum(rate(http_requests_total[5m])) by (service) > 0.1
          for: 5m
          labels:
            severity: sev-2
          annotations:
            summary: 'HIGH: Error rate above 10% on {{ $labels.service }}'
            description: 'Error rate is {{ $value | humanizePercentage }}'
```

**2. Incident Command Structure:**

```
Incident Commander (IC)
  ├── Tech Lead (TL)
  │   ├── Backend Team
  │   ├── Frontend Team
  │   └── DevOps Team
  ├── Communications Lead (CL)
  │   ├── Internal updates
  │   └── Customer communications
  └── Scribe
      └── Document timeline and actions
```

**3. Communication Template:**

```markdown
# Incident Report: [INCIDENT-ID]

**Status:** [INVESTIGATING / IDENTIFIED / MONITORING / RESOLVED]
**Severity:** SEV-X
**Start Time:** 2025-11-16 10:30 UTC
**Impact:** [Brief description of user impact]

## Timeline

- 10:30 UTC: Alert triggered - database connection failure
- 10:32 UTC: On-call engineer acknowledged
- 10:35 UTC: Incident Commander assigned
- 10:40 UTC: Root cause identified - primary RDS instance failure
- 10:45 UTC: Failover to read replica initiated
- 11:00 UTC: Service restored, monitoring

## Actions Taken

1. Promoted read replica in us-west-2 to primary
2. Updated application configuration
3. Restarted affected pods
4. Verified service health

## Current Status

Service is operational. Monitoring for stability.

## Next Steps

- [ ] Continue monitoring for 2 hours
- [ ] Schedule post-mortem for tomorrow
- [ ] Create ticket to investigate root cause
```

#### Runbook Examples

**Database Failure Runbook:**

```bash
# ============================================
# RUNBOOK: Database Connection Failure
# ============================================

# SYMPTOMS:
# - Applications cannot connect to database
# - pg_up == 0 alert firing
# - 500 errors on API endpoints

# TRIAGE STEPS:

# 1. Check database status
aws rds describe-db-instances \
  --db-instance-identifier ai-chatbot-db-prod

# 2. Check RDS events
aws rds describe-events \
  --source-identifier ai-chatbot-db-prod \
  --duration 60

# 3. Check connectivity from pods
kubectl exec -it <pod-name> -n ai-chatbot-prod -- \
  psql -h <db-endpoint> -U dbuser -d chatbot_db

# RESOLUTION STEPS:

# If database is down:

# 1. Attempt automatic recovery
aws rds reboot-db-instance \
  --db-instance-identifier ai-chatbot-db-prod

# 2. If reboot fails, initiate failover
./scripts/failover-to-secondary.sh

# 3. If failover not possible, restore from snapshot
./scripts/restore-database.sh <latest-snapshot-id>

# If connectivity issue:
# 1. Check security groups
# 2. Verify VPC endpoints
# 3. Check DNS resolution
# 4. Verify credentials in secrets

# POST-INCIDENT:

- [ ] Document root cause
- [ ] Update monitoring if needed
- [ ] Create preventive actions
- [ ] Schedule post-mortem

```

---

### 7. Testing DR Procedures

#### DR Drill Schedule

```yaml
# Quarterly DR Drill Schedule
Q1:
  - Week 1: Database snapshot restore test
  - Week 2: Failover to secondary region
  - Week 3: Application recovery test
  - Week 4: Post-drill review and improvements

Q2:
  - Week 1: PITR (Point-in-Time Recovery) test
  - Week 2: Multi-service failure simulation
  - Week 3: Full regional failover
  - Week 4: Review and documentation update
```

**DR Drill Script:**

```bash
#!/bin/bash
# scripts/dr-drill.sh

DRILL_TYPE=$1  # snapshot-restore, failover, pitr
ENVIRONMENT="staging"  # Always test in staging first

echo "=== Disaster Recovery Drill ==="
echo "Type: ${DRILL_TYPE}"
echo "Environment: ${ENVIRONMENT}"
echo "Date: $(date)"
echo ""

case ${DRILL_TYPE} in
  snapshot-restore)
    echo "Testing snapshot restore..."
    LATEST_SNAPSHOT=$(aws rds describe-db-snapshots \
      --query 'DBSnapshots | sort_by(@, &SnapshotCreateTime)[-1].DBSnapshotIdentifier' \
      --output text)
    ./scripts/restore-database.sh ${LATEST_SNAPSHOT}
    ;;

  failover)
    echo "Testing regional failover..."
    ./scripts/failover-to-secondary.sh
    ;;

  pitr)
    echo "Testing point-in-time recovery..."
    TARGET_TIME=$(date -u -d '1 hour ago' +"%Y-%m-%dT%H:%M:%SZ")
    ./scripts/pitr-restore.sh ai-chatbot-db-${ENVIRONMENT} ${TARGET_TIME}
    ;;

  *)
    echo "Unknown drill type: ${DRILL_TYPE}"
    echo "Available types: snapshot-restore, failover, pitr"
    exit 1
    ;;
esac

echo ""
echo "Drill completed. Please verify:"
echo "1. Service is operational"
echo "2. Data integrity is maintained"
echo "3. Performance is acceptable"
echo "4. No errors in logs"
echo ""
echo "Document results in: docs/dr-drills/$(date +%Y-%m-%d)-${DRILL_TYPE}.md"
```

---

### 8. Business Continuity Planning

#### Service Dependencies

```yaml
# Critical service dependencies
services:
  auth-service:
    dependencies:
      - postgresql (CRITICAL)
      - redis (HIGH)
      - jwt-signing-key (CRITICAL)
    alternatives:
      - Can operate with local cache for 5 minutes
      - Refresh tokens valid for 7 days

  chatbot-service:
    dependencies:
      - postgresql (CRITICAL)
      - openai-api (CRITICAL)
      - redis (MEDIUM)
    alternatives:
      - Queue messages if OpenAI unavailable
      - Degrade to cached responses

  frontend-mfes:
    dependencies:
      - cdn (CRITICAL)
      - backend-apis (CRITICAL)
    alternatives:
      - Service worker caching
      - Offline mode for viewing history
```

#### Degraded Mode Operations

```typescript
// libs/backend/graceful-degradation/src/circuit-breaker.ts
import { Injectable } from '@nestjs/common';

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
}

enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

@Injectable()
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: number;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  async execute<T>(
    fn: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      // Check if we should try again
      if (Date.now() - this.lastFailureTime! > this.config.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        // Circuit is open, use fallback
        return fallback();
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      return fallback();
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }
}
```

**Degraded Mode Implementation:**

```typescript
// apps/chatbot-service/src/openai/openai.service.ts
import { Injectable } from '@nestjs/common';
import { CircuitBreaker } from '@myapp/backend/graceful-degradation';

@Injectable()
export class OpenAIService {
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
    });
  }

  async generateResponse(prompt: string): Promise<string> {
    return this.circuitBreaker.execute(
      // Primary: Call OpenAI
      async () => {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
        });
        return response.choices[0].message.content;
      },

      // Fallback: Return cached or default response
      async () => {
        console.warn('OpenAI unavailable, using fallback');
        return this.getFallbackResponse(prompt);
      }
    );
  }

  private async getFallbackResponse(prompt: string): Promise<string> {
    // Try to get cached response
    const cached = await this.redis.get(`fallback:${prompt}`);
    if (cached) return cached;

    // Return generic message
    return "I'm currently experiencing technical difficulties. Please try again in a few moments.";
  }
}
```

---

### 9. DR Metrics and Monitoring

**Recovery Metrics Dashboard:**

```yaml
# Grafana dashboard for DR metrics
dashboard:
  title: 'Disaster Recovery Metrics'
  panels:
    - title: 'RTO Compliance'
      query: |
        # Time to restore service
        histogram_quantile(0.95,
          rate(incident_recovery_time_seconds_bucket[30d])
        )
      threshold:
        warning: 900 # 15 minutes
        critical: 1800 # 30 minutes

    - title: 'RPO Compliance'
      query: |
        # Data loss in seconds
        max(time() - last_successful_backup_timestamp)
      threshold:
        warning: 300 # 5 minutes
        critical: 900 # 15 minutes

    - title: 'Backup Success Rate'
      query: |
        sum(rate(backup_success_total[24h]))
        / sum(rate(backup_attempts_total[24h]))
      threshold:
        warning: 0.95
        critical: 0.90

    - title: 'Last Successful DR Drill'
      query: |
        time() - dr_drill_last_success_timestamp
```

---

### 10. DR Best Practices

**Do's:**

1. **Test regularly** - Quarterly DR drills are mandatory
2. **Automate everything** - Manual procedures are error-prone
3. **Document procedures** - Keep runbooks up-to-date
4. **Monitor continuously** - Track RTO/RPO metrics
5. **Use multi-region** - Don't rely on single region
6. **Implement circuit breakers** - Graceful degradation
7. **Version backups** - Multiple restore points
8. **Encrypt backups** - Security even in backups
9. **Tag resources** - Easy identification during incidents
10. **Train the team** - Everyone should know DR procedures
11. **Automate failover** - Reduce human error
12. **Keep communication channels** - External status page

**Don'ts:**

1. **Don't skip DR testing** - Untested plans fail
2. **Don't rely on single backup** - Multiple copies in multiple locations
3. **Don't ignore alerts** - False positives indicate monitoring issues
4. **Don't panic during incidents** - Follow runbooks systematically
5. **Don't forget to communicate** - Keep stakeholders informed
6. **Don't skip post-mortems** - Learn from every incident
7. **Don't neglect documentation** - Update after every drill
8. **Don't over-complicate** - Simple procedures execute better under stress

---

## API Documentation & Contracts

### Overview

This section covers the API contracts, documentation standards, and communication protocols between frontend MFEs and backend services. Clear API documentation ensures reliable integration and reduces integration bugs.

> **Related Sections**: See [Testing](#testing) for contract testing strategies with Pact, [Deployment & Infrastructure](#deployment--infrastructure) for API Gateway configuration, and [Observability](#observability) for API metrics and tracing.

### API Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend MFEs"]
        Shell["Shell MFE"]
        Auth["Auth MFE"]
        Chat["Chatbot MFE"]
        Admin["Admin MFE"]
    end

    subgraph Gateway["API Gateway"]
        Nginx["Nginx Gateway<br/>Rate Limiting"]
    end

    subgraph Backend["Backend Services"]
        AuthAPI["Auth Service<br/>Port 3000"]
        ChatAPI["Chatbot Service<br/>Port 3001"]
        AdminAPI["Admin Service<br/>Port 3002"]
    end

    subgraph Docs["API Documentation"]
        Swagger["Swagger UI<br/>/api/docs"]
        OpenAPI["OpenAPI Spec<br/>openapi.json"]
    end

    Shell --> Nginx
    Auth --> Nginx
    Chat --> Nginx
    Admin --> Nginx

    Nginx --> AuthAPI
    Nginx --> ChatAPI
    Nginx --> AdminAPI

    AuthAPI --> Swagger
    ChatAPI --> Swagger
    AdminAPI --> Swagger

    Swagger --> OpenAPI

    style Frontend fill:#e3f2fd
    style Backend fill:#fff3e0
    style Gateway fill:#e8f5e9
    style Docs fill:#f3e5f5
```

---

### 1. OpenAPI/Swagger Setup

#### NestJS Swagger Configuration

```typescript
// apps/auth-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Authentication and user management API')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addServer('http://localhost:3000', 'Local development')
    .addServer('https://api.example.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Auth Service API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // Export OpenAPI spec
  const fs = require('fs');
  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

  await app.listen(3000);
}

bootstrap();
```

---

### 2. Auth Service API

#### Authentication Endpoints

**Register User:**

```typescript
// apps/auth-service/src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - email already exists',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(
    @Body() refreshDto: { refreshToken: string }
  ): Promise<AuthResponseDto> {
    return this.authService.refresh(refreshDto.refreshToken);
  }
}
```

**DTOs with Validation:**

```typescript
// apps/auth-service/src/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'User password (min 8 characters, must include uppercase, lowercase, number, and special character)',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'User password',
  })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token (expires in 15 minutes)',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token (expires in 7 days)',
  })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: 'uuid-here',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'user',
    },
    description: 'User information',
  })
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
```

#### User Management Endpoints

```typescript
// apps/auth-service/src/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto, UserResponseDto } from './dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req): Promise<UserResponseDto> {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - cannot update other users',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ message: string }> {
    await this.usersService.delete(id, req.user.id);
    return { message: 'User deleted successfully' };
  }
}
```

---

### 3. Chatbot Service API

#### Conversation Endpoints

```typescript
// apps/chatbot-service/src/conversations/conversations.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import {
  CreateConversationDto,
  UpdateConversationDto,
  ConversationResponseDto,
  PaginatedConversationsDto,
} from './dto';

@ApiTags('conversations')
@Controller('chat/conversations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all conversations for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of conversations',
    type: PaginatedConversationsDto,
  })
  async getConversations(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string
  ): Promise<PaginatedConversationsDto> {
    return this.conversationsService.findAll(req.user.id, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Conversation details',
    type: ConversationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(
    @Param('id') id: string,
    @Request() req
  ): Promise<ConversationResponseDto> {
    return this.conversationsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created',
    type: ConversationResponseDto,
  })
  async createConversation(
    @Body() createDto: CreateConversationDto,
    @Request() req
  ): Promise<ConversationResponseDto> {
    return this.conversationsService.create(createDto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update conversation title' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Conversation updated',
    type: ConversationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async updateConversation(
    @Param('id') id: string,
    @Body() updateDto: UpdateConversationDto,
    @Request() req
  ): Promise<ConversationResponseDto> {
    return this.conversationsService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Conversation deleted' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async deleteConversation(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ message: string }> {
    await this.conversationsService.delete(id, req.user.id);
    return { message: 'Conversation deleted successfully' };
  }
}
```

#### Message Endpoints with Streaming

```typescript
// apps/chatbot-service/src/messages/messages.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import {
  CreateMessageDto,
  MessageResponseDto,
  PaginatedMessagesDto,
} from './dto';

interface MessageEvent {
  data: {
    type: 'token' | 'done' | 'error';
    content?: string;
    message?: MessageResponseDto;
    error?: string;
  };
}

@ApiTags('messages')
@Controller('chat/conversations/:conversationId/messages')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get messages for a conversation (paginated)' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({
    status: 200,
    description: 'List of messages',
    type: PaginatedMessagesDto,
  })
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Request() req
  ): Promise<PaginatedMessagesDto> {
    return this.messagesService.findAll(
      conversationId,
      req.user.id,
      page,
      limit
    );
  }

  @Post()
  @ApiOperation({ summary: 'Send a message (non-streaming)' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 201,
    description: 'Message sent and response received',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() createDto: CreateMessageDto,
    @Request() req
  ): Promise<MessageResponseDto> {
    return this.messagesService.create(conversationId, createDto, req.user.id);
  }

  @Sse('stream')
  @ApiOperation({
    summary: 'Send a message with streaming response (SSE)',
    description: 'Returns Server-Sent Events with real-time AI response tokens',
  })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Streaming response',
  })
  streamMessage(
    @Param('conversationId') conversationId: string,
    @Body() createDto: CreateMessageDto,
    @Request() req
  ): Observable<MessageEvent> {
    return this.messagesService.createWithStream(
      conversationId,
      createDto,
      req.user.id
    );
  }

  @Delete(':messageId')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message deleted' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Request() req
  ): Promise<{ message: string }> {
    await this.messagesService.delete(messageId, req.user.id);
    return { message: 'Message deleted successfully' };
  }
}
```

**DTOs:**

```typescript
// apps/chatbot-service/src/messages/dto/create-message.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    example: 'What is the weather like today?',
    description: 'Message content',
    minLength: 1,
    maxLength: 4000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'Message ID' })
  id: string;

  @ApiProperty({ example: 'uuid-here', description: 'Conversation ID' })
  conversationId: string;

  @ApiProperty({
    example: 'user',
    description: 'Message role',
    enum: ['user', 'assistant', 'system'],
  })
  role: 'user' | 'assistant' | 'system';

  @ApiProperty({
    example: 'What is the weather like today?',
    description: 'Message content',
  })
  content: string;

  @ApiProperty({ example: 150, description: 'Token count (for AI responses)' })
  tokenCount?: number;

  @ApiProperty({ example: '2025-11-16T10:30:00Z', description: 'Created at' })
  createdAt: Date;
}

export class PaginatedMessagesDto {
  @ApiProperty({ type: [MessageResponseDto] })
  data: MessageResponseDto[];

  @ApiProperty({ example: 1, description: 'Current page' })
  page: number;

  @ApiProperty({ example: 50, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Total items' })
  total: number;

  @ApiProperty({ example: 2, description: 'Total pages' })
  totalPages: number;
}
```

---

### 4. Admin Service API

```typescript
// apps/admin-service/src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { PaginatedUsersDto, UserStatsDto } from './dto';

@ApiTags('admin')
@Controller('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: PaginatedUsersDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('role') role?: string
  ): Promise<PaginatedUsersDto> {
    return this.adminService.getAllUsers(page, limit, role);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  @ApiResponse({
    status: 200,
    description: 'Platform statistics',
    type: UserStatsDto,
  })
  async getStats(): Promise<UserStatsDto> {
    return this.adminService.getStats();
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(
    @Param('id') id: string,
    @Query('role') role: string
  ): Promise<{ message: string }> {
    await this.adminService.updateUserRole(id, role);
    return { message: 'User role updated successfully' };
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (admin)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.adminService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}
```

---

### 5. API Versioning Strategy

#### URL Versioning

```typescript
// apps/auth-service/src/main.ts
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  await app.listen(3000);
}
```

**Versioned Controller:**

```typescript
// apps/auth-service/src/auth/auth-v2.controller.ts
import { Controller, Version } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  // Version 1 (default)
  @Post('login')
  @Version('1')
  async loginV1(@Body() loginDto: LoginDto) {
    // Legacy login logic
  }

  // Version 2 (with additional features)
  @Post('login')
  @Version('2')
  async loginV2(@Body() loginDto: LoginV2Dto) {
    // New login logic with 2FA support
  }
}
```

**API Versioning Best Practices:**

- Use semantic versioning (v1, v2, v3)
- Maintain backward compatibility for at least 2 versions
- Deprecate old versions with clear timelines
- Document breaking changes prominently
- Provide migration guides

---

### 6. Error Response Format

**Standardized Error Response:**

```typescript
// libs/backend/common/src/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  correlationId?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: exceptionResponse.message || exception.message,
      error: exceptionResponse.error || HttpStatus[status],
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId: request.headers['x-correlation-id'] as string,
    };

    response.status(status).json(errorResponse);
  }
}
```

**Error Code Catalog:**

```typescript
// libs/backend/common/src/errors/error-codes.ts
export enum ErrorCode {
  // Authentication errors (1000-1099)
  INVALID_CREDENTIALS = 1001,
  TOKEN_EXPIRED = 1002,
  INVALID_TOKEN = 1003,
  UNAUTHORIZED = 1004,

  // User errors (1100-1199)
  USER_NOT_FOUND = 1101,
  USER_ALREADY_EXISTS = 1102,
  INVALID_USER_DATA = 1103,

  // Conversation errors (2000-2099)
  CONVERSATION_NOT_FOUND = 2001,
  CONVERSATION_ACCESS_DENIED = 2002,

  // Message errors (2100-2199)
  MESSAGE_NOT_FOUND = 2101,
  MESSAGE_TOO_LONG = 2102,
  RATE_LIMIT_EXCEEDED = 2103,

  // OpenAI errors (3000-3099)
  OPENAI_API_ERROR = 3001,
  OPENAI_RATE_LIMIT = 3002,
  CONTEXT_LENGTH_EXCEEDED = 3003,

  // Server errors (5000-5099)
  INTERNAL_SERVER_ERROR = 5001,
  DATABASE_ERROR = 5002,
  EXTERNAL_SERVICE_ERROR = 5003,
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}
```

**Example Error Responses:**

```json
// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "path": "/api/v1/auth/login",
  "correlationId": "abc-123-def-456"
}

// 400 Bad Request - Validation Error
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "path": "/api/v1/auth/register",
  "correlationId": "abc-123-def-456"
}

// 429 Rate Limit Exceeded
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Maximum 10 messages per minute.",
  "error": "Too Many Requests",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "path": "/api/v1/chat/conversations/123/messages",
  "correlationId": "abc-123-def-456",
  "retryAfter": 45
}
```

---

### 7. Rate Limiting

**Global Rate Limiting:**

```typescript
// apps/auth-service/src/main.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  });

  // Global rate limiter
  app.use(
    rateLimit({
      store: new RedisStore({
        client: redis,
        prefix: 'rl:',
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per 15 minutes
      message: {
        statusCode: 429,
        message: 'Too many requests, please try again later',
        error: 'Too Many Requests',
      },
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  await app.listen(3000);
}
```

**Endpoint-Specific Rate Limiting:**

```typescript
// apps/chatbot-service/src/messages/messages.controller.ts
import { Throttle } from '@nestjs/throttler';

@Controller('chat/conversations/:conversationId/messages')
export class MessagesController {
  // 10 messages per minute per user
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() createDto: CreateMessageDto,
    @Request() req
  ): Promise<MessageResponseDto> {
    return this.messagesService.create(conversationId, createDto, req.user.id);
  }
}
```

---

### 8. Contract Testing

**Pact Contract Testing:**

```typescript
// apps/auth-service/test/contract/auth.pact.spec.ts
import { Test } from '@nestjs/testing';
import { Pact } from '@pact-foundation/pact';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';

describe('Auth Service Contract', () => {
  let provider: Pact;

  beforeAll(async () => {
    provider = new Pact({
      consumer: 'auth-mfe',
      provider: 'auth-service',
      port: 3030,
      log: './pact/logs',
      dir: './pact/pacts',
    });

    await provider.setup();
  });

  afterAll(async () => {
    await provider.finalize();
  });

  describe('POST /auth/login', () => {
    it('should return access token on successful login', async () => {
      await provider.addInteraction({
        state: 'user exists',
        uponReceiving: 'a login request',
        withRequest: {
          method: 'POST',
          path: '/auth/login',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'user@example.com',
            password: 'SecurePass123!',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            accessToken: 'jwt-token-here',
            refreshToken: 'refresh-token-here',
            user: {
              id: 'user-id',
              email: 'user@example.com',
              name: 'John Doe',
              role: 'user',
            },
          },
        },
      });

      // Test implementation
    });
  });
});
```

---

### 9. Frontend API Client

**TypeScript API Client Generator:**

```bash
# Generate TypeScript client from OpenAPI spec
npx openapi-typescript-codegen \
  --input http://localhost:3000/api/docs-json \
  --output libs/frontend/api-client/src/generated \
  --client axios
```

**Type-Safe API Client:**

```typescript
// libs/frontend/api-client/src/auth-api.ts
import axios, { AxiosInstance } from 'axios';
import { RegisterDto, LoginDto, AuthResponseDto } from './generated';

export class AuthApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: LoginDto): Promise<AuthResponseDto> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const response = await this.client.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  setAccessToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}
```

**React Query Integration:**

```typescript
// libs/frontend/api-client/src/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApiClient } from '../clients';
import { LoginDto, RegisterDto } from '../generated';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDto) => authApiClient.login(data),
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Set in client
      authApiClient.setAccessToken(data.accessToken);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterDto) => authApiClient.register(data),
  });
};
```

---

### 10. API Documentation Best Practices

**Do's:**

1. **Use OpenAPI/Swagger** - Industry standard for API documentation
2. **Document all endpoints** - Including parameters, responses, errors
3. **Provide examples** - Request/response examples for clarity
4. **Version your APIs** - Clear versioning strategy
5. **Use DTOs with validation** - Type-safe contracts
6. **Standardize error responses** - Consistent error format
7. **Implement rate limiting** - Protect services from abuse
8. **Generate TypeScript clients** - Type safety on frontend
9. **Add API health endpoints** - For monitoring
10. **Document authentication** - Clear auth requirements
11. **Use contract testing** - Ensure API contracts are maintained
12. **Keep docs up-to-date** - Update with code changes

**Don'ts:**

1. **Don't skip validation** - Always validate input
2. **Don't expose internal errors** - Sanitize error messages
3. **Don't break backward compatibility** - Use versioning
4. **Don't forget CORS** - Configure properly
5. **Don't hardcode values** - Use environment variables
6. **Don't skip rate limiting** - Prevents abuse
7. **Don't ignore security** - Implement proper auth/authz
8. **Don't forget pagination** - For list endpoints

**API Documentation Checklist:**

```markdown
- [ ] All endpoints documented with Swagger decorators
- [ ] Request/response examples provided
- [ ] Error responses documented
- [ ] Authentication requirements specified
- [ ] Rate limits documented
- [ ] Pagination explained for list endpoints
- [ ] Versioning strategy documented
- [ ] OpenAPI spec exported and accessible
- [ ] TypeScript client generated
- [ ] Contract tests implemented
- [ ] Postman collection available
- [ ] Integration guide written
```

---

## Architecture Decision Records (ADRs)

This section documents key architectural decisions made during the project, following the ADR format: Context, Decision, Consequences.

### ADR-001: Module Federation over Monolithic SPA

**Date:** November 2025  
**Status:** Accepted

**Context:**

- Need to support 3-5 independent development teams
- Requirement for independent feature deployment without full system releases
- Desire to avoid merge conflicts and coordination overhead
- Need for incremental React upgrades without "big bang" migrations

**Decision:**
We will use Module Federation (via `@module-federation/vite`) to implement micro-frontend architecture instead of a monolithic SPA.

**Consequences:**

_Positive:_

- Teams can deploy features independently (10+ deploys/day vs 2-3/week)
- Reduced merge conflicts (90% reduction observed in similar architectures)
- Incremental framework upgrades possible (React 18 → 19 MFE by MFE)
- Fault isolation (one MFE crash doesn't affect others with error boundaries)
- Optimal bundle sizes through shared dependencies (80% reduction)

_Negative:_

- Increased complexity in build configuration (remoteEntry management)
- Need for comprehensive documentation (this document)
- Debugging across MFE boundaries more complex (requires source maps)
- Requires strong governance for shared dependencies (singleton enforcement)

_Mitigation:_

- Nx monorepo for unified tooling and intelligent caching
- Comprehensive Module Federation setup documentation
- Shared component library (`@myapp/frontend/ui-components`) for consistency
- Regular architecture review meetings (bi-weekly)

### ADR-002: Zustand over Redux for State Management

**Date:** November 2025  
**Status:** Accepted

**Context:**

- Need global state accessible across MFE boundaries
- Redux requires complex Provider nesting in Module Federation
- Team prefers simpler API with less boilerplate
- localStorage persistence required for auth state

**Decision:**
We will use Zustand with vanilla stores (no Provider) for cross-MFE state management.

**Consequences:**

_Positive:_

- 80% less boilerplate vs Redux Toolkit
- No Provider hell in Shell app (no nesting issues)
- Works seamlessly across MFE boundaries (singleton pattern)
- Built-in middleware for persistence (`zustand/middleware`)
- Bundle size: 2.9KB vs 47KB (Redux + Redux Toolkit)
- TypeScript-first design with excellent type inference

_Negative:_

- Less ecosystem tooling (no DevTools as rich as Redux DevTools)
- Smaller community than Redux (fewer Stack Overflow answers)
- Less opinionated (need to establish conventions)

_Mitigation:_

- `zustand/middleware/devtools` for Redux DevTools integration
- Documented naming conventions for stores in shared library
- Example implementations in `@myapp/frontend/stores`

### ADR-003: Path-Based Routing over Custom Communication Protocol

**Date:** November 2025  
**Status:** Accepted

**Context:**

- MFEs need to respond to URL changes for rendering
- Could use custom events/message bus for navigation
- React Router already provides routing primitives
- Browser history API is the source of truth for navigation

**Decision:**
Shell owns routing via React Router 7. MFEs read `window.location.pathname` to determine what to render.

**Consequences:**

_Positive:_

- Simple mental model (URL is single source of truth)
- Browser back/forward buttons work naturally
- Deep linking fully supported
- No custom protocol to learn or maintain
- Standard React patterns apply

_Negative:_

- MFEs tightly coupled to URL structure
- Refactoring URLs requires coordination across teams
- Cannot easily nest routes within MFEs (flat structure)

_Mitigation:_

- Document URL structure in architecture docs (this document)
- Use constants for route paths (`/auth/*`, `/chatbot/*`)
- Version URLs if major changes needed (`/v2/auth/*`)

### ADR-004: Nx Monorepo over Polyrepo

**Date:** November 2025  
**Status:** Accepted

**Context:**

- 19 packages to manage (3 backend, 5 frontend, 11 libraries)
- Need to share TypeScript types between frontend and backend
- Want to avoid "dependency hell" with npm link
- Desire fast builds with intelligent caching

**Decision:**
We will use Nx monorepo (v22+) to house all frontend, backend, and shared code in a single repository.

**Consequences:**

_Positive:_

- Atomic commits across packages (shared types + implementation)
- Shared TypeScript configs, ESLint rules, and tooling
- Intelligent build caching (5-10x faster builds with Nx Cloud)
- Affected command detection (test only what changed, not everything)
- Dependency graph visualization (`nx graph`)
- Code generators for consistency (`nx g @nx/react:component`)
- Single version of dependencies (no version conflicts)

_Negative:_

- Large repository size (can be slow to clone initially)
- Requires learning Nx concepts (targets, projects, executors)
- CI/CD needs Nx Cloud for distributed caching (cost consideration)
- Not all engineers familiar with monorepos (learning curve)

_Mitigation:_

- Sparse checkout strategies for large repos (not needed yet)
- Nx training documentation and onboarding guide
- Nx Cloud free tier (sufficient for open source)
- Clear contribution guidelines (`CONTRIBUTING.md`)

### ADR-005: React 19 with Backward Compatibility

**Date:** November 2025  
**Status:** Accepted

**Context:**

- React 19 offers significant performance improvements and new features
- Some MFEs may lag behind in upgrade cycle
- Module Federation allows version flexibility
- Need to avoid "two Reacts" problem causing hydration errors

**Decision:**
Shell uses React 19. MFEs can use React 18+ with singleton enforcement via Module Federation to prevent duplicate React instances.

**Consequences:**

_Positive:_

- Access to latest React features (`use` hook, React Compiler)
- Incremental upgrades (MFEs upgrade independently over weeks/months)
- No forced "big bang" migration (reduced risk)
- Performance improvements from React 19 (40% faster renders in benchmarks)

_Negative:_

- Potential compatibility issues (React 18 hooks in React 19)
- Need to test all MFEs with React 19 runtime
- Some React 19 features unavailable in React 18 MFEs (use hook)

_Mitigation:_

- Module Federation singleton configuration enforces one React
- Testing matrix for version compatibility (CI checks)
- Gradual rollout strategy (Shell first, then MFEs)
- Clear upgrade guide for teams (`docs/REACT_19_MIGRATION.md`)

### ADR-006: OpenAPI + Zod for API Contracts

**Date:** November 2025  
**Status:** Accepted

**Context:**

- Frontend and backend teams work in parallel
- Need type-safe API contracts to prevent runtime errors
- Want to generate TypeScript types automatically
- Zod provides runtime validation on backend

**Decision:**
Backend exposes OpenAPI 3.1 specs. Shared `@myapp/shared/types` library uses Zod schemas that convert to both TypeScript types and OpenAPI schemas.

**Consequences:**

_Positive:_

- Single source of truth for API contracts (Zod schemas)
- Runtime validation on backend (catches invalid requests)
- TypeScript types on frontend (auto-generated, never out of sync)
- Contract testing possible with OpenAPI (Pact/Dredd)
- API documentation auto-generated (Swagger UI at `/api-docs`)

_Negative:_

- Additional tooling complexity (zod-to-openapi, orval)
- Need to keep Zod schemas in sync with implementation
- Learning curve for Zod syntax (different from JSON Schema)

_Mitigation:_

- Automated CI checks for schema drift (fails build if mismatch)
- Code generators for boilerplate (`nx g @myapp/api-endpoint`)
- Comprehensive examples in shared types library
- Zod training session for backend team

---

## Known Issues

### 1. Implement Proper MFE Communication Layer

**Current:** Direct Zustand store sharing  
**Proposed:** Event-driven communication bus

```typescript
// libs/frontend/event-bus/src/index.ts
export class MFEEventBus {
  private listeners = new Map<string, Set<Function>>();

  publish(event: string, data: any) {
    const handlers = this.listeners.get(event);
    handlers?.forEach((handler) => handler(data));
  }

  subscribe(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => this.listeners.get(event)?.delete(handler);
  }
}

export const eventBus = new MFEEventBus();

// Usage
eventBus.publish('auth:login', { userId: '123' });
eventBus.subscribe('auth:logout', () => {
  /* clear local state */
});
```

**Benefits:**

- Loose coupling between MFEs
- Type-safe events with TypeScript
- Easy to test in isolation
- Can add event logging/debugging

### 2. Add E2E Testing with Playwright

**Current:** No E2E tests  
**Proposed:** Playwright test suite

```typescript
// tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test('user can register and login', async ({ page }) => {
  // Navigate to register
  await page.goto('http://localhost:5173/register');

  // Fill form (Auth MFE)
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Password123!');
  await page.fill('[name="name"]', 'Test User');
  await page.click('button[type="submit"]');

  // Verify redirect to login
  await expect(page).toHaveURL('/login');

  // Login
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('nav')).toContainText('Test User');
});

test('cross-MFE navigation works', async ({ page }) => {
  await loginAsUser(page);

  // Click Chat in navbar (Shell)
  await page.click('a[href="/chatbot"]');
  await expect(page).toHaveURL('/chatbot');
  await expect(page.locator('h1')).toContainText('Chat');

  // Click Profile
  await page.click('a[href="/profile"]');
  await expect(page).toHaveURL('/profile');
  await expect(page.locator('h1')).toContainText('Profile');
});
```

**Setup:**

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 3. Implement Module Federation Versioning

**Current:** No version management for MFEs  
**Proposed:** Semantic versioning with compatibility checks

```typescript
// vite.config.ts
federation({
  name: 'authMfe',
  version: '1.2.3', // Semantic version
  exposes: {
    './Module': {
      import: './src/app/app.tsx',
      requiredVersion: '^1.0.0', // Compatible versions
    },
  },
  remoteVersion: {
    minVersion: '1.0.0',
    maxVersion: '2.0.0',
  },
});
```

**Benefits:**

- Prevent breaking changes
- Gradual rollouts
- Canary deployments
- A/B testing different MFE versions

### 4. Add Performance Monitoring

**Current:** No performance tracking  
**Proposed:** Web Vitals + custom metrics

```typescript
// libs/frontend/monitoring/src/index.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to Google Analytics, Datadog, etc.
  console.log(metric);
}

// Measure Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Custom metrics
export function measureMFELoadTime(mfeName: string) {
  const startTime = performance.now();

  return () => {
    const loadTime = performance.now() - startTime;
    sendToAnalytics({
      name: 'mfe_load_time',
      value: loadTime,
      mfe: mfeName,
    });
  };
}

// Usage in Shell
const onMFELoaded = measureMFELoadTime('authMfe');
lazy(() =>
  import('authMfe/Module').then((m) => {
    onMFELoaded();
    return m;
  })
);
```

### 5. Improve Error Boundaries and Fallbacks

**Current:** Basic Suspense fallbacks  
**Proposed:** Comprehensive error handling

```typescript
// libs/frontend/ui-components/src/MFEErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  mfeName: string;
  fallback?: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MFEErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`[${this.props.mfeName}] Error:`, error, errorInfo);
    // Send to Sentry/error tracking
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-semibold">
            {this.props.mfeName} failed to load
          </h2>
          <p className="text-red-600 text-sm">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 underline"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in Shell
<MFEErrorBoundary mfeName="Auth MFE">
  <Suspense fallback={<LoadingSpinner />}>
    <AuthMfe />
  </Suspense>
</MFEErrorBoundary>
```

### 6. Add Bundle Analysis and Optimization

**Current:** No bundle size tracking  
**Proposed:** Automated bundle analysis

```bash
# Install analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  visualizer({
    filename: 'dist/stats.html',
    open: true,
    gzipSize: true,
  })
]

# Build and analyze
nx build shell
# Opens browser with bundle visualization
```

**Optimization Targets:**

- Shell: < 300KB gzipped
- Each MFE: < 200KB gzipped
- Shared libs: < 150KB gzipped

### 7. Implement Proper CI/CD Pipeline

**Current:** Manual builds  
**Proposed:** GitHub Actions workflow

```yaml
# .github/workflows/frontend-deploy.yml
name: Frontend Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build MFEs
        run: |
          nx build auth-mfe --prod
          nx build chatbot-mfe --prod
          nx build admin-mfe --prod
          nx build profile-mfe --prod
          nx build shell --prod

      - name: Deploy to S3
        run: |
          aws s3 sync dist/apps/shell s3://my-app-shell
          aws s3 sync dist/apps/auth-mfe s3://my-app-auth-mfe
          # ... other MFEs

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} \
            --paths "/*"
```

### 8. Add Feature Flags for Gradual Rollouts

**Current:** All-or-nothing deployments  
**Proposed:** Feature flag system

```typescript
// libs/frontend/feature-flags/src/index.ts
export const featureFlags = {
  enableNewChatUI: process.env.VITE_FEATURE_NEW_CHAT === 'true',
  enableAdminAnalytics: process.env.VITE_FEATURE_ADMIN_ANALYTICS === 'true',
  enableProfileUpload: process.env.VITE_FEATURE_PROFILE_UPLOAD === 'true',
};

// Usage
import { featureFlags } from '@myapp/frontend/feature-flags';

export function ChatPage() {
  return featureFlags.enableNewChatUI
    ? <NewChatUI />
    : <LegacyChatUI />;
}
```

**Benefits:**

- Test in production with limited users
- Quick rollback (just flip flag)
- A/B testing
- Gradual rollouts (10% → 50% → 100%)

### 9. Implement Shared Design System

**Current:** Basic Tailwind components  
**Proposed:** Comprehensive design system with Storybook

```bash
# Install Storybook
npx nx g @nx/storybook:configuration ui-components

# Create stories
// libs/frontend/ui-components/src/Button.stories.tsx
import { Button } from './Button';

export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = () => <Button variant="primary">Click me</Button>;
export const Secondary = () => <Button variant="secondary">Cancel</Button>;
```

**Benefits:**

- Visual documentation
- Component playground
- Consistent UI across MFEs
- Easier onboarding for new developers

### 10. Add Authentication Token Refresh Logic

**Current:** Manual token handling  
**Proposed:** Automatic token refresh with axios interceptor

```typescript
// libs/frontend/api-client/src/interceptors.ts
import axios from 'axios';
import { useAuthStore } from '@myapp/frontend/stores';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        const response = await axios.post('/auth/refresh', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        useAuthStore.getState().clearAuth();
        window.location.replace('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api };
```

---

## Appendix

### Quick Reference: npm Scripts

```bash
# Frontend Development
npm run dev:frontend          # Start all frontend apps
npm run dev:shell             # Start shell only
npm run dev:auth-mfe          # Start Auth MFE only
npm run dev:chatbot-mfe       # Start Chatbot MFE only
npm run dev:admin-mfe         # Start Admin MFE only
npm run dev:profile-mfe       # Start Profile MFE only

# Backend Development
npm run docker:up             # Start PostgreSQL + Redis
npm run dev:backend           # Start all backend services
npm run dev:auth              # Start Auth Service only
npm run dev:chatbot           # Start Chatbot Service only
npm run dev:admin             # Start Admin Service only

# Build
npm run build                 # Build all apps
npm run build:affected        # Build only changed apps

# Testing
npm run test                  # Run all tests
npm run test:watch            # Watch mode
npm run test:affected         # Test only changed code

# Utilities
npm run graph                 # View dependency graph
npm run kill:all              # Kill all running processes
npm run format                # Format code with Prettier
npm run lint                  # Lint all code
```

### Troubleshooting Guide

#### Issue: MFE Not Loading / "Failed to Fetch Remote Entry"

**Cause:** MFE development server not running  
**Solution:**

```bash
# Check if MFE is running
lsof -i :5174  # Auth MFE
lsof -i :5175  # Chatbot MFE

# Start the MFE
npm run dev:auth-mfe
```

#### Issue: React Version Mismatch Error

**Cause:** Different React versions in shell and MFE  
**Solution:**

```bash
# Check versions
npm list react --depth=0

# Ensure all use same version (package.json)
# Then reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: TypeScript Cannot Find @myapp/\* Imports

**Cause:** TypeScript server not recognizing path aliases  
**Solution:**

1. Restart TS server: Cmd+Shift+P → "TypeScript: Restart TS Server"
2. Check `tsconfig.base.json` has correct paths
3. Ensure your IDE is using workspace TypeScript version

#### Issue: Changes in MFE Not Reflecting in Shell

**Cause:** HMR not propagating through Module Federation  
**Solution:**

1. Hard refresh browser (Cmd+Shift+R)
2. Disable browser cache in DevTools
3. Restart both MFE and shell dev servers

#### Issue: CORS Errors When Calling Backend

**Cause:** Backend not allowing MFE origin  
**Solution:**
Verify that the backend CORS configuration includes your MFE port:

```typescript
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174', // Add this
    ],
  })
);
```

---

## Summary

This Micro-Frontend architecture provides:

- **Independent Development** - Teams can work on MFEs without conflicts
- **Independent Deployment** - Deploy MFEs separately from shell
- **Technology Flexibility** - Can use different versions/libraries per MFE
- **Code Sharing** - Shared libraries for consistency
- **Lazy Loading** - MFEs load on-demand for better performance
- **Type Safety** - Full TypeScript support across all MFEs
- **State Management** - Centralized auth state with Zustand
- **Developer Experience** - Fast HMR, Nx monorepo tooling

**Next Steps:**

1. Implement suggested improvements
2. Add E2E tests
3. Set up CI/CD pipeline
4. Add performance monitoring
5. Document deployment procedures

---

## Appendix: Nx Monorepo

### What is a Monorepo?

A **monorepo** (monolithic repository) is a software development strategy where code for multiple projects is stored in a single repository, as opposed to having separate repositories for each project (polyrepo).

#### Monorepo vs Polyrepo

**Polyrepo (Multiple Repositories):**

```mermaid
graph TB
    subgraph Polyrepo["POLYREPO"]
        subgraph Repo1["auth-frontend Repository"]
            Auth1["auth-frontend<br/>code"]
            AuthNode["node_modules/"]
            AuthPkg["package.json"]
            AuthGit[".git/"]
        end

        subgraph Repo2["chatbot-frontend Repository"]
            Chat1["chatbot-frontend<br/>code"]
            ChatNode["node_modules/"]
            ChatPkg["package.json"]
            ChatGit[".git/"]
        end

        subgraph Repo3["admin-frontend Repository"]
            Admin1["admin-frontend<br/>code"]
            AdminNode["node_modules/"]
            AdminPkg["package.json"]
            AdminGit[".git/"]
        end
    end

    style Polyrepo fill:#ffebee
    style Repo1 fill:#ffcdd2
    style Repo2 fill:#ffcdd2
    style Repo3 fill:#ffcdd2
```

**Problems:**

- Duplicate dependencies (3x node_modules)
- Version inconsistencies (React 18 vs 19)
- Shared code via npm packages (slow iteration)
- Difficult to coordinate changes
- CI/CD complexity (3 separate pipelines)

**Monorepo (Single Repository):**

```mermaid
graph TB
    subgraph Monorepo["MONOREPO"]
        subgraph Apps["apps/"]
            AuthMFE["auth-mfe/"]
            ChatMFE["chatbot-mfe/"]
            AdminMFE["admin-mfe/"]
        end

        subgraph Libs["libs/ (shared across apps)"]
            Types["shared/types/"]
            Stores["frontend/stores/"]
            UI["frontend/ui-components/"]
        end

        RootNode["node_modules/ (single install)"]
        RootPkg["package.json (unified dependencies)"]
        RootGit[".git/ (single repository)"]

        Apps -.-> Libs
    end

    style Monorepo fill:#e8f5e9
    style Apps fill:#c8e6c9
    style Libs fill:#a5d6a7
```

**Benefits:**

- Single dependency installation
- Guaranteed version consistency
- Instant shared code updates (no npm publish)
- Atomic commits across projects
- Unified CI/CD pipeline

### Monorepo Benefits

#### 1. Code Sharing Made Easy

```typescript
// Polyrepo: Must publish to npm registry
// 1. Make change in ui-components repo
// 2. Bump version, commit, push
// 3. Publish to npm: npm publish
// 4. Update package.json in auth-frontend: "@myapp/ui-components": "1.2.4"
// 5. npm install
// 6. Test and deploy
// Total time: 30 minutes

// Monorepo: Import directly
import { Button } from '@myapp/frontend/ui-components';
// 1. Make change in libs/frontend/ui-components
// 2. Already available in all apps immediately
// Total time: 0 minutes
```

#### 2. Atomic Cross-Project Changes

```bash
# Single commit updates API contract + all consumers
git commit -m "Add role field to User schema"

# Changes:
# libs/shared/types/src/schemas/user.schema.ts  (add role field)
# apps/auth-service/src/controllers/auth.controller.ts  (handle role)
# apps/auth-mfe/src/components/RegisterForm.tsx  (add role dropdown)
# apps/admin-mfe/src/components/UserTable.tsx  (display role)

# All changes tested together, deployed together
# No version mismatches, no broken contracts
```

#### 3. Consistent Tooling

```json
// Single configuration for all projects
{
  "eslintConfig": "shared across all apps",
  "prettier": "same formatting rules",
  "typescript": "same compiler options",
  "testing": "unified test runner (Vitest)"
}
```

#### 4. Dependency Management

```bash
# Polyrepo: Install React in each repo
cd auth-frontend && npm install react@19.0.0
cd chatbot-frontend && npm install react@18.2.0  # Oops, version mismatch!

# Monorepo: Install once, use everywhere
npm install react@19.0.0
# All apps use the same version automatically
```

### Monorepo Challenges

| Challenge                | Solution (Nx Provides)                               |
| ------------------------ | ---------------------------------------------------- |
| **Large Repository**     | Intelligent caching, only build affected projects    |
| **Slow CI/CD**           | Distributed task execution, remote caching           |
| **Complex Dependencies** | Dependency graph visualization, boundary enforcement |
| **Tooling Performance**  | Nx daemon, incremental builds                        |
| **Team Coordination**    | Code ownership (CODEOWNERS), module boundaries       |

---

### Why Nx?

Nx is a **smart, fast, and extensible build system** for monorepos. While there are alternatives (Turborepo, Lerna, Rush, Yarn/Pnpm workspaces), Nx provides the most comprehensive feature set for our needs.

#### Nx vs Alternatives

| Feature                   | Nx            | Turborepo  | Lerna   | Yarn Workspaces |
| ------------------------- | ------------- | ---------- | ------- | --------------- |
| **Intelligent Caching**   | ✓             | ✓          | ✗       | ✗               |
| **Affected Detection**    | ✓             | ✓          | Limited | ✗               |
| **Remote Caching**        | ✓             | ✓          | ✗       | ✗               |
| **Dependency Graph**      | ✓ Visual      | CLI only   | ✗       | ✗               |
| **Code Generators**       | ✓ Extensive   | ✗          | ✗       | ✗               |
| **Module Boundaries**     | ✓ Enforced    | ✗          | ✗       | ✗               |
| **Plugins Ecosystem**     | ✓ Large       | Growing    | Small   | N/A             |
| **React/Vite Support**    | ✓ First-class | ✓          | Manual  | Manual          |
| **Distributed Execution** | ✓ (Nx Cloud)  | ✓ (Vercel) | ✗       | ✗               |
| **Learning Curve**        | Medium        | Low        | Low     | Low             |
| **Performance**           | Excellent     | Excellent  | Good    | Basic           |

#### Why We Chose Nx

**1. Affected Command (Build Only What Changed)**

```bash
# Instead of building all 19 projects (slow)
npm run build

# Nx builds only affected projects (fast)
nx affected --target=build

# Example: Change auth-service controller
# Nx detects and builds:
# - auth-service (changed)
# - shell (depends on auth-service types)
# Skips:
# - chatbot-service, admin-service, all MFEs (not affected)

# Time saved: 80% faster CI/CD
```

**2. Computation Caching**

```bash
# First build: 2 minutes
nx build auth-mfe

# No changes? Instant (reads from cache)
nx build auth-mfe
# Nx read the output from the cache instead of running the command for 1 out of 1 tasks.

# Small change? Only rebuilds changed files (Vite + Nx)
# Change Button.tsx → rebuilds in 200ms
```

**3. Dependency Graph Visualization**

```bash
# See entire project structure
npm run graph

# Opens browser with interactive graph:
# ┌─────────┐     ┌──────────────┐
# │  shell  │────>│  auth-mfe    │
# │         │     │              │
# └────┬────┘     └──────┬───────┘
#      │                 │
#      v                 v
# ┌─────────────────────────┐
# │  @myapp/frontend/stores │
# └─────────────────────────┘
```

**4. Code Generators (Scaffolding)**

```bash
# Generate new MFE with all boilerplate
nx g @nx/react:app my-new-mfe --bundler=vite

# Creates:
# - apps/my-new-mfe/
# - Vite config
# - TypeScript config
# - ESLint config
# - Jest/Vitest config
# - Basic component structure
# - All wired up and ready to use

# Manual setup: 2 hours
# Nx generator: 30 seconds
```

**5. Module Boundaries (Prevent Bad Imports)**

```typescript
// ESLint prevents this
// libs/frontend/ui-components/Button.tsx
import { authService } from '@myapp/backend/auth-service'; // ERROR!
// "Projects tagged with 'type:frontend' can only depend on 'type:frontend' or 'type:shared'"

// Only allows this
import { Button } from '@myapp/frontend/ui-components'; // ✓ OK
```

**Configuration:**

```json
// .eslintrc.json
{
  "rules": {
    "@nx/enforce-module-boundaries": [
      "error",
      {
        "depConstraints": [
          {
            "sourceTag": "type:frontend",
            "onlyDependOnLibsWithTags": ["type:frontend", "type:shared"]
          },
          {
            "sourceTag": "type:backend",
            "onlyDependOnLibsWithTags": ["type:backend", "type:shared"]
          }
        ]
      }
    ]
  }
}
```

**6. Parallel Execution**

```bash
# Run all tests in parallel (uses all CPU cores)
nx run-many --target=test --all --parallel=10

# Sequential: 10 projects × 30s = 5 minutes
# Parallel (10 cores): 30 seconds
```

**7. Task Pipeline (Dependency Ordering)**

```json
// nx.json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"] // Build dependencies first
    }
  }
}

// Automatically builds in correct order:
// 1. libs/shared/types (no dependencies)
// 2. libs/frontend/stores (depends on types)
// 3. apps/auth-mfe (depends on stores and types)
// 4. apps/shell (depends on auth-mfe)
```

**8. Integrated Tools**

```bash
# Nx has first-class plugins for:
- React (with Vite, Webpack, Next.js)
- Node.js / Express
- Prisma ORM
- Cypress / Playwright
- Jest / Vitest
- Storybook
- ESLint / Prettier

# One command to add new tool:
nx add @nx/storybook
```

---

### Nx Setup & Configuration

#### Workspace Structure

```
ai-chatbot-fullstack-2026/
├── apps/                          # Deployable applications
│   ├── shell/                     # Shell (host) app
│   │   ├── src/
│   │   ├── vite.config.ts
│   │   └── project.json           # Nx project configuration
│   ├── auth-mfe/                  # Auth micro-frontend
│   ├── chatbot-mfe/               # Chatbot micro-frontend
│   ├── admin-mfe/                 # Admin micro-frontend
│   ├── profile-mfe/               # Profile micro-frontend
│   ├── auth-service/              # Auth backend service
│   ├── chatbot-service/           # Chatbot backend service
│   └── admin-service/             # Admin backend service
│
├── libs/                          # Shared libraries
│   ├── shared/
│   │   ├── types/                 # Zod schemas, TypeScript types
│   │   └── utils/                 # Common utilities
│   ├── backend/
│   │   ├── logger/                # Winston logger
│   │   ├── metrics/               # Prometheus metrics
│   │   ├── security/              # Security utilities
│   │   └── database/              # Database utilities
│   └── frontend/
│       ├── ui-components/         # Shared React components
│       ├── api-client/            # Axios API client
│       ├── stores/                # Zustand stores
│       └── utils/                 # Frontend utilities
│
├── nx.json                        # Nx configuration
├── tsconfig.base.json             # Base TypeScript config
├── package.json                   # Dependencies
├── .eslintrc.json                 # ESLint rules
└── docker-compose.yml             # Local services
```

#### Nx Configuration Files

**1. nx.json (Workspace Configuration)**

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "defaultBase": "main",

  // Named inputs for caching
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json"
    ],
    "sharedGlobals": []
  },

  // Target defaults (caching, dependencies)
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"], // Build dependencies first
      "inputs": ["production", "^production"],
      "cache": true // Cache build outputs
    },
    "test": {
      "inputs": ["default", "^production"],
      "cache": true
    },
    "lint": {
      "inputs": ["default"],
      "cache": true
    },
    "serve": {
      "cache": false // Never cache dev server
    }
  },

  // Code generators defaults
  "generators": {
    "@nx/react": {
      "application": {
        "babel": false,
        "style": "css",
        "linter": "eslint",
        "bundler": "vite"
      },
      "library": {
        "style": "css",
        "linter": "eslint",
        "unitTestRunner": "vitest"
      }
    }
  },

  // Nx plugins
  "plugins": [
    {
      "plugin": "@nx/eslint/plugin",
      "options": {
        "targetName": "lint"
      }
    },
    {
      "plugin": "@nx/vite/plugin",
      "options": {
        "buildTargetName": "build",
        "serveTargetName": "serve",
        "testTargetName": "test"
      }
    }
  ]
}
```

**2. project.json (Per-Project Configuration)**

```json
// apps/shell/project.json
{
  "name": "shell",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/shell/src",
  "projectType": "application",
  "tags": ["type:frontend", "scope:shell"],
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/shell"
      }
    },
    "serve": {
      "executor": "@nx/vite:dev-server",
      "options": {
        "port": 5173,
        "buildTarget": "shell:build"
      }
    },
    "test": {
      "executor": "@nx/vite:test",
      "options": {
        "config": "apps/shell/vitest.config.ts"
      }
    }
  }
}
```

**3. tsconfig.base.json (Path Aliases)**

```json
{
  "compilerOptions": {
    "paths": {
      // Shared libraries
      "@myapp/shared/types": ["libs/shared/types/src/index.ts"],
      "@myapp/shared/utils": ["libs/shared/utils/src/index.ts"],

      // Frontend libraries
      "@myapp/frontend/stores": ["libs/frontend/stores/src/index.ts"],
      "@myapp/frontend/ui-components": [
        "libs/frontend/ui-components/src/index.ts"
      ],
      "@myapp/frontend/api-client": ["libs/frontend/api-client/src/index.ts"],
      "@myapp/frontend/utils": ["libs/frontend/utils/src/index.ts"],

      // Backend libraries
      "@myapp/backend/logger": ["libs/backend/logger/src/index.ts"],
      "@myapp/backend/metrics": ["libs/backend/metrics/src/index.ts"],
      "@myapp/backend/security": ["libs/backend/security/src/index.ts"],
      "@myapp/backend/database": ["libs/backend/database/src/index.ts"]
    }
  }
}
```

#### Project Tags & Boundaries

**Tags in project.json:**

```json
// apps/shell/project.json
{
  "tags": ["type:frontend", "scope:shell"]
}

// apps/auth-service/project.json
{
  "tags": ["type:backend", "scope:auth"]
}

// libs/shared/types/project.json
{
  "tags": ["type:shared"]
}
```

**Enforced Boundaries (.eslintrc.json):**

```json
{
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "type:frontend",
                "onlyDependOnLibsWithTags": ["type:frontend", "type:shared"]
              },
              {
                "sourceTag": "type:backend",
                "onlyDependOnLibsWithTags": ["type:backend", "type:shared"]
              },
              {
                "sourceTag": "scope:auth",
                "onlyDependOnLibsWithTags": ["scope:auth", "scope:shared"]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

**Result:**

```typescript
// ✓ Allowed: Frontend imports shared
import { LoginSchema } from '@myapp/shared/types';

// ✓ Allowed: Frontend imports frontend
import { useAuthStore } from '@myapp/frontend/stores';

// Blocked: Frontend imports backend
import { authService } from '@myapp/backend/auth-service';
// Error: "Projects tagged with 'type:frontend' can only depend on..."
```

#### Common Nx Commands

**Development:**

```bash
# Serve single app
nx serve shell
nx serve auth-service

# Serve multiple apps in parallel
nx run-many --target=serve --projects=shell,auth-mfe,chatbot-mfe --parallel=3

# Serve all frontend apps
nx run-many --target=serve --projects=tag:type:frontend --parallel=5
```

**Building:**

```bash
# Build single app
nx build shell

# Build all apps
nx run-many --target=build --all

# Build only affected apps (changed since last commit)
nx affected --target=build

# Build with specific base branch
nx affected --target=build --base=main
```

**Testing:**

```bash
# Test single app
nx test auth-service

# Test all apps
nx run-many --target=test --all

# Test only affected
nx affected --target=test

# Test in watch mode
nx test auth-service --watch
```

**Linting:**

```bash
# Lint single app
nx lint shell

# Lint all apps
nx run-many --target=lint --all

# Lint and auto-fix
nx run-many --target=lint --all --fix
```

**Visualization:**

```bash
# View full dependency graph
nx graph

# View affected projects graph
nx affected:graph

# View specific project dependencies
nx graph --focus=shell
```

**Cache Management:**

```bash
# Clear Nx cache
nx reset

# View cache statistics
cat node_modules/.cache/nx/d/daemon.log
```

**Code Generation:**

```bash
# Generate new React app
nx g @nx/react:app my-app --bundler=vite

# Generate new React library
nx g @nx/react:lib my-lib --directory=libs/frontend/my-lib

# Generate new component
nx g @nx/react:component MyComponent --project=shell

# Generate new Node.js app
nx g @nx/node:app my-service

# List available generators
nx list @nx/react
```

#### Performance Optimization

**1. Nx Daemon (Background Process)**

```bash
# Nx daemon runs in background for faster commands
# Automatically started on first command

# View daemon status
nx daemon

# Stop daemon
nx daemon --stop

# With daemon: nx build shell → 2s
# Without daemon: nx build shell → 5s
```

**2. Computation Caching**

```bash
# First run: Full build
nx build shell
# Built shell in 15s

# Second run: From cache (no changes)
nx build shell
# Nx read the output from the cache (0s)

# Cache location:
node_modules/.cache/nx
```

**3. Remote Caching (Nx Cloud)**

```bash
# Setup Nx Cloud for team-wide cache sharing
nx connect

# Developer A builds auth-service
nx build auth-service
# Uploads to cloud cache

# Developer B pulls latest
git pull
nx build auth-service
# Downloads from cloud cache (skips build)

# CI/CD also benefits from shared cache
```

**4. Parallel Execution**

```json
// package.json
{
  "scripts": {
    "build": "nx run-many --target=build --all --parallel=10"
  }
}

// Uses up to 10 CPU cores
// Sequential: 19 projects × 20s = 380s (6.3 min)
// Parallel (10 cores): ~60s (1 min)
```

#### CI/CD Integration

**GitHub Actions Example:**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0 # Full git history for affected detection

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Derive appropriate SHAs for base and head
        uses: nrwl/nx-set-shas@v3

      - name: Lint affected projects
        run: npx nx affected --target=lint --parallel=3

      - name: Test affected projects
        run: npx nx affected --target=test --parallel=3 --ci

      - name: Build affected projects
        run: npx nx affected --target=build --parallel=3
```

**Benefits:**

- Only lint/test/build changed projects
- Parallel execution (3 jobs at once)
- Nx Cloud caching speeds up CI
- PR checks complete in 2-3 minutes instead of 10-15 minutes

---

### Nx Best Practices (Implemented)

**1. Consistent Project Structure**

```
All apps follow same pattern:
app-name/
├── src/
│   ├── app/
│   ├── assets/
│   └── main.tsx or main.ts
├── vite.config.ts or tsconfig.json
├── project.json
└── tsconfig.json
```

**2. Use Path Aliases**

```typescript
// Bad: Relative imports
import { Button } from '../../../libs/frontend/ui-components/src/Button';

// Good: Path alias
import { Button } from '@myapp/frontend/ui-components';
```

**3. Tag Everything**

```json
// Every project should have tags
{
  "tags": [
    "type:frontend", // Architecture layer
    "scope:auth" // Business domain
  ]
}
```

**4. Prefer Libraries Over Apps**

```
Apps:  Entry points (shell, auth-mfe, auth-service)
Libs:  Reusable code (stores, ui-components, utils)

Rule: Keep apps thin, libraries rich
```

**5. Use Affected Commands in CI**

```bash
# Don't test everything
nx run-many --target=test --all  # Slow

# Only test what changed
nx affected --target=test  # ✓ Fast
```

**6. Regular Cache Cleanup**

```bash
# Clear cache weekly or after major changes
nx reset
```

---

### Nx Resources

- **Official Docs:** https://nx.dev
- **Nx Console (VS Code):** Install extension for GUI
- **Nx Cloud:** https://nx.app (free for open source)
- **Community:** Discord at https://go.nx.dev/community
- **YouTube:** Nx Conf talks and tutorials

---

**Document Maintained By:** Laldingliana Tlau Vantawl  
**Last Updated:** November 16, 2025  
**Version:** 1.0.0
