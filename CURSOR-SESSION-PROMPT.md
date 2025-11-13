# LPlate Project Diagnostic Prompt

Use this prompt when starting a new Cursor session to quickly get up to speed on the LPlate project:

---

## 🚗 LPlate Project Diagnostic & Context Setup

I'm working on **LPlate**, a UK learner driver marketplace connecting learners with qualified driving instructors. **PRODUCTION STATUS: Stripe Connect integration is complete and deployed!** 🎉

### 🎯 **Current Status (Latest - v3.15 Authentication Flow & Learner Dashboard Enhancements)**
- ✅ **Authentication Flow Overhaul**: Complete email verification flow with PKCE, resilient error handling, and password setup
- ✅ **Welcome Page**: New `/welcome` page handles email verification, session creation, and redirects new/existing users appropriately
- ✅ **Error Handling**: Enhanced `/auth/error` page with auto-detection, helpful error messages, and resend functionality
- ✅ **Sign-In Page Updates**: Improved UI with Log In/Sign Up toggle, mobile number collection, and better email confirmation screen
- ✅ **Learner Dashboard**: Added "Upcoming lessons" card showing up to 3 lessons this week with instructor details, times, and pick-up locations
- ✅ **Welcome Message**: Personalized learner dashboard greeting "Welcome [FirstName]! 👋"
- ✅ **PKCE Flow**: Switched to PKCE authentication flow to properly handle Supabase email verification links
- ✅ **Code Verifier Handling**: Implemented localStorage checking and retry logic for code verifier issues
- ✅ **Production Deployment**: Successfully deployed with all authentication improvements and dashboard enhancements
- ✅ **TypeScript Fixes**: Resolved all TypeScript errors including postcode property type assertions

### 🎯 **Previous Status (v3.13 Instructor Availability Enhancement)**
- ✅ **Instructor Availability Page Enhancement**: Complete UI/UX overhaul with accessibility-friendly toggle switches
- ✅ **Accessibility Compliance**: Full keyboard navigation (Space/Enter) and screen reader support with proper ARIA attributes
- ✅ **Improved Toggle Design**: Single-button toggles with "Open"/"Busy" text positioned close to edges for better visual balance
- ✅ **Cleaner Time Inputs**: Removed edit icons from time inputs for cleaner, more obvious interaction design
- ✅ **Compact Layout**: Reduced spacing between time elements and input padding for more efficient use of space
- ✅ **Professional Title**: Changed from "Your Diary" to "Working Hours" with centered alignment
- ✅ **Enhanced UX**: Single-click toggle functionality with smooth animations and better visual feedback
- ✅ **Production Deployment**: Successfully built, tested, and deployed to Vercel with all improvements

