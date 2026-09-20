# PalmMitra Global SEO Audit

**Audit date:** 20 September 2026  
**Audited property:** `https://www.palmmitra.in`  
**Repository:** Vite + React 18 SPA deployed through Vercel rewrites  
**Overall assessment:** **6.3/10 (good foundations, material discoverability risk)**

## Executive summary

PalmMitra has unusually strong SEO foundations for a client-rendered application: the homepage has a clear title and description, the site publishes `robots.txt` and a sitemap, route-level metadata exists through `react-helmet-async`, and the homepage includes Organization, WebSite, SoftwareApplication, Service, HowTo, FAQPage, and breadcrumb JSON-LD.

The largest global issue is rendering strategy. Production requests for `/upload`, `/about`, `/help`, `/palmmatch`, and even unknown paths all return the same `index.html` head with the homepage title, homepage canonical, and homepage description. A crawler that does not execute JavaScript therefore sees duplicate homepage metadata for every route. Social crawlers and link previews have the same limitation. This is also a conversion and trust risk for shared links.

The second high-impact issue is invalid social/structured-data image references: the HTML references `/logo.png`, but the deployed asset is `/logo.webp`; requesting `/logo.png` returns the SPA HTML with status 200 rather than an image. Open Graph and JSON-LD logo consumers can therefore receive HTML or fail to render an image.

## Scorecard

| Area | Score | Assessment |
|---|---:|---|
| Crawlability and index controls | 8/10 | Robots and sitemap are present; transactional/private paths need tighter policy |
| Indexable information architecture | 6/10 | Useful public routes exist, but no editorial/content hub or route-specific server HTML |
| On-page metadata | 5/10 | Client metadata is well-written but not available in the initial response |
| Structured data | 7/10 | Broad coverage, but some schemas appear over-assertive and the image URL is broken |
| International SEO | 4/10 | `en-IN` is declared, but there are no localized URLs or `hreflang` alternates |
| Performance and rendering | 6/10 | Good lazy loading, but a large JS application is still required for content discovery |
| Media/accessibility SEO | 7/10 | Many meaningful image alts; verify all decorative images and interactive labels |
| Trust/E-E-A-T | 6/10 | Contact, privacy, terms, and help pages exist; factual claims and review markup need substantiation |

## Findings

### P0 — Fix before scaling acquisition

#### 1. Route metadata is not server-visible

**Evidence**

- [vercel.json](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/vercel.json) rewrites every request to `/index.html`.
- [src/components/SEO.tsx](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/src/components/SEO.tsx:30) updates metadata only after React runs.
- [index.html](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/index.html:31) contains only homepage canonical/title/description.
- Live checks on 20 September 2026 returned the homepage canonical and title for `/upload`, `/about`, `/help`, `/palmmatch`, `/report/abc`, and an unknown path.

**Impact:** Google can render JavaScript in some situations, but initial HTML, social crawlers, link unfurlers, many AI crawlers, and SEO tools will treat the routes as duplicate homepage documents. Route intent, snippets, and sharing previews are lost.

**Best fix:** Move public, informational routes to server-rendered or statically prerendered HTML. The preferred long-term option is a framework/runtime with SSR or SSG (for example, Next.js). A lower-risk interim option is Vite SSR/prerendering for `/`, `/about`, `/help`, `/contact`, `/upload`, and `/palmmatch`, while keeping authenticated/dynamic reports client-rendered.

**Acceptance criteria**

- `curl https://www.palmmitra.in/about` returns the About title, description, canonical, and OG tags without JavaScript.
- Each public route has a unique canonical and title.
- `/report/:id` and `/palmmatch-report/:id` are `noindex` unless there is a deliberate, public, shareable report product.
- Unknown paths return a real 404 status or a dedicated noindex 404 document, not a homepage-shaped 200 response.

#### 2. Open Graph and JSON-LD image URL is broken

**Evidence**

- [index.html](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/index.html:45) and [index.html](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/index.html:57) reference `https://www.palmmitra.in/logo.png`.
- [index.html](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/index.html:94) uses the same URL in Organization JSON-LD.
- The repository tracks [public/logo.webp](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/public/logo.webp), not `public/logo.png`.
- Live `GET /logo.png` returns `200 text/html`, while `GET /logo.webp` returns `200 image/webp`.

**Impact:** Social previews and entity/logo parsers may display no image or parse an HTML document as the image.

