# Next Phase: Branded Emails, Festive Campaign, SEO Expansion

## Goal
Build the three remaining growth items that don't depend on anything from you: luxury-branded emails, a Diwali/Karva Chauth seasonal push, and more SEO content. (The WhatsApp paywall button stays queued until you share your number.)

## 1. Luxury-branded emails
- Restyle the sign-in (magic link) email and the payment-reminder email to match PalmMitra's gold-and-black spiritual look: dark background, gold accents, serif heading, PalmMitra wordmark, one clear button.
- Same template shell for both so every email from notify.palmmitra.in looks consistent and trustworthy.
- Keeps the existing sending logic, links, and one-reminder-per-customer rules unchanged.

## 2. Festive season campaign (Diwali / Karva Chauth / wedding season)
- A seasonal banner on the home page and the PalmMatch page: "This festive season, discover your compatibility" style messaging, in English and Hinglish, using the existing gold design language.
- Couples-focused angle: PalmMatch (₹999) as a meaningful festive gift; links straight into the PalmMatch flow.
- Built as a switchable seasonal component so it can be turned off or re-themed after the season without touching the rest of the site.
- No price changes, no fake countdowns or urgency claims.

## 3. SEO content expansion (5 more guides)
- Five new guides in the same style as the existing five, targeting the next set of high-intent searches:
  1. Fate Line (Bhagya Rekha): career, success and timing signs
  2. Sun Line (Surya Rekha): fame, recognition and creative success
  3. Marriage Lines on the Palm: how many, and what they mean
  4. Mounts of the Palm: Venus, Jupiter, Moon and what they reveal
  5. Rare Palm Signs: the M formation, star, and triangle markings
- Each with structured FAQ data, internal links to /upload and /palmmatch, added to the sitemap and Guides index.
- Same rules as before: traditional palmistry sources, no medical/legal/financial claims, disclaimer at the foot of each guide.

## Technical notes
- Email templates live in the existing email edge-function setup; only the HTML/styling changes.
- Seasonal banner is a new component in src/components/home/, rendered conditionally; tracked in analytics so you can see festive clicks in the admin page.
- Guides follow the existing src/data/guides.ts + Guides/GuideDetail pages pattern; sitemap.xml updated.
- No changes to prices, reading/review counts, payment logic, or the existing design system.

## Verification
- Full test suite after each part; typecheck clean.
- Playwright mobile (390px) check of the festive banner and one new guide page.
- Email styling verified by sending a test reminder/sign-in email where possible.

## Still pending from you (not in this phase)
- Publish everything already built (report page redesign, Hinglish default, PalmMatch reminders, referral loop, reviews strip, and now this phase).
- Your WhatsApp number for the paywall support button.
- Resubmit sitemap in Google Search Console after publishing.
