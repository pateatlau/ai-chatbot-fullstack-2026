# 🚀 PHASE 2.4 - ADMIN SUBGRAPH IMPLEMENTATION PLAN

**Phase:** Phase 2, Part 4  
**Timeline:** ~4 hours  
**Status:** 🟡 READY TO START  
**Difficulty:** Medium

---

## 📋 Quick Overview

The Admin Subgraph provides service-level administration capabilities through GraphQL Federation. It enables admin users to:

- Manage user roles and permissions
- View system statistics and health
- Manage service configurations
- Access audit logs

This is the final subgraph before moving to frontend integration.

---

## 🎯 Implementation Tasks

### Task 1: Create Admin GraphQL Schema

**File:** `apps/admin-service/src/graphql/schema.ts`

```typescript
import gql from 'graphql-tag';

export const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0")
    @link(url: "https://specs.apollo.dev/core/v0.1")

  # Extend User from Auth Service
  extend type User @key(fields: "id") {
    id: ID! @external
    role: UserRole!
    permissions: [String!]!
  }

  # Admin-specific user role
  enum UserRole {
    SUPER_ADMIN
    ADMIN
    MODERATOR
    USER
  }

  # Service admin type
  type Admin @key(fields: "id") {
    id: ID!
    userId: String!
    user: User!
    role: UserRole!
    permissions: [String!]!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # System statistics
  type SystemStats {
    totalUsers: Int!
    totalConversations: Int!
    totalMessages: Int!
    activeUsers24h: Int!
    totalTokensUsed: Int!
    averageResponseTime: Float!
    systemUptime: Int!
  }

  # Audit log entry
  type AuditLog @key(fields: "id") {
    id: ID!
    userId: String!
    action: String!
    resource: String!
    changes: String!
    timestamp: DateTime!
  }

  # Scalar
  scalar DateTime

  # Input types
  input AssignRoleInput {
    userId: ID!
    role: UserRole!
  }

  input UpdatePermissionsInput {
    userId: ID!
    permissions: [String!]!
  }

  # Query
  type Query {
    # Admin queries
    admin(id: ID!): Admin
    admins(input: PaginationInput): [Admin!]!

    # System management
    systemStats: SystemStats!
    auditLogs(input: PaginationInput): [AuditLog!]!

    # Health and metrics
    health: String!
  }

  # Mutation
  type Mutation {
    # Role management
    assignRole(input: AssignRoleInput!): Admin!
    updatePermissions(input: UpdatePermissionsInput!): Admin!
    removeAdmin(userId: ID!): Admin!

    # System management
    clearAuditLogs(beforeDate: DateTime!): Boolean!
  }

  # Input
  input PaginationInput {
    page: Int
    limit: Int
  }
`;
```

---

### Task 2: Implement Admin Resolvers

**File:** `apps/admin-service/src/graphql/resolvers.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';

const prisma = new PrismaClient();

interface AuthContext {
  userId?: string;
  token?: string;
}

interface PaginationInput {
  page?: number;
  limit?: number;
}

