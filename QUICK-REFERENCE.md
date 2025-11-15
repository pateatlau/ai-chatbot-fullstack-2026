# 🚀 Quick Reference Card

## Essential Commands

```bash
# Development
npm run dev                    # Start all apps
npm run dev:backend            # Backend services only
npm run dev:frontend           # Frontend apps only
npm run dev:shell              # Shell app only

# Docker
npm run docker:up              # Start PostgreSQL + Redis
npm run docker:down            # Stop containers
npm run docker:logs            # View logs

# Database
npm run prisma:migrate         # Run migrations
npm run prisma:generate        # Generate Prisma Client
npm run prisma:studio          # Open Prisma Studio

# Testing
npm run test                   # Run all tests
npm run test:watch             # Watch mode

# Quality
npm run lint                   # Lint all
npm run lint:fix               # Fix issues
npm run format                 # Format code

# Nx
npm run graph                  # View project graph
nx show projects               # List all projects
nx affected --target=test      # Test affected only
```

## Application URLs

| Application | URL                   | Port |
| ----------- | --------------------- | ---- |
| Shell       | http://localhost:5173 | 5173 |
| Auth MFE    | http://localhost:5174 | 5174 |
| Chatbot MFE | http://localhost:5175 | 5175 |
| Admin MFE   | http://localhost:5176 | 5176 |
| Profile MFE | http://localhost:5177 | 5177 |
| PostgreSQL  | localhost:5432        | 5432 |
| Redis       | localhost:6379        | 6379 |

## Import Paths

```typescript
// Shared types
import { LoginSchema, type User } from '@myapp/shared/types';

// Backend libs
import { logger } from '@myapp/backend/logger';
import { metrics } from '@myapp/backend/metrics';
import { security } from '@myapp/backend/security';

// Frontend libs
import { Button } from '@myapp/frontend/ui-components';
import { apiClient } from '@myapp/frontend/api-client';
import { useAuthStore } from '@myapp/frontend/stores';
```

## Project Structure

```
apps/
  ├── Backend Services
  │   ├── auth-service
  │   ├── chatbot-service
  │   └── admin-service
  └── Frontend Apps
      ├── shell (host)
      ├── auth-mfe
      ├── chatbot-mfe
      ├── admin-mfe
      └── profile-mfe

libs/
  ├── shared/        (types, utils)
  ├── backend/       (logger, metrics, security, database)
  └── frontend/      (ui-components, api-client, stores, utils)
```

## Environment Variables

```bash
# apps/auth-service/.env
DATABASE_URL="postgresql://myapp:myapp_dev_password@localhost:5432/myapp_dev"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

## Nx Commands

```bash
# Run specific project
nx serve auth-service
nx build shell
nx test types
nx lint api-client

# Run multiple
nx run-many --target=build --all
nx run-many --target=test --projects=tag:type:backend

# Affected commands
nx affected --target=build
nx affected --target=test
nx affected:graph

# Generate code
nx generate @nx/react:component Button --project=ui-components
nx generate @nx/node:library my-lib
```

## Git Workflow

```bash
# Feature branch
git checkout -b feature/your-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature

# Commit types
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting
refactor: Code restructuring
test:     Testing
chore:    Maintenance
```

## Troubleshooting

```bash
# Clear Nx cache
npm run reset

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart Docker services
npm run docker:down
npm run docker:up

# Reset database
cd apps/auth-service
npx prisma migrate reset
```

## Keyboard Shortcuts (VS Code)

- `Cmd+Shift+P` - Command Palette
- `Cmd+P` - Quick Open
- `Cmd+B` - Toggle Sidebar
- `Ctrl+` ` - Toggle Terminal
- `Cmd+/` - Toggle Comment
- `Cmd+Shift+F` - Search in Files

---

**Keep this card handy for quick reference!** 📌
