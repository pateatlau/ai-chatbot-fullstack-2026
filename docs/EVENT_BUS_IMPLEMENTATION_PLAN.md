# Event Bus Implementation Plan: Zero-Coupling MFE Architecture

**Document Type:** Architecture & Implementation Guide  
**Created:** November 18, 2025  
**Scope:** Inter-MFE communication via Event Bus with Zustand for local state  
**Duration:** 3 weeks (5 phases, 72 hours active development)

---

## 📋 EXECUTIVE SUMMARY

### Current State

- **Zustand Stores:** Auth & Toast stores centralized in `libs/frontend/stores`
- **Coupling Issue:** MFEs directly read from shared Zustand (tight coupling)
- **Communication:** No event bus; direct localStorage coupling in API layer
- **Problem:** Changes to store require coordination across all MFEs

### Proposed Solution

**Event Bus Pattern** + **Zustand Local State**

```
MFE Architecture (Before)
┌─────────────────────────────────────────┐
│ Auth MFE  │ Chatbot MFE  │ Admin MFE   │
│    ↓         ↓                ↓         │
│  Shared Zustand Store (auth, toast)    │
└─────────────────────────────────────────┘
                ↑ TIGHT COUPLING

MFE Architecture (After)
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Auth MFE    │  │ Chatbot MFE  │  │  Admin MFE   │
│              │  │              │  │              │
│ Local State  │  │ Local State  │  │ Local State  │
│ (Zustand)    │  │ (Zustand)    │  │ (Zustand)    │
│              │  │              │  │              │
│ Listeners    │  │ Listeners    │  │ Listeners    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                    ↓
            EVENT BUS (Pub/Sub)
         ┌─────────────────────────┐
         │ • userLoggedIn          │
         │ • userLoggedOut         │
         │ • tokenRefreshed        │
         │ • conversationCreated   │
         │ • messageReceived       │
         │ • settingsUpdated       │
         └─────────────────────────┘
         ✓ ZERO COUPLING
```

### Benefits

- ✅ **Zero Coupling:** MFEs communicate via events, not shared state
- ✅ **Independent Deployment:** Each MFE deployable without coordinating state changes
- ✅ **Scalability:** Easy to add new MFEs without modifying existing ones
- ✅ **Maintainability:** Clear event contracts and data flows
- ✅ **Testing:** Events mockable; repositories testable in isolation
- ✅ **Performance:** Optional event debouncing, batching, filtering
- ✅ **Type Safety:** Full TypeScript support for event schemas

---

## 🏗️ ARCHITECTURE DESIGN

### Event Bus Architecture

```typescript
// Core Event Bus Interface
interface EventBus {
  // Subscribe to event type
  subscribe<T>(eventName: string, listener: (data: T) => void): () => void;

  // Emit event to all listeners
  emit<T>(eventName: string, data: T): void;

  // Subscribe once then auto-unsubscribe
  once<T>(eventName: string, listener: (data: T) => void): void;

  // Remove all listeners for event
  clear(eventName?: string): void;

  // Get listeners count (debugging)
  getListenerCount(eventName: string): number;
}
```

### Event Categories

```
APPLICATION EVENTS (Cross-MFE)
│
├── AUTHENTICATION
│   ├── userLoggedIn
│   ├── userLoggedOut
│   ├── tokenRefreshed
│   ├── sessionExpired
│   └── authError
│
├── CONVERSATION (Auth MFE → Chatbot MFE)
│   ├── conversationCreated
│   ├── conversationUpdated
│   ├── conversationDeleted
│   └── conversationArchived
│
├── MESSAGES (Chatbot MFE → Other MFEs)
│   ├── messageReceived
│   ├── messageSent
│   ├── messageError
│   └── typingStatusChanged
│
├── USER PROFILE (Profile MFE → Other MFEs)
│   ├── userProfileUpdated
│   ├── userPreferencesChanged
│   ├── userAvatarChanged
│   └── userStatusChanged
│
├── ADMIN ACTIONS (Admin MFE → Other MFEs)
│   ├── userBanned
│   ├── userSuspended
│   ├── settingsChanged
│   └── systemAlert
│
├── SETTINGS (All MFEs)
│   ├── themeChanged
│   ├── languageChanged
│   ├── accessibilityToggled
│   └── notificationPreferencesChanged
│
└── SYSTEM EVENTS
    ├── appInitialized
    ├── networkStatusChanged
    ├── errorOccurred
    └── notificationReceived
```

### Data Flow Diagrams

