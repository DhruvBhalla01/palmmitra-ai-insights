## Goal

Reposition PalmMitra AI from a standalone product with its own homepage/nav/landing pages into a **premium companion built into the Palm Report**. The report is the product; AI extends it. AI is unreachable unless the user has an unlocked report.

## 1. Remove the standalone AI surface

Delete:
- `src/pages/AiStart.tsx` (AI landing page)
- `src/pages/AiUpgrade.tsx` (standalone upgrade page)
- `src/pages/AiConversation.tsx` (full-page chat route)
- Routes `/ai/start/:reportId`, `/ai/upgrade`, `/ai/:reportId` from `src/App.tsx`
- Any nav links / footer links / CTAs pointing to `/ai/*` (audit `Navbar`, `Footer`, `MobileCTABar`, homepage sections)

The `AiSignInModal` component is no longer needed as a standalone gate (the user is already authenticated after unlocking their report via the existing flow). Keep it only if it's already reused elsewhere; otherwise delete.

## 2. New integration surface inside the report

All AI entry points live inside `src/pages/Report.tsx` and are **only rendered when `isUnlocked === true`**.

**a. Contextual inline CTAs** — a new small component `src/components/report/AskPalmMitraInline.tsx`:
```
Need more clarity about your career prediction?
💬 Ask PalmMitra AI
```
Placed at the end of each major report section (Career, Love/Marriage, Business hint inside Career, Health via Remedies section, Life Phase). Clicking opens the AI drawer (see 3) pre-seeded with a section-appropriate prompt (e.g. `"Tell me more about my career prediction and what I should do next 3 years."`).

**b. End-of-report premium section** — a new component `src/components/report/PalmMitraAiSection.tsx` rendered once after `FinalBlessing` / above `LegalDisclaimer`. Uses existing gold/glass styling. Copy per the spec ("Still have questions?…"), a single "Start PalmMitra AI" button, and "Includes 3 complimentary AI questions" microcopy. Shows remaining balance if already used.

**c. Locked state** — when `!isUnlocked`, neither the inline CTAs nor the end section render. Nothing hints AI is available before unlock.

## 3. AI drawer (in-report chat)

New component `src/components/ai/AiDrawer.tsx` built on the existing shadcn `Sheet` (right-side on desktop, bottom sheet on mobile). It mounts inside `Report.tsx`, receives `reportId`, `userName`, `entitlement`, and an optional `seedPrompt`.

Contents:
- Header: "PalmMitra AI" · report title · quota badge (`3 Questions Remaining`) · close.
- Reuses `AiMessageList`, `AiComposer`, `AiSuggestionGrid` unchanged.
- Reuses `useAiChatStream` and the existing `ai-chat` / `ai-conversation` edge functions unchanged (they already gate on report ownership/unlock).
- Reuses `useAiEntitlement`.
- Reuses `AiPaywall` for out-of-questions state.

The drawer never navigates away from the report — the user always feels inside the report.

## 4. Pre-briefed first message (never empty chat)

Change `ai-conversation` edge function so that on the first call for a report (no prior messages), it seeds one assistant message using the stored `report_json` — `user_name`, top 3–4 signals (career, marriage, wealth, personality, health highlights) — and persists it as an `ai_messages` row with `role='assistant'` and a new flag `is_seed = true` (or just detected by being the first row; no schema change strictly needed). Free-question quota is **not** debited for the seed.

Format:
```
Hello {Name}.
I've already studied your palm report.
Your strongest indicators are:
• {signal 1}
• {signal 2}
• {signal 3}
• {signal 4}
What would you like to explore further?
```

Then the client renders the existing suggestion chips (Career, Business, Marriage, Money, Health, Future, Ask Anything).

## 5. Pricing update (question packs)

Update `src/config/ai-pricing.ts` and `supabase/functions/_shared/ai-pricing.ts` to new packs:

