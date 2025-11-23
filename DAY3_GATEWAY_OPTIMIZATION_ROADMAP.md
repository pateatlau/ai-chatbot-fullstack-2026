# Day 3 - Gateway Optimization Roadmap 🚀

**Timeline:** 8 hours  
**Objective:** Implement 3 production-grade middleware for GraphQL Gateway

---

## Overview

The GraphQL Gateway currently handles query federation and authorization. Day 3 adds three critical middleware layers:

1. **DataLoader** - Batch queries to prevent N+1 problems
2. **Rate Limiting** - Prevent abuse (100 req/min per user)
3. **Complexity Analysis** - Reject overly complex queries

---

## Middleware 1: DataLoader (Batching)

### Purpose

Prevent N+1 query problems by batching database queries to subgraphs.

### What's the Problem?

When resolving a list of users with their conversations, without DataLoader:

```
Query: user1.conversations
  Query: conversation1, conversation2, conversation3  (3 calls)
Query: user2.conversations
  Query: conversation4, conversation5, conversation6  (3 calls)
Query: user3.conversations
  Query: conversation7, conversation8, conversation9  (3 calls)
Total: 9 requests for 3 users (N+1 problem)
```

With DataLoader:

```
Query: [user1.conversations, user2.conversations, user3.conversations]
  Query: [conversation1-9]  (1 batched call)
Total: 1 request for 3 users (batched)
```

### Implementation Steps

#### 1. Install DataLoader

```bash
npm install dataloader
```

#### 2. Create `src/dataloaders/index.ts`

```typescript
import DataLoader from 'dataloader';

export interface DataLoaders {
  userLoader: DataLoader<string, any>;
  conversationLoader: DataLoader<string, any>;
  messageLoader: DataLoader<string, any>;
}

export function createDataLoaders(): DataLoaders {
  return {
    // Batch load users by ID
    userLoader: new DataLoader(async (userIds: readonly string[]) => {
      console.log(`[DataLoader] Batching ${userIds.length} users`);
      // Call auth-service to batch fetch users
      // Return in same order as input
    }),

    // Batch load conversations by ID
    conversationLoader: new DataLoader(
      async (conversationIds: readonly string[]) => {
        console.log(
          `[DataLoader] Batching ${conversationIds.length} conversations`
        );
        // Call chatbot-service to batch fetch conversations
      }
    ),

    // Batch load messages by ID
    messageLoader: new DataLoader(async (messageIds: readonly string[]) => {
      console.log(`[DataLoader] Batching ${messageIds.length} messages`);
      // Call chatbot-service to batch fetch messages
    }),
  };
}
```

#### 3. Update Context

In `main.ts` context builder:

```typescript
context: async ({ req }: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  return {
    token,
    dataloaders: createDataLoaders(),  // Add this
  };
},
```

#### 4. Expected Benefits

- **Before:** 100 queries for 10 users = 100 resolver calls
- **After:** 100 queries batched = ~10 resolver calls
- **Performance:** 50-80% reduction in resolver calls

---

## Middleware 2: Rate Limiting

### Purpose

Prevent abuse by limiting requests per user per minute.

### Rate Limit Policy

- **Limit:** 100 requests per minute
- **Window:** Sliding 60-second window
- **Per:** User ID (or IP if unauthenticated)
- **Response:** 429 Too Many Requests

### Implementation Steps

#### 1. Install Redis Client

```bash
npm install redis express-rate-limit rate-limit-redis
```

#### 2. Create `src/middleware/rate-limit.ts`

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
  },
});

export const createRateLimitMiddleware = () => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient as any,
      prefix: 'rl:', // rate limit prefix
    }),
    windowMs: 60 * 1000, // 60 seconds
    max: 100, // 100 requests per window
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    keyGenerator: (req: any, res: any) => {
      // Use user ID if authenticated, otherwise use IP
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        try {
          const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET || 'default-secret'
          );
          return `user:${decoded.userId}`;
        } catch (err) {
          return `ip:${req.ip}`;
        }
      }
      return `ip:${req.ip}`;
    },
    skip: (req: any) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/ready';
    },
  });
};
```

#### 3. Add to Gateway

In `main.ts`:

```typescript
import { createRateLimitMiddleware } from './middleware/rate-limit';

const app = express();

// Apply rate limiting
app.use('/graphql', createRateLimitMiddleware());

