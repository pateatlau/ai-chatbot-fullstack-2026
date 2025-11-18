# Event Bus: State Management & Storage Clarification

**Document Type:** Architecture Clarification  
**Created:** November 18, 2025  
**Purpose:** Clarify where state lives (global vs local, server vs client)

---

## 🎯 KEY CONCEPT CLARIFICATION

The **Event Bus is ONLY for communication**, not state storage.

```
Event Bus Role:
├── ✅ Send messages between MFEs
├── ✅ Notify of state changes
├── ✅ Trigger actions in other MFEs
└── ❌ Does NOT store state

State is stored in THREE places:
1. BACKEND (Server) - Source of truth
2. LOCAL ZUSTAND STORES (Client) - Each MFE's own state
3. BROWSER CACHE (Optional) - Temporary data
```

---

## 📊 STATE STORAGE HIERARCHY

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                           │
│            (PostgreSQL + MongoDB)                           │
│                  Source of Truth                            │
│  - Users & authentication                                   │
│  - Conversations & messages                                 │
│  - User profiles & settings                                 │
│  - Admin data                                               │
└─────────────────────┬───────────────────────────────────────┘
                      │ API calls
                      ▼
         ┌────────────────────────────┐
         │   SHELL APP (Frontend)     │
         │   Shared Zustand Stores    │
         │                            │
         │ ✓ Auth Store (centralized) │
         │   - user                   │
         │   - tokens                 │
         │   - isAuthenticated        │
         │                            │
         │ ✓ Toast Store (centralized)│
         │   - notifications          │
         └────────┬───────┬───────┬───┘
                  │       │       │
        ┌─────────┘       │       └─────────┐
        │                 │                 │
   ┌────▼─────┐    ┌──────▼──────┐   ┌────▼─────┐
   │ Auth MFE  │    │ Chatbot MFE │   │ Admin MFE │
   │           │    │             │   │           │
   │ LOCAL:    │    │ LOCAL:      │   │ LOCAL:    │
   │ - (none)  │    │ - convs     │   │ - users   │
   │ - (none)  │    │ - messages  │   │ - reports │
   │           │    │ - UI state  │   │ - logs    │
   │ LISTENS:  │    │             │   │           │
   │ - all     │    │ LISTENS:    │   │ LISTENS:  │
   │   events  │    │ - login     │   │ - login   │
   │           │    │ - logout    │   │ - logout  │
   │ EMITS:    │    │ - errors    │   │ - errors  │
   │ - auth    │    │             │   │           │
   │   events  │    │ EMITS:      │   │ EMITS:    │
   │           │    │ - chat msgs │   │ - reports │
   └───────────┘    │ - conv events
                    └─────────────┘
```

---

## 🏛️ STATE OWNERSHIP MODEL

### GLOBAL/SHARED STATE (Zustand in Shell)

**Stored in:** `libs/frontend/stores/auth.store.ts` + `libs/frontend/stores/toast.store.ts`  
**Scope:** Shared across ALL MFEs  
**Persistence:** localStorage

```typescript
// SHARED STATE - Owns cross-app auth
useAuthStore: {
  user: User | null                    ← Who is logged in
  accessToken: string | null           ← Current JWT
  refreshToken: string | null          ← Refresh token
  isAuthenticated: boolean              ← Login status
  isLoading: boolean                    ← Auth loading state
}

// SHARED STATE - Owns global notifications
useToastStore: {
  toasts: Toast[]                      ← Notification queue
}
```

### LOCAL/MFE STATE (Zustand in each MFE)

**Stored in:** Each MFE's own store  
**Scope:** That MFE only  
**Persistence:** sessionStorage or memory (not localStorage)

```typescript
// AUTH MFE - No local state (just uses shared auth store)
No additional stores needed

// CHATBOT MFE - Owns conversation & message data
useChatbotStore: {
  conversations: Conversation[]         ← User's conversations
  activeConversationId: string | null   ← Which one open
  messages: Message[]                   ← Chat messages
  currentUserContext: {                 ← Copy of user info
    userId: string
    email: string
    role: string
  }
  isLoading: boolean                    ← Fetch state
  error: string | null                  ← Error state
}

