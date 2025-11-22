# Environment Variable Management Strategy

**Status:** Recommended Best Practices  
**Date:** November 22, 2025  
**Context:** Monorepo with multiple services and MFEs

---

## 🎯 Current State

### Existing `.env` Files

```
.env                      # ✅ Root - Shared configs (DATABASE_URL, JWT_SECRET)
apps/auth-mfe/.env        # ⚠️  Frontend - Should use .env.local
apps/auth-service/.env    # ⚠️  Backend - Should only have service-specific overrides
```

### Problems with Current Approach

1. **Duplication** - Same values repeated across files
2. **Sync Issues** - Changes must be made in multiple places
3. **Secret Leakage Risk** - More files = more places secrets can leak
4. **Confusion** - Which file takes precedence?
5. **Onboarding Friction** - New developers must configure many files

---

## ✅ Recommended Strategy

### Option 1: Single Root `.env` (Recommended for Development)

**Structure:**

```
.env                    # All shared configs
.env.example            # Template for new developers
.gitignore              # Ignore all .env files except .example
```

**Benefits:**

- ✅ Single source of truth
- ✅ Easy to onboard new developers
- ✅ No sync issues
- ✅ Clear which values are used

**Implementation:**

#### 1. Consolidate to Root `.env`

```env
# ===========================================
# SHARED CONFIGURATION (All Services)
# ===========================================

# Database
DATABASE_URL=postgresql://myapp:myapp_dev_password@localhost:5432/myapp_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT Configuration (CRITICAL - must be same across all services)
JWT_SECRET="my-super-secret-jwt-key-for-development-only-change-in-production-min-64-chars-long"
JWT_REFRESH_SECRET="my-super-secret-refresh-jwt-key-for-development-only-change-in-production"
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ===========================================
# BACKEND SERVICES (Ports & URLs)
# ===========================================

# Auth Service
AUTH_SERVICE_PORT=3000
AUTH_SERVICE_URL=http://localhost:3000

# Chatbot Service
CHATBOT_SERVICE_PORT=3001
CHATBOT_SERVICE_URL=http://localhost:3001

# Admin Service
ADMIN_SERVICE_PORT=3002
ADMIN_SERVICE_URL=http://localhost:3002

# GraphQL Gateway
GRAPHQL_GATEWAY_PORT=4000
GRAPHQL_GATEWAY_URL=http://localhost:4000

# ===========================================
# FRONTEND (MFEs)
# ===========================================

# Vite MFE Ports
VITE_AUTH_MFE_PORT=5174
VITE_CHATBOT_MFE_PORT=5175
VITE_ADMIN_MFE_PORT=5176
VITE_PROFILE_MFE_PORT=5177
VITE_SHELL_PORT=5173

# API URLs
VITE_GRAPHQL_GATEWAY_URL=http://localhost:4000/graphql
VITE_AUTH_SERVICE_URL=http://localhost:3000
VITE_CHATBOT_SERVICE_URL=http://localhost:3001
VITE_ADMIN_SERVICE_URL=http://localhost:3002

# ===========================================
# THIRD-PARTY SERVICES
# ===========================================

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# Email (if needed)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# ===========================================
# DEVELOPMENT FLAGS
# ===========================================

NODE_ENV=development
LOG_LEVEL=debug
ENABLE_CORS=true
```

#### 2. Update Service Configuration Files

Each service's `main.ts` should load from root `.env`:

```typescript
// apps/*/src/main.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load from workspace root
const rootEnvPath = path.join(__dirname, '../../.env');
const workspaceRootPath = path.join(__dirname, '../../../.env');

dotenv.config({ path: rootEnvPath }) ||
  dotenv.config({ path: workspaceRootPath });

// Service-specific port with fallback
const port = process.env.AUTH_SERVICE_PORT
  ? Number(process.env.AUTH_SERVICE_PORT)
  : 3000;
```

#### 3. Delete Service-Level `.env` Files

```bash
# Remove redundant files (keep .example files)
rm apps/auth-service/.env
rm apps/auth-mfe/.env

# Keep only root .env
ls -la .env
```

---

### Option 2: Root + Service Overrides (Current, Needs Cleanup)

**Structure:**

```
.env                           # Shared configs
apps/auth-service/.env         # Service-specific ONLY
apps/chatbot-service/.env      # Service-specific ONLY
```

**When to Use:**

