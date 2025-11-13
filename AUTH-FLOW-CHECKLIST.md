# Authentication Flow Checklist

## Current Implementation

### 1. Sign-Up Flow (`/sign-in` - Sign Up mode)
- User enters: Email + Mobile Number
- User selects role: "Learner >" or "Instructor >"
- **Action**: `signInWithOtp()` called with:
  - `email`: User's email
  - `options.emailRedirectTo`: `https://lplate-khaki.vercel.app/welcome?role={learner|instructor}&phone={mobileNumber}`
- **Result**: Email sent with magic link

### 2. Email Link Click
- User clicks link in email
- Supabase redirects to: `/welcome?code={code}&role={role}&phone={phone}`
- **Flow Type**: `implicit` (changed from `pkce` to avoid code verifier issues)

### 3. Welcome Page (`/welcome`)
- Detects `code` parameter in URL
- Waits for Supabase to auto-process (with `detectSessionInUrl: true`)
- Checks for session via `getSession()`
- If session exists:
  - Checks if user has profile
  - **Existing user** → Redirects to dashboard (`/instructor` or `/dashboard`)
  - **New user** → Shows password setup form
- If no session → Redirects to `/auth/error`

### 4. Password Setup (New Users)
- User enters password + confirm password
- **Action**: `updateUser({ password })`
- Creates profile in database with role
- Redirects to role profile page (`/instructor/profile` or `/learner/profile`)

---

## Supabase Configuration Requirements

### ✅ Required Settings in Supabase Dashboard

#### 1. Authentication → URL Configuration
- **Site URL**: `https://lplate-khaki.vercel.app` ⚠️ **MUST be base domain, not a path**
- **Additional Redirect URLs** (must include):
  ```
  https://lplate-khaki.vercel.app/welcome ✅ (added)
  https://lplate-khaki.vercel.app/auth/reset-password ✅ (added)
  https://lplate-khaki.vercel.app/auth/error ✅ (adding now)
  http://localhost:3000/welcome (for local development)
  http://localhost:3000/auth/reset-password (for local development)
  ```
  
  ⚠️ **DO NOT include** `/auth/verify` - we removed that page and use `/welcome` directly

#### 2. Authentication → Email Templates
- **Magic Link Template**: Should use `{{ .ConfirmationURL }}` placeholder
- The link should redirect to the `emailRedirectTo` URL we specify

#### 3. Authentication → Providers
- **Email**: Enabled
- **Email OTP**: Enabled (for magic links)

#### 4. Database → Tables
- **profiles** table must exist with columns:
  - `id` (UUID, references auth.users)
  - `role` (text: 'learner' or 'instructor')
  - `email` (text)
  - `phone` (text, nullable)
  - `name` (text)

---

## Code Configuration

### ✅ Current Settings

#### `src/lib/supabase-browser.ts`
```typescript
flowType: 'implicit'  // ✅ Changed from 'pkce'
detectSessionInUrl: true  // ✅ Enables auto-processing of URL tokens
persistSession: true  // ✅ Saves session to localStorage
```

#### `src/app/(auth)/sign-in/page.tsx`
```typescript
emailRedirectTo: absUrl(`/welcome?role=${role}&phone=${mobileNumber}`)
// ✅ Points to /welcome (not /auth/verify)
```

#### `src/app/welcome/page.tsx`
- ✅ Detects `code` parameter
- ✅ Waits for auto-processing (1.5s)
- ✅ Checks for hash tokens as fallback
- ✅ Handles existing vs new users

---

## Potential Issues to Check

### ⚠️ Issue 1: Flow Type Mismatch
- **Problem**: If Supabase is configured for PKCE but we're using implicit
- **Check**: Supabase Dashboard → Authentication → Settings → Flow Type
- **Solution**: Should match our code (`implicit`)

### ⚠️ Issue 2: Redirect URL Not Whitelisted
- **Problem**: Supabase rejects redirect to `/welcome`
- **Check**: Supabase Dashboard → Authentication → URL Configuration
- **Solution**: Ensure `/welcome` is in Additional Redirect URLs