// ADMIN MFE - Owns admin data
useAdminStore: {
  isAdminMode: boolean                  ← Is user admin?
  adminUser: User | null                ← Admin details
  systemAlerts: Alert[]                 ← Admin alerts
  activeUsers: User[]                   ← Current users
}

// PROFILE MFE - Owns user profile data
useProfileStore: {
  userProfile: UserProfile | null       ← User details
  userPreferences: Preferences | null   ← User settings
  isLoading: boolean                    ← Fetch state
}
```

---

## 🔄 DATA FLOW: Where State Comes From

### SCENARIO 1: User Login

```
USER INTERACTION
├─ Form submission in Auth MFE
└─ Call authService.login(email, password)
       │
       ▼
   BACKEND
   ├─ Verify credentials
   ├─ Generate JWT tokens
   ├─ Save session to PostgreSQL
   └─ Return { user, accessToken, refreshToken }
       │
       ▼
   AUTH MFE RECEIVES RESPONSE
   ├─ Call useAuthStore.setAuth()
   │  └─ Stores in Zustand (in-memory)
   │  └─ Persists to localStorage
   │  └─ EMITS 'user:logged-in' event
   │       │
       ▼   ▼
   OTHER MFEs LISTEN
   ├─ Chatbot MFE hears event
   │  └─ Updates local useChatbotStore
   │  └─ Fetches conversations from backend
   │
   ├─ Admin MFE hears event
   │  └─ Checks if user is admin
   │  └─ Updates local useAdminStore
   │
   └─ Profile MFE hears event
      └─ Fetches user profile from backend
      └─ Updates local useProfileStore

FINAL STATE:
┌──────────────────────────────────────┐
│ BACKEND (PostgreSQL)                 │
├──────────────────────────────────────┤
│ users table                          │
│ ├─ id, email, name, role             │
│ ├─ password_hash                      │
│ └─ sessions table                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ SHELL APP - Shared Zustand           │
├──────────────────────────────────────┤
│ useAuthStore                         │
│ ├─ user (from backend)               │
│ ├─ accessToken (from backend)        │
│ ├─ refreshToken (from backend)       │
│ └─ persisted to localStorage         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ CHATBOT MFE - Local Zustand          │
├──────────────────────────────────────┤
│ useChatbotStore                      │
│ ├─ conversations (fetched from API)  │
│ ├─ messages (fetched from API)       │
│ ├─ currentUserContext (from event)   │
│ └─ NOT persisted (session scope)     │
└──────────────────────────────────────┘
```

---

## 💾 PERSISTENCE STRATEGY

### What Gets Persisted (localStorage)

```typescript
// PERSISTED TO localStorage
useAuthStore (via Zustand persist middleware):
├─ user
├─ accessToken
├─ refreshToken
├─ isAuthenticated
└─ NOT: isLoading (transient state)

// WHY?
// - Need to remember user on page refresh
// - Allow auto-login on browser restart
// - JWT tokens required for API calls
```

### What Does NOT Get Persisted

```typescript
// NOT persisted (memory only)
useChatbotStore:
├─ conversations
├─ messages
├─ isLoading
└─ error

// WHY?
// - Data is fetched fresh on each login
// - No need to cache conversations locally
// - Always fresh from backend
// - Reduces localStorage size

// NOT persisted
useToastStore:
├─ toasts
└─ (Auto-clears on timeout anyway)

// NOT persisted
useAdminStore:
├─ systemAlerts
└─ (Admin state reset on each session)
```

---

## 🌐 API LAYER: Backend Data Fetching

The **backend is always the source of truth**. Here's the flow:

### Auth API

```typescript
// Backend: POST /auth/login
Response:
{
  user: {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    role: "user"
  },
  accessToken: "jwt...",
  refreshToken: "jwt..."
}

// Stored in:
useAuthStore.setAuth(user, accessToken, refreshToken)
├─ In-memory Zustand
└─ Persisted to localStorage
```

### Conversation API

```typescript
// Backend: GET /conversations
Response:
{
  conversations: [
    { id: "conv-1", title: "First chat", createdAt: "..." },
    { id: "conv-2", title: "Second chat", createdAt: "..." }
  ]
}

