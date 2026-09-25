# Fix: shared PalmMatch links open the PalmMatch home page

## Why it happens
When someone opens a shared PalmMatch report link on their own phone, the page can't find the owner's email (it only lives in the owner's browser or in their private email link). With no email, the page sends the visitor straight to the PalmMatch home page instead of showing anything.

## What changes
1. **Shared links open a preview, not the home page.** A visitor sees both names, the relationship type, the compatibility score and verdict, and the short overall summary. Paid sections stay locked.
2. **Clear invitation.** A banner reads "Viewing compatibility for [Name] & [Name]" with a "Get your own PalmMatch reading" button. Shared visitors are never asked to pay for someone else's report.
3. **Owner experience unchanged.** On the owner's device, or through their private email link, the full report and unlock work exactly as now.
4. **Share button sends a clean link.** Shared links never include the owner's email.
5. **Old links keep working.** Links people already shared will show the preview.

## Technical details
- `get-palmmatch-status`: when `include_report` is set and the caller is not the owner or a subscriber, return `shared_preview` with only `person1Name`, `person2Name`, `relationshipType`, `overallScore`, `compatibilityVerdict`, `overallNarrative` and language, plus `isShared: true`. No email and no paid dimensions. Keep the existing report ID format check.
- `PalmMatchReport.tsx`: stop redirecting when the email is missing. Try session data first, then the owner restore (`?e=`), then the shared preview. Redirect to `/palmmatch` only when the report doesn't exist. Render a shared view with a teaser and a CTA to `/palmmatch`. Hide the paywall, PDF, AI chat and share actions for shared visitors.
- `handleShare`: build `https://palmmitra.in/palmmatch-report/<id>` with no `?e=`.
- Analytics: track `shared_palmmatch_viewed` and `shared_palmmatch_cta_clicked`, and register both events.
- Deploy `get-palmmatch-status`. Check with Playwright at 390x844: a fresh browser opening a real report link shows the preview, and the owner `?e=` link still shows the full report. Then run the typecheck and tests.