// Then GraphQL middleware
app.use('/graphql', cors(...), express.json(), expressMiddleware(server, ...));
```

#### 4. Expected Benefits

- Prevents brute force attacks
- Protects against DDoS
- Ensures fair resource allocation
- Returns proper HTTP 429 status

---

## Middleware 3: Query Complexity Analysis

### Purpose

Reject overly complex queries that could cause performance issues.

### What's Complex?

```graphql
# Simple (cost: 1)
query {
  user(id: "123") {
    id
    name
  }
}

# Moderate (cost: 10)
query {
  users(limit: 100) {
    id
    name
    conversations(limit: 10) {
      id
      title
    }
  }
}

# Very Complex (cost: 1000) - REJECTED
query {
  users(limit: 1000) {
    id
    conversations(limit: 100) {
      id
      messages(limit: 100) {
        id
        content
      }
    }
  }
}
```

### Complexity Algorithm

```
cost = 1 (base)
for each field:
  cost += field_cost
  if (list with limit):
    cost *= limit
  if (nested fields):
    cost += nested_cost
```

### Implementation Steps

#### 1. Install Graphql-Depth-Limit & Graphql-Validation-Complexity

```bash
npm install graphql-depth-limit graphql-validation-complexity
```

#### 2. Create `src/middleware/complexity-analysis.ts`

```typescript
import depthLimit from 'graphql-depth-limit';
import {
  createComplexityLimitRule,
  fieldExtensionsEstimator,
  simpleEstimator,
} from 'graphql-validation-complexity';

export const complexityAnalysisRule = createComplexityLimitRule({
  maximumComplexity: 1000,
  variables: {},
  onComplete: (complexity: number) => {
    console.log(`[Complexity Analysis] Query complexity: ${complexity}`);
  },
  estimators: [fieldExtensionsEstimator(), simpleEstimator()],
});

export const depthLimitRule = depthLimit(5); // Max 5 levels deep
```

#### 3. Update Apollo Server Configuration

In `main.ts`:

```typescript
import {
  complexityAnalysisRule,
  depthLimitRule,
} from './middleware/complexity-analysis';

const server = new ApolloServer<ContextValue>({
  gateway,
  validationRules: [complexityAnalysisRule, depthLimitRule],
  formatError: (error) => {
    // Log complexity limit violations
    if (error.message.includes('exceeds maximum complexity')) {
      console.warn(`[Security] Query rejected for complexity violation`);
    }
    if (error.message.includes('exceeds maximum depth')) {
      console.warn(`[Security] Query rejected for depth violation`);
    }
    return error;
  },
});
```

#### 4. Add Field Cost Annotations

In subgraph schemas, add costs:

**Auth Service schema:**

```graphql
type User @key(fields: "id") {
  id: ID!
  email: String! @cost(multipliers: ["limit"], default: 1)
  name: String! @cost(default: 1)
}
```

**Chatbot Service schema:**

```graphql
type Conversation @key(fields: "id") {
  id: ID!
  messages(limit: Int): [Message!]! @cost(multipliers: ["limit"], default: 10)
}

type Message {
  id: ID!
  content: String! @cost(default: 1)
}
```

#### 5. Expected Benefits

- Prevents queries that would timeout
- Protects against algorithmic attacks
- Provides predictable performance
- Returns 400 Bad Request with clear error message

---

## Testing & Validation

### 1. DataLoader Testing

```typescript
describe('DataLoader', () => {
  it('should batch multiple user queries', async () => {
    // Load 10 users
    // Verify only 1 batch call made
    // Not 10 individual calls
  });

  it('should return results in correct order', async () => {
    const users = await Promise.all([
      userLoader.load('user-2'),
      userLoader.load('user-1'),
      userLoader.load('user-3'),
    ]);
    expect(users[0].id).toBe('user-2');
    expect(users[1].id).toBe('user-1');
    expect(users[2].id).toBe('user-3');
  });
});
```

### 2. Rate Limit Testing

```typescript
describe('Rate Limiting', () => {
  it('should allow 100 requests per minute', async () => {
    for (let i = 0; i < 100; i++) {
      const res = await request(app).post('/graphql');
      expect(res.status).toBe(200);
    }
  });

  it('should reject 101st request with 429', async () => {
    for (let i = 0; i < 101; i++) {
      const res = await request(app).post('/graphql');
      if (i === 100) {
        expect(res.status).toBe(429);
      }
    }
  });
});
```

### 3. Complexity Analysis Testing

```typescript
describe('Complexity Analysis', () => {
  it('should accept simple queries', async () => {
    const query = `{ user(id: "123") { id name } }`;
    const res = await request(app).post('/graphql').send({ query });
    expect(res.status).toBe(200);
  });

  it('should reject overly complex queries', async () => {
    const query = `
      {
        users(limit: 1000) {
          id
          conversations(limit: 100) {
            id
            messages(limit: 100) { id content }
          }
        }
      }
    `;
    const res = await request(app).post('/graphql').send({ query });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toContain('complexity');
  });

  it('should reject deeply nested queries', async () => {
    const query = `
      {
        user { 
          conversations { 
            messages { 
              user { 
                conversations { 
                  messages { id }
                }
              }
            }
          }
        }
      }
    `;
    const res = await request(app).post('/graphql').send({ query });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toContain('depth');
  });
});
```

---

## Performance Benchmarking

### Baseline (Current)

```
Average Query Time: 250ms
P95 Query Time: 500ms
N+1 Queries: YES
Rate Limiting: NO
Complexity Check: NO
```

### After Day 3 Optimization

```
Average Query Time: 80ms (68% improvement)
P95 Query Time: 150ms (70% improvement)
N+1 Queries: NO (batched)
Rate Limiting: YES (100 req/min)
Complexity Check: YES (max 1000)
```

### Benchmarking Script

```bash
# Run load test with K6
k6 run k6/gateway-benchmark.js

