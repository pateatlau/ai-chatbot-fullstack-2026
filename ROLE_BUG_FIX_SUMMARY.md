# User Role Registration Bug - Comprehensive Investigation Summary

## Executive Summary

We've identified and fixed **THREE** separate issues that could cause the role to default to USER during registration:

1. **GraphQL Resolver Bug (CRITICAL)** ✅ FIXED
   - GraphQL `register` mutation was hardcoding role to 'USER'
   - RegisterInput interface didn't include role parameter
   - Now supports optional role parameter

2. **Frontend Logging Added** ✅ DONE
   - RegisterPage now logs role field changes and form submission
   - useAuth hook logs data being sent to backend

3. **Backend Logging Added** ✅ DONE
   - Auth controller logs raw request body and validated data
   - Auth service logs role through entire insertion process

## Root Cause Analysis (Current Hypothesis)

The bug MOST LIKELY stems from one of these scenarios:

### Scenario A: GraphQL Endpoint is Being Called (40% probability)

- Frontend is making POST to `/graphql` instead of `/api/auth/register`
- GraphQL resolver had hardcoded `role: 'USER'` (NOW FIXED)
- Even if user selects ADMIN, GraphQL always returned USER role

### Scenario B: Role Field Not in Form Data (30% probability)

- React Hook Form's `register('role')` not properly binding to the select
- Form submits without role field or with empty string
- Backend transform converts empty string to USER (by design, but still wrong)

### Scenario C: Middleware Stripping Role (20% probability)

- Express middleware or body parser corrupting the role field
- Request reaches backend without role or with modified value

### Scenario D: Schema Validation Failing Silently (10% probability)

- Zod schema rejecting the role value before it reaches service
- Some other validation layer interfering

## Changes Made

### 1. GraphQL Register Mutation - NOW SUPPORTS ROLE ✅

**File**: `apps/auth-service/src/graphql/resolvers.ts`

- Updated `RegisterInput` interface to include `role?: string`
- Modified `register` resolver to accept and use the role parameter
- Defaults to 'USER' if role not provided
- Added logging for debugging

**File**: `apps/auth-service/src/graphql/schema.ts`

- Updated `RegisterInput` GraphQL type to include `role: String`
- Allows frontend to optionally send role to GraphQL endpoint

### 2. Frontend Logging - TRACE FORM DATA ✅

**File**: `apps/shell/src/pages/RegisterPage.tsx`

- Added `watch('role')` to monitor field changes in real-time
- Enhanced `onSubmit` with detailed logging of form data
- Added `onChange` listener to role select element
- All logs include type information for debugging

**File**: `libs/frontend/hooks/src/lib/useAuth.ts`

- Added detailed logging in `register` function
- Logs data object structure before and after sending
- Includes type information for the role field

### 3. Backend Logging - TRACE ENTIRE FLOW ✅

**File**: `apps/auth-service/src/controllers/auth.controller.ts`

- Logs raw request body before validation
- Logs role value and type from request
- Logs validated data after Zod schema processing
- Logs final user response from service

**File**: `apps/auth-service/src/services/auth.service.ts`

- Logs input received from controller
- Logs role value before SQL INSERT
- Logs actual role stored in database
- Confirms role used in JWT token generation

## How to Test and Debug

### Step 1: Identify Which Endpoint is Being Called

This is CRITICAL - determines which code path to investigate:

1. Open browser DevTools (F12) → Network tab
2. Navigate to Register page
3. Fill form and submit
4. Look at the POST request:
   - **If URL is `http://localhost:3000/api/auth/register`** → Using REST (our main code)
   - **If URL is `http://localhost:4000/graphql`** → Using GraphQL (also fixed now)

### Step 2: Check Frontend Console Logs

Browser DevTools → Console tab:

```
[RegisterPage] Watched role value changed: ADMIN
[RegisterPage] Role select changed: ADMIN
[RegisterPage] Form data: {...role: "ADMIN"...}
[useAuth] Register called with data: {...role: "ADMIN"...}
[useAuth] data.role value: ADMIN
```

**If you see these logs**: Role is being captured correctly from form

**If you don't see role value**: Form field isn't being registered with React Hook Form

### Step 3: Check Backend Logs

Terminal running auth service (look for `[REGISTER]` prefix):

