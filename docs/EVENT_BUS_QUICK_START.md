# Event Bus Action Plan - Quick Visual Reference

## 🎯 The 5 Phases at a Glance

```
PHASE 1: Foundation (Days 1-2, 8 hrs)
┌─────────────────────────────────┐
│ Create Event Bus Infrastructure │
├─────────────────────────────────┤
│ • EventBus class (subscribe,   │
│   emit, once, clear)           │
│ • EventMap type definitions    │
│ • Event history tracking       │
│ • Event emitter wrapper hook   │
└─────────────────────────────────┘
              ↓


PHASE 2: Zustand Integration (Days 3-4, 12 hrs)
┌──────────────────────────────────┐
│ Connect Event Bus to Stores     │
├──────────────────────────────────┤
│ • Auth store emits events      │
│   (login, logout, refresh)     │
│ • Toast store listens to      │
│   error events                 │
│ • Create useEventListener hook │
│ • Event subscription cleanup   │
└──────────────────────────────────┘
              ↓


PHASE 3: MFE Stores (Days 5-7, 16 hrs)
┌──────────────────────────────────┐
│ Create Isolated MFE Stores     │
├──────────────────────────────────┤
│ • Chatbot store (local state)  │
│ • Admin store (local state)    │
│ • Profile store (local state)  │
│ • Each listens to auth events  │
│ • Each manages own data        │
└──────────────────────────────────┘
              ↓


PHASE 4: Component Refactor (Days 8-10, 14 hrs)
┌──────────────────────────────────┐
│ Update All Components          │
├──────────────────────────────────┤
│ • Auth MFE components          │
│ • Chatbot MFE components       │
│ • Admin MFE components         │
│ • Profile MFE components       │
│ • Shell app initialization     │
│ • Integration testing          │
└──────────────────────────────────┘
              ↓


PHASE 5: Testing & Docs (Days 11-14, 20 hrs)
┌──────────────────────────────────┐
│ Testing, Tools & Documentation │
├──────────────────────────────────┤
│ • Unit tests (>90% coverage)   │
│ • Integration tests            │
│ • EventBusDevTools monitor     │
│ • Comprehensive docs           │
│ • Team training               │
│ • Production ready            │
└──────────────────────────────────┘
```

---

## 📝 Phase 1: Foundation (8 hours)

### What You're Building

```
Create core event bus infrastructure with type-safe events
```

### Daily Breakdown

```
DAY 1 (4 hours):
├─ libs/frontend/event-bus/src/lib/event-bus.ts
│  └─ EventBus class: subscribe(), emit(), once(), clear()
├─ Add event history tracking
└─ Unit tests for basic ops

DAY 2 (4 hours):
├─ libs/frontend/event-bus/src/lib/event-types.ts
│  └─ Define EventMap with all event types
├─ useEventEmitter hook
└─ Add to Module Federation shared deps
```

### Code Template

```typescript
// EventBus class (event-bus.ts)
export class EventBus {
  private listeners: Map<string, Set<Function>> = new Map();

  subscribe(eventName: string, listener: Function) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(listener);
    return () => this.unsubscribe(eventName, listener);
  }

  emit(eventName: string, data: any) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }
}

export const eventBus = new EventBus();
```

### Files Created

```
libs/frontend/event-bus/
├── src/lib/
│   ├── event-bus.ts          ← Core implementation
│   ├── event-types.ts        ← Type definitions
│   ├── event-emitter.ts      ← Hook wrapper
│   └── index.ts              ← Public API
├── package.json
└── tsconfig.json
```

### Success Check

- [ ] EventBus class compiles
- [ ] subscribe/emit work
- [ ] TypeScript strict mode passes
- [ ] Unit tests pass

---

## 📝 Phase 2: Zustand Integration (12 hours)

### What You're Doing

```
Connect existing Zustand stores to event bus
```

### Daily Breakdown

```
DAY 3 (6 hours):
├─ auth.store.ts: Add events to setAuth(), clearAuth(), setTokens()
├─ toast.store.ts: Add event listeners for auth:error
└─ Create event-driven-store-setup.ts hook

DAY 4 (6 hours):
├─ Create useEventListener hook
├─ Test cleanup on unsubscribe
├─ Integration tests
└─ Verify no memory leaks
```

### Code Changes

**Auth Store:**

```typescript
// BEFORE
setAuth: (user, accessToken, refreshToken) => {
  set({ user, accessToken, refreshToken, isAuthenticated: true });
};

// AFTER
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
```

**useEventListener Hook:**

```typescript
export function useEventListener<E extends EventName>(
  eventName: E,
  callback: (data: EventMap[E]) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;
    return eventBus.subscribe(eventName, callback);
  }, [eventName, enabled]);
}
```

