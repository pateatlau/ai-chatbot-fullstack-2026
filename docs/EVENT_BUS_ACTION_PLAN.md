# Event Bus Implementation - Action Plan at a Glance

**Duration:** Weeks 1-2 (10 dev-days, ~70 hours)  
**Team:** 1-2 developers  
**Complexity:** Medium | **Risk:** Low | **Impact:** High

---

## 📌 Overview: What We're Building

An **event-driven communication system** for zero-coupling between micro-frontends.

```
BEFORE (Tight Coupling):
┌──────────┐
│Auth MFE  │ ──┐
├──────────┤   │
│Chatbot   │ ──┼──→ Shared Zustand Store (TIGHT COUPLING)
│MFE       │   │
├──────────┤   │
│Admin MFE │ ──┘
└──────────┘

AFTER (Event Bus):
┌──────────┐      ┌──────────┐      ┌──────────┐
│Auth MFE  │      │Chatbot   │      │Admin MFE │
│          │      │MFE       │      │          │
│Local     │      │Local     │      │Local     │
│Zustand   │      │Zustand   │      │Zustand   │
└────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                 │
     └─────────────────┼─────────────────┘
                       │
                   EVENT BUS
             (Zero-coupling Pub/Sub)
```

**Benefits:**

- ✅ Independent MFE deployment
- ✅ No shared state (each MFE has local Zustand)
- ✅ Scalable architecture
- ✅ Type-safe event contracts

---

## 🎯 5-Phase Action Plan

### PHASE 1: Foundation (Days 1-2, ~8 hours)

**Goal:** Create core event bus infrastructure

```
Day 1 (4 hours):
├─ Create libs/frontend/event-bus/ package
├─ Implement EventBus class with:
│  ├─ subscribe() - register event listeners
│  ├─ emit() - broadcast events
│  ├─ once() - subscribe for single event
│  └─ clear() - cleanup
└─ Add event history tracking (debugging)

Day 2 (4 hours):
├─ Define TypeScript event types (EventMap)
├─ Create event-emitter wrapper hook
├─ Setup module federation shared dependencies
└─ Write unit tests (basic cases)
```

**Key Files Created:**

```
libs/frontend/event-bus/src/lib/
├── event-bus.ts          (Core EventBus class)
├── event-types.ts        (EventMap type definitions)
├── event-emitter.ts      (useEventEmitter hook)
└── index.ts              (Public exports)
```

**Code Example:**

```typescript
// Publishing an event
eventBus.emit('user:logged-in', {
  userId: '123',
  user: { id: '123', email: 'user@example.com' },
  accessToken: 'token...',
  loginTime: '2025-11-18T...',
});

// Subscribing to an event
const unsubscribe = eventBus.subscribe('user:logged-in', (event) => {
  console.log('User logged in:', event.user.email);
});

// Custom hook for components
const { on, emit } = useEventEmitter();
on('user:logged-in', (event) => {
  /* ... */
});
```

**Success Criteria:**

- [ ] EventBus class compiles without errors
- [ ] Subscribe/emit work synchronously
- [ ] TypeScript strict mode passes
- [ ] Unit tests for basic functionality pass

---

### PHASE 2: Zustand Store Integration (Days 3-4, ~12 hours)

**Goal:** Connect event bus to existing stores

```
Day 3 (6 hours):
├─ Update auth.store.ts
│  ├─ Emit 'user:logged-in' on setAuth()
│  ├─ Emit 'user:logged-out' on clearAuth()
│  └─ Emit 'token:refreshed' on setTokens()
├─ Update toast.store.ts
│  └─ Listen to 'auth:error' events
└─ Create store setup hook

Day 4 (6 hours):
├─ Create useEventListener custom hook
├─ Setup event subscriptions cleanup
├─ Test store-to-event emission
└─ Test event-to-store subscription
```

**Key Changes:**

```typescript
// In auth.store.ts
setAuth: (user, accessToken, refreshToken) => {
  set({ user, accessToken, refreshToken, isAuthenticated: true });

  // NEW: Emit event
  eventBus.emit('user:logged-in', {
    userId: user.id,
    user,
    accessToken,
    loginTime: new Date().toISOString(),
  });
};

// In toast.store.ts (new)
useEffect(() => {
  return eventBus.subscribe('auth:error', (event) => {
    useToastStore.getState().addToast(event.error, 'error', 5000);
  });
}, []);
```

**New Files:**

```
libs/frontend/stores/src/lib/
├── event-driven-store-setup.ts  (Initialize event subscriptions)
└── (updated) auth.store.ts
    (updated) toast.store.ts
```

**Success Criteria:**

- [ ] Auth store emits events on state change
- [ ] Toast store responds to auth errors
- [ ] No circular dependencies
- [ ] Memory cleanup works properly

---

