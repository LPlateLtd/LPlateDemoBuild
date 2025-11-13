# Supabase Settings Checklist

## What to Check in Supabase Dashboard

### 1. Authentication → Settings
**Check for these settings:**

- **Flow Type** (if it exists):
  - Some Supabase projects have a global flow type setting
  - Check if it's set to `PKCE` or `Implicit`
  - **Note**: This might not exist in all Supabase projects

- **Enable Email Signup**: Should be ✅ Enabled
- **Enable Email Confirmations**: 
  - If enabled: Users must verify email before login
  - If disabled: Users auto-confirmed (might affect link format)

### 2. Authentication → Email Templates → Magic Link
**Check the template:**

- Should contain: `{{ .ConfirmationURL }}`
- This placeholder gets replaced with the actual verification link
- **Important**: The link format is controlled by Supabase, not the template

### 3. Authentication → URL Configuration
**Already verified:**
- ✅ Site URL: `https://lplate-khaki.vercel.app`
- ✅ Redirect URLs include `/welcome`

---

## The Real Issue

**Supabase's email verification links work like this:**

1. Email contains: `https://{project}.supabase.co/auth/v1/verify?token={code}&type=email&redirect_to={your_url}`
2. User clicks → Goes to Supabase's verify endpoint
3. Supabase verifies token → Redirects to your `redirect_to` URL
4. **The redirect format depends on Supabase's configuration, not our client's `flowType`**

**The problem**: When Supabase redirects back to our URL, it might be using `?code=...` (PKCE) instead of `#access_token=...` (implicit), regardless of our client's `flowType` setting.

---

## What We Need to Know

### Question 1: What format does Supabase use when redirecting?
- Check the actual email link you received
- Does it go directly to `/welcome?code=...`?
- Or does it go through Supabase's verify endpoint first?

### Question 2: Is there a Supabase setting for email link flow type?
- Look in: Authentication → Settings
- See if there's an option for "Email Link Flow Type" or similar
- This might not exist - email links might always use PKCE format

### Question 3: What happens after Supabase verifies?
- When Supabase redirects back to our URL, what format does it use?
- Hash tokens (`#access_token=...`)?
- Query code (`?code=...`)?
- This determines how we need to handle it

---

## Current Code Approach

I just updated the code to:
1. Detect `code` parameter
2. Redirect to Supabase's `/verify` endpoint with the code
3. Supabase verifies and redirects back (hopefully with hash tokens for implicit flow)

**But this might cause a redirect loop** if Supabase is already redirecting through verify.

---

## Recommendation

**Before making more code changes**, please check:

1. **What does the actual email link look like?**
   - Copy the full URL from the email
   - Does it go to Supabase's domain first, or directly to your domain?

2. **Supabase Dashboard → Authentication → Settings**
   - Look for any "Flow Type" or "Auth Flow" options
   - Take a screenshot or note what you see

3. **Supabase Dashboard → Logs → Auth**
   - Look at the `/verify` request that's failing
   - See what parameters it received
   - The error "One-time token not found" suggests the token format might be wrong

Once we know these details, we can determine if:
- We need to change Supabase settings
- We need to change our code approach
- Or both

