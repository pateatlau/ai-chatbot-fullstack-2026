# 📅 WEEK 4 DEVELOPMENT PLAN - Chatbot Subgraph Implementation

**Date:** November 23, 2025  
**Duration:** 5 development days (40 hours estimated)  
**Priority:** P1 - Core Feature Implementation  
**Status:** 🔵 PLANNED

---

## 🎯 WEEK 4 OBJECTIVES

**Primary:** Build a production-ready chatbot subgraph with OpenAI integration and real-time capabilities

**Deliverables:**

1. ✅ Complete OpenAI API integration with streaming
2. ✅ Real-time WebSocket subscriptions
3. ✅ Comprehensive test suite (unit + integration + e2e)
4. ✅ Performance optimization & monitoring
5. ✅ Complete documentation

**Success Criteria:**

- [ ] All GraphQL operations working (queries, mutations, subscriptions)
- [ ] OpenAI integration streaming responses token-by-token
- [ ] WebSocket subscriptions working across multiple clients
- [ ] Test coverage >80% of critical paths
- [ ] Average response time <200ms for queries
- [ ] Zero data loss on message creation
- [ ] Proper error handling with user-friendly messages

---

## 📊 CURRENT STATE ANALYSIS

### ✅ Already Complete

- GraphQL schema fully defined (schema.ts)
- Database models in Prisma (Conversation, Message)
- 70% of resolvers implemented
- Health check endpoint working
- Express/Apollo server infrastructure
- Federation patterns working
- JWT context forwarding

### ⚠️ Requires Implementation

- OpenAI API integration (sendMessage mutation)
- Streaming response handling
- Message role enum field resolver (database `role` -> GraphQL enum)
- WebSocket subscriptions
- Real-time message broadcasting
- lastMessage computed field
- Error handling for edge cases
- Performance monitoring
- Test suite

### 📋 Detailed Gap Analysis

**resolvers.ts Issues:**

```typescript
// Line 280: TODO comment shows missing implementation
// TODO: Call OpenAI API and create assistant message via SSE streaming
// Currently just returns user message without AI response

// Missing:
- OpenAI client integration
- Streaming response handling
- Assistant message creation
- Token counting
- Error recovery
- Rate limiting
```

---

## 📅 DAILY BREAKDOWN - 5 DAY PLAN

### **DAY 1: OpenAI Integration (8 hours)**

**Morning (4 hours):**

1. Set up OpenAI client configuration
   - Create `lib/openai-client.ts` with retry logic
   - Load API key from environment
   - Configure model parameters (GPT-4, temperature, max_tokens)
   - Implement error handling wrapper

2. Implement message context builder
   - Create `lib/conversation-context.ts`
   - Fetch conversation history (last 10 messages)
   - Format messages for OpenAI API
   - Include system prompt

3. Write OpenAI integration tests
   - Mock OpenAI responses
   - Test error scenarios
   - Test token counting

**Afternoon (4 hours):** 4. Implement streaming response handler

- Create `lib/stream-handler.ts`
- Process token-by-token responses
- Accumulate complete message
- Handle connection errors

5. Implement `sendMessage` mutation
   - Create user message in DB
   - Call OpenAI with streaming
   - Create assistant message in DB
   - Track token usage
   - Return response

6. Integration testing
   - Test end-to-end message flow
   - Verify database persistence
   - Check token counting accuracy

**Deliverable:** OpenAI integration complete, sendMessage working with streaming

**Metrics:**

- Response time: <150ms for message creation
- Streaming: Complete response in <5s
- Error rate: <1%

---

### **DAY 2: WebSocket Real-Time (8 hours)**

**Morning (4 hours):**

1. Set up WebSocket infrastructure
   - Configure Apollo subscriptions
   - Create EventEmitter for message broadcasts
   - Set up subscription transport (ws/wss)
   - Test connection management

2. Implement subscription resolvers
   - `messageReceived(conversationId)` subscription
   - `conversationUpdated(userId)` subscription
   - Broadcast handlers

3. Create broadcast service
   - Create `lib/broadcast-service.ts`
   - Message broadcast on creation
   - Conversation update broadcast
   - Connection lifecycle management

**Afternoon (4 hours):** 4. Implement client-side subscription helpers

- Create subscription query helpers
- Connection retry logic
- Automatic reconnection

5. Test WebSocket scenarios
   - Single client subscription
   - Multiple clients same conversation
   - Multiple conversations
   - Connection drop/reconnect
   - Concurrent message sending

6. Performance testing
   - Measure subscription latency
   - Monitor memory for 100+ concurrent connections
   - Test broadcast throughput

**Deliverable:** Full WebSocket support with subscriptions working

**Metrics:**

- Subscription latency: <100ms
- Concurrent connections: Support 100+
- Memory per connection: <1MB

---

### **DAY 3: Comprehensive Testing (8 hours)**

**Morning (4 hours):**

