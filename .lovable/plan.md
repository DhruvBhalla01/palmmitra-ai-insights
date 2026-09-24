# Fix Razorpay order description, plan and details

## What you see today in the Razorpay dashboard

Every order is created with only amount, currency, a generic receipt (`palm_a1b2c3...`) and cryptic notes. There is **no description at all** on the order, and the plan shows up as internal codes like `report99` / `palmmatch149` instead of readable product names. Subscription orders store the literal word `subscription` as the report id. That makes the dashboard hard to read and reconcile.

## What will change

After this fix, every order in your Razorpay dashboard shows:

- **Description:** a clear line such as `PalmMitra Insight — Full Palm Reading (₹299 INR)` so you can tell what was bought without opening the order.
- **Plan:** a readable plan name (`PalmMitra Insight`, `PalmMatch Compatibility Report`, `PalmMitra Elite — Lifetime Access`) alongside the internal code.
- **Receipt:** a per-product prefix so the list is scannable, e.g. `insight_...`, `palmmatch_...`, `elite_...`, `monthly_...`.
- **Notes:** customer email, plan name, plan code, currency, country, and the real report reference (nothing fake like the word `subscription`).
- The same cleanup applies to AI question-pack orders, which currently also have no description and a timestamp-only receipt.

## What stays exactly the same

- Prices, currencies, and the seven-country pricing matrix — untouched.
- Payment verification, webhooks, unlocks, subscriptions, idempotency and HMAC checks — untouched. The checkout popup the customer sees is unchanged too.

## Technical details

- `supabase/functions/_shared/pricing.ts`: add short plan display names (e.g. `PLAN_SHORT_NAMES`) and a helper to build the order description line.
- `supabase/functions/create-razorpay-order/index.ts`: pass `description` in the Razorpay order create payload; enrich `notes` with `plan_name` and `currency`; per-plan receipt prefixes; only include `report_id` in notes when one genuinely exists.
- `supabase/functions/ai-purchase-create-order/index.ts`: add `description` from its existing `AI_LABELS`, add `plan_name` to notes, use an `aipack_...`-style receipt prefix.
- No database changes, no frontend changes, no verification/webhook changes.
- Redeploy both functions, then place test orders (no charge) to confirm the dashboard shows the new description, plan name and receipt format.

## Verification

- Create one test order per product type (report, PalmMatch, AI pack) and confirm the Razorpay API response contains the new description and notes.
- Confirm amounts/currencies are byte-identical to today's values.
- `git diff --check` + typecheck before deploy.
