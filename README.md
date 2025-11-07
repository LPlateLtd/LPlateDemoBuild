# 🚗 L Plate - Learner Driver Marketplace

A modern marketplace web app connecting UK learner drivers with qualified driving instructors. Built with Next.js 15, TypeScript, and Supabase.

## ✨ Features

### 🎯 Core Functionality
- **Enhanced Instructor Search**: Advanced search with postcode normalization, multi-day availability, and smart filtering
- **Modern Filter System**: Segmented toggle controls for vehicle type, gender, duration, and time of day
- **Privacy-Focused Display**: Masked postcodes and distance in miles for instructor safety
- **Price-Sorted Results**: Instructors sorted by lowest price first for budget-conscious learners
- **Profile Management**: Instructors can manage their profiles with photos, descriptions, and rates
- **Booking System**: Learners can request lessons and instructors can manage bookings
- **Availability Calendar**: Instructors can set their weekly availability schedule with multi-day selection
- **Real-time Filtering**: Search results filtered by instructor availability and preferences
- **Social Proof System**: Learners can upload driving test certificates to showcase success stories
- **Stripe Connect Integration**: Complete payment processing with automated instructor payouts

### 🎨 Modern UI/UX
- **Apple-inspired design system** with Poppins font and clean aesthetics
- **Mobile-first responsive layout** optimized for all device sizes
- **iOS 7 style toggle switches** for availability management with green/red color coding
- **Segmented toggle controls** with green branding and discrete shadows for filter selection
- **Enhanced instructor cards** with large profile pictures, prominent pricing, and optimized information hierarchy
- **Horizontal instructor carousel** with 295px uniform cards and smooth scrolling
- **Modern card designs** with shadows, hover effects, and optimized spacing
- **Professional instructor profiles** with large profile pictures, integrated info bars, and comprehensive details
- **Smart content management** with truncated About sections and expandable "Read more" functionality
- **Multi-language support** allowing instructors to specify up to 3 teaching languages
- **Elegant share functionality** with pill-shaped buttons and URL copying
- **Hamburger menu navigation** with role-based dropdown menus
- **Enhanced search bar** with real-time postcode formatting and Enter key support
- **3-step journey visualization** with animated icons and connecting arrows
- **Custom logo system** with fallback mechanism for reliable branding
- **Streamlined authentication** with pill-shaped role selection and confirmation screens
- **Social media integration** with playful footer-style links and brand-colored buttons
- **Optimized homepage flow** with strategic section placement for better conversion
- **Social proof carousel** displaying learner success stories with certificate images
- **Certificate upload system** for learners to share their driving test achievements

### 🔐 Authentication & Security
- **Supabase Auth** for secure user authentication
- **Row Level Security (RLS)** protecting user data
- **Role-based access** (learner vs instructor)
- **Profile photo uploads** to Supabase Storage

### 💳 Payment Processing
- **Stripe Connect Integration** for marketplace payments
- **Automated Instructor Payouts** every Friday after lesson completion
- **18% Platform Commission** added to instructor rates (not deducted)
- **Prepaid Lesson Credits** with automatic hour deduction
- **Discount & Referral Codes** support at checkout
- **Dispute Resolution** with refund handling
- **Webhook Processing** for real-time payment updates

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, TypeScript, TailwindCSS |
| **Backend** | Supabase (Postgres + Auth + Storage) |
| **Authentication** | Supabase Auth |
| **Database** | PostgreSQL with geolocation support |
| **File Storage** | Supabase Storage |
| **Styling** | TailwindCSS with custom components |
| **Fonts** | Poppins (Google Fonts) |
| **Payments** | Stripe Connect for marketplace transactions |

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── sign-in/           # Authentication pages
│   ├── auth/
│   │   └── callback/          # Auth callback handling
│   ├── api/
│   │   ├── stripe-connect/
│   │   │   └── account/        # Stripe Connect account management
│   │   ├── payments/          # Payment processing
│   │   ├── payouts/           # Automated payout system
│   │   ├── credits/           # Prepaid lesson credits
│   │   └── webhooks/
│   │       ├── stripe-connect/ # Stripe Connect webhooks
│   │       └── stripe-payments/ # Payment webhooks
│   ├── booking/
│   │   └── request/           # Booking request flow
│   ├── instructor/
│   │   ├── [id]/             # Public instructor profile pages
│   │   ├── page.tsx          # Instructor dashboard (monthly earnings focus)
│   │   ├── profile/          # Instructor profile management
│   │   ├── earnings/         # Instructor earnings tracking page
│   │   ├── availability/     # Weekly availability calendar
│   │   ├── bookings/         # Instructor's booking management
│   │   └── layout.tsx        # Instructor-specific layout
│   ├── search/               # Learner search page
│   ├── bookings/             # Learner's booking management
│   ├── layout.tsx            # Root layout with navigation
│   └── page.tsx              # Homepage
├── components/
│   ├── Navigation.tsx         # Global navigation component
│   └── ui/                    # Reusable UI components
│       ├── SearchBar.tsx      # Enhanced search input with postcode formatting
│       ├── FilterChips.tsx    # Multi-select filter chips for availability
│       ├── ToggleGroup.tsx    # Segmented toggle controls for filters
│       ├── InstructorCard.tsx # Instructor display card component
│       ├── StatCard.tsx      # Statistics display card
│       ├── ProgressBar.tsx    # Progress visualization
│       ├── ToggleSwitch.tsx   # iOS 7 style toggle
│       ├── BackButton.tsx     # Reusable back navigation button
│       ├── ProfileAvatarUpload.tsx # Profile photo upload component
│       ├── PrimaryButton.tsx  # Reusable primary action button
│       └── SocialProofCarousel.tsx # Certificate showcase carousel
└── lib/
    ├── supabase.ts           # Client-side Supabase client
    ├── supabase-browser.ts   # Browser-specific client
    ├── supabase-server.ts    # Server-side client
    └── stripe.ts             # Stripe Connect configuration and utilities
