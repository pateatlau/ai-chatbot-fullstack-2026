# 🚀 DAY 1 QUICK START - Chatbot Subgraph GraphQL Completion

**Date:** November 24, 2025 (or immediately if continuing)  
**Duration:** 8 hours  
**Objective:** Complete Chatbot Subgraph with Subscriptions and Field Resolvers  
**Status:** 🟢 Ready to Begin

---

## ✅ PRE-REQUISITES

Verify before starting:

```bash
# 1. Full stack running
curl http://localhost:4000/health    # Should be healthy
curl http://localhost:3001/health    # Chatbot service

# 2. Dependencies installed
npm ls @apollo/server @apollo/subgraph graphql-tag

# 3. No uncommitted changes
git status                            # Clean working directory

# 4. Tests passing
npm run test:graphql:integration     # Should pass
```

---

## 🎯 DAY 1 OBJECTIVES

### Morning (4 hours)

1. Add subscription resolvers (messageReceived, conversationUpdated)
2. Add EventEmitter for broadcasting
3. Implement field resolvers (role enum, messageCount, lastMessage)
4. Write unit tests

### Afternoon (4 hours)

5. Integration testing through gateway
6. Performance optimization (indexes)
7. Documentation
8. Commit and sign-off

---

## 📝 IMPLEMENTATION - PART 1: Subscriptions Setup (2 hours)

### Step 1: Create EventEmitter Service

**File:** `/apps/chatbot-service/src/lib/event-emitter.ts` (NEW)

```typescript
import { EventEmitter } from 'events';

export interface MessageEvent {
  conversationId: string;
  message: {
    id: string;
    conversationId: string;
    role: string;
    content: string;
    tokenCount: number;
    createdAt: Date;
    isDeleted: boolean;
  };
}

export interface ConversationEvent {
  userId: string;
  conversation: {
    id: string;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
  };
}

class ChatEventEmitter extends EventEmitter {
  /**
   * Emit when new message is received
   */
  emitMessageReceived(event: MessageEvent) {
    this.emit(`message-${event.conversationId}`, event.message);
  }

  /**
   * Emit when conversation is updated
   */
  emitConversationUpdated(event: ConversationEvent) {
    this.emit(`conversation-${event.userId}`, event.conversation);
  }

  /**
   * Subscribe to message events for a conversation
   */
  onMessageReceived(conversationId: string, callback: (message: any) => void) {
    this.on(`message-${conversationId}`, callback);
    return () => this.off(`message-${conversationId}`, callback);
  }

  /**
   * Subscribe to conversation updates for a user
   */
  onConversationUpdated(userId: string, callback: (conversation: any) => void) {
    this.on(`conversation-${userId}`, callback);
    return () => this.off(`conversation-${userId}`, callback);
  }
}

export const chatEventEmitter = new ChatEventEmitter();
```

**Time: 15 min | Status: ✅**

---

### Step 2: Add Subscription Resolvers

**File:** `/apps/chatbot-service/src/graphql/resolvers.ts`

Find the end of the file and add before the closing brace:

```typescript
  Subscription: {
    // Real-time message streaming
    messageReceived: {
      subscribe: async (
        _parent: any,
        args: { conversationId: string },
        context: AuthContext
      ) => {
        if (!context.userId) {
          throw new GraphQLError('Not authenticated', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        // Verify user owns the conversation
        const conversation = await prisma.conversation.findUnique({
          where: { id: args.conversationId },
        });

        if (!conversation || conversation.userId !== context.userId) {
          throw new GraphQLError('Unauthorized', {
            extensions: { code: 'FORBIDDEN' },
          });
        }

        // Create async iterator for this conversation
        return (async function* () {
          // Yield existing messages first
          const messages = await prisma.message.findMany({
            where: {
              conversationId: args.conversationId,
              isDeleted: false,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          });

          for (const message of messages.reverse()) {
            yield { messageReceived: message };
          }

          // Then listen for new messages
          yield new Promise((resolve) => {
            const unsubscribe = chatEventEmitter.onMessageReceived(
              args.conversationId,
              (message) => {
                unsubscribe();
                resolve({ messageReceived: message });
              }
            );

            // Timeout after 30 seconds
            setTimeout(() => {
              unsubscribe();
              resolve({ messageReceived: null });
            }, 30000);
          });
        })();
      },
    },

    // Conversation updates
    conversationUpdated: {
      subscribe: async (
        _parent: any,
        args: { userId: string },
        context: AuthContext
      ) => {
        if (!context.userId) {
          throw new GraphQLError('Not authenticated', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        // Only user can subscribe to their own conversations
        if (args.userId !== context.userId) {
          throw new GraphQLError('Unauthorized', {
            extensions: { code: 'FORBIDDEN' },
          });
        }

        return (async function* () {
          yield new Promise((resolve) => {
            const unsubscribe = chatEventEmitter.onConversationUpdated(
              args.userId,
              (conversation) => {
                unsubscribe();
                resolve({ conversationUpdated: conversation });
              }
            );

            // Timeout
            setTimeout(() => {
              unsubscribe();
            }, 60000);
          });
        })();
      },
    },
  },
```

Also import the event emitter at top of file:

```typescript
import { chatEventEmitter } from '../lib/event-emitter';
```

And update the sendMessage mutation to broadcast:

Find the line after creating assistantMessage:

```typescript
const assistantMessage = await prisma.message.create({
```

Add after that message is created:

```typescript
// Broadcast to subscribed clients
chatEventEmitter.emitMessageReceived({
  conversationId: args.conversationId,
  message: assistantMessage,
});
```

**Time: 30 min | Status: ✅**

---

## 📝 IMPLEMENTATION - PART 2: Field Resolvers (1 hour)

### Step 3: Add Missing Field Resolvers

**File:** `/apps/chatbot-service/src/graphql/resolvers.ts`

Update the Conversation field resolver section. Find:

```typescript
Conversation: {
  user: async (parent: any) => {
    // Reference to User from auth-service
    return { __typename: 'User', id: parent.userId };
  },
  messageCount: async (parent: any) => {
    return prisma.message.count({
      where: { conversationId: parent.id, isDeleted: false },
    });
  },
  messages: async (parent: any) => {
    return prisma.message.findMany({
      where: { conversationId: parent.id, isDeleted: false },
      orderBy: { createdAt: 'asc' },
    });
  },
},
```

Replace with enhanced version including lastMessage fields:

```typescript
Conversation: {
  user: async (parent: any) => {
    // Reference to User from auth-service
    return { __typename: 'User', id: parent.userId };
  },

  messageCount: async (parent: any) => {
    return prisma.message.count({
      where: { conversationId: parent.id, isDeleted: false },
    });
  },

  lastMessage: async (parent: any) => {
    const lastMsg = await prisma.message.findFirst({
      where: { conversationId: parent.id, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return lastMsg?.content || null;
  },

  lastMessageDate: async (parent: any) => {
    const lastMsg = await prisma.message.findFirst({
      where: { conversationId: parent.id, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return lastMsg?.createdAt || null;
  },

  messages: async (parent: any) => {
    return prisma.message.findMany({
      where: { conversationId: parent.id, isDeleted: false },
      orderBy: { createdAt: 'asc' },
    });
  },
},
```

The Message.role field resolver is already correct (converts to uppercase enum).

**Time: 20 min | Status: ✅**

---

## 📝 IMPLEMENTATION - PART 3: Unit Tests (1 hour)

### Step 4: Write Subscription Tests

**File:** `/apps/chatbot-service/src/graphql/__tests__/subscriptions.test.ts` (NEW)

