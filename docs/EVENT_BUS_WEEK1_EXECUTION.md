# Event Bus - Week 1 Monday Execution Checklist

**Date:** Monday, Week 1 (November 18, 2025)  
**Duration:** 2 Weeks (10 dev-days)  
**Team:** 1-2 developers  
**Status:** ✅ Ready to Start

---

## 🎯 Start Your Day Monday

```
9:00 AM   - Team standup (5 min)
           "Starting Event Bus Phase 1: Foundation"

9:05 AM   - Read EVENT_BUS_IMPLEMENTATION_PLAN.md (10 min)

9:15 AM   - Start Development (see Tasks below)
```

---

## 📋 WEEK 1 TASKS

### Monday: Phase 1A - EventBus Core (4 hours)

**Create Event Bus Package:**

```bash
# Terminal 1: Create package structure
mkdir -p libs/frontend/event-bus/src/lib
cd libs/frontend/event-bus

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@myapp/frontend/event-bus",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "require": "./src/index.ts"
    }
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "module": "esnext"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

**Task Checklist - Monday:**

- [ ] Create `libs/frontend/event-bus/src/lib/event-bus.ts`
  - [ ] Implement EventBus class
  - [ ] subscribe() method
  - [ ] emit() method
  - [ ] unsubscribe() method
  - [ ] once() method
  - [ ] Event history tracking
- [ ] Create `libs/frontend/event-bus/src/lib/event-types.ts`
  - [ ] Define EventMap interface
  - [ ] Define event type names
  - [ ] Export EventName type
- [ ] Create `libs/frontend/event-bus/src/index.ts`
  - [ ] Export EventBus class
  - [ ] Export eventBus singleton
  - [ ] Export types
- [ ] Write unit tests for EventBus
  - [ ] subscribe() works
  - [ ] emit() works
  - [ ] unsubscribe() works
  - [ ] once() works
- [ ] Git commit: `feat(event-bus): core EventBus implementation`

**Code Template (event-bus.ts):**

```typescript
type EventListener<T> = (data: T) => void | Promise<void>;

export class EventBus {
  private listeners: Map<string, Set<EventListener<any>>> = new Map();
  private eventHistory: Array<{ name: string; data: any; timestamp: number }> =
    [];
  private maxHistorySize = 1000;

  subscribe<T>(eventName: string, listener: EventListener<T>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(listener);

    return () => this.unsubscribe(eventName, listener);
  }

