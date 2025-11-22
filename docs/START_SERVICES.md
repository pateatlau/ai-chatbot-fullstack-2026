# Start Services Manually

## Prerequisites

```bash
# Make sure Docker containers are running
docker ps  # Should show PostgreSQL and Redis

# If not running:
docker-compose up -d
```

## Backend Services (Start in separate terminals)

### Terminal 1 - Auth Service (Port 3000)

```bash
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026
npm run dev:auth
```

### Terminal 2 - Admin Service (Port 3002)

```bash
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026
npm run dev:admin
```

### Terminal 3 - Chatbot Service (Port 3001) - SKIP FOR NOW

**NOTE:** This service has Prisma schema errors and won't start until fixed.

```bash
# Don't run this yet - needs schema fixes
# npm run dev:chatbot
```

## Frontend Services (Start in separate terminals)

### Terminal 4 - Shell (Port 5173)

```bash
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026
npm run dev:shell
```

### Terminal 5 - Auth MFE (Port 5174)

```bash
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026
npm run dev:auth-mfe
```

### Terminal 6 - Chatbot MFE (Port 5175)

```bash
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026
npm run dev:chatbot-mfe
```

### Terminal 7 - Admin MFE (Port 5176)

```bash
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026
npm run dev:admin-mfe
```

### Terminal 8 - Profile MFE (Port 5177)

```bash
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026
npm run dev:profile-mfe
```

## Recommended Startup Order

1. **Start Backend First:** Auth → Admin
2. **Wait 10-15 seconds** for backends to be ready
3. **Start Frontend:** Shell → Auth MFE → Other MFEs

## Verification

```bash
# Check all services are running
lsof -ti:3000,3002,5173,5174,5175,5176,5177
```

## Access Points

- **Main App:** http://localhost:5173
- **Login Page:** http://localhost:5173/login
- **Auth Service API:** http://localhost:3000
- **Admin Service API:** http://localhost:3002

## Stop All Services

```bash
# Run this in any terminal
npm run kill:all
```