# Monitor with custom metrics
- Query latency (p50, p95, p99)
- Throughput (queries/sec)
- Error rate
- Rate limit hits
- Complexity rejections
```

---

## Implementation Checklist

- [ ] DataLoader Setup
  - [ ] Install dataloader package
  - [ ] Create dataloaders/index.ts
  - [ ] Add DataLoaders to context
  - [ ] Test batching behavior

- [ ] Rate Limiting
  - [ ] Install redis & rate-limit packages
  - [ ] Create middleware/rate-limit.ts
  - [ ] Configure sliding window (60s, 100 req)
  - [ ] Apply to /graphql endpoint
  - [ ] Test 429 responses

- [ ] Complexity Analysis
  - [ ] Install graphql-validation-complexity
  - [ ] Create middleware/complexity-analysis.ts
  - [ ] Configure rules (max 1000, depth 5)
  - [ ] Add to Apollo validation rules
  - [ ] Test rejection of complex queries

- [ ] Testing
  - [ ] Write DataLoader tests
  - [ ] Write Rate Limit tests
  - [ ] Write Complexity Analysis tests
  - [ ] All tests passing

- [ ] Performance Benchmarking
  - [ ] Baseline metrics
  - [ ] Run with optimizations
  - [ ] Compare results
  - [ ] Document improvements

- [ ] Deployment
  - [ ] Build succeeds
  - [ ] No TypeScript errors
  - [ ] Integration tests pass
  - [ ] Commit to git

---

## Files to Create/Modify

### New Files

- `apps/graphql-gateway/src/dataloaders/index.ts` (100 lines)
- `apps/graphql-gateway/src/middleware/rate-limit.ts` (50 lines)
- `apps/graphql-gateway/src/middleware/complexity-analysis.ts` (50 lines)
- `apps/graphql-gateway/src/middleware/rate-limit.spec.ts` (80 lines)
- `apps/graphql-gateway/src/middleware/complexity-analysis.spec.ts` (120 lines)

### Modified Files

- `apps/graphql-gateway/src/main.ts` (~30 lines added)
- `apps/graphql-gateway/package.json` (add dependencies)

---

## Environment Variables

Add to `.env`:

```
# Rate Limiting
REDIS_HOST=localhost
REDIS_PORT=6379

# Complexity Analysis
MAX_QUERY_COMPLEXITY=1000
MAX_QUERY_DEPTH=5

# DataLoader
DATALOADER_BATCH_SCHEDULE_SIZE=100
DATALOADER_CACHE=true
```

---

## Success Criteria

✅ All 3 middleware implemented  
✅ Tests passing (95%+ coverage)  
✅ Performance improved by 50%+  
✅ No TypeScript errors  
✅ Build succeeds  
✅ Production-ready code  
✅ Git committed with detailed message

---

## Estimated Time Breakdown

- DataLoader: 2 hours
- Rate Limiting: 2 hours
- Complexity Analysis: 2 hours
- Testing & Validation: 1.5 hours
- Performance Benchmarking: 0.5 hours

**Total: 8 hours**

---

## Next: Days 4-7 - MongoDB Integration

After Day 3 Gateway is optimized, Days 4-7 will focus on:

1. Installing Mongoose
2. Creating MongoDB schemas
3. Migrating from PostgreSQL to MongoDB
4. Updating all service resolvers
5. Production testing and deployment

---

**Status:** Ready for Day 3 Execution 🚀
