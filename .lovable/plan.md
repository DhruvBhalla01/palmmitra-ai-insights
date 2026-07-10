# Framer-Motion → LazyMotion + `m` Refactor

## Goal
Remove the ~60 KB gz `motion` component bundle from initial JS by switching every component to the tree-shakeable `m` primitive, loading features lazily once via `LazyMotion` at the app root.

## Approach

### 1. Create a shared motion barrel (`src/lib/motion.ts`)
Single re-export point so future files can't accidentally re-introduce `motion`:
```ts
export { m, AnimatePresence, LazyMotion, domAnimation, useReducedMotion } from 'framer-motion';
```
`domAnimation` (~15 KB gz) covers everything currently used: `animate`, `initial`, `exit`, `whileHover`, `whileTap`, `whileInView`, `variants`, `transition`, `viewport`, `useReducedMotion`. It does NOT include `layout` or `drag`.

### 2. Mount `LazyMotion` once in `src/App.tsx`
Wrap the app tree in `<LazyMotion features={domAnimation} strict>`. `strict` throws if any `motion.*` slips through — catches regressions immediately.

### 3. Codemod every file (55 total)
Two mechanical replacements per file:
- `import { motion, AnimatePresence, ... } from 'framer-motion'` → `import { m, AnimatePresence, ... } from '@/lib/motion'`
- `motion.` → `m.` (JSX tags, `motion.div`, `motion.span`, `motion.button`, `motion.section`, etc.)

Executed via `sed -i` per file, then compiled to catch stragglers. Files touched:
- Pages: `Report`, `UploadPalm`, `About`, `PalmMatch`, `PalmMatchReport`, `NotFound`
- Layout: `Navbar`, `Footer`, `MobileCTABar`, `SectionDivider`, `PremiumBackground`, `AnimatedSection`, `DestinyRevealLoader`
- Home (14): Hero, Features, HowItWorks, AboutSection, Testimonials, FAQ, Pricing, Comparison, PalmMatchTeaser, TrustStrip, EmailCapture, SampleReportTeaser, SampleReportModal, FinalCTABanner
- Report (14): Header, PremiumPaywall, StickyUnlockCTA, ActionButtons, LegalDisclaimer, LifePhase, LoveRelationships, MajorLines, Mounts, PersonalityTraits, SpiritualRemedies, CareerWealth, FinalBlessing, ProgressIndicator
- PalmMatch (9): Paywall, AnalysisOverlay, ExecutiveSummary, AiSignalsRow, CompareBar, DimensionCard, CompatibilityScoreRing, AskPalmMatchAI
- Payment (3): PaymentModal, LockedSection, UnlockSuccessOverlay
- Upload/AI (3): AnalysisOverlay, AiMessageList, AiSuggestionGrid

### 4. Handle the 3 `layout` prop sites
`domAnimation` doesn't ship layout animations. Options considered:
- Swap to `domMax` → adds ~10 KB gz back (loses half the savings)
- **Chosen:** keep `domAnimation`, remove the `layout` prop from those 3 spots (`upload/AnalysisOverlay.tsx:243`, `palmmatch/PalmMatchAnalysisOverlay.tsx:301`, `report/MountsSection.tsx:64`). These are enter/exit cards inside `AnimatePresence` — the `initial/animate/exit` transitions already handle the perceived motion; `layout` was only smoothing sibling reflow, which is visually negligible on these small cards.

### 5. Update test mock (`src/test/setup.ts`)
Change the `vi.mock("framer-motion", ...)` to also expose:
- `m` (same Proxy as `motion`)
- `LazyMotion` → passthrough Fragment
- `domAnimation` → `{}`
- `useReducedMotion` → `() => false`

And add an identical `vi.mock("@/lib/motion", ...)` so components importing from the barrel get the same stubs.

## Verification
1. `rg -n "from 'framer-motion'" src/ | grep -v "src/lib/motion.ts\|src/test/setup.ts"` → must return zero.
2. `rg -n "\bmotion\." src/` → zero JSX usages.
3. `tsgo --noEmit` clean.
4. `bunx vitest run` — all existing tests green (ActionButtons etc.).
5. `vite build` — inspect `dist/assets/`: framer chunk should shrink; no `motion`-heavy chunk preloaded in `dist/index.html`.
6. Playwright smoke on `/`, `/upload`, `/report/:id`, `/palmmatch` at 390 px: hero fade-in, navbar scroll transition, section reveals, paywall shimmer, AI drawer open/close, PalmMatch analysis overlay all render and animate identically.
7. Lighthouse mobile on `/`: confirm expected ~−60 KB gz initial JS and TBT drop.

## Rollback safety
- The `strict` flag on `LazyMotion` guarantees any missed `motion.*` throws at dev time, not silent regressions in prod.
- Barrel file means a one-line swap back to `motion` if a critical regression appears.
- No behavioral API changes — `m.*` is drop-in for `motion.*` for every prop we use.

## Out of scope
- No animation redesign, timing changes, or new features.
- No changes to `useScrollAnimation` hook (already framer-free).
- No touching of `src/integrations/supabase/*` or edge functions.
