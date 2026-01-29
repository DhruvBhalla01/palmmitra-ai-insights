

# PalmMitra Monetization System with Razorpay + Lovable Cloud

A complete, production-ready payment and unlock system with 3 pricing tiers, secure backend verification, and premium UX.

---

## Overview

This implementation adds a full monetization layer to PalmMitra with:

- **Tier 1: Free Preview** (always available) - Basic summary + Life Line preview + 1 Remedy
- **Tier 2: Detailed Report Unlock** (Rs 99) - Unlocks one specific report permanently
- **Tier 3: Unlimited Reports Plan** (Rs 999) - Lifetime access to all reports

The system uses Razorpay for payments with a secure two-step flow: backend order creation followed by signature verification before unlocking content.

---

## Architecture

```text
+------------------+     +--------------------+     +------------------+
|                  |     |                    |     |                  |
|  Report Page     |---->|  create-order      |---->|  Razorpay API    |
|  (React)         |     |  (Edge Function)   |     |  (Order Create)  |
|                  |<----|                    |<----|                  |
+------------------+     +--------------------+     +------------------+
        |                                                    |
        | Razorpay Checkout SDK                              |
        v                                                    |
+------------------+                                         |
|  Razorpay        |<----------------------------------------+
|  Checkout Modal  |
|                  |
+--------+---------+
         |
         | Payment Success Response
         v
+------------------+     +--------------------+     +------------------+
|                  |     |                    |     |                  |
|  Report Page     |---->|  verify-payment    |---->|  Razorpay        |
|  (React)         |     |  (Edge Function)   |     |  (Signature)     |
|                  |<----|                    |     |                  |
+------------------+     +--------+-----------+     +------------------+
                                  |
                                  | If Valid
                                  v
                         +--------------------+
                         |  Supabase DB       |
                         |  - payments        |
                         |  - report_unlocks  |
                         |  - subscriptions   |
                         +--------------------+
```

---

## Database Schema

Three new tables will be created to track payments and unlocks:

**payments** - Records all payment transactions
- `id` (uuid, primary key)
- `user_email` (text, not null) - User identifier
- `report_id` (uuid, nullable) - Links to palm_reports for single report purchases
- `plan_type` (text) - "report99" or "unlimited999"
- `razorpay_order_id` (text, not null)
- `razorpay_payment_id` (text, nullable)
- `amount` (integer) - Amount in paise
- `status` (text) - "pending", "success", "failed"
- `created_at` (timestamp)

**report_unlocks** - Tracks which reports are unlocked for which users
- `id` (uuid, primary key)
- `user_email` (text, not null)
- `report_id` (uuid, references palm_reports)
- `payment_id` (uuid, references payments)
- `unlocked_at` (timestamp)

**user_subscriptions** - Tracks unlimited plan subscribers
- `id` (uuid, primary key)
- `user_email` (text, not null, unique)
- `plan` (text) - "unlimited999"
- `payment_id` (uuid, references payments)
- `status` (text) - "active" or "cancelled"
- `started_at` (timestamp)

RLS Policies will allow public read/write since users are identified by email (no auth implemented yet).

---

## Edge Functions

Two new backend functions will be created:

**1. create-razorpay-order**

Endpoint: POST /create-razorpay-order

Input:
```json
{
  "user_email": "user@example.com",
  "report_id": "uuid" (optional for unlimited plan),
  "plan": "report99" | "unlimited999"
}
```

Logic:
1. Validate input parameters
2. Set amount based on plan (9900 paise for report99, 99900 for unlimited999)
3. Create Razorpay order using the secret key
4. Save order to payments table with "pending" status
5. Return order_id, amount, currency to frontend

Output:
```json
{
  "success": true,
  "order_id": "order_xxx",
  "amount": 9900,
  "currency": "INR",
  "payment_id": "uuid"
}
```

**2. verify-razorpay-payment**

Endpoint: POST /verify-razorpay-payment

Input:
```json
{
  "razorpay_payment_id": "pay_xxx",
  "razorpay_order_id": "order_xxx",
  "razorpay_signature": "xxx",
  "payment_id": "uuid"
}
```

Logic:
1. Retrieve payment record from database
2. Generate expected signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
3. Compare with received signature
4. If valid:
   - Update payment status to "success"
   - For report99: Create report_unlock entry
   - For unlimited999: Create user_subscription entry
5. If invalid: Update status to "failed"

Output:
```json
{
  "success": true,
  "unlocked": true,
  "subscription": true | false
}
```

---

## Frontend Components

**1. PaymentModal Component**

A new premium modal for payment selection:

- Title: "Unlock Your Complete Destiny Report"
- Two plan options displayed as radio cards:
  - Rs 99 Detailed Report (highlights single unlock)
  - Rs 999 Unlimited Plan (shows "Best Value" badge)
- Trust signals: "UPI / Cards / Wallets", "Secure Payment", "Instant Unlock"
- Primary CTA: "Pay Securely with Razorpay"
- Legal disclaimer at bottom
- Premium animations: fade-in, scale effects, gold accents

**2. LockedSection Wrapper Component**

A reusable component to wrap sections that should be locked:

```text
Props:
- isUnlocked: boolean
- sectionName: string
- children: React content
- onUnlockClick: function
```

