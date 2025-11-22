# Environment Variables Quick Reference

## Overview

All environment variables are now managed in a single root `.env` file. This document provides a quick reference for all available variables.

## Quick Setup

```bash
# Copy template
cp .env.example .env

# Generate secure JWT secrets (production)
openssl rand -base64 64

# Edit values
vim .env  # or your preferred editor
```

## Variable Categories

### 🗄️ Database & Cache

| Variable       | Required | Default                  | Description                  |
| -------------- | -------- | ------------------------ | ---------------------------- |
| `DATABASE_URL` | ✅ Yes   | -                        | PostgreSQL connection string |
| `REDIS_URL`    | ✅ Yes   | `redis://localhost:6379` | Redis connection string      |

**Example**:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
```

### 🔐 JWT Configuration (CRITICAL)

| Variable                 | Required | Default | Min Length | Description              |
| ------------------------ | -------- | ------- | ---------- | ------------------------ |
| `JWT_SECRET`             | ✅ Yes   | -       | 64 chars   | Token signing secret     |
| `JWT_REFRESH_SECRET`     | ✅ Yes   | -       | 64 chars   | Refresh token secret     |
| `JWT_EXPIRES_IN`         | No       | `15m`   | -          | Token expiration         |
| `JWT_REFRESH_EXPIRES_IN` | No       | `7d`    | -          | Refresh token expiration |

**⚠️ CRITICAL**: All services MUST use the same `JWT_SECRET`. Different secrets cause "invalid signature" errors.

**Generate secure secrets**:

```bash
openssl rand -base64 64
```

**Example**:

```env
JWT_SECRET="generated-secret-minimum-64-characters-long"
JWT_REFRESH_SECRET="another-generated-secret-minimum-64-characters"
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 🖥️ Backend Services

| Variable               | Required | Default                 | Description           |
| ---------------------- | -------- | ----------------------- | --------------------- |
| `AUTH_SERVICE_PORT`    | No       | `3000`                  | Auth service port     |
| `CHATBOT_SERVICE_PORT` | No       | `3001`                  | Chatbot service port  |
| `ADMIN_SERVICE_PORT`   | No       | `3002`                  | Admin service port    |
| `GRAPHQL_GATEWAY_PORT` | No       | `4000`                  | GraphQL Gateway port  |
| `FRONTEND_URL`         | No       | `http://localhost:5173` | Frontend URL for CORS |

**Example**:

```env
AUTH_SERVICE_PORT=3000
CHATBOT_SERVICE_PORT=3001
ADMIN_SERVICE_PORT=3002
GRAPHQL_GATEWAY_PORT=4000
FRONTEND_URL=http://localhost:5173
```

### 🌐 Frontend (Vite Variables)

All frontend variables must start with `VITE_` prefix to be accessible in browser code.

| Variable                   | Required | Default       | Description               |
| -------------------------- | -------- | ------------- | ------------------------- |
| `VITE_API_URL`             | ✅ Yes   | -             | REST API base URL         |
| `VITE_GRAPHQL_GATEWAY_URL` | ✅ Yes   | -             | GraphQL Gateway endpoint  |
| `VITE_AUTH_SERVICE_URL`    | No       | -             | Auth service URL          |
| `VITE_CHATBOT_SERVICE_URL` | No       | -             | Chatbot service URL       |
| `VITE_ADMIN_SERVICE_URL`   | No       | -             | Admin service URL         |
| `VITE_SHELL_PORT`          | No       | `5173`        | Shell MFE port            |
| `VITE_AUTH_MFE_PORT`       | No       | `5174`        | Auth MFE port             |
| `VITE_CHATBOT_MFE_PORT`    | No       | `5175`        | Chatbot MFE port          |
| `VITE_ADMIN_MFE_PORT`      | No       | `5176`        | Admin MFE port            |
| `VITE_PROFILE_MFE_PORT`    | No       | `5177`        | Profile MFE port          |
| `VITE_SENTRY_DSN`          | No       | -             | Sentry error tracking DSN |
| `VITE_ENV`                 | No       | `development` | Environment name          |

**Example**:

```env
VITE_API_URL=http://localhost:3000
VITE_GRAPHQL_GATEWAY_URL=http://localhost:4000/graphql
VITE_AUTH_SERVICE_URL=http://localhost:3000
VITE_CHATBOT_SERVICE_URL=http://localhost:3001
VITE_ADMIN_SERVICE_URL=http://localhost:3002
VITE_SHELL_PORT=5173
VITE_AUTH_MFE_PORT=5174
VITE_CHATBOT_MFE_PORT=5175
VITE_ADMIN_MFE_PORT=5176
VITE_PROFILE_MFE_PORT=5177
VITE_SENTRY_DSN=
VITE_ENV=development
```

**Access in frontend code**:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const graphqlUrl = import.meta.env.VITE_GRAPHQL_GATEWAY_URL;
```

### 🤖 Third-Party Services

| Variable         | Required | Default               | Description                |
| ---------------- | -------- | --------------------- | -------------------------- |
| `OPENAI_API_KEY` | ✅ Yes\* | -                     | OpenAI API key for chatbot |
| `OPENAI_MODEL`   | No       | `gpt-4-turbo-preview` | OpenAI model to use        |

\*Required for chatbot functionality

**Example**:

```env
OPENAI_API_KEY=sk-proj-...your-key...
OPENAI_MODEL=gpt-4-turbo-preview
```

### 🛠️ Development Flags

| Variable    | Required | Default       | Options                                | Description       |
| ----------- | -------- | ------------- | -------------------------------------- | ----------------- |
| `NODE_ENV`  | No       | `development` | `development`, `staging`, `production` | Environment mode  |
| `LOG_LEVEL` | No       | `info`        | `debug`, `info`, `warn`, `error`       | Logging verbosity |

**Example**:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

## Common Scenarios

### Local Development

```env
# Use default ports
AUTH_SERVICE_PORT=3000
CHATBOT_SERVICE_PORT=3001
ADMIN_SERVICE_PORT=3002
GRAPHQL_GATEWAY_PORT=4000