```

## 🗄 Database Schema

### Key Tables

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key, matches Supabase user ID |
| `name` | text | User's display name |
| `role` | text | 'learner' or 'instructor' |
| `postcode` | text | UK postcode for location |
| `phone` | text | Contact phone number |
| `email` | text | Contact email |
| `avatar_url` | text | Profile photo URL |

#### `instructors`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Foreign key to profiles.id |
| `description` | text | Instructor bio/description |
| `gender` | text | 'male', 'female', 'other' |
| `base_postcode` | text | Primary service area |
| `vehicle_type` | text | 'manual', 'auto', 'both' |
| `hourly_rate` | numeric | Price per hour |
| `adi_badge` | boolean | ADI qualification status |
| `verification_status` | text | 'pending', 'approved', 'rejected' |
| `lat` | float8 | Latitude for distance calculation |
| `lng` | float8 | Longitude for distance calculation |
| `service_radius_miles` | integer | Maximum distance instructor will travel (1-50 miles) |

#### `bookings`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `learner_id` | uuid | Foreign key to profiles.id |
| `instructor_id` | uuid | Foreign key to instructors.id |
| `start_at` | timestamptz | Lesson start time |
| `end_at` | timestamptz | Lesson end time |
| `price` | numeric | Total lesson cost |
| `note` | text | Learner's special requests |
| `status` | text | 'pending', 'confirmed', 'cancelled', 'completed' |

#### `availability`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `instructor_id` | uuid | Foreign key to instructors.id |
| `start_at` | timestamptz | Availability start time |
| `end_at` | timestamptz | Availability end time |
| `is_recurring` | boolean | Weekly recurring slot |
| `created_at` | timestamptz | Record creation time |

#### `social_proof_submissions`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `learner_id` | uuid | Foreign key to profiles.id |
| `instructor_id` | uuid | Foreign key to instructors.id |
| `certificate_image_url` | text | URL to uploaded certificate image |
| `test_date` | date | Date of driving test |
| `test_location` | text | Test centre location |
| `testimonial` | text | Optional learner testimonial |
| `status` | text | 'pending', 'approved', 'rejected' |
| `created_at` | timestamptz | Submission timestamp |
| `updated_at` | timestamptz | Last update timestamp |

#### `stripe_connect_accounts`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `instructor_id` | uuid | Foreign key to instructors.id |
| `stripe_account_id` | text | Stripe Connect account ID |
| `account_type` | text | 'express', 'standard', 'custom' |
| `charges_enabled` | boolean | Can accept payments |
| `payouts_enabled` | boolean | Can receive payouts |
| `details_submitted` | boolean | Account setup complete |
| `requirements` | jsonb | Stripe requirements for completion |
| `created_at` | timestamptz | Account creation time |
| `updated_at` | timestamptz | Last update time |

#### `orders` (Payment Orders)
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `learner_id` | uuid | Foreign key to profiles.id |
| `instructor_id` | uuid | Foreign key to instructors.id |
| `stripe_payment_intent_id` | text | Stripe payment intent ID |
| `stripe_balance_txn_id` | text | Stripe balance transaction ID |
| `transfer_group` | text | Stripe transfer group for linking |
| `instructor_rate_pence` | integer | Instructor hourly rate (what they receive) |
| `platform_fee_pence` | integer | 18% commission (added to instructor rate) |
| `total_amount_pence` | integer | Total amount learner pays |
| `hours_booked_minutes` | integer | Hours booked in minutes |
| `currency` | text | 'gbp' |
| `status` | text | 'pending', 'succeeded', 'failed', 'cancelled' |
| `created_at` | timestamptz | Order timestamp |
| `updated_at` | timestamptz | Last update time |

#### `lessons` (Lesson Tracking)
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `instructor_id` | uuid | Foreign key to instructors.id |
| `learner_id` | uuid | Foreign key to profiles.id |
| `start_time` | timestamptz | Lesson start time |
| `end_time` | timestamptz | Lesson end time |
| `duration_minutes` | integer | Lesson duration in minutes |
| `status` | text | 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show' |
| `completed_at` | timestamptz | Lesson completion timestamp |
| `price_pence` | integer | Lesson price in pence |
| `order_id` | uuid | Foreign key to orders.id |
| `booking_id` | uuid | Foreign key to bookings.id |
| `created_at` | timestamptz | Lesson creation time |
| `updated_at` | timestamptz | Last update time |

#### `credit_ledger` (Concurrency-Safe Credit System)
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `learner_id` | uuid | Foreign key to profiles.id |
| `instructor_id` | uuid | Foreign key to instructors.id |
| `delta_minutes` | integer | Credit change (+ for purchases, - for consumption) |
| `source` | text | 'PURCHASE', 'CONSUMPTION', 'REFUND', 'ADJUSTMENT' |
| `order_id` | uuid | Foreign key to orders.id |
| `lesson_id` | uuid | Foreign key to lessons.id |
| `note` | text | Transaction note |
| `created_at` | timestamptz | Transaction timestamp |

#### `payout_instructions` (Friday Payout System)
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `instructor_id` | uuid | Foreign key to instructors.id |
| `lesson_id` | uuid | Unique foreign key to lessons.id |
| `amount_pence` | integer | Payout amount in pence |
| `eligible_on` | date | Next Friday after lesson completion |
| `status` | text | 'PENDING', 'QUEUED', 'SENT', 'FAILED', 'REVERSED' |
| `stripe_transfer_id` | text | Stripe transfer ID |
| `idempotency_key` | text | Transfer idempotency key |
| `created_at` | timestamptz | Instruction creation time |
| `updated_at` | timestamptz | Last update time |

#### `refunds`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `order_id` | uuid | Foreign key to orders.id |
| `stripe_refund_id` | text | Stripe refund ID |
| `amount_pence` | integer | Refund amount in pence |
| `reason` | text | Refund reason |
| `status` | text | 'pending', 'succeeded', 'failed', 'cancelled' |
| `created_at` | timestamptz | Refund timestamp |
| `updated_at` | timestamptz | Last update time |

#### `discount_codes`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `code` | text | Unique discount code |
| `discount_amount_pence` | integer | Fixed discount amount |
| `discount_percentage` | integer | Percentage discount (1-100) |
| `max_uses` | integer | Maximum usage limit |
| `uses_count` | integer | Current usage count |
| `expires_at` | timestamptz | Expiration date |
| `is_active` | boolean | Code active status |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update time |

#### `audit_logs` (Enhanced Audit Trail)
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `entity_type` | text | Type of entity changed |
| `entity_id` | uuid | ID of changed entity |
| `action` | text | Action performed |
| `old_values` | jsonb | Previous values |
| `new_values` | jsonb | New values |
| `user_id` | uuid | Foreign key to profiles.id |
| `event_source` | text | 'APP' or 'WEBHOOK' |
| `stripe_event_id` | text | Stripe event ID (if webhook) |
| `description` | text | Action description |
| `created_at` | timestamptz | Action timestamp |

#### `webhook_log` (Webhook Debugging)
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `stripe_event_id` | text | Unique Stripe event ID |
| `type` | text | Event type |
| `payload` | jsonb | Full event payload |
| `received_at` | timestamptz | Webhook receipt time |
| `processed_at` | timestamptz | Processing completion time |
| `attempts` | integer | Processing attempts count |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### 📋 Pre-Deployment Guide
For deployment best practices and troubleshooting, see **[PRE-DEPLOYMENT-GUIDE.md](./PRE-DEPLOYMENT-GUIDE.md)** - Essential reading before pushing to production!

## 🔧 Development Tools

### Diagnostic Scripts
The project includes comprehensive diagnostic tools to help with development:

- **`CURSOR-SESSION-PROMPT.md`**: Complete prompt for AI assistants to quickly get up to speed on the project
- **`diagnostic.bat`** (Windows) / **`diagnostic.sh`** (Linux/Mac): Automated project health checks
- **`BUG-SOCIAL-PROOF-LEARNER-NAMES.md`**: Documented known issues for future resolution

### Quick Health Check
Run the diagnostic script to check project status:
```bash
# Windows
diagnostic.bat

