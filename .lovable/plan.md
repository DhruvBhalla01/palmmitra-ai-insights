# PalmMatch Payment Recovery Dialog

## Goal
When a couple closes or fails the PalmMatch payment, show the same guided retry dialog already used on the single-palm report page — explaining the UPI app hand-off, offering card/netbanking, and promising the reading stays reserved for 24 hours.

## Current state (verified)
- `PaymentRecoveryDialog` exists and is wired into `Report.tsx` via a `paymentRecovery` window event dispatched by `useReportUnlock`.
- `usePalmMatchUnlock.ts` still uses the old pattern: a toast with a "Try again" action on `modal.ondismiss` (line 168) and `payment.failed` (line 184).
- `PalmMatchReport.tsx` calls `initiatePayment(plan)` directly (lines 169, 805) and has no recovery dialog.

## Changes

### 1. `src/hooks/usePalmMatchUnlock.ts`
- On Razorpay `modal.ondismiss`: dispatch `window.dispatchEvent(new CustomEvent('paymentRecovery', { detail: { reason: 'cancelled', plan } }))` instead of the retry toast (keep the analytics events).
- On `payment.failed`: dispatch the same event with `reason: 'failed'`.
- Remove the now-unused `retryRef` / `retryAction` toast-action code.

### 2. `src/pages/PalmMatchReport.tsx`
- Add state: `recoveryOpen`, `recoveryReason`, `recoveryPlan`.
- Add a `paymentRecovery` event listener (same pattern as `Report.tsx` lines 322–323) that opens the dialog and stores the plan.
- Render `<PaymentRecoveryDialog>` with:
  - `hinglish={language === 'hinglish'}`
  - `onRetry` → close dialog and call `initiatePayment(recoveryPlan)` (defaults to `'palmmatch149'`)
- Guard: ignore recovery events while `isUnlocked` is true so a success on another tab can't trigger it.

## Verification
- Typecheck (`npx tsgo --noEmit -p tsconfig.app.json`) and confirm build OK in `/tmp/observability/build-errors.log`.
- Playwright at 390px on a PalmMatch report page: confirm the page renders and the dialog component mounts without console errors (a live Razorpay dismiss can't be simulated headlessly, so the event path is verified by code review + a manual `window.dispatchEvent` smoke test in the browser console).