| Pack | Questions | Price | Badge |
|---|---|---|---|
| `ai_pack_5` | 5 | ₹149 | — |
| `ai_pack_10` | 10 | ₹249 | ⭐ Most Popular |
| `ai_pack_15` | 15 | ₹349 | Best Value |

Subscription unchanged (Elite ₹799/mo, ₹5,999/yr, 200/mo).

Update `AI_PLAN_AMOUNTS_PAISE`, `AI_PACK_QUESTIONS`, `AI_LABELS`, and `AiPlanId` union. Old plan ids (`ai_pack_30`, `ai_pack_100`) are removed. Add a migration note: the DB `payments.plan_type` check constraint was extended in a prior migration; add another migration that includes the new pack ids (`ai_pack_5`, `ai_pack_15`) and removes `ai_pack_30` / `ai_pack_100` from the allowed set (safe because no live rows use them yet — will verify with a `SELECT count(*)` in the migration comment).

## 6. Paywall UX change

Update `src/components/ai/AiPaywall.tsx`:
- Default mode = `'pack'` (packs first, subscription secondary), matching "do NOT immediately push a subscription".
- Subscription section appears as a subtle secondary option ("Ask more often? PalmMitra AI Elite →") below the packs, not as the top toggle.
- After successful purchase, the drawer stays open, the same conversation continues, and the newly purchased questions are reflected via `invalidateEnt()`. No navigation, no reset — already handled by keeping the drawer mounted.

## 7. Analytics events

Adjust `src/lib/analytics.ts` event names to the new flow:
- Remove: `ai_started` from AiStart page.
- Add: `ai_drawer_opened` (with `{ reportId, source: 'section_cta' | 'end_of_report' | 'inline_career' | ... }`), `ai_seed_shown`, `ai_pack_selected`, `ai_pack_purchased` (existing), `ai_subscription_purchased` (existing).

## 8. Audit checklist (run after implementation)

- Grep for `/ai/`, `AiStart`, `AiConversation`, `AiUpgrade` → zero results outside deletions.
- AI drawer only mounts when `isUnlocked === true`.
- `ai-chat` and `ai-conversation` continue to enforce report ownership/unlock (already do — verified).
- Question counter decreases only on successful assistant response (seed doesn't debit; already refunds on empty).
- After pack purchase, conversation continues in same drawer without reload.
- Mobile: drawer opens as bottom sheet, composer accessible above keyboard.
- Pack ids in DB check constraint match `ai-pricing.ts`.

## Technical section (details)

**Files to delete:** `src/pages/AiStart.tsx`, `src/pages/AiConversation.tsx`, `src/pages/AiUpgrade.tsx`, and possibly `src/components/ai/AiSignInModal.tsx` if unused after route removal.

**Files to modify:**
- `src/App.tsx` — remove three lazy imports + three routes.
- `src/pages/Report.tsx` — mount `<AiDrawer />` (only when unlocked); insert `<AskPalmMitraInline />` at end of Career, Love, LifePhase, Remedies sections; insert `<PalmMitraAiSection />` after `FinalBlessing`.
- `src/config/ai-pricing.ts` + `supabase/functions/_shared/ai-pricing.ts` — new pack lineup.
- `supabase/functions/ai-conversation/index.ts` — synthesize + persist the seed assistant message when conversation has zero messages, using `report_json` highlights.
- `src/components/ai/AiPaywall.tsx` — packs-first layout, subtler subscription.
- `src/hooks/useAiChatStream.ts` — accept a `seedPrompt` on next `send` (optional; can also just call `send(seedPrompt)` from inline CTA).

**Files to create:**
- `src/components/report/AskPalmMitraInline.tsx`
- `src/components/report/PalmMitraAiSection.tsx`
- `src/components/ai/AiDrawer.tsx`
- One migration: update `payments_plan_type_check` to new pack ids.

**No changes needed to:** `ai-chat` streaming, entitlement RPC, Razorpay verify (already keyed by `payment.user_id` + `plan_type`), report gating.
