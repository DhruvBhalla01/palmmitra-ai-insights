# PalmMitra — What's Next

## Pending from you (blocks live results)
1. **Publish** — several fixes are still preview-only: Hinglish default, AI confidence removed, report unlock teaser card, upload retry, payment "Try again" button, failure-reason tracking.
2. **Re-run PageSpeed** after publishing to confirm the CLS/font fix improved the mobile score.
3. **Sign in once at palmmitra.in/admin** (Google button) and confirm the dashboard numbers look right.
4. **Resubmit sitemap** in Google Search Console.

## Next builds (approved growth plan, in priority order)

### 1. Reviews beside the unlock button
Show 2–3 approved customer reviews directly next to the report unlock card — social proof at the exact moment of decision. Uses the existing approved-testimonials system; no changes to locked counts.

### 2. PalmMatch cross-sell after unlock
After someone unlocks their ₹299 report, show a tasteful card suggesting PalmMatch (₹999) — "Curious about compatibility with someone?" Highest-intent moment for an upsell.

### 3. Share-a-friend reward (referral loop)
On shared report links, add "Get your own reading" incentive — e.g. both sides get 1 free AI question when a friend completes a reading via a shared link. Reuses analytics_events + report_unlocks for tracking.

### 4. PalmMatch payment reminders
Extend the checkout-reminder emails to PalmMatch checkouts (currently only ₹299 reports and AI packs get reminders). Requires making PalmMatch reports reopenable on another device first.

### 5. Blog content for Google
5–10 SEO articles (e.g. "What does your Life Line mean?", "Palm reading for marriage compatibility") to capture search traffic and feed the upload funnel.

## Smaller fixes queued
- Admin page renders in light mode on live site — switch to dark to match the default theme.
- Restyle sign-in emails to match PalmMitra branding.
- Section-bar highlight lag on mobile report page.
- WhatsApp support link on the paywall (needs your WhatsApp number).
- Confirm the "Refund if unhappy" claim before repeating it elsewhere.

## Verification
- Full vitest suite after each build.
- Playwright mobile (390px) checks on live site after publishing.
- No changes to reading/review counts, pricing, or premium design language.
