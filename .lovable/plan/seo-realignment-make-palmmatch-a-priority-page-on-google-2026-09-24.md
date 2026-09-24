# SEO realignment: make PalmMatch a priority page on Google

## Problems found
- `sitemap.xml` does not list `/palmmatch` (or `/upload`) at all — Google is told the About/Terms pages matter, but not your two money pages.
- Home page title and description only mention single-palm reading; PalmMatch is invisible in the main search snippet.
- The structured data (the info Google reads for rich results) shows wrong PalmMatch/Elite prices: $19.99 and $99 instead of $24.99 and $149.
- PalmMatch page title targets "palm compatibility" only; it misses the phrases people actually search ("love compatibility by palm", "couple palm reading", "marriage compatibility palmistry").
- Few internal links from the home page and footer point to `/palmmatch`, so Google sees it as a minor page.

## Changes
1. **Sitemap priorities:** `/` 1.0, `/palmmatch` 0.9, `/upload` 0.9, `/help` 0.6, `/about` 0.5, `/contact` 0.4, `/privacy` and `/terms` 0.2, with last-modified dates.
2. **Home search snippet:** title and description mention both products, e.g. "PalmMitra — AI Palm Reading & PalmMatch Couple Compatibility".
3. **PalmMatch page:** sharper title/description built around love and marriage compatibility by palm; its own page-level structured data (Service + Offer with correct prices in all currencies + breadcrumb); a short "PalmMatch FAQ" block on the page (visible text Google can read).
4. **Fix wrong prices** in the site-wide structured data and FAQ answer.
5. **Internal links:** add a PalmMatch link in the footer and a "Check your couple compatibility" link card on the home page, using descriptive link text.
6. **AI tools guide (`llms.txt`):** give PalmMatch its own section.
7. Leave report/auth pages blocked from Google (private customer data).

Reading and review counts stay untouched. No design change beyond the small link card.

## Technical details
- Files: `public/sitemap.xml`, `index.html` (title, meta, og/twitter, JSON-LD @graph price fixes), `src/pages/PalmMatch.tsx` (SEO props, JSON-LD, FAQ section with one h2), `src/components/Footer.tsx`, `src/pages/Index.tsx` or `HowItWorks` (link card), `public/llms.txt`.
- Prices pulled from the existing pricing config, not hardcoded new values.
- This site renders in the browser, so Google (which runs JavaScript) sees per-page tags, but social link previews only see the home page tags.
- After publishing: submit the sitemap in Google Search Console and request indexing for `/palmmatch`.