```
SCENARIO 1: User Login Flow
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  1. User submits login form                                   │
│  ┌──────────────┐                                             │
│  │  Auth MFE    │                                             │
│  │  Login Page  │                                             │
│  └──────┬───────┘                                             │
│         │ calls authService.login()                           │
│         ▼                                                      │
│  ┌──────────────────────┐                                     │
│  │  Auth Service        │                                     │
│  │  (API to backend)    │                                     │
│  └──────┬───────────────┘                                     │
│         │ receives tokens                                     │
│         ▼                                                      │
│  2. Store auth in local Zustand                              │
│  ┌──────────────┐                                             │
│  │ Auth MFE     │                                             │
│  │ Zustand      │                                             │
│  │ Store        │                                             │
│  └──────┬───────┘                                             │
│         │ updates UI                                          │
│         ▼                                                      │
│  3. EMIT EVENT to Event Bus                                  │
│  ┌─────────────────────────┐                                  │
│  │ emit('userLoggedIn', {  │                                  │
│  │   user: {id, email...}  │                                  │
│  │   accessToken           │                                  │
│  │   timestamp             │                                  │
│  │ })                      │                                  │
│  └─────────────┬───────────┘                                  │
│                │                                              │
│         ┌──────┴──────────────────────┐                      │
│         │                             │                      │
│  4a. EVENT BUS                4b. EVENT BUS                 │
│   Chatbot MFE listens         Admin MFE listens            │
│   ────────────────────        ────────────────────         │
│   onUserLoggedIn ({user})     onUserLoggedIn ({user})      │
│         │                             │                      │
│         │ updates local              │ updates local         │
│         │ Zustand with               │ Zustand with          │
│         │ user context               │ user role/perms       │
│         ▼                             ▼                      │
│   Ready for chat              Ready for admin panel        │
│                                                             │
└────────────────────────────────────────────────────────────────┘

RESULT:
✓ Auth MFE owns auth state
✓ Chatbot MFE has own local state (user context)
✓ Admin MFE has own local state (user role)
✓ Zero coupling - each MFE independent
```

```
SCENARIO 2: Conversation Created in Chatbot MFE

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. User creates new conversation in Chatbot MFE               │
│  ┌──────────────┐                                              │
│  │  Chatbot MFE │                                              │
│  │  ChatPage    │                                              │
│  └──────┬───────┘                                              │
│         │ calls chatbotAPI.createConversation()                │
│         ▼                                                       │
│  ┌──────────────────────────────────────┐                      │
│  │  Chatbot Service (Backend)           │                      │
│  │  POST /conversations                 │                      │
│  │  → Creates conv in PostgreSQL        │                      │
│  │  → Returns { id, title, createdAt }  │                      │
│  └──────┬───────────────────────────────┘                      │
│         │ receives response                                     │
│         ▼                                                       │
│  2. Update local Zustand (Chatbot MFE)                         │
│  ┌──────────────────────────┐                                  │
│  │ Chatbot Store            │                                  │
│  │ conversations: [...]     │                                  │
│  │ activeConversation: conv │                                  │
│  └──────┬───────────────────┘                                  │
│         │ UI updates immediately                               │
│         ▼                                                       │
│  3. EMIT EVENT to Event Bus                                   │
│  ┌──────────────────────────┐                                  │
│  │ emit('conversationCreate'│                                  │
│  │       {                  │                                  │
│  │   id,                    │                                  │
│  │   title,                 │                                  │
│  │   createdAt,             │                                  │
│  │   userId                 │                                  │
│  │ })                       │                                  │
│  └──────┬───────────────────┘                                  │
│         │                                                       │
│  4. Other MFEs listen (optional)                              │
│     - Admin MFE: Track new conversations                      │
│     - Profile MFE: Update user activity                       │
│     - Shell: Broadcast to other users if needed               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

RESULT:
✓ Chatbot MFE handles conversation creation independently
✓ No dependency on other MFEs
✓ Other MFEs can act on event without Chatbot MFE knowing
```

---

## 📊 EVENT CONTRACTS

### User Authentication Events

```typescript
// Event: userLoggedIn
{
  eventName: 'userLoggedIn'
  payload: {
    userId: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      avatar?: string;
    };
    accessToken: string;
    refreshToken: string;
    loginTime: ISO8601;
    ipAddress?: string;
  }
}

// Event: userLoggedOut
{
  eventName: 'userLoggedOut'
  payload: {
    userId: string;
    logoutTime: ISO8601;
    reason: 'user_initiated' | 'session_expired' | 'token_revoked';
  }
}

// Event: tokenRefreshed
{
  eventName: 'tokenRefreshed'
  payload: {
    userId: string;
    accessToken: string;
    expiresIn: number; // seconds
    refreshTime: ISO8601;
  }
}

// Event: sessionExpired
{
  eventName: 'sessionExpired'
  payload: {
    userId: string;
    expirationTime: ISO8601;
    lastActivity: ISO8601;
  }
}

// Event: authError
{
  eventName: 'authError'
  payload: {
    error: string;
    code: string;
    details?: any;
    timestamp: ISO8601;
  }
}
```

### Conversation Events

```typescript
// Event: conversationCreated
{
  eventName: 'conversationCreated'
  payload: {
    conversationId: string;
    userId: string;
    title: string;
    createdAt: ISO8601;
    metadata?: {
      tags?: string[];
      isArchived?: boolean;
    };
  }
}

// Event: conversationUpdated
{
  eventName: 'conversationUpdated'
  payload: {
    conversationId: string;
    userId: string;
    changes: {
      title?: string;
      isArchived?: boolean;
      metadata?: any;
    };
    updatedAt: ISO8601;
  }
}

// Event: conversationDeleted
{
  eventName: 'conversationDeleted'
  payload: {
    conversationId: string;
    userId: string;
    deletedAt: ISO8601;
    reason?: string;
  }
}
```

