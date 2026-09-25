# Report Page — Premium UI and Conversion Redesign

Keep the current colours, fonts, gold line-art style, prices and reading/review counts. Change only how the report page is laid out and how the unlock moments look.

## 1. First screen: one combined header ("Vedic Passport" card)
- Merge today's four stacked boxes (title, Key Destiny Insight, palm photo card, reading-ready pill) into one card.
- Layout: palm photo (96px on phone, 144px on desktop) on the left, name + reading type + date on the right, Key Destiny Insight quote below in serif.
- Thin gold hairline frame, soft glow, "Verified" shield kept.
- Goal: the unlock teaser card is visible without scrolling on a 390x844 phone.

## 2. Unlock teaser card (right under the header, locked reports only)
- Personal clue with the hidden part shown as gold "redacted bars" instead of plain blur (e.g. "Career turn around age ▇▇–▇▇").
- Price row: ₹299, ₹499 struck through, "one-time · instant unlock".
- Full-width gold button, 52px tall, with small trust row below: Razorpay · UPI/Cards · Instant · Private.

## 3. Section rhythm
- All free sections use one card style: 24px radius, 20px padding on phone / 32px on desktop, 24px gap between cards.
- Each section title gets a small gold line-art icon and a one-line summary so people can skim.
- Section navigation bar: fix the highlight lag so the active section updates while scrolling.

## 4. Locked sections
- Replace heavy blur with a short readable first line, then redacted gold bars, then a compact "Unlock your Love & Marriage reading" button naming that section.
- Consistent height (about 180px on phone) so the page doesn't feel endless.

## 5. Bottom paywall
- Cleaner "What you get" checklist (8 sections, PDF, 3 free AI questions, lifetime access) in a two-column grid on desktop, one column on phone.
- Approved reviews stay directly under the button.

## 6. Sticky phone unlock bar
- Slimmer (about 72px), price left, button right, shown only after the teaser card scrolls out of view, hidden while the bottom paywall is on screen.

## 7. After unlock
- Header swaps the teaser for a small gold "Full reading unlocked" badge; PalmMatch suggestion and review card keep their current place.

## Not changing
Prices, payment flow, reading/review counts, shared-link preview behaviour, Hinglish text (all new copy gets a Hinglish version).

## Technical details
- Files: `ReportHeader.tsx`, `UnlockTeaserCard.tsx`, `LockedSection.tsx`, `PremiumPaywall.tsx`, `StickyUnlockCTA.tsx`, `Report.tsx`, `index.css` (new `.redacted-bar` and section-card tokens, semantic colours only).
- Sticky bar visibility via IntersectionObserver on the teaser card and paywall instead of a fixed 600px scroll value.
- Section-bar highlight uses IntersectionObserver with rootMargin tuned for the 80px sticky navbar.
- Verify with Playwright at 390x844 and 1280 wide, locked, unlocked and shared states; run the full test suite.
