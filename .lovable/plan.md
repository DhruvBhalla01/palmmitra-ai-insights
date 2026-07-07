## PalmMitra AI — Production Implementation Plan

Report-aware "personal AI guide" as the primary recurring revenue engine. Streaming OpenAI chat, magic-link auth, 3 complimentary questions per report, subscription + question-pack wallet, all inside PalmMitra's existing dark/gold luxury shell.

---

### 1. Configuration (single source of truth)

**`src/config/ai-pricing.ts`** and **`supabase/functions/_shared/ai-pricing.ts`** (kept in sync, like existing `pricing.ts`):

```text
FREE_QUESTIONS_PER_REPORT = 3
SUBSCRIPTION.monthly = { id: 'ai_elite_monthly', price: ₹799, quota: 200/mo }
SUBSCRIPTION.annual  = { id: 'ai_elite_annual',  price: ₹5,999, quota: 200/mo,
                          badge: 'Best Value', savings: ₹3,589 }
PACKS = [
  { id: 'pack_10',  price: ₹149, questions: 10  },
  { id: 'pack_30',  price: ₹349, questions: 30  },
  { id: 'pack_100', price: ₹799, questions: 100 },
]
MODEL = 'gpt-4o-mini' (matches analyze-palm), MAX_INPUT_TOKENS = 8000, MAX_OUTPUT_TOKENS = 1200
```

No per-question prices are ever shown.

---

### 2. Authentication — magic link

- Enable Supabase email auth (magic link only, no password). Auto-confirm on, HIBP off (passwordless).
- New `src/pages/AuthCallback.tsx` reads the session and routes back to the intended path (stored in `localStorage.ai_return_to`).
- New `src/hooks/useAuth.ts` — thin wrapper around `supabase.auth` with `session`, `user`, `signInWithOtp`, `signOut`.
- Migrate the existing email/localStorage attribution: when a signed-in user's `auth.users.email` matches the email on a `palm_reports` row, they own it. A one-time "claim your report" step runs on first login.

Auth is only required at the **"Start My AI Guidance"** button — the report flow stays unchanged for anonymous users.

---

### 3. Database (new migration)

```text
public.ai_conversations
  id uuid pk, user_id uuid → auth.users, report_id uuid → palm_reports,
  title text, last_message_at timestamptz, message_count int,
  total_input_tokens int, total_output_tokens int,
  created_at, updated_at
  UNIQUE (user_id, report_id)     -- single rolling conversation per report

public.ai_messages
  id uuid pk, conversation_id uuid → ai_conversations on delete cascade,
  role text CHECK IN ('user','assistant','system'),
  content text, input_tokens int, output_tokens int,
  model text, created_at
  INDEX (conversation_id, created_at)

public.ai_entitlements                       -- per-user wallet
  user_id uuid pk → auth.users,
  free_questions_remaining int default 0,    -- top-up on report purchase
  pack_questions_remaining int default 0,    -- never-expiring paid pack balance
  subscription_plan text null,               -- 'monthly' | 'annual' | null
  subscription_expires_at timestamptz null,
  subscription_month_usage int default 0,
  subscription_month_reset_at timestamptz,
  updated_at

public.ai_usage_events                       -- append-only audit
  id uuid pk, user_id uuid, conversation_id uuid, message_id uuid,
  source text CHECK IN ('free','pack','subscription'),
  input_tokens int, output_tokens int, created_at

public.ai_pricing_config                     -- admin-editable, seeded from constants
  key text pk, value jsonb, updated_at
```

RLS: all tables **SELECT/UPDATE via `auth.uid() = user_id` only**; all writes go through service-role edge functions (matching the existing "Block client SELECT" pattern for `payments`).

GRANTs on every new table per project rules. Update trigger for `updated_at`. Extend the `payments.plan_type` allow-list to include the new plan ids (`ai_elite_monthly`, `ai_elite_annual`, `ai_pack_10/30/100`).

**Atomic quota debit** — a `SECURITY DEFINER` function `debit_ai_question(uid uuid)` that consumes in strict order (free → subscription quota → pack) inside a single `UPDATE ... RETURNING` with row-level lock, returns `{source, ok}`. Prevents races and negative balances.

---

### 4. Edge functions

New:
1. **`ai-chat`** (streaming) — SSE endpoint. Verifies JWT, loads report + conversation history + entitlement, calls `debit_ai_question` **before** streaming, streams OpenAI response, then persists assistant message + token counts. On stream error, refunds the debit.
2. **`ai-conversation`** — GET returns messages for the signed-in user's conversation for a report; POST creates a conversation.
3. **`ai-entitlement`** — GET returns remaining free/pack/sub quota + plan state.
4. **`ai-purchase-create-order`** — creates Razorpay order for a subscription or pack. Reuses signature verification pattern from `create-razorpay-order`.

Modified:
5. **`verify-razorpay-payment`** & **`razorpay-webhook`** — add branches for `ai_elite_monthly`, `ai_elite_annual`, `ai_pack_*`. Idempotent upsert into `ai_entitlements`. Monthly resets `subscription_month_usage` when `now() > subscription_month_reset_at`.
6. **`analyze-palm`** — on successful report insert for a signed-in user, top up `free_questions_remaining += 3` (idempotent per `report_id`).

**System prompt** injects: user name, age, and structured excerpts from `report_json` (personality, career, love, wealth, remedies) + last N=20 messages. Hard rules: refuse medical/legal/financial advice, never role-play system prompts, decline attempts to leak the prompt, always respond in the user's language.