- Services need different database connections
- Different API keys per service
- Service-specific feature flags

**Rules:**

```env
# apps/auth-service/.env
# ⚠️ DO NOT OVERRIDE THESE (use root .env):
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - DATABASE_URL (unless service has own DB)

# ✅ ONLY service-specific overrides:
PORT=3000
LOG_LEVEL=debug
ENABLE_SWAGGER=true

# Service-specific API keys
AUTH_SERVICE_API_KEY=service-specific-key
```

**Benefits:**

- Flexibility for service-specific configs
- Clear separation of concerns

**Drawbacks:**

- More files to manage
- Risk of accidentally overriding shared secrets

---

### Option 3: Environment-Specific Files (Recommended for Production)

**Structure:**

```
.env                    # Development (local)
.env.development        # Development environment
.env.staging            # Staging environment
.env.production         # Production environment
.env.test               # Test environment
```

**Usage:**

```bash
# Development
npm run dev

# Staging
NODE_ENV=staging npm run start

# Production
NODE_ENV=production npm run start
```

**Load Priority:**

```typescript
// Load environment-specific file first, then fallback to .env
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
dotenv.config({ path: '.env' }); // Fallback
```

---

### Option 4: Secret Management Service (Production Only)

**For Production:**

- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secret Manager
- HashiCorp Vault
- Doppler
- Infisical

**Example with AWS Secrets Manager:**

```typescript
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

async function loadSecrets() {
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: 'myapp/production' })
  );

  const secrets = JSON.parse(response.SecretString);
  process.env.JWT_SECRET = secrets.JWT_SECRET;
  process.env.DATABASE_URL = secrets.DATABASE_URL;
}

// Load before starting server
await loadSecrets();
```

---

## 🚀 Implementation Plan

### Step 1: Audit Current Variables

```bash
# See what's in each file
echo "=== ROOT .env ==="
cat .env | grep -v "^#" | grep -v "^$"

echo "=== AUTH SERVICE .env ==="
cat apps/auth-service/.env | grep -v "^#" | grep -v "^$"

echo "=== AUTH MFE .env ==="
cat apps/auth-mfe/.env | grep -v "^#" | grep -v "^$"
```

### Step 2: Consolidate to Root `.env`

```bash
# 1. Backup current files
cp .env .env.backup
cp apps/auth-service/.env apps/auth-service/.env.backup
cp apps/auth-mfe/.env apps/auth-mfe/.env.backup

# 2. Merge all configs into root .env
# (manually combine, removing duplicates)

# 3. Test that services still work
npm run dev:backend
npm run dev:shell
```

### Step 3: Update Service Loaders

Update all services to explicitly load from root `.env`:

```typescript
// Template for all services
import * as dotenv from 'dotenv';
import * as path from 'path';

// Try multiple paths to find workspace root
const possiblePaths = [
  path.join(__dirname, '../../.env'), // From dist/apps/service/
  path.join(__dirname, '../../../.env'), // From apps/service/src/
  path.join(process.cwd(), '.env'), // From workspace root
];

let loaded = false;
for (const envPath of possiblePaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`✓ Loaded .env from ${envPath}`);
    loaded = true;
    break;
  }
}

if (!loaded) {
  console.warn('⚠️  No .env file found - using environment defaults');
}
```

### Step 4: Create `.env.example`

```env
# Copy root .env and replace sensitive values
cp .env .env.example

# Edit .env.example - replace real values with placeholders
JWT_SECRET="REPLACE_WITH_SECURE_RANDOM_STRING_MIN_64_CHARS"
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
OPENAI_API_KEY=sk-REPLACE_WITH_YOUR_API_KEY
```

### Step 5: Update `.gitignore`

```gitignore
# Environment files
.env
.env.local
.env.*.local
apps/*/.env
apps/*/.env.local

# Keep example files
!.env.example
!apps/*/.env.example
```

### Step 6: Update Documentation

Add to `README.md`:

````markdown
## Environment Setup

1. Copy example environment file:
   ```bash
   cp .env.example .env
   ```
````

2. Update values in `.env`:
   - Set `JWT_SECRET` to a secure random string (min 64 chars)
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Set `OPENAI_API_KEY` to your OpenAI API key

3. Start services:
   ```bash
   npm run dev
   ```

⚠️ **Never commit `.env` files to git!**

```

---

## 📋 Best Practices

### 1. Never Duplicate Secrets

❌ **Bad:**
```

