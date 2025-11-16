# Shell App Integration Test Checklist

**Date**: 2026-01-XX  
**Test Environment**:

- Shell App: http://localhost:5173
- Auth MFE: http://localhost:5174
- Backend API: http://localhost:3000

## Pre-Test Setup

- [x] Auth MFE running on port 5174
- [x] Shell App running on port 5173
- [ ] Backend API running on port 3000 (optional - will test with backend if available)
- [x] Browser cleared of previous session data

---

## Test Suite 1: Initial Navigation & Public Routes

### Test 1.1: Root Redirect

**Steps**:

1. Navigate to http://localhost:5173
2. Observe redirect behavior

**Expected**:

- [x] Should redirect to /auth/login (not authenticated)
- [ ] URL should change to http://localhost:5173/auth/login
- [ ] Login form should display

**Status**: ⏳ PENDING

---

### Test 1.2: Public Route Access

**Steps**:

1. Manually navigate to http://localhost:5173/auth/register
2. Observe page content

**Expected**:

- [ ] Registration form should display
- [ ] Should not redirect (public route)
- [ ] Form should have: name, email, password, confirmPassword fields
- [ ] "Already have an account?" link should point to /auth/login

**Status**: ⏳ PENDING

---

### Test 1.3: Public to Public Navigation

**Steps**:

1. From /auth/login, click "Sign up" link
2. Should navigate to /auth/register
3. From /auth/register, click "Sign in" link
4. Should navigate back to /auth/login

**Expected**:

- [ ] Navigation works smoothly
- [ ] No page refresh (SPA behavior)
- [ ] Forms display correctly

**Status**: ⏳ PENDING

---

## Test Suite 2: User Registration Flow

### Test 2.1: Form Validation

**Steps**:

1. Navigate to /auth/register
2. Try to submit with empty fields

**Expected**:

- [ ] Form should show validation errors
- [ ] Required field errors should display
- [ ] Submit button should not trigger API call

**Status**: ⏳ PENDING

---

### Test 2.2: Password Validation

**Steps**:

1. Enter weak password (e.g., "test")
2. Observe error message

**Expected**:

- [ ] Should show error: "Password must be at least 8 characters"
- [ ] Should enforce: uppercase, lowercase, number, special character

**Status**: ⏳ PENDING

---

### Test 2.3: Password Confirmation

**Steps**:

1. Enter password: "Test@1234"
2. Enter confirmPassword: "Test@5678"
3. Try to submit

**Expected**:

- [ ] Should show error: "Passwords do not match"

**Status**: ⏳ PENDING

---

### Test 2.4: Successful Registration

**Steps**:

1. Fill form with valid data:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "Test@1234"
   - Confirm Password: "Test@1234"
2. Submit form

**Expected**:

- [ ] Loading spinner should appear on button
- [ ] If backend running:
  - [ ] Success toast should appear: "Account created successfully!"
  - [ ] Should redirect to /dashboard after ~500ms
  - [ ] Dashboard should display user name/email
- [ ] If backend not running:
  - [ ] Error toast should appear with error message

**Status**: ⏳ PENDING

---

## Test Suite 3: User Login Flow

### Test 3.1: Login Form Validation

**Steps**:

1. Navigate to /auth/login
2. Try to submit with empty fields

**Expected**:

- [ ] Should show validation errors
- [ ] Email and password required

**Status**: ⏳ PENDING

---

### Test 3.2: Invalid Credentials

**Steps**:

1. Enter email: "wrong@example.com"
2. Enter password: "WrongPass@123"
3. Submit form

**Expected**:

- [ ] Error toast should appear
- [ ] Should remain on login page
- [ ] Should not redirect

**Status**: ⏳ PENDING

---

### Test 3.3: Successful Login

**Steps**:

1. Fill form with valid credentials (registered user)
2. Submit form

**Expected**:

- [ ] Loading spinner should appear
- [ ] Success toast: "Login successful!"
- [ ] Should redirect to /dashboard
- [ ] Dashboard header should show user info
- [ ] Logout button should be visible

**Status**: ⏳ PENDING

---