### 🎯 **Previous Status (Homepage Mobile Optimization)**
- ✅ **Enhanced Social Media Links**: Fixed social links to fit properly on 375px mobile screens with responsive spacing and text sizing
- ✅ **Optimized Social Layout**: Changed from horizontal wrapping to single-row layout with "Insta" abbreviation for better fit
- ✅ **Redesigned Stats Section**: Converted from horizontal grid to vertical stacked cards with horizontal icon-stat-text layout
- ✅ **Improved Stats Alignment**: Fixed misalignment issues with proper spacing and text sizing for mobile compatibility
- ✅ **Mobile-First Stats Design**: Icon on left, statistic in center, description on right with consistent spacing
- ✅ **Compact Text Sizing**: Reduced text sizes to ensure "Qualified Instructors" fits on one line
- ✅ **Professional Stats Layout**: Clean horizontal flow with proper alignment and mobile optimization
- ✅ **Enhanced Mobile Menu**: Fixed mobile menu to be properly adaptive with full-screen overlay and smooth slide-in animations
- ✅ **Improved Mobile UX**: Menu now covers entire screen on mobile with backdrop and close button for better usability
- ✅ **Request Change Feature**: Added duration dropdown (1 or 2 hours) to reschedule modal for complete lesson modification
- ✅ **Smart Duration Detection**: Reschedule modal automatically detects and pre-fills current lesson duration
- ✅ **Enhanced Booking Actions**: Conditional action buttons based on lesson timing (cancel >72hrs, request change <72hrs, leave feedback if completed)
- ✅ **Mobile-First Design**: All booking interactions optimized for mobile devices with proper spacing and touch targets
- ✅ **Professional Animations**: Smooth slide-in/out transitions for mobile menu with proper z-index layering
- ✅ **Fixed Profile Picture Upload**: Resolved RLS policy issues preventing instructor profile picture uploads
- ✅ **Simplified Storage Policies**: Updated Supabase storage policies to use authentication-only approach
- ✅ **Enhanced Upload Flow**: Streamlined profile picture upload with proper error handling
- ✅ **Production-Ready Code**: Cleaned up debugging code for production deployment
- ✅ **Verified Persistence**: Profile pictures now upload and persist correctly across sessions
- ✅ **Clean White Background**: Pure white page background with gradient content panels for visual hierarchy
- ✅ **Enhanced Share Button**: Black text and icons on green background for better readability and contrast
- ✅ **Streamlined Rating Badge**: Reduced height black container with golden shimmer star for premium feel
- ✅ **Unified Visual Design**: Consistent styling across header, panels, and interactive elements
- ✅ **Professional Appearance**: Clean, modern design that enhances instructor credibility and trust
- ✅ **Database Integration**: Successfully added badge_type and badge_number fields to instructors table
- ✅ **Enhanced Public Profiles**: Clean, professional instructor profile display with prominent rating badges
- ✅ **Improved Search Results**: Vehicle type now sits alongside rating badges for better information hierarchy
- ✅ **Privacy-First Design**: Personal details (phone, email, badge numbers) remain private to learners
- ✅ **Mobile-Optimized Layout**: Consistent text sizes and balanced header layouts across all views
- ✅ **Professional Badge System**: Training Instructor → PDI → ADI progression with 6-8 digit validation
- ✅ **Visual Consistency**: Unified rating badge styling with golden shimmer stars across all components
- ✅ **Enhanced Instructor Profile Form**: Complete redesign with mobile-first layout and logical field grouping
- ✅ **Badge Type System**: Training Instructor → PDI → ADI progression with badge number validation
- ✅ **Mobile-Optimized Layout**: Side-by-side fields with smaller labels for better mobile experience
- ✅ **Form Flow Optimization**: Personal info → instructor details → bio → languages logical progression
- ✅ **Input Validation**: Badge number field with 6-8 digit numeric validation and real-time filtering
- ✅ **Professional Badge Management**: Comprehensive instructor certification tracking system
- ✅ **Password-Based Authentication**: Complete sign-up, login, and password reset flow
- ✅ **Enhanced Rating Badges**: Premium black badges with golden shimmer stars
- ✅ **Improved Location Icons**: Larger pin icons in green-600 containers matching price styling
- ✅ **Mobile-Optimized Design**: Compact rating badges with perfect centering
- ✅ **Brand Consistency**: Location icons match price color, rating badges use sophisticated black
- ✅ **Production-Ready Auth**: Email verification, secure password requirements, and proper error handling
- ✅ **Stripe Connect**: Fully integrated with production-ready schema
- ✅ **Database**: ChatGPT-improved schema with concurrency-safe credit ledger
- ✅ **Webhooks**: Deployed and processing events successfully
- ✅ **Build**: All TypeScript and linting issues resolved
- ✅ **Deployment**: Live on Vercel with Stripe Connect functionality
- ✅ **Frontend**: Enhanced UI/UX with mobile-first design and accessibility improvements
- ✅ **Navigation**: Redesigned instructor menu with collapsible Schedule section
- ✅ **Booking Management**: Status-based earnings display with color coding
- ✅ **Sign-up Experience**: Dynamic role-based car images
- ✅ **Availability Interface**: Modern segmented toggles with gradient backgrounds
- ✅ **Calendar Implementation**: Complete instructor calendar with monthly view and real booking integration
- ✅ **Mobile Optimization**: Enhanced calendar with larger numbers, better spacing, and smooth navigation
- ✅ **Production Ready**: Environment validation, health monitoring, smoke testing, and SBOM generation
- ✅ **Type Safety**: Generated Supabase database types with proper TypeScript integration
- ✅ **Build Optimization**: Resolved syntax errors and chunk loading issues
- ✅ **MVP Complete**: Ready for production deployment with comprehensive safety nets
- ✅ **Project Cleanup**: Removed unnecessary files, streamlined structure, production-ready
- ✅ **GitHub Deployment**: Successfully deployed via GitHub integration to Vercel
- ✅ **Professional Instructor Profiles**: Complete public profile pages with large photos, integrated info bars, and comprehensive details
- ✅ **Smart Content Management**: Truncated About sections with expandable "Read more" functionality
- ✅ **Multi-Language Support**: Instructors can specify up to 3 teaching languages with comprehensive language selection
- ✅ **Elegant Share Functionality**: Pill-shaped share buttons with URL copying and visual feedback