// Stored in:
useChatbotStore.setConversations(conversations)
├─ In-memory Zustand only
└─ NOT persisted to localStorage
```

### Messages API

```typescript
// Backend: GET /conversations/:id/messages?page=1
Response:
{
  messages: [
    { id: "msg-1", content: "Hello", role: "user", createdAt: "..." },
    { id: "msg-2", content: "Hi there", role: "assistant", createdAt: "..." }
  ],
  pagination: { total: 100, pages: 5 }
}

// Stored in:
useChatbotStore.addMessage(messages)
├─ In-memory Zustand only
└─ NOT persisted
```

---

## 🔐 Security Implications

### Never Store Sensitive Data in localStorage

```typescript
// ❌ WRONG - Don't do this
localStorage.setItem('user_password', password);

// ✅ CORRECT - Tokens only, never passwords
localStorage.setItem(
  'auth-storage',
  JSON.stringify({
    user: { id, email, name, role },
    accessToken: token, // Short-lived, can be in localStorage
    refreshToken: refresh, // Can be in localStorage
  })
);

// ✅ BETTER - Use secure HTTPOnly cookies
// Don't store tokens in localStorage at all
// Let backend send HTTPOnly cookies
```

### Token Security

```typescript
// Access Token (15 min expiry)
├─ Stored in Zustand + localStorage
├─ Sent in Authorization header
└─ Used for all API calls

// Refresh Token (7 day expiry)
├─ Stored in Zustand + localStorage
├─ Sent to /auth/refresh endpoint
├─ Returns new access token
└─ Silent refresh before expiry

// On Logout
├─ Clear localStorage
├─ Clear Zustand store
├─ Blacklist token on backend (blacklisted_tokens table)
└─ Redirect to login
```

---

## 📋 COMPLETE STATE REFERENCE

### Shell App (Shared)

```typescript
// libs/frontend/stores/auth.store.ts
{
  user: {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    avatar: "https://...",
  },
  accessToken: "eyJhbGci...",
  refreshToken: "eyJhbGci...",
  isAuthenticated: true,
  isLoading: false
}

// Storage: localStorage (key: "auth-storage")
// Scope: GLOBAL - All MFEs read this
// Persistence: localStorage + in-memory
```

### Auth MFE (No additional local state)

```typescript
// Uses: useAuthStore from shell
// Emits: user:logged-in, user:logged-out, auth:error
// No MFE-specific stores
```

### Chatbot MFE (Local)

```typescript
{
  conversations: [
    {
      id: "conv-1",
      userId: "user-123",
      title: "First chat",
      messageCount: 5,
      createdAt: "2025-11-18T..."
    }
  ],
  activeConversationId: "conv-1",
  messages: [
    {
      id: "msg-1",
      conversationId: "conv-1",
      role: "user",
      content: "Hello",
      createdAt: "2025-11-18T..."
    }
  ],
  currentUserContext: {
    userId: "user-123",
    email: "test@example.com",
    role: "user"
  },
  isLoading: false,
  error: null
}

// Storage: In-memory Zustand only
// Scope: LOCAL - Chatbot MFE only
// Persistence: None (fetch fresh on login)
// Fetched from: GET /conversations, GET /conversations/:id/messages
```

### Admin MFE (Local)

```typescript
{
  isAdminMode: true,
  adminUser: {
    id: "user-123",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin"
  },
  systemAlerts: [
    {
      id: "alert-1",
      type: "warning",
      message: "Server CPU high",
      timestamp: "2025-11-18T..."
    }
  ],
  activeUsers: [
    { id: "user-1", email: "user1@example.com", status: "online" },
    { id: "user-2", email: "user2@example.com", status: "offline" }
  ]
}

// Storage: In-memory Zustand only
// Scope: LOCAL - Admin MFE only
// Persistence: None
// Fetched from: GET /admin/users, GET /admin/alerts
```

### Profile MFE (Local)

```typescript
{
  userProfile: {
    userId: "user-123",
    email: "test@example.com",
    name: "Test User",
    avatar: "https://...",
    bio: "I love AI",
    createdAt: "2025-11-18T..."
  },
  userPreferences: {
    theme: "dark",
    language: "en",
    emailNotifications: true,
    darkMode: true,
    fontSize: "medium"
  },
  isLoading: false
}

