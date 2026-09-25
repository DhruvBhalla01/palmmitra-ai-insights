# Why users aren't paying — findings and fixes

## What the data shows (last 50 readings: Sep 23 – Sep 25, 38 unique people)

- All 50 got a full report generated. No broken reports, no missing emails.
- 48 from India, 2 from the US.
- Only 1 of the 50 paid (₹299 report). 2 others opened checkout and left it pending.
- Last 14 days funnel (live site):

```text
Sessions 2,395 -> Palm reading started 505 -> Photo uploaded 279
-> Report ready 164 -> Unlock clicked 81 -> Checkout opened 74
-> Payment started 30 -> Paid 6-11
```

- Last 30 days orders: 14 paid, 41 left pending (pending = opened Razorpay and did not finish).

## Where people drop off

1. **Photo to report: 505 start, only 164 finish (67 analysis failures, 43 upload failures).** This is the biggest leak, before any price is shown. Failures don't record the reason, so we can't yet tell if it's blurry photos, "not a palm" rejections, or AI errors.
2. **Report to unlock: 164 reports, 81 click unlock.** Half never try, so the free preview may be giving enough or the locked part isn't tempting enough.
3. **Razorpay: 30 start paying, about 6-11 finish.** 9 cancelled, 7 failed. Likely UPI app hand-off failures (the earlier Paytm "invalid UPI" issue) and no retry option after cancelling.
4. **Pending orders are never followed up** — no reminder email (blocked on your sender domain setup).

No security loophole found: unlocks only happen after a verified payment on the server.

## Proposed fixes

1. Record the exact reason for every failed upload/analysis, and show it in the admin Health tab.
2. Softer failure path: when a photo is rejected, show a clear retake tip and keep the user's details so they retry in one tap.
3. After a cancelled or failed payment, show a "Try again / pay another way" prompt instead of dropping the user.
4. Add a "Your last 50 users" table to the admin page (name, email, country, stage reached, paid/pending/none) with CSV download, so this report is always live.
5. Export today's last-50 report as a spreadsheet for you.
6. Once the sender domain is set up: reminder email for pending checkouts.

## Technical details

- Add `reason`/`error_code` properties to `palm_analysis_failed`, `palm_image_upload_failed`, `checkout_payment_failed` in UploadPalm.tsx / PaymentModal.tsx.
- New `recent_users` action in admin-dashboard joining palm_reports, payments, analytics_events by email.
- Razorpay `payment.failed` / modal `ondismiss` handler shows retry dialog.
- Spreadsheet saved to Files.