**Best fix:** Use the existing WebP asset consistently, or add a real 1200×630 social card at a stable URL. Prefer a dedicated social image rather than a square app logo for `og:image`; keep the square logo for `Organization.logo`.

#### 3. Public and private routes are mixed in the sitemap

**Evidence:** [public/sitemap.xml](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/public/sitemap.xml:1) includes `/upload` and `/palmmatch`, which are interactive conversion flows rather than durable informational documents. [src/App.tsx](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/src/App.tsx:29) also exposes dynamic report routes.

**Impact:** A sitemap asks search engines to crawl pages with thin, interactive, or session-dependent content. Crawl budget is small for this site, but index quality and user intent alignment matter more than volume.

**Best fix:** Keep `/`, `/about`, `/help`, and `/contact` in the sitemap. Include `/upload` and `/palmmatch` only if their server-rendered HTML has substantial, useful explanatory content and the business explicitly wants them indexed. Exclude `/report`, `/report/:id`, `/palmmatch-report/:id`, `/auth/callback`, legal pages if they are not search targets, and any session-dependent URL. Add `<lastmod>` with real modification dates; remove `changefreq` and `priority` if they are not maintained (Google largely ignores them).

### P1 — Improve organic growth and international reach

#### 4. International SEO is not implemented as a URL strategy

**Evidence:** [public/manifest.webmanifest](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/public/manifest.webmanifest:11) declares `en-IN`, while [index.html](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/index.html:103) declares `en-IN` and `en-US` in software data. There are no `hreflang` tags, localized paths, or localized sitemap entries.

**Impact:** International pricing and copy can produce inconsistent snippets, and India/global intent is not clearly separated. Language metadata alone does not create international targeting.

**Best fix:** Choose one of these explicit models:

1. **Recommended initially:** One English global URL set, `lang="en"`, INR/USD handled in the UI, and no misleading `en-IN` claim.
2. **When localized content is ready:** `/en-in/`, `/en-us/`, etc., each with translated/market-specific copy, self-canonical, reciprocal `hreflang`, and an `x-default` entry.

Do not add `hreflang` pages that are only currency variants with identical copy.

#### 5. No durable content engine for non-brand search

**Evidence:** The sitemap contains product/legal/support routes only, and the homepage is the primary content document.

**Impact:** The site has limited opportunity to rank for informational queries such as palm line meanings, Hasta Samudrika Shastra, dominant-hand guidance, and AI palm reading questions.

**Best fix:** Build a genuinely useful `/learn/` or `/blog/` hub with reviewed, original articles. Start with:

- What is Hasta Samudrika Shastra?
- Life line, heart line, head line, and fate line guides
- Which hand should you photograph for palm reading?
- How AI palm image analysis works
- Palmistry vs horoscope: what is different?
- PalmMatch: compatibility questions and limitations

Each article needs a unique title/description, author/reviewer identity, visible publication/update dates, internal links to relevant product pages, and Article/Breadcrumb JSON-LD. Avoid mass-produced thin pages.

#### 6. Homepage structured data contains claims that should be verified

**Evidence:** [index.html](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/index.html:173) declares `aggregateRating` with `ratingValue` 4.9 and `ratingCount` 2100. The same document declares broad product capabilities, iOS/Android support, and multiple prices.

**Impact:** Unsupported review markup can be treated as misleading structured data and may lose eligibility or trust. Claims that do not match the visible page or actual product can create quality issues.

**Best fix:** Remove `aggregateRating` unless the rating and count are independently collected, publicly visible, and shown on the page. Add `review` only for reviews that are real and attributable. Ensure `operatingSystem`, offers, prices, and feature lists exactly match the currently shipped product. Validate with Schema Markup Validator and Rich Results Test after every schema change.

#### 7. FAQ JSON-LD is not clearly route-scoped

**Evidence:** The homepage embeds a large FAQPage graph in [index.html](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/index.html:240), while the visible FAQ is lazy-loaded in `FAQSection`.

**Impact:** Search engines expect FAQ structured data to reflect visible page content. Lazy loading can make the relationship less reliable, and FAQ rich results are restricted/limited by Google.

**Best fix:** Render the FAQ copy in the initial HTML for the homepage (or place it on `/help`), keep JSON-LD questions exactly synchronized with visible answers, and treat FAQ schema as semantic markup—not a guaranteed rich-result strategy.

### P2 — Performance and quality improvements

#### 8. Initial JavaScript payload remains expensive for a content-led homepage