1. Unit test suite
   - GraphQL resolvers (queries, mutations, subscriptions)
   - OpenAI integration (streaming, error handling)
   - Database queries (conversations, messages)
   - Field resolvers (messageCount, role enum, lastMessage)

2. Integration tests
   - End-to-end message creation and retrieval
   - OpenAI integration with real API
   - Database persistence verification
   - Federation type references

3. Test coverage reporting
   - Generate coverage report
   - Aim for >80% critical paths
   - Document coverage gaps

**Afternoon (4 hours):** 4. E2E test scenarios (Playwright)

- User creates conversation
- User sends message and receives response
- Real-time subscription receives message
- Delete message and verify
- List conversations and verify pagination
- Search conversations by title

5. Performance tests (k6)
   - Load test: 50 concurrent users
   - Stress test: 100 concurrent messages/sec
   - Endurance test: 30 minutes sustained load
   - Spike test: Sudden 5x traffic increase

6. Security tests
   - Authorization checks (can't access other user's data)
   - SQL injection attempts
   - GraphQL injection attempts
   - Large payload rejection

**Deliverable:** Comprehensive test suite with >80% coverage

**Metrics:**

- Unit test coverage: 85%
- Integration test coverage: 90%
- E2E scenarios: 100% passing
- Load: 50 concurrent users, <200ms response
- Stress: 100 msg/sec, <5% errors

---

### **DAY 4: Performance & Optimization (8 hours)**

**Morning (4 hours):**

1. Database optimization
   - Add indexes for common queries
   - Verify query plans
   - Implement connection pooling
   - Test with large datasets (10k+ conversations)

2. GraphQL query optimization
   - Implement DataLoader for batch queries
   - Add query complexity analysis
   - Implement rate limiting
   - Cache conversation metadata

3. OpenAI optimization
   - Implement request batching
   - Add response caching for similar queries
   - Implement token budget tracking
   - Add cost monitoring

**Afternoon (4 hours):** 4. Monitoring & observability

- Add structured logging
- Implement error tracking (Sentry integration)
- Add performance metrics (APM)
- Create monitoring dashboard

5. Stress test resolution
   - Fix any bottlenecks identified in Day 3
   - Optimize hot paths
   - Implement caching where appropriate
   - Tune database parameters

6. Documentation of optimizations
   - Document all improvements
   - Measure performance gains
   - Create optimization runbook

**Deliverable:** Optimized, production-ready system

**Metrics:**

- Query response: <100ms p95
- Streaming: <3s for complete response
- Database: <50ms query time
- Memory: Stable under load
- CPU: <60% utilization under load

---

### **DAY 5: Finalization & Documentation (8 hours)**

**Morning (4 hours):**

1. Code review & cleanup
   - Remove console.logs (keep structured logging)
   - Add JSDoc comments to complex functions
   - Format code (Prettier)
   - Lint validation (ESLint)

2. Documentation
   - API documentation (Swagger/GraphQL docs)
   - Architecture documentation
   - Setup and deployment guide
   - Troubleshooting guide

3. Integration verification
   - Verify all 3 subgraphs composing
   - Test federation type references
   - Verify context forwarding
   - Test through Apollo Gateway

**Afternoon (4 hours):** 4. Sign-off testing

- Run full integration test suite
- Run performance benchmarks
- Run security checks
- Verify documentation completeness

5. Deployment preparation
   - Create Docker image
   - Test in staging environment
   - Create rollback plan
   - Prepare release notes

6. Week 4 completion
   - Final git commits
   - Tag release
   - Create completion documentation
   - Plan Week 5 if applicable

**Deliverable:** Production-ready chatbot service, fully documented

**Metrics:**

- All tests passing: 100%
- Test coverage: 85%+
- Documentation: Complete
- Performance: Within targets
- Security: All checks passing

---

## 🔧 TECHNICAL IMPLEMENTATION DETAILS

### OpenAI Integration Architecture

```typescript
// lib/openai-client.ts
export class OpenAIService {
  private client: OpenAI;

  async streamMessage(messages: ChatMessage[]): Promise<{
    content: string;
    tokenCount: number;
  }>;

  async retryWithBackoff(fn: Function): Promise<any>;
}

// Usage in sendMessage mutation:
const service = new OpenAIService();
const response = await service.streamMessage(contextMessages);
const assistantMessage = await prisma.message.create({
  data: {
    conversationId,
    role: 'assistant',
    content: response.content,
    tokenCount: response.tokenCount,
  },
});
```

### WebSocket Subscription Pattern

```typescript
// Subscription resolvers
Subscription: {
  messageReceived: {
    subscribe: async (_, { conversationId }) => {
      return asyncIterator(conversationId);
    };
  }
}

// Broadcast on new message
broadcastService.emitMessage(conversationId, message);
```

### Real-Time Architecture

```
Client → Apollo Subscription
         ↓
    EventEmitter
         ↓
  Other Clients subscribed
```

