# Event Bus Architecture: Complete State & Communication Flow

**Document Type:** Visual Reference  
**Created:** November 18, 2025  
**Purpose:** Complete picture of where state lives and how it flows

---

## 🏗️ COMPLETE ARCHITECTURE DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────┐
│                          BACKEND SERVER                              │
│                   PostgreSQL + MongoDB (AWS)                         │
│                    Source of Truth (Primary)                         │
│                                                                      │
│  PostgreSQL:                          MongoDB:                       │
│  ├─ users (with hash)                 ├─ messages                   │
│  ├─ sessions                          ├─ message_embeddings         │
│  ├─ conversations                     ├─ conversation_context       │
│  ├─ password_reset_tokens             ├─ streaming_sessions         │
│  ├─ blacklisted_tokens                ├─ chat_events                │
│  └─ audit_logs                        └─ user_activity              │
└────────────────────────┬───────────────────────────────────────────┘
                         │ HTTP/REST API
                         │ JWT Authentication
                         │ (Access Token in Header)
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
    ┌────────────────────────┐  ┌────────────────────────┐
    │   Auth Service         │  │   Other Services       │
    │   (Port 3000)          │  │   (Port 3001, 3002)    │
    │                        │  │                        │
    │ POST /auth/login       │  │ GET /conversations     │
    │ POST /auth/register    │  │ POST /messages         │
    │ POST /auth/refresh     │  │ GET /profile           │
    │ POST /auth/logout      │  │ GET /admin/users       │
    │ GET /auth/me           │  │ etc.                   │
    └────────┬───────────────┘  └────────┬───────────────┘
             │                           │
             ▼                           ▼
    ┌──────────────────────────────────────────────────┐
    │         BROWSER / Frontend (localhost:5173)      │
    │                                                  │
    │  ┌─────────────────────────────────────────┐    │
    │  │  SHELL APP (Port 5173)                  │    │
    │  │                                         │    │
    │  │  Centralized Shared State (Zustand)    │    │
    │  │  ┌─────────────────────────────────┐   │    │
    │  │  │ useAuthStore                    │   │    │
    │  │  │ ├─ user: User | null            │   │    │
    │  │  │ ├─ accessToken: string | null   │   │    │
    │  │  │ ├─ refreshToken: string | null  │   │    │
    │  │  │ ├─ isAuthenticated: boolean     │   │    │
    │  │  │ ├─ isLoading: boolean           │   │    │
    │  │  │ └─ Actions (setAuth, clearAuth) │   │    │
    │  │  │ STORAGE: localStorage           │   │    │
    │  │  │ EVENTS: Emits user:* events    │   │    │
    │  │  └─────────────────────────────────┘   │    │
    │  │                                         │    │
    │  │  ┌─────────────────────────────────┐   │    │
    │  │  │ useToastStore                   │   │    │
    │  │  │ ├─ toasts: Toast[]              │   │    │
    │  │  │ └─ Actions (addToast, remove)   │   │    │
    │  │  │ STORAGE: Memory only            │   │    │
    │  │  └─────────────────────────────────┘   │    │
    │  │                                         │    │
    │  │  ┌─────────────────────────────────┐   │    │
    │  │  │ EVENT BUS (Pub/Sub)             │   │    │
    │  │  │ ├─ userLoggedIn                 │   │    │
    │  │  │ ├─ userLoggedOut                │   │    │
    │  │  │ ├─ tokenRefreshed               │   │    │
    │  │  │ ├─ conversationCreated          │   │    │
    │  │  │ ├─ messageSent                  │   │    │
    │  │  │ └─ ... (15+ event types)        │   │    │
    │  │  │                                 │   │    │
    │  │  │ Memory-based pub/sub            │   │    │
    │  │  │ Does NOT store state            │   │    │
    │  │  │ Only for communication          │   │    │
    │  │  └─────────────────────────────────┘   │    │
    │  └─────────────────────────────────────────┘    │
    │                     │                           │
    │    ┌────────────────┼────────────────┐          │
    │    │                │                │          │
    │    ▼                ▼                ▼          │
    │ ┌─────────┐  ┌──────────────┐  ┌──────────┐   │
    │ │Auth MFE │  │Chatbot MFE   │  │Admin MFE │   │
    │ │(Port    │  │(Port 5175)   │  │(Port     │   │
    │ │ 5174)   │  │              │  │ 5176)    │   │
    │ │         │  │              │  │          │   │
    │ │NO LOCAL │  │LOCAL STORE   │  │LOCAL     │   │
    │ │STORE    │  │(Zustand)     │  │STORE     │   │
    │ │         │  │              │  │(Zustand)│   │
    │ │Uses:    │  │useChatbot    │  │useAdmin  │   │
    │ │- Auth   │  │Store         │  │Store     │   │
    │ │  Store  │  │├─conversat   │  │├─isAdmin │   │
    │ │- Toast  │  │├─messages    │  │├─users   │   │
    │ │  Store  │  │├─UIstate     │  │├─alerts  │   │
    │ │         │  │└─(memory)    │  │└─(mem)   │   │
    │ │Emits:   │  │              │  │          │   │
    │ │- user:  │  │Listens:      │  │Listens:  │   │
    │ │  login  │  │- login       │  │- login   │   │
    │ │- user:  │  │- logout      │  │- logout  │   │
    │ │  logout │  │- errors      │  │- errors  │   │
    │ │- auth:  │  │              │  │          │   │
    │ │  error  │  │Emits:        │  │Emits:    │   │
    │ │         │  │- msg:sent    │  │- report  │   │
    │ │         │  │- conv:creat  │  │- alert   │   │
    │ └─────────┘  │- msg:error   │  └──────────┘   │
    │              └──────────────┘                  │
    │                                                  │
    │              Profile MFE (Port 5177)            │
    │              ┌──────────────────────────┐      │
    │              │ LOCAL STORE (Zustand)    │      │
    │              │                          │      │
    │              │ useProfileStore          │      │
    │              │ ├─ userProfile           │      │
    │              │ ├─ preferences           │      │
    │              │ └─ (memory only)         │      │
    │              │                          │      │
    │              │ Listens: login/logout    │      │
    │              │ Emits: profile updates   │      │
    │              └──────────────────────────┘      │
    │                                                  │
    └──────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW: User Login Example

