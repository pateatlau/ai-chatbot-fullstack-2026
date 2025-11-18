# Event Bus: Quick Reference Guide

**Document Type:** Quick Reference  
**Created:** November 18, 2025  
**Use Case:** Fast lookup during implementation

---

## 🎯 QUICK LINKS

| Document                                                               | Purpose                                   |
| ---------------------------------------------------------------------- | ----------------------------------------- |
| [EVENT_BUS_IMPLEMENTATION_PLAN.md](./EVENT_BUS_IMPLEMENTATION_PLAN.md) | 5-phase implementation roadmap (70 hours) |
| [EVENT_BUS_CODE_EXAMPLES.md](./EVENT_BUS_CODE_EXAMPLES.md)             | Complete code samples & patterns          |
| [HYBRID_ARCHITECTURE_DIAGRAM.md](./HYBRID_ARCHITECTURE_DIAGRAM.md)     | System architecture diagrams              |

---

## 📋 ARCHITECTURE AT A GLANCE

```
BEFORE (Tightly Coupled)
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth MFE     │  │ Chatbot MFE  │  │ Admin MFE    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
              (Shared Zustand Store)

AFTER (Zero Coupled)
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Local Store  │  │ Local Store  │  │ Local Store  │
│ (Zustand)    │  │ (Zustand)    │  │ (Zustand)    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
              EVENT BUS (Pub/Sub)
         (Zero shared state)
```

---

## 🚀 IMPLEMENTATION TIMELINE

| Phase     | Duration          | Goal                      | Key Tasks                               |
| --------- | ----------------- | ------------------------- | --------------------------------------- |
| **1**     | 2 days (8h)       | Foundation                | Create event bus package & core classes |
| **2**     | 2 days (12h)      | Integration               | Connect event bus to Zustand stores     |
| **3**     | 3 days (16h)      | MFE Stores                | Create stores for each MFE              |
| **4**     | 3 days (14h)      | Refactor                  | Update MFE components to use events     |
| **5**     | 4 days (20h)      | Testing                   | Unit tests, integration tests, docs     |
| **TOTAL** | **3 weeks (70h)** | **Complete Architecture** | **All MFEs using event bus**            |

---

## 🔧 CORE APIS

### Event Bus Methods

```typescript
// Subscribe to event
const unsubscribe = eventBus.subscribe('event:name', (data) => {
  console.log(data);
});

// Emit event
await eventBus.emit('event:name', {
  /* data */
});

// Subscribe once
eventBus.once('event:name', (data) => {
  console.log('Called once, then unsubscribed');
});

// Get listener count
const count = eventBus.getListenerCount('event:name');

// Clear listeners
eventBus.clear('event:name'); // For one event
eventBus.clear(); // For all events
```

### React Hooks

```typescript
// Listen to event
useEventListener('event:name', (event) => {
  // Handles subscription + cleanup
});

// Listen once
useEventListenerOnce('event:name', (event) => {
  // Auto-unsubscribes after first call
});

// Emit event (type-safe)
const { emit } = useEventEmitter();
await emit('event:name', {
  /* data */
});
```

---

## 📚 EVENT CATEGORIES

### Authentication Events

```typescript
// User login
'user:logged-in' → UserLoggedInEvent
  ├── userId: string
  ├── user: { id, email, name, role, avatar }
  ├── accessToken: string
  ├── refreshToken: string
  └── loginTime: ISO8601

// User logout
'user:logged-out' → UserLoggedOutEvent
  ├── userId: string
  ├── logoutTime: ISO8601
  └── reason: 'user_initiated' | 'session_expired' | 'token_revoked'

// Token refresh
'token:refreshed' → TokenRefreshedEvent
  ├── userId: string
  ├── accessToken: string
  ├── expiresIn: number
  └── refreshTime: ISO8601

// Auth error
'auth:error' → AuthErrorEvent
  ├── error: string
  ├── code: string
  ├── details?: any
  └── timestamp: ISO8601
```

### Conversation Events

