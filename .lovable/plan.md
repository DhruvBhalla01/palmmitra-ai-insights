# PalmMitra Production Readiness Audit

Scope is large. To keep this a single, reviewable pass, I'll do it in **4 phases**. Each phase ships together so the app stays working.

## Phase 1 — Official email rebrand (fast, global)

Replace every hardcoded email with **thepalmmitra@gmail.com**.

Files touched:
- `index.html` (JSON-LD `support@palmmitra.com`)
- `src/pages/Privacy.tsx`, `src/pages/Terms.tsx`, `src/pages/Help.tsx`, `src/pages/Contact.tsx`
- `src/pages/UploadPalm.tsx` (delete-request line)
- `src/components/home/FAQSection.tsx`
- Grep sweep afterward to confirm zero occurrences of `@palmmitra.com` remain.

Add one constant `SUPPORT_EMAIL` in `src/config/brand.ts` so future changes are single-file.

## Phase 2 — Input validation layer (shared)

Create `src/lib/validation.ts` with **Zod schemas** used by every form:
- `nameSchema`: trim, collapse spaces, 2–60 chars, must contain a letter, reject `<>{}`.
- `ageSchema`: integer 13–100, no decimals, coerced from string.
- `emailSchema`: RFC via Zod `.email()`, trim + lowercase, ≤254 chars.
- `couponSchema`: `[A-Z0-9_-]{3,32}`, uppercased.
- `imageFileSchema`: MIME ∈ {jpeg, png, webp, heic}, size 50KB–10MB, dimension check via `createImageBitmap` (min 400×400).

Wire into:
- `src/pages/UploadPalm.tsx` — submit-time + on-blur validation, per-field error messages, disable submit when invalid, prevent double-submit (already partial).
- `src/pages/PalmMatch.tsx` — same rules × two people.
- `src/pages/Contact.tsx` — name/email/message, 10–2000 chars, block HTML.
- Any coupon input in payment modal.

Replace generic "Something went wrong" toasts with contextual copy (blurry image, palm not visible, network failed, payment declined, etc.).

## Phase 3 — Backend hardening

Add server-side Zod validation in every edge function that accepts user input:
- `analyze-palm`, `analyze-palmmatch`: validate name/age/email/imageUrl (must be same-origin Supabase storage URL), reject oversize payloads, keep existing GPT quality gate.
- `create-razorpay-order`: strict plan enum (already), require valid email, sanitize coupon, reject client-sent `amount` (already server-side — verify no leak).
- `verify-razorpay-payment`, `razorpay-webhook`: already signature-verified — add explicit payload shape check.
- `get-report`, `get-palmmatch-status`, `get-unlock-status`: require report_id UUID format, restrict returned locked fields to previews only.

Confirm:
- No client can set `payments.amount`, `status`, or `report_unlocks` (RLS already blocks — document).
- Report route `/report/:id` shows locked preview only until `report_unlocks` row exists; premium content fetched exclusively via authenticated edge fn.
- Storage bucket `palm-uploads`: filenames already randomized; verify `upsert:false` (yes) and consider path prefix per-email hash.

## Phase 4 — Cleanup, SEO, a11y

- Remove `console.log` from edge functions (keep `console.error`).
- Remove dead validators / unused imports found during pass.
- Ensure every public page has title + meta description + canonical + OG/Twitter (audit `Report`, `PalmMatch`, `PalmMatchReport`, `Contact`, `About`, `Help`, `Privacy`, `Terms`, `UploadPalm`, `NotFound`).
- A11y pass on forms: `<Label htmlFor>`, `aria-invalid`, `aria-describedby` on errors, focus rings preserved, buttons have accessible names.

## Deliverable

Final report at end of implementation covering: issues found, severity, files modified, validation added, security fixes, production checklist, and confirmation the old email is gone.

## What I will NOT change
- Visual design, colors, layout, or copy tone.
- Business logic in reports.
- Razorpay pricing.

Approve to proceed and I'll execute all 4 phases in one implementation pass.