Please help me get up to speed by running these diagnostics and providing a comprehensive project overview.

### 📋 **Immediate Diagnostics to Run:**

1. **Check Project Status**
   - Run `git status` to see current changes
   - Run `git log --oneline -5` to see recent commits
   - Check if dev server is running (`pnpm dev` if needed)

2. **Review Key Files**
   - Read `README.md` for project overview and current features
   - Check `package.json` for dependencies and scripts
   - Review `src/app/page.tsx` for homepage structure
   - Check `src/components/ui/SocialProofCarousel.tsx` for current implementation

3. **Database & Backend Status**
   - Check if Supabase environment variables are configured
   - Review any SQL files in root directory for database setup
   - Check `src/lib/supabase.ts` for client configuration

4. **Known Issues Check**
   - Look for `BUG-*.md` files documenting current issues
   - Check console for any runtime errors
   - Verify social proof system functionality

### 🎯 **Project Context:**

**Tech Stack:** Next.js 16, TypeScript, TailwindCSS, Supabase (Postgres + Auth + Storage), Stripe Connect

**Core Features:**
- Enhanced instructor search with advanced filtering and postcode normalization
- Modern segmented toggle controls for vehicle type, gender, duration, and time of day
- Multi-day availability selection with privacy-protected location display
- Price-sorted results with prominent pricing badges and large profile pictures
- Booking system with availability calendar
- Profile management with photo uploads
- Social proof system (learner certificate uploads)
- Role-based authentication (learner vs instructor)
- **Stripe Connect Integration**: Complete payment processing with automated payouts
- **Prepaid Lesson Credits**: Multi-hour purchases with automatic deduction
- **Discount & Referral Codes**: Promotional code support at checkout
- **Professional Instructor Profiles**: Public profile pages with large photos, integrated info bars, and comprehensive details
- **Smart Content Management**: Truncated About sections with expandable "Read more" functionality
- **Multi-Language Support**: Instructors can specify up to 3 teaching languages
- **Elegant Share Functionality**: Pill-shaped share buttons with URL copying

**Current Focus Areas:**
- ✅ **Instructor Dashboard Creation**: COMPLETED - Established monthly-focused instructor dashboard with earnings tracking
- ✅ **Instructor Earnings Page**: COMPLETED - Dedicated earnings page with Stripe Connect integration
- **Instructor Bookings Page**: Make instructor bookings page work like the learner one with consistent UI/UX
- **Learner Dashboard Accuracy**: Fix learner dashboard to show accurate information and real-time updates
- **Calendar Feature Management**: Toggle off/remove calendar feature while preserving existing work
- **Availability Page Mobile Review**: Review and optimize mobile UI for working hours page
- **Mobile Experience Polish**: ✅ COMPLETED - Enhanced mobile interactions with proper touch targets and animations
- **Stripe API Integration**: Implement complete booking flow with payment processing
- **Production Monitoring**: Monitor live application performance and user feedback
- **User Testing**: Gather feedback from real users and instructors
- **Performance Optimization**: Monitor and optimize based on production usage
- **Feature Enhancement**: Plan next iteration based on user needs
- **Security Monitoring**: Monitor for any security issues or vulnerabilities