// Storage: In-memory Zustand only
// Scope: LOCAL - Profile MFE only
// Persistence: None (user settings saved to backend)
// Fetched from: GET /profile, GET /preferences
```

---

## 🔄 ON-PAGE REFRESH: What Happens?

```
USER REFRESHES BROWSER
    │
    ▼
BROWSER LOADS
    │
    ├─ Read from localStorage
    │  └─ Restore useAuthStore
    │     ├─ user
    │     ├─ accessToken
    │     └─ refreshToken
    │
    ├─ Shell App initializes
    │  ├─ Check if still authenticated
    │  └─ Emit 'user:logged-in' (from restored state)
    │
    ├─ Each MFE mounts
    │  ├─ Listens for 'user:logged-in' event
    │  ├─ Fetches its own data
    │  └─ Populates local store
    │
    ├─ Chatbot MFE
    │  ├─ Gets userId from event
    │  ├─ Calls GET /conversations
    │  └─ Stores in useChatbotStore (memory only)
    │
    └─ Admin MFE
       ├─ Checks if user is admin
       ├─ Calls GET /admin/users
       └─ Stores in useAdminStore (memory only)

RESULT:
✓ Auth restored from localStorage
✓ User still logged in
✓ Other MFEs fetch fresh data
✓ No stale conversations shown
```

---

## 📊 COMPARISON: SHARED vs LOCAL

| Aspect          | Shared Auth Store       | Local MFE Store                 |
| --------------- | ----------------------- | ------------------------------- |
| **Location**    | Shell app               | Each MFE                        |
| **Storage**     | localStorage + memory   | Memory only                     |
| **Scope**       | Global - all MFEs read  | Local - one MFE only            |
| **Data Types**  | User, tokens            | Conversations, messages, alerts |
| **Persistence** | ✓ Yes (localStorage)    | ✗ No (memory only)              |
| **Updated**     | On login/logout/refresh | On API call                     |
| **Events**      | Emits user:\* events    | Listens to events               |
| **Cache**       | Yes (1 hour default)    | No (fresh fetch)                |
| **Source**      | Backend (auth service)  | Backend (data APIs)             |

---

## 🎯 EVENT BUS ROLE (NOT state storage)

```typescript
// Event bus is JUST communication
┌─────────────────────────────────────┐
│ Chatbot MFE fetches messages        │
│ Calls: POST /messages               │
│ Backend: Creates message in MongoDB │
│ Returns: { id, content, ... }       │
│                                     │
│ Chatbot MFE updates local store:    │
│ useChatbotStore.addMessage(msg)    │
│                                     │
│ Chatbot MFE EMITS event:            │
│ emit('message:sent', { msg })       │
│       │                             │
│       ├─→ Admin MFE hears it        │
│       │   └─ Optional: logs it      │
│       │                             │
│       ├─→ Profile MFE hears it      │
│       │   └─ Optional: updates      │
│       │      activity timestamp     │
│       │                             │
│       └─→ Others: ignore            │
└─────────────────────────────────────┘

EVENT BUS does NOT:
❌ Store the message
❌ Persist to database
❌ Track message state

BACKEND does:
✅ Store message (MongoDB)
✅ Persist to database
✅ Is source of truth
```

---

## ✅ FINAL SUMMARY

```
WHERE STATE LIVES:

BACKEND (Source of Truth)
├─ PostgreSQL: Users, Auth, Sessions, Audit logs
└─ MongoDB: Messages, Embeddings, Events

FRONTEND (Client-side copies)
├─ SHARED STORE (Shell)
│  └─ useAuthStore: User + Tokens (persisted to localStorage)
│
├─ LOCAL STORE (Chatbot MFE)
│  └─ useChatbotStore: Conversations + Messages (in-memory)
│
├─ LOCAL STORE (Admin MFE)
│  └─ useAdminStore: Users + Alerts (in-memory)
│
└─ LOCAL STORE (Profile MFE)
   └─ useProfileStore: Profile + Preferences (in-memory)

EVENT BUS (Communication)
├─ Notifies of state changes
├─ Triggers actions in other MFEs
├─ Does NOT store state
└─ Does NOT persist data
```

---

**Document Version:** 1.0  
**Created:** November 18, 2025  
**Purpose:** Clarify state storage architecture
