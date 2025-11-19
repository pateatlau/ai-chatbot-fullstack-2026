# 🚀 Phase 2, Part 3 - CHATBOT SUBGRAPH IMPLEMENTATION

**Phase:** Phase 2, Part 3  
**Timeline:** Days 3-4 of Week 2  
**Estimated Hours:** 8 hours  
**Status:** 🟡 READY TO START

---

## 📋 Objective

Implement GraphQL support for the Chatbot Service with Apollo Federation, enabling real-time conversation and message management through the unified GraphQL Gateway.

---

## 🎯 Implementation Tasks

### Task 1: Create GraphQL Schema (chatbot-service)

**File:** `apps/chatbot-service/src/graphql/schema.ts`

Create a new file with the following schema:

```typescript
import { gql } from '@apollo/server';

export const typeDefs = gql`
  # Federation directive
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0")
    @link(url: "https://specs.apollo.dev/core/v0.1")

  # Reference external User type from auth-service
  extend type User @key(fields: "id") {
    id: ID! @external
    conversations: [Conversation!]!
  }

  # Conversation entity
  type Conversation @key(fields: "id") {
    id: ID!
    userId: String!
    user: User!
    title: String!
    messageCount: Int!
    lastMessage: String
    lastMessageDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    messages: [Message!]!
  }

  # Message entity
  type Message @key(fields: "id") {
    id: ID!
    conversationId: String!
    conversation: Conversation!
    role: MessageRole!
    content: String!
    tokenUsage: Int
    createdAt: DateTime!
    deletedAt: DateTime
  }

  # Message role enum
  enum MessageRole {
    USER
    ASSISTANT
  }

  # Scalar for DateTime
  scalar DateTime

  # Chat statistics
  type ChatStats {
    totalConversations: Int!
    totalMessages: Int!
    totalTokensUsed: Int!
    averageMessagesPerConversation: Float!
    activeConversations: Int!
  }

  # Send message response (with streaming support)
  type SendMessageResponse {
    success: Boolean!
    message: Message
    conversationId: String!
  }

  # Conversation input types
  input CreateConversationInput {
    title: String
  }

  input UpdateConversationInput {
    title: String!
  }

  input SendMessageInput {
    content: String!
  }

  input PaginationInput {
    page: Int
    limit: Int
  }

  # Query type
  type Query {
    # Get user's conversations (paginated)
    conversations(input: PaginationInput): [Conversation!]!

    # Get single conversation with messages
    conversation(id: ID!): Conversation

    # Get conversation messages (paginated)
    conversationMessages(
      conversationId: ID!
      input: PaginationInput
    ): [Message!]!

    # Get user chat statistics
    chatStats: ChatStats!

    # Search conversations by title
    searchConversations(query: String!): [Conversation!]!

    # Health check for subgraph
    health: String!
  }

  # Mutation type
  type Mutation {
    # Conversation management
    createConversation(input: CreateConversationInput): Conversation!
    updateConversation(id: ID!, input: UpdateConversationInput!): Conversation!
    deleteConversation(id: ID!): Conversation!

    # Message management
    sendMessage(
      conversationId: ID!
      input: SendMessageInput!
    ): SendMessageResponse!
    deleteMessage(id: ID!): Message!
  }

  # Subscription type (for real-time updates)
  type Subscription {
    # Real-time message streaming
    messageReceived(conversationId: ID!): Message!

    # Conversation updates
    conversationUpdated(userId: ID!): Conversation!
  }
`;
```

**Rationale:**

- Extends User type from Auth Service (federation)
- Defines Conversation and Message entities with @key
- Includes pagination for performance
- Supports both conversations list and individual messages
- Ready for SSE streaming integration

---

### Task 2: Implement GraphQL Resolvers

**File:** `apps/chatbot-service/src/graphql/resolvers.ts`

Create a new file with complete resolvers:

```typescript
import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';

const prisma = new PrismaClient();

interface AuthContext {
  userId?: string;
  user?: any;
  token?: string;
}

interface PaginationInput {
  page?: number;
  limit?: number;
}

export const resolvers = {
  Query: {
    // Get user's conversations (paginated)
    conversations: async (_parent: any, args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const page = args.input?.page || 1;
      const limit = args.input?.limit || 20;
      const skip = (page - 1) * limit;

      return prisma.conversation.findMany({
        where: {
          userId: context.userId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    },

    // Get single conversation with messages
    conversation: async (
      _parent: any,
      args: { id: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: args.id },
        include: {
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation) {
        throw new GraphQLError('Conversation not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return conversation;
    },

    // Get conversation messages (paginated)
    conversationMessages: async (
      _parent: any,
      args: { conversationId: string; input: PaginationInput },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const page = args.input?.page || 1;
      const limit = args.input?.limit || 50;
      const skip = (page - 1) * limit;

      // Verify conversation belongs to user
      const conversation = await prisma.conversation.findUnique({
        where: { id: args.conversationId },
      });

      if (!conversation || conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.message.findMany({
        where: {
          conversationId: args.conversationId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      });
    },

    // Get user chat statistics
    chatStats: async (_parent: any, _args: any, context: AuthContext) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const [conversations, messages, tokenData] = await Promise.all([
        prisma.conversation.count({
          where: { userId: context.userId, deletedAt: null },
        }),
        prisma.message.count({
          where: { conversation: { userId: context.userId } },
        }),
        prisma.message.aggregate({
          where: { conversation: { userId: context.userId } },
          _sum: { tokenUsage: true },
        }),
      ]);

      const activeConversations = await prisma.conversation.count({
        where: {
          userId: context.userId,
          deletedAt: null,
          messages: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      });

      return {
        totalConversations: conversations,
        totalMessages: messages,
        totalTokensUsed: tokenData._sum.tokenUsage || 0,
        averageMessagesPerConversation:
          conversations > 0 ? messages / conversations : 0,
        activeConversations,
      };
    },

    // Search conversations by title
    searchConversations: async (
      _parent: any,
      args: { query: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return prisma.conversation.findMany({
        where: {
          userId: context.userId,
          deletedAt: null,
          title: { contains: args.query, mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    },

    // Health check
    health: () => 'Chatbot Subgraph OK',
  },

  Mutation: {
    // Create conversation
    createConversation: async (
      _parent: any,
      args: { input?: { title?: string } },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return prisma.conversation.create({
        data: {
          userId: context.userId,
          title:
            args.input?.title ||
            `Conversation ${new Date().toLocaleDateString()}`,
        },
      });
    },

    // Update conversation
    updateConversation: async (
      _parent: any,
      args: { id: string; input: { title: string } },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: args.id },
      });

      if (!conversation || conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.conversation.update({
        where: { id: args.id },
        data: { title: args.input.title },
      });
    },

    // Delete conversation (soft delete)
    deleteConversation: async (
      _parent: any,
      args: { id: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: args.id },
      });

      if (!conversation || conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.conversation.update({
        where: { id: args.id },
        data: { deletedAt: new Date() },
      });
    },

    // Send message
    sendMessage: async (
      _parent: any,
      args: { conversationId: string; input: { content: string } },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!args.input.content || args.input.content.length === 0) {
        throw new GraphQLError('Message content cannot be empty', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      if (args.input.content.length > 10000) {
        throw new GraphQLError('Message content exceeds 10000 characters', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Verify conversation belongs to user
      const conversation = await prisma.conversation.findUnique({
        where: { id: args.conversationId },
      });

      if (!conversation || conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Create user message
      const userMessage = await prisma.message.create({
        data: {
          conversationId: args.conversationId,
          role: 'USER',
          content: args.input.content,
        },
      });

      // TODO: Call OpenAI API and create assistant message via SSE streaming
      // For now, return success response

      return {
        success: true,
        message: userMessage,
        conversationId: args.conversationId,
      };
    },

    // Delete message (soft delete)
    deleteMessage: async (
      _parent: any,
      args: { id: string },
      context: AuthContext
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const message = await prisma.message.findUnique({
        where: { id: args.id },
        include: { conversation: true },
      });

      if (!message || message.conversation.userId !== context.userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return prisma.message.update({
        where: { id: args.id },
        data: { deletedAt: new Date() },
      });
    },
  },

  // Federation type extension resolvers
  User: {
    __resolveReference: async (user: { id: string }) => {
      return {
        id: user.id,
        conversations: await prisma.conversation.findMany({
          where: { userId: user.id, deletedAt: null },
        }),
      };
    },
  },

  // Field resolvers
  Conversation: {
    user: async (parent: any) => {
      // Reference to User from auth-service
      return { __typename: 'User', id: parent.userId };
    },
    messageCount: async (parent: any) => {
      return prisma.message.count({
        where: { conversationId: parent.id, deletedAt: null },
      });
    },
    messages: async (parent: any) => {
      return prisma.message.findMany({
        where: { conversationId: parent.id, deletedAt: null },
        orderBy: { createdAt: 'asc' },
      });
    },
  },

  Message: {
    conversation: async (parent: any) => {
      return prisma.conversation.findUnique({
        where: { id: parent.conversationId },
      });
    },
  },
};
```

---

### Task 3: Update Chatbot Service Main Entry Point

**File:** `apps/chatbot-service/src/main.ts`

Add GraphQL support (similar to auth-service):

