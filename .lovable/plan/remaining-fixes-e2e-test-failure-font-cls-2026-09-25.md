# Remaining fixes: E2E test failure + font CLS

Two open items remain after the OpenAI fix.

## 1. Upload → Report end-to-end test failure

The test `tests/e2e/upload-report.spec.tsx` ("creates a report and lands on the report page") fails on its final assertion. It looks for the text "key destiny insight" on the report page after a mocked analysis, but the report page copy/structure changed during the premium redesign (executive summary, AI signals, dimension cards, the new "Destiny Report for {name}" h1), so the expected text no longer exists.

Fix:
- Run the test and capture the exact failure output.
- Update the assertion to match the current report page (e.g. the "Destiny Report for Asha" heading or the executive summary section), without changing any production code unless the test reveals a real bug.
- Re-run the full vitest suite (`UploadPalm.test.tsx`, `Report.test.tsx`, `ActionButtons.test.tsx`, the e2e spec) to confirm everything passes.

## 2. Font-swap layout shift (CLS) on mobile

PageSpeed flagged layout shift caused by web fonts swapping in after first paint. Current setup loads fonts non-blocking (good for speed) but the fallback font metrics differ enough to shift text when the real font arrives.

Fix:
- Add `size-adjust` / `ascent-override` / `descent-override` / `line-gap-override` `@font-face` fallback declarations (or use a metric-matched fallback like `Arial` tuned via `font-display: swap` with overrides) so the fallback text occupies nearly the same space as the final font.
- Alternatively, if overrides prove fragile, use `font-display: optional` for body text so late-arriving fonts never cause a swap shift, keeping `swap` only for the display serif used in headings.
- Verify with a local Lighthouse/PageSpeed run on mobile that CLS drops and no visual regression appears.

## Verification
- Full test suite green.
- Local mobile PageSpeed re-run showing improved CLS; note that the live score requires publishing.
- `git diff --check` clean; no design, pricing, or reading-count changes.