---

## 📊 WEEK 4 SUCCESS METRICS

| Metric                  | Target     | Status   |
| ----------------------- | ---------- | -------- |
| **Schema Completeness** | 100%       | ✅ Ready |
| **Resolvers Complete**  | 100%       | 🟡 70%   |
| **OpenAI Integration**  | 100%       | ⏳ Day 1 |
| **WebSocket Support**   | 100%       | ⏳ Day 2 |
| **Test Coverage**       | 80%+       | ⏳ Day 3 |
| **Performance**         | <200ms avg | ⏳ Day 4 |
| **Documentation**       | Complete   | ⏳ Day 5 |
| **Production Ready**    | Yes        | ⏳ Day 5 |

---

## 🛠️ TECHNOLOGY STACK

**Language:** TypeScript  
**Runtime:** Node.js v20  
**GraphQL:** Apollo Server v4  
**Database:** PostgreSQL + Prisma  
**Real-Time:** Apollo Subscriptions + WebSocket  
**AI:** OpenAI API (GPT-4)  
**Cache:** Redis  
**Testing:** Jest + Vitest + Playwright + k6  
**Monitoring:** Winston (logging) + Sentry (errors)

---

## ⚠️ DEPENDENCIES & BLOCKERS

**Must Haves:**

- [ ] OpenAI API key configured
- [ ] PostgreSQL migrations applied
- [ ] Redis connection working
- [ ] Week 3 infrastructure verified (✅ Done)

**Dependencies:**

- Week 3 foundation (✅ Complete)
- Auth service running (needed for JWT context)
- Database models deployed (✅ In Prisma)

**No External Blockers:** All systems ready to proceed

---

## 📚 REQUIRED DOCUMENTATION

**To Create:**

1. OpenAI Integration Guide - How to use the service
2. WebSocket Subscription Guide - Real-time features
3. Chatbot API Reference - All operations
4. Troubleshooting Guide - Common issues
5. Performance Tuning Guide - Optimization tips
6. Deployment Guide - Production setup

**Already Exists:**

- GraphQL schema (schema.ts)
- Database models (schema.prisma)
- Project setup (main.ts)

---

## 🎯 SUCCESS CRITERIA - WEEK 4 COMPLETION

✅ **Infrastructure:**

- [ ] OpenAI API integration complete
- [ ] WebSocket subscriptions working
- [ ] Message streaming functional
- [ ] All resolvers implemented

✅ **Quality:**

- [ ] All tests passing (100%)
- [ ] Test coverage >80%
- [ ] Performance targets met
- [ ] Security checks passing

✅ **Documentation:**

- [ ] API documentation complete
- [ ] Architecture documented
- [ ] Setup guide created
- [ ] Troubleshooting guide ready

✅ **Production Ready:**

- [ ] Can start with `npm run dev`
- [ ] Can test via Apollo Gateway
- [ ] Can monitor health via `/health`
- [ ] Can scale to production

---

## 🚀 IMMEDIATE NEXT STEPS

**Today (Nov 23):**

- [ ] Review this plan
- [ ] Confirm OpenAI API key configured
- [ ] Set up development environment
- [ ] Verify all dependencies installed

**Tomorrow (Nov 24) - Start Day 1:**

- [ ] Begin OpenAI integration
- [ ] Create lib/openai-client.ts
- [ ] Implement streaming handler
- [ ] Complete sendMessage resolver

---

## 📖 REFERENCE MATERIALS

**Auth Service Pattern** (working example):

- `/apps/auth-service/src/graphql/schema.ts` - Federation pattern
- `/apps/auth-service/src/graphql/resolvers.ts` - Resolver structure
- `/apps/auth-service/src/main.ts` - Server setup

**Chatbot Service (in progress):**

- `/apps/chatbot-service/src/graphql/schema.ts` - Schema complete
- `/apps/chatbot-service/src/graphql/resolvers.ts` - 70% complete
- `/apps/chatbot-service/src/main.ts` - Server setup complete

**Database:**

- `/prisma/schema.prisma` - Conversation & Message models

**Testing:**

- `/scripts/test-graphql-integration.sh` - Integration test pattern
- Test suites in `/e2e` and `/__tests__` directories

---

## 💡 KEY SUCCESS FACTORS

1. **Start small** - Get one message working end-to-end before adding features
2. **Test early** - Write tests as you implement each feature
3. **Monitor continuously** - Watch logs and metrics as you go
4. **Document as you build** - Don't save docs for the end
5. **Leverage patterns** - Copy working patterns from auth service
6. **Ask for help** - If stuck, debug systematically

---

## 🎬 READY TO BEGIN?

**Status:** ✅ All prerequisites met, ready to start Day 1  
**Start Date:** December 1, 2025 (or immediately if continuing today)  
**Estimated Completion:** December 5, 2025

**Next Action:** Execute Day 1 tasks (OpenAI Integration)