```typescript
// Conversation created
'conversation:created' → ConversationCreatedEvent
  ├── conversationId: string
  ├── userId: string
  ├── title: string
  └── createdAt: ISO8601

// Conversation updated
'conversation:updated' → ConversationUpdatedEvent
  ├── conversationId: string
  ├── userId: string
  ├── changes: { title?, isArchived?, metadata? }
  └── updatedAt: ISO8601

// Conversation deleted
'conversation:deleted' → ConversationDeletedEvent
  ├── conversationId: string
  ├── userId: string
  ├── deletedAt: ISO8601
  └── reason?: string
```

### Message Events

```typescript
// Message sent
'message:sent' → MessageSentEvent
  ├── messageId: string
  ├── conversationId: string
  ├── userId: string
  ├── role: 'user' | 'assistant'
  ├── content: string
  ├── sentAt: ISO8601
  └── metadata?: { tokenCount?, model? }

// Message error
'message:error' → MessageErrorEvent
  ├── conversationId: string
  ├── error: string
  ├── errorCode: string
  ├── timestamp: ISO8601
  └── retryable: boolean
```

---

## 💡 COMMON PATTERNS

### Pattern 1: Emit on Store Change

```typescript
// In store definition
setAuth: (user, accessToken, refreshToken) => {
  set({ user, accessToken, refreshToken });

  // Emit event
  eventBus.emit('user:logged-in', {
    userId: user.id,
    user,
    accessToken,
    refreshToken,
    loginTime: new Date().toISOString(),
  });
};
```

### Pattern 2: Listen to Event in Component

```typescript
function MyComponent() {
  useEffect(() => {
    return useEventListener('user:logged-in', (event) => {
      console.log('User logged in:', event.user.email);
      // Update component state
    });
  }, []);

  return <div>...</div>;
}
```

### Pattern 3: Listen to Event in Store

```typescript
export function useMyStoreInitialization() {
  useEffect(() => {
    const unsubscribe = useEventListener('user:logged-in', (event) => {
      useMyStore.getState().setUserContext({
        userId: event.userId,
        email: event.user.email,
      });
    });

    return () => unsubscribe();
  }, []);
}
```

### Pattern 4: Emit Then Update Store

```typescript
async function handleAction() {
  // Update store
  updateStore(newState);

  // Emit event for others to listen
  await emit('event:name', {
    /* data */
  });
}
```

---

## 🔍 FILE STRUCTURE

