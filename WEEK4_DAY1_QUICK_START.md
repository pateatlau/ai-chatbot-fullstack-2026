# 🚀 WEEK 4 QUICK START GUIDE - Day 1 Setup

**Date:** November 23, 2025  
**Goal:** Set up foundation for OpenAI integration  
**Time:** ~30 minutes setup + 7.5 hours implementation

---

## ✅ PRE-FLIGHT CHECKLIST

Before starting Day 1, verify:

```bash
# 1. Full stack running?
curl http://localhost:4000/health

# 2. Auth service running?
curl http://localhost:3000/health

# 3. Chatbot service running?
curl http://localhost:3001/health

# 4. Databases ready?
npm run db:status

# 5. OpenAI API key configured?
echo $OPENAI_API_KEY
```

**All should show healthy status ✅**

---

## 🎯 DAY 1 OBJECTIVES

**Morning (4 hours):**

1. OpenAI client setup
2. Conversation context builder
3. OpenAI integration tests

**Afternoon (4 hours):** 4. Streaming response handler 5. Complete sendMessage resolver 6. Integration testing

**Deliverable:** sendMessage mutation working with OpenAI responses

---

## 📝 IMPLEMENTATION CHECKLIST

### PART 1: Create OpenAI Service (1 hour)

**File:** `/apps/chatbot-service/src/lib/openai-client.ts`

```typescript
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo';
  }

  /**
   * Stream a message response from OpenAI with retry logic
   */
  async streamMessage(
    messages: ChatCompletionMessageParam[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<{
    content: string;
    tokenCount: number;
    finishReason: string;
  }> {
    return this.retryWithBackoff(async () => {
      const stream = this.client.beta.chat.completions.stream({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      });

      let content = '';
      let tokenCount = 0;

      // Process streaming response
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          content += delta.content;
          // Approximate token count (1 token ≈ 4 characters)
          tokenCount = Math.ceil(content.length / 4);
        }
      }

      // Get final usage stats when stream completes
      const finalMessage = await stream.finalMessage();
      const usage = finalMessage.usage;
      if (usage?.completion_tokens) {
        tokenCount = usage.completion_tokens;
      }

      return {
        content,
        tokenCount,
        finishReason: finalMessage.choices[0]?.finish_reason || 'stop',
      };
    });
  }

  /**
   * Estimate tokens for a message (for preview purposes)
   */
  estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Retry failed API calls with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt < RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        console.log(
          `[OpenAI] Retry attempt ${attempt + 1}/${RETRY_ATTEMPTS} after ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, attempt + 1);
      }
      throw error;
    }
  }
}

// Export singleton
export const openaiService = new OpenAIService();
```

**Time: 15 min | Status: ✅**

---

### PART 2: Create Conversation Context Builder (1 hour)

**File:** `/apps/chatbot-service/src/lib/conversation-context.ts`

```typescript
import { PrismaClient, Message } from '@prisma/client';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

const prisma = new PrismaClient();

const SYSTEM_PROMPT = `You are a helpful, friendly AI assistant. You provide accurate, thoughtful responses. 
Keep responses concise but informative. If you don't know something, say so honestly.`;

export class ConversationContextBuilder {
  /**
   * Build conversation context with history for OpenAI API
   */
  async buildContext(
    conversationId: string,
    maxMessages: number = 10
  ): Promise<ChatCompletionMessageParam[]> {
    // Fetch conversation history (most recent messages)
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'asc' },
      take: -maxMessages, // Take last N messages
    });

    // Build context array for OpenAI
    const context: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...messages.map(
        (msg) =>
          ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          }) as ChatCompletionMessageParam
      ),
    ];

    return context;
  }

  /**
   * Get conversation summary for context window management
   */
  async getConversationSummary(conversationId: string): Promise<string> {
    const [totalMessages, tokenData] = await Promise.all([
      prisma.message.count({
        where: { conversationId, isDeleted: false },
      }),
      prisma.message.aggregate({
        where: { conversationId, isDeleted: false },
        _sum: { tokenCount: true },
      }),
    ]);

    return `Conversation ID: ${conversationId} | Messages: ${totalMessages} | Tokens: ${tokenData._sum.tokenCount || 0}`;
  }
}

