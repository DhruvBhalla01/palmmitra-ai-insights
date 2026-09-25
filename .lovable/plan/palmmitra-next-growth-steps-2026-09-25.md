# PalmMitra — Next Growth Steps

Prioritized recommendations beyond what's already built. Pick which to implement; each is independent.

## 1. Revenue & Conversion (highest priority)

- **Abandoned-checkout recovery email**: when someone starts a payment but doesn't finish, send a gentle reminder email after a few hours with a direct link back to their report. Checkout abandonment is typically 60–80%; recovering even 10% is meaningful revenue. (Needs transactional email setup.)
- **Report delivery email**: send the finished report link by email so customers can return anytime — reduces "I lost my report" support issues and brings repeat visits.
- **Referral loop on shared reports**: shared report links already show a "Get your own palm reading" invite — add a small incentive (e.g. 1 free AI question for both sides) to turn sharing into a growth channel.
- **Festive-season campaigns**: Indian festivals (Diwali, Karva Chauth, wedding season) are peak astrology demand. Pre-built landing banners + PalmMatch couples angle for wedding season.

## 2. Trust & Retention

- **Customer reviews/testimonials section**: real quotes with first names on the home page (you approve each one before it shows). Complements — never replaces — the locked reading counts.
- **"Come back" engagement**: a weekly "Ask PalmMitra" prompt email to past customers drives repeat AI question pack purchases.

## 3. Operations (you, as founder)

- **Admin page alerts**: extend /admin with a daily summary email (uploads, orders, revenue, failures) so you don't have to check manually.
- **Failure alerts**: notify you immediately when palm analysis or payments fail repeatedly, so you catch issues before customers complain.

## 4. Marketing & SEO

- **Blog/content pages**: 5–10 articles ("What does your Life Line say?", "Palm reading vs astrology") targeting Google searches — the biggest free traffic source for this niche.
- **Google Search Console + sitemap resubmission** after the next publish, so the new PalmMatch SEO work gets indexed.

## Suggested order

1. Abandoned-checkout + report delivery emails (needs email sending set up)
2. Daily admin summary + failure alerts
3. Reviews section
4. Blog content

Tell me which of these you want and I'll plan the chosen ones in detail.

## Technical notes (for reference)

- Email sending requires a transactional email provider (Resend/Postmark) connected via Lovable Cloud secrets; sending domain palmmitra.in needs DNS verification.
- Referral tracking reuses the existing analytics_events + report_unlocks tables.
- Admin alerts reuse the admin-dashboard edge function with a scheduled invocation.