### Files Modified

```
libs/frontend/stores/src/lib/
├── auth.store.ts              ← Add event emissions
├── toast.store.ts             ← Add event listeners
├── event-driven-store-setup.ts ← NEW
└── hooks/useEventListener.ts   ← NEW
```

### Success Check

- [ ] Auth store emits events
- [ ] Toast store responds to auth:error
- [ ] No circular dependencies
- [ ] Cleanup properly unsubscribes

---

## 📝 Phase 3: MFE Stores (16 hours)

### What You're Doing

```
Create isolated local stores for each MFE that listen to events
```

### Daily Breakdown

```
DAYS 5-6 (10 hours):
├─ apps/chatbot-mfe/src/store/chatbot.store.ts
│  └─ Local state: conversations, messages, userContext
├─ Listen to user:logged-in → setUserContext()
├─ Listen to user:logged-out → clearState()
└─ useChatbotStoreInitialization() hook

DAYS 6-7 (6 hours):
├─ apps/admin-mfe/src/store/admin.store.ts
├─ apps/profile-mfe/src/store/profile.store.ts
└─ Integration tests for all stores
```

### Store Pattern

```typescript
// Chatbot Store
export const useChatbotStore = create<ChatbotState>((set) => ({
  conversations: [],
  messages: [],
  currentUserContext: null,

  setConversations: (convs) => set({ conversations: convs }),
  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, msg],
    })),
}));

// Initialization hook
export function useChatbotStoreInitialization() {
  useEffect(() => {
    // Subscribe to events
    const unsub1 = eventBus.on('user:logged-in', (event) => {
      useChatbotStore.setState({
        currentUserContext: {
          userId: event.userId,
          email: event.user.email,
        },
      });
    });

    const unsub2 = eventBus.on('user:logged-out', () => {
      useChatbotStore.setState({
        conversations: [],
        messages: [],
        currentUserContext: null,
      });
    });

    // Cleanup
    return () => {
      unsub1();
      unsub2();
    };
  }, []);
}
```

### Files Created

```
apps/chatbot-mfe/src/store/
└── chatbot.store.ts           ← NEW

apps/admin-mfe/src/store/
└── admin.store.ts             ← NEW

apps/profile-mfe/src/store/
└── profile.store.ts           ← NEW
```

### Success Check

- [ ] Each MFE has isolated store
- [ ] Stores properly listen to events
- [ ] No data leakage between MFEs
- [ ] Stores initialize correctly

---

## 📝 Phase 4: Component Refactor (14 hours)

### What You're Doing

```
Update components to use new event-driven stores instead of shared state
```

### Daily Breakdown

```
DAYS 8-9 (10 hours):
├─ Auth MFE: Update Login/Register components
├─ Chatbot MFE: Update chat components to use chatbot.store
├─ Admin MFE: Update admin components
└─ Profile MFE: Update profile components

DAY 10 (4 hours):
├─ Update Shell app initialization
├─ Integration testing
└─ Manual testing on all MFEs
```

### Component Pattern

```typescript
// BEFORE
function ChatPage() {
  // ❌ Tightly coupled to shared auth store
  const user = useAuthStore((s) => s.user);
  const conversations = useAuthStore((s) => s.conversations);

  return <div>{user.name}: {conversations.length} chats</div>;
}

// AFTER
function ChatPage() {
  // ✅ Initialize MFE-specific store listeners
  useChatbotStoreInitialization();

  // ✅ Use local MFE store
  const { currentUserContext, conversations } = useChatbotStore();

  return (
    <div>
      {currentUserContext?.userId}: {conversations.length} chats
    </div>
  );
}
```

### Shell App Initialization

```typescript
// apps/shell/src/App.tsx
function App() {
  // Initialize shared store event subscriptions
  useEventDrivenStores();

  return (
    <Router>
      {/* MFE routes */}
    </Router>
  );
}
```

### Files Modified

```
apps/auth-mfe/src/pages/
├── Login.tsx                   ← Uses auth.store
└── Register.tsx                ← Uses auth.store

apps/chatbot-mfe/src/pages/
├── ChatPage.tsx                ← Uses chatbot.store
└── ConversationList.tsx        ← Uses chatbot.store

apps/admin-mfe/src/pages/
├── Dashboard.tsx               ← Uses admin.store
└── UserManagement.tsx          ← Uses admin.store

apps/profile-mfe/src/pages/
├── ProfilePage.tsx             ← Uses profile.store
└── Settings.tsx                ← Uses profile.store

apps/shell/src/
├── App.tsx                     ← Initialize event bus
└── Router.tsx
```