```typescript
// Add these imports at the top
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

// After existing middleware, add JWT context builder
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

// Initialize Apollo Server
let apolloServer: ApolloServer;

const startApolloServer = async () => {
  apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();
  return apolloServer;
};

// In startServer function, after other middleware setup:
const startServer = async () => {
  try {
    // Start Apollo Server
    await startApolloServer();

    // Mount Apollo GraphQL middleware (BEFORE listening)
    app.use(
      '/graphql',
      expressMiddleware(apolloServer, {
        context: async ({ req }) => buildContext(req),
      })
    );

    // Then start Express server
    app.listen(port, host, () => {
      console.log(
        `[ ready ] Chatbot Service running at http://${host}:${port}`
      );
      console.log(
        `[ ready ] GraphQL endpoint at http://${host}:${port}/graphql`
      );
      console.log(`[ ready ] REST API at http://${host}:${port}/api/chat`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

---

### Task 4: Verify Package Dependencies

**File:** `package.json`

Ensure these Apollo packages are present (added in Phase 2.1):

```json
{
  "dependencies": {
    "@apollo/server": "^4.10.0",
    "@apollo/gateway": "^2.7.0",
    "@apollo/subgraph": "^2.7.0"
  },
  "devDependencies": {
    "@apollo/client": "^3.8.0"
  }
}
```

If missing, they should already be there from Gateway setup. Verify with:

```bash
grep -A 2 '@apollo' package.json
```

---

### Task 5: Test Chatbot Subgraph Integration

**Commands to Run:**

```bash
# Build chatbot service
nx build chatbot-service

# Start chatbot service
nx serve chatbot-service

# In another terminal, verify GraphQL endpoint
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{health}"}'

# Expected response:
# {"data":{"health":"Chatbot Subgraph OK"}}
```

**Test Query (Authenticated):**

```graphql
query {
  conversations(input: { page: 1, limit: 10 }) {
    id
    title
    messageCount
    createdAt
  }
}
```

**Test Mutation (Create Conversation):**

```graphql
mutation {
  createConversation(input: { title: "My First Chat" }) {
    id
    title
    userId
    createdAt
  }
}
```

---

### Task 6: Gateway Integration Testing

**Commands:**

```bash
# Terminal 1: Start Auth Service
nx serve auth-service

# Terminal 2: Start Chatbot Service
nx serve chatbot-service

# Terminal 3: Start Gateway
nx serve graphql-gateway

# Terminal 4: Test gateway health
curl http://localhost:4000/health

# Expected: Gateway should show "Auth Subgraph connected" and "Chatbot Subgraph connected"
```

**Test Cross-Service Query (through Gateway):**

```graphql
query {
  me {
    id
    email
    conversations {
      id
      title
      messageCount
    }
  }
}
```

This query:

1. Starts in Auth Subgraph (`me` query)
2. References User from Auth Service
3. Gateway follows reference to Chatbot Service
4. Returns conversations for the user
5. Single unified response

---

## 📋 Checklist

- [ ] Create `apps/chatbot-service/src/graphql/schema.ts`
- [ ] Create `apps/chatbot-service/src/graphql/resolvers.ts`
- [ ] Update `apps/chatbot-service/src/main.ts` with GraphQL setup
- [ ] Verify packages in `package.json` (should already be there)
- [ ] Build chatbot service: `nx build chatbot-service`
- [ ] Test health check: `curl http://localhost:3001/graphql`
- [ ] Test queries and mutations
- [ ] Start all 3 services (Auth, Chatbot, Gateway)
- [ ] Verify gateway can see both subgraphs
- [ ] Test cross-service query through gateway
- [ ] Commit changes: `git add . && git commit -m "feat(graphql): Phase 2.3 - Chatbot Subgraph Implementation"`
- [ ] Create Phase 2.3 completion document

---

## 🚀 Implementation Tips

1. **Start with schema:** Make sure schema compiles before implementing resolvers
2. **Copy patterns from Auth Service:** Use similar error handling and context patterns
3. **Test incrementally:** Get one query working, then add more
4. **Check Prisma models:** Ensure your queries match the Prisma schema
5. **Verify authentication:** All queries should check `context.userId`
6. **Test federation:** User reference resolver is critical for cross-service queries

---

## 🐛 Common Issues & Solutions

### GraphQL Port Conflict

```bash
# Check if port 3001 is in use
lsof -i :3001
# Kill process if needed
kill -9 <PID>
```

### Schema Validation Error

```bash
# Verify schema syntax
npm run build:chatbot-service
# Check for typos in typeDefs
```

### Federation Reference Error

```bash
# Ensure @key directive is present
# Check User type extends correctly
# Verify __resolveReference is implemented
```

### Prisma Client Not Found

```bash
# Regenerate Prisma client
npx prisma generate

# Or use npm script
npm run prisma:generate:all
```

---

## ⏱️ Timeline

- **Task 1 & 2:** 2-3 hours (schema + resolvers)
- **Task 3 & 4:** 1-2 hours (integration)
- **Task 5 & 6:** 2-3 hours (testing)
- **Total:** ~8 hours

---

## 📞 Next Steps After Completion

1. ✅ Test all three services (Auth, Chatbot, Gateway)
2. ✅ Verify gateway composition with both subgraphs
3. 📝 Create Phase 2.3 completion document
4. 🔄 Move to Phase 2.4 - Admin Subgraph
5. 📊 Update master roadmap with progress

---

**Phase:** Phase 2, Part 3 - Chatbot Subgraph  
**Status:** 🟡 Ready to Implement  
**Estimated Time:** 8 hours  
**Difficulty:** Medium  
**Dependencies:** Phase 2.1 & 2.2 Complete