```
libs/frontend/
├── event-bus/                       ← NEW PACKAGE
│   ├── src/
│   │   ├── lib/
│   │   │   ├── event-bus.ts         (Core EventBus class)
│   │   │   ├── event-types.ts       (EventMap interface)
│   │   │   ├── event-emitter.ts     (Type-safe hooks)
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── stores/                          ← UPDATED
│   ├── src/
│   │   ├── lib/
│   │   │   ├── auth.store.ts        (Emits auth events)
│   │   │   ├── toast.store.ts       (Listens to auth:error)
│   │   │   ├── event-driven-store-setup.ts (Initialize)
│   │   │   └── index.ts
│   │   └── index.ts
│   └── package.json
│
└── hooks/                           ← UPDATED
    ├── src/
    │   ├── lib/
    │   │   ├── useEventListener.ts   (Type-safe hook)
    │   │   ├── useEventEmitter.ts    (Emit hook)
    │   │   └── index.ts
    │   └── index.ts
    └── package.json

apps/
├── auth-mfe/                        ← UPDATED
│   ├── src/
│   │   └── pages/
│   │       ├── Login.tsx            (Emits user:logged-in)
│   │       └── Register.tsx         (Emits events)
│
├── chatbot-mfe/                     ← UPDATED
│   ├── src/
│   │   ├── store/
│   │   │   └── chatbot.store.ts     (NEW - Local store)
│   │   └── components/
│   │       ├── ChatPage.tsx         (Listens to events)
│   │       └── MessageInput.tsx     (Emits events)
│
├── admin-mfe/                       ← UPDATED
│   ├── src/
│   │   ├── store/
│   │   │   └── admin.store.ts       (NEW - Local store)
│   │   └── components/
│   │       └── AdminPanel.tsx       (Listens to events)
│
└── profile-mfe/                     ← UPDATED
    ├── src/
    │   ├── store/
    │   │   └── profile.store.ts     (NEW - Local store)
    │   └── components/
    │       └── ProfilePage.tsx      (Listens to events)
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (2 days)

- [ ] Create `libs/frontend/event-bus` package
- [ ] Implement `EventBus` class (subscribe, emit, once, clear)
- [ ] Define `EventMap` type interface
- [ ] Create `useEventEmitter` hook
- [ ] Add event-bus to Module Federation shared deps
- [ ] Unit tests passing

### Phase 2: Integration (2 days)

- [ ] Update `auth.store.ts` to emit events
- [ ] Update `toast.store.ts` to listen to events
- [ ] Create `useEventListener` hook
- [ ] Create `useEventDrivenStores` initialization hook
- [ ] Integration tests passing
- [ ] No memory leaks

### Phase 3: MFE Stores (3 days)

- [ ] Create `chatbot.store.ts` with event listeners
- [ ] Create `admin.store.ts` with event listeners
- [ ] Create `profile.store.ts` with event listeners
- [ ] Create initialization hooks for each MFE
- [ ] Update Module Federation shared packages
- [ ] Tests passing

### Phase 4: Refactor Components (3 days)

- [ ] Update Auth MFE (Login, Register)
- [ ] Update Chatbot MFE (ChatPage, MessageInput)
- [ ] Update Admin MFE components
- [ ] Update Profile MFE components
- [ ] Update Shell app initialization
- [ ] Manual testing on all MFEs

### Phase 5: Testing & Documentation (4 days)

- [ ] Unit tests for EventBus (90%+ coverage)
- [ ] Integration tests for store flows
- [ ] DevTools for debugging
- [ ] Monitor component for dev
- [ ] Comprehensive docs
- [ ] Team training completed

---

## 🆘 TROUBLESHOOTING QUICK ANSWERS

| Problem                | Solution                                   |
| ---------------------- | ------------------------------------------ |
| Events not received    | Check listener subscribed BEFORE emit      |
| Memory leaks           | Unsubscribe in useEffect cleanup           |
| Type errors            | Use provided EventMap for type safety      |
| Listener count growing | Use useEffect or custom hooks              |
| Circular events        | Use different event names or guard clauses |
| Event order issues     | Add console logging, use event history     |

See [EVENT_BUS_CODE_EXAMPLES.md](./EVENT_BUS_CODE_EXAMPLES.md#troubleshooting) for detailed solutions.

---

## 📊 PERFORMANCE METRICS

| Metric              | Target          | Why                      |
| ------------------- | --------------- | ------------------------ |
| Event emission      | <1ms            | Sub-millisecond overhead |
| Store update        | <5ms            | Smooth UI updates        |
| Memory per listener | <1KB            | Bounded overhead         |
| Event history size  | 1000 events max | Prevents memory leaks    |
| Listener count      | Unlimited       | Scalable to many MFEs    |

---

## 🎓 LEARNING RESOURCES

1. **Observer Pattern** - Classic pub/sub pattern
2. **Event Emitter** - Node.js events module
3. **Redux DevTools** - Event history inspiration
4. **RxJS** - Advanced reactive patterns

---

## 📞 SUPPORT & QUESTIONS

### For Architecture Questions

→ See [EVENT_BUS_IMPLEMENTATION_PLAN.md](./EVENT_BUS_IMPLEMENTATION_PLAN.md)

### For Code Examples

→ See [EVENT_BUS_CODE_EXAMPLES.md](./EVENT_BUS_CODE_EXAMPLES.md)

### For System Architecture

→ See [HYBRID_ARCHITECTURE_DIAGRAM.md](./HYBRID_ARCHITECTURE_DIAGRAM.md)

---

## 🔗 RELATED DOCUMENTS

- [CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md](./CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md) - Overall project roadmap
- [SHELL_APP_ROUTING_IMPLEMENTATION.md](./SHELL_APP_ROUTING_IMPLEMENTATION.md) - Current routing setup
- [HYBRID_ARCHITECTURE_DIAGRAM.md](./HYBRID_ARCHITECTURE_DIAGRAM.md) - System architecture

---

**Version:** 1.0  
**Last Updated:** November 18, 2025  
**Status:** Ready for implementation

**Next Steps:**

1. Review [EVENT_BUS_IMPLEMENTATION_PLAN.md](./EVENT_BUS_IMPLEMENTATION_PLAN.md)
2. Create GitHub issues for each phase
3. Begin Phase 1: Foundation
4. Ask questions in team sync