export const resolvers = {
  Query: {
    admin: async (_parent: any, args: { id: string }, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester || requester.role !== 'SUPER_ADMIN') {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.admin.findUnique({
        where: { id: args.id },
      });
    },

    admins: async (_parent: any, args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester) {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const page = args.input?.page || 1;
      const limit = args.input?.limit || 20;
      const skip = (page - 1) * limit;

      return prisma.admin.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });
    },

    systemStats: async (_parent: any, _args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester) {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // TODO: Aggregate stats from all services
      // This requires cross-service communication
      // For now, return placeholder stats

      return {
        totalUsers: 0,
        totalConversations: 0,
        totalMessages: 0,
        activeUsers24h: 0,
        totalTokensUsed: 0,
        averageResponseTime: 0,
        systemUptime: Math.floor(process.uptime()),
      };
    },

    auditLogs: async (_parent: any, args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester) {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const page = args.input?.page || 1;
      const limit = args.input?.limit || 50;
      const skip = (page - 1) * limit;

      return prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      });
    },

    health: () => 'Admin Subgraph OK',
  },

  Mutation: {
    assignRole: async (
      _parent: any,
      args: { input: { userId: string; role: string } },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is super admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester || requester.role !== 'SUPER_ADMIN') {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Create or update admin record
      const admin = await prisma.admin.upsert({
        where: { userId: args.input.userId },
        update: { role: args.input.role },
        create: {
          userId: args.input.userId,
          role: args.input.role,
          permissions: [],
          isActive: true,
        },
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId: context.userId,
          action: 'ASSIGN_ROLE',
          resource: `User:${args.input.userId}`,
          changes: JSON.stringify({ role: args.input.role }),
        },
      });

      return admin;
    },

    updatePermissions: async (
      _parent: any,
      args: { input: { userId: string; permissions: string[] } },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is super admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester || requester.role !== 'SUPER_ADMIN') {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const admin = await prisma.admin.update({
        where: { userId: args.input.userId },
        data: { permissions: args.input.permissions },
      });

      return admin;
    },

    removeAdmin: async (
      _parent: any,
      args: { userId: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is super admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester || requester.role !== 'SUPER_ADMIN') {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.admin.update({
        where: { userId: args.userId },
        data: { isActive: false },
      });
    },

    clearAuditLogs: async (
      _parent: any,
      args: { beforeDate: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify requester is super admin
      const requester = await prisma.admin.findUnique({
        where: { userId: context.userId },
      });

      if (!requester || requester.role !== 'SUPER_ADMIN') {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await prisma.auditLog.deleteMany({
        where: {
          timestamp: { lt: new Date(args.beforeDate) },
        },
      });

      return true;
    },
  },

  User: {
    __resolveReference: async (user: { id: string }) => {
      const admin = await prisma.admin.findUnique({
        where: { userId: user.id },
      });

      return {
        id: user.id,
        role: admin?.role || 'USER',
        permissions: admin?.permissions || [],
      };
    },
  },
};
```

---

### Task 3: Update Admin Service Main

**File:** `apps/admin-service/src/main.ts`

Add Apollo Server integration following the same pattern as Chatbot Service:

```typescript
// Add imports
import jwt from 'jsonwebtoken';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

// Add JWT context builder (same as chatbot-service)
const buildContext = (req: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  let userId: string | undefined;

  if (token) {
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret'
      );
      userId = decoded.userId;
    } catch (err) {
      // Token invalid or expired
    }
  }

  return { userId, token };
};

// Initialize Apollo Server and mount middleware
// (See Chatbot Service main.ts for full implementation pattern)
```

---

### Task 4: Verify Prisma Schema

Check that `apps/admin-service/prisma/schema.prisma` has Admin and AuditLog models:

```prisma
model Admin {
  id        String   @id @default(uuid())
  userId    String   @unique
  role      String   // SUPER_ADMIN, ADMIN, MODERATOR
  permissions String[]
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([role])
  @@map("admins")
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  action    String   // ASSIGN_ROLE, UPDATE_PERMISSIONS, etc
  resource  String   // What was changed (e.g., User:123)
  changes   String   @db.Text // JSON of changes
  timestamp DateTime @default(now())

  @@index([userId, timestamp])
  @@index([action, timestamp])
  @@map("audit_logs")
}
```

---

### Task 5: Build & Test

```bash
# Build admin service
nx build admin-service

# Start admin service
npm run dev:admin

# Test health endpoint
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{health}"}'

# Test with all 3 services
npm run dev:auth       # Terminal 1 (3000)
npm run dev:chatbot    # Terminal 2 (3001)
npm run dev:admin      # Terminal 3 (3002)
npm run dev:gateway    # Terminal 4 (4000)

# Test cross-service query
curl -X POST http://localhost:4000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "{ me { id email role permissions } }"
  }'
```

---

## 🔑 Key Differences from Chatbot Service

| Aspect            | Chatbot                 | Admin             |
| ----------------- | ----------------------- | ----------------- |
| **Access Level**  | All authenticated users | Admin users only  |
| **Authorization** | User ownership checks   | Role-based checks |
| **Data Scope**    | Per-user conversations  | System-wide data  |
| **Models**        | Conversation, Message   | Admin, AuditLog   |
| **Audit Trail**   | Optional                | Required          |
| **Rate Limiting** | Standard                | Higher limits     |

---

## 📋 Checklist

- [ ] Create `apps/admin-service/src/graphql/schema.ts`
- [ ] Create `apps/admin-service/src/graphql/resolvers.ts`
- [ ] Update `apps/admin-service/src/main.ts` with Apollo
- [ ] Verify/create Prisma models (Admin, AuditLog)
- [ ] Run `nx build admin-service`
- [ ] Test health endpoint
- [ ] Start all 3 services + gateway
- [ ] Test cross-service queries
- [ ] Create completion document
- [ ] Commit changes
- [ ] Update master roadmap

---

## 🚀 After Completion

Once Admin Subgraph is complete:

1. All 3 GraphQL subgraphs will be ready
2. Gateway will have full federation setup
3. Can proceed to Phase 3: Frontend Apollo Client Integration
4. Then Phase 4: Testing & Production Deployment

**Estimated Total Time:** ~4 hours  
**Estimated Project Completion:** ~99% done (only frontend+testing remain)

---

**Ready to Begin?** 🚀

When ready, start with Task 1: Create Admin GraphQL Schema file
