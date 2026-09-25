# Report Page — Conversion Suggestions

## Where we lose people today (last 14 days)
```text
164 saw a report -> 81 tapped Unlock (49%) -> 30 opened payment -> ~6-11 paid
```
Two leaks: half never tap Unlock, and most who open payment don't finish. Suggestions below target both, ranked by expected impact. Design, prices, and reading counts stay unchanged.

## A. Get more people to tap Unlock (biggest leak)

1. **Personal "locked clue" right under the headline** — one line from their own premium insights, partly blurred (e.g. "Your Fate Line shows a career turn around age 3_ ..."). Specific curiosity beats generic "unlock full report".
2. **Price shown early, once** — a small "Full reading ₹299 (was ₹499)" line with the Unlock button inside the first screen, instead of only at the bottom paywall.
3. **Inline unlock cards on each locked section** — tapping any blurred section opens payment directly with that section named ("Unlock your Love & Marriage reading"), and we track which section drove the tap.
4. **"What you get" checklist** in the paywall: 8 sections, PDF download, 3 free PalmMitra AI questions, lifetime access — short, icon-led.
5. **Trust row next to the button** — secure Razorpay, UPI/cards, instant unlock, money-back line (only if you approve a refund promise).
6. **Real reviews near the paywall** — show 2 approved customer reviews from the new Reviews system beside the Unlock button.

## B. Get more people to finish payment

7. **UPI-first checkout** — open Razorpay with UPI shown first (most failures happen while switching apps), plus a clear "Paying via UPI? Come back to this tab" hint.
8. **Recovery offer after cancelled payment** — when someone closes checkout, show a gentle panel: "Having trouble? Try card or netbanking" + WhatsApp support link.
9. **Save their spot** — show "Your reading is saved — we've emailed you a link" so leaving doesn't feel like losing it (ties into reminder emails already built).

## C. Retain and grow value after payment

10. **Post-unlock upsell to PalmMatch** — "Now see your compatibility with your partner" card after the Final Blessing.
11. **Share-to-unlock-a-question** referral (from the approved growth plan): share your preview, get 1 extra AI question when a friend reads.

## D. Measure it
- Track per-placement unlock taps (top, section card, sticky bar, paywall) so we can see which suggestions actually work in the admin page.
- Optional: A/B the early price line vs. none.

## Recommended first batch
1, 2, 3, 4, 7, 8 and the tracking in D — highest impact, low risk, no pricing changes. Then 6, 10, 11.

## Technical notes
- Changes in `Report.tsx`, `ReportHeader.tsx`, `PremiumPaywall.tsx`, `LockedSection.tsx`, `StickyUnlockCTA.tsx`, `useReportUnlock.ts` (Razorpay `config.display` UPI-first block), plus new analytics event names registered in `events.ts`.
- Locked clue uses existing `reading.premiumInsights`; no new AI calls.
- Reviews pulled from approved `testimonials` rows.
- Hinglish variants for all new copy.
