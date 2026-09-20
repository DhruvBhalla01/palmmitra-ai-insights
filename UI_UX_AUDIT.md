# PalmMitra UI/UX and Performance Audit

**Audit date:** 20 September 2026  
**Scope:** All route pages, shared navigation/footer, homepage sections, upload/report flows, responsive behavior, accessibility, and production bundle behavior.

## Executive summary

PalmMitra already has a distinctive premium visual language: deep indigo, warm gold, serif display typography, glass cards, and an intentional spiritual motif. The strongest opportunity is not adding more decoration; it is making the existing system feel calmer, more reliable, and faster on mobile.

The main UX risks were blank lazy-route loading states, too much continuous decorative animation, a report scroll handler that forced layout measurements on every scroll event, and base64 image previews that increase mobile memory use. The audit also found several accessibility gaps around live status, icon-only controls, and the mobile navigation breakpoint.

## Scorecard

| Area | Score | Finding |
|---|---:|---|
| Visual design system | 8/10 | Cohesive premium palette and typography; decoration should be more restrained |
| Information hierarchy | 7/10 | Strong CTAs, but some pages compete with too much supporting copy and animation |
| Mobile UX | 6/10 | Good thumb-sized controls; fixed CTA and dense navigation need more breathing room |
| Accessibility | 6/10 | Good semantic headings and many labels; async status and upload controls need stronger announcements |
| Performance | 6/10 | Route splitting exists, but visual effects and scroll work add avoidable main-thread cost |
| Resilience | 5/10 | Route fallback previously appeared blank during slow lazy imports |

## Findings by priority

### P0 — Reliability and conversion

1. **Blank lazy-route fallback**
   - [src/App.tsx](./src/App.tsx) previously rendered an empty `aria-hidden` element while route chunks loaded.
   - Slow mobile users had no feedback that navigation was working.
   - **Fixed:** branded loading skeleton with visible progress context and an accessible live region.

2. **Homepage did not use route-level SEO component**
   - The homepage relied only on static head defaults while other pages used `SEO`.
   - **Fixed:** homepage now emits its own title, description, canonical, and social metadata through [src/pages/Index.tsx](./src/pages/Index.tsx).

### P1 — Performance and interaction quality

3. **Report scroll tracking forced layout**
   - [src/pages/Report.tsx](./src/pages/Report.tsx) called `getBoundingClientRect()` for every report section on every scroll event.
   - **Fixed:** `IntersectionObserver` now updates the active section and preserves one-shot analytics without scroll-layout thrashing.

4. **Decorative effects were always expensive**
   - [src/components/PremiumBackground.tsx](./src/components/PremiumBackground.tsx) created many animated particles, a rotating SVG, layered gradients, and a noise overlay.
   - **Fixed:** fewer particles, fewer particles on small viewports, zero particles with reduced motion, decorative background hidden from assistive technology, and motion-safe mandala animation.
   - **Fixed:** global reduced-motion rules now disable continuous animations and smooth scrolling.

5. **Navigation was dense at tablet/small laptop widths**
   - Seven links, currency, theme, and a long CTA competed at the `lg` breakpoint.
   - **Fixed:** full desktop navigation now begins at `xl`; the compact menu remains available through tablet and small-laptop widths.

6. **Upload previews retained base64 strings**
   - `FileReader.readAsDataURL()` duplicated large phone photos in JavaScript memory.
   - **Fixed:** previews use revocable object URLs, reducing heap pressure for large images.

### P2 — Accessibility and polish

7. **Icon-only image removal control lacked a name**
   - **Fixed:** added `aria-label="Remove selected palm photo"` and hid the decorative icon from the accessibility tree.

8. **Upload drop zone lacked semantic context**
   - **Fixed:** added a labelled `region` around the drag/drop upload surface.

9. **Mobile fixed CTA safety**
   - The CTA uses safe-area-aware styling, but visual QA should still be run on iOS Safari with browser zoom and virtual keyboards.

10. **Large page components**
    - Upload, Report, PalmMatch, and PalmMatchReport are large orchestration components.
    - Future work should extract stable presentation sections and memoize expensive report blocks. This is a maintainability/performance follow-up, not a safe one-pass mechanical refactor.

