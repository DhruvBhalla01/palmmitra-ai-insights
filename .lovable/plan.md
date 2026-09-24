# Fix: shared report links open as a blank report

## Why it happens
The report page only shows the reading when the browser opening it has the owner's email saved from when they made the report. Someone who opens a shared link doesn't have that email, so the server sends back no reading and the page shows "This report is locked" with nothing in it.

## What changes
1. **Share buttons create a shareable link.** "Share Report" and "WhatsApp" will send a link with a private share code (for example `/report?id=...&share=abc123`) instead of the plain page address.
2. **Shared view for the recipient.** Opening that link shows a read-only version of the reading: the owner's name, the headline summary, the Life Line, the first personality trait and the first remedy. These are the same sections that are free today. Paid sections stay locked.
3. **Invite at the end, not a dead end.** The recipient sees a clear "Get your own palm reading" button instead of an unlock button for someone else's report. There is no PDF download and no AI chat on shared views.
4. **Old links still work.** Links people already shared (with no share code) will show the same shared view, not a blank page.
5. **Owner experience stays the same.** On the owner's own device, the full unlocked report works exactly as it does now.

## Technical details
- Migration: add `share_token text unique` to `palm_reports` and fill it in for existing rows (random 16-byte hex). New reports get a default value.
- `get-report`: when the caller isn't the owner, return a `shared_preview` object with only the free fields (`headlineSummary`, `majorLines.lifeLine`, `personalityTraits[0]`, `spiritualRemedies[0]`, name, reading type) and `isShared: true`. The full `report_json` is still returned only after the existing email checks pass. Email and paid content are never exposed.
- `Report.tsx`: when `isShared` is true, render the preview sections plus a share-recipient CTA to `/upload`. Replace the locked error state for this case. The owner's unlock paywall stays hidden in this view.
- `ActionButtons.tsx`: build the share URL from `report_id` + `share_token` (returned to owners by `get-report`). Remove the email or any other private data from the URL.
- Analytics: track `shared_report_viewed` and `shared_report_cta_clicked`.
- Check with Playwright: open a report link in a fresh browser with no stored email and confirm the preview renders. Confirm the owner view is unchanged. Update `Report.test.tsx`.