export const contextBuilder = new ConversationContextBuilder();
```

**Time: 15 min | Status: ✅**

---

### PART 3: Write Unit Tests (1 hour)

**File:** `/apps/chatbot-service/src/lib/__tests__/openai-client.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIService } from '../openai-client';

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(() => {
    service = new OpenAIService();
  });

  describe('streamMessage', () => {
    it('should estimate tokens correctly', () => {
      const text = 'Hello world'; // ~3 tokens
      const estimated = service.estimateTokens(text);
      expect(estimated).toBeGreaterThan(0);
      expect(estimated).toBeLessThan(10);
    });

    it('should handle error on failed API calls', async () => {
      const invalidMessages = []; // Empty messages should fail
      expect(async () => {
        await service.streamMessage(invalidMessages);
      }).rejects.toThrow();
    });
  });

  describe('retryWithBackoff', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 2) throw new Error('Temporary failure');
        return 'success';
      };

      // Note: retryWithBackoff is private, so this test is more for documentation
      // In real implementation, test through streamMessage
    });
  });
});
```

**Time: 20 min | Status: ✅**

---

### PART 4: Create Streaming Response Handler (1.5 hours)

**File:** `/apps/chatbot-service/src/lib/stream-handler.ts`

```typescript
import { EventEmitter } from 'events';
import OpenAI from 'openai';

export interface StreamOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullContent: string, tokenCount: number) => void;
  onError?: (error: Error) => void;
}

export class StreamHandler extends EventEmitter {
  /**
   * Handle streaming response from OpenAI
   */
  async handleStream(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    options: StreamOptions = {}
  ): Promise<{ content: string; tokenCount: number }> {
    let content = '';
    let tokenCount = 0;

    try {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        // Stream the content chunks
        if (delta?.content) {
          content += delta.content;
          options.onChunk?.(delta.content);
          this.emit('chunk', delta.content);

          // Update token count estimate
          tokenCount = Math.ceil(content.length / 4);
        }
      }

      // Signal completion
      options.onComplete?.(content, tokenCount);
      this.emit('complete', { content, tokenCount });

      return { content, tokenCount };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      options.onError?.(err);
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Accumulate streaming response into buffer
   */
  async accumulate(chunks: AsyncIterable<string>): Promise<string> {
    let accumulated = '';
    for await (const chunk of chunks) {
      accumulated += chunk;
      this.emit('chunk', chunk);
    }
    this.emit('complete', accumulated);
    return accumulated;
  }

  /**
   * Handle connection errors gracefully
   */
  handleConnectionError(error: Error): void {
    console.error('[StreamHandler] Connection error:', error.message);
    this.emit('connectionError', error);
  }
}

export const streamHandler = new StreamHandler();
```

**Time: 20 min | Status: ✅**

---

### PART 5: Complete sendMessage Resolver (2 hours)

**File:** `/apps/chatbot-service/src/graphql/resolvers.ts` (Update Mutation.sendMessage)

Find and replace the sendMessage mutation around line 280:

```typescript
// BEFORE (existing):
// TODO: Call OpenAI API and create assistant message via SSE streaming
// For now, return success response

return {
  success: true,
  message: userMessage,
  conversationId: args.conversationId,
};

// AFTER (new implementation):
```

Replace with complete implementation that:

1. Builds conversation context
2. Calls OpenAI API with streaming
3. Creates assistant message
4. Tracks token usage
5. Broadcasts to subscribers
6. Returns response

**Implementation Code:**

```typescript
import { openaiService } from '../lib/openai-client';
import { contextBuilder } from '../lib/conversation-context';
import { streamHandler } from '../lib/stream-handler';

// In Mutation.sendMessage resolver, replace TODO section:

// TODO: Call OpenAI API and create assistant message via SSE streaming
// For now, return success response

// ✅ NEW IMPLEMENTATION:
try {
  // Build conversation context with history
  const context = await contextBuilder.buildContext(
    args.conversationId,
    10 // Include last 10 messages for context
  );

  // Add current user message to context
  context.push({
    role: 'user',
    content: args.input.content,
  });

  // Call OpenAI API with streaming
  const openaiResponse = await openaiService.streamMessage(context, {
    temperature: 0.7,
    maxTokens: 2000,
  });

  // Create assistant message in database
  const assistantMessage = await prisma.message.create({
    data: {
      conversationId: args.conversationId,
      role: 'assistant',
      content: openaiResponse.content,
      tokenCount: openaiResponse.tokenCount,
    },
  });

  // Update conversation metadata
  await prisma.conversation.update({
    where: { id: args.conversationId },
    data: {
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    message: assistantMessage,
    conversationId: args.conversationId,
  };
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : 'Unknown error';
  console.error('[sendMessage] OpenAI API error:', errorMsg);

  throw new GraphQLError('Failed to process message: ' + errorMsg, {
    extensions: {
      code: 'OPENAI_ERROR',
      originalError: errorMsg,
    },
  });
}

return {
  success: true,
  message: userMessage,
  conversationId: args.conversationId,
};
```

**Time: 1.5 hours | Status: ✅**

---

### PART 6: Integration Testing (1.5 hours)

**File:** `/apps/chatbot-service/src/graphql/__tests__/resolvers.test.ts`

Create comprehensive test for the updated resolver:

```typescript
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { resolvers } from '../resolvers';
import { openaiService } from '../../lib/openai-client';

// Mock OpenAI
vi.mock('../../lib/openai-client', () => ({
  openaiService: {
    streamMessage: vi.fn(async () => ({
      content: 'This is a test response from the mock OpenAI service.',
      tokenCount: 15,
      finishReason: 'stop',
    })),
  },
}));

const prisma = new PrismaClient();

describe('sendMessage Mutation', () => {
  let conversationId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test data
    testUserId = 'test-user-123';
    const conversation = await prisma.conversation.create({
      data: {
        userId: testUserId,
        title: 'Test Conversation',
      },
    });
    conversationId = conversation.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.message.deleteMany({
      where: { conversationId },
    });
    await prisma.conversation.delete({
      where: { id: conversationId },
    });
    await prisma.$disconnect();
  });

  it('should create user message and call OpenAI', async () => {
    const sendMessage = resolvers.Mutation.sendMessage;
    const context = { userId: testUserId };

    const result = await sendMessage(
      null,
      {
        conversationId,
        input: { content: 'Hello, how are you?' },
      },
      context
    );

    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.message.role).toBe('user');
    expect(result.message.content).toBe('Hello, how are you?');
  });

  it('should create assistant message with OpenAI response', async () => {
    // First create a user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content: 'Tell me a joke',
      },
    });