### Success Check

- [ ] All components compile
- [ ] No shared store access (except auth/toast)
- [ ] Event listeners properly initialized
- [ ] Manual testing passes on all MFEs

---

## 📝 Phase 5: Testing & Documentation (20 hours)

### What You're Doing

```
Complete testing, create debugging tools, write comprehensive docs
```

### Daily Breakdown

```
DAYS 11-12 (10 hours):
├─ Unit tests for EventBus (subscribe, emit, once, clear)
├─ Integration tests (store → event → store flows)
├─ Memory leak tests
└─ Performance benchmarks

DAYS 13-14 (10 hours):
├─ Create EventBusDevTools monitor component
├─ Write comprehensive documentation
├─ Team training session
└─ Final testing & sign-off
```

### Testing Examples

```typescript
// Unit Test: EventBus
describe('EventBus', () => {
  it('should emit and subscribe', async () => {
    const listener = jest.fn();
    const unsub = eventBus.subscribe('test', listener);

    eventBus.emit('test', { data: 'value' });
    expect(listener).toHaveBeenCalledWith({ data: 'value' });

    unsub();
    eventBus.emit('test', { data: 'value2' });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

// Integration Test: Store Flow
describe('User Login Flow', () => {
  it('should emit user:logged-in and update stores', () => {
    const loginListener = jest.fn();
    eventBus.subscribe('user:logged-in', loginListener);

    useAuthStore.getState().setAuth(mockUser, token, refreshToken);

    expect(loginListener).toHaveBeenCalledWith({
      userId: mockUser.id,
      user: mockUser,
      accessToken: token,
    });
  });
});
```

### DevTools Component

```typescript
// Development only
<EventBusMonitor debug={true} />

// Shows:
// 2025-11-18 10:23:45.123 - user:logged-in
//   └─ userId: '123'
//   └─ user.email: 'user@example.com'
// 2025-11-18 10:23:46.456 - conversation:created
//   └─ conversationId: 'conv-1'
```

### Documentation Files

```
docs/
├── EVENT_BUS_IMPLEMENTATION_PLAN.md    ← Full technical guide
├── EVENT_BUS_CODE_EXAMPLES.md          ← 50+ examples
├── EVENT_BUS_QUICK_REFERENCE.md        ← Quick lookup
├── EVENT_BUS_ACTION_PLAN.md            ← This file
└── (to create) EVENT_BUS_GUIDE.md      ← Developer guide
```

### Success Check

- [ ] > 90% code coverage
- [ ] All tests passing
- [ ] No memory leaks
- [ ] DevTools functional
- [ ] Docs complete
- [ ] Team trained

---

## 📊 Timeline Summary

```
WEEK 1
Mon      Tue      Wed      Thu      Fri
P1-A(4h) P1-B(4h) P2-A(6h) P2-B(6h) ✓Checkpoint

WEEK 2
Mon      Tue      Wed      Thu      Fri
P3-A(5h) P3-B(6h) P3-C(5h) P4-A(7h) P4-B(7h)

WEEK 3 (Days 11-14 only)
Mon      Tue      Wed      Thu
P5-A(5h) P5-B(5h) P5-C(5h) P5-D(5h)

✓ DONE! Event Bus Foundation Complete
```

---

## 🚀 Key Milestones

```
✓ Day 2:   EventBus core working
✓ Day 4:   Stores emitting & listening to events
✓ Day 7:   All MFE stores created
✓ Day 10:  All components refactored
✓ Day 14:  Testing complete, docs ready
✓ Day 14+: Deploy to staging
```

---

## 🎯 Next Phases Enabled

After Event Bus is done:

```
Weeks 3-6: GraphQL + REST Hybrid
├─ Event Bus coordinates Apollo cache invalidation
└─ REST APIs work during migration

Weeks 7-10: MongoDB + PostgreSQL Hybrid
├─ Event Bus coordinates multi-DB sync
└─ GraphQL abstracts database choice
```

---

## 📌 Remember

```
BEFORE:         ┌─────────────────────┐
                │   Shared Zustand    │
                │   (ALL MFEs couple  │
                │    to this)         │
                └─────────────────────┘

AFTER:          Event Bus
                ├─ Auth MFE: local store
                ├─ Chatbot MFE: local store
                ├─ Admin MFE: local store
                └─ Profile MFE: local store

Result: ✅ Independent, scalable, maintainable
```

---

**Status:** ✅ Ready for Week 1 Monday  
**Duration:** 2-3 weeks (70 hours, 1-2 devs)  
**Files:** Quick Reference | Full Plan: EVENT_BUS_IMPLEMENTATION_PLAN.md
