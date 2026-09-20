# PalmMitra International Pricing and Payments

## Goal
Extend the existing PalmMitra and Razorpay flow into genuine end-to-end pricing for INR, USD, GBP, AED, CAD, AUD, and SGD. The backend will remain authoritative for plan, amount, currency, payment status, and unlocks while preserving the current India flow.

## Confirmed baseline
- The frontend currently detects only INR or USD through a stored override, browser timezone, and locale.
- Core product pricing exists in one frontend configuration, but several screens still contain literal prices and currency symbols.
- Razorpay Checkout already consumes the amount and currency returned by the order function, which is the correct integration pattern.
- The order function currently maintains a separate INR-only price map and creates INR orders.
- Payment verification and webhook analytics currently contain INR assumptions.
- `analyze-palm` currently accepts no language or country context.
- Razorpay documents support for all seven requested ISO currencies, but non-INR collection requires account-level international payments enablement. You confirmed this account is enabled. Indian-account settlement remains in INR.

## Implementation

### 1. Shared country, currency, and pricing rules
- Expand the existing pricing configuration to all seven currencies using exactly the approved smallest-unit values for `report99`, `palmmatch149`, `monthly299`, and `unlimited999`.
- Add one shared backend pricing module with the same plan/currency matrix, country-to-currency map, supported-code guards, and display metadata.
- Add automated parity tests so frontend and backend pricing cannot silently drift.
- Do not invent international prices for separate AI question packs/subscriptions; keep those existing products unchanged unless approved prices are supplied later.

### 2. Country detection and currency selection
- Replace locale-only detection with a layered resolver: session-selected currency, reliable country signal already available to the browser, browser timezone/region fallback, then USD.
- Normalize only valid uppercase ISO country codes; map unsupported or missing countries to USD.
- Persist the explicit choice for the current browser session and update all prices immediately without reloading.
- Add a compact, premium currency selector using unambiguous labels such as `CA$ CAD`, `A$ AUD`, and `S$ SGD`.
- Carry the selected country code into report analysis and order creation without using it for identity, authorization, profiling, or eligibility.

### 3. Frontend pricing consistency
- Replace hardcoded core-product prices and symbols across the homepage, pricing cards, upload/report paywalls, PalmMatch, monthly/lifetime offers, checkout summaries, upsells, mobile CTAs, promotional copy, and relevant generated/share content.
- Use locale-aware formatters while preserving exact business prices and the existing discount/list-price presentation where an approved localized list price exists.
- Update both report and PalmMatch checkout hooks to send `country_code`, then use only the server-returned `amount` and `currency` for Razorpay Checkout and payment analytics.
- Keep the existing premium visual system and responsive layouts; this is a data and interaction extension, not a redesign.

### 4. Report language and location context
- Add English/Hinglish selection to the existing upload flow and send sanitized `language`, `countryCode`, and `countryName` values.
- Extend `analyze-palm` validation without weakening current image, identity, rate-limit, CORS, or safety checks.
- Add explicit prompt instructions for clear English or Roman-script Hinglish, cautious interpretation of unclear features, unchanged JSON keys/schema, valid JSON-only output, current-year dates, and all requested safety prohibitions.
- Use country name only for neutral cultural examples, spelling, dates, and practical context; never infer personal attributes or expose technical geolocation.
- Store and return only sanitized language/location values, without logging image URLs, emails, report JSON, IP addresses, or secrets.

### 5. Database migrations
- Add `payments.currency` with default `INR` and an allowed-currency constraint covering all seven currencies so historical records remain compatible.
- Add or normalize `palm_reports.language`, `country_code`, and `country_name`, with defaults and safe constraints for language, uppercase two-letter codes, and the 80-character name limit.
- Use additive migrations only; preserve every existing payment/report column and all unrelated data and policies.
- Apply the migrations through Lovable Cloud and record the exact generated migration names.

### 6. Server-authoritative Razorpay orders
- Validate the submitted plan and country code, derive currency from the server-owned country map, and derive amount from the server-owned price matrix.
- Ignore any client-supplied amount or currency fields.
- Create the Razorpay order with the derived amount/currency, save those exact values to `payments`, and return them to Checkout.
- Retain existing validation for email, report identifiers, plans, credentials, database errors, analytics context, CORS, and current India behavior.
- Gate non-INR orders through an explicit backend allowlist for the six account-enabled international currencies, with clear errors rather than silent INR fallback.

### 7. Verification, webhook, and unlock integrity
- During callback verification, load the stored payment first and use its order ID, amount, and `currency || "INR"` as truth.
- Retrieve the Razorpay payment/order entities server-side and compare provider order linkage, amount, currency, and captured/authorized status before marking success or unlocking.
- Preserve HMAC verification, idempotency, replay protection, duplicate callback handling, report unlock, PalmMatch unlock, subscriptions, and failure handling.
- Apply equivalent stored-record and provider-payload consistency checks in the signed webhook before state transitions.
- Emit dynamic amount/currency/plan/country-safe analytics from stored data; never trust browser currency during verification and never log signatures or sensitive payment data.

### 8. Deployment and validation
- Deploy `analyze-palm`, `create-razorpay-order`, `verify-razorpay-payment`, and `razorpay-webhook` after migrations and focused tests pass.
- Test pricing/detection/selector behavior on mobile and desktop for IN, US, GB, AE, CA, AU, SG, unsupported, missing, and manually selected cases.
- Test English, Hinglish, missing/invalid language, missing/invalid country, schema completeness, and safe prompt behavior.
- Probe order creation for all seven currencies against the configured Razorpay environment and record actual API acceptance; do not claim successful collection without a completed provider transaction.
- Test invalid plan, manipulated amount/currency, order mismatch, amount mismatch, currency mismatch, failed verification, duplicate callback, duplicate webhook, and analytics failure isolation.
- Regression-test existing INR report, PalmMatch, subscription, verification, webhook, and unlock paths, plus readability of historical reports/payments.

## Delivery report
Provide the exact files/components changed, migration names, deployed function versions, country mapping, complete approved price matrix, currency selector/detection behavior, verification and security controls, analytics changes, test evidence by country, Razorpay API results, any account/dashboard action still required, and clearly identified limitations.
