# Error Boundary Implementation Roadmap

## Current State Analysis

### ✅ Existing Implementations

#### 1. **Chatbot MFE** (`apps/chatbot-mfe/src/components/ErrorBoundary.tsx`)

- **Status**: ✅ Fully implemented and production-ready
- **Features**:
  - Class component with `getDerivedStateFromError()` and `componentDidCatch()`
  - Captures error and component stack traces
  - Expandable details view for debugging
  - Reload button for recovery
  - Console error logging
  - Clean, branded UI with emoji icon
- **Coverage**: Wraps entire `ChatPage` in app.tsx

#### 2. **Shell App** (`apps/shell/src/app/app.tsx`)

- **Status**: ⚠️ Basic implementation
- **Features**:
  - Inline class component (not reusable)
  - Basic error state tracking
  - Only captures error message and stack
  - Reload button
  - Minimal console logging
- **Issues**:
  - Hardcoded in app.tsx (not reusable)
  - Doesn't capture component stack traces
  - No UI polish or expandable details

#### 3. **Auth MFE, Profile MFE, Admin MFE**

- **Status**: ❌ No error boundaries
- **Coverage**: None - vulnerable to unhandled component errors

---

## Current Error Handling Coverage

### By App & Component:

| App             | Status     | Details                               |
| --------------- | ---------- | ------------------------------------- |
| **Shell**       | ⚠️ Partial | Root level only, basic implementation |
| **Chatbot MFE** | ✅ Full    | Root level, detailed UI               |
| **Auth MFE**    | ❌ None    | No error boundary                     |
| **Profile MFE** | ❌ None    | No error boundary                     |
| **Admin MFE**   | ❌ None    | No error boundary                     |

### By Component Layer (Where Missing):

```
Shell
├── ✅ Root (ErrorBoundary)
├── ⚠️ Pages & Routes (No granular boundaries)
├── ⚠️ MFE Loaders (Remote module failures unhandled)
└── ⚠️ Layout Components (No segment isolation)

Auth MFE
├── ❌ Root (No boundary)
├── ❌ Auth Pages (Login, Register, etc.)
└── ❌ Form Components

Profile MFE
├── ❌ Root (No boundary)
├── ❌ Profile Pages
└── ❌ Settings & Security Pages

Admin MFE
├── ❌ Root (No boundary)
├── ❌ Dashboard & Management Pages
└── ❌ User Detail Pages

Chatbot MFE
├── ✅ Root (ErrorBoundary)
├── ⚠️ Message Components (Could benefit from granular boundaries)
└── ⚠️ Sidebar (No isolated boundary)
```

---

## Implementation Roadmap

### Phase 1: Standardize & Reuse (Foundation)

#### 1.1 Create Shared ErrorBoundary Component

**File**: `libs/frontend/ui-components/src/components/ErrorBoundary/ErrorBoundary.tsx`

**Features**:

- Class component for error catching
- TypeScript support for optional props
- Three UI variants: `full`, `compact`, `minimal`
- Optional custom fallback component
- Error logging hook support
- Toast integration option
- Recovery button with optional callback

```tsx
interface ErrorBoundaryProps {
  children: ReactNode;
  variant?: 'full' | 'compact' | 'minimal'; // UI style
  fallback?: ReactNode | ((error: Error) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // If true, error doesn't cascade
  context?: string; // For better error identification
}
```

**Variants**:

- `full` - With expandable details, stack trace, component stack
- `compact` - Simple error message + reload button
- `minimal` - Just error message, no UI decoration

#### 1.2 Update Design System Export

**File**: `libs/frontend/ui-components/src/index.ts`

```tsx
export { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
```

---

### Phase 2: Root-Level Protection (Critical)

#### 2.1 Update Shell App

**File**: `apps/shell/src/app/app.tsx`

**Changes**:

- Replace inline ErrorBoundary with imported shared component
- Add error logging integration
- Add context: `"shell-root"`
- Use `variant="full"` for detailed error info

#### 2.2 Update Auth MFE App

**File**: `apps/auth-mfe/src/app/app.tsx`

**Changes**:

- Add ErrorBoundary wrapper
- Use `variant="full"`
- Context: `"auth-root"`

#### 2.3 Update Profile MFE App

**File**: `apps/profile-mfe/src/app/app.tsx`

**Changes**:

- Add ErrorBoundary wrapper
- Use `variant="full"`
- Context: `"profile-root"`

#### 2.4 Update Admin MFE App

**File**: `apps/admin-mfe/src/app/app.tsx`

**Changes**:

- Add ErrorBoundary wrapper
- Use `variant="full"`
- Context: `"admin-root"`

---

### Phase 3: Remote Module Protection (MFE-Specific)

#### 3.1 Create MFE Loader Error Boundary

**File**: `apps/shell/src/components/MfeErrorBoundary.tsx`

**Purpose**: Catch errors when loading/executing remote modules

**Features**:

- Specialized for Module Federation errors
- Graceful fallback UI showing "MFE failed to load"
- Doesn't break shell (isolated error)
- Shows MFE name and error
- Reload MFE button (if possible)