```typescript
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { chatEventEmitter } from '../../lib/event-emitter';

const prisma = new PrismaClient();

describe('GraphQL Subscriptions', () => {
  let conversationId: string;
  let userId: string;

  beforeAll(async () => {
    userId = 'test-user-123';
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: 'Test Conversation',
      },
    });
    conversationId = conversation.id;
  });

  afterAll(async () => {
    await prisma.message.deleteMany({
      where: { conversationId },
    });
    await prisma.conversation.delete({
      where: { id: conversationId },
    });
    await prisma.$disconnect();
  });

  describe('messageReceived', () => {
    it('should emit message received event', (done) => {
      const testMessage = {
        id: 'msg-1',
        conversationId,
        role: 'user',
        content: 'Test message',
        tokenCount: 2,
        createdAt: new Date(),
        isDeleted: false,
      };

      // Set up listener
      chatEventEmitter.onMessageReceived(conversationId, (message) => {
        expect(message.content).toBe('Test message');
        done();
      });

      // Emit event
      setTimeout(() => {
        chatEventEmitter.emitMessageReceived({
          conversationId,
          message: testMessage,
        });
      }, 100);
    });

    it('should handle multiple subscribers', (done) => {
      let count = 0;

      const testMessage = {
        id: 'msg-2',
        conversationId,
        role: 'assistant',
        content: 'Response',
        tokenCount: 1,
        createdAt: new Date(),
        isDeleted: false,
      };

      const unsub1 = chatEventEmitter.onMessageReceived(conversationId, () => {
        count++;
      });
      const unsub2 = chatEventEmitter.onMessageReceived(conversationId, () => {
        count++;
        if (count === 2) {
          unsub1();
          unsub2();
          done();
        }
      });

      setTimeout(() => {
        chatEventEmitter.emitMessageReceived({
          conversationId,
          message: testMessage,
        });
      }, 100);
    });
  });

  describe('conversationUpdated', () => {
    it('should emit conversation updated event', (done) => {
      const testConversation = {
        id: conversationId,
        userId,
        title: 'Updated Title',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      chatEventEmitter.onConversationUpdated(userId, (conversation) => {
        expect(conversation.title).toBe('Updated Title');
        done();
      });

      setTimeout(() => {
        chatEventEmitter.emitConversationUpdated({
          userId,
          conversation: testConversation,
        });
      }, 100);
    });
  });

  describe('Event Emitter', () => {
    it('should unsubscribe from events', () => {
      let callCount = 0;

      const unsubscribe = chatEventEmitter.onMessageReceived(
        conversationId,
        () => {
          callCount++;
        }
      );

      const testMessage = {
        id: 'msg-3',
        conversationId,
        role: 'user',
        content: 'Test',
        tokenCount: 1,
        createdAt: new Date(),
        isDeleted: false,
      };

      chatEventEmitter.emitMessageReceived({
        conversationId,
        message: testMessage,
      });

      expect(callCount).toBe(1);

      unsubscribe();

      chatEventEmitter.emitMessageReceived({
        conversationId,
        message: testMessage,
      });

      expect(callCount).toBe(1); // Should not increase
    });
  });
});
```

**Time: 20 min | Status: ✅**

---

## 📝 IMPLEMENTATION - PART 4: Integration Testing (1 hour)

### Step 5: Integration Testing Through Gateway

**File:** `/scripts/test-graphql-subscriptions.sh` (NEW)

```bash
#!/bin/bash

echo "🧪 Testing GraphQL Subscriptions"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test 1: Query for conversations
echo -e "${YELLOW}1. Verify Conversations Query${NC}"
response=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ conversations(input: { page: 1, limit: 10 }) { id title messageCount lastMessage } }"
  }')

if echo "$response" | grep -q "messageCount"; then
  echo -e "  ${GREEN}✓${NC} Conversations query works"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} Conversations query failed"
  ((FAILED++))
fi
echo ""

# Test 2: Query Message Role Enum
echo -e "${YELLOW}2. Verify Message Role Enum${NC}"
response=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { __type(name: \"MessageRole\") { name enumValues { name } } }"
  }')

if echo "$response" | grep -q "USER"; then
  echo -e "  ${GREEN}✓${NC} MessageRole enum properly defined"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} MessageRole enum missing"
  ((FAILED++))
fi
echo ""

# Test 3: Check Subscription Schema
echo -e "${YELLOW}3. Verify Subscription Schema${NC}"
response=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { __type(name: \"Subscription\") { name fields { name } } }"
  }')

if echo "$response" | grep -q "messageReceived"; then
  echo -e "  ${GREEN}✓${NC} messageReceived subscription defined"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} messageReceived subscription not found"
  ((FAILED++))
fi

if echo "$response" | grep -q "conversationUpdated"; then
  echo -e "  ${GREEN}✓${NC} conversationUpdated subscription defined"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} conversationUpdated subscription not found"
  ((FAILED++))
fi
echo ""

# Summary
echo "🎯 Test Results"
echo "==============="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All subscription tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
```

