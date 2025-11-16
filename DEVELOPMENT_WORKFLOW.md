# Development Workflow Guide

## ⚠️ CRITICAL: VSCode Performance Issue

**DO NOT** use `npm run dev:frontend` during debugging or development as it spawns 7 parallel Nx processes that can freeze VSCode and make it unresponsive.

## Recommended Development Workflow

### Starting Frontend Services

**Option 1: Individual Terminals (RECOMMENDED)**
Open separate terminals for each service you need:

```bash
# Terminal 1 - Shell (Host)
npm run dev:shell

# Terminal 2 - Auth MFE
npm run dev:auth-mfe

# Terminal 3 - Chatbot MFE (only if needed)
npm run dev:chatbot-mfe
```

**Benefits:**

- Better performance
- Easier to debug individual services
- Clear separation of logs
- VSCode remains responsive

**Option 2: Run Only What You Need**
Don't start all 7 frontend projects if you only need 2-3:

```bash
# Example: Only shell and auth-mfe for authentication work
npm run dev:shell
npm run dev:auth-mfe
```

### Starting Backend Services

```bash
# Terminal for backend services
npm run dev:backend
```

This runs 3 backend services in parallel (auth, chatbot, admin).

## Killing Services

### Kill Frontend Ports

```bash
npm run kill:frontend
```

Kills all frontend dev servers on ports 5173-5179.

### Kill Backend Ports

```bash
npm run kill:backend
```

Kills all backend services on ports 3000-3002.

### Kill Everything

```bash
npm run kill:all
```

Kills both frontend and backend services.

## Port Assignments

### Frontend (Vite Dev Servers)

- **5173**: Shell (host application)
- **5174**: Auth MFE
- **5175**: Chatbot MFE
- **5176**: Admin MFE
- **5177**: Profile MFE
- **5178**: UI Components (lib build)
- **5179**: Hooks (lib build)

### Backend (Express APIs)

- **3000**: Auth Service
- **3001**: Chatbot Service
- **3002**: Admin Service

## Nx Cache Management

### Clear Cache When Needed

```bash
npm run reset
# or
npx nx reset
```

**When to clear cache:**

- Build artifacts seem stale
- After major dependency updates
- When experiencing unexpected build behavior
- After reverting code changes

## Best Practices

### 1. **Start Services Incrementally**

- Don't start all services at once
- Start only what you're actively working on
- This keeps VSCode responsive and logs manageable

### 2. **Use Individual Terminals**

- One terminal per service
- Makes it easier to restart individual services
- Clearer log separation

### 3. **Kill Processes Properly**

- Use `npm run kill:frontend` or `npm run kill:all`
- Don't rely on Ctrl+C alone (can leave orphaned processes)

### 4. **Monitor Resource Usage**

- Running 7+ Nx processes is resource-intensive
- Watch for VSCode becoming sluggish
- Close unnecessary services

### 5. **Avoid Parallel Commands During Debugging**

- Don't use `nx run-many` with high parallelism during active development
- Reserve `npm run dev:frontend` for CI/CD or production builds

## Debugging Workflow

When debugging a specific feature:

```bash
# 1. Kill all services
npm run kill:all

# 2. Clear Nx cache (if needed)
npm run reset

# 3. Start ONLY required services in separate terminals
# Terminal 1
npm run dev:shell

# Terminal 2
npm run dev:auth-mfe

# Terminal 3 (if needed)
npm run dev:backend
```

## CI/CD Usage

The `npm run dev:frontend` command is still useful for:

- Automated testing environments
- CI/CD pipelines
- Production builds
- One-time checks of all services

**Just avoid using it during active development work.**

## Troubleshooting

### VSCode is Frozen/Unresponsive

1. Open Activity Monitor (macOS) or Task Manager (Windows)
2. Kill Node processes manually
3. Run `npm run kill:all` in a regular terminal
4. Restart VSCode if needed

### Port Already in Use

```bash
# Kill specific port
lsof -ti:5173 | xargs kill -9

# Or kill all frontend ports
npm run kill:frontend
```

### Stale Build Artifacts

```bash
npm run reset
npx nx build <project-name> --skip-nx-cache
```

### HMR Not Working

1. Check if the dev server is actually running
2. Clear browser cache (hard reload: Cmd+Shift+R)
3. Clear Nx cache: `npm run reset`
4. Restart the specific service

---

**Remember:** Quality development experience > Running everything at once