# Linux/Mac  
./diagnostic.sh
```

### TypeScript Validation
Before deploying, always run:
```bash
npx tsc --noEmit  # Check for TypeScript errors
pnpm run build    # Full build test
```

### Installation

1. **Clone the repository**
   ```bash
git clone <your-repo-url>
cd lplate
   ```

2. **Install dependencies**
   ```bash
pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the project root:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Site Configuration
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_CONNECT_WEBHOOK_SECRET=whsec_your_connect_webhook_secret
   STRIPE_PAYMENTS_WEBHOOK_SECRET=whsec_your_payments_webhook_secret
   
   # Platform Configuration
   PLATFORM_FEE_PCT=18
   ```

4. **Run the development server**
```bash
pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Supabase Setup

1. **Create a new Supabase project**
2. **Run the database migrations** (see Database Setup below)
3. **Set up Storage bucket** named "avatars" for profile photos
4. **Configure RLS policies** for data security

### Stripe Connect Setup

1. **Create Stripe Connect Account**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Enable Stripe Connect
   - Choose "Marketplace" business model
   - Select "Accounts v2 API"

2. **Configure Webhooks**
   - Create webhook endpoint: `https://your-domain.com/api/webhooks/stripe-connect`
   - Events: `v2.core.account.created`, `v2.core.account.updated`, `transfer.created`, `transfer.updated`
   - Create webhook endpoint: `https://your-domain.com/api/webhooks/stripe-payments`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.dispute.created`, `charge.refunded`

3. **Run Database Schema**
   - Execute `stripe-connect-migration.sql` in Supabase SQL editor
   - This creates all Stripe Connect tables and enhances existing ones
   - Execute `stripe-connect-functions.sql` for helper functions and views
   - **Note**: Migration works with existing LPlate tables (profiles, instructors, bookings)

## 🗃 Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('learner', 'instructor')),
  postcode text,
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create instructors table
CREATE TABLE instructors (
  id uuid REFERENCES profiles(id) PRIMARY KEY,
  description text,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  base_postcode text,
  vehicle_type text CHECK (vehicle_type IN ('manual', 'auto', 'both')),
  hourly_rate numeric,
  adi_badge boolean DEFAULT false,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  lat float8,
  lng float8,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id uuid REFERENCES profiles(id),
  instructor_id uuid REFERENCES instructors(id),
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  price numeric NOT NULL,
  note text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Create availability table
CREATE TABLE availability (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id uuid REFERENCES instructors(id),
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  is_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_instructors_location ON instructors(lat, lng);
CREATE INDEX idx_instructors_status ON instructors(verification_status);
CREATE INDEX idx_bookings_learner ON bookings(learner_id);
CREATE INDEX idx_bookings_instructor ON bookings(instructor_id);
CREATE INDEX idx_availability_instructor ON availability(instructor_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies (add your specific policies here)
-- Example: Users can only read/write their own profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

## 🎯 Key Features Implemented

### ✅ Completed Features
- **Apple-Inspired Design System**: Complete UI overhaul with modern aesthetics and Poppins font
- **Homepage Redesign**: Optimized section flow with hero, journey steps, instructor carousel, stats, and social proof
- **Enhanced Search Interface**: Modern filter chips, uniform instructor cards, and real-time filtering
- **iOS 7 Toggle Switches**: Forest green (available) and dark red (busy) color scheme
- **Hamburger Menu Navigation**: Clean dropdown navigation for authenticated users with collapsible Schedule submenu
- **Instructor Carousel**: Horizontal scrolling with 295px uniform cards and proper spacing
- **Profile Photo Management**: Enhanced avatar display with fallback initials and Supabase Storage
- **Booking System**: Complete booking request and management flow
- **Availability Calendar**: Weekly availability management with modern segmented toggles and gradient backgrounds
- **My Bookings Pages**: Separate management interfaces for learners and instructors with status-based earnings display
- **Authentication**: Streamlined login/signup with Apple-inspired design and dynamic role-based images
- **Mobile-First Design**: Optimized responsive design with proper text sizing and accessibility improvements
- **Logo System**: Custom logo component with reliable fallback mechanism
- **Database Optimization**: Fixed performance issues and reduced excessive API requests
- **Social Media Integration**: Footer-style social links with brand colors and hover animations
- **Homepage Flow Optimization**: Strategic section placement for improved user journey and conversion
- **Enhanced Navigation**: Mobile-friendly instructor menu with larger text, better colors, and collapsible Schedule section
- **Improved Booking Management**: Status-based earnings display with color coding (green for confirmed, yellow for pending, red for cancelled)
- **Dynamic Sign-up Images**: Role-based car images (CarSprout.png for learners, CarPro.png for instructors)
- **Accessibility Improvements**: Larger text sizes, wider menus, and better contrast for mobile users

### 🔄 Latest Updates (v3.14) - Instructor Dashboard & Earnings Page
- **Instructor Earnings Page**: Complete dedicated earnings tracking page with monthly/weekly toggle, visual progress indicators, and payout history
- **Monthly-Focused Dashboard**: Converted instructor dashboard from weekly to monthly earnings focus with £3,000 monthly target
- **Reusable UI Components**: Created common component library (BackButton, ToggleGroup, ProfileAvatarUpload, PrimaryButton) for consistent UI/UX
- **Enhanced Navigation Menu**: Updated instructor menu with Supabase-hosted icons for Dashboard, Profile, Earnings, Bookings, and Working Hours
- **Improved Dashboard Layout**: Optimized spacing and layout with "Hi [First Name]! 👋" greeting and "Manage your business" placement
- **Stripe Account Status**: Added Payments section with color-coded status indicators (Required/Pending/Verified) and Stripe Connect integration
- **Profile Loading Fix**: Resolved database query issues by removing non-existent columns (gender, profile_picture) from profile queries
- **Menu Personalization**: Navigation menu now displays instructor's first name with larger, more prominent text
- **Log Out Button**: Enhanced logout button with orange styling and Supabase-hosted icon
- **TypeScript Fixes**: Resolved all TypeScript errors for clean build and deployment

### 🔄 Previous Updates (v3.13) - Instructor Availability Page Enhancement
- **Accessibility-Friendly Toggle Switches**: Replaced segmented toggles with single-button accessibility-compliant switches
- **Keyboard & Screen Reader Support**: Full keyboard navigation (Space/Enter) and screen reader compatibility with proper ARIA attributes
- **Improved Text Positioning**: "Open"/"Busy" text positioned close to edges of pill shape for better visual balance
- **Cleaner Time Inputs**: Removed edit icons from time inputs for cleaner, more obvious interaction design
- **Compact Layout**: Reduced spacing between time elements (space-x-1) and input padding (px-2 py-1.5) for efficiency
- **Professional Title**: Changed from "Your Diary" to "Working Hours" with centered alignment
- **Enhanced UX**: Single-click toggle functionality with smooth animations and better visual feedback

### 🔄 Previous Updates (v3.12) - Homepage Mobile Optimization
- **Enhanced Social Media Links**: Fixed social links to fit properly on 375px mobile screens with responsive spacing and text sizing
- **Optimized Social Layout**: Changed from horizontal wrapping to single-row layout with "Insta" abbreviation for better fit
- **Redesigned Stats Section**: Converted from horizontal grid to vertical stacked cards with horizontal icon-stat-text layout
- **Improved Stats Alignment**: Fixed misalignment issues with proper spacing and text sizing for mobile compatibility
- **Mobile-First Stats Design**: Icon on left, statistic in center, description on right with consistent spacing
- **Compact Text Sizing**: Reduced text sizes to ensure "Qualified Instructors" fits on one line
- **Professional Stats Layout**: Clean horizontal flow with proper alignment and mobile optimization

### 🔄 Previous Updates (v3.11) - Mobile Menu & Booking Enhancements
- **Enhanced Mobile Menu**: Fixed mobile menu to be properly adaptive with full-screen overlay and smooth slide-in animations
- **Improved Mobile UX**: Menu now covers entire screen on mobile with backdrop and close button for better usability
- **Request Change Feature**: Added duration dropdown (1 or 2 hours) to reschedule modal for complete lesson modification
- **Smart Duration Detection**: Reschedule modal automatically detects and pre-fills current lesson duration
- **Enhanced Booking Actions**: Conditional action buttons based on lesson timing (cancel >72hrs, request change <72hrs, leave feedback if completed)
- **Mobile-First Design**: All booking interactions optimized for mobile devices with proper spacing and touch targets
- **Professional Animations**: Smooth slide-in/out transitions for mobile menu with proper z-index layering

### 🔄 Previous Updates (v3.10) - Profile Picture Upload Fix
- **Fixed Profile Picture Upload**: Resolved RLS policy issues preventing instructor profile picture uploads
- **Simplified Storage Policies**: Updated Supabase storage policies to use authentication-only approach
- **Enhanced Upload Flow**: Streamlined profile picture upload with proper error handling
- **Production-Ready Code**: Cleaned up debugging code for production deployment
- **Verified Persistence**: Profile pictures now upload and persist correctly across sessions

### 🔄 Previous Updates (v3.9) - Instructor Profile Visual Polish
- **Clean White Background**: Pure white page background with gradient content panels for visual hierarchy
- **Enhanced Share Button**: Black text and icons on green background for better readability and contrast
- **Streamlined Rating Badge**: Reduced height black container with golden shimmer star for premium feel
- **Unified Visual Design**: Consistent styling across header, panels, and interactive elements
- **Professional Appearance**: Clean, modern design that enhances instructor credibility and trust

### 🔄 Previous Updates (v3.8) - Instructor Profile & UI Polish Complete
- **Database Integration**: Successfully added badge_type and badge_number fields to instructors table
- **Enhanced Public Profiles**: Clean, professional instructor profile display with prominent rating badges
- **Improved Search Results**: Vehicle type now sits alongside rating badges for better information hierarchy
- **Privacy-First Design**: Personal details (phone, email, badge numbers) remain private to learners
- **Mobile-Optimized Layout**: Consistent text sizes and balanced header layouts across all views
- **Professional Badge System**: Training Instructor → PDI → ADI progression with 6-8 digit validation
- **Visual Consistency**: Unified rating badge styling with golden shimmer stars across all components

### 🔄 Previous Updates (v3.7) - Instructor Profile Form Enhancement
- **Enhanced Instructor Profile Form**: Complete redesign with mobile-first layout and logical field grouping
- **Badge Type System**: Training Instructor → PDI → ADI progression with badge number validation
- **Mobile-Optimized Layout**: Side-by-side fields with smaller labels for better mobile experience
- **Form Flow Optimization**: Personal info → instructor details → bio → languages logical progression
- **Input Validation**: Badge number field with 6-8 digit numeric validation and real-time filtering
- **Professional Badge Management**: Comprehensive instructor certification tracking system

### 🔄 Previous Updates (v3.6) - Authentication & UI Polish
- **Password-Based Authentication**: Complete sign-up, login, and password reset flow
- **Enhanced Rating Badges**: Premium black badges with golden shimmer stars (5-second animation)
- **Improved Location Icons**: Larger pin icons in green-600 containers matching price styling
- **Mobile-Optimized Design**: Compact rating badges with perfect centering and spacing
- **Brand Consistency**: Location icons match price color, rating badges use sophisticated black
- **Production-Ready Auth**: Email verification, secure password requirements, and proper error handling

### 🔄 Previous Updates (v3.5) - Production Cleanup & Final Polish
- **Project Cleanup**: Removed unnecessary SQL files, test artifacts, and temporary files
- **Documentation Finalization**: Updated README and CURSOR-SESSION-PROMPT for production state
- **File Organization**: Streamlined project structure with only essential files
- **Production Deployment**: Successfully deployed to Vercel via GitHub integration
- **Final Testing**: All smoke tests and health checks passing

### 🔄 Next Development Phase (v3.6) - Complete Booking Flow
- **Instructor Profile Completion**: Finish profile setup, validation, and photo upload
- **Booking Flow Enhancement**: Complete first stage with improved UX and date/time selection
- **Stripe API Integration**: Implement complete booking flow with payment processing
- **Payment Processing**: Connect booking requests to Stripe payment intents
- **Instructor Payouts**: Add automated payout calculations and processing

### 🔄 Previous Updates (v3.4) - MVP Production Ready
- **Production-Ready Build**: All TypeScript errors resolved, successful compilation and deployment
- **Environment Validation**: Comprehensive env variable validation with Zod for production safety
- **Health Monitoring**: `/api/health` endpoint for application status monitoring
- **Smoke Testing**: Playwright E2E tests for critical user flows
- **Type Safety**: Generated Supabase database types with proper TypeScript integration
- **SBOM Generation**: Software Bill of Materials for security and compliance
- **License Compliance**: Complete license summary and deprecated package monitoring
- **Build Optimization**: Resolved syntax errors and chunk loading issues
- **Database Migration**: All Stripe Connect migrations ready for production deployment

### 🔄 Previous Updates (v3.3) - Calendar Implementation & Frontend Polish
- **Instructor Calendar Page**: Complete calendar implementation with monthly view, lesson count, progress tracking, and earnings display
- **Real Booking Integration**: Calendar displays actual lesson bookings with learner names and time slots
- **Month Navigation**: Left/right arrow controls for easy month switching with proper Monday-Sunday week layout
- **Client-Side Filtering**: Optimized data fetching with single API call and client-side date filtering to prevent flickering
- **Mobile-Optimized Calendar**: Larger calendar numbers, light grey circular buttons, and reduced spacing for better mobile experience
- **Status-Based Earnings**: Color-coded earnings display (green for confirmed, yellow for pending, red for cancelled)
- **Enhanced Navigation**: Collapsible Schedule section with Working Hours, Calendar, and Bookings submenu
- **Dynamic Sign-up Images**: Role-based car images (CarSprout.png for learners, CarPro.png for instructors)
- **Accessibility Improvements**: Larger text sizes, wider menus, and better contrast for mobile users
- **Visual Polish**: Consistent gradient buttons, improved spacing, and professional UI throughout

### 🔄 Previous Updates (v3.2) - Enhanced Frontend & UI Improvements
- **Mobile-First Navigation**: Redesigned instructor menu with collapsible Schedule section and improved accessibility
- **Dynamic Sign-up Experience**: Role-based car images that change based on learner/instructor selection
- **Enhanced Booking Management**: Status-based earnings display with intuitive color coding system
- **Improved Availability Interface**: Modern segmented toggles with gradient backgrounds and better visual feedback
- **Accessibility Enhancements**: Larger text sizes, wider menus, and improved contrast for better mobile experience
- **Booking Panel Optimization**: Compact 2-column layout for mobile with inline labels and better information hierarchy
- **Visual Polish**: Consistent spacing, better typography, and improved visual hierarchy throughout the app
- **Pricing Display Fixes**: Resolved booking price calculation issues and implemented proper status-based formatting

### 🔄 Previous Updates (v3.1) - Improved Stripe Connect Schema
- **ChatGPT-Improved Database Schema**: Implemented production-ready schema with proper lesson tracking
- **Concurrency-Safe Credit System**: Replaced counter-based credits with append-only ledger system
- **Clear Payout Logic**: Friday payout instructions generated from completed lessons
- **Enhanced Audit Trails**: Webhook event tracking and comprehensive audit logging
- **Production-Ready Functions**: Helper functions for Friday calculations, credit balances, and payout processing
- **Webhook Integration**: Fixed webhook code to use new schema tables (orders, credit_ledger)
- **TypeScript Build Fixes**: Resolved all build errors for successful deployment
- **Database Migration**: Complete migration script that works with existing LPlate tables
- **Admin Dashboard Views**: Materialized views for performance and admin reporting
- **Webhook Debugging**: Comprehensive webhook log table for troubleshooting

### 🔄 Previous Updates (v3.0) - Stripe Connect Integration
- **Complete Payment Processing**: Full Stripe Connect integration for marketplace transactions
- **Automated Instructor Payouts**: Instructors automatically paid every Friday after lesson completion
- **18% Platform Commission**: Commission added to instructor rates (not deducted from their earnings)
- **Prepaid Lesson Credits**: Learners can buy multiple hours with automatic deduction system
- **Discount & Referral Codes**: Support for promotional codes at checkout
- **Webhook Processing**: Real-time payment updates and account status changes
- **Dispute Resolution**: Comprehensive refund and dispute handling system
- **Database Schema**: Complete payment tables with audit logging and reconciliation
- **TypeScript Integration**: Fully typed Stripe API with error handling
- **Production Ready**: Webhook endpoints deployed and tested

### 🔄 Previous Updates (v2.7) - Service Radius System
- **Service Radius Filtering**: Instructors can now set their service radius (1-50 miles) in their profile
- **Smart Distance Filtering**: Search only shows instructors willing to travel to the learner's location
- **Instructor Profile Enhancement**: Added service radius input field with validation and helpful description
- **Database Schema Update**: Added `service_radius_miles` column with constraints and indexes
- **Instant Search Fix**: Resolved issue where homepage search required manual re-trigger
- **Efficient Querying**: Only instructors within their service radius are returned from database
- **Better User Experience**: Learners only see instructors who will actually come to them
- **Instructor Control**: Instructors have full control over their service area coverage

### 🔄 Previous Updates (v2.6) - Enhanced Instructor Search
- **Advanced Search Functionality**: Complete overhaul of instructor search with modern filtering system
- **Postcode Normalization**: Smart handling of UK postcodes with or without spaces (e.g., "BS1 3BD" or "BS13BD")
- **Instant Search Results**: Homepage search automatically redirects to search page with immediate results
- **Modern Filter System**: Segmented toggle controls for Vehicle Type, Gender, Duration, and Time of Day
- **Multi-Day Availability**: Support for selecting multiple days (e.g., Monday & Wednesday) with "Any Day" when all selected
- **Privacy Protection**: Masked postcodes (BS16 ***) and distance display in miles for instructor safety
- **Price-Sorted Results**: Instructors sorted by lowest price first for budget-conscious learners
- **Enhanced Instructor Cards**: Large profile pictures (96px), prominent pricing badges, and optimized information hierarchy
- **Enter Key Support**: Search bar now responds to both Enter key press and button click
- **Improved Information Flow**: Name → Location/Distance → Rating → Vehicle Type for better user experience
- **Real-Time Formatting**: Postcode input automatically formats as user types
- **Toggle Component**: New reusable segmented toggle with green branding and discrete shadows
- **Seamless UX Flow**: No double-typing required - search from homepage shows instant results

### 🔄 Previous Updates (v2.5)
- **Homepage Structure Optimization**: Reorganized sections for better user flow and conversion
- **Stats Section Placement**: Moved "We've got you covered" stats right after instructor showcase for better social proof timing
- **Social Media Integration**: Added playful social media links at bottom of homepage with Instagram, TikTok, and Twitter
- **Content Cleanup**: Removed redundant text from qualified learners section for cleaner presentation
- **Enhanced User Journey**: Improved section flow from instructors → stats → social proof → final CTA
- **Footer-Style Social Links**: Social media section now serves as effective footer element
- **Mobile-First Social Design**: Responsive social buttons with hover animations and brand colors
- **Improved Conversion Flow**: Better logical progression through homepage sections

## 🌐 Deployment Status

### ✅ Production Deployment
- **Platform**: Vercel
- **Status**: Successfully deployed with Stripe Connect integration
- **Environment**: Production with Supabase backend and Stripe Connect
- **URL**: `https://lplate-khaki.vercel.app`
- **Database**: PostgreSQL with Stripe Connect schema migrated
- **Webhooks**: Stripe Connect and Payment webhooks deployed and tested