### ⚠️ Issue 3: Email Template Issues
- **Problem**: Email link doesn't include correct redirect
- **Check**: Supabase Dashboard → Authentication → Email Templates → Magic Link
- **Solution**: Template should use `{{ .ConfirmationURL }}` which includes our `emailRedirectTo`

### ⚠️ Issue 4: Code Parameter vs Hash Tokens
- **Problem**: Supabase might send hash tokens (`#access_token=...`) instead of `?code=...`
- **Current Code**: Handles both (checks for `code` param first, then hash tokens)
- **Check**: Test with actual email link to see what format Supabase uses

### ⚠️ Issue 5: Session Not Persisting
- **Problem**: Session created but lost on redirect
- **Check**: `persistSession: true` is set ✅
- **Check**: Browser localStorage should contain Supabase session

---

## Testing Checklist

### Test 1: Sign Up Flow
1. ✅ Go to `/sign-in`
2. ✅ Toggle to "Sign Up"
3. ✅ Enter email + mobile number
4. ✅ Click "Learner >" or "Instructor >"
5. ✅ Check email for magic link
6. ✅ Verify link format includes `/welcome?code=...&role=...&phone=...`

### Test 2: Email Link Click
1. ✅ Click magic link in email
2. ✅ Should redirect to `/welcome?code=...`
3. ✅ Check browser console for:
   - `[WELCOME] Code parameter detected`
   - `[WELCOME] Waiting for Supabase to auto-process code`
   - `[WELCOME] Session created automatically by Supabase`
4. ✅ Should see password setup form (new user) OR redirect to dashboard (existing user)

### Test 3: Session Creation
1. ✅ Check browser localStorage for Supabase session
2. ✅ Check Network tab for successful auth requests
3. ✅ Verify no "code verifier" errors

### Test 4: Existing User
1. ✅ Sign up as new user → complete profile
2. ✅ Sign out
3. ✅ Sign up again with same email
4. ✅ Should redirect directly to dashboard (not password setup)

---

## What to Verify in Supabase Dashboard

### Step 1: Authentication → URL Configuration
```
Site URL: https://lplate-khaki.vercel.app ⚠️ MUST be base domain only
Additional Redirect URLs:
  - https://lplate-khaki.vercel.app/welcome ✅
  - https://lplate-khaki.vercel.app/auth/reset-password ✅
  - https://lplate-khaki.vercel.app/auth/error ✅ (add this)
  - http://localhost:3000/welcome (dev)
  - http://localhost:3000/auth/reset-password (dev)
  
⚠️ REMOVE /auth/verify - we don't use that page anymore
```

### Step 2: Authentication → Email Templates → Magic Link
```
Subject: Confirm your signup
Body should include: {{ .ConfirmationURL }}
```

### Step 3: Authentication → Settings
```
Enable Email Signup: ✅ Enabled
Enable Email Confirmations: ✅ Enabled (or disabled if you want auto-confirm)
Flow Type: Should match our code (implicit)
```

### Step 4: Database → Tables → profiles
```
Verify table exists with:
- id (UUID, primary key, references auth.users)
- role (text)
- email (text)
- phone (text, nullable)
- name (text)
```

---

## Known Issues & Solutions

### Issue: "both auth code and code verifier should be non-empty"
- **Cause**: PKCE flow requires code verifier that's not available in email links
- **Solution**: ✅ Changed to `implicit` flow (already done)

### Issue: Redirect to wrong page
- **Cause**: `emailRedirectTo` not matching whitelisted URLs
- **Solution**: Ensure `/welcome` is in Supabase redirect URLs

### Issue: Session not created
- **Cause**: Code not being processed automatically
- **Solution**: Code waits 1.5s for auto-processing, then checks hash tokens

---

## Next Steps

1. ✅ Verify Supabase settings match checklist above
2. ✅ Test sign-up flow with new email
3. ✅ Check email link format
4. ✅ Verify session creation in browser
5. ✅ Test existing user flow

