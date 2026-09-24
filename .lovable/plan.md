# Conversion upgrades inspired by palmist.io

Keep PalmMitra's dark gold premium look. Take only their ideas that cut the time from landing to first photo. Keep reading and review counts exactly as they are.

## What palmist.io does better (and what we'll adopt)

1. **Upload box right in the hero.** On their site, visitors can drop a photo on the first screen without going to another page. We'll add a compact "Drop or snap your palm" box in our hero. Picking a photo sends it straight into the upload flow with the photo already loaded, which removes one tap and one page load.
2. **Scrolling promise strip.** A slow ticker under the hero: Free preview in seconds · English & Hinglish · Private & secure · Ready 24×7 · Instant AI answers. We use only claims that are true for PalmMitra. We'll only add a "we don't keep your photo" line if you confirm it's true, because right now we do store photos.
3. **Interactive "Tap a line" explainer.** A gold line-art palm with tappable chips: Heart, Head, Life, Fate, Sun, Mounts. Tapping a chip highlights that line and shows 2 honest sentences about it, then a "Read my palm free" button. It teaches visitors and builds curiosity before the upload, which is where their page gets its engagement.
4. **Honest "What is palm reading?" section.** Short copy about Hasta Samudrika Shastra, saying clearly that it is for reflection, not prediction. This builds trust, helps with Google searches, and fits the disclaimer rule we already follow.
5. **Three-step "one photo" strip on the upload page:** Snap → AI traces your lines → Read and ask. Each step gets a clear time cue.
6. **Upfront free-question hook.** Show "Your first AI question is free" near the upload button and in the report, which makes our existing free questions more visible. This is copy only; pricing doesn't change.
7. **FAQ additions** from real questions people ask: Which hand? Can AI really read palms? Is it accurate? What are mounts? These also get FAQ markup for Google search results.

## Deliberately not copying
- Their multi-astrologer chat marketplace, per-minute calls, and Kundli/Tarot: this is a big change to what we sell, so we can plan it separately if you want it.
- Their "50,000+" number style: our locked numbers stay as they are.
- Standard emojis: we use gold line icons only.

## Order (biggest conversion impact first)
1. Upload box in the hero, with the photo carried into the upload flow
2. Promise strip + free-question hook
3. "Tap a line" explainer
4. FAQ additions + "What is palm reading" section
5. Three-step strip on the upload page
6. Mobile check with Playwright at 390px and analytics events for each new button

## Technical details
- New `HeroUploadDrop` in `HeroSection.tsx`: validates with `validateImageFile`, stores the file as a data URL in sessionStorage (`palmmitra:pending-palm`), navigates to `/upload`. `UploadPalm.tsx` hydrates the preview from it on mount and clears it.
- New `PromiseMarquee` (CSS transform animation, respects prefers-reduced-motion) placed after `TrustStrip`.
- New lazy `PalmLinesExplorer` (SVG paths, `aria-pressed` chips, keyboard accessible) placed after `HowItWorks`.
- Extend `FAQSection` data + FAQPage JSON-LD in `SEO`/`index.html`.
- Register new events in `src/lib/analytics/events.ts` (e.g. `hero_upload_selected`, `palm_line_explored`).
- Semantic tokens only; no layout redesign.