### Message Events

```typescript
// Event: messageSent
{
  eventName: 'messageSent'
  payload: {
    messageId: string;
    conversationId: string;
    userId: string;
    role: 'user' | 'assistant';
    content: string;
    sentAt: ISO8601;
    metadata?: {
      tokenCount?: number;
      model?: string;
    };
  }
}

// Event: messageReceived
{
  eventName: 'messageReceived'
  payload: {
    messageId: string;
    conversationId: string;
    userId: string;
    content: string;
    receivedAt: ISO8601;
    metadata?: any;
  }
}

// Event: messageError
{
  eventName: 'messageError'
  payload: {
    conversationId: string;
    error: string;
    errorCode: string;
    timestamp: ISO8601;
    retryable: boolean;
  }
}
```

---

## 🎯 IMPLEMENTATION PLAN: 5 PHASES

### PHASE 1: Foundation (Days 1-2, 8 hours)

**Goal:** Create core event bus infrastructure

#### Tasks

1. **Create Event Bus Package**
   - Location: `libs/frontend/event-bus/`
   - Files:
     ```
     libs/frontend/event-bus/
     ├── src/
     │   ├── lib/
     │   │   ├── event-bus.ts (Core implementation)
     │   │   ├── event-types.ts (Type definitions)
     │   │   ├── event-emitter.ts (Wrapper class)
     │   │   └── index.ts
     │   ├── index.ts
     │   └── README.md
     ├── package.json
     └── tsconfig.json
     ```

2. **Implement Core Event Bus** (4 hours)

   ```typescript
   // libs/frontend/event-bus/src/lib/event-bus.ts

   type EventListener<T> = (data: T) => void | Promise<void>;

   export class EventBus {
     private listeners: Map<string, Set<EventListener<any>>> = new Map();
     private eventHistory: Array<{
       name: string;
       data: any;
       timestamp: number;
     }> = [];
     private maxHistorySize = 1000;

     subscribe<T>(eventName: string, listener: EventListener<T>): () => void {
       if (!this.listeners.has(eventName)) {
         this.listeners.set(eventName, new Set());
       }
       this.listeners.get(eventName)!.add(listener);

       // Return unsubscribe function
       return () => this.unsubscribe(eventName, listener);
     }

     async emit<T>(eventName: string, data: T): Promise<void> {
       // Record in history
       this.recordEvent(eventName, data);

       // Execute all listeners
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

     // Additional methods...
   }

   // Global singleton
   export const eventBus = new EventBus();
   ```

3. **Define Event Type System** (2 hours)

   ```typescript
   // libs/frontend/event-bus/src/lib/event-types.ts

   export type EventMap = {
     // Authentication
     'user:logged-in': UserLoggedInEvent;
     'user:logged-out': UserLoggedOutEvent;
     'token:refreshed': TokenRefreshedEvent;
     'session:expired': SessionExpiredEvent;
     'auth:error': AuthErrorEvent;

     // Conversations
     'conversation:created': ConversationCreatedEvent;
     'conversation:updated': ConversationUpdatedEvent;
     'conversation:deleted': ConversationDeletedEvent;

     // Messages
     'message:sent': MessageSentEvent;
     'message:received': MessageReceivedEvent;
     'message:error': MessageErrorEvent;

     // Settings
     'settings:updated': SettingsUpdatedEvent;
     'theme:changed': ThemeChangedEvent;
   };

   export type EventName = keyof EventMap;
   ```

4. **Create Event Emitter Utility** (1.5 hours)

   ```typescript
   // libs/frontend/event-bus/src/lib/event-emitter.ts

   import { eventBus } from './event-bus';
   import type { EventMap, EventName } from './event-types';

   export const useEventEmitter = () => ({
     emit<E extends EventName>(eventName: E, data: EventMap[E]) {
       return eventBus.emit(eventName, data);
     },

     on<E extends EventName>(
       eventName: E,
       listener: (data: EventMap[E]) => void
     ) {
       return eventBus.subscribe(eventName, listener);
     },

     once<E extends EventName>(
       eventName: E,
       listener: (data: EventMap[E]) => void
     ) {
       return eventBus.once(eventName, listener);
     },
   });
   ```

5. **Update package.json** (0.5 hours)
   - Add to root package.json shared dependencies
   - Export from new package

#### Deliverables

- ✅ Core event bus implementation (type-safe)
- ✅ Event type definitions
- ✅ Event emitter wrapper
- ✅ Basic error handling
- ✅ Event history (debug feature)

#### Success Criteria

- [ ] Event bus creates without errors
- [ ] Subscribe/emit work synchronously
- [ ] Type safety verified with TypeScript
- [ ] Unit tests passing (basic cases)

---

### PHASE 2: Integration with Zustand Stores (Days 3-4, 12 hours)