### PHASE 3: MFE-Specific Stores (Days 5-7, ~16 hours)

**Goal:** Create isolated stores that listen to events

```
Day 5 (5 hours):
├─ Create chatbot.store.ts with:
│  ├─ Local conversations state
│  ├─ Local messages state
│  ├─ Listen to 'user:logged-in' → setUserContext()
│  └─ Listen to 'user:logged-out' → clearAll()
├─ Write initialization hook
└─ Test store creation

Days 6-7 (11 hours):
├─ Create admin.store.ts
│  ├─ Listen to user login → check if admin
│  ├─ Store admin permissions locally
│  └─ Clear on logout
├─ Create profile.store.ts
│  ├─ Listen to user profile updates
│  └─ Store local profile data
└─ Integration tests for all stores
```

**Store Architecture:**

```typescript
// Each MFE has its own isolated store

// apps/chatbot-mfe/src/store/chatbot.store.ts
export const useChatbotStore = create<ChatbotState>((set) => ({
  conversations: [],
  messages: [],
  currentUserContext: null,
  // ... setters
}));

export function useChatbotStoreInitialization() {
  useEffect(() => {
    // Listen to auth events
    return eventBus.subscribe('user:logged-in', (event) => {
      useChatbotStore.setState({
        currentUserContext: { userId: event.userId, email: event.user.email },
      });
    });
  }, []);
}
```

**Files Created:**

```
apps/chatbot-mfe/src/store/
└── chatbot.store.ts

apps/admin-mfe/src/store/
└── admin.store.ts

apps/profile-mfe/src/store/
└── profile.store.ts
```

**Success Criteria:**

- [ ] Each MFE has isolated store with event listeners
- [ ] Stores properly initialize on app load
- [ ] Events trigger correct store updates
- [ ] No data leakage between MFEs

---

### PHASE 4: Refactor MFE Components (Days 8-10, ~14 hours)

**Goal:** Update components to use new event-driven stores

```
Days 8-9 (10 hours):
├─ Update Auth MFE
│  ├─ Login/Register components emit auth events
│  └─ Subscribe to auth store
├─ Update Chatbot MFE
│  ├─ Call useChatbotStoreInitialization()
│  └─ Use local store instead of shared store
├─ Update Admin MFE
│  └─ Call useAdminStoreInitialization()

Day 10 (4 hours):
├─ Update Profile MFE
├─ Update Shell app initialization
├─ Integration testing across all MFEs
└─ Manual testing on all flows
```

**Component Updates Example:**

```typescript
// Before (using shared store)
function ChatPage() {
  const user = useAuthStore((state) => state.user);
  // Problem: Tightly coupled to shared auth store
}

// After (using event bus + local store)
function ChatPage() {
  useChatbotStoreInitialization(); // Subscribe to events once
  const { currentUserContext } = useChatbotStore();
  // Benefit: Isolated store, event-driven updates
}
```

**Integration Pattern:**

```
1. Component mounts
   ↓
2. Call useChatbotStoreInitialization()
   ↓
3. Subscribe to event bus for events (user:logged-in, etc.)
   ↓
4. When event fires, update local Zustand store
   ↓
5. Component re-renders with new store state
```

**Success Criteria:**

- [ ] All components compile without errors
- [ ] Components properly initialize event listeners
- [ ] No direct shared store access (except auth/toast)
- [ ] Manual testing on all MFEs passes

---

### PHASE 5: Testing, Monitoring & Documentation (Days 11-14, ~20 hours)

**Goal:** Comprehensive testing, debugging tools, and documentation

```
Days 11-12 (10 hours):
├─ Write unit tests
│  ├─ EventBus: subscribe, emit, once, clear
│  ├─ Event type safety
│  └─ Event history tracking
├─ Write integration tests
│  ├─ Store-to-event emission
│  ├─ Event-to-store subscription
│  └─ Multi-MFE event flows
└─ Test memory cleanup (no leaks)

Days 13-14 (10 hours):
├─ Create EventBusDevTools
│  ├─ Event history inspector
│  ├─ Real-time event monitor
│  └─ Performance profiler
├─ Create debugging component
├─ Write comprehensive docs
│  ├─ Architecture guide
│  ├─ Integration examples
│  └─ Migration guide
└─ Team training
```

**Testing Structure:**

```typescript
// Unit tests: EventBus functionality
describe('EventBus', () => {
  it('should emit and subscribe to events', async () => {
    const listener = jest.fn();
    eventBus.subscribe('test:event', listener);

    eventBus.emit('test:event', { data: 'test' });

    expect(listener).toHaveBeenCalledWith({ data: 'test' });
  });
});

// Integration tests: Store-to-event flows
describe('Auth Store Event Emission', () => {
  it('should emit user:logged-in event on setAuth', () => {
    const listener = jest.fn();
    eventBus.subscribe('user:logged-in', listener);

    useAuthStore.getState().setAuth(mockUser, token, refreshToken);

    expect(listener).toHaveBeenCalledWith({
      userId: mockUser.id,
      user: mockUser,
      accessToken: token,
    });
  });
});
```