## Page-by-page review

| Surface | Strengths | Recommended next improvement |
|---|---|---|
| Home | Strong hero hierarchy, clear primary CTA, responsive image sources | Keep one focal animation, reserve skeleton heights for lazy sections, reduce repeated microcopy |
| Upload | Clear three-step intent and trust chips | Add `aria-live` progress/error summary and keyboard-triggerable drop-zone behavior |
| PalmMatch | Strong differentiated visual treatment | Test narrow widths for score/dimension rows and reduce decorative particle density |
| Report | Rich content and section navigation | Split below-fold sections, memoize stable sections, preserve focus after payment transitions |
| Help | Useful long-form support content | Add visible “still need help?” CTA and ensure accordion state is keyboard-verified |
| About/Contact | Trust-building copy and clear headings | Add stronger compact contact CTA and consistent section max-widths |
| Privacy/Terms | Complete legal content | Improve reading rhythm with a sticky local table of contents on desktop |
| Auth/404 | Correct functional intent | Keep lightweight, no animation dependency, and provide a direct recovery action |

## Validation performed

- `npm run build` passes after the changes.
- `git diff --check` passes.
- JSON/SEO changes remain valid.
- The generated `dist/` output was restored after build validation and is not part of the source changes.

## Recommended next phase

1. Add an error boundary around lazy route imports with a retry action.
2. Add a shared `StatusMessage`/live-region component for upload, AI processing, payment, and report loading.
3. Add visual regression coverage at 320, 375, 414, 768, 1024, and 1280px in light/dark themes.
4. Move Google Fonts out of CSS `@import` into document-level preconnect/preload or self-hosted subsets.
5. Split large report sections into memoized feature modules and keep PDF dependencies behind explicit user actions.

## Next phase completed in this branch

- Added a branded route error boundary with a retry action.
- Added an accessible live status summary to the palm upload flow.
- Replaced CSS font `@import` with document-level preconnect, preload, and stylesheet links.
- Added a compatibility fallback for object URL previews in test and older browser environments.
- Deferred the homepage sample-report modal until the user opens it, reducing the initial JavaScript entry chunk from approximately 610 kB to 599 kB uncompressed.
- Kept PDF generation dependencies behind the existing explicit download action so `jspdf` and `html2canvas` remain out of the initial route graph.

### Performance validation

- `npm run build` passes after the code-split change.
- Full Vitest suite passes: 6 test files and 13 tests.
- The homepage entry chunk decreased from `609.69 kB` to `599.19 kB` uncompressed.
- The sample modal now ships as its own `SampleReportModal` chunk and is fetched only after the user selects “View Sample Report”.
- Supabase and PostHog startup imports are deferred until the analytics provider and currency detector initialize, reducing the homepage entry chunk to `286.90 kB` uncompressed.
- The deferred PostHog client is emitted as a separate `posthog` chunk and the Supabase client as a small route/runtime chunk instead of being part of the initial homepage entry.
- Responsive browser QA covered `/`, `/upload`, `/palmmatch`, `/about`, and `/help` at 320, 414, 768, and 1280px widths.
- Found and fixed horizontal document overflow at 320px and 1280px by applying the existing overflow protection to the root `html` element as well as `body`.
- Recheck confirmed zero horizontal overflow at all tested widths and routes.
- The sample report modal now uses `role="dialog"`, `aria-modal`, and an explicit title relationship for assistive technology.
- Modal interaction now focuses the close control on open, closes with Escape, and restores focus to the launch button after dismissal.
- Browser validation confirmed the modal opens and closes correctly with keyboard interaction.
- Homepage primary CTA now communicates the free outcome directly: “Get My Free Palm Reading”, with adjacent no-sign-up, no-card, and free-preview reassurance.
- Upload flow now includes a compact three-point photo quality guide and a benefit-led submit CTA: “See My Free Destiny Preview”.
- Report and checkout messaging now emphasizes complete personalized analysis, PDF delivery, lifetime access, and a one-time purchase.