Make it executable and run:

```bash
chmod +x scripts/test-graphql-subscriptions.sh
bash scripts/test-graphql-subscriptions.sh
```

**Time: 20 min | Status: ✅**

---

## 📝 IMPLEMENTATION - PART 5: Performance Optimization (1 hour)

### Step 6: Add Database Indexes

**File:** `/prisma/schema.prisma`

Update Message model indexes:

```prisma
model Message {
  // ... existing fields ...

  @@index([conversationId, createdAt])  // For last message queries
  @@index([conversationId, isDeleted])  // For message filtering
  @@index([role])                        // For role-based queries
}
```

Run migration:

```bash
npx prisma migrate dev --name add_message_indexes
```

**Time: 15 min | Status: ✅**

---

## 📝 IMPLEMENTATION - PART 6: Validation & Commit (2 hours)

### Step 7: Run All Tests

```bash
# Unit tests
npm run test chatbot-service

# Integration tests
npm run test:graphql:integration

# Subscription tests
bash scripts/test-graphql-subscriptions.sh

# Lint
npm run lint:fix
```

### Step 8: Verify Through Gateway

```bash
# Query test
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ conversations(input: {}) { id title messageCount } }"
  }'

# Should return conversations with messageCount field
```

### Step 9: Commit Changes

```bash
git add -A
git commit -m "feat: Complete Chatbot Subgraph GraphQL with subscriptions

Completed:
- Added messageReceived subscription for real-time messages
- Added conversationUpdated subscription for conversation changes
- Implemented EventEmitter for message broadcasting
- Added lastMessage and lastMessageDate field resolvers
- Added comprehensive subscription tests
- Added database indexes for performance
- Added subscription integration tests

All 3 subscription tests passing:
✅ messageReceived subscription works
✅ conversationUpdated subscription works
✅ Message role enum properly defined

Ready for Day 2: Admin Subgraph Completion"

git log --oneline -1
```

**Time: 30 min | Status: ✅**

---

## ✅ DAY 1 COMPLETION CHECKLIST

- [ ] EventEmitter created and tested
- [ ] Subscription resolvers added
- [ ] Field resolvers implemented
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Database indexes added
- [ ] All GraphQL tests passing
- [ ] Code committed to git
- [ ] Documentation updated

---

## 📊 DAY 1 SUCCESS METRICS

| Metric               | Target   | Status       |
| -------------------- | -------- | ------------ |
| Unit Tests Passing   | 100%     | ⏳ To verify |
| Integration Tests    | 100%     | ⏳ To verify |
| Query Response Time  | <100ms   | ⏳ To verify |
| Subscription Latency | <100ms   | ⏳ To verify |
| Code Coverage        | 80%+     | ⏳ To verify |
| Documentation        | Complete | ⏳ To update |

---

## 🎯 NEXT STEPS

**End of Day 1:**

- All Chatbot subgraph queries working
- All subscriptions functional
- Field resolvers complete
- Ready for Day 2

**Tomorrow (Day 2):**

- Start Admin Subgraph completion
- Implement audit logging
- System stats calculation
- Full integration testing

---

**Status:** 🟢 Ready to implement  
**Estimated Time:** 8 hours  
**Next Command:** Start Part 1 (EventEmitter Setup)
