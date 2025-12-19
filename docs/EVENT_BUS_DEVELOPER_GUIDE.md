# Event-Driven Architecture Developer Guide

## Overview

This guide helps developers work with the event-driven architecture in our MFE application.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [Event Names & Types](#event-names--types)
4. [Emitting Events](#emitting-events)
5. [Subscribing to Events](#subscribing-to-events)
6. [Store Integration](#store-integration)
7. [Best Practices](#best-practices)
8. [Testing](#testing)
9. [Debugging](#debugging)
10. [Common Patterns](#common-patterns)

---

## Getting Started

### Prerequisites

- Node.js 18+
- Nx CLI installed
- Familiarity with React hooks
- Understanding of pub/sub pattern

### Quick Setup

```bash
# Install dependencies
npm install

# Start development server
nx serve shell

# Run tests
nx test shared-event-bus
```

---

## Core Concepts

### Event Bus

Centralized pub/sub system for zero-coupling communication between MFEs.

**Key Features:**

- Type-safe event emission
- Automatic listener cleanup
- Event history tracking
- Development DevTools

### Event Flow

```
Component A (emit) → Event Bus → Component B (listen)
                              → Component C (listen)
                              → Component D (listen)
```

**Zero Coupling**: Components don't know about each other.

---

## Event Names & Types

### Standard Event Names

Events are defined in `libs/shared/event-bus/src/lib/event-names.ts`:

```typescript
export const EVENT_NAMES = {
  // Authentication
  USER_LOGGED_IN: 'user:logged-in',
  USER_LOGGED_OUT: 'user:logged-out',

  // Profile
  USER_PROFILE_UPDATED: 'user:profile-updated',
  USER_AVATAR_CHANGED: 'user:avatar-changed',

  // Chatbot
  CONVERSATION_CREATED: 'chatbot:conversation-created',
  CONVERSATION_DELETED: 'chatbot:conversation-deleted',
  CONVERSATION_UPDATED: 'chatbot:conversation-updated',

  // Admin
  USER_ROLE_CHANGED: 'admin:user-role-changed',
  USER_STATUS_CHANGED: 'admin:user-status-changed',

  // Settings
  THEME_CHANGED: 'settings:theme-changed',
} as const;
```

### Event Payload Types

```typescript
// Authentication events
interface UserLoggedInPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

interface UserLoggedOutPayload {
  // Empty - no data needed
}

// Profile events
interface UserProfileUpdatedPayload {
  userId: string;
  updates: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    isActive?: boolean;
  };
}

// Chatbot events
interface ConversationCreatedPayload {
  conversationId: string;
  title: string;
  userId: string;
}

// Theme events
interface ThemeChangedPayload {
  theme: 'light' | 'dark';
  userId?: string;
}
```

---

## Emitting Events

### Basic Emission

```typescript
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

// Get event bus instance
const eventBus = getEventBus();

// Emit an event
eventBus.emit(EVENT_NAMES.USER_LOGGED_IN, {
  userId: '123',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'user',
});
```

### In React Components

```typescript
import { useEventBus } from '@myapp/shared/event-bus';

function LoginComponent() {
  const { emit } = useEventBus();

  const handleLogin = async () => {
    const response = await authService.login(credentials);

    // Emit event after successful login
    emit(EVENT_NAMES.USER_LOGGED_IN, {
      userId: response.user.id,
      email: response.user.email,
      name: response.user.name,
      role: response.user.role,
    });
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### After API Calls

```typescript
// After profile update
const handleUpdateProfile = async (data: ProfileData) => {
  try {
    await profileAPI.updateProfile(userId, data);

    // Emit event to notify other components
    const eventBus = getEventBus();
    eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
      userId,
      updates: data,
    });

    showToast('Profile updated successfully', 'success');
  } catch (error) {
    showToast('Failed to update profile', 'error');
  }
};
```

---

## Subscribing to Events

### Using Hook (Recommended)

```typescript
import { useEventListener } from '@myapp/shared/event-bus';

function ProfileComponent() {
  const { user, updateUser } = useProfileStore();

  // Listen for profile updates
  useEventListener(
    EVENT_NAMES.USER_PROFILE_UPDATED,
    (event) => {
      if (event.userId === user?.id) {
        // Update local state
        updateUser(event.updates);
      }
    }
  );

  return <div>{user?.name}</div>;
}
```

### Manual Subscription

```typescript
useEffect(() => {
  const eventBus = getEventBus();

  const unsubscribe = eventBus.subscribe(EVENT_NAMES.USER_LOGGED_OUT, () => {
    // Clear user data
    clearUserData();
  });

  // Cleanup on unmount
  return () => unsubscribe();
}, []);
```

### Multiple Events

```typescript
function UserComponent() {
  // Listen to multiple events
  useEventListener(EVENT_NAMES.USER_LOGGED_IN, handleLogin);
  useEventListener(EVENT_NAMES.USER_LOGGED_OUT, handleLogout);
  useEventListener(EVENT_NAMES.USER_PROFILE_UPDATED, handleUpdate);

  return <div>User Component</div>;
}
```

---

## Store Integration

### Store Initialization Pattern

Each MFE store has an initialization hook that subscribes to relevant events.

**Example: Profile Store**

```typescript
// libs/frontend/stores/src/lib/profile.store.ts

export const useProfileStoreInitialization = () => {
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const clearProfile = useProfileStore((state) => state.clearProfile);

  // Listen for login
  useEventListener(EVENT_NAMES.USER_LOGGED_IN, (event) => {
    updateProfile({
      id: event.userId,
      email: event.email,
      name: event.name,
      role: event.role,
    });
  });

  // Listen for logout
  useEventListener(EVENT_NAMES.USER_LOGGED_OUT, () => {
    clearProfile();
  });

  // Listen for profile updates
  useEventListener(EVENT_NAMES.USER_PROFILE_UPDATED, (event) => {
    updateProfile(event.updates);
  });
};
```

### Using in Components

```typescript
function ProfilePage() {
  // Initialize store event listeners
  useProfileStoreInitialization();

  const { profile } = useProfileStore();

  return <div>{profile.name}</div>;
}
```

---

## Best Practices

### 1. Event Naming

✅ **DO:**

```typescript
'user:logged-in'; // Namespaced, past tense
'chatbot:conversation-created';
'settings:theme-changed';
```

❌ **DON'T:**

```typescript
'userLogin'; // No namespace, present tense
'newConversation'; // Ambiguous
'change-theme'; // Imperative
```

### 2. Event Payloads

✅ **DO:**

```typescript
// Include all relevant data
emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
  userId: '123',
  updates: { name: 'John', email: 'john@example.com' },
  timestamp: Date.now(),
});
```

❌ **DON'T:**

```typescript
// Missing context
emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
  name: 'John', // No userId!
});

// Payload too large
emit(EVENT_NAMES.USER_LOGGED_IN, {
  ...entireUserObject, // 500+ fields
  ...entireCompanyObject,
});
```

### 3. Listener Cleanup

✅ **DO:**

```typescript
useEffect(() => {
  const unsubscribe = eventBus.subscribe(eventName, handler);
  return () => unsubscribe(); // Always cleanup
}, []);
```

❌ **DON'T:**

```typescript
useEffect(() => {
  eventBus.subscribe(eventName, handler);
  // No cleanup = memory leak!
}, []);
```

### 4. Error Handling

✅ **DO:**

```typescript
useEventListener(EVENT_NAMES.USER_PROFILE_UPDATED, (event) => {
  try {
    updateProfile(event.updates);
  } catch (error) {
    console.error('Failed to update profile:', error);
    showToast('Update failed', 'error');
  }
});
```

❌ **DON'T:**

```typescript
useEventListener(EVENT_NAMES.USER_PROFILE_UPDATED, (event) => {
  updateProfile(event.updates); // No error handling!
});
```

### 5. Type Safety

✅ **DO:**

```typescript
interface UserLoggedInEvent {
  userId: string;
  email: string;
  name: string;
  role: string;
}

useEventListener<UserLoggedInEvent>(EVENT_NAMES.USER_LOGGED_IN, (event) => {
  console.log(event.userId); // Type-safe!
});
```

❌ **DON'T:**

```typescript
useEventListener(EVENT_NAMES.USER_LOGGED_IN, (event: any) => {
  console.log(event.userId); // No type safety
});
```

---

## Testing

### Unit Testing Event Emission

```typescript
import { getEventBus } from '@myapp/shared/event-bus';

describe('LoginComponent', () => {
  it('should emit USER_LOGGED_IN event', async () => {
    const eventBus = getEventBus();
    const listener = vi.fn();

    eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, listener);

    // Perform login
    await userEvent.click(screen.getByText('Login'));

    // Verify event emitted
    expect(listener).toHaveBeenCalledWith({
      userId: '123',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'user',
    });
  });
});
```

### Testing Event Listeners

```typescript
describe('ProfileComponent', () => {
  it('should update when USER_PROFILE_UPDATED event fires', () => {
    render(<ProfileComponent />);

    const eventBus = getEventBus();

    // Emit event
    eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
      userId: '123',
      updates: { name: 'New Name' },
    });

    // Verify UI updated
    expect(screen.getByText('New Name')).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
describe('Authentication Flow', () => {
  it('should coordinate login across MFEs', async () => {
    // Setup listeners
    const profileListener = vi.fn();
    const chatbotListener = vi.fn();

    eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, profileListener);
    eventBus.subscribe(EVENT_NAMES.USER_LOGGED_IN, chatbotListener);

    // Trigger login
    await authService.login(credentials);

    // Both MFEs notified
    expect(profileListener).toHaveBeenCalled();
    expect(chatbotListener).toHaveBeenCalled();
  });
});
```

---

## Debugging

### Using DevTools

1. **Open DevTools**: Press `Ctrl+Shift+E`
2. **Event History**: See all emitted events
3. **Performance**: Monitor event throughput
4. **Configuration**: Adjust settings

### Console Logging

```typescript
// Enable logging in development
const eventBus = new EventBus({
  enableLogging: true,
});

// Logs will show:
// [EventBus] Emitted: user:logged-in
// [EventBus] Listener executed for: user:logged-in
```

### Inspecting Event History

```typescript
const eventBus = getEventBus();
const history = eventBus.getEventHistory();

console.log('Recent events:', history.slice(-10));
```

---

## Common Patterns

### 1. Request-Response Pattern

For operations requiring confirmation:

```typescript
// Requester
emit(EVENT_NAMES.CHATBOT_MESSAGE_SENT, {
  messageId: '123',
  requestId: generateId(),
});

// Responder
useEventListener(EVENT_NAMES.CHATBOT_MESSAGE_RESPONSE, (event) => {
  if (event.requestId === myRequestId) {
    handleResponse(event.data);
  }
});
```

### 2. Event Chaining

One event triggers another:

```typescript
// Step 1: Login
emit(EVENT_NAMES.USER_LOGGED_IN, userData);

// Step 2: Profile store listens and loads data
useEventListener(EVENT_NAMES.USER_LOGGED_IN, async () => {
  const profile = await loadProfile();

  // Step 3: Emit profile loaded
  emit(EVENT_NAMES.USER_PROFILE_LOADED, profile);
});
```

### 3. Event Aggregation

Combine multiple events:

```typescript
const events: string[] = [];

useEventListener(EVENT_NAMES.USER_LOGGED_IN, () => {
  events.push('login');
  checkAllEventsReceived();
});

useEventListener(EVENT_NAMES.USER_PROFILE_LOADED, () => {
  events.push('profile');
  checkAllEventsReceived();
});

function checkAllEventsReceived() {
  if (events.length === 2) {
    console.log('User fully initialized');
  }
}
```

---

## Migration Guide

### From Prop Drilling

**Before:**

```typescript
<Parent>
  <Child onUpdate={handleUpdate} />
    <GrandChild onUpdate={handleUpdate} />
    </Child>
</Parent>
```

**After:**

```typescript
// Parent - emit event
emit(EVENT_NAMES.DATA_UPDATED, data);

// GrandChild - listen directly
useEventListener(EVENT_NAMES.DATA_UPDATED, handleUpdate);
```

### From Context API

**Before:**

```typescript
const UserContext = createContext();

function App() {
  return (
    <UserContext.Provider value={user}>
      <Component />
    </UserContext.Provider>
  );
}

function Component() {
  const user = useContext(UserContext);
}
```

**After:**

```typescript
// Use store + events
function App() {
  useProfileStoreInitialization();
  return <Component />;
}

function Component() {
  const { profile } = useProfileStore();
}
```

---

## FAQ

**Q: When should I use events vs props?**

A: Use events for:

- Cross-MFE communication
- Loosely coupled updates
- Broadcasting changes

Use props for:

- Parent-child communication
- Tightly coupled components
- Simple data passing

**Q: How do I ensure events are received?**

A: Events are fire-and-forget. For guaranteed delivery, use:

- Request-response pattern
- Acknowledgment events
- Check listener count before emitting

**Q: Can events be async?**

A: Yes! Listeners can be async:

```typescript
useEventListener(EVENT_NAMES.USER_LOGGED_IN, async (event) => {
  await loadUserData(event.userId);
});
```

**Q: How do I test events in isolation?**

A: Mock the event bus:

```typescript
vi.mock('@myapp/shared/event-bus', () => ({
  getEventBus: () => ({
    emit: vi.fn(),
    subscribe: vi.fn(),
  }),
}));
```

---

## Resources

- **Quick Start**: `docs/EVENT_BUS_QUICK_START.md`
- **DevTools Guide**: `docs/EVENT_BUS_DEVTOOLS_GUIDE.md`
- **Production Deployment**: `docs/EVENT_BUS_PRODUCTION_DEPLOYMENT.md`
- **API Reference**: Event Bus implementation

---

**Version**: 1.0.0  
**Last Updated**: Phase 5 completion  
**Maintainers**: Event Bus Team