**Goal:** Connect event bus to existing Zustand stores

#### Tasks

1. **Create Store-to-Event Bridge** (4 hours)

   ```typescript
   // libs/frontend/stores/src/lib/auth.store.ts (UPDATED)

   import { eventBus } from '@myapp/frontend/event-bus';

   export const useAuthStore = create<AuthState>()(
     persist(
       (set) => ({
         // ... existing state

         setAuth: (user, accessToken, refreshToken) => {
           set({
             user,
             accessToken,
             refreshToken,
             isAuthenticated: true,
             isLoading: false,
           });

           // ← EMIT EVENT
           eventBus.emit('user:logged-in', {
             userId: user.id,
             user,
             accessToken,
             loginTime: new Date().toISOString(),
           });
         },

         clearAuth: () => {
           const state = useAuthStore.getState();
           set({
             user: null,
             accessToken: null,
             refreshToken: null,
             isAuthenticated: false,
           });

           // ← EMIT EVENT
           if (state.user) {
             eventBus.emit('user:logged-out', {
               userId: state.user.id,
               logoutTime: new Date().toISOString(),
               reason: 'user_initiated',
             });
           }
         },

         setTokens: (accessToken, refreshToken) => {
           const state = useAuthStore.getState();
           set({ accessToken, refreshToken });

           // ← EMIT EVENT
           if (state.user) {
             eventBus.emit('token:refreshed', {
               userId: state.user.id,
               accessToken,
               expiresIn: 3600,
               refreshTime: new Date().toISOString(),
             });
           }
         },
       }),
       {
         /* persist config */
       }
     )
   );
   ```

2. **Update Toast Store to Use Events** (3 hours)

   ```typescript
   // libs/frontend/stores/src/lib/toast.store.ts (UPDATED)

   import { eventBus } from '@myapp/frontend/event-bus';

   export const useToastStore = create<ToastState>((set) => ({
     // ... existing toast management

     // Add method to show toast on events
     subscribeToAuthErrors: () => {
       eventBus.on('auth:error', (event) => {
         set((state) => ({
           toasts: [
             ...state.toasts,
             {
               id: crypto.randomUUID(),
               message: event.error,
               type: 'error',
               duration: 5000,
             },
           ],
         }));
       });
     },
   }));
   ```

3. **Create Event-Driven Store Setup Hook** (3 hours)

   ```typescript
   // libs/frontend/stores/src/lib/event-driven-store-setup.ts

   import { useEffect } from 'react';
   import { eventBus } from '@myapp/frontend/event-bus';
   import { useAuthStore, useToastStore } from './index';

   /**
    * Initialize event-driven store subscriptions
    * Call this once in root component (e.g., App.tsx)
    */
   export function useEventDrivenStores() {
     useEffect(() => {
       // Auth store listens to token refresh
       const unsubAuth = eventBus.on('token:refreshed', (event) => {
         useAuthStore.setState({
           accessToken: event.accessToken,
         });
       });

       // Toast store listens to errors
       const unsubToast = eventBus.on('auth:error', (event) => {
         useToastStore.getState().addToast(event.error, 'error', 5000);
       });

       return () => {
         unsubAuth();
         unsubToast();
       };
     }, []);
   }
   ```

4. **Create Custom Hook for Event Listeners** (2 hours)

   ```typescript
   // libs/frontend/hooks/src/lib/useEventListener.ts

   import { useEffect, useRef } from 'react';
   import { eventBus } from '@myapp/frontend/event-bus';
   import type { EventName, EventMap } from '@myapp/frontend/event-bus';

   export function useEventListener<E extends EventName>(
     eventName: E,
     callback: (data: EventMap[E]) => void,
     enabled = true
   ) {
     const callbackRef = useRef(callback);

     useEffect(() => {
       callbackRef.current = callback;
     }, [callback]);

     useEffect(() => {
       if (!enabled) return;

       return eventBus.subscribe(eventName, (data) => {
         callbackRef.current(data);
       });
     }, [eventName, enabled]);
   }
   ```

#### Deliverables

- ✅ Auth store emits events on state changes
- ✅ Toast store responds to events
- ✅ Event-driven setup hook created
- ✅ Custom hook for event listeners
- ✅ All types preserved with TypeScript

#### Success Criteria

- [ ] Auth store emits userLoggedIn event
- [ ] Other code can subscribe to auth events
- [ ] No circular dependencies
- [ ] Tests pass for store integration

---

### PHASE 3: MFE-Specific Stores (Days 5-7, 16 hours)

**Goal:** Create isolated stores for each MFE that listen to events

#### Tasks