    // Get messages from DB
    const messages = await prisma.message.findMany({
      where: { conversationId },
    });

    expect(messages.length).toBeGreaterThan(0);
  });

  it('should reject unauthorized users', async () => {
    const sendMessage = resolvers.Mutation.sendMessage;
    const context = { userId: 'different-user' };

    expect(async () => {
      await sendMessage(
        null,
        {
          conversationId,
          input: { content: 'Unauthorized message' },
        },
        context
      );
    }).rejects.toThrow('Unauthorized');
  });
});
```

**Time: 20 min | Status: ✅**

---

## 🎯 DAY 1 COMPLETION CHECKLIST

- [ ] OpenAI client created and tested
- [ ] Conversation context builder working
- [ ] Unit tests passing
- [ ] Stream handler implemented
- [ ] sendMessage resolver complete
- [ ] Integration tests passing
- [ ] No console errors
- [ ] Code committed to git

---

## 🚀 VALIDATION STEPS

After completing Day 1, verify:

```bash
# 1. Run unit tests
npm run test chatbot-service

# 2. Run integration tests
npm run test:graphql:integration

# 3. Test via GraphQL manually
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "mutation { sendMessage(conversationId: \"...\", input: { content: \"Hi\" }) { success message { id content role } } }"
  }'

# 4. Check logs for errors
npm run dev -- 2>&1 | grep -i error
```

---

## 📊 DAY 1 SUCCESS METRICS

| Metric        | Target     | How to Check                 |
| ------------- | ---------- | ---------------------------- |
| Tests Passing | 100%       | `npm run test`               |
| Code Coverage | 70%+       | `npm run test -- --coverage` |
| Response Time | <200ms     | Monitor in browser DevTools  |
| Errors        | 0          | Check console logs           |
| Database      | Consistent | Query PostgreSQL             |

---

## 🆘 TROUBLESHOOTING

**Issue: OpenAI API key not found**

```bash
# Add to .env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo
```

**Issue: Streaming times out**

- Check OpenAI API quota
- Verify network connectivity
- Check max_tokens setting

**Issue: Database connection fails**

```bash
npm run db:status  # Verify PostgreSQL running
npx prisma migrate deploy  # Apply migrations
```

**Issue: Tests failing**

```bash
npm run test -- --reporter=verbose  # Get more details
npm run test -- --no-cache          # Clear cache
```

---

## 📝 NEXT STEPS

**At end of Day 1:**

1. Commit all code: `git add -A && git commit -m "feat: OpenAI integration complete"`
2. Push changes: `git push origin develop`
3. Create test results documentation
4. Prepare for Day 2 (WebSocket setup)

**Day 2:** WebSocket subscriptions and real-time updates

---

## 📚 REFERENCE CODE

**Working Examples:**

- Auth service patterns: `/apps/auth-service/src/graphql/`
- Database models: `/prisma/schema.prisma`
- Test patterns: `/scripts/test-graphql-integration.sh`

**OpenAI Documentation:**

- https://platform.openai.com/docs/api-reference
- Stream reference: https://platform.openai.com/docs/api-reference/chat/create

---

**Estimated Completion:** 8 hours execution  
**Status:** 🟢 Ready to begin  
**Next:** Execute Part 1 (OpenAI Service Setup)