```tsx
export function MfeErrorBoundary({
  mfeName,
  children,
}: {
  mfeName: string;
  children: ReactNode;
}) {
  // Custom handling for MFE-specific errors
}
```

#### 3.2 Update MFE Loaders in Shell

**Files**:

- `apps/shell/src/components/ChatbotMfe.tsx`
- `apps/shell/src/components/AuthMfe.tsx`
- `apps/shell/src/components/ProfileMfe.tsx`
- `apps/shell/src/components/AdminMfe.tsx`

**Changes**:

- Wrap lazy module and Suspense with MfeErrorBoundary
- Add Suspense boundary before MfeErrorBoundary
- Use `variant="compact"` to avoid double UI

```tsx
export function ChatbotMfe() {
  return (
    <MfeErrorBoundary mfeName="ChatbotMFE">
      <Suspense fallback={<LoadingSpinner />}>
        <ChatbotMfeModule />
      </Suspense>
    </MfeErrorBoundary>
  );
}
```

---

### Phase 4: Granular Component Protection (Enhanced Resilience)

#### 4.1 Page-Level Boundaries

**Shell Pages**:

- `apps/shell/src/pages/dashboard/DashboardPage.tsx` → ErrorBoundary at page level
- `apps/shell/src/pages/admin/*` → Wrap admin page routes
- `apps/shell/src/pages/profile/*` → Wrap profile page routes

**Auth MFE Pages**:

- `apps/auth-mfe/src/pages/Login.tsx` → ErrorBoundary
- `apps/auth-mfe/src/pages/Register.tsx` → ErrorBoundary
- `apps/auth-mfe/src/pages/ForgotPassword.tsx` → ErrorBoundary
- `apps/auth-mfe/src/pages/ResetPassword.tsx` → ErrorBoundary

**Profile MFE Pages**:

- `apps/profile-mfe/src/pages/ProfilePage.tsx` → ErrorBoundary
- `apps/profile-mfe/src/pages/EditProfilePage.tsx` → ErrorBoundary
- `apps/profile-mfe/src/pages/SettingsPage.tsx` → ErrorBoundary
- `apps/profile-mfe/src/pages/SecurityPage.tsx` → ErrorBoundary

**Admin MFE Pages**:

- `apps/admin-mfe/src/pages/AdminDashboardPage.tsx` → ErrorBoundary
- `apps/admin-mfe/src/pages/UserManagementPage.tsx` → ErrorBoundary
- `apps/admin-mfe/src/pages/UserDetailPage.tsx` → ErrorBoundary
- `apps/admin-mfe/src/pages/AuditLogsPage.tsx` → ErrorBoundary

#### 4.2 Chatbot MFE Component-Level Boundaries

**Components**:

- `apps/chatbot-mfe/src/components/ConversationSidebar.tsx` → Optional granular boundary
- `apps/chatbot-mfe/src/components/MessageList.tsx` → Isolated boundary for message rendering
- `apps/chatbot-mfe/src/components/MessageInput.tsx` → Boundary for input handling
- `apps/chatbot-mfe/src/components/MessageBubble.tsx` → Optional individual boundary

**Strategy**: Use `variant="minimal"` to avoid UI clutter

---

### Phase 5: Error Logging & Monitoring Integration

#### 5.1 Create Error Logger Service

**File**: `libs/frontend/hooks/src/lib/useErrorLogger.ts`

**Features**:

- Log errors to backend API (future)
- Track error frequency and patterns
- User context (session, app version)
- Environment information
- Error categorization

```tsx
export function useErrorLogger() {
  return {
    log: (error: Error, context?: string) => {
      console.error(error);
      // Send to backend service
    },
    track: (errorType: string, metadata?: Record<string, any>) => {
      // Track specific error patterns
    },
  };
}
```

#### 5.2 Integrate with ErrorBoundary

- Pass `onError` callback to ErrorBoundary
- Call error logger from ErrorBoundary.componentDidCatch()
- Include app/MFE context

#### 5.3 Create Error Analytics Dashboard (Future)

- Track error frequency by app
- Monitor error patterns
- Alert on critical errors
- Error resolution tracking

---

### Phase 6: Error Recovery Strategies

#### 6.1 Local Storage State Recovery

- Persist component state before rendering
- Recover state on error
- Reset state option for user

#### 6.2 Feature Degradation

- If non-critical feature fails, show degraded UI
- Don't break entire page for one component failure

#### 6.3 Automatic Retry Logic

- Implement exponential backoff
- Max 3 retries before showing error
- User-triggered retry button

---

## Implementation Timeline

### Week 1: Foundation

- [ ] Create shared ErrorBoundary component (Phase 1.1, 1.2)
- [ ] Test with existing implementations
- [ ] Document usage patterns

### Week 2: Root Protection

- [ ] Update all 4 MFE app.tsx files (Phase 2)
- [ ] Test root error scenarios
- [ ] Verify error messages display

### Week 3: MFE Loaders