1. **Chatbot MFE Store** (5 hours)

   ```typescript
   // apps/chatbot-mfe/src/store/chatbot.store.ts

   import { create } from 'zustand';
   import { eventBus } from '@myapp/frontend/event-bus';

   export interface ChatbotState {
     // Local state
     conversations: Conversation[];
     activeConversationId: string | null;
     messages: Message[];
     isLoading: boolean;
     currentUserContext: { userId: string; email: string } | null;

     // Actions
     setConversations: (conversations: Conversation[]) => void;
     setActiveConversation: (id: string) => void;
     addMessage: (message: Message) => void;
     setUserContext: (context: any) => void;
   }

   export const useChatbotStore = create<ChatbotState>((set) => ({
     conversations: [],
     activeConversationId: null,
     messages: [],
     isLoading: false,
     currentUserContext: null,

     setConversations: (conversations) => set({ conversations }),
     setActiveConversation: (id) => set({ activeConversationId: id }),
     addMessage: (message) =>
       set((state) => ({
         messages: [...state.messages, message],
       })),
     setUserContext: (context) => set({ currentUserContext: context }),
   }));

   /**
    * Initialize Chatbot Store Event Listeners
    * Call once in ChatPage root component
    */
   export function useChatbotStoreInitialization() {
     useEffect(() => {
       // Listen for user login - initialize context
       const unsubLogin = eventBus.on('user:logged-in', (event) => {
         useChatbotStore.getState().setUserContext({
           userId: event.userId,
           email: event.user.email,
         });
       });

       // Listen for user logout - clear conversations
       const unsubLogout = eventBus.on('user:logged-out', () => {
         useChatbotStore.setState({
           conversations: [],
           messages: [],
           currentUserContext: null,
         });
       });

       return () => {
         unsubLogin();
         unsubLogout();
       };
     }, []);
   }
   ```

2. **Admin MFE Store** (5 hours)

   ```typescript
   // apps/admin-mfe/src/store/admin.store.ts

   import { create } from 'zustand';
   import { eventBus } from '@myapp/frontend/event-bus';

   export interface AdminState {
     // Local state
     adminUser: User | null;
     isAdminMode: boolean;
     systemAlerts: Alert[];
     activeUsers: User[];

     // Actions
     setAdminUser: (user: User) => void;
     setAdminMode: (enabled: boolean) => void;
     addSystemAlert: (alert: Alert) => void;
   }

   export const useAdminStore = create<AdminState>((set) => ({
     adminUser: null,
     isAdminMode: false,
     systemAlerts: [],
     activeUsers: [],

     setAdminUser: (user) => set({ adminUser: user }),
     setAdminMode: (enabled) => set({ isAdminMode: enabled }),
     addSystemAlert: (alert) =>
       set((state) => ({
         systemAlerts: [...state.systemAlerts, alert],
       })),
   }));

   export function useAdminStoreInitialization() {
     useEffect(() => {
       // Listen for user login - check if admin
       const unsubLogin = eventBus.on('user:logged-in', (event) => {
         if (event.user.role === 'admin') {
           useAdminStore.getState().setAdminUser(event.user);
           useAdminStore.getState().setAdminMode(true);
         }
       });

       // Listen for user logout - clear admin state
       const unsubLogout = eventBus.on('user:logged-out', () => {
         useAdminStore.setState({
           adminUser: null,
           isAdminMode: false,
           systemAlerts: [],
         });
       });

       return () => {
         unsubLogin();
         unsubLogout();
       };
     }, []);
   }
   ```

3. **Profile MFE Store** (3 hours)

   ```typescript
   // apps/profile-mfe/src/store/profile.store.ts

   import { create } from 'zustand';
   import { eventBus } from '@myapp/frontend/event-bus';

   export interface ProfileState {
     userProfile: UserProfile | null;
     userPreferences: UserPreferences | null;
     isLoading: boolean;

     setUserProfile: (profile: UserProfile) => void;
     setUserPreferences: (prefs: UserPreferences) => void;
   }

   export const useProfileStore = create<ProfileState>((set) => ({
     userProfile: null,
     userPreferences: null,
     isLoading: false,

     setUserProfile: (profile) => set({ userProfile: profile }),
     setUserPreferences: (prefs) => set({ userPreferences: prefs }),
   }));

   export function useProfileStoreInitialization() {
     useEffect(() => {
       const unsubLogin = eventBus.on('user:logged-in', (event) => {
         // Fetch user profile and preferences
         useProfileStore.getState().setUserProfile({
           userId: event.userId,
           // ... other profile data
         });
       });

       const unsubProfileUpdate = eventBus.on(
         'user:profile-updated',
         (event) => {
           useProfileStore.getState().setUserProfile(event.profile);
         }
       );

       return () => {
         unsubLogin();
         unsubProfileUpdate();
       };
     }, []);
   }
   ```

4. **Create Store Initialization Utility** (2 hours)

   ```typescript
   // libs/frontend/stores/src/lib/initialize-stores.ts

   /**
    * Initialize all event-driven stores
    * Call this in Shell app root component
    */
   export function useInitializeEventDrivenStores() {
     useEffect(() => {
       // Initialize global stores
       useEventDrivenStores();

       // These will be initialized by individual MFEs when they mount
       // via their own initialization hooks
     }, []);
   }
   ```

5. **Update Module Federation Shared Packages** (1 hour)
   - Add `@myapp/frontend/event-bus` to shared
   - Ensure all MFEs can import event-bus

#### Deliverables