# Local database
DATABASE_URL=postgresql://myapp:myapp_dev_password@localhost:5432/myapp_dev
REDIS_URL=redis://localhost:6379

# Development secrets (NOT for production!)
JWT_SECRET="my-super-secret-jwt-key-for-development-only-change-in-production-min-64-chars-long"

# Debug logging
NODE_ENV=development
LOG_LEVEL=debug
```

### Docker Development

```env
# Use Docker service names
DATABASE_URL=postgresql://myapp:myapp_dev_password@postgres:5432/myapp_dev
REDIS_URL=redis://redis:6379

# Services accessible on host
VITE_API_URL=http://localhost:3000
VITE_GRAPHQL_GATEWAY_URL=http://localhost:4000/graphql
```

### Production

```env
# Secure database with SSL
DATABASE_URL=postgresql://user:password@db.example.com:5432/production?sslmode=require
REDIS_URL=rediss://redis.example.com:6380

# Strong secrets (64+ chars)
JWT_SECRET="<generated-with-openssl-rand-base64-64>"
JWT_REFRESH_SECRET="<generated-with-openssl-rand-base64-64>"

# Production domains
FRONTEND_URL=https://app.example.com
VITE_API_URL=https://api.example.com
VITE_GRAPHQL_GATEWAY_URL=https://api.example.com/graphql

# Production flags
NODE_ENV=production
LOG_LEVEL=info
```

## Validation

### Required Variables Check

```typescript
const required = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'VITE_API_URL',
  'VITE_GRAPHQL_GATEWAY_URL',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
}
```

### JWT Secret Length Check

```typescript
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 64) {
  throw new Error('JWT_SECRET must be at least 64 characters long');
}
```

### URL Format Check

```typescript
try {
  new URL(process.env.DATABASE_URL!);
  new URL(process.env.REDIS_URL!);
} catch (error) {
  throw new Error('DATABASE_URL or REDIS_URL is not a valid URL');
}
```

## Troubleshooting

### "Token verification failed: invalid signature"

**Cause**: Different `JWT_SECRET` values across services.

**Solution**:

1. Verify root `.env` has `JWT_SECRET`
2. Ensure no service-level `.env` files exist:
   ```bash
   find . -name ".env" -not -path "./node_modules/*"
   ```
3. Check service logs for JWT_SECRET length:
   ```
   [dotenv] JWT_SECRET length: 83  ✅ Correct
   [dotenv] JWT_SECRET length: 51  ❌ Wrong (service override)
   ```

### "Cannot connect to database"

**Check**:

1. Database URL format: `postgresql://user:password@host:port/database`
2. Database is running: `docker ps | grep postgres`
3. Credentials are correct
4. Network connectivity

### "Missing VITE\_\* variables in frontend"

**Remember**:

- Must start with `VITE_` prefix
- Access via `import.meta.env.VITE_VARIABLE_NAME`
- Rebuild frontend after changing `.env`: `npm run build`
- Restart dev server: `npm run dev:shell`

### "EADDRINUSE: address already in use"

**Port conflict**. Check running services:

```bash
lsof -ti:3000,3001,3002,4000
```

Kill processes:

```bash
lsof -ti:3000,3001,3002,4000 | xargs kill -9
```

## Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] `.env` is NOT committed to git
- [ ] Production `JWT_SECRET` is 64+ characters
- [ ] Production secrets are different from development
- [ ] Database passwords are strong (32+ chars)
- [ ] No hardcoded secrets in source code
- [ ] `.env.example` has placeholder values only
- [ ] Secrets rotated regularly (every 90 days)
- [ ] Production secrets stored in secret manager (AWS/Azure/Vault)

## Tools

### Generate Secure Secrets

```bash
# JWT secrets (64 chars)
openssl rand -base64 64

# Database password (32 chars)
openssl rand -base64 32

# API keys (hex format)
openssl rand -hex 32
```

### Validate .env File

```bash
# Check if required variables exist
grep -E "^(DATABASE_URL|JWT_SECRET|REDIS_URL)=" .env

# Count total variables
grep -cE "^[A-Z_]+=" .env

# Show all variable names
grep -oE "^[A-Z_]+=" .env | sort
```

### Environment Variable Inspector

```bash
# Load and display all variables
node -e "require('dotenv').config(); Object.keys(process.env).filter(k => !k.startsWith('npm_')).sort().forEach(k => console.log(k))"

# Check specific variable
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET?.length || 0)"
```

## References

- [Environment Consolidation Guide](./docs/ENVIRONMENT_CONSOLIDATION_NOV22.md)
- [JWT Authentication Fix](./docs/JWT_AUTHENTICATION_FIX_NOV22.md)
- [Environment Variable Management](./docs/ENVIRONMENT_VARIABLE_MANAGEMENT.md)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [dotenv Documentation](https://github.com/motdotla/dotenv)

## Quick Commands

```bash
# Setup
cp .env.example .env           # Create .env from template

# Verify
cat .env | wc -l              # Line count
grep -c "^[A-Z]" .env         # Variable count

# Test loading
node -e "require('dotenv').config(); console.log('✓ Loaded')"

# Generate secrets
openssl rand -base64 64       # JWT secret
openssl rand -base64 32       # Database password

# Check services
lsof -ti:3000,3001,3002,4000  # Running backend services
```