### 🎯 **Next Session Priorities (v3.14):**

**High Priority Tasks:**
1. ✅ **Instructor Earnings Page** - COMPLETED
   - ✅ Created dedicated earnings tracking page for instructors
   - ✅ Display weekly/monthly earnings with visual charts
   - ✅ Show completed vs pending lesson earnings
   - ✅ Add payout history and upcoming payouts

2. **Hide Instructor Calendar Page**
   - Temporarily hide/disable calendar functionality
   - Remove calendar from navigation menu
   - Preserve existing calendar code for future use
   - Update instructor dashboard to remove calendar references

3. **Settings Page**
   - Create user settings page for both learners and instructors
   - Add profile management, notification preferences
   - Include account settings, privacy controls
   - Add password change and account deletion options

4. **Learner Dashboard**
   - Create comprehensive learner dashboard
   - Show lesson history, progress tracking, upcoming lessons
   - Display instructor ratings and feedback
   - Add learning goals and achievement tracking

5. **Stripe API Integration**
   - Complete Stripe Connect integration for payments
   - Implement booking payment flow
   - Add instructor payout processing
   - Handle refunds and disputes

6. **Complete Booking Flow**
   - End-to-end booking process from search to payment
   - Instructor availability integration
   - Booking confirmation and notifications
   - Lesson scheduling and management

**Technical Focus Areas:**
- **Accessibility**: Continue implementing accessibility best practices across all components
- **Mobile Optimization**: Focus on mobile UI improvements and responsive design
- **Performance**: Monitor and optimize application performance and loading times
- **User Experience**: Gather feedback and implement user-requested improvements

### 🎯 **Next Development Priorities:**

1. **Booking Flow Enhancement** ✅ **COMPLETED**
   - ✅ Complete first stage of booking page with improved UX
   - ✅ Add lesson duration selection (1 or 2 hours)
   - ✅ Implement date/time picker with instructor availability
   - ✅ Add special requests/notes functionality
   - ✅ Improve booking confirmation flow
   - ✅ Add reschedule functionality with duration modification

2. **Mobile Experience Optimization** ✅ **COMPLETED**
   - ✅ Fix mobile menu to be properly adaptive
   - ✅ Enhance mobile booking interactions
   - ✅ Optimize touch targets and spacing
   - ✅ Add smooth animations and transitions

3. **Stripe API Integration** (Next Phase)
   - Implement complete booking flow with payment processing
   - Connect booking requests to Stripe payment intents
   - Add instructor payout calculations
   - Implement booking confirmation after payment
   - Add refund and cancellation handling

4. **User Experience Polish** (Ongoing)
   - Gather feedback from real users and instructors
   - Optimize mobile experience based on usage patterns
   - Enhance accessibility features
   - Improve loading states and error handling

**Key Areas to Investigate:**

1. **Instructor Bookings Page Status**
   - Current location: `src/app/instructor/bookings/page.tsx`
   - Compare with learner bookings: `src/app/bookings/page.tsx`
   - Check data fetching logic and UI consistency
   - Verify instructor-specific booking actions and status handling

2. **Learner Dashboard Issues**
   - Current location: `src/app/dashboard/page.tsx`
   - Check data accuracy and real-time updates
   - Verify dashboard metrics and statistics display
   - Compare with expected vs actual data

3. **Calendar Feature Management**
   - Current location: `src/app/instructor/calendar/page.tsx`
   - Navigation references in `src/components/Navigation.tsx`
   - Preserve existing calendar work before removal
   - Clean up menu items and routing

