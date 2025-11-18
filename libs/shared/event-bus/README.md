# Shared Event Bus

Zero-coupling event-driven communication library for micro-frontends.

## Features

- ✅ Type-safe pub/sub event system
- ✅ React hooks for easy integration
- ✅ Event history for debugging
- ✅ Memory leak prevention with auto-cleanup
- ✅ Singleton pattern for global bus
- ✅ >90% test coverage

## Installation

The library is already configured in the monorepo. Import from:

```typescript
import { getEventBus, EVENT_NAMES, useEventBus } from '@myapp/shared/event-bus';
```

## Quick Start

### 1. Emit Events

```typescript
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

const eventBus = getEventBus();

// Emit user login event
await eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
  user: {
    id: '123',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user',
  },
  timestamp: Date.now(),
});
```

### 2. Subscribe to Events (React Hook)

```typescript
import { useEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

function MyComponent() {
  useEventBus(EVENT_NAMES.USER_LOGGED_IN, (event) => {
    console.log('User logged in:', event.user.email);
    // Update component state, show notification, etc.
  });

  return <div>My Component</div>;
}
```

### 3. Subscribe to Events (Manual)

```typescript
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

const eventBus = getEventBus();

const unsubscribe = eventBus.subscribe(EVENT_NAMES.USER_LOGGED_OUT, (event) => {
  console.log('User logged out:', event.userId);
});

// Clean up when done
unsubscribe();
```

## Available Events

See `libs/shared/event-bus/src/lib/event-types.ts` for all event types.

### User Events

- `user:logged-in`
- `user:logged-out`
- `user:profile-updated`
- `user:role-changed`

### Toast Events

- `toast:show`
- `toast:dismiss`

### Navigation Events

- `navigation:requested`
- `route:changed`

### Chatbot Events

- `chat:message-sent`
- `chat:message-received`
- `conversation:created`
- `conversation:deleted`
- `conversation:updated`

### Admin Events

- `admin:dashboard-refresh`
- `user:banned`
- `user:unbanned`

### Theme Events

- `theme:changed`

### Error Events

- `error:occurred`
- `network:error`

## Testing

Run tests:

```bash
nx test shared-event-bus
```

Run with coverage:

```bash
nx test shared-event-bus --coverage
```

## Architecture

The event bus uses a singleton pattern to ensure all MFEs communicate through the same instance:

```
┌─────────────┐        ┌─────────────┐
│  Auth MFE   │───────▶│             │
└─────────────┘        │             │
                       │  Event Bus  │
┌─────────────┐        │  (Singleton)│
│ Chatbot MFE │───────▶│             │
└─────────────┘        │             │
                       └─────────────┘
┌─────────────┐               │
│  Admin MFE  │◀──────────────┘
└─────────────┘
```

## Best Practices

1. **Always clean up subscriptions** in React components using useEffect cleanup
2. **Use typed event names** from EVENT_NAMES constant
3. **Handle errors in listeners** - the bus catches errors but you should handle them gracefully
4. **Keep event payloads serializable** - no functions or circular references
5. **Use meaningful event names** following the pattern `domain:action`

## License

MIT
