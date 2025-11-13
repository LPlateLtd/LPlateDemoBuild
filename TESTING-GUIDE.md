# Authentication Flow Testing Guide

## Pre-Test Checklist

### ✅ Supabase Configuration (Verify These Are Set)
- [x] Site URL: `https://lplate-khaki.vercel.app` (base domain only)
- [x] Redirect URLs cleaned up (removed `/auth/callback` and `/auth/verify`)
- [x] `/welcome` is in redirect URLs
- [x] `/auth/reset-password` is in redirect URLs
- [x] `/auth/error` is in redirect URLs

### ✅ Code Configuration
- [x] Flow type: `implicit` (in `src/lib/supabase-browser.ts`)
- [x] `detectSessionInUrl: true` (enables auto-processing)
- [x] Sign-up redirects to `/welcome?role=X&phone=Y`

---

## Test 1: New User Sign-Up Flow

### Steps:
1. Go to `https://lplate-khaki.vercel.app/sign-in`
2. Toggle to "Sign Up" mode
3. Enter:
   - Email: `test@example.com` (use a real email you can access)
   - Mobile Number: `07123456789`
4. Click "Learner >" or "Instructor >"
5. Check email inbox

### Expected Results:
- ✅ Email confirmation screen shows: "Check your email"
- ✅ Email arrives within 2-3 minutes
- ✅ Email link format: `https://lplate-khaki.vercel.app/welcome?code=...&role=learner&phone=...`

### What to Check in Email:
- Link should go to `/welcome` (not `/auth/verify`)
- Link should include `code`, `role`, and `phone` parameters

---

## Test 2: Email Link Click (New User)

### Steps:
1. Click the magic link in the email
2. Browser should navigate to `/welcome?code=...&role=...&phone=...`
3. Open browser DevTools → Console tab
4. Watch for log messages

### Expected Console Logs:
```
[WELCOME] Checking session for password setup...
[WELCOME] Current URL: https://lplate-khaki.vercel.app/welcome?code=...
[WELCOME] Code parameter detected, exchanging for session...
[WELCOME] Waiting for Supabase to auto-process code (implicit flow)...
[WELCOME] Session created automatically by Supabase
```

### Expected Behavior:
- ✅ No "code verifier" errors
- ✅ Session is created successfully
- ✅ Password setup form appears (for new users)
- ✅ URL code parameter is removed from address bar

### If You See Errors:
- ❌ "both auth code and code verifier should be non-empty" → Flow type issue
- ❌ "Email link is invalid or has expired" → Link expired or wrong redirect URL
- ❌ "No session found" → Auto-processing didn't work, check timing

---

## Test 3: Password Setup (New User)

### Steps:
1. On password setup form, enter:
   - New password: `test123456` (min 6 characters)
   - Confirm password: `test123456`
2. Click "Complete Account Setup"
3. Watch console for logs

### Expected Console Logs:
```
[WELCOME] Password updated successfully
[WELCOME] Creating profile for new user with role: learner
[WELCOME] Profile created successfully, redirecting to profile setup
```

### Expected Behavior:
- ✅ Loading spinner shows: "Creating your account..."
- ✅ Redirects to `/learner/profile` or `/instructor/profile`
- ✅ Profile is created in database

---

## Test 4: Existing User Flow

### Steps:
1. Complete Test 1-3 above (create a user)
2. Sign out (if there's a sign out button)
3. Go back to `/sign-in`
4. Toggle to "Sign Up" mode
5. Enter the SAME email you used before
6. Click "Learner >" or "Instructor >"
7. Click the magic link in email

### Expected Behavior:
- ✅ Email link works
- ✅ Session is created
- ✅ **Automatically redirects to dashboard** (not password setup)
- ✅ Goes to `/dashboard` (learner) or `/instructor` (instructor)

### Expected Console Logs:
```
[WELCOME] Session created automatically by Supabase
[WELCOME] Existing user with profile, redirecting to dashboard
```

---

## Test 5: Error Handling

### Steps:
1. Request a magic link
2. Wait 5+ minutes (or use an old/expired link)
3. Click the expired link

### Expected Behavior:
- ✅ Redirects to `/auth/error`
- ✅ Shows error message: "This verification link may have expired..."
- ✅ Shows email input field
- ✅ "Resend verification link" button works

---

## Debugging Tips

### If Session Not Created:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Check localStorage for Supabase session:
   ```javascript
   // In browser console:
   localStorage.getItem('sb-bvlilxbhipbworirvzcl-auth-token')
   ```

### If Redirect Fails:
1. Check Supabase Dashboard → Logs → Auth
2. Look for 403 or 400 errors
3. Verify redirect URL is in whitelist

### If Code Parameter Not Processed:
1. Check if URL has `?code=...` or `#access_token=...`
2. With implicit flow, might be hash tokens instead
3. Code should handle both, but check console logs

---

## Success Criteria

✅ **All tests pass if:**
1. New users can sign up and receive email
2. Email link redirects to `/welcome`
3. Session is created automatically
4. Password setup form appears for new users
5. Existing users skip password setup and go to dashboard
6. Error page works for expired links

---

## Next Steps After Testing

If all tests pass:
- ✅ Authentication flow is working!
- ✅ Ready for production use

If tests fail:
- Note which test failed
- Check console logs
- Check Supabase Dashboard → Logs
- Share error messages for debugging