4. **Availability Page Mobile Issues**
   - Current location: `src/app/instructor/availability/page.tsx`
   - Review mobile responsiveness and touch interactions
   - Check toggle switches and mobile layout
   - Optimize for mobile usability

5. **Instructor Dashboard Creation**
   - Reference learner dashboard: `src/app/dashboard/page.tsx`
   - Create instructor-specific metrics and information
   - Ensure role-based dashboard functionality
   - Consider instructor-specific data needs

### 🔍 **Key Areas to Investigate:**

1. **Production-Ready Stripe Connect Integration**
   - Verify webhook endpoints are deployed and processing events successfully
   - Check new database schema is properly migrated (orders, lessons, credit_ledger, payout_instructions)
   - Test payment processing with improved schema tables
   - Confirm automated Friday payout system with lesson completion tracking
   - Verify concurrency-safe credit ledger system (append-only delta_minutes)
   - Test discount and referral code application
   - Check dispute and refund handling with new schema
   - Verify admin dashboard views and audit trails are working

2. **Enhanced Instructor Search System**
   - Verify postcode normalization is working (handles spaces/no spaces)
   - Test segmented toggle controls for all filter types
   - Check multi-day availability selection functionality
   - Confirm price sorting (lowest first) is working
   - Verify privacy protection (masked postcodes, miles display)
   - Test Enter key support in search bar
   - Verify instant search results from homepage (no double-typing)

2. **Instructor Card Display**
   - Check profile pictures are loading correctly (not just initials)
   - Verify pricing badges are prominent and properly formatted
   - Confirm information hierarchy: Name → Location → Rating → Vehicle Type
   - Test responsive design on mobile devices

3. **Social Proof System**
   - Check if learner names are displaying correctly (not "Learner")
   - Verify certificate images are loading
   - Test upload functionality

4. **Database Schema**
   - Verify social_proof_submissions table exists
   - Check RLS policies for storage buckets
   - Confirm test data is properly linked

5. **UI/UX Status**
   - Verify left/right layout in social proof cards
   - Check date format ("DD Mth")
   - Confirm location names are clean (no "Test Centre")

### 📝 **Expected Output:**

Please provide:
1. **Project Status Summary** - Current state, recent changes, any issues
2. **Feature Status** - What's working, what needs attention
3. **Technical Health** - Build status, dependencies, environment
4. **Next Steps** - Recommended actions or priorities
5. **Known Issues** - Any documented bugs or limitations

### 🚨 **Session Issues & Lessons Learned (v3.12):**

**Homepage Mobile Optimization Issues (RESOLVED):**
- ⚠️ **Issue**: Social media links were wrapping to multiple rows on 375px mobile screens
- ✅ **Solution**: Changed from `flex-wrap` to single-row layout with `gap-2` spacing and "Insta" abbreviation
- ✅ **Key Learning**: Always test social links on actual mobile widths - wrapping can break layout

**Stats Section Layout Issues (RESOLVED):**
- ⚠️ **Issue**: Horizontal grid layout was cramped on mobile, text was wrapping
- ✅ **Solution**: Converted to vertical stacked cards with horizontal icon-stat-text layout
- ✅ **Key Learning**: Vertical stacking often works better for mobile than horizontal grids

**Stats Alignment Issues (RESOLVED):**
- ⚠️ **Issue**: `justify-between` was centering statistics in middle space, causing misalignment
- ✅ **Solution**: Used `space-x-6` with `ml-auto` for proper spacing and right-aligned text
- ✅ **Key Learning**: `justify-between` can cause floating elements - use controlled spacing instead

**Text Sizing Issues (RESOLVED):**
- ⚠️ **Issue**: "Qualified Instructors" text was too long for mobile layout
- ✅ **Solution**: Reduced text sizes from `text-2xl`/`text-sm` to `text-xl`/`text-xs`
- ✅ **Key Learning**: Always test text length on target mobile widths

