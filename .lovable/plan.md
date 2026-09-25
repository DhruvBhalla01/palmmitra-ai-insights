# Make the PalmMatch report fit phone screens

## What's wrong
On a 360px phone, the top of the report is wider than the screen, so it gets cut off on the right. The couple's names, the "Yugal Rekha · Compatibility" line, the date line and the "Dil se aligned" pill sit off-centre, and the big 83% score circle runs past the edge. The cause is one line of text that is not allowed to wrap, which stretches the whole top section to about 490px. The score circle also has a fixed size of 280px plus its glow.

## What changes
1. **Top section fits the screen.** The "Yugal Rekha · Compatibility" line wraps or shrinks on small phones, and everything re-centres inside the screen width.
2. **Score circle scales to the phone.** The circle is sized to the screen width (about 220px on small phones, the same as now on larger screens), and its glow stays inside the edges.
3. **Oversized decorations reduced on mobile.** The large background glows and the big decorative Om and quote marks shrink on phones so they don't crowd the content.
4. **Check the rest of the page.** Go through each section on the full owner report (the dimension cards, the summary, the paywall price, AI chat, the share and PDF buttons) and fix anything else that overflows or looks too large.
5. **Desktop and tablet unchanged.** Colours, content, prices and counts stay the same.

## Technical details
- `PalmMatchReport.tsx` top section: allow the tagline to wrap (`whitespace-normal sm:whitespace-nowrap`, smaller tracking on mobile). Give the container `w-full max-w-xl px-4 min-w-0`. Add `overflow-x-hidden` to the page wrapper.
- `CompatibilityScoreRing`: make it responsive with a size of `min(size, 100vw - 64px)` via a resize-aware width, or a CSS `max-w-full aspect-square` wrapper with a viewBox-scaled SVG. Clamp the glow sizes the same way.
- Decorative Om (352px/224px) and quote mark (128px): use smaller mobile font sizes (for example `text-[160px] sm:text-[352px]`). Background glows: `w-[300px] sm:w-[520px]`.
- Check with Playwright at 360, 390 and 430px: `scrollWidth` should equal the viewport and no element should extend past the right edge. Screenshot every section and fix any remaining problems. Then run the typecheck and tests.