  async emit<T>(eventName: string, data: T): Promise<void> {
    this.recordEvent(eventName, data);
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      const promises = Array.from(listeners).map((listener) =>
        Promise.resolve(listener(data)).catch((err) =>
          console.error(`Error in listener for ${eventName}:`, err)
        )
      );
      await Promise.all(promises);
    }
  }

  unsubscribe<T>(eventName: string, listener: EventListener<T>): void {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  once<T>(eventName: string, listener: EventListener<T>): void {
    const wrappedListener = (data: T) => {
      listener(data);
      this.unsubscribe(eventName, wrappedListener);
    };
    this.subscribe(eventName, wrappedListener);
  }

  private recordEvent<T>(eventName: string, data: T): void {
    this.eventHistory.push({
      name: eventName,
      data,
      timestamp: Date.now(),
    });
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  getEventHistory() {
    return this.eventHistory;
  }

  clear(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventBus = new EventBus();
```

---

### Tuesday: Phase 1B - Types & Hooks (4 hours)

**Task Checklist - Tuesday:**

- [ ] Create `libs/frontend/event-bus/src/lib/event-types.ts`
  - [ ] Define EventMap with all event types
  - [ ] Create type-safe EventName type
  - [ ] Document each event type
- [ ] Create `libs/frontend/event-bus/src/lib/event-emitter.ts`
  - [ ] Create useEventEmitter hook
  - [ ] Type-safe emit wrapper
  - [ ] Type-safe subscribe wrapper
- [ ] Update `nx.json`
  - [ ] Add event-bus to tsconfig paths
  - [ ] Configure as shared in Module Federation
- [ ] Write additional unit tests
  - [ ] Type safety verification
  - [ ] Event history tracking
  - [ ] Event cleanup
- [ ] Documentation
  - [ ] Create lib/README.md
  - [ ] Document EventBus API
  - [ ] Document event types
- [ ] Git commit: `feat(event-bus): event types and hooks`

**Code Template (event-types.ts):**

```typescript
export type EventMap = {
  // Authentication
  'user:logged-in': {
    userId: string;
    user: any;
    accessToken: string;
    loginTime: string;
  };
  'user:logged-out': { userId: string; logoutTime: string; reason: string };
  'token:refreshed': {
    userId: string;
    accessToken: string;
    expiresIn: number;
    refreshTime: string;
  };
  'session:expired': { userId: string; expiredAt: string };
  'auth:error': { error: string; code?: string };

  // Conversations
  'conversation:created': {
    conversationId: string;
    title: string;
    createdAt: string;
  };
  'conversation:updated': { conversationId: string; updates: any };
  'conversation:deleted': { conversationId: string };

  // Messages
  'message:sent': {
    messageId: string;
    conversationId: string;
    content: string;
    timestamp: string;
  };
  'message:received': {
    messageId: string;
    conversationId: string;
    content: string;
    sender: any;
  };
  'message:error': { error: string; conversationId: string };

  // Settings
  'settings:updated': { setting: string; value: any };
  'theme:changed': { theme: 'light' | 'dark' };
};

export type EventName = keyof EventMap;
```

**Code Template (event-emitter.ts):**

```typescript
import { eventBus } from './event-bus';
import type { EventMap, EventName } from './event-types';

export const useEventEmitter = () => ({
  emit<E extends EventName>(eventName: E, data: EventMap[E]) {
    return eventBus.emit(eventName, data);
  },

  on<E extends EventName>(eventName: E, listener: (data: EventMap[E]) => void) {
    return eventBus.subscribe(eventName, listener);
  },

  once<E extends EventName>(
    eventName: E,
    listener: (data: EventMap[E]) => void
  ) {
    return eventBus.once(eventName, listener);
  },

  off<E extends EventName>(
    eventName: E,
    listener: (data: EventMap[E]) => void
  ) {
    return eventBus.unsubscribe(eventName, listener);
  },

  clear(eventName?: E) {
    return eventBus.clear(eventName);
  },
});
```

**Friday - End of Week 1:**

- [ ] All Phase 1 tests passing
- [ ] EventBus core working
- [ ] Code review pass
- [ ] Git commit to feature branch
- [ ] Checkpoint meeting (10 min)

---

## 📋 WEEK 2 TASKS

### Wednesday: Phase 2A - Store Integration (6 hours)

**Task Checklist - Wednesday:**

- [ ] Update `libs/frontend/stores/src/lib/auth.store.ts`
  - [ ] Import eventBus
  - [ ] Add event emission in setAuth()
  - [ ] Add event emission in clearAuth()
  - [ ] Add event emission in setTokens()
- [ ] Update `libs/frontend/stores/src/lib/toast.store.ts`
  - [ ] Import eventBus
  - [ ] Add event listener for auth:error
  - [ ] Create subscribeToAuthErrors() method
- [ ] Create `libs/frontend/stores/src/lib/event-driven-store-setup.ts`
  - [ ] Create useEventDrivenStores hook
  - [ ] Initialize all event subscriptions
  - [ ] Setup cleanup
- [ ] Create `libs/frontend/hooks/src/lib/useEventListener.ts`
  - [ ] Type-safe event listener hook
  - [ ] Proper cleanup on unmount
- [ ] Unit tests
  - [ ] Auth store emits events
  - [ ] Toast store listens to events
- [ ] Git commit: `feat(stores): event-driven store integration`

---

### Thursday: Phase 2B - Testing & Cleanup (6 hours)

**Task Checklist - Thursday:**

- [ ] Write integration tests
  - [ ] Store-to-event flow
  - [ ] Event-to-store flow
  - [ ] Multiple listeners
- [ ] Verify memory cleanup
  - [ ] Unsubscribe works properly
  - [ ] No memory leaks
- [ ] Code review
  - [ ] All tests passing
  - [ ] No TypeScript errors
- [ ] Documentation
  - [ ] Update stores README
  - [ ] Document event flow
- [ ] Git commit: `test(stores): integration tests and cleanup`

---

### Monday Week 2: Phase 3A - Chatbot Store (5 hours)

**Task Checklist - Monday:**

- [ ] Create `apps/chatbot-mfe/src/store/chatbot.store.ts`
  - [ ] Define ChatbotState interface
  - [ ] Create useChatbotStore
  - [ ] Create useChatbotStoreInitialization() hook
  - [ ] Subscribe to user:logged-in
  - [ ] Subscribe to user:logged-out
- [ ] Write unit tests
  - [ ] Store creation
  - [ ] Event listener setup
- [ ] Git commit: `feat(chatbot-mfe): event-driven store`

---

### Tuesday Week 2: Phase 3B - Admin & Profile Stores (6 hours)

**Task Checklist - Tuesday:**

- [ ] Create `apps/admin-mfe/src/store/admin.store.ts`
  - [ ] Define AdminState interface
  - [ ] Create useAdminStore
  - [ ] Check admin permissions on login
- [ ] Create `apps/profile-mfe/src/store/profile.store.ts`
  - [ ] Define ProfileState interface
  - [ ] Create useProfileStore
  - [ ] Listen to profile:updated events
- [ ] Write unit tests for both stores
- [ ] Git commit: `feat(mfe-stores): admin and profile stores`

---

### Wednesday Week 2: Phase 3C - Integration Tests (5 hours)

**Task Checklist - Wednesday:**

- [ ] Write integration tests
  - [ ] All stores initialize correctly
  - [ ] Events trigger correct updates
  - [ ] No data leakage between MFEs
- [ ] Test all event flows
  - [ ] User login flow
  - [ ] User logout flow
  - [ ] Token refresh flow
- [ ] Code review pass
- [ ] Git commit: `test(mfe-stores): integration tests`

---

### Thursday Week 2: Phase 4A - Component Refactor Part 1 (7 hours)

**Task Checklist - Thursday:**

- [ ] Update Auth MFE components
  - [ ] Login.tsx: Use event-driven pattern
  - [ ] Register.tsx: Use event-driven pattern
- [ ] Update Chatbot MFE components
  - [ ] ChatPage.tsx: Call useChatbotStoreInitialization()
  - [ ] Use local useChatbotStore instead of shared store
- [ ] Update Shell app
  - [ ] Initialize event bus in App.tsx
  - [ ] Call useEventDrivenStores()
- [ ] Manual testing on all MFEs
- [ ] Git commit: `refactor(components): event-driven pattern part 1`

---

### Friday Week 2: Phase 4B - Component Refactor Part 2 (7 hours)

**Task Checklist - Friday:**

- [ ] Update Admin MFE components
  - [ ] Dashboard.tsx: Use admin.store
  - [ ] UserManagement.tsx: Use admin.store
- [ ] Update Profile MFE components
  - [ ] ProfilePage.tsx: Use profile.store
  - [ ] Settings.tsx: Use profile.store
- [ ] Full integration testing
  - [ ] All MFEs working
  - [ ] Cross-MFE communication working
  - [ ] No regressions
- [ ] Code review
- [ ] Git commit: `refactor(components): event-driven pattern complete`

---

## 📋 WEEK 3 TASKS

### Monday Week 3: Phase 5A - Unit Tests (5 hours)

**Task Checklist - Monday:**

- [ ] Write comprehensive unit tests
  - [ ] EventBus subscribe/emit/once/clear
  - [ ] Event type safety
  - [ ] Event history tracking
  - [ ] Error handling
- [ ] Achieve >90% code coverage
- [ ] Git commit: `test(event-bus): unit tests`

---

### Tuesday Week 3: Phase 5B - Integration Tests (5 hours)

**Task Checklist - Tuesday:**

- [ ] Write integration tests
  - [ ] Store-to-event flows
  - [ ] Event-to-store flows
  - [ ] Cross-MFE communication
- [ ] Test all event types
- [ ] Memory leak detection tests
- [ ] Git commit: `test(integration): complete event flows`

---

### Wednesday Week 3: Phase 5C - DevTools & Docs (5 hours)

**Task Checklist - Wednesday:**

- [ ] Create EventBusDevTools component
  - [ ] Event history inspector
  - [ ] Real-time event monitor
  - [ ] Performance profiler
- [ ] Write comprehensive documentation
  - [ ] Architecture guide
  - [ ] Integration examples
  - [ ] Migration guide
- [ ] Create debugging guide
- [ ] Git commit: `feat(devtools): event bus monitoring and docs`

---

### Thursday Week 3: Phase 5D - Training & Sign-off (5 hours)

**Task Checklist - Thursday:**

- [ ] Team training session (1 hour)
  - [ ] Event Bus architecture
  - [ ] How to use EventBus
  - [ ] Common patterns
  - [ ] Debugging guide
- [ ] Final code review
  - [ ] All tests passing
  - [ ] No TypeScript errors
  - [ ] Documentation complete
- [ ] Performance verification
  - [ ] Event emission <1ms
  - [ ] Store updates <5ms
  - [ ] No memory leaks
- [ ] Staging deployment prep
- [ ] Git commit: `docs: comprehensive event bus guide`

---

### Friday Week 3: Deployment

- [ ] All Phase 5 complete
- [ ] Merge to develop
- [ ] Deploy to staging
- [ ] Smoke tests on staging
- [ ] ✅ **EVENT BUS COMPLETE!**

---

## ✅ Definition of Done Checklist

- [ ] EventBus library created
- [ ] All stores updated to emit/listen to events
- [ ] All MFE stores created (chatbot, admin, profile)
- [ ] All components refactored to use local stores
- [ ] > 90% code coverage achieved
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Documentation complete
- [ ] DevTools working
- [ ] Team trained
- [ ] Zero regressions detected
- [ ] Deployed to staging
- [ ] Performance metrics verified

---

## 📝 Daily Standup Template

**Every Morning (9 AM):**

```
Yesterday:
- [what you completed yesterday]

Today:
- [what you're working on today]

Blockers:
- [any blockers or questions]
```

**Friday Weekly Sync:**

```
This Week Completed:
- Phase [X] tasks

Next Week Plan:
- Phase [X+1] tasks

Metrics:
- Code coverage: XX%
- Tests passing: XX/XX
- TypeScript errors: X
```

---

## 🚀 Resources & Links

- Full Plan: `docs/EVENT_BUS_IMPLEMENTATION_PLAN.md`
- Quick Start: `docs/EVENT_BUS_QUICK_START.md`
- Code Examples: `docs/EVENT_BUS_CODE_EXAMPLES.md`
- Architecture: `CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md`

---

## 🎯 Success Criteria (End of Week 3)

✅ Event Bus fully functional  
✅ All stores integrated  
✅ All components refactored  
✅ >90% code coverage  
✅ Deployed to staging  
✅ Team trained  
✅ Ready for Phase 2 (GraphQL)

---

**Status:** ✅ Ready for Monday Week 1  
**Duration:** 3 weeks (exact)  
**Team:** 1-2 developers  
**Effort:** 70 hours total