When locked, displays:
- Blurred overlay (backdrop-blur-md)
- Lock icon centered
- "Unlock for Rs 99" button
- Teaser text visible but blurred

**3. UnlockSuccessOverlay Component**

Celebration screen after successful payment:

- Full-screen overlay with gold sparkle animation
- Mandala expanding animation
- "Your Destiny Report is Now Unlocked!" message
- Action buttons: Download PDF, Share, New Reading
- Auto-dismisses after 3 seconds or on click

**4. useReportUnlock Hook**

Custom hook to manage unlock state:

```text
const { 
  isUnlocked,
  hasSubscription,
  isLoading,
  checkUnlockStatus,
  initiatePayment
} = useReportUnlock(reportId, userEmail)
```

Logic:
1. On mount, check if user has active subscription
2. If not, check if specific report is unlocked
3. Cache result in state
4. Provide method to trigger payment flow

---

## Report Page Modifications

The Report.tsx page will be restructured with tiered content:

**Free Preview (Always Visible):**
- Report Header with palm summary
- Life Line card only (from Major Lines)
- First personality trait only
- First remedy preview only
- All other sections show LockedSection wrapper

**Premium Content (Unlocked after payment):**
- All 5 Major Lines with full details
- All Mounts analysis
- All 5 Personality Traits
- Career and Wealth section
- Love and Relationships section
- Life Phases timeline
- All Spiritual Remedies
- Download PDF button enabled
- Premium Insights revealed (marriage timing, career breakthrough, gemstone)

**Paywall Section Changes:**
- Move PremiumPaywall component higher in the page
- Show after free preview sections
- Display both Rs 99 and Rs 999 options
- Include comparison of what each tier unlocks

---

## Payment Flow Sequence

1. User views report page with free preview
2. User clicks "Unlock Full Report Rs 99" or "Get Unlimited Rs 999"
3. PaymentModal opens with plan selection
4. User confirms plan and clicks "Pay with Razorpay"
5. Frontend calls create-razorpay-order edge function
6. Edge function creates Razorpay order and returns order_id
7. Frontend opens Razorpay Checkout with order details
8. User completes payment in Razorpay modal
9. Razorpay returns payment response to frontend
10. Frontend calls verify-razorpay-payment edge function
11. Edge function verifies signature and updates database
12. If successful, UnlockSuccessOverlay displays
13. Report page refreshes to show unlocked content

---

## Files to Create

1. `supabase/functions/create-razorpay-order/index.ts` - Order creation logic
2. `supabase/functions/verify-razorpay-payment/index.ts` - Payment verification
3. `src/components/payment/PaymentModal.tsx` - Payment selection modal
4. `src/components/payment/LockedSection.tsx` - Blur wrapper for locked content
5. `src/components/payment/UnlockSuccessOverlay.tsx` - Celebration screen
6. `src/hooks/useReportUnlock.ts` - Unlock state management hook
7. `src/lib/razorpay.ts` - Razorpay SDK helper functions

## Files to Modify

1. `index.html` - Add Razorpay Checkout SDK script
2. `supabase/config.toml` - Register new edge functions
3. `src/pages/Report.tsx` - Integrate unlock logic and locked sections
4. `src/components/report/PremiumPaywall.tsx` - Update with payment modal trigger
5. `src/components/report/MajorLinesSection.tsx` - Show only Life Line when locked
6. `src/components/report/PersonalityTraits.tsx` - Show only first trait when locked
7. `src/components/report/SpiritualRemediesSection.tsx` - Show preview when locked
8. `src/components/report/ActionButtons.tsx` - Disable PDF download when locked
9. `src/components/home/PricingSection.tsx` - Update prices to Rs 99/Rs 999

---

## Required Secrets

A new Razorpay secret needs to be configured:

- **RAZORPAY_KEY_ID** - Public key (safe to expose to frontend via edge function response)
- **RAZORPAY_KEY_SECRET** - Private key (backend only, used for order creation and signature verification)

Both will be added as Supabase secrets and accessed only in edge functions.

---

## Security Considerations

1. **No direct frontend unlocks** - All unlock logic happens after backend verification
2. **Signature verification** - Uses HMAC-SHA256 to verify payment authenticity
3. **Database-backed state** - Unlock status is always checked against database
4. **RLS policies** - Restrict access to payment and unlock tables
5. **Email-based identification** - Users identified by email (simple MVP approach)

---

## Implementation Order

1. **Secrets Setup** - Add Razorpay API keys
2. **Database Migration** - Create payments, report_unlocks, user_subscriptions tables
3. **Edge Functions** - Implement create-order and verify-payment
4. **Frontend Hook** - Build useReportUnlock hook
5. **UI Components** - Create PaymentModal, LockedSection, UnlockSuccessOverlay
6. **Report Integration** - Wrap sections with LockedSection
7. **Testing** - End-to-end payment flow verification

---

## Technical Notes

- Razorpay Checkout SDK loaded via CDN in index.html
- Uses Razorpay test mode keys for development
- Amount stored in paise (Rs 99 = 9900 paise)
- User email serves as identifier (can upgrade to auth later)
- Session storage caches unlock status for better UX
- Edge functions use verify_jwt = false (public endpoints with email-based auth)