- ✅ Chatbot MFE store with event listeners
- ✅ Admin MFE store with event listeners
- ✅ Profile MFE store with event listeners
- ✅ Store initialization hooks for each MFE
- ✅ Type-safe event subscriptions

#### Success Criteria

- [ ] Each MFE has isolated store
- [ ] Stores initialize on mount
- [ ] Events propagate correctly between stores
- [ ] No circular dependencies
- [ ] Type safety verified

---

### PHASE 4: Refactor MFE Integration Points (Days 8-10, 14 hours)

**Goal:** Update MFE components to use new event-driven architecture

#### Tasks

1. **Update Auth MFE** (3 hours)
   - Remove direct shared store usage where possible
   - Keep auth state in centralized store
   - Emit auth events
   - File: `apps/auth-mfe/src/pages/Login.tsx` → emit events
   - File: `apps/auth-mfe/src/pages/Register.tsx` → emit events

   ```typescript
   // apps/auth-mfe/src/pages/Login.tsx (UPDATED)

   import { eventBus } from '@myapp/frontend/event-bus';

   export function Login() {
     const { setAuth } = useAuthStore();
     const { addToast } = useToastStore();

     const onSubmit = async (data: LoginFormData) => {
       try {
         const response = await authService.login(data);

         // Store auth
         setAuth(response.user, response.accessToken, response.refreshToken);
         // setAuth will emit 'user:logged-in' event internally

         addToast('Login successful!', 'success');
         window.location.replace('/dashboard');
       } catch (err) {
         const errorMessage = err.response?.data?.message || 'Login failed';
         addToast(errorMessage, 'error');

         // Emit auth error event
         eventBus.emit('auth:error', {
           error: errorMessage,
           code: err.response?.data?.code,
           timestamp: new Date().toISOString(),
         });
       }
     };

     return (/* existing JSX */);
   }
   ```

2. **Update Chatbot MFE** (5 hours)
   - Replace direct auth store access
   - Use event listeners for user context
   - Emit conversation events
   - Emit message events

   ```typescript
   // apps/chatbot-mfe/src/app/ChatPage.tsx (UPDATED)

   import { useChatbotStore, useChatbotStoreInitialization } from '../store';
   import { useEventListener } from '@myapp/frontend/hooks';
   import { eventBus } from '@myapp/frontend/event-bus';

   export function ChatPage() {
     const { currentUserContext, messages } = useChatbotStore();
     const { emit } = useEventEmitter();

     // Initialize store and listeners
     useChatbotStoreInitialization();

     // Listen for user logout
     useEventListener('user:logged-out', () => {
       // Clear chat on logout
     });

     const handleSendMessage = async (content: string) => {
       try {
         const response = await chatbotAPI.sendMessage(conversationId, { content });

         // Emit message sent event
         eventBus.emit('message:sent', {
           messageId: response.id,
           conversationId,
           userId: currentUserContext?.userId!,
           role: 'user',
           content,
           sentAt: new Date().toISOString(),
         });
       } catch (error) {
         eventBus.emit('message:error', {
           conversationId,
           error: error.message,
           errorCode: error.code,
           timestamp: new Date().toISOString(),
           retryable: true,
         });
       }
     };

     return (/* existing JSX */);
   }
   ```

3. **Update Admin MFE** (3 hours)
   - Use event listeners for user role changes
   - Listen for system alerts
   - Emit admin actions as events

4. **Update Profile MFE** (2 hours)
   - Listen for user login to load profile
   - Emit profile update events
   - Emit preference change events

5. **Update Shell App** (1 hour)
   - Initialize event-driven stores in App.tsx
   - Set up global event listeners
   - Handle cross-MFE navigation via events (optional)

#### Deliverables

- ✅ Auth MFE emits auth events
- ✅ Chatbot MFE emits conversation/message events
- ✅ Admin MFE listens for user role changes
- ✅ Profile MFE listens for user login
- ✅ Shell initializes all event listeners

#### Success Criteria

- [ ] All MFEs use event bus for inter-MFE communication
- [ ] No direct shared Zustand access from MFEs
- [ ] Events flow correctly between MFEs
- [ ] No memory leaks from subscriptions
- [ ] Components unmount cleanly

---

### PHASE 5: Testing, Monitoring & Documentation (Days 11-14, 20 hours)

**Goal:** Comprehensive testing, monitoring setup, and documentation

#### Tasks

1. **Unit Tests for Event Bus** (4 hours)

   ```typescript
   // libs/frontend/event-bus/src/lib/event-bus.spec.ts

   describe('EventBus', () => {
     let bus: EventBus;

     beforeEach(() => {
       bus = new EventBus();
     });

     it('should emit and receive events', () => {
       const listener = vi.fn();
       bus.subscribe('test:event', listener);
       bus.emit('test:event', { data: 'hello' });
       expect(listener).toHaveBeenCalledWith({ data: 'hello' });
     });

     it('should support multiple listeners', () => {
       const listener1 = vi.fn();
       const listener2 = vi.fn();
       bus.subscribe('test:event', listener1);
       bus.subscribe('test:event', listener2);
       bus.emit('test:event', { data: 'hello' });
       expect(listener1).toHaveBeenCalled();
       expect(listener2).toHaveBeenCalled();
     });

     it('should unsubscribe listeners', () => {
       const listener = vi.fn();
       const unsubscribe = bus.subscribe('test:event', listener);
       unsubscribe();
       bus.emit('test:event', { data: 'hello' });
       expect(listener).not.toHaveBeenCalled();
     });

     // More tests...
   });
   ```

