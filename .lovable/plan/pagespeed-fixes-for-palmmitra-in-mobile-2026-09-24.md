# PageSpeed fixes for palmmitra.in (mobile)

## What the report says
- **Speed score: 62/100 on mobile.** Accessibility 96, Best Practices 100, Agentic Browsing 3/4.
- Lab test: first content appears at **4.3 s** and the main picture at **6.3 s**. Layout stability is perfect (0).
- Real visitors, measured over 28 days: main picture loads in **4.2 s** for the slowest quarter of visits (Google's target is 2.5 s). Taps respond in 214 ms (target 200 ms).
- The main picture (the hero palm) waits **1.1 s** before it starts downloading, then another **1.0 s** before it shows. Pure download time is only 0.3 s, so the delay is the blocker, not the file size.

The report was taken from the live site, which doesn't have today's changes yet. It still shows the older hero, before the new photo box.

## Fixes, biggest gain first

1. **Show the page before the fonts finish loading.** Google Fonts blocks the first screen for about 0.75 s, and the site stylesheet blocks it for about 0.5 s. Load the fonts without blocking, and only the weights we actually use: Playfair 600/700, and Inter 400/500/600 instead of 300 to 700. Inline the small amount of styling the first screen needs. Expected gain: about 1.4 s off first content.
2. **Get the hero picture on screen sooner.** Preload it straight from the page's HTML at phone size, so it doesn't wait for the app code to start. Remove the fade-in animation that holds it back after it has downloaded. Serve a 160px version on phones instead of the current 480px one (saves 21 KB).
3. **Load analytics after the page is usable.** PostHog (101 KB) and Google Analytics (188 KB) are among the largest downloads on the first visit. Start both after the first tap or scroll, or after about 4 s at the latest. Events recorded before then are queued so nothing is lost. The database connection code (45 KB) will also load only when a page needs it.
4. **Connect to the backend early.** Add an early connection hint for the backend address, which Google estimates saves 300 ms.
5. **Lighter home page.** Pause the 77 always-running decorative animations when they're off screen and switch them to smooth, low-cost motion. Simplify the large faint mandala background (1,705 page elements in total). Fix the FAQ accordion code that makes the page recalculate its layout.
6. **Smaller logo:** a 40px WebP instead of the 80px PNG (saves 18 KB).
7. **Accessibility and AI browsing:**
   - Make the "New" badge text readable against the gold (contrast fix).
   - Give the two "FAQ" links, which go to different places, distinct labels.
   - Fix the double tap target where the hero button sits inside a link.
   - Add a valid `/.well-known/ai-catalog.json` and matching entries. Right now that address returns the home page, which fails the AI-discovery check.

## Expected outcome
The lab score should rise from 62 to about 85–90 on mobile, and the main picture should show in roughly half the time. Real-visitor numbers update in Google's report over about 28 days after publishing.

## Technical details
- `index.html`: font `<link rel="preload" as="style" onload="this.rel='stylesheet'">` + `<noscript>` fallback; trimmed weights; `<link rel="preload" as="image" imagesrcset=... imagesizes=... fetchpriority="high">` for the hero; `<link rel="preconnect" href="https://wattznplwrigmjrottdy.supabase.co" crossorigin>`; gtag injection moved behind a first-interaction / 4 s trigger.
- `HeroSection.tsx`: hero `<img>` as plain `img` (no motion wrapper), sizes `(max-width: 639px) 160px, ...`; generate a 160w WebP; unwrap the `<Button>` from the `<Link>` using `asChild`.
- `src/lib/posthog.ts`: replace the static import with a lazy `import('posthog-js')` wrapper that buffers `capture`/`identify` calls until loaded; update importers.
- Audit `vendor-supabase` eager imports on `/` and move them behind dynamic imports.
- `PremiumBackground`/`SectionDivider`: `content-visibility`, transform/opacity-only keyframes, `prefers-reduced-motion`, fewer SVG nodes.
- Logo asset → 40px WebP; "New" badge colors → contrasting semantic token; footer FAQ link text "Help center FAQ".
- `public/.well-known/ai-catalog.json` with valid JSON describing the site and `llms.txt`; confirm Vercel serves it (static file takes priority over the rewrite).
- Verify locally with Lighthouse (mobile) before and after; the live result requires publishing.
