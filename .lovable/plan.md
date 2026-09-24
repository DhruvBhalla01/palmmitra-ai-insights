# Mobile audit (390x844 phone) — fixes and improvements

I opened Home, Upload, PalmMatch, a Report, About, Help, Contact and 404 on a phone-sized screen with Playwright. I checked layout, readability, tap sizes, labels for screen readers and AI browsers, and errors.

## Fixes required (high priority)
1. **Unreadable text on dark hero sections.** On PalmMatch, the top badge and the whole "Priya & Arjun 87%" sample card show pale text on a pale frosted panel, so it is almost invisible. The same problem affects the "12,400+ readings · 4.9 stars" pill on Home. Fix: use a darker glass panel with brighter text on dark sections.
2. **Main button sits below the first screen on Home.** The illustration takes up about 40% of the phone screen, so "Get My Free Palm Reading" only appears after scrolling. Fix: shrink the illustration on phones so the heading and button show on the first screen.
3. **Upload button is far down on /upload.** The badge, big heading, step bar and "Step 1 · Capture" header push the actual "choose photo" button off the first screen. Fix: tighten the spacing and show a pinned "Take / choose photo" button on phones.
4. **9 buttons on the Report page have no name.** These are the icon-only buttons (progress dots and similar). Screen readers and AI browsing agents can't tell what they do. Fix: add clear labels.
5. **Tap targets are too small.** 12–16 items per page are under 40px, including footer social icons, footer links, the currency picker, the English/Hinglish switch and "Start your reading below". Fix: make each at least 44px tall.
6. **Images with no description.** Every page has at least one image with no alt text (logo or decoration), and Home has two. Fix: describe the useful images and hide the decorative ones from screen readers.
7. **Hidden sideways overflow on Home.** 3 elements stick out past the right edge. Fix: clip them so the page can't wobble sideways.
8. **Error warnings in the browser console.** Each page logs repeated "Function components cannot be given refs" warnings. Fix: correct the affected wrapper components.

## Suggestions to improve
- **Social proof accuracy.** Home says 12,400+ readings and 2,100 reviews, and PalmMatch says 4,200+ reports. Your real data shows about 900 readings. Use honest numbers to protect trust and ad compliance.
- **Report on phones.** Add a small bar that shows which section you're in, and one sticky unlock button instead of an unlock prompt in every locked card.
- **Shared-report invite.** Show the "Get your own reading" invite near the top of shared links, not only at the bottom.
- **AI browsing readiness.** Give the upload form and payment steps clear labels (for example "Upload palm photo" and "Unlock report for $9.99") so AI agents can complete the flow. Add a short `llms.txt` section describing the reading flow.
- **Upload copy.** Fix the missing space in "left-handed.Open palm".
- **Speed.** Load the hero illustration at phone size and defer images further down the page.

## Technical details
- Contrast: in the PalmMatch hero, sample card and Home proof pill, switch the glass class to a dark variant (for example `bg-background/10` becomes a token-based dark surface) and use `text-primary-foreground` at full opacity.
- Hero: `HeroSection.tsx` image max-h about 180px under `sm`, with reduced top padding.
- Upload: compress header spacing in `UploadPalm.tsx` and add a `sm:hidden` sticky CTA bound to the file input.
- Labels: add `aria-label` to icon buttons in `ReportProgressIndicator` and `Report.tsx`. Set `alt=""` plus `aria-hidden` on decorative images.
- Tap size: `min-h-11 min-w-11` on footer icons and links, `CurrencySelector compact`, and the language toggle.
- Overflow: `overflow-x-clip` on the Home root section wrappers.
- Refs: wrap the offending components (found from the stack) in `forwardRef`.
- Re-run the same Playwright audit afterwards and compare the counts: small targets, unnamed buttons, missing alt text and overflow should all drop to 0.