2. **Integration Tests for Event-Driven Stores** (6 hours)

   ```typescript
   // Test auth store → event → chatbot store flow

   describe('Event-Driven Stores Integration', () => {
     it('should flow user login event from auth to chatbot store', async () => {
       // Setup
       const { result: authResult } = renderHook(() => useAuthStore());
       const { result: chatbotResult } = renderHook(() => useChatbotStore());

       // Initialize stores
       const { result: setupResult } = renderHook(() =>
         useChatbotStoreInitialization()
       );

       // Emit event
       eventBus.emit('user:logged-in', {
         userId: '123',
         user: {
           id: '123',
           email: 'test@example.com',
           name: 'Test',
           role: 'user',
         },
         accessToken: 'token',
         loginTime: new Date().toISOString(),
       });

       await waitFor(() => {
         expect(chatbotResult.current.currentUserContext).toEqual({
           userId: '123',
           email: 'test@example.com',
         });
       });
     });
   });
   ```

3. **Create Debugging Tools** (3 hours)

   ```typescript
   // libs/frontend/event-bus/src/lib/event-bus-devtools.ts

   /**
    * DevTools for debugging event bus
    * - Log all events
    * - Track listener counts
    * - Export event history
    */
   export class EventBusDevTools {
     constructor(private eventBus: EventBus) {
       this.setupLogging();
     }

     private setupLogging() {
       // Intercept all events and log them
     }

     exportHistory() {
       return this.eventBus.getEventHistory();
     }

     showListenerStats() {
       // Display listener counts per event
     }
   }
   ```

4. **Create Event Bus Monitor Component** (3 hours)

   ```typescript
   // apps/shell/src/components/EventBusMonitor.tsx

   /**
    * Development-only component for monitoring event bus
    * Shows:
    * - Real-time event stream
    * - Listener counts
    * - Performance metrics
    * - Event payloads
    */
   export function EventBusMonitor() {
     const [events, setEvents] = useState<EventLog[]>([]);
     const [isPaused, setIsPaused] = useState(false);

     useEffect(() => {
       // Listen to all events via devtools
       if (process.env.NODE_ENV === 'development') {
         // Show UI with event stream
       }
     }, []);

     return (
       <div className="event-bus-monitor">
         {/* Monitor UI */}
       </div>
     );
   }
   ```

5. **Create Comprehensive Documentation** (4 hours)
   - Event bus architecture guide
   - Event schemas reference
   - MFE integration examples
   - Debugging guide
   - Best practices
   - File: `docs/EVENT_BUS_GUIDE.md`

6. **Create Migration Guide** (0 bonus hours if needed)
   - How to migrate existing direct store usage
   - Before/after examples
   - Common patterns
   - File: `docs/EVENT_BUS_MIGRATION_GUIDE.md`

#### Deliverables

- ✅ Unit tests for event bus (90%+ coverage)
- ✅ Integration tests for event flows
- ✅ EventBusDevTools for debugging
- ✅ Development monitor component
- ✅ Comprehensive documentation
- ✅ Migration guide for team

#### Success Criteria

- [ ] All tests passing (unit + integration)
- [ ] > 90% code coverage on event bus
- [ ] DevTools fully functional
- [ ] Documentation complete
- [ ] Team trained on new patterns
- [ ] Zero regressions on existing functionality

---

## 📋 IMPLEMENTATION CHECKLIST

### Pre-Implementation

- [ ] Read and approve this plan
- [ ] Set up feature branch: `feat/event-bus-architecture`
- [ ] Create project management tickets for each phase
- [ ] Schedule team sync meetings (optional)

### Phase 1: Foundation

- [ ] Create event-bus package structure
- [ ] Implement EventBus class (subscribe, emit, once, clear)
- [ ] Define EventMap and event types
- [ ] Create event emitter wrapper
- [ ] Add event bus to Module Federation shared deps
- [ ] Phase 1 tests passing

### Phase 2: Zustand Integration

- [ ] Update auth.store.ts to emit events
- [ ] Update toast.store.ts to listen to events
- [ ] Create event-driven-store-setup.ts hook
- [ ] Create useEventListener hook
- [ ] Phase 2 tests passing
- [ ] No memory leaks on cleanup

### Phase 3: MFE Stores

- [ ] Create chatbot.store.ts with event listeners
- [ ] Create admin.store.ts with event listeners
- [ ] Create profile.store.ts with event listeners
- [ ] Create store initialization hooks
- [ ] Phase 3 tests passing
- [ ] MFE integration verified

### Phase 4: Refactor Components