## Test Suite 4: Protected Routes

### Test 4.1: Dashboard Access (Authenticated)

**Steps**:

1. While logged in, navigate to /dashboard

**Expected**:

- [ ] Dashboard should display
- [ ] Should show welcome message
- [ ] Header navigation should be visible
- [ ] User info should display in header

**Status**: ⏳ PENDING

---

### Test 4.2: Protected Route Access (Not Authenticated)

**Steps**:

1. Logout (or clear localStorage)
2. Try to navigate to /dashboard directly

**Expected**:

- [ ] Should redirect to /auth/login
- [ ] Should not show dashboard content

**Status**: ⏳ PENDING

---

### Test 4.3: Chatbot MFE Route

**Steps**:

1. While logged in, navigate to /chatbot

**Expected**:

- [ ] Should display chatbot placeholder page
- [ ] Dashboard layout should be visible
- [ ] Navigation should work

**Status**: ⏳ PENDING

---

### Test 4.4: Profile MFE Route

**Steps**:

1. While logged in, navigate to /profile

**Expected**:

- [ ] Should display profile placeholder page
- [ ] Dashboard layout should be visible

**Status**: ⏳ PENDING

---

### Test 4.5: Admin MFE Route

**Steps**:

1. While logged in as regular user, navigate to /admin

**Expected**:

- [ ] Should display admin placeholder page (no role guard yet)
- [ ] Dashboard layout should be visible

**Status**: ⏳ PENDING

---

## Test Suite 5: Toast Notifications

### Test 5.1: Success Toast

**Steps**:

1. Perform successful login
2. Observe toast notification

**Expected**:

- [ ] Green success toast should appear bottom-right
- [ ] Message: "Login successful!"
- [ ] Should auto-dismiss after 5 seconds
- [ ] Should have close button (X)

**Status**: ⏳ PENDING

---

### Test 5.2: Error Toast

**Steps**:

1. Perform failed login
2. Observe toast notification

**Expected**:

- [ ] Red error toast should appear
- [ ] Should show error message from API
- [ ] Should auto-dismiss after 5 seconds

**Status**: ⏳ PENDING

---

### Test 5.3: Manual Dismiss

**Steps**:

1. Trigger any toast
2. Click close button (X)

**Expected**:

- [ ] Toast should disappear immediately
- [ ] Should not wait for auto-dismiss

**Status**: ⏳ PENDING

---

### Test 5.4: Multiple Toasts

**Steps**:

1. Trigger multiple toasts quickly (register, then login)

**Expected**:

- [ ] Multiple toasts should stack vertically
- [ ] Each should auto-dismiss independently
- [ ] Should not overlap

**Status**: ⏳ PENDING

---

## Test Suite 6: State Persistence

### Test 6.1: Auth State Persistence

**Steps**:

1. Login successfully
2. Refresh browser (Cmd+R or F5)

**Expected**:

- [ ] Should remain logged in
- [ ] Should stay on current page (e.g., /dashboard)
- [ ] User info should still display
- [ ] Should not redirect to login

**Status**: ⏳ PENDING

---

### Test 6.2: Token Storage

**Steps**:

1. Login successfully
2. Open browser DevTools → Application → Local Storage
3. Check for 'auth-storage' key

**Expected**:

- [ ] 'auth-storage' key should exist
- [ ] Should contain: user, accessToken, refreshToken, isAuthenticated
- [ ] Should NOT contain: isLoading

**Status**: ⏳ PENDING

---

### Test 6.3: Logout Clears Storage

**Steps**:

1. While logged in, click Logout
2. Check localStorage in DevTools

**Expected**:

- [ ] 'auth-storage' should be cleared or set to null values
- [ ] Should redirect to /auth/login
- [ ] Should show success toast

**Status**: ⏳ PENDING

---

## Test Suite 7: Navigation & Routing

### Test 7.1: Header Navigation (Authenticated)

**Steps**:

1. Login successfully
2. Click each navigation link in header:
   - Dashboard
   - Chatbot
   - Profile
   - Admin (if visible)

**Expected**:

- [ ] Each link should navigate correctly
- [ ] URL should update
- [ ] Content should change
- [ ] No page refresh

**Status**: ⏳ PENDING

---

### Test 7.2: Browser Back Button

**Steps**:

1. Navigate: Login → Dashboard → Chatbot → Profile
2. Press browser back button multiple times

**Expected**:

- [ ] Should navigate back through history
- [ ] Should maintain auth state
- [ ] Should not break application

**Status**: ⏳ PENDING

---

### Test 7.3: Direct URL Access (Authenticated)

**Steps**:

1. While logged in, manually enter URL: http://localhost:5173/chatbot
2. Press Enter

**Expected**:

- [ ] Should navigate directly to chatbot
- [ ] Should not redirect to login
- [ ] Should maintain auth state

**Status**: ⏳ PENDING

---

## Test Suite 8: Loading States

### Test 8.1: Login Loading

**Steps**:

1. Enter credentials
2. Submit form
3. Observe button state

**Expected**:

- [ ] Button should show loading spinner
- [ ] Button should be disabled
- [ ] Button text should change (or spinner should appear)

**Status**: ⏳ PENDING

---

### Test 8.2: Route Loading

**Steps**:

1. Navigate to a protected route while not authenticated
2. Observe loading state

**Expected**:

- [ ] Should show loading spinner briefly
- [ ] Then redirect to login

**Status**: ⏳ PENDING

---

## Test Suite 9: Module Federation

### Test 9.1: Auth MFE Loading

**Steps**:

1. Open browser DevTools → Network tab
2. Navigate to /auth/login
3. Check loaded resources

**Expected**:

- [ ] Should load remoteEntry.js from http://localhost:5174
- [ ] Should load auth MFE module
- [ ] No console errors

**Status**: ⏳ PENDING

---

### Test 9.2: Shared Dependencies

**Steps**:

1. Check Network tab for duplicate React loads
2. Check if react, zustand, react-router shared correctly

**Expected**:

- [ ] Should NOT load React twice
- [ ] Should share dependencies between shell and auth-mfe
- [ ] No version conflicts in console

**Status**: ⏳ PENDING

---

## Test Suite 10: Error Handling

### Test 10.1: Network Error (Backend Down)

**Steps**:

1. Stop backend API
2. Try to login

**Expected**:

- [ ] Should show error toast
- [ ] Should not crash application
- [ ] Should remain on login page

**Status**: ⏳ PENDING

---

### Test 10.2: Invalid Response Format

**Steps**:

1. (Simulated) If backend returns unexpected format
2. Observe error handling

**Expected**:

- [ ] Should show generic error message
- [ ] Should not crash application

**Status**: ⏳ PENDING

---

## Test Suite 11: Responsive Design

### Test 11.1: Mobile View

**Steps**:

1. Resize browser to mobile width (375px)
2. Test login/register forms

**Expected**:

- [ ] Forms should be responsive
- [ ] Buttons should be full-width
- [ ] Text should be readable
- [ ] No horizontal scroll

**Status**: ⏳ PENDING

---

### Test 11.2: Tablet View

**Steps**:

1. Resize to tablet width (768px)
2. Test dashboard layout

**Expected**:

- [ ] Layout should adjust appropriately
- [ ] Navigation should work
- [ ] Content should be readable

**Status**: ⏳ PENDING

---

## Test Summary

**Total Tests**: 40+  
**Passed**: ⏳  
**Failed**: ⏳  
**Skipped**: ⏳

---

## Critical Issues Found

(None yet - testing in progress)

---

## Notes

- [ ] Backend API running: YES / NO
- [ ] All MFEs available: auth-mfe only (others pending)
- [ ] Browser tested: Chrome / Firefox / Safari
- [ ] Test date: ****\_\_\_****
- [ ] Tester: ****\_\_\_****

---

## Recommendations

1. Complete all tests with backend running for full integration test
2. Test with different user roles (admin vs regular user)
3. Test token expiry and refresh logic (when implemented)
4. Performance testing with multiple concurrent users
5. Cross-browser compatibility testing

---

**Status**: Ready for testing  
**Last Updated**: 2026-01-XX