```
1. USER ACTION
   ┌─────────────────────────────────┐
   │ Auth MFE: User fills login form │
   │ Clicks "Login" button           │
   └────────────┬────────────────────┘

2. AUTH SERVICE CALL
   ▼
   ┌──────────────────────────────────┐
   │ authService.login({              │
   │   email: "test@example.com",     │
   │   password: "***"                │
   │ })                               │
   │                                  │
   │ HTTP POST /auth/login (Backend)  │
   └────────────┬─────────────────────┘

3. BACKEND PROCESSING
   ▼
   ┌──────────────────────────────────┐
   │ Auth Service (Port 3000)         │
   │ ├─ Verify credentials           │
   │ ├─ Query PostgreSQL for user    │
   │ ├─ Check password hash          │
   │ ├─ Generate JWT tokens          │
   │ ├─ Save session to PostgreSQL   │
   │ └─ Return response              │
   │                                  │
   │ Response:                        │
   │ {                                │
   │   user: {                        │
   │     id: "user-123",              │
   │     email: "test@example.com",   │
   │     name: "Test User",           │
   │     role: "user"                 │
   │   },                             │
   │   accessToken: "eyJ...",         │
   │   refreshToken: "eyJ..."         │
   │ }                                │
   └────────────┬─────────────────────┘

4. AUTH MFE STORES IN SHELL ZUSTAND
   ▼
   ┌──────────────────────────────────┐
   │ Auth MFE calls:                  │
   │ useAuthStore.setAuth(            │
   │   user,                          │
   │   accessToken,                   │
   │   refreshToken                   │
   │ )                                │
   │                                  │
   │ ZUSTAND updates:                 │
   │ ├─ useAuthStore.user = user      │
   │ ├─ useAuthStore.tokens = tokens  │
   │ ├─ useAuthStore.isAuthenticated  │
   │ │  = true                        │
   │ ├─ Persist to localStorage       │
   │ └─ EMIT EVENT: 'user:logged-in'  │
   └────────────┬─────────────────────┘

5. EVENT BUS BROADCAST
   ▼
   ┌──────────────────────────────────┐
   │ eventBus.emit('user:logged-in', {│
   │   userId: "user-123",            │
   │   user: {...},                   │
   │   accessToken: "...",            │
   │   loginTime: "2025-11-18T..."    │
   │ })                               │
   │                                  │
   │ In-memory pub/sub broadcasts     │
   │ to all listeners                 │
   └────────────┬─────────────────────┘

6. OTHER MFEs LISTEN (Async)
   ▼
   ┌────────────────────────────────────────┐
   │ CHATBOT MFE hears 'user:logged-in'    │
   │ ├─ Updates useChatbotStore:          │
   │ │  └─ currentUserContext = user info │
   │ ├─ Calls GET /conversations API      │
   │ ├─ Backend: Query PostgreSQL         │
   │ ├─ Backend: Returns conversation list│
   │ └─ Store in useChatbotStore          │
   │    (memory only, not localStorage)   │
   └────────────┬─────────────────────────┘

   ┌────────────────────────────────────────┐
   │ ADMIN MFE hears 'user:logged-in'      │
   │ ├─ Checks if user.role === 'admin'   │
   │ ├─ IF YES:                           │
   │ │  └─ Updates useAdminStore:         │
   │ │     ├─ isAdminMode = true          │
   │ │     └─ adminUser = user            │
   │ ├─ Calls GET /admin/users API        │
   │ │  (only if admin)                   │
   │ └─ Store in useAdminStore            │
   │    (memory only, not localStorage)   │
   └────────────┬─────────────────────────┘

   ┌────────────────────────────────────────┐
   │ PROFILE MFE hears 'user:logged-in'    │
   │ ├─ Updates useProfileStore:          │
   │ ├─ Calls GET /profile API            │
   │ ├─ Backend: Query PostgreSQL         │
   │ ├─ Returns user profile              │
   │ └─ Store in useProfileStore          │
   │    (memory only, not localStorage)   │
   └────────────┬─────────────────────────┘

7. FINAL STATE (After ~500ms)
   ▼
   ┌─────────────────────────────────────────────────┐
   │                    BACKEND                       │
   │  PostgreSQL:                                     │
   │  ├─ users table: user record (unchanged)        │
   │  ├─ sessions table: NEW session created         │
   │  └─ audit_logs: login event logged              │
   │                                                  │
   │  FRONTEND - Shell (Shared)                       │
   │  useAuthStore:                                   │
   │  ├─ user: { id, email, name, role }             │
   │  ├─ accessToken: "eyJ..." (memory)              │
   │  ├─ refreshToken: "eyJ..." (memory)             │
   │  ├─ isAuthenticated: true                       │
   │  └─ PERSISTED TO: localStorage                  │
   │                                                  │
   │  FRONTEND - Chatbot MFE (Local)                  │
   │  useChatbotStore:                                │
   │  ├─ conversations: [...]  (from API)             │
   │  ├─ messages: []          (empty)                │
   │  ├─ currentUserContext: { id, email, role }     │
   │  └─ PERSISTED TO: memory only                   │
   │                                                  │
   │  FRONTEND - Admin MFE (Local)                    │
   │  useAdminStore:                                  │
   │  ├─ isAdminMode: true/false                      │
   │  ├─ adminUser: { ... }    (if admin)             │
   │  └─ PERSISTED TO: memory only                   │
   │                                                  │
   │  FRONTEND - Profile MFE (Local)                  │
   │  useProfileStore:                                │
   │  ├─ userProfile: { ... }  (from API)             │
   │  ├─ preferences: { ... }  (from API)             │
   │  └─ PERSISTED TO: memory only                   │
   └─────────────────────────────────────────────────┘
```