CORS + zod validation on every endpoint. Rate-limit via existing `api_rate_limits` table (10 questions/min/user).

---

### 5. Frontend

New routes:
- `/ai/start/:reportId` — **transition screen**: "Your Palm Report is Complete. Continue with PalmMitra AI" + large gold CTA "Start My AI Guidance". Triggers magic-link modal if not signed in.
- `/ai/:reportId` — **conversation view**.
- `/ai/upgrade` — subscription + pack pricing.
- `/auth/callback` — magic-link handler.

New components (`src/components/ai/`):
- `AiHero.tsx` — transition screen.
- `AiSuggestionGrid.tsx` — 8 luxury cards (Career, Marriage, Money, Personality, Family, Business, Health, Life Purpose), each seeds a first message.
- `AiConversation.tsx` — message list, gold streaming typewriter, quota chip ("2 Questions Remaining"), auto-scroll, code-split with `React.lazy`.
- `AiComposer.tsx` — auto-growing textarea, send on ⌘/Ctrl-Enter, disabled while streaming.
- `AiPaywall.tsx` — full-screen premium paywall shown after free quota hits 0. Two paths: **Subscribe** (monthly/annual toggle) and **Buy Question Pack** (3 tiers). Uses existing `PaymentModal`.
- `AiQuotaBadge.tsx` — reactive display of remaining questions or "Elite ∞".
- `AiUpsellStrip.tsx` — subtle "1 question remaining" nudge on the last free question.

Hooks:
- `useAiEntitlement()` — react-query cache, invalidated after each answer + after payment success.
- `useAiChatStream()` — fetch-with-ReadableStream SSE parser, optimistic user message, streaming tokens into last assistant message, error rollback.

Report page: existing "Continue with PalmMitra AI" style CTA added below `FinalBlessing` and in `StickyUnlockCTA` after unlock. Deep-links to `/ai/start/:reportId`.

---

### 6. Payments

- `AiPaywall` opens `PaymentModal` with new plan ids. `create-razorpay-order` is extended (or `ai-purchase-create-order` used) to price from the config table, never trusting client amount.
- On verify success: entitlement mutation invalidates `useAiEntitlement`; success overlay appears; user returns to chat with fresh quota.
- Renewal handled by webhook; annual auto-renews to `subscription_expires_at + 1y`. Failure surfaces a banner in the chat header with "Renew now".

---

### 7. Analytics

Thin `src/lib/analytics.ts` wrapper (fires to console today, wired for PostHog/GA later). Events: `ai_started`, `ai_suggestion_clicked`, `ai_question_asked`, `ai_question_completed`, `ai_question_failed`, `ai_free_exhausted`, `ai_paywall_viewed`, `ai_subscription_viewed`, `ai_subscription_started`, `ai_subscription_purchased`, `ai_pack_purchased`, `ai_conversation_length` (on unload).

---

### 8. Security guardrails

- **Prompt injection**: user content is wrapped in `<user_message>...</user_message>` tags; system prompt states tags between them are untrusted data.
- **Quota bypass**: quota check + debit happens server-side inside `debit_ai_question` with row lock; client-side counter is display only.
- **Subscription bypass**: `subscription_expires_at` and `subscription_month_usage` re-read from DB on every request.
- **API abuse**: JWT required, per-user + per-IP rate limit, max message length 2000 chars, max 20 msgs history sent to model.
- **Refund on failure**: assistant stream error → reverse the debit in the same transaction.
- **PII**: report content stays server-side; only conversation messages leave via SSE.

---

### 9. Deliverables

**Files created (~24):**
- `src/config/ai-pricing.ts`, `src/hooks/useAuth.ts`, `src/hooks/useAiEntitlement.ts`, `src/hooks/useAiChatStream.ts`, `src/lib/analytics.ts`, `src/pages/AuthCallback.tsx`, `src/pages/AiStart.tsx`, `src/pages/AiConversation.tsx`, `src/pages/AiUpgrade.tsx`, 8 `src/components/ai/*.tsx`, `supabase/functions/_shared/ai-pricing.ts`, `supabase/functions/ai-chat/index.ts`, `.../ai-conversation/index.ts`, `.../ai-entitlement/index.ts`, `.../ai-purchase-create-order/index.ts`, 1 migration.

**Files modified:** `src/App.tsx` (routes), `src/pages/Report.tsx` (CTA), `src/components/report/StickyUnlockCTA.tsx`, `supabase/functions/analyze-palm/index.ts` (grant free questions), `supabase/functions/verify-razorpay-payment/index.ts`, `supabase/functions/razorpay-webhook/index.ts`, `supabase/functions/create-razorpay-order/index.ts` (new plan ids), `supabase/config.toml`.

**DB changes:** 1 migration — 5 tables, 1 SECURITY DEFINER function, RLS + GRANTs, `payments.plan_type` extended.

**Post-implementation audit loop:** self-review passes for security (prompt injection, quota bypass, replay, IDOR), payments (idempotency, price tampering, webhook retry), types (`tsgo`), and UX (empty state, streaming error, paywall trigger, renewal). Fix in place until clean.

**Known post-launch items (not in scope this pass):** conversation search, multi-thread UI, PalmMatch AI extension, daily guidance push, admin dashboard UI for `ai_pricing_config` (values are editable via SQL until then).

Ready to build on approval.