### 🔧 Deployment Configuration
- **Build Command**: `pnpm run build`
- **Output Directory**: `.next`
- **Framework**: Next.js 15
- **Environment Variables**: Configured for Supabase and Stripe Connect
- **Database Migration**: `stripe-connect-migration.sql` ready for execution

## 🚧 Roadmap

### 🔜 Next Features

**High Priority (Must Have):**
- ✅ **Instructor Earnings Page**: COMPLETED - Dedicated earnings tracking with visual charts and payout history
- **Complete Booking Flow**: End-to-end booking process from search to payment confirmation
- **Stripe API Integration**: Full payment processing with instructor payouts and refund handling
- **Learner Dashboard**: Comprehensive dashboard with lesson history, progress tracking, and goals

**Medium Priority (Should Have):**
- **Settings Page**: User settings for profile management, notifications, and account controls
- **Hide Calendar Feature**: Temporarily disable calendar while preserving code for future use
- **Email Notifications**: Booking confirmations, reminders, and updates
- **Reviews & Ratings**: Instructor feedback and rating system

**Low Priority (Could Have):**
- **Advanced Scheduling**: Recurring lesson bookings and bulk scheduling
- **Mobile App**: React Native version for iOS and Android
- **Advanced Analytics**: Payment insights, booking patterns, and business intelligence
- **Multi-currency Support**: International expansion and currency handling

### 🛠 Technical Improvements
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Image optimization and lazy loading
- **Testing**: Unit and integration test coverage
- **Analytics**: User behavior tracking and insights
- **Accessibility**: WCAG compliance and screen reader support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@lplate.com or create an issue in this repository.

---

**Built with ❤️ for UK learner drivers and instructors**
