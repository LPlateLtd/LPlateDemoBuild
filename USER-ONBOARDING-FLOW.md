# User Onboarding Flow

## Current Flow (As Implemented)

### 1. **Sign Up Page** (`/sign-in` - Sign Up mode)
   - User toggles to "Sign Up" mode
   - Enters:
     - Email address
     - Mobile Number
   - Selects role:
     - Clicks "Learner >" button OR
     - Clicks "Instructor >" button
   - **Action**: Magic link email sent to user
   - **UI**: Shows "Check your email" confirmation screen

### 2. **Email Verification** (Email Link)
   - User receives email with verification link
   - Link format: `https://bvlilxbhipbworirvzcl.supabase.co/auth/v1/verify?token=...&redirect_to=https://lplate-khaki.vercel.app/`
   - **Note**: Supabase redirects to Site URL (homepage) with tokens in URL hash

### 3. **Homepage Redirect** (`/` - Homepage)
   - Homepage detects auth tokens in URL hash
   - **Action**: Automatically redirects to `/auth/verify?role=learner` (or `instructor`)

### 4. **Email Verification Page** (`/auth/verify?role=...`)
   - Processes email verification tokens
   - Checks if user has existing profile
   - **If existing user**: Redirects to dashboard (`/instructor` or `/dashboard`)
   - **If new user**: Redirects to `/auth/reset-password?role=...`
   - **UI**: Shows loading spinner with "Verifying your email..."

### 5. **Password Setup Page** (`/auth/reset-password?role=...`)
   - User enters:
     - New password
     - Confirm password
   - **On Submit**:
     - Shows loading spinner ("Creating your account..." or "Updating password...")
     - Updates password in Supabase
     - **For new users**: Creates profile in database with role
     - **Action**: Redirects to dashboard
   - **Redirect destinations**:
     - Instructors → `/instructor`
     - Learners → `/dashboard`

### 6. **Dashboard** (`/instructor` or `/dashboard`)
   - User lands on their respective dashboard
   - Onboarding complete ✅

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SIGN UP PAGE (/sign-in - Sign Up mode)                   │
│    • Enter email + mobile                                    │
│    • Click "Learner >" or "Instructor >"                    │
│    • Magic link email sent                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. EMAIL VERIFICATION (Email Link)                          │
│    • User clicks link in email                              │
│    • Supabase processes token                               │
│    • Redirects to homepage (Site URL)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. HOMEPAGE (/) - Auto Redirect                            │
│    • Detects auth tokens in URL hash                        │
│    • Redirects to /auth/verify?role=...                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. VERIFY PAGE (/auth/verify?role=...)                     │
│    • Processes verification                                 │
│    • Checks for existing profile                            │
│    • If new user → /auth/reset-password?role=...          │
│    • If existing user → Dashboard                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. PASSWORD SETUP (/auth/reset-password?role=...)          │
│    • Enter new password                                     │
│    • Confirm password                                       │
│    • Submit → Loading spinner                               │
│    • Profile created (for new users)                       │
│    • Redirect to dashboard                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. DASHBOARD (/instructor or /dashboard)                   │
│    • Onboarding complete! ✅                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Points

1. **Role Selection**: Happens at signup (Learner or Instructor button)
2. **Email Verification**: Handled by `/auth/verify` page
3. **Password Setup**: Required for all new users at `/auth/reset-password`
4. **Profile Creation**: Automatically created when password is set (for new users)
5. **Dashboard Redirect**: Based on user role:
   - Instructors → `/instructor`
   - Learners → `/dashboard`

---

## Potential Profile Setup Step

**Note**: There are profile pages at:
- `/learner/profile` - For learner profile completion
- `/instructor/profile` - For instructor profile completion

Currently, users are redirected directly to dashboard after password setup. If you want to add a profile completion step, the flow would be:

```
Password Setup → Profile Setup → Dashboard
```

This would require updating the redirect in `/auth/reset-password/page.tsx` to go to profile pages instead of dashboard for new users.