**Evidence:** `npm run build` completed successfully, but emitted a 605.6 kB main JS chunk, plus 289.2 kB Report, 357.7 kB jsPDF, and 201.4 kB html2canvas chunks.

**Impact:** Large parse/execute cost can reduce mobile Core Web Vitals, especially on slower global networks. SEO is affected indirectly through performance, engagement, and crawl rendering cost.

**Best fix:** Keep report/PDF dependencies isolated behind user actions; audit why the main chunk contains 605.6 kB; split vendor modules by route; avoid loading analytics/chat/payment scripts before intent; use Lighthouse mobile and field CrUX/RUM data to set budgets. Target a materially smaller initial route payload and measure LCP/INP/CLS, not bundle size alone.

#### 9. Production cache policy is weak for immutable SEO assets

**Evidence:** Live `robots.txt`, `sitemap.xml`, and `logo.webp` responses use `cache-control: public, max-age=0, must-revalidate`.

**Impact:** Crawlers and users may repeatedly revalidate stable assets, increasing latency and origin work.

**Best fix:** Apply long-lived caching to hashed/static assets and suitable immutable media. Keep `robots.txt` and sitemap revalidatable, but configure CDN behavior deliberately and verify that sitemap changes propagate quickly.

#### 10. SPA fallback makes unknown URLs look successful

**Evidence:** [vercel.json](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/vercel.json:2) rewrites all paths to `/index.html`; live `/not-real` returns the same homepage head and HTTP 200.

**Impact:** Soft 404s waste crawl effort and can dilute site quality signals.

**Best fix:** Preserve history fallback for known client routes, but return a real 404 for unknown paths at the edge/server, or use a prerendered 404 document with the correct status. Never let missing assets such as `/logo.png` be served as HTML.

## What is already good

- The homepage has a clear, descriptive title and meta description in [index.html](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/index.html:33).
- [public/robots.txt](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/public/robots.txt:1) links to the sitemap and blocks report/auth paths.
- The route SEO helper emits canonical, OG, Twitter, and JSON-LD tags through [src/components/SEO.tsx](/Users/dee/Documents/Palmmitra/palmmitra-ai-insights.worktrees/seo-global-audit-and-recommendations/src/components/SEO.tsx:30).
- Public pages generally have one clear H1 and meaningful image alt text.
- Privacy, terms, help, and contact pages provide useful trust/support signals.
- `npm run build` passes.

## Recommended implementation order

1. Fix `/logo.png` references and add a real 1200×630 social card.
2. Implement SSR/SSG/prerendering for all public marketing/support routes.
3. Add explicit `noindex` handling for dynamic/session/private routes and correct 404 status behavior.
4. Rebuild the sitemap around durable indexable documents and add real `lastmod` values.
5. Remove or substantiate aggregate ratings and validate all JSON-LD.
6. Decide the international URL model before adding localized content.
7. Launch a reviewed `/learn/` content hub and connect it with contextual internal links.
8. Establish Core Web Vitals monitoring and reduce the initial JS execution budget.

## Validation checklist after changes

- `curl` each public URL and verify unique title, description, canonical, OG image, and robots directives in raw HTML.
- Test every sitemap URL returns 200, is canonical, is indexable, and contains meaningful content.
- Test an invalid URL returns 404, not a homepage 200.
- Validate JSON-LD with Schema Markup Validator and Google Rich Results Test.
- Verify `og:image` and `twitter:image` return an actual image content type and render in a debugger.
- Submit the sitemap in Google Search Console and Bing Webmaster Tools; inspect indexed canonical selection.
- Run Lighthouse mobile and monitor real-user LCP, INP, CLS, crawl stats, and indexed-page coverage.

## Audit evidence and limitations

This audit combines source inspection, a production HTTP smoke test, and a production build. It does not include authenticated Search Console data, backlink data, log-file analysis, full crawl coverage, or real-user Core Web Vitals. Those should be the next measurement layer after the P0 fixes.

## Implemented in this branch

- Replaced invalid `/logo.png` references with the deployed `/logo.webp` asset.
- Removed unsubstantiated aggregate-rating structured data.
- Removed interactive `/upload` and `/palmmatch` routes from the sitemap.
- Added `noindex` metadata for private reports and the authentication callback.
- Added `X-Robots-Tag: noindex, nofollow` headers for private/auth route families.
- Made route-level SEO previews use a valid default image.

SSR/prerendering for public route metadata and true server-side 404 handling remain deployment-architecture work; the current Vite SPA still needs that follow-up to eliminate homepage-shaped raw HTML on every route.