**Future Prevention:**
- Test all layouts on actual mobile widths (375px) not just responsive breakpoints
- Use controlled spacing instead of `justify-between` for predictable layouts
- Consider text length when designing mobile layouts
- Vertical stacking often better than horizontal grids for mobile

### 🚨 **Session Issues & Lessons Learned (v3.11):**

**Mobile Menu Issues (RESOLVED):**
- ⚠️ **Issue**: Mobile menu was using `absolute` positioning with fixed width, leaving content partially visible behind it
- ✅ **Solution**: Changed to `fixed` positioning with full-screen overlay (`inset-0`) and proper z-index layering
- ✅ **Key Learning**: Always use `fixed` positioning for mobile overlays, not `absolute` - ensures proper full-screen coverage
- ✅ **Animation**: Added smooth slide-in transitions with `transform` and `transition-transform` for professional feel

**Reschedule Modal Enhancement (RESOLVED):**
- ⚠️ **Issue**: User requested duration dropdown but modal only had date/time fields
- ✅ **Solution**: Added duration state management and dropdown with 1/2 hour options
- ✅ **Key Learning**: Always consider all aspects of a feature request - duration was missing from reschedule flow
- ✅ **UX**: Pre-fill current duration for better user experience

**Code Structure Issues (RESOLVED):**
- ⚠️ **Issue**: Duplicate div elements created during mobile menu refactoring
- ✅ **Solution**: Careful review of opening/closing tags and proper fragment usage (`<>`)
- ✅ **Key Learning**: Always check for duplicate elements when refactoring complex JSX structures

**Future Prevention:**
- Always test mobile overlays with `fixed` positioning and full-screen coverage
- Consider all aspects of feature requests (duration, timing, validation, etc.)
- Use proper React fragments and check for duplicate elements during refactoring
- Test animations and transitions on actual mobile devices for proper UX

### 🚨 **Current Known Issues (v3.5 - Production Deployed & Cleaned):**

**All Major Issues Resolved:**
- ✅ **Syntax Errors**: Calendar page syntax errors resolved with proper TypeScript integration
- ✅ **Unknown Names**: Booking display now shows actual learner names correctly
- ✅ **Data Fetching**: Supabase query joins working properly with type-safe database operations
- ✅ **Compilation Errors**: All TypeScript compilation errors resolved
- ✅ **Build Process**: Successful build and deployment with proper error handling
- ✅ **Environment Validation**: Comprehensive env variable validation implemented
- ✅ **Health Monitoring**: Health endpoint and smoke testing in place
- ✅ **Project Cleanup**: All unnecessary files removed, streamlined structure
- ✅ **Production Deployment**: Successfully deployed via GitHub to Vercel

**Minor Issues (Non-blocking):**
- ⚠️ **Image Aspect Ratio Warnings**: Social proof carousel images show aspect ratio warnings (cosmetic only)
- ⚠️ **Deprecated Dependencies**: One low-impact deprecated subdependency identified (node-domexception@1.0.0)

### 🚨 **Common Issues to Check:**

**Stripe Connect Issues (RESOLVED):**
- ✅ Webhook endpoints deployed and responding (FIXED)
- ✅ TypeScript build errors resolved (FIXED)
- ✅ Stripe API key configuration working (FIXED)
- ✅ Webhook signature verification working (FIXED)
- ✅ Payment processing with new schema (FIXED)
- ✅ Commission calculation correct (18% added to instructor rate) (FIXED)
- ✅ Instructor payout system implemented (FIXED)
- ✅ Credit system using concurrency-safe ledger (FIXED)

**Database Schema Issues:**
- Database migration not applied (`stripe-connect-migration.sql`)
- Missing Stripe Connect tables (orders, lessons, credit_ledger, payout_instructions)
- Helper functions not installed (`stripe-connect-functions.sql`)

