
# Premium Paywall Redesign — Report Unlock

## 1. Pricing update (₹149 launch price)

Update the single source of truth so every surface (paywall, sticky bar, modal, PDF, edge functions, schema.org) reflects ₹149 automatically.

- `src/config/pricing.ts` → `PRODUCTS.insight.prices.INR` = `{ minor: 14900, major: 149, display: '₹149' }`. USD stays $9.99 (or adjust if you want — flag if so).
- `supabase/functions/create-razorpay-order/index.ts` → `PLAN_AMOUNTS.report99` = `14900`.
- Sweep and replace any remaining hardcoded `₹299` strings (StickyUnlockCTA, PaymentModal copy, meta tags in `index.html`, FAQ, Help).
- Keep the internal `planId: 'report99'` unchanged (DB CHECK constraints depend on it — no migration needed).

## 2. New `PremiumPaywall.tsx` — structure

Complete rewrite of the card. Layout (top → bottom):

```text
┌───────────────────────────────────────────────────────┐
│  ✦ Live pulse: "247 readings unlocked in last 24h"   │
│                                                       │
│         Your Personalized Palm Analysis               │
│                  is Ready ✦                           │
│      A 12-page destiny report crafted for {name}      │
│                                                       │
│  ┌─────────────────┐   ┌───────────────────────────┐ │
│  │ BLURRED REPORT  │   │  What's inside (5 items)  │ │
│  │ PREVIEW STACK   │   │  ✓ Complete Life Analysis │ │
│  │ (3 teaser cards │   │  ✓ Career & Wealth        │ │
│  │  behind blur +  │   │  ✓ Love & Relationships   │ │
│  │  gold lock)     │   │  ✓ Health & Personality   │ │
│  │                 │   │  ✓ Lucky Years & Events   │ │
│  └─────────────────┘   └───────────────────────────┘ │
│                                                       │
│  ╔═══════════════════════════════════════════════╗   │
│  ║  ✦ UNLOCK FULL REPORT — ₹149  →              ║   │  ← dominant gold CTA
│  ║  ~~₹299~~ · Launch price · One-time payment  ║   │
│  ╚═══════════════════════════════════════════════╝   │
│                                                       │
│  🛡 Razorpay · ⚡ Instant · 🔒 Private · ↺ Refund   │
│  UPI · Cards · Wallets · Net Banking                  │
└───────────────────────────────────────────────────────┘
```

### Visual language
- Glass card: `bg-gradient-to-b from-background/60 to-background/40`, `backdrop-blur-2xl`, `border-2 border-accent/40`, layered gold outer glow + inner shimmer sweep.
- Animated aurora gradient blob behind the CTA (Motion `animate` loop, respects `prefers-reduced-motion`).
- Typography: existing serif for headline (`font-serif`, `text-3xl md:text-4xl`), gradient-gold on "Ready". Tight tracking, generous line-height.
- Two-column layout on `md+`, stacked on mobile with the CTA pinned as the last element.

### Teaser preview stack (left column)
Three miniature "report cards" rendered from the user's actual report data but heavily blurred (`blur-md select-none`) with a gold `Lock` badge and a small unblurred header per card:
1. **Marriage Timing Window** — shows real headline, blurs the age range + paragraph.
2. **Career Breakthrough Year** — real category label, blurred prediction.
3. **Lucky Years 2026–2030** — teaser label, blurred timeline.

Each card has a subtle hover tilt (`whileHover={{ rotateY: 2 }}`) so they feel tactile.

### Benefits column (right)
5 rows with gold line-icon → bold label → one-line hook. Each row uses `motion.div` stagger-in on scroll.

### Primary CTA
- Full-width gold gradient button, `py-7`, `text-xl font-bold`, gold-glow shadow that pulses every 3s.
- Micro-interaction: `whileHover={{ scale: 1.02, boxShadow: 'gold-lg' }}`, `whileTap={{ scale: 0.98 }}`, arrow icon translates right on hover.
- Price row underneath: `₹299` struck-through in muted, `₹149` in gold, "Launch price" pill, "One-time payment · yours forever" microcopy.
- Secondary ghost link below: "See what Elite includes → ₹4,999" (keeps upsell path, de-emphasized).

### Trust + urgency
- Trust row: 4 icon+label pills (Razorpay secured, Instant unlock, 100% private, Refund if unhappy).
- Payment method row: monochrome UPI/Visa/Mastercard/Rupay marks.
- FOMO (subtle, not spammy): the live "247 readings unlocked in last 24h" pulse at top + a small "Launch price ends soon" line beside the price — no fake countdown timer.
- AI credibility line at the bottom: "Analyzed by PalmMitra AI · trained on 10,000+ traditional readings".

## 3. New `StickyUnlockCTA.tsx` — mobile bar refresh

Match the paywall's language so mobile feels equally premium.

- Height +12px, dual-line layout: gold price block on the left (`₹149` big, `₹299` strikethrough small), CTA button on the right (`Unlock →`).
- Thin gold gradient top border + soft glow.
- Micro social-proof line above: "✦ 23 unlocked in the last hour".
- Trust chips row (Razorpay · Instant · Private) in a single 11px line.
- Dismiss `X` moves to a smaller top-right corner so it doesn't compete with the CTA.
- Uses the same `useCurrency` + `PRODUCTS.insight` price so it stays in sync.

## 4. Files touched

- `src/config/pricing.ts` — price values.
- `src/components/report/PremiumPaywall.tsx` — full rewrite.
- `src/components/report/StickyUnlockCTA.tsx` — restructure + price wiring via `PRODUCTS.insight` + `useCurrency`.
- `supabase/functions/create-razorpay-order/index.ts` — `PLAN_AMOUNTS.report99` → 14900.
- `index.html` — update schema.org / OG price metadata.
- Sweep: `src/pages/Help.tsx`, `src/components/home/FAQSection.tsx`, `src/components/home/PricingSection.tsx`, `src/components/payment/PaymentModal.tsx`, `src/lib/generateReportPDF.ts`, `src/components/MobileCTABar.tsx` — replace any remaining hardcoded ₹299 for the Insight tier.

## 5. Guardrails

- Business logic untouched: `useReportUnlock`, Razorpay order flow, verify webhook, DB CHECK constraints, `planId` strings all unchanged.
- No new dependencies — reuse Motion, lucide, existing gold tokens (`btn-gold`, `shadow-gold`, `text-gradient-gold`, `glass-premium`).
- Fully responsive: two-column ≥`md`, single-column stack on mobile with teaser stack first, benefits collapsed into a compact checklist, CTA sticks to bottom of card.
- Respects `prefers-reduced-motion` for aurora/pulse loops.
- Accessibility: single `h2` headline, aria-labels on CTA + dismiss, blurred content marked `aria-hidden`, focus ring preserved on gold button.

## 6. Verification

- `tsgo` typecheck after edits.
- Playwright screenshot of `/report/:id` at 1280 and 390 widths to confirm layout, gold CTA dominance, and blur teaser render correctly in dark mode.
