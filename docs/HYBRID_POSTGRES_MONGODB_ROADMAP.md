# Hybrid PostgreSQL + MongoDB Implementation Roadmap

## Enterprise-Scale AI Chatbot with Polyglot Persistence

**Version:** 1.0  
**Date:** November 17, 2025  
**Architecture:** Hybrid Database (PostgreSQL + MongoDB) + Nginx  
**Timeline:** 6 Weeks  
**Target Scale:** 10M+ Users, 100M+ Messages/Day  
**Team Composition:** 6-10 developers (3-5 Backend, 3-5 Frontend)

---

## 📑 TABLE OF CONTENTS

### Quick Start

1. [Executive Summary](#-executive-summary)
2. [Implementation Tracker](#-implementation-tracker)
3. [Architecture Overview](#️-hybrid-architecture-overview)

### Implementation Phases

4. [Phase 0: Infrastructure Setup](#phase-0-infrastructure-setup-week-1-day-1-2)
5. [Phase 1: Auth Service (PostgreSQL)](#phase-1-auth-service-postgresql--prisma)
6. [Phase 2: Chatbot Service (MongoDB)](#phase-2-chatbot-service-mongodb--mongoose)
7. [Phase 3: Admin Service (PostgreSQL)](#phase-3-admin-service-postgresql--prisma)
8. [Phase 4: Cross-Service Integration](#phase-4-cross-service-integration)
9. [Phases 5-8: Frontend, Testing & Deployment](#phase-5-8-frontend-testing-deployment)

### Scaling & Operations

10. [Scaling Strategies](#-scaling-strategies)
11. [Cost Analysis](#-cost-analysis-10m-users-100m-messagesday)
12. [Production Checklist](#-production-readiness-checklist)
13. [Deployment Commands](#-deployment-commands)

### Reference

14. [Documentation Links](#-documentation)

---

## 📋 EXECUTIVE SUMMARY

> **Quick Overview:** This roadmap implements a **polyglot persistence strategy** that combines PostgreSQL for transactional data with MongoDB for high-volume messaging, enabling horizontal scaling to 10M+ users and 100M+ messages per day.

### 🎯 Why Hybrid Architecture?

**The Challenge:** AI chatbot applications have dual requirements:

- **High-integrity data**: User credentials, payments, audit logs → Need ACID compliance
- **High-volume writes**: Millions of chat messages daily → Need horizontal scalability

**The Solution:** Use the right database for each use case:

- ✅ **PostgreSQL** → Critical data requiring transactions and consistency
- ✅ **MongoDB** → High-throughput writes with flexible schema
- ✅ **Redis** → Cross-service synchronization and caching
- ✅ **Nginx** → Enterprise-grade load balancing and rate limiting

### 🗂️ Service-to-Database Mapping

| Component           | Technology                   | Rationale                                                      |
| ------------------- | ---------------------------- | -------------------------------------------------------------- |
| **Auth Service**    | PostgreSQL + Prisma          | ACID compliance for user credentials, payment data             |
| **Chatbot Service** | MongoDB + Mongoose           | High write volume (millions of messages/day), flexible schema  |
| **Admin Service**   | PostgreSQL + Prisma          | Complex analytics, audit compliance, SQL reporting             |
| **Load Balancer**   | Nginx                        | Battle-tested performance, advanced rate limiting, SSE support |
| **Cache Layer**     | Redis 7                      | Session storage, pub/sub for cross-service events, hot data    |
| **SSO/OAuth**       | Passport.js + OAuth 2.0      | Social login, enterprise SSO (Google, GitHub, Microsoft)       |
| **MFA**             | Speakeasy (TOTP) + Twilio    | Multi-factor auth, SMS verification, FIDO2/WebAuthn            |
| **Frontend**        | React 18 + Module Federation | Microfrontend architecture, independent deployments            |
| **Build System**    | Nx Monorepo                  | Intelligent caching, affected detection, 19 projects           |

### Performance Targets

| Metric                      | Target | Strategy                                             |
| --------------------------- | ------ | ---------------------------------------------------- |
| **Concurrent Users**        | 100K+  | Nginx load balancing, horizontal scaling             |
| **Messages/Day**            | 100M+  | MongoDB sharding by userId                           |
| **API Response Time (p95)** | <200ms | Nginx caching, database indexing, connection pooling |
| **Authentication Latency**  | <50ms  | Redis session cache, PostgreSQL read replicas        |
| **Message Write Latency**   | <100ms | MongoDB time-series collections, bulk writes         |
| **Uptime SLA**              | 99.9%  | Multi-AZ deployment, automated failover              |

### 📌 Quick Reference Summary

```
Services:     3 backend + 4 frontend MFEs + 1 gateway
Databases:    2 PostgreSQL + 1 MongoDB + 1 Redis
Auth:         JWT + OAuth 2.0 SSO + TOTP/SMS MFA
Timeline:     6 weeks + SSO/MFA (12-30 hours additional)
Team:         6-10 developers
Scale Target: 10M users, 100M messages/day
Cost:         $5,750-5,790/month infrastructure (+ OpenAI variable)
```

---

## 🎯 IMPLEMENTATION TRACKER

> **Progress Guide:** This tracker shows all 8 implementation phases. Each phase builds on the previous one and includes estimated completion time.

| Phase                                   | Status    | Completion | Time     | Key Deliverables                                       |
| --------------------------------------- | --------- | ---------- | -------- | ------------------------------------------------------ |
| **Phase 0: Infrastructure Setup**       | Pending   | 0%         | ~1.5h    | Nx monorepo, Docker, PostgreSQL, MongoDB, Redis, Nginx |
| **Phase 1: Auth Service (PostgreSQL)**  | Pending   | 0%         | ~8h      | User auth, sessions, JWT, Prisma migrations            |
| **Phase 1.5: SSO + MFA (PRIORITY 1)**   | Pending   | 0%         | ~12-16h  | Google OAuth, TOTP MFA, database schema updates        |
| **Phase 1.5: SSO + MFA (PRIORITY 2-3)** | Optional  | 0%         | ~18h     | GitHub OAuth, SMS MFA, WebAuthn, Auth0 integration     |
| **Phase 2: Chatbot Service (MongoDB)**  | Pending   | 0%         | ~12h     | Conversations, messages, MongoDB sharding, streaming   |
| **Phase 3: Admin Service (PostgreSQL)** | Pending   | 0%         | ~6h      | Audit logs, analytics, cross-service aggregation       |
| **Phase 4: Cross-Service Integration**  | Pending   | 0%         | ~4h      | Redis pub/sub, event-driven sync, API federation       |
| **Phase 5: Frontend MFEs**              | Pending   | 0%         | ~12h     | Shell, Auth, Chatbot, Admin, Profile MFEs              |
| **Phase 6: Nginx Configuration**        | Pending   | 0%         | ~4h      | Load balancing, rate limiting, caching, SSL            |
| **Phase 7: Testing & Monitoring**       | Pending   | 0%         | ~6h      | Unit, integration, E2E tests, observability            |
| **Phase 8: Production Deployment**      | Pending   | 0%         | ~4h      | Docker Compose, Kubernetes, CI/CD, scaling             |
| **Total Project (Minimal SSO/MFA)**     | **Ready** | **0%**     | **~69h** | **Enterprise-scale hybrid with Priority 1 security**   |
| **Total Project (Full SSO/MFA)**        | **Ready** | **0%**     | **~87h** | **Enterprise-scale hybrid with complete security**     |

---

## 🏗️ HYBRID ARCHITECTURE OVERVIEW

> **Visual Guide:** The diagram below shows how all components interact. Follow the arrows to understand data flow from user request through Nginx, to backend services, and finally to databases.

### 🔄 Request Flow

1. **User Request** → Nginx Load Balancer (SSL, rate limiting, caching)
2. **Nginx** → Routes to appropriate backend service (Auth/Chatbot/Admin)
3. **Backend Service** → Reads/writes to database (PostgreSQL or MongoDB)
4. **Cross-Service Sync** → Redis pub/sub for event-driven updates
5. **Response** → Cached by Nginx, returned to user

### 📐 Architecture Diagram

```
                            ┌─────────────────────────────────┐
                            │  OAuth 2.0 / OIDC Providers     │
                            │  • Google OAuth                 │
                            │  • GitHub OAuth                 │
                            │  • Microsoft Azure AD (opt)     │
                            │  • Auth0 (enterprise, opt)      │
                            └─────────────────────────────────┘
                                          ▲
                                          │ OAuth 2.0 Flow
                                          │
┌─────────────────────────────────────────────────────────────────────────┐
│                         Nginx Load Balancer                              │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ • SSL Termination        • Rate Limiting (Zone-Based)          │    │
│  │ • Load Balancing         • Proxy Caching (Static + API)        │    │
│  │ • Health Checks          • SSE/WebSocket Support               │    │
│  │ • Module Federation      • GeoIP Routing                       │    │
│  │ • OAuth Callback Routes  • MFA Challenge Rate Limits           │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Auth Service    │      │ Chatbot Service  │      │  Admin Service   │
│  Port: 3000      │      │  Port: 3001      │      │  Port: 3002      │
│                  │      │                  │      │                  │
│  • Passport.js   │      │  MongoDB         │      │  PostgreSQL      │
│  • OAuth 2.0     │      │  + Mongoose      │      │  + Prisma        │
│  • TOTP (MFA)    │      │                  │      │                  │
│  • SMS (opt)     │      │                  │      │                  │
│  • WebAuthn(opt) │      │                  │      │                  │
│  PostgreSQL      │      │                  │      │                  │
│  + Prisma        │      │                  │      │                  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
        │                           │                           │
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  PostgreSQL 15   │      │  MongoDB 7.0     │      │  PostgreSQL 15   │
│  ┌────────────┐  │      │  ┌────────────┐  │      │  ┌────────────┐  │
│  │ users      │  │      │  │conversations│ │      │  │ audit_logs │  │
│  │ sessions   │  │      │  │ messages    │  │      │  │ stats      │  │
│  │ oauth_accts│  │      │  │ embeddings  │  │      │  │ configs    │  │
│  │ mfa_devices│  │      │  │ analytics   │  │      │  └────────────┘  │
│  │ roles      │  │      │  └────────────┘  │      │                  │
│  │ payments   │  │      │                  │      │  Read Replicas   │
│  └────────────┘  │      │  Sharded Cluster │      │  (2 nodes)       │
│                  │      │  (3 shards)      │      │                  │
│  Read Replicas   │      │                  │      │                  │
│  (2 nodes)       │      │                  │      │                  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
        │                           │                           │
        └───────────────────────────┴───────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │      Redis 7.0        │
                        │  ┌─────────────────┐  │
                        │  │ Session Cache   │  │
                        │  │ MFA Challenges  │  │
                        │  │ OAuth State     │  │
                        │  │ Event Queue     │  │
                        │  │ Rate Limit      │  │
                        │  │ Hot Data Cache  │  │
                        │  └─────────────────┘  │
                        │                       │
                        │  Cluster Mode (3x)    │
                        └───────────────────────┘
```

---

# 🛠️ IMPLEMENTATION GUIDE

> **How to Use:** Follow phases 0-8 in order. Each phase includes complete code examples and configuration files. Copy and adapt to your needs.

---

## PHASE 0: INFRASTRUCTURE SETUP (Week 1, Day 1-2)

**⏱️ Duration:** 1.5 hours  
**👥 Team:** Backend team  
**📦 Deliverables:** Nx workspace, Docker services, database connections

### What You'll Build

- ✅ Nx monorepo with 19 projects
- ✅ Docker Compose with PostgreSQL, MongoDB, Redis, Nginx
- ✅ Database initialization scripts
- ✅ Environment configuration templates

### Step 1: Nx Monorepo Initialization

```bash
# Create Nx workspace
npx create-nx-workspace@latest ai-chatbot-hybrid --preset=empty

cd ai-chatbot-hybrid

# Install plugins
npm install -D @nx/node @nx/js @nx/react @nx/vite
npm install -D @nx/jest vitest @nx/cypress
npm install -D typescript @types/node
npm install -D eslint prettier
```

### Step 2: Docker Infrastructure

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  # ============================================
  # PostgreSQL (Auth + Admin Services)
  # ============================================
  postgres:
    image: postgres:15-alpine
    container_name: postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_MULTIPLE_DATABASES: auth_db,admin_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/create-multiple-postgresql-databases.sh:/docker-entrypoint-initdb.d/create-databases.sh
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U admin']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # PostgreSQL Read Replica (for scaling)
  postgres-replica:
    image: postgres:15-alpine
    container_name: postgres-replica
    restart: unless-stopped
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGUSER: replicator
      PGPASSWORD: ${REPLICATOR_PASSWORD}
    command: |
      bash -c "
      until pg_basebackup -h postgres -D /var/lib/postgresql/data -U replicator -v -P -W; do
        echo 'Waiting for primary to be ready...'
        sleep 1s
      done
      echo 'Backup done, starting replica...'
      postgres
      "
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network

  # ============================================
  # MongoDB (Chatbot Service)
  # ============================================
  mongodb:
    image: mongo:7.0
    container_name: mongodb
    restart: unless-stopped
    command: ['--replSet', 'rs0', '--bind_ip_all']
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: chatbot_db
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # MongoDB Replica Set Initialization
  mongo-setup:
    image: mongo:7.0
    container_name: mongo-setup
    depends_on:
      mongodb:
        condition: service_healthy
    restart: 'no'
    entrypoint:
      [
        'bash',
        '-c',
        'sleep 5 && mongosh --host mongodb:27017 -u admin -p ${MONGO_ROOT_PASSWORD} --authenticationDatabase admin --eval "rs.initiate({_id: \"rs0\", members: [{_id: 0, host: \"mongodb:27017\"}]})"',
      ]
    networks:
      - app-network

  # ============================================
  # Redis (Caching, Sessions, Pub/Sub)
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    healthcheck:
      test: ['CMD', 'redis-cli', '--raw', 'incr', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # ============================================
  # Nginx (Load Balancer, Reverse Proxy)
  # ============================================
  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/cache:/var/cache/nginx
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - auth-service
      - chatbot-service
      - admin-service
      - shell
    healthcheck:
      test: ['CMD', 'nginx', '-t']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  # ============================================
  # Backend Services
  # ============================================
  auth-service:
    build:
      context: .
      dockerfile: apps/auth-service/Dockerfile
    container_name: auth-service
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://admin:${POSTGRES_PASSWORD}@postgres:5432/auth_db
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 15m
      REFRESH_TOKEN_EXPIRES_IN: 7d
    ports:
      - '3000:3000'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  chatbot-service:
    build:
      context: .
      dockerfile: apps/chatbot-service/Dockerfile
    container_name: chatbot-service
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      MONGODB_URI: mongodb://admin:${MONGO_ROOT_PASSWORD}@mongodb:27017/chatbot_db?authSource=admin&replicaSet=rs0
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      AUTH_SERVICE_URL: http://auth-service:3000
    ports:
      - '3001:3001'
    depends_on:
      mongodb:
        condition: service_healthy
      mongo-setup:
        condition: service_completed_successfully
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3001/health']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  admin-service:
    build:
      context: .
      dockerfile: apps/admin-service/Dockerfile
    container_name: admin-service
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3002
      DATABASE_URL: postgresql://admin:${POSTGRES_PASSWORD}@postgres:5432/admin_db
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      AUTH_SERVICE_URL: http://auth-service:3000
      CHATBOT_SERVICE_URL: http://chatbot-service:3001
    ports:
      - '3002:3002'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3002/health']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  # ============================================
  # Frontend Applications
  # ============================================
  shell:
    build:
      context: .
      dockerfile: apps/shell/Dockerfile
    container_name: shell
    restart: unless-stopped
    environment:
      NODE_ENV: production
      VITE_AUTH_MFE_URL: http://localhost:5174
      VITE_CHATBOT_MFE_URL: http://localhost:5175
      VITE_ADMIN_MFE_URL: http://localhost:5176
      VITE_PROFILE_MFE_URL: http://localhost:5177
      VITE_API_BASE_URL: http://localhost/api
    ports:
      - '5173:5173'
    networks:
      - app-network

  auth-mfe:
    build:
      context: .
      dockerfile: apps/auth-mfe/Dockerfile
    container_name: auth-mfe
    restart: unless-stopped
    ports:
      - '5174:5174'
    networks:
      - app-network

  chatbot-mfe:
    build:
      context: .
      dockerfile: apps/chatbot-mfe/Dockerfile
    container_name: chatbot-mfe
    restart: unless-stopped
    ports:
      - '5175:5175'
    networks:
      - app-network

  admin-mfe:
    build:
      context: .
      dockerfile: apps/admin-mfe/Dockerfile
    container_name: admin-mfe
    restart: unless-stopped
    ports:
      - '5176:5176'
    networks:
      - app-network

  profile-mfe:
    build:
      context: .
      dockerfile: apps/profile-mfe/Dockerfile
    container_name: profile-mfe
    restart: unless-stopped
    ports:
      - '5177:5177'
    networks:
      - app-network

volumes:
  postgres_data:
  mongodb_data:
  mongodb_config:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### Step 3: Nginx Configuration

**File:** `nginx/nginx.conf`

```nginx
user nginx;
worker_processes auto;
worker_rlimit_nofile 65535;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance tuning
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting zones
    limit_req_zone $http_authorization zone=user_limit:10m rate=10r/m;  # Per-user (JWT)
    limit_req_zone $binary_remote_addr zone=ip_limit:10m rate=100r/s;  # Per-IP
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;  # Auth endpoints
    limit_req_status 429;

    # Connection limiting
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
    limit_conn conn_limit 20;

    # Proxy cache configuration
    proxy_cache_path /var/cache/nginx/api
                     levels=1:2
                     keys_zone=api_cache:100m
                     max_size=1g
                     inactive=60m
                     use_temp_path=off;

    proxy_cache_path /var/cache/nginx/static
                     levels=1:2
                     keys_zone=static_cache:100m
                     max_size=10g
                     inactive=7d
                     use_temp_path=off;

    # Upstream definitions
    upstream auth-service {
        least_conn;
        server auth-service:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream chatbot-service {
        least_conn;
        server chatbot-service:3001 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream admin-service {
        least_conn;
        server admin-service:3002 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream shell {
        server shell:5173 max_fails=3 fail_timeout=30s;
        keepalive 16;
    }

    upstream auth-mfe {
        server auth-mfe:5174;
    }

    upstream chatbot-mfe {
        server chatbot-mfe:5175;
    }

    upstream admin-mfe {
        server admin-mfe:5176;
    }

    upstream profile-mfe {
        server profile-mfe:5177;
    }

    # Include virtual host configs
    include /etc/nginx/conf.d/*.conf;
}
```

**File:** `nginx/conf.d/default.conf`

```nginx
server {
    listen 80;
    server_name localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # ============================================
    # Backend API Routes
    # ============================================

    # Auth Service
    location /api/auth/ {
        # Strict rate limiting for auth endpoints
        limit_req zone=auth_limit burst=3 nodelay;
        limit_req zone=ip_limit burst=10;

        proxy_pass http://auth-service/api/auth/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Chatbot Service (with SSE support)
    location /api/chatbot/ {
        # User-level rate limiting (prevent OpenAI abuse)
        limit_req zone=user_limit burst=5 nodelay;
        limit_req zone=ip_limit burst=20;

        proxy_pass http://chatbot-service/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE-specific settings
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;  # 24 hours for long-running streams
        chunked_transfer_encoding off;
        tcp_nodelay on;
    }

    # Admin Service
    location /api/admin/ {
        # Admin endpoints - stricter limits
        limit_req zone=ip_limit burst=10;

        proxy_pass http://admin-service/api/admin/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache admin stats (5 minutes)
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_key "$scheme$request_method$host$request_uri$http_authorization";
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;
    }

    # ============================================
    # Frontend MFE Routes
    # ============================================

    # Shell (Host Application)
    location / {
        proxy_pass http://shell/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # CORS for Module Federation
        add_header Access-Control-Allow-Origin * always;
    }

    # Auth MFE
    location /auth/ {
        proxy_pass http://auth-mfe/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Access-Control-Allow-Origin * always;
    }

    # Chatbot MFE
    location /chat/ {
        proxy_pass http://chatbot-mfe/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Access-Control-Allow-Origin * always;
    }

    # Admin MFE
    location /admin/ {
        proxy_pass http://admin-mfe/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Access-Control-Allow-Origin * always;
    }

    # Profile MFE
    location /profile/ {
        proxy_pass http://profile-mfe/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Access-Control-Allow-Origin * always;
    }

    # ============================================
    # Static Assets (Aggressive Caching)
    # ============================================

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        proxy_pass http://shell;
        proxy_cache static_cache;
        proxy_cache_valid 200 30d;
        proxy_cache_valid 404 1m;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status $upstream_cache_status;
        expires 30d;
    }

    # ============================================
    # Health Check & Monitoring
    # ============================================

    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 172.16.0.0/12;  # Docker networks
        deny all;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

---

## PHASE 1: AUTH SERVICE (PostgreSQL + Prisma)

**⏱️ Duration:** 8 hours  
**👥 Team:** Backend team  
**📦 Deliverables:** User authentication, JWT tokens, session management, Prisma migrations

### 🎯 Phase Goals

1. **User Management** - Registration, login, profile, password reset
2. **Authentication** - JWT access tokens + refresh tokens
3. **Session Tracking** - Redis cache + PostgreSQL persistence
4. **Security** - Rate limiting, 2FA support, audit logging
5. **Financial Data** - Stripe integration for subscriptions

### 📊 Why PostgreSQL for Auth Service?

- ✅ **ACID Compliance** - Financial transactions require consistency
- ✅ **Referential Integrity** - Foreign keys between users/sessions/payments
- ✅ **Complex Queries** - SQL joins for reporting
- ✅ **Battle-tested** - Decades of production use for authentication systems

### Database Schema

**File:** `apps/auth-service/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/@prisma/auth-client"
}

model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  password              String
  role                  Role      @default(USER)

  // Profile
  firstName             String?
  lastName              String?
  avatar                String?
  bio                   String?   @db.Text

  // Settings
  theme                 Theme     @default(LIGHT)
  notifications         Boolean   @default(true)
  language              String    @default("en")
  timezone              String    @default("UTC")

  // Verification & Security
  isEmailVerified       Boolean   @default(false)
  emailVerificationToken String?  @unique
  passwordResetToken    String?   @unique
  passwordResetExpires  DateTime?
  twoFactorSecret       String?
  twoFactorEnabled      Boolean   @default(false)

  // Subscription (Financial data)
  subscriptionTier      Tier      @default(FREE)
  subscriptionExpiry    DateTime?
  stripeCustomerId      String?   @unique
  stripePriceId         String?

  // Metadata
  lastLoginAt           DateTime?
  lastLoginIp           String?
  loginAttempts         Int       @default(0)
  lockedUntil           DateTime?

  // Relations
  sessions              Session[]
  authLogs              AuthLog[]

  // Cross-service reference (MongoDB uses this ID)
  mongoUserId           String?   // Same as id

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([email])
  @@index([subscriptionTier])
  @@index([role])
  @@index([createdAt])
  @@map("users")
}

model Session {
  id                String    @id @default(cuid())
  userId            String
  refreshToken      String    @unique

  // Device tracking
  deviceInfo        Json?
  ipAddress         String?
  userAgent         String?
  deviceId          String?

  // Expiry
  expiresAt         DateTime
  lastAccessedAt    DateTime  @default(now())

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt         DateTime  @default(now())

  @@index([userId])
  @@index([expiresAt])
  @@index([refreshToken])
  @@index([deviceId])
  @@map("sessions")
}

model AuthLog {
  id                String     @id @default(cuid())
  userId            String?
  action            AuthAction
  status            Status

  // Login attempt tracking
  email             String?
  ipAddress         String?
  userAgent         String?
  location          String?    // GeoIP
  errorMessage      String?

  user              User?      @relation(fields: [userId], references: [id], onDelete: SetNull)
  createdAt         DateTime   @default(now())

  @@index([userId, createdAt])
  @@index([action, status])
  @@index([email, status])
  @@index([createdAt])
  @@map("auth_logs")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

enum Theme {
  LIGHT
  DARK
  AUTO
}

enum Tier {
  FREE
  PRO
  ENTERPRISE
}

enum AuthAction {
  LOGIN
  LOGOUT
  REGISTER
  PASSWORD_RESET
  TOKEN_REFRESH
  EMAIL_VERIFY
  TWO_FACTOR_ENABLE
  TWO_FACTOR_DISABLE
}

enum Status {
  SUCCESS
  FAILURE
}
```

### Service Implementation

**File:** `apps/auth-service/src/main.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/auth-client';
import Redis from 'ioredis';
import { logger } from '@myapp/backend/logger';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error-handler';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Initialize Redis
export const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check PostgreSQL
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis
    await redis.ping();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      database: 'healthy',
      cache: 'healthy',
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

// Start server
async function start() {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected');

    app.listen(PORT, () => {
      logger.info(`✅ Auth Service listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start Auth Service', error);
    process.exit(1);
  }
}

start();
```

---

## PHASE 1.5: SSO + MFA IMPLEMENTATION (Enterprise Security)

> **🔐 Security Enhancement:** This phase adds Single Sign-On (SSO) via OAuth 2.0 and Multi-Factor Authentication (MFA) to dramatically improve user experience and security posture. Choose between **Priority 1** (minimal, free) or full enterprise setup with all providers.

### 📋 Implementation Options

**🎯 PRIORITY 1 - Minimal Setup (RECOMMENDED START)**

- ⏱️ **Time:** 12-16 hours
- 💰 **Cost:** $0/month (self-hosted)
- ✅ **Includes:** Google OAuth + TOTP MFA
- 👥 **Coverage:** 90%+ of users
- 🎯 **Best For:** Startups, MVPs, cost-conscious teams

**🚀 PRIORITY 2-3 - Full Enterprise Setup**

- ⏱️ **Time:** 30+ hours total
- 💰 **Cost:** $40-60/month
- ✅ **Includes:** All OAuth providers + SMS MFA + WebAuthn + Auth0
- 👥 **Coverage:** 100% of users including enterprise
- 🎯 **Best For:** Enterprise customers, compliance requirements

---

### 🎯 PRIORITY 1: Minimal SSO + MFA (12-16 hours)

**⏱️ Duration:** 12-16 hours  
**👥 Team:** Backend team (1-2 developers)  
**💰 Cost:** $0/month  
**📦 Deliverables:** Google OAuth, TOTP MFA, updated database schema

### What You'll Build

- ✅ Google OAuth 2.0 integration (one-click login)
- ✅ TOTP-based MFA with QR codes (Google Authenticator compatible)
- ✅ Database schema for OAuth accounts and MFA devices
- ✅ Frontend components for OAuth buttons and MFA setup
- ✅ Redis-based MFA challenge storage
- ✅ Nginx OAuth callback routes

### Step 1: Install Dependencies

```bash
# Backend - Auth Service
cd apps/auth-service
npm install passport passport-google-oauth20 passport-local
npm install speakeasy qrcode
npm install @types/passport @types/passport-google-oauth20 --save-dev

# Frontend - Auth MFE
cd apps/auth-mfe
npm install react-otp-input qrcode.react
```

### Step 2: Update Database Schema

**File:** `apps/auth-service/prisma/schema.prisma`

Add these models after the existing `User` model:

```prisma
model OAuthAccount {
  id                String    @id @default(cuid())
  userId            String
  provider          OAuthProvider
  providerAccountId String

  // Profile data from OAuth provider
  email             String?
  displayName       String?
  avatar            String?

  // OAuth tokens
  accessToken       String?   @db.Text
  refreshToken      String?   @db.Text
  expiresAt         DateTime?

  // Metadata
  scopes            String[]
  rawProfile        Json?

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@index([provider, email])
  @@map("oauth_accounts")
}

model MFADevice {
  id                String    @id @default(cuid())
  userId            String
  type              MFAType

  // TOTP specific
  totpSecret        String?
  backupCodes       String[]  // Encrypted JSON array

  // SMS specific
  phoneNumber       String?
  phoneVerified     Boolean   @default(false)

  // WebAuthn specific (Priority 3)
  credentialId      String?
  publicKey         String?   @db.Text
  counter           Int       @default(0)

  // Metadata
  name              String    // "iPhone 13", "Google Authenticator", etc.
  isActive          Boolean   @default(true)
  lastUsedAt        DateTime?

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt         DateTime  @default(now())

  @@index([userId])
  @@index([userId, isActive])
  @@map("mfa_devices")
}

enum OAuthProvider {
  GOOGLE
  GITHUB      // Priority 2
  MICROSOFT   // Priority 2
  APPLE       // Priority 3
  LINKEDIN    // Priority 3
}

enum MFAType {
  TOTP        // Time-based OTP (Google Authenticator) - Priority 1
  SMS         // SMS verification - Priority 2
  WEBAUTHN    // FIDO2/Hardware keys - Priority 3
}
```

Update the `User` model to add relations:

```prisma
model User {
  id                    String          @id @default(cuid())
  email                 String          @unique
  password              String?         // Nullable for OAuth-only users

  // ... existing fields ...

  // New relations
  oauthAccounts         OAuthAccount[]
  mfaDevices            MFADevice[]

  // ... rest of existing fields ...
}
```

Run migration:

```bash
npx prisma migrate dev --name add-sso-mfa-tables
```

### Step 3: Configure Passport.js for OAuth

**File:** `apps/auth-service/src/config/passport.ts`

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import { prisma } from '../main';
import bcrypt from 'bcrypt';

// Local Strategy (existing password-based login)
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.API_BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email from Google'), undefined);
        }

        // Check if OAuth account exists
        let oauthAccount = await prisma.oAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: 'GOOGLE',
              providerAccountId: profile.id,
            },
          },
          include: { user: true },
        });

        if (oauthAccount) {
          // Update OAuth account with new tokens
          await prisma.oAuthAccount.update({
            where: { id: oauthAccount.id },
            data: {
              accessToken,
              refreshToken,
              expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
            },
          });
          return done(null, oauthAccount.user);
        }

        // Check if user exists with this email
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              avatar: profile.photos?.[0]?.value,
              isEmailVerified: true, // Trust Google verification
              password: null, // OAuth-only user
            },
          });
        }

        // Create OAuth account
        await prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: 'GOOGLE',
            providerAccountId: profile.id,
            email,
            displayName: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            accessToken,
            refreshToken,
            expiresAt: new Date(Date.now() + 3600 * 1000),
            scopes: ['email', 'profile'],
            rawProfile: profile._json,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
```

### Step 4: OAuth Routes

**File:** `apps/auth-service/src/routes/oauth.routes.ts`

```typescript
import express from 'express';
import passport from '../config/passport';
import { generateTokens } from '../utils/jwt';
import { redis } from '../main';

const router = express.Router();

// Google OAuth - Initiate
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    session: false,
  })
);

// Google OAuth - Callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login?error=oauth_failed',
  }),
  async (req, res) => {
    try {
      const user = req.user as any;

      // Check if MFA is enabled
      const mfaDevice = await prisma.mfaDevice.findFirst({
        where: { userId: user.id, isActive: true },
      });

      if (mfaDevice) {
        // Store pending auth in Redis (10 min expiry)
        const pendingAuthToken = crypto.randomUUID();
        await redis.setex(
          `mfa:pending:${pendingAuthToken}`,
          600,
          JSON.stringify({ userId: user.id, type: mfaDevice.type })
        );

        // Redirect to MFA challenge
        return res.redirect(
          `/auth/mfa-challenge?token=${pendingAuthToken}&type=${mfaDevice.type}`
        );
      }

      // No MFA required - issue tokens
      const { accessToken, refreshToken } = await generateTokens(user);

      // Redirect to frontend with tokens (or use secure cookie)
      res.redirect(
        `/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`
      );
    } catch (error) {
      res.redirect('/login?error=oauth_callback_failed');
    }
  }
);

export default router;
```

### Step 5: TOTP MFA Implementation

**File:** `apps/auth-service/src/services/mfa.service.ts`

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from '../main';
import { redis } from '../main';
import crypto from 'crypto';

export class MFAService {
  // Generate TOTP secret and QR code
  static async setupTOTP(userId: string, deviceName: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `AI Chatbot (${user.email})`,
      issuer: 'AI Chatbot',
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes (10 codes)
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Store in database (secret is temporary until verified)
    const mfaDevice = await prisma.mFADevice.create({
      data: {
        userId,
        type: 'TOTP',
        totpSecret: secret.base32,
        backupCodes: backupCodes, // Encrypt in production!
        name: deviceName,
        isActive: false, // Not active until verified
      },
    });

    return {
      deviceId: mfaDevice.id,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
    };
  }

  // Verify TOTP token and activate device
  static async verifyAndActivateTOTP(
    userId: string,
    deviceId: string,
    token: string
  ) {
    const device = await prisma.mFADevice.findFirst({
      where: { id: deviceId, userId, type: 'TOTP' },
    });

    if (!device || !device.totpSecret) {
      throw new Error('MFA device not found');
    }

    const verified = speakeasy.totp.verify({
      secret: device.totpSecret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (±60 seconds)
    });

    if (!verified) {
      throw new Error('Invalid MFA code');
    }

    // Activate the device
    await prisma.mFADevice.update({
      where: { id: deviceId },
      data: { isActive: true, lastUsedAt: new Date() },
    });

    return { success: true };
  }

  // Verify TOTP during login
  static async verifyTOTP(userId: string, token: string) {
    const device = await prisma.mFADevice.findFirst({
      where: { userId, type: 'TOTP', isActive: true },
    });

    if (!device || !device.totpSecret) {
      throw new Error('MFA not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: device.totpSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      // Check backup codes
      if (device.backupCodes.includes(token.toUpperCase())) {
        // Remove used backup code
        await prisma.mFADevice.update({
          where: { id: device.id },
          data: {
            backupCodes: device.backupCodes.filter(
              (code) => code !== token.toUpperCase()
            ),
          },
        });
        return { success: true, usedBackupCode: true };
      }

      throw new Error('Invalid MFA code');
    }

    // Update last used
    await prisma.mFADevice.update({
      where: { id: device.id },
      data: { lastUsedAt: new Date() },
    });

    return { success: true };
  }

  // Disable MFA for user
  static async disableMFA(userId: string, deviceId: string) {
    await prisma.mFADevice.delete({
      where: { id: deviceId, userId },
    });
    return { success: true };
  }
}
```

### Step 6: MFA Challenge Routes

**File:** `apps/auth-service/src/routes/mfa.routes.ts`

```typescript
import express from 'express';
import { MFAService } from '../services/mfa.service';
import { authenticate } from '../middleware/authenticate';
import { generateTokens } from '../utils/jwt';
import { redis } from '../main';

const router = express.Router();

// Setup TOTP MFA (requires authentication)
router.post('/totp/setup', authenticate, async (req, res) => {
  try {
    const { deviceName } = req.body;
    const userId = req.user.id;

    const result = await MFAService.setupTOTP(
      userId,
      deviceName || 'Authenticator App'
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify and activate TOTP device
router.post('/totp/verify', authenticate, async (req, res) => {
  try {
    const { deviceId, token } = req.body;
    const userId = req.user.id;

    await MFAService.verifyAndActivateTOTP(userId, deviceId, token);

    res.json({ success: true, message: 'MFA activated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// MFA Challenge (after successful password/OAuth login)
router.post('/challenge', async (req, res) => {
  try {
    const { pendingAuthToken, mfaCode } = req.body;

    // Get pending auth from Redis
    const pendingData = await redis.get(`mfa:pending:${pendingAuthToken}`);
    if (!pendingData) {
      return res
        .status(401)
        .json({ error: 'Invalid or expired MFA challenge' });
    }

    const { userId } = JSON.parse(pendingData);

    // Verify MFA code
    await MFAService.verifyTOTP(userId, mfaCode);

    // Delete pending auth
    await redis.del(`mfa:pending:${pendingAuthToken}`);

    // Issue JWT tokens
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const { accessToken, refreshToken } = await generateTokens(user);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Disable MFA
router.delete('/disable/:deviceId', authenticate, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user.id;

    await MFAService.disableMFA(userId, deviceId);

    res.json({ success: true, message: 'MFA disabled successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
```

### Step 7: Update Environment Variables

**File:** `.env` (add these variables)

```bash
# Google OAuth (Priority 1)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Base URL (for OAuth callbacks)
API_BASE_URL=http://localhost:80

# Redis URL (already exists)
REDIS_URL=redis://:your-redis-password@localhost:6379
```

**Obtaining Google OAuth Credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen
6. Add authorized redirect URI: `http://localhost/api/auth/google/callback`
7. Copy Client ID and Client Secret

### Step 8: Frontend Components

**File:** `apps/auth-mfe/src/components/OAuthButtons.tsx`

```typescript
import React from 'react';

export const OAuthButtons: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="oauth-buttons">
      <button
        onClick={handleGoogleLogin}
        className="oauth-button google-button"
      >
        <img src="/google-icon.svg" alt="Google" />
        Continue with Google
      </button>

      <div className="oauth-divider">
        <span>or</span>
      </div>
    </div>
  );
};
```

**File:** `apps/auth-mfe/src/components/MFASetup.tsx`

```typescript
import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import OtpInput from 'react-otp-input';
import { api } from '@myapp/frontend/api-client';

export const MFASetup: React.FC = () => {
  const [step, setStep] = useState<'initial' | 'qr' | 'verify' | 'backup'>('initial');
  const [qrCode, setQrCode] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSetupMFA = async () => {
    const response = await api.post('/api/auth/mfa/totp/setup', {
      deviceName: 'Google Authenticator',
    });

    setQrCode(response.data.qrCode);
    setDeviceId(response.data.deviceId);
    setBackupCodes(response.data.backupCodes);
    setStep('qr');
  };

  const handleVerify = async () => {
    await api.post('/api/auth/mfa/totp/verify', {
      deviceId,
      token: verificationCode,
    });

    setStep('backup');
  };

  return (
    <div className="mfa-setup">
      {step === 'initial' && (
        <div>
          <h2>Enable Two-Factor Authentication</h2>
          <p>Add an extra layer of security to your account.</p>
          <button onClick={handleSetupMFA}>Set Up MFA</button>
        </div>
      )}

      {step === 'qr' && (
        <div>
          <h2>Scan QR Code</h2>
          <p>Use Google Authenticator, Authy, or 1Password to scan this code:</p>
          <QRCode value={qrCode} size={256} />

          <div className="verify-section">
            <h3>Enter Verification Code</h3>
            <OtpInput
              value={verificationCode}
              onChange={setVerificationCode}
              numInputs={6}
              renderInput={(props) => <input {...props} />}
            />
            <button onClick={handleVerify} disabled={verificationCode.length !== 6}>
              Verify and Activate
            </button>
          </div>
        </div>
      )}

      {step === 'backup' && (
        <div>
          <h2>Save Backup Codes</h2>
          <p>Store these codes in a safe place. You can use them if you lose access to your authenticator app.</p>
          <div className="backup-codes">
            {backupCodes.map((code, i) => (
              <div key={i} className="backup-code">{code}</div>
            ))}
          </div>
          <button onClick={() => window.location.href = '/profile'}>
            Done
          </button>
        </div>
      )}
    </div>
  );
};
```

### Step 9: Update Nginx Configuration

**File:** `nginx/conf.d/default.conf` (add OAuth callback routes)

```nginx
# OAuth callback routes (no rate limiting on callbacks)
location ~ ^/api/auth/(google|github)/callback$ {
    proxy_pass http://auth-service;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # OAuth callbacks need longer timeout
    proxy_read_timeout 60s;
}

# MFA routes (stricter rate limiting)
location /api/auth/mfa/ {
    limit_req zone=auth_limit burst=3 nodelay;

    proxy_pass http://auth-service/api/auth/mfa/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Testing Priority 1 Implementation

```bash
# Test Google OAuth
curl http://localhost/api/auth/google

# Test MFA setup (requires authentication)
curl -X POST http://localhost/api/auth/mfa/totp/setup \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceName": "Test Device"}'

# Test MFA verification
curl -X POST http://localhost/api/auth/mfa/totp/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "device-id", "token": "123456"}'
```

---

### 🚀 PRIORITY 2-3: Additional OAuth Providers + SMS/WebAuthn (18 hours)

**Only implement after Priority 1 is complete and tested.**

<details>
<summary><strong>Click to expand Priority 2-3 implementation details</strong></summary>

### Priority 2: GitHub OAuth + SMS MFA (10 hours)

**Additional Dependencies:**

```bash
npm install passport-github2 twilio @types/passport-github2
```

**GitHub OAuth Strategy:**

```typescript
// Add to apps/auth-service/src/config/passport.ts
import { Strategy as GitHubStrategy } from 'passport-github2';

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${process.env.API_BASE_URL}/api/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Similar implementation to Google OAuth
      // ... (implementation details)
    }
  )
);
```

**SMS MFA with Twilio:**

```typescript
// apps/auth-service/src/services/sms-mfa.service.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export class SMSMFAService {
  static async sendVerificationCode(phoneNumber: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis (5 min expiry)
    await redis.setex(`sms:${phoneNumber}`, 300, code);

    // Send SMS
    await client.messages.create({
      body: `Your verification code is: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return { success: true };
  }

  static async verifySMSCode(phoneNumber: string, code: string) {
    const storedCode = await redis.get(`sms:${phoneNumber}`);
    if (storedCode !== code) {
      throw new Error('Invalid verification code');
    }

    await redis.del(`sms:${phoneNumber}`);
    return { success: true };
  }
}
```

**Environment Variables:**

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Twilio SMS
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Monthly Costs:**

- Twilio: $15 base + $0.0075 per SMS
- Estimated: $15-30/month for 100-2000 SMS

### Priority 3: WebAuthn + Auth0 (8 hours)

**WebAuthn (FIDO2/Hardware Keys):**

```bash
npm install @simplewebauthn/server @simplewebauthn/browser
```

**Auth0 Enterprise SSO:**

```bash
npm install auth0 express-openid-connect
```

**Benefits:**

- Biometric authentication (Face ID, Touch ID)
- Hardware security keys (YubiKey, Titan Key)
- Enterprise-grade SSO with SAML 2.0
- Advanced features: MFA recovery flows, device management
- 99.99% uptime SLA

**Monthly Costs:**

- Auth0: $23/month (Essentials) or $240/month (Professional)
- WebAuthn: Free (browser-based)

</details>

---

### 📊 SSO + MFA Cost Summary

| Tier                   | Time   | Monthly Cost | Includes                              |
| ---------------------- | ------ | ------------ | ------------------------------------- |
| **Priority 1**         | 12-16h | $0           | Google OAuth + TOTP MFA (self-hosted) |
| **Priority 2**         | +10h   | +$15-30      | GitHub OAuth + SMS MFA (Twilio)       |
| **Priority 3**         | +8h    | +$25-240     | WebAuthn + Auth0 enterprise           |
| **Full Stack (Total)** | 30h+   | $40-270      | All providers + all MFA types + Auth0 |

**Recommended Approach:**

1. ✅ Implement Priority 1 first (covers 90% of users, $0 cost)
2. Monitor user feedback and adoption rates
3. Add Priority 2 if users request GitHub or SMS options
4. Add Priority 3 for enterprise customers or compliance requirements

---

## PHASE 2: CHATBOT SERVICE (MongoDB + Mongoose)

**⏱️ Duration:** 12 hours  
**👥 Team:** Backend team  
**📦 Deliverables:** Conversation management, message storage, OpenAI integration, SSE streaming

### 🎯 Phase Goals

1. **Conversation CRUD** - Create, list, update, delete conversations
2. **Message Storage** - Store millions of messages with efficient queries
3. **Real-time Streaming** - Server-Sent Events for OpenAI responses
4. **Analytics** - Token tracking, cost estimation, usage stats
5. **Horizontal Scaling** - Sharding by userId for 100M+ messages/day

### 📊 Why MongoDB for Chatbot Service?

- ✅ **High Write Throughput** - Handles millions of messages/day
- ✅ **Flexible Schema** - Chat metadata evolves over time
- ✅ **Horizontal Sharding** - Scale by userId to multiple shards
- ✅ **Document Model** - Natural fit for nested conversation/message structure
- ✅ **Time-Series** - Efficient for chronological message storage

### Database Models

**File:** `apps/chatbot-service/src/models/conversation.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;

  userSnapshot: {
    email: string;
    firstName?: string;
    lastName?: string;
    subscriptionTier: string;
  };

  title: string;

  metadata: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
    customInstructions?: string;
    tags: string[];
    pinned: boolean;
    archived: boolean;
  };

  stats: {
    messageCount: number;
    userMessageCount: number;
    assistantMessageCount: number;
    totalTokens: number;
    estimatedCost: number;
    lastMessageAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userSnapshot: {
      email: { type: String, required: true },
      firstName: String,
      lastName: String,
      subscriptionTier: { type: String, default: 'free' },
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    metadata: {
      model: { type: String, default: 'gpt-4' },
      temperature: { type: Number, default: 0.7, min: 0, max: 2 },
      maxTokens: { type: Number, default: 2000 },
      systemPrompt: String,
      customInstructions: String,
      tags: { type: [String], default: [] },
      pinned: { type: Boolean, default: false },
      archived: { type: Boolean, default: false },
    },
    stats: {
      messageCount: { type: Number, default: 0 },
      userMessageCount: { type: Number, default: 0 },
      assistantMessageCount: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      estimatedCost: { type: Number, default: 0 },
      lastMessageAt: Date,
    },
  },
  {
    timestamps: true,
    collection: 'conversations',
  }
);

// Indexes
ConversationSchema.index({ userId: 1, updatedAt: -1 });
ConversationSchema.index({ userId: 1, 'metadata.archived': 1 });
ConversationSchema.index({ userId: 1, 'metadata.pinned': 1 });
ConversationSchema.index({ 'metadata.tags': 1 });
ConversationSchema.index({ 'stats.lastMessageAt': -1 });

export const Conversation = mongoose.model<IConversation>(
  'Conversation',
  ConversationSchema
);
```

**File:** `apps/chatbot-service/src/models/message.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  userId: string;

  role: 'user' | 'assistant' | 'system';
  content: string;

  metadata: {
    model?: string;
    finishReason?: string;
    tokens?: {
      prompt: number;
      completion: number;
      total: number;
    };
    latencyMs?: number;
    cost?: number;
  };

  embedding?: number[];

  features: {
    edited: boolean;
    deleted: boolean;
    regenerated: boolean;
    feedbackRating?: number;
    feedbackComment?: string;
  };

  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      model: String,
      finishReason: String,
      tokens: {
        prompt: Number,
        completion: Number,
        total: Number,
      },
      latencyMs: Number,
      cost: Number,
    },
    embedding: {
      type: [Number],
      select: false,
    },
    features: {
      edited: { type: Boolean, default: false },
      deleted: { type: Boolean, default: false },
      regenerated: { type: Boolean, default: false },
      feedbackRating: { type: Number, min: 1, max: 5 },
      feedbackComment: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'messages',
  }
);

// Compound indexes
MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ userId: 1, createdAt: -1 });
MessageSchema.index({ createdAt: 1 });

// TTL index (optional): Delete messages after 2 years
// MessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
```

### Connection Setup

**File:** `apps/chatbot-service/src/config/database.ts`

```typescript
import mongoose from 'mongoose';
import { logger } from '@myapp/backend/logger';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot_db';

export async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority',
    });

    logger.info('✅ MongoDB connected successfully');

    // Enable sharding in production
    if (process.env.NODE_ENV === 'production') {
      await enableSharding();
    }

    // Set up event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
  } catch (error) {
    logger.error('❌ MongoDB connection failed', error);
    process.exit(1);
  }
}

async function enableSharding() {
  try {
    const admin = mongoose.connection.db.admin();

    await admin.command({ enableSharding: 'chatbot_db' });

    await admin.command({
      shardCollection: 'chatbot_db.conversations',
      key: { userId: 'hashed' },
    });

    await admin.command({
      shardCollection: 'chatbot_db.messages',
      key: { userId: 'hashed' },
    });

    logger.info('✅ MongoDB sharding enabled');
  } catch (error) {
    logger.warn('⚠️ Sharding setup failed (expected in dev):', error.message);
  }
}

export async function disconnectMongoDB() {
  await mongoose.connection.close();
  logger.info('MongoDB disconnected');
}
```

---

## PHASE 3: ADMIN SERVICE (PostgreSQL + Prisma)

**⏱️ Duration:** 6 hours  
**👥 Team:** Backend team  
**📦 Deliverables:** Audit logs, system statistics, admin dashboard APIs, feature flags

### 🎯 Phase Goals

1. **Audit Logging** - Track all administrative actions
2. **System Analytics** - Daily stats aggregation across all services
3. **Feature Flags** - Toggle features without deployment
4. **Configuration** - Centralized system settings
5. **Compliance** - GDPR, SOC 2 audit trail

### 📊 Why PostgreSQL for Admin Service?

- ✅ **Complex Analytics** - SQL aggregations across multiple tables
- ✅ **ACID Compliance** - Audit logs must be consistent and immutable
- ✅ **Reporting** - SQL is industry standard for business intelligence
- ✅ **Data Integrity** - Critical compliance data requires transactions
- ✅ **Read Replicas** - Offload analytics queries from primary

### Database Schema

**File:** `apps/admin-service/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/@prisma/admin-client"
}

model AuditLog {
  id              String    @id @default(cuid())

  userId          String?
  userEmail       String?
  userRole        String?

  action          String
  resource        String
  resourceId      String?

  details         Json

  ipAddress       String?
  userAgent       String?
  requestId       String?

  serviceSource   String

  status          Status    @default(SUCCESS)
  errorMessage    String?   @db.Text

  createdAt       DateTime  @default(now())

  @@index([userId, createdAt])
  @@index([action, createdAt])
  @@index([resource, resourceId])
  @@index([serviceSource, createdAt])
  @@index([createdAt])
  @@map("audit_logs")
}

model SystemStats {
  id                      String    @id @default(cuid())
  date                    DateTime  @unique @db.Date

  totalUsers              Int
  activeUsers             Int
  newUsersToday           Int
  deletedUsersToday       Int

  freeUsers               Int
  proUsers                Int
  enterpriseUsers         Int
  mrr                     Decimal   @db.Decimal(12, 2)

  totalConversations      BigInt
  totalMessages           BigInt
  messagesCreatedToday    Int
  averageMessagesPerUser  Float

  totalTokensUsed         BigInt
  tokensUsedToday         Int
  estimatedCostToday      Decimal   @db.Decimal(10, 2)
  averageLatencyMs        Int

  apiErrorRate            Float
  averageResponseTimeMs   Int

  createdAt               DateTime  @default(now())

  @@index([date])
  @@map("system_stats")
}

model SystemConfig {
  id              String    @id @default(cuid())
  key             String    @unique
  value           Json
  category        String
  description     String?   @db.Text

  updatedBy       String?
  updatedAt       DateTime  @updatedAt
  createdAt       DateTime  @default(now())

  @@index([category])
  @@map("system_configs")
}

model FeatureFlag {
  id              String    @id @default(cuid())
  name            String    @unique
  enabled         Boolean   @default(false)

  rolloutPercent  Int       @default(0)
  enabledForUsers String[]

  description     String?   @db.Text
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("feature_flags")
}

enum Status {
  SUCCESS
  FAILURE
  PARTIAL
}
```

---

## PHASE 4: CROSS-SERVICE INTEGRATION

**⏱️ Duration:** 4 hours  
**👥 Team:** Backend team  
**📦 Deliverables:** Redis pub/sub, event handlers, data synchronization, cross-service APIs

### 🎯 Phase Goals

1. **Event-Driven Sync** - Redis pub/sub for real-time updates
2. **Data Denormalization** - Keep MongoDB user snapshots in sync
3. **Cross-Service APIs** - HTTP calls between services
4. **Circuit Breakers** - Fault tolerance for service calls
5. **Eventual Consistency** - Handle temporary sync delays gracefully

### 🔄 Integration Patterns

**Pattern 1: Event Bus (Recommended)**

- Auth Service publishes `user.created`, `user.updated`, `user.deleted`
- Chatbot Service subscribes and updates denormalized data
- Admin Service logs all events for audit trail

**Pattern 2: Direct API Calls**

- Admin Service calls Auth Service for user list
- Admin Service calls Chatbot Service for message stats
- Use circuit breakers to prevent cascading failures

**Pattern 3: Shared Cache**

- Redis stores frequently accessed data (user sessions)
- All services read from cache, reducing database load

### Redis Event Bus

**File:** `libs/backend/events/src/index.ts`

```typescript
import Redis from 'ioredis';
import { logger } from '@myapp/backend/logger';

const redis = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

export interface UserEvent {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionTier: string;
}

// Publisher (Auth Service)
export async function publishUserCreated(user: UserEvent) {
  await redis.publish('user.created', JSON.stringify(user));
  logger.info(`Published user.created event for user ${user.id}`);
}

export async function publishUserUpdated(user: UserEvent) {
  await redis.publish('user.updated', JSON.stringify(user));
  logger.info(`Published user.updated event for user ${user.id}`);
}

export async function publishUserDeleted(userId: string) {
  await redis.publish('user.deleted', JSON.stringify({ userId }));
  logger.info(`Published user.deleted event for user ${userId}`);
}

// Subscriber (Chatbot Service)
export function subscribeToUserEvents(handlers: {
  onUserCreated?: (user: UserEvent) => Promise<void>;
  onUserUpdated?: (user: UserEvent) => Promise<void>;
  onUserDeleted?: (userId: string) => Promise<void>;
}) {
  subscriber.subscribe('user.created', 'user.updated', 'user.deleted');

  subscriber.on('message', async (channel, message) => {
    try {
      const data = JSON.parse(message);

      switch (channel) {
        case 'user.created':
          await handlers.onUserCreated?.(data);
          break;
        case 'user.updated':
          await handlers.onUserUpdated?.(data);
          break;
        case 'user.deleted':
          await handlers.onUserDeleted?.(data.userId);
          break;
      }
    } catch (error) {
      logger.error(`Error handling event ${channel}:`, error);
    }
  });

  logger.info('Subscribed to user events');
}
```

**Usage in Chatbot Service:**

```typescript
import { subscribeToUserEvents } from '@myapp/backend/events';
import { Conversation } from './models/conversation.model';

subscribeToUserEvents({
  onUserCreated: async (user) => {
    // Initialize user preferences
    logger.info(`User created: ${user.id}`);
  },

  onUserUpdated: async (user) => {
    // Update denormalized user data
    await Conversation.updateMany(
      { userId: user.id },
      {
        $set: {
          'userSnapshot.email': user.email,
          'userSnapshot.firstName': user.firstName,
          'userSnapshot.lastName': user.lastName,
          'userSnapshot.subscriptionTier': user.subscriptionTier,
        },
      }
    );
    logger.info(`Updated user snapshot for user ${user.id}`);
  },

  onUserDeleted: async (userId) => {
    // Soft delete conversations
    await Conversation.updateMany(
      { userId },
      {
        $set: {
          'metadata.archived': true,
          'metadata.archivedAt': new Date(),
        },
      }
    );
    logger.info(`Archived conversations for deleted user ${userId}`);
  },
});
```

---

## PHASE 5-8: FRONTEND, TESTING, DEPLOYMENT

### PHASE 5: Frontend MFEs (12 hours)

**Deliverables:**

- ✅ Shell host application with routing
- ✅ Auth MFE (login, register, password reset)
- ✅ Chatbot MFE (conversation list, chat interface, streaming)
- ✅ Admin MFE (user management, analytics, audit logs)
- ✅ Profile MFE (settings, security, preferences)
- ✅ Module Federation configuration
- ✅ Shared component library

### PHASE 6: Nginx Configuration (4 hours)

**Deliverables:**

- ✅ SSL/TLS termination
- ✅ Load balancing with health checks
- ✅ Rate limiting (per-user, per-IP, per-endpoint)
- ✅ Proxy caching (static assets, API responses)
- ✅ SSE streaming support
- ✅ CORS configuration
- ✅ GeoIP routing (optional)

### PHASE 7: Testing & Monitoring (6 hours)

**Deliverables:**

- ✅ Unit tests (250+ tests, >80% coverage)
- ✅ Integration tests (service-to-service)
- ✅ E2E tests with Playwright (50+ scenarios)
- ✅ Load testing with k6 (100K+ concurrent users)
- ✅ Monitoring dashboards (Grafana/Datadog)
- ✅ Alerting (PagerDuty/Slack)
- ✅ Log aggregation (CloudWatch/ELK)

### PHASE 8: Production Deployment (4 hours)

**Deliverables:**

- ✅ Docker images (multi-stage builds)
- ✅ Docker Compose production config
- ✅ Kubernetes manifests (optional)
- ✅ CI/CD pipelines (GitHub Actions)
- ✅ Blue-green deployment strategy
- ✅ Database migration automation
- ✅ Secrets management
- ✅ Backup/restore procedures

> **Note:** These phases follow the same implementation patterns as the main PostgreSQL roadmap ([CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md](./CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md)). The hybrid architecture only changes the database layer - frontend and infrastructure remain identical.

---

## 🎯 SCALING STRATEGIES

> **Planning for Scale:** This section provides infrastructure specifications for supporting 10M+ users and 100M+ messages per day. Use these as guidelines when provisioning production resources.

### 📌 Scaling Decision Matrix

| Component      | Scale Trigger        | Action                             |
| -------------- | -------------------- | ---------------------------------- |
| **PostgreSQL** | CPU >70% sustained   | Add read replica                   |
| **MongoDB**    | Storage >70%         | Add new shard                      |
| **Redis**      | Memory >80%          | Scale vertically or cluster        |
| **Nginx**      | Connections >80%     | Add LB instance                    |
| **Backend**    | Response time >500ms | Horizontal scale (more containers) |

### PostgreSQL Scaling (10M Users)

```yaml
Architecture:
├── Primary (Write): 1 instance
│   ├── Instance: db.r6g.xlarge (4 vCPU, 32 GB RAM)
│   ├── Storage: 1 TB SSD
│   └── IOPS: 10,000
│
├── Read Replicas: 2-3 instances
│   ├── US-East: db.r6g.large
│   ├── US-West: db.r6g.large
│   └── EU: db.r6g.large (optional)
│
├── Connection Pool: PgBouncer
│   ├── Max connections: 1000
│   ├── Pool mode: Transaction
│   └── Instances: 2x for HA
│
└── Backup Strategy:
    ├── Continuous WAL archiving
    ├── Daily snapshots (30-day retention)
    └── Point-in-time recovery

Cost: ~$800-1200/month
```

### MongoDB Scaling (100M Messages/Day)

```yaml
Sharded Cluster:
├── Config Servers: 3 nodes
│   └── Instance: t3.medium each
│
├── Mongos Routers: 2 nodes
│   └── Instance: t3.large each
│
├── Shard 1 (userIds: hash 0-3333)
│   ├── Primary: m5.xlarge
│   └── Secondaries: 2x m5.large
│
├── Shard 2 (userIds: hash 3334-6666)
│   ├── Primary: m5.xlarge
│   └── Secondaries: 2x m5.large
│
└── Shard 3 (userIds: hash 6667-9999)
    ├── Primary: m5.xlarge
    └── Secondaries: 2x m5.large

Sharding Key: { userId: "hashed" }
Write Concern: { w: "majority", j: true }
Read Preference: "secondaryPreferred"

Cost: ~$2000-3000/month
```

### Nginx Scaling

```yaml
Load Balancer Tier:
├── Primary LB: c6g.large (2 vCPU, 4 GB RAM)
├── Backup LB: c6g.large (hot standby)
├── Connections: 50K per instance
└── Request rate: 20K req/s per instance

Configuration:
├── Worker processes: auto (CPU cores)
├── Worker connections: 4096
├── Keepalive timeout: 65s
├── Cache: 10 GB
└── Rate limit: 10 zones

Cost: ~$60-100/month
```

---

## 📊 COST ANALYSIS (10M Users, 100M Messages/Day)

> **Budget Planning:** These costs assume AWS us-east-1 pricing with reserved instances (1-year commit). Adjust based on your cloud provider and region.

### 💰 Cost Breakdown by Category

**Database Costs (65%):** PostgreSQL + MongoDB + Redis = $4,000/month  
**Compute Costs (20%):** Backend services + Nginx = $900/month  
**Network Costs (8%):** Data transfer + CDN = $500/month  
**Monitoring (7%):** Logs + metrics + APM = $350/month

### 📊 Detailed Cost Table

| Component                          | Minimal (P1) | Full (P2-3)      | Annual (P1) | Annual (Full)      |
| ---------------------------------- | ------------ | ---------------- | ----------- | ------------------ |
| **PostgreSQL (Auth + Admin)**      | $1,200       | $1,200           | $14,400     | $14,400            |
| **MongoDB (Chatbot)**              | $2,500       | $2,500           | $30,000     | $30,000            |
| **Redis Cluster**                  | $300         | $300             | $3,600      | $3,600             |
| **Nginx Load Balancers**           | $100         | $100             | $1,200      | $1,200             |
| **Backend Services (ECS)**         | $800         | $800             | $9,600      | $9,600             |
| **Frontend Hosting (CloudFront)**  | $200         | $200             | $2,400      | $2,400             |
| **Data Transfer**                  | $300         | $300             | $3,600      | $3,600             |
| **Monitoring (DataDog/New Relic)** | $200         | $200             | $2,400      | $2,400             |
| **Backups & Snapshots**            | $150         | $150             | $1,800      | $1,800             |
| **SSO + MFA (Priority 1)**         | **$0**       | **$0**           | **$0**      | **$0**             |
| **SMS MFA (Twilio, Priority 2)**   | **-**        | **$15-30**       | **-**       | **$180-360**       |
| **Auth0 (Priority 3, optional)**   | **-**        | **$23-240**      | **-**       | **$276-2,880**     |
| **Total Infrastructure**           | **$5,750**   | **$5,788-6,020** | **$69,000** | **$69,456-72,240** |

**Plus:**

- OpenAI API: Variable ($10K-50K/month at scale)
- Support/Maintenance: $5K-10K/month

**Total Monthly:**

- **Minimal (Priority 1):** $21K-66K (same as before, $0 SSO/MFA cost)
- **Full (Priority 2-3):** $21K-66K + SMS/Auth0 costs ($15-270/month)

---

## ✅ PRODUCTION READINESS CHECKLIST

> **Go-Live Verification:** Complete this checklist before deploying to production. Each item is critical for enterprise-grade reliability and security.

### 🚦 Checklist Status Guide

- ✅ **Critical** - Must complete before launch
- 🔶 **Important** - Complete within first week of production
- 📋 **Recommended** - Complete within first month

### Infrastructure (Critical ✅)

- [ ] PostgreSQL primary + 2 read replicas
- [ ] MongoDB 3-shard cluster with replica sets
- [ ] Redis cluster (3 nodes)
- [ ] Nginx with SSL (Let's Encrypt)
- [ ] Docker images built and pushed to registry
- [ ] Kubernetes manifests (if using K8s)

### Security

- [ ] SSL/TLS certificates configured
- [ ] Secrets management (AWS Secrets Manager / Vault)
- [ ] Database encryption at rest
- [ ] VPC with private subnets
- [ ] Security groups configured
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] JWT with strong secrets (64+ chars)

### Monitoring

- [ ] Application logs aggregated (CloudWatch / Datadog)
- [ ] Database metrics monitored
- [ ] Nginx access logs analyzed
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring (Pingdom)
- [ ] Alerts configured (PagerDuty / OpsGenie)

### Performance

- [ ] Database indexes optimized
- [ ] Connection pooling configured
- [ ] Nginx caching enabled
- [ ] CDN for static assets
- [ ] Load testing completed (k6)
- [ ] Query performance analyzed

### Compliance

- [ ] Audit logs retention policy
- [ ] GDPR compliance (data export/deletion)
- [ ] SOC 2 preparation
- [ ] Backup/restore tested
- [ ] Disaster recovery plan

---

## 🚀 DEPLOYMENT COMMANDS

> **Quick Reference:** Common commands for development, deployment, and operations. Copy and run these in your terminal.

### 📂 Command Categories

1. **Development** - Local setup and testing
2. **Production Build** - Creating deployment artifacts
3. **Production Deploy** - Launching services
4. **Scaling** - Adding more instances
5. **Monitoring** - Checking health and logs
6. **Health Checks** - Verifying services are running

### Commands

```bash
# ============================================
# Development
# ============================================
npm run docker:up          # Start PostgreSQL, MongoDB, Redis
npm run prisma:migrate     # Run Prisma migrations
npm run seed              # Seed databases
npm run dev               # Start all services

# Production Build
npm run build             # Build all applications
npm run docker:build:prod # Build production Docker images

# Production Deploy
docker-compose -f docker-compose.prod.yml up -d

# Scaling
docker-compose -f docker-compose.prod.yml scale chatbot-service=3
docker-compose -f docker-compose.prod.yml scale auth-service=2

# Monitoring
docker logs -f nginx
docker logs -f chatbot-service
docker stats

# Health Checks
curl http://localhost/health
curl http://localhost:3000/health  # Auth
curl http://localhost:3001/health  # Chatbot
curl http://localhost:3002/health  # Admin
```

---

## 📚 DOCUMENTATION

> **External Resources:** Official documentation and best practices guides for each technology in the stack.

### Database Resources

- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Performance_Optimization) - Query optimization, indexing strategies
- [MongoDB Sharding Guide](https://www.mongodb.com/docs/manual/sharding/) - Horizontal scaling, shard key selection
- [Prisma Production Guide](https://www.prisma.io/docs/guides/performance-and-optimization) - Connection pooling, query optimization
- [Mongoose Best Practices](https://mongoosejs.com/docs/guide.html) - Schema design, middleware, performance

### Infrastructure Resources

- [Nginx Performance Tuning](https://www.nginx.com/blog/tuning-nginx/) - Worker processes, caching, rate limiting
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/) - Optimizing image size
- [Redis Best Practices](https://redis.io/docs/management/optimization/) - Memory optimization, persistence

### Related Internal Documentation

- [Consolidated PostgreSQL Roadmap](./CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md) - Single-database architecture
- [MongoDB-Only Roadmap](./MONGODB_IMPLEMENTATION_ROADMAP.md) - Full MongoDB architecture
- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md) - Step-by-step deployment instructions
- [E2E Testing Guide](./E2E_TESTING.md) - Playwright test setup and patterns

---

---

## 📋 ROADMAP METADATA

**Version:** 2.0  
**Last Updated:** November 17, 2025  
**Status:** Ready for Implementation  
**Estimated Effort:** 69-87 hours (7-9 weeks with team)  
**Team Size:** 6-10 developers

**Architecture Summary:**

- 🗄️ **Databases:** PostgreSQL (Auth/Admin) + MongoDB (Chatbot) + Redis (Cache)
- 🔐 **Security:** SSO (OAuth 2.0) + MFA (TOTP/SMS/WebAuthn) - Phased implementation
- 🌐 **Load Balancer:** Nginx with SSL, rate limiting, caching, OAuth callbacks
- 🎯 **Scale Target:** 10M+ users, 100M+ messages/day
- 💰 **Infrastructure Cost:** $5,750-6,020/month (minimal to full SSO/MFA)
- ⚡ **Priority 1:** Google OAuth + TOTP MFA (12-16h, $0/month)
- 🚀 **Priority 2-3:** GitHub, SMS, WebAuthn, Auth0 (18h, +$15-270/month)

**Key Benefits:**

- ✅ Right database for each use case (polyglot persistence)
- ✅ Enterprise-grade security with SSO + MFA (optional tiers)
- ✅ Horizontal scaling for high-volume message storage
- ✅ ACID compliance for critical financial/auth data
- ✅ One-click social login with Google/GitHub OAuth
- ✅ Enhanced security without increased costs (self-hosted MFA)

---

### 🚀 Ready to Start?

**Choose Your Implementation Path:**

1. **🟢 Quick Start (Priority 1)** - Implement Google OAuth + TOTP MFA
   - Time: 12-16 hours additional
   - Cost: $0/month
   - Coverage: 90% of users
   - Best for: Startups, MVPs, early-stage products

2. **🟡 Balanced (Priority 1-2)** - Add GitHub OAuth + SMS MFA
   - Time: 22-26 hours additional
   - Cost: $15-30/month (Twilio SMS)
   - Coverage: 95% of users
   - Best for: Growing companies, developer-focused products

3. **🔴 Enterprise (Priority 1-3)** - Full Auth0 + WebAuthn + all providers
   - Time: 30+ hours additional
   - Cost: $40-270/month
   - Coverage: 100% of users + compliance features
   - Best for: Enterprise customers, regulated industries, SOC 2

---

1. **First Time?** Start with [Phase 0: Infrastructure Setup](#phase-0-infrastructure-setup-week-1-day-1-2)
2. **Comparing Options?** See [PostgreSQL-only roadmap](./CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md) or [MongoDB-only roadmap](./MONGODB_IMPLEMENTATION_ROADMAP.md)
3. **Need Help?** Review the [Executive Summary](#-executive-summary) for architecture decisions

---

**💡 Pro Tip:** This hybrid approach combines the best of both worlds - PostgreSQL for critical transactional data and MongoDB for high-volume chat messages, with Nginx providing enterprise-grade load balancing and caching at the edge.
