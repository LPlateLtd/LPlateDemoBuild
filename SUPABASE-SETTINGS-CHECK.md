# Supabase Settings That Need to Be Checked

## Critical Settings to Verify

### 1. Authentication → Settings → Flow Type
**Location**: Supabase Dashboard → Authentication → Settings

**Check**: Look for "Flow Type" or "Auth Flow" setting

**Options**:
- `PKCE` (Proof Key for Code Exchange) - Requires code verifier
- `Implicit` - Uses hash tokens, no code verifier needed

**Action**: 
- If it's set to `PKCE`, we have a mismatch (our code uses `implicit`)
- **OR** change our code back to `pkce` and handle code verifier differently
- **OR** check if there's a way to use implicit for email links specifically

### 2. Authentication → Email Templates → Magic Link
**Location**: Supabase Dashboard → Authentication → Email Templates → Magic Link

**Check**: The email template format

**Current Issue**: 
- Email links are coming with `?code=...` (PKCE format)
- But we're using `implicit` flow which expects hash tokens `#access_token=...`

**What to Check**:
- Does the template use `{{ .ConfirmationURL }}`?
- Is there a way to configure it to use hash tokens instead of query parameters?

### 3. Authentication → URL Configuration
**Already Verified**:
- ✅ Site URL: `https://lplate-khaki.vercel.app` (base domain)
- ✅ Redirect URLs include `/welcome`

### 4. Authentication → Providers → Email
**Check**:
- Email provider is enabled
- Email OTP is enabled
- Confirmation required: Check if this affects link format

---

## The Real Problem

The issue is that **Supabase's email verification links always use `?code=...` format**, regardless of the client's `flowType` setting. The `flowType` in the client only affects how OAuth flows work, not email verification links.

**Email verification links work like this**:
1. User clicks link: `https://{project}.supabase.co/auth/v1/verify?token={code}&type=email&redirect_to={url}`
2. Supabase verifies the token
3. Supabase redirects to `redirect_to` URL with tokens

**The problem**: When Supabase redirects back, it might be using PKCE format (`?code=...`) instead of implicit format (`#access_token=...`).

---

## Possible Solutions

### Option 1: Use Supabase's Verify Endpoint (Current Approach)
- Redirect to Supabase's `/verify` endpoint with the code
- Supabase verifies and redirects back with tokens
- **Issue**: Need to ensure Supabase redirects with hash tokens for implicit flow

### Option 2: Change Back to PKCE Flow
- Change `flowType` back to `pkce` in code
- But handle the code verifier issue differently
- **Issue**: Code verifier still won't be available in email links

### Option 3: Use Server-Side Verification
- Create an API route that verifies the code server-side
- Server has access to service role key
- **Issue**: More complex, but might be necessary

### Option 4: Check Supabase Email Template Settings
- See if there's a setting to use implicit flow for email links
- Or configure email template to use different redirect format

---

## What to Check in Supabase Dashboard

1. **Authentication → Settings**:
   - Look for "Flow Type" or "Auth Flow" setting
   - Note what it's set to

2. **Authentication → Email Templates → Magic Link**:
   - Check the template content
   - See if `{{ .ConfirmationURL }}` is used
   - Check if there are any configuration options

3. **Authentication → Providers → Email**:
   - Check "Enable email confirmations" setting
   - See if there are flow-related options

4. **Check Supabase Logs**:
   - Look at the `/verify` request that's failing
   - See what parameters Supabase is expecting
   - The error says "One-time token not found" - this suggests the token format might be wrong

---

## Recommendation

**Before making code changes**, check:
1. What flow type is set in Supabase Dashboard (if any)
2. If there's a way to configure email links to use implicit flow
3. What the actual email link format is (check the email you received)

The code change I just made (redirecting to Supabase's verify endpoint) should work, but we need to ensure Supabase redirects back with the right format (hash tokens for implicit flow).