**Existing Issues (Mostly Fixed):**
- ✅ Instructor names showing correctly (FIXED)
- ✅ Profile pictures loading properly (FIXED)
- ✅ Postcode normalization working (FIXED)
- ✅ Filter toggles responding correctly (FIXED)
- ✅ Price sorting working (lowest first) (FIXED)
- ✅ Enter key triggering search (FIXED)
- ✅ Distance showing in miles (FIXED)
- ✅ Postcodes masked for privacy (FIXED)
- ✅ Homepage search working without double-typing (FIXED)
- ✅ Service radius filtering working (FIXED)
- ✅ Learner names displaying correctly (FIXED)
- ✅ Build errors resolved (FIXED)
- ✅ Supabase connection working (FIXED)

### 📁 **Important File Locations:**

**Stripe Connect Files:**
- `src/lib/stripe.ts` - Stripe configuration and utilities
- `src/app/api/stripe-connect/account/route.ts` - Account management
- `src/app/api/payments/route.ts` - Payment processing
- `src/app/api/payouts/route.ts` - Automated payout system
- `src/app/api/credits/route.ts` - Prepaid credit management
- `src/app/api/webhooks/stripe-connect/route.ts` - Connect webhooks
- `src/app/api/webhooks/stripe-payments/route.ts` - Payment webhooks (updated for new schema)
- `stripe-connect-migration.sql` - Database migration script (works with existing tables)
- `stripe-connect-functions.sql` - Helper functions and views
- `stripe-schema-improved.mmd` - Visual schema diagram
- `env-template.txt` - Environment variables template

**Core Application Files:**
- `README.md` - Project documentation with latest updates
- `PRE-DEPLOYMENT-GUIDE.md` - Comprehensive deployment guide with troubleshooting
- `src/app/page.tsx` - Homepage with instructor carousel
- `src/app/search/page.tsx` - Enhanced instructor search with modern filtering
- `src/components/ui/SearchBar.tsx` - Enhanced search with postcode formatting
- `src/components/ui/ToggleGroup.tsx` - New segmented toggle component
- `src/components/ui/FilterChips.tsx` - Multi-select filter chips
- `src/components/ui/InstructorCard.tsx` - Instructor display card
- `src/components/ui/SocialProofCarousel.tsx` - Social proof display
- `src/components/ui/SocialProofSubmissionForm.tsx` - Certificate upload
- `src/app/bookings/page.tsx` - Learner booking management
- `src/app/instructor/[id]/page.tsx` - Public instructor profile pages with integrated design
- `src/app/instructor/profile/page.tsx` - Instructor profile management with service radius and language selection
- `src/app/instructor/calendar/page.tsx` - Instructor calendar with monthly view and booking integration
- `src/app/instructor/page.tsx` - Instructor dashboard with monthly earnings focus
- `src/app/instructor/earnings/page.tsx` - Instructor earnings tracking page with Stripe Connect integration
- `src/app/instructor/availability/page.tsx` - Weekly availability management with modern toggles
- `src/app/instructor/bookings/page.tsx` - Instructor booking management with status-based earnings
- `src/components/ui/BackButton.tsx` - Reusable back navigation button component
- `src/components/ui/ProfileAvatarUpload.tsx` - Profile photo upload component
- `src/components/ui/PrimaryButton.tsx` - Reusable primary action button component
- `src/app/api/health/route.ts` - Health endpoint for monitoring and deployment verification

**Database & Setup Files:**
- `database-setup-social-proof.sql` - Database schema
- `add-service-radius-to-instructors.sql` - Service radius migration
- `add-languages-to-instructors.sql` - Languages field migration
- `update-test-instructors-languages.sql` - Test data updates for languages
- `update-test-instructors-service-radius.sql` - Test data updates
- `check-current-instructors.sql` - Database debugging queries
- `BUG-SOCIAL-PROOF-LEARNER-NAMES.md` - Known issue documentation

---

**Please run these diagnostics and provide a comprehensive project status report. Focus on identifying any issues that need immediate attention and provide actionable next steps.**
