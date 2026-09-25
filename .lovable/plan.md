# Remove AI Confidence from the Report Page

## Goal
Remove the "AI Confidence" indicator from the report page so customers never see an AI-generated confidence number. Design, branding, and all other report content stay exactly as they are.

## What changes

### 1. Destiny Report page (`src/components/report/ReportHeader.tsx`)
- Delete the confidence pill in the header card: the small gold ring with the percentage plus the "AI Confidence / Verified" label (lines ~143–154).
- Keep the neighbouring shield "Verified" badge so the header row still has a trust badge and spacing stays balanced.
- Remove the now-unused `ConfidenceRing` helper and the `confidenceScore` prop; update `src/pages/Report.tsx` to stop passing it.

### 2. PalmMatch report (`src/components/palmmatch/ExecutiveSummary.tsx`)
- Remove the "AI Confidence · X%" pill so both report pages behave consistently.

### 3. What stays untouched
- Reading/review counts, prices, payment flow, PDF generation, and all report copy remain unchanged (the PDF still shows its confidence section — say the word if you want that removed too).
- The stored confidence data in the database is untouched; only the visible display is removed.

## Verification
- Typecheck passes.
- Playwright check on the report page: confidence pill gone, header layout intact, no console errors.
- All existing tests pass.
