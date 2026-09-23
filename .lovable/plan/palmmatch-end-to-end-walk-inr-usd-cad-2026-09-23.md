# PalmMatch end-to-end walk: INR, USD, CAD

Goal: run the full PalmMatch journey once per currency and report exactly which step fails, with evidence. No code changes during the walk; fixes come after, as a separate step you approve.

## Steps checked for each currency (India / US / Canada)

1. Currency detection: the page shows the correct price (₹999 / $24.99 / CA$34).
2. Upload: both palm photos upload and pass the palm check.
3. Analysis: the compatibility reading is generated and the report page opens.
4. Report: the free sections show, and the locked sections show the correct unlock price.
5. Unlock order: tapping Unlock creates a payment order for the correct amount and currency.
6. Checkout: the payment window opens with that amount and currency.
7. Verification and unlock: a completed payment is checked and the report unlocks.

## How

- Force each country through the currency selector and the country-detection check.
- Drive the flow in a mobile-sized test browser with real sample palm photos, taking screenshots at each step.
- Read the backend logs for upload, analysis, order creation and payment verification.
- Check stored records (report, payment currency and amount) after each run.
- Step 7 needs a real payment because live keys are active. Without one, I will confirm everything up to the open payment window and check the verification logic against past successful payments. You can make one small live payment if you want full proof.

## What you get

A short table: currency x step, pass/fail, and for any failure the exact cause and proposed fix.

## Technical details

- Order creation: server-side pricing matrix (palmmatch149: INR 99900, USD 2499, CAD 3400); confirm Razorpay account accepts USD/CAD (international payments capability), a likely failure point.
- Functions inspected: analyze-palmmatch, create-razorpay-order, verify-razorpay-payment, webhook, detect-country.
- Records: payments.currency/amount/status, palmmatch_report_id linkage.
