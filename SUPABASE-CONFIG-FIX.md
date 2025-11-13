# ⚠️ Supabase Configuration Fix Required

## Current Issue

Your **Site URL** is set to: `https://lplate-khaki.vercel.app/auth/verify`

This is **incorrect**. The Site URL should be the **base domain only**, not a specific path.

## ✅ Correct Configuration

### Site URL (Change This)
```
https://lplate-khaki.vercel.app
```
**NOT** `https://lplate-khaki.vercel.app/auth/verify`

### Additional Redirect URLs (Keep These)
```
✅ https://lplate-khaki.vercel.app/welcome
✅ https://lplate-khaki.vercel.app/auth/reset-password
✅ https://lplate-khaki.vercel.app/auth/error
```

### Remove This (No Longer Needed)
```
❌ https://lplate-khaki.vercel.app/auth/verify
```
We removed the `/auth/verify` page and now use `/welcome` directly.

## Why This Matters

1. **Site URL** is the default redirect destination when no `emailRedirectTo` is specified
2. It should be your base domain so Supabase can redirect to any path
3. Having a specific path like `/auth/verify` can cause redirect issues

## Steps to Fix

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Change **Site URL** from `https://lplate-khaki.vercel.app/auth/verify` to `https://lplate-khaki.vercel.app`
3. Keep all the Additional Redirect URLs you've added
4. Remove `/auth/verify` from Additional Redirect URLs if it's there
5. Save changes

## After Fixing

The flow will work like this:
1. User signs up → Email sent with link to `/welcome?code=...&role=...`
2. User clicks link → Supabase redirects to `/welcome` (from Additional Redirect URLs)
3. Welcome page processes the code and creates session