- [ ] Update Auth MFE Login/Register
- [ ] Update Chatbot MFE ChatPage
- [ ] Update Admin MFE components
- [ ] Update Profile MFE components
- [ ] Update Shell app initialization
- [ ] Integration tests passing
- [ ] Manual testing on all MFEs

### Phase 5: Testing & Documentation

- [ ] Write unit tests (event bus)
- [ ] Write integration tests (store flows)
- [ ] Create debugging tools
- [ ] Build monitor component
- [ ] Write comprehensive docs
- [ ] Write migration guide
- [ ] Code review pass
- [ ] Team training completed

### Post-Implementation

- [ ] Deploy to staging
- [ ] Smoke test all MFEs
- [ ] Performance benchmarks
- [ ] User acceptance testing
- [ ] Merge to develop
- [ ] Merge to main
- [ ] Deployment to production
- [ ] Monitor for issues

---

## 🎯 SUCCESS METRICS

### Code Quality

- ✅ 100% TypeScript with strict mode
- ✅ >90% code coverage
- ✅ Zero compiler errors/warnings
- ✅ ESLint passes on all files

### Architecture

- ✅ Zero circular dependencies between MFEs
- ✅ MFEs deployable independently
- ✅ All inter-MFE communication via events
- ✅ Clear event contracts

### Performance

- ✅ Event emission <1ms
- ✅ Store updates <5ms
- ✅ No memory leaks on subscribe/unsubscribe
- ✅ Event history bounded

### Testing

- ✅ Unit tests: 90%+ coverage
- ✅ Integration tests for all event flows
- ✅ E2E tests for MFE interactions
- ✅ No flaky tests

### Documentation

- ✅ Architecture diagram created
- ✅ Event schemas documented
- ✅ Integration examples provided
- ✅ Migration guide written
- ✅ Debugging guide created

### User Experience

- ✅ No lag in state updates
- ✅ Smooth cross-MFE navigation
- ✅ Real-time updates working
- ✅ Error handling robust

---

## 🚀 DEPLOYMENT STRATEGY

### Staging Deployment (Phase 5, Day 12)

1. Deploy event-bus package
2. Deploy updated stores
3. Deploy updated MFEs with event listeners
4. Run full integration tests
5. Manual QA on all flows

### Production Deployment (After approval)

1. Blue-green deployment
2. Monitor error rates
3. Monitor performance metrics
4. Rollback plan ready

### Rollback Plan

- Keep old Zustand stores functional
- Event bus optional (graceful degradation)
- Can disable event bus via feature flag
- Direct store access still works

---

## 📊 RESOURCE ESTIMATION

| Phase          | Tasks  | Hours  | Days   | Team         |
| -------------- | ------ | ------ | ------ | ------------ |
| 1: Foundation  | 5      | 8      | 2      | 1 Dev        |
| 2: Integration | 4      | 12     | 2      | 1 Dev        |
| 3: MFE Stores  | 5      | 16     | 3      | 1-2 Devs     |
| 4: Refactor    | 5      | 14     | 3      | 2 Devs       |
| 5: Testing     | 6      | 20     | 4      | 2 Devs       |
| **TOTAL**      | **25** | **70** | **14** | **1-2 Devs** |

**Timeline:** 3 weeks (with 1 dev working full-time + 1 dev part-time)

---

## 🔍 RISK MITIGATION

| Risk                            | Probability | Impact   | Mitigation                           |
| ------------------------------- | ----------- | -------- | ------------------------------------ |
| Breaking existing functionality | High        | Critical | Feature flags, comprehensive testing |
| Performance degradation         | Medium      | High     | Profiling, event debouncing          |
| Team learning curve             | High        | Medium   | Documentation, pair programming      |
| Circular event subscriptions    | Medium      | High     | Linting rules, code review           |
| Memory leaks from listeners     | High        | High     | Cleanup validation, devtools         |

---

## 📚 REFERENCES

### Event Bus Patterns

- [Vue Event Bus](https://vuejs.org/guide/scaling-up/state-management.html#simple-state-management-with-composition-api)
- [NestJS Event Emitter](https://docs.nestjs.com/techniques/events)
- [Observer Pattern](https://refactoring.guru/design-patterns/observer)

### Related Documentation

- `docs/HYBRID_ARCHITECTURE_DIAGRAM.md` - System architecture
- `docs/SHELL_APP_ROUTING_IMPLEMENTATION.md` - Current routing setup
- `docs/CONSOLIDATED_IMPLEMENTATION_ROADMAP-NX.md` - Overall roadmap

---

## 🎓 LEARNING OUTCOMES

After implementing this architecture, the team will understand:

- ✅ Pub/Sub event-driven architecture patterns
- ✅ Decoupling strategies for micro-frontends
- ✅ Type-safe event systems in TypeScript
- ✅ State management without coupling
- ✅ Testing event-driven systems
- ✅ Debugging distributed component communication

---

**Status:** Ready for implementation approval  
**Next Step:** Create GitHub issues for each phase  
**Questions?** See `docs/EVENT_BUS_GUIDE.md` (to be created in Phase 5)