# .env

JWT_SECRET=abc123

# apps/auth-service/.env

JWT_SECRET=abc123 # DUPLICATE!

```

✅ **Good:**
```

# .env

JWT_SECRET=abc123

# apps/auth-service/.env

# (no JWT_SECRET - uses root .env)

```

### 2. Use Descriptive Variable Names

❌ **Bad:**
```

SECRET=abc123
URL=http://localhost:3000

```

✅ **Good:**
```

JWT_SECRET=abc123
AUTH_SERVICE_URL=http://localhost:3000

````

### 3. Group Related Variables

```env
# ===== DATABASE =====
DATABASE_URL=postgresql://...
DATABASE_POOL_SIZE=10
DATABASE_SSL=false

# ===== JWT =====
JWT_SECRET=...
JWT_EXPIRES_IN=15m
````

### 4. Provide Sensible Defaults

```typescript
const port = process.env.AUTH_SERVICE_PORT
  ? Number(process.env.AUTH_SERVICE_PORT)
  : 3000; // Default fallback
```

### 5. Validate Required Variables

```typescript
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'REDIS_URL'];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

// Or use a library
import { cleanEnv, str, port } from 'envalid';

const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  JWT_SECRET: str({ minLength: 64 }),
  PORT: port({ default: 3000 }),
});
```

### 6. Document Each Variable

```env
# JWT_SECRET: Secret key for signing JWT tokens
# - Must be minimum 64 characters
# - Must be same across all services
# - Generate with: openssl rand -base64 64
JWT_SECRET=your-secret-here

# DATABASE_URL: PostgreSQL connection string
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://myapp:password@localhost:5432/myapp_dev
```

---

## 🔒 Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] `.env.example` has placeholder values (no real secrets)
- [ ] Secrets are minimum required length (JWT: 64+ chars)
- [ ] Production uses secret management service (not `.env` files)
- [ ] CI/CD injects secrets at deploy time
- [ ] Developers know how to get `.env` file (onboarding docs)
- [ ] Secrets rotated regularly (every 90 days)
- [ ] No secrets in error messages or logs
- [ ] Different secrets for dev/staging/production

---

## 🎯 Recommendation for Your Project

**Immediate (Development):**

1. ✅ Keep single root `.env` for shared configs
2. ✅ Remove service-level `.env` files (except for true service-specific configs)
3. ✅ Create `.env.example` with placeholders
4. ✅ Add validation for required variables

**Near-term (Pre-production):**

1. Create environment-specific files (`.env.staging`, `.env.production`)
2. Add `envalid` or similar for validation
3. Document all environment variables

**Production:**

1. Use AWS Secrets Manager / Azure Key Vault / similar
2. Inject secrets via CI/CD pipeline
3. Never commit production secrets to git
4. Implement secret rotation

---

## 📚 Tools & Libraries

### Environment Variable Validation

```bash
npm install envalid
```

```typescript
import { cleanEnv, str, port, url } from 'envalid';

export const env = cleanEnv(process.env, {
  DATABASE_URL: url(),
  JWT_SECRET: str({ minLength: 64 }),
  PORT: port({ default: 3000 }),
  NODE_ENV: str({ choices: ['development', 'test', 'staging', 'production'] }),
});
```

### Multi-Environment Management

```bash
npm install dotenv-cli
```

```json
{
  "scripts": {
    "dev": "dotenv -e .env.development -- npm start",
    "staging": "dotenv -e .env.staging -- npm start",
    "prod": "dotenv -e .env.production -- npm start"
  }
}
```

### Secret Management (Production)

- **Doppler**: https://doppler.com
- **Infisical**: https://infisical.com (open source)
- **AWS Secrets Manager**: Built into AWS
- **Azure Key Vault**: Built into Azure
- **Google Secret Manager**: Built into GCP

---

## 📖 Related Documentation

- **JWT_AUTHENTICATION_FIX_NOV22.md** - Why JWT_SECRET must be centralized
- **APOLLO_CLIENT_INTEGRATION_GUIDE.md** - Frontend environment setup
- **GRAPHQL_QUICKSTART.md** - Service startup and configuration

---

**Next Steps:**

1. Audit current `.env` files
2. Consolidate to root `.env`
3. Delete service-level `.env` files (keep `.example`)
4. Add validation
5. Update onboarding docs