**Documentation Files:**

```
docs/
├── EVENT_BUS_IMPLEMENTATION_PLAN.md (THIS FILE)
├── EVENT_BUS_CODE_EXAMPLES.md (50+ examples)
├── EVENT_BUS_QUICK_REFERENCE.md (Quick lookup)
└── EVENT_BUS_GUIDE.md (Developer guide)
```

**DevTools Example:**

```typescript
// In development, inspect event flow
<EventBusMonitor /> // Shows all emitted events in real-time

// Output:
user:logged-in { userId: '123', loginTime: '2025-11-18T...' }
token:refreshed { userId: '123', accessToken: 'new_token...' }
conversation:created { conversationId: 'conv-1', title: 'New Chat' }
```

**Success Criteria:**

- [ ] > 90% code coverage on event bus
- [ ] All integration tests passing
- [ ] No memory leaks (verified)
- [ ] DevTools fully functional
- [ ] Documentation complete
- [ ] Team trained on patterns
- [ ] Zero regressions on existing code

---

## 📊 Timeline Summary

```
WEEK 1
Mon ─── Tue ─── Wed ─── Thu ─── Fri
P1(4h)  P1(4h)  P2(6h)  P2(6h)  [Checkpoint]

WEEK 2
Mon ─── Tue ─── Wed ─── Thu ─── Fri
P3(5h)  P3(8h)  P3(3h)  P4(7h)  P4(7h)

WEEK 3 (Part of 2-week sprint)
Mon ─── Tue ─── Wed ─── Thu ─── Fri
P4(5h)  P5(5h)  P5(5h)  P5(5h)  [Done!]

Total: 70 hours = ~2 weeks for 1 full-time dev or 3 weeks for 1-2 part-time devs
```

---

## 🎯 Daily Checklist Example (Phase 1, Day 1)

```
✓ Create libs/frontend/event-bus package structure
✓ Implement EventBus class methods:
  ✓ subscribe()
  ✓ emit()
  ✓ unsubscribe()
  ✓ once()
✓ Add error handling
✓ Add event history tracking
✓ Add to tsconfig paths
✓ Write 3 unit tests
✓ Git commit: "feat(event-bus): core EventBus implementation"
```

---

## ⚠️ Risks & Mitigation

| Risk                                | Mitigation                                          |
| ----------------------------------- | --------------------------------------------------- |
| **Breaking existing functionality** | Feature flags, comprehensive testing, rollback plan |
| **Performance issues**              | Event debouncing, profiling, benchmarking           |
| **Memory leaks from listeners**     | Cleanup validation, devtools detection, tests       |
| **Team learning curve**             | Documentation, pair programming, training session   |
| **Circular event subscriptions**    | Linting rules, code review, architecture validation |

---

## 💾 Resource Estimation

```
Total Work:     70 hours
Team:           1-2 developers
Calendar Time:  2-3 weeks
Effort:         10 dev-days

Phase Breakdown:
├─ Phase 1: 8 hours   (11%)
├─ Phase 2: 12 hours  (17%)
├─ Phase 3: 16 hours  (23%)
├─ Phase 4: 14 hours  (20%)
└─ Phase 5: 20 hours  (29%)
```

---

## ✅ Definition of Done (All Phases Complete)

- [x] All code merged to develop
- [x] All tests passing (>90% coverage)
- [x] No TypeScript errors or warnings
- [x] Documentation complete
- [x] Code reviewed and approved
- [x] Deployed to staging
- [x] Smoke tested on all MFEs
- [x] Performance verified (no regression)
- [x] Team trained
- [x] Ready for production deployment

---

## 🚀 After Event Bus (Weeks 3-10)

Event Bus complete enables:

**Weeks 3-6:** GraphQL + REST Hybrid API

- Event Bus handles cache coordination
- REST APIs remain functional during migration
- Clear success metrics available

**Weeks 7-10:** MongoDB + PostgreSQL Hybrid

- Event Bus + GraphQL abstract database details
- Multi-database coordination simplified
- Data consistency events emitted

---

## 📚 Related Documentation

- `EVENT_BUS_IMPLEMENTATION_PLAN.md` - Full technical details
- `EVENT_BUS_CODE_EXAMPLES.md` - 50+ code examples
- `EVENT_BUS_QUICK_REFERENCE.md` - Quick lookup guide
- `CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md` - Overall 10-week plan

---

**Status:** ✅ Ready for Week 1 Monday execution  
**Next Step:** Create GitHub issues for each phase  
**Questions?** Refer to EVENT_BUS_IMPLEMENTATION_PLAN.md