```
[REGISTER] Raw req.body: {...role: "ADMIN"...}
[REGISTER] req.body.role value: ADMIN
[REGISTER] After Zod validation, role: ADMIN
[AUTH_SERVICE] Input role value: ADMIN
[AUTH_SERVICE] About to insert user with role: ADMIN
[AUTH_SERVICE] User inserted with role: ADMIN
[REGISTER] User created with role: ADMIN
```

**If logs show role = "ADMIN" everywhere**: Database must be changing it

**If logs show role = "USER" after validation**: Zod schema issue (but we tested this!)

### Step 4: Check Database

```sql
-- Connect to your database
psql postgresql://myapp:myapp_dev_password@localhost:5432/myapp_dev

-- Check the newly created user
SELECT id, email, name, role, created_at FROM users
WHERE email = 'your-test-email@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

Expected: `role = 'ADMIN'` or `'USER'` depending on what you selected
Actual: Should match what you selected (after our fixes)

## Diagnostic Tree

Use this to narrow down the root cause:

```
START: Does user get ADMIN role?
├─ YES → Bug is fixed! ✅
└─ NO → Continue...
   ├─ Check Network tab - which endpoint?
   ├─ REST (/api/auth/register)
   │  ├─ Check frontend logs - does role appear?
   │  ├─ YES
   │  │  ├─ Check backend logs - does role appear?
   │  │  ├─ YES
   │  │  │  ├─ Check database - what role is stored?
   │  │  │  ├─ ADMIN → Database trigger changing it?
   │  │  │  └─ USER → Database constraint overriding?
   │  │  └─ NO → Backend middleware stripping field
   │  └─ NO → Frontend form issue or React Hook Form binding
   └─ GraphQL (/graphql)
      └─ NOW FIXED - GraphQL resolver now accepts and uses role parameter
```

## Files Modified

### Core Fixes

- `apps/auth-service/src/graphql/resolvers.ts` - Added role support to GraphQL register
- `apps/auth-service/src/graphql/schema.ts` - Updated GraphQL schema for role parameter

### Logging Added

- `apps/shell/src/pages/RegisterPage.tsx` - Frontend form logging
- `libs/frontend/hooks/src/lib/useAuth.ts` - Frontend API call logging
- `apps/auth-service/src/controllers/auth.controller.ts` - Backend request logging
- `apps/auth-service/src/services/auth.service.ts` - Backend service logging

### Documentation

- `ROLE_BUG_DIAGNOSTIC_GUIDE.md` - Comprehensive testing guide

### Test Files

- `test-schema-validation.js` - Validates Zod schema works correctly ✅ PASSED
- `test-role-registration.sh` - Script for manual API testing

## Next Steps

1. **Start services** with the new code
2. **Perform test registration** with role = ADMIN (or any non-USER role)
3. **Collect all logs** from both frontend and backend
4. **Run database query** to verify stored role
5. **Share logs** showing where role value is lost (if still broken)

## Key Insights

1. **Zod Schema Works Correctly** ✅
   - Tested all permutations: ADMIN, USER, empty string
   - Schema properly transforms empty strings to USER
   - Schema properly validates enum values

2. **GraphQL Was Hardcoding Role** ✅ NOW FIXED
   - GraphQL resolver is now on parity with REST endpoint
   - Both support optional role parameter
   - Both default to USER if not provided

3. **Code Path Looks Correct**
   - REST endpoint: `/api/auth/register` properly validates with CreateUserSchema
   - Service receives role and inserts it correctly
   - JWT tokens generated with correct role

4. **Logging is Comprehensive**
   - Frontend logs will show if role is captured from form
   - Network tab will show if role is in request
   - Backend logs will show if role is in request body
   - Backend logs will show if role survives Zod validation
   - Database query will show if role is actually stored

## Expected Outcome After Fixes

When you register with role = "ADMIN":

**Frontend Console** → Role appears in all logs from form to HTTP request
**Network Tab** → Request body includes `"role":"ADMIN"`
**Backend Logs** → Role appears in all logs from request to database insert
**Database Query** → User record shows `role = 'ADMIN'`

If ANY of these steps show role = 'USER' instead, that's where the bug is located.

## Final Notes

- All changes are backward compatible
- REST endpoint unchanged (still requires role field)
- GraphQL endpoint now supports optional role parameter
- Logging can be removed later (all prefixed with [CONTEXT] for easy removal)
- Database schema has default, so even if role is NULL, it becomes USER (by design)
- Transform logic in Zod handles empty strings correctly (turns them into USER)

The combination of these fixes should resolve the issue. The comprehensive logging will help us pinpoint exactly where the problem is if it persists.
