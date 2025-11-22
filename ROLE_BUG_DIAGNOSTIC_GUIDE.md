# Role Registration Bug - Diagnostic Guide

## Current Status

We've added comprehensive logging throughout the entire registration flow to pinpoint where the role value is being lost or defaulted to "USER".

## What We Know

1. **Zod Schema Validation** ✅ CONFIRMED WORKING
   - `role: "ADMIN"` → passes through and remains "ADMIN"
   - `role: "USER"` → passes through and remains "USER"
   - `role: ""` → transforms to "USER" (correct behavior)
   - Schema test results: All transformations working correctly

2. **Database Schema** ✅ CONFIRMED
   - Prisma model has `role String @default("USER")`
   - Database default only applies if NULL is inserted
   - Not the root cause if role is being passed correctly

3. **Code Path** ✅ CONFIRMED CORRECT
   - Backend using raw SQL INSERT with role parameter
   - Auth service properly extracting and using role value
   - Controller using correct schema for validation
   - All intermediate code appears correct

## How to Test

### Step 1: Start the Auth Service with Logging

```bash
cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026
nx serve auth-service --inspect=false
```

Watch for logs starting with `[REGISTER]` and `[AUTH_SERVICE]`

### Step 2: Open Browser DevTools

Open the Shell MFE at `http://localhost:4200` (or appropriate port)

- Open DevTools Console (F12)
- Look for logs starting with `[RegisterPage]` and `[useAuth]`

### Step 3: Test Registration with Role = ADMIN

1. Navigate to Register page
2. Fill in form:
   - Name: "Test User"
   - Email: "testuser-$(date +%s)@example.com" (unique email)
   - Password: "TestPass123!"
   - Confirm: "TestPass123!"
   - Role: **SELECT "Admin"** from dropdown
3. Submit form

### Step 4: Monitor Logs

**Frontend Console (Browser DevTools):**

```
[RegisterPage] Watched role value changed: ADMIN
[RegisterPage] Role select changed: ADMIN
[RegisterPage] Form data: {...role: "ADMIN"...}
[RegisterPage] data.role: ADMIN
[RegisterPage] data.role type: string
[RegisterPage] registerData being sent: {...role: "ADMIN"...}
[useAuth] Register called with data: {...role: "ADMIN"...}
[useAuth] data.role value: ADMIN
[useAuth] data.role type: string
```

**Backend Logs (Auth Service):**

```
[REGISTER] Raw req.body: {...role: "ADMIN"...}
[REGISTER] req.body.role value: ADMIN
[REGISTER] req.body.role type: string
[REGISTER] After Zod validation, role: ADMIN
[AUTH_SERVICE] Register called with input: {...role: "ADMIN"...}
[AUTH_SERVICE] Input role value: ADMIN
[AUTH_SERVICE] About to insert user with role: ADMIN
[AUTH_SERVICE] User inserted with role: ADMIN
[REGISTER] User created with role: ADMIN
```

### Step 5: Verify in Database

```sql
SELECT id, email, name, role FROM users
WHERE email = 'testuser-<timestamp>@example.com'
ORDER BY created_at DESC LIMIT 1;
```

Expected: `role = ADMIN`
Actual: `role = ??`

## Expected Logs Pattern

If all is working:

1. Frontend shows role = "ADMIN" through entire form submission
2. Backend receives role = "ADMIN" in request body
3. After Zod validation: role = "ADMIN"
4. Auth service confirms role = "ADMIN" before insert
5. Database stored role = "ADMIN"

## Possible Failure Points

**If logs show role is LOST at any point:**

1. **Lost at Browser/FormField level?**
   - Watch logs won't show the change
   - Form data in onSubmit shows role: ""
   - → Issue with React Hook Form registration

2. **Lost in Network request?**
   - Browser shows role = "ADMIN"
   - Backend req.body shows role: ""
   - → Issue with HTTP request serialization or middleware

3. **Lost at Backend validation?**
   - req.body shows role: "ADMIN"
   - After Zod: role: "USER"
   - → Issue with Zod schema (but we tested this!)

4. **Lost at Auth Service?**
   - All backend logs show role = "ADMIN"
   - Database shows role = "USER"
   - → Issue with INSERT query or database constraint

5. **Lost during login response?**
   - INSERT shows role = "ADMIN"
   - But response shows role = "USER"
   - → Issue with SELECT query after insert

## Next Actions

1. **Perform the test above** while monitoring both frontend and backend logs
2. **Share the complete log output** showing:
   - What value the role select received from user
   - What value was in the form data
   - What value was sent in HTTP request (check Network tab)
   - What value backend received
   - What value is in database
3. **If logs show role is correct everywhere**: Issue is at database level (trigger, constraint, permission)
4. **If logs show role is lost somewhere**: Narrow down exact line of code where it happens

## Files with Logging Added

- `apps/shell/src/pages/RegisterPage.tsx` - Frontend form submission
- `libs/frontend/hooks/src/lib/useAuth.ts` - Frontend auth hook
- `apps/auth-service/src/controllers/auth.controller.ts` - Backend controller
- `apps/auth-service/src/services/auth.service.ts` - Backend service

All contain strategic console.log statements with `[CONTEXT]` prefixes for easy filtering.

## Clean up When Done

After diagnosis, we'll remove all console.log statements and implement proper error handling.

```bash
# To remove logging (when ready):
# Search for all console.log lines with [REGISTER], [AUTH_SERVICE], [RegisterPage], [useAuth]
# and remove them
```
