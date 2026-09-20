# Fix dynamic pricing, report wait, and Hinglish output

## Goal
Make localized pricing reliably follow the visitor’s country, reduce unnecessary report-screen waiting to two seconds or less after data is ready, and guarantee that Hinglish selections produce Roman-script Hinglish reports.

## 1. Reliable country and currency detection
- Add a small location-detection function that derives the visitor country from trusted request metadata and returns only supported two-letter country codes.
- Use detection priority: saved manual choice → detected country → browser timezone/locale fallback → USD.
- Expand browser fallback coverage for supported regions and use modern locale-region inference instead of relying only on a suffix match.
- Preserve an explicit currency choice across visits and synchronize the result across all visible price surfaces.
- Keep checkout authoritative: the server will continue calculating currency and amount from the validated country code rather than accepting browser-supplied price values.
- Show the detected currency immediately when available, without changing the existing selector design.

## 2. Reduce report-generation screen delay
- Remove the avoidable half-second delay before opening the report and the duplicate 1.5-second reveal after the report data has loaded.
- Cap the completed/reveal transition at two seconds, while navigating immediately when the genuine report is ready.
- Keep the analysis screen tied to actual upload, palm validation, and AI generation; do not display a fake completed report before the backend finishes.
- Tune progress messaging so it advances quickly at first and waits honestly near completion rather than implying that eleven timed steps represent backend milestones.
- Record validation, generation, and total durations so future latency improvements are based on real measurements.

## 3. Guarantee Hinglish report output
- Strengthen the AI request with structured JSON output and explicit Roman-script Hinglish requirements for every customer-facing field.
- Replace the language-blind English fallback: retry once when JSON or language validation fails, then return a clear recoverable error rather than saving an English report marked as Hinglish.
- Add a server-side Hinglish compliance check on representative long-form fields before persisting the report.
- Return the saved language from report retrieval and carry it through report state so direct links and refreshed sessions retain the selected language.
- Keep JSON keys and internal enum values stable to avoid breaking existing report components.

## 4. Validation and rollout
- Add focused tests for supported-country mapping, unsupported-country USD fallback, saved manual overrides, and server-authoritative checkout behavior.
- Test English and Hinglish requests, malformed model JSON, language mismatch retry/failure, and refreshed report retrieval.
- Verify the upload-to-report transition on mobile and desktop, including the two-second maximum post-completion reveal.
- Deploy the new location function and updated palm-analysis/report functions, then confirm logs and database language/country values.

## Technical notes
- Current country detection is synchronous and limited to a small timezone map plus browser locale; there is no network-location signal.
- Current palm generation performs sequential image validation and full GPT-4.1 report generation, so genuine end-to-end completion cannot be guaranteed in two seconds. This plan removes the extra two seconds after completion without misrepresenting unfinished AI work.
- Current Hinglish selection reaches the prompt, but JSON parse failure returns a hardcoded English report, and successful model output is not checked for language compliance.