- [ ] Create MfeErrorBoundary (Phase 3.1)
- [ ] Update MFE loader components (Phase 3.2)
- [ ] Test remote module loading failures

### Week 4: Granular Protection

- [ ] Add page-level boundaries (Phase 4.1)
- [ ] Add component-level boundaries (Phase 4.2)
- [ ] Test individual component failures

### Week 5: Monitoring

- [ ] Create error logger service (Phase 5.1, 5.2)
- [ ] Integrate logging with ErrorBoundaries
- [ ] Set up error tracking

---

## Testing Strategy

### Unit Tests

- ErrorBoundary component rendering
- Error state transitions
- Props validation

### Integration Tests

- Error propagation through component tree
- MFE loader error handling
- Toast integration with errors

### E2E Tests

- Throw test errors in components
- Verify error UI appears
- Verify reload functionality
- Check error logging

### Error Scenarios to Test

1. **Component Render Error**: Component throws during render
2. **Lifecycle Error**: Error in useEffect or component mount
3. **Event Handler Error**: Error in click handler
4. **Async Error**: Unhandled promise rejection
5. **MFE Load Error**: Remote module fails to load
6. **MFE Timeout**: Remote module takes too long
7. **API Error**: GraphQL/REST call fails unexpectedly
8. **Network Error**: Connection timeout
9. **Null Reference**: Accessing property of undefined

---

## Benefits & Outcomes

### Resilience

- ✅ Partial failures don't crash entire app
- ✅ Users see clear error messages
- ✅ MFE failures isolated to that MFE
- ✅ Graceful degradation possible

### Developer Experience

- ✅ Standardized error handling
- ✅ Reusable components
- ✅ Better debugging with stack traces
- ✅ Consistent error UI across app

### User Experience

- ✅ Clear error messages
- ✅ Recovery options (reload)
- ✅ Better feedback than blank/frozen screens
- ✅ Professional appearance

### Monitoring

- ✅ Centralized error logging
- ✅ Error pattern tracking
- ✅ Performance insights
- ✅ User impact assessment

---

## Decision Points & Considerations

### 1. **Error Boundary Granularity**

- **Question**: How deep should we go with granular boundaries?
- **Decision**: Phase 4 (page-level) is required; component-level (Phase 4.2) is optional based on stability

### 2. **UI Styling**

- **Question**: Should ErrorBoundary use design system tokens?
- **Recommendation**: Yes, use design system once Phase 1 is complete

### 3. **Error Logging Backend**

- **Question**: Where should errors be logged?
- **Recommendation**: Create new error logging service; store in database for analysis

### 4. **User Notification**

- **Question**: Should we notify backend/support on critical errors?
- **Recommendation**: Defer to Phase 5; include user session ID for support investigation

### 5. **Error Message Content**

- **Question**: How much detail should end users see?
- **Recommendation**: Show simple message to users; expand details in development mode only

---

## Files to Create/Modify

### Create New

```
libs/frontend/ui-components/src/components/ErrorBoundary/
├── ErrorBoundary.tsx (Main component)
├── ErrorBoundary.module.css (Styling)
├── ErrorBoundary.test.tsx (Tests)
└── useErrorLogger.ts (Logging hook)

apps/shell/src/components/
└── MfeErrorBoundary.tsx (MFE-specific boundary)

libs/frontend/hooks/src/lib/
└── useErrorLogger.ts (Error logging service)
```

### Modify Existing

```
libs/frontend/ui-components/src/index.ts (Add export)

apps/shell/src/app/app.tsx
apps/auth-mfe/src/app/app.tsx
apps/profile-mfe/src/app/app.tsx
apps/admin-mfe/src/app/app.tsx

apps/shell/src/components/ChatbotMfe.tsx
apps/shell/src/components/AuthMfe.tsx
apps/shell/src/components/ProfileMfe.tsx
apps/shell/src/components/AdminMfe.tsx

apps/auth-mfe/src/pages/*.tsx
apps/profile-mfe/src/pages/*.tsx
apps/admin-mfe/src/pages/*.tsx
```

---

## Success Criteria

1. ✅ All MFEs have root-level error boundaries
2. ✅ MFE loader failures don't break shell
3. ✅ Error messages are user-friendly and informative
4. ✅ All error scenarios covered by tests
5. ✅ Error logging integrated and working
6. ✅ Stack traces available in development
7. ✅ Recovery mechanisms functional (reload buttons)
8. ✅ Design system integration complete
9. ✅ Documentation updated with error boundary guidelines
10. ✅ Developers follow error boundary patterns in new code

---

## Related Documentation

- Error Handling Strategy: See DESIGN_SYSTEM.md for UI component guidelines
- Module Federation: GRAPHQL_FEDERATION_QUICK_START.md
- Testing Infrastructure: TESTING_INFRASTRUCTURE_GUIDE.md
- Error Scenarios: LOGIN_FLOW_TEST_REPORT.md, INTEGRATION_TEST_RESULTS.md

---

**Last Updated**: November 22, 2025
**Status**: Ready for Implementation - Phase 1 Planned
**Next Action**: Create shared ErrorBoundary component in ui-components library