---

## 🔄 PERSISTENCE & REFRESH SCENARIO

```
USER REFRESHES BROWSER (F5)
    │
    ├─ Browser clears memory
    │  └─ All in-memory Zustand stores reset
    │
    ├─ Browser reads localStorage
    │  └─ Finds 'auth-storage' key
    │  └─ Restores useAuthStore:
    │     ├─ user
    │     ├─ accessToken (may be expired)
    │     ├─ refreshToken
    │     └─ isAuthenticated = true
    │
    ├─ Shell App starts
    │  ├─ Initializes useAuthStore from localStorage
    │  ├─ Checks if still authenticated
    │  ├─ If access token expired:
    │  │  └─ Call POST /auth/refresh
    │  │     └─ Backend: Validates refresh token
    │  │     └─ Backend: Issues new access token
    │  │     └─ Frontend: Updates useAuthStore
    │  └─ Emit 'user:logged-in' event
    │
    ├─ Chatbot MFE mounts
    │  ├─ Listens for 'user:logged-in' event
    │  ├─ Gets userId from event
    │  ├─ Calls GET /conversations
    │  │  └─ Backend: Query PostgreSQL
    │  │  └─ Return: Conversation list
    │  ├─ Stores in useChatbotStore (memory)
    │  └─ Renders chat UI with conversations
    │
    ├─ Admin MFE mounts (if admin)
    │  ├─ Listens for 'user:logged-in'
    │  ├─ Checks user.role
    │  ├─ If admin: calls GET /admin/users
    │  └─ Stores in useAdminStore (memory)
    │
    └─ Profile MFE mounts
       ├─ Listens for 'user:logged-in'
       ├─ Calls GET /profile
       └─ Stores in useProfileStore (memory)

RESULT:
✓ User remains logged in (via localStorage)
✓ Tokens refreshed if needed
✓ All MFEs fetch fresh data
✓ No stale information displayed
```

---

## 🔐 TOKEN LIFECYCLE

```
ACCESS TOKEN (JWT, 15 min expiry)
┌─────────────────────────────────────┐
│ Created: On login/refresh           │
├─────────────────────────────────────┤
│ Used: In every API call             │
│ Header: Authorization: Bearer ...   │
├─────────────────────────────────────┤
│ Storage:                            │
│ ├─ useAuthStore (in-memory)        │
│ └─ localStorage (persisted)         │
├─────────────────────────────────────┤
│ Expires: 15 minutes                 │
├─────────────────────────────────────┤
│ On Expiry:                          │
│ ├─ POST /auth/refresh sent          │
│ ├─ Backend validates refresh token  │
│ ├─ New access token issued          │
│ ├─ useAuthStore updated             │
│ └─ Requests continue silently       │
└─────────────────────────────────────┘

REFRESH TOKEN (JWT, 7 day expiry)
┌─────────────────────────────────────┐
│ Created: On login only              │
├─────────────────────────────────────┤
│ Used: Only to refresh access token  │
│ Endpoint: POST /auth/refresh        │
├─────────────────────────────────────┤
│ Storage:                            │
│ ├─ useAuthStore (in-memory)        │
│ └─ localStorage (persisted)         │
├─────────────────────────────────────┤
│ Expires: 7 days                     │
├─────────────────────────────────────┤
│ On Expiry:                          │
│ ├─ User must login again            │
│ ├─ Redirect to login page           │
│ └─ Clear auth store                 │
└─────────────────────────────────────┘

BLACKLISTED TOKENS (On Logout)
┌─────────────────────────────────────┐
│ Backend: Save to blacklisted_tokens │
│ ├─ Token value                      │
│ ├─ User ID                          │
│ ├─ Expiry time                      │
│ └─ Reason: "user_logout"            │
├─────────────────────────────────────┤
│ Check: Before accepting refresh     │
│ ├─ Is token blacklisted?            │
│ ├─ If YES: Reject refresh           │
│ └─ If NO: Issue new token           │
├─────────────────────────────────────┤
│ Cleanup: TTL = 7 days               │
│ └─ Auto-delete after expiry         │
└─────────────────────────────────────┘
```

---

## 📋 STATE OWNERSHIP MATRIX

```
                    ┌──────────────┬────────────┬───────────────┐
                    │   Storage    │  Persist?  │   Scope       │
┌───────────────────┼──────────────┼────────────┼───────────────┤
│ useAuthStore      │ Zustand      │ YES        │ GLOBAL/Shared │
│                   │ localStorage │ (7 days)   │ All MFEs read │
├───────────────────┼──────────────┼────────────┼───────────────┤
│ useToastStore     │ Zustand      │ NO         │ Global        │
│                   │ (memory)     │ (TTL 5s)   │ All MFEs see  │
├───────────────────┼──────────────┼────────────┼───────────────┤
│ useChatbot        │ Zustand      │ NO         │ LOCAL/Chatbot │
│ Store             │ (memory)     │ (session)  │ Chatbot only  │
├───────────────────┼──────────────┼────────────┼───────────────┤
│ useAdminStore     │ Zustand      │ NO         │ LOCAL/Admin   │
│                   │ (memory)     │ (session)  │ Admin only    │
├───────────────────┼──────────────┼────────────┼───────────────┤
│ useProfileStore   │ Zustand      │ NO         │ LOCAL/Profile │
│                   │ (memory)     │ (session)  │ Profile only  │
├───────────────────┼──────────────┼────────────┼───────────────┤
│ Event Bus         │ Memory       │ NO         │ In-transit    │
│                   │ (in-proc)    │ (ephemeral)│ Communication │
└───────────────────┴──────────────┴────────────┴───────────────┘
```

---

## ✅ CHECKLIST: State Understanding

Before implementing, verify:

- [ ] **Backend is source of truth** - All data stored in PostgreSQL/MongoDB
- [ ] **Auth is globally shared** - useAuthStore in Shell, all MFEs read it
- [ ] **Auth is persisted** - useAuthStore saved to localStorage for recovery
- [ ] **Other state is local** - Each MFE has its own Zustand store
- [ ] **Local state is NOT persisted** - In-memory only, fetched fresh
- [ ] **Event Bus is communication** - NOT for state storage
- [ ] **Events are notification** - "Something happened", not "Here's the state"
- [ ] **MFEs fetch own data** - On login, get needed data from backend APIs
- [ ] **MFEs update own state** - Don't read other MFEs' stores
- [ ] **Cache strategy is clear** - Know what to cache and for how long

---

**Document Version:** 1.0  
**Created:** November 18, 2025  
**Purpose:** Visual reference for state & communication architecture
