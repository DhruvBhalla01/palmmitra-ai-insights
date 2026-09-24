# Add English and Hinglish PalmMatch reports

## Goal
Let customers choose English or Roman-script Hinglish before PalmMatch analysis, then generate a concise, emotionally valuable compatibility preview that builds honest curiosity for the paid report.

## 1. Add the language choice
- Add a premium English/Hinglish selector to the second PalmMatch step, near the relationship and email details.
- Default to English and explain that the complete compatibility report will use the selected language.
- Include the selected language in analysis tracking, the analysis request, and the temporary report hand-off so it stays consistent through the journey.
- Keep the existing page design, two-step layout, pricing, and social-proof counts unchanged.

## 2. Generate reliable localized reports
- Accept only `english` or `hinglish` on the server; safely default invalid or missing values to English for backward compatibility.
- Store the chosen language with each PalmMatch report using a constrained database field.
- For Hinglish, require natural conversational Hindi-English in Roman script only, with familiar words and no Devanagari. Keep JSON keys and internal values in English so existing report sections continue working.
- Use structured JSON output, validate the response, and retry once if the output is malformed or too English-heavy. Return a clear retryable error instead of saving the wrong language.

## 3. Make the reading concise and conversion-friendly
- Rewrite the PalmMatch generation instructions around specific observations from both palms, emotional recognition, practical relationship guidance, and clear differences between the two people.
- Keep the free preview valuable: a sharp compatibility story and useful Emotional Bond insight, while creating honest curiosity about Communication, Life Goals, Romance, Spiritual Alignment, timing, growth areas, and remedies.
- Tighten most fields to 1–2 short sentences, cap longer summaries at 3 sentences, remove repetition, and target a phone-friendly total length.
- Preserve trust: no fear, fake certainty, manipulative urgency, guaranteed outcomes, or invented palm details. Use confident but responsible language.
- Localize generated section titles and verdict text where appropriate while preserving the data structure the report page expects.

## 4. Align report and unlock messaging
- Carry the saved language into the PalmMatch report state.
- Adjust report teasers and unlock copy so English customers see English and Hinglish customers see concise Roman-script Hinglish.
- Emphasize the concrete paid value: four deeper compatibility dimensions, shared strengths and growth areas, decision timing, remedies, AI follow-up, and downloadable report.
- Keep prices, payment logic, unlock rules, and existing premium visual treatment unchanged.

## 5. Validate end to end
- Add focused tests for language sanitization, English generation, Roman-script Hinglish compliance, malformed JSON, language mismatch retry/failure, and database persistence.
- Test the form-to-report journey in both languages on mobile, including the free preview, locked sections, paywall, and retained language.
- Deploy the database update and PalmMatch analysis function, then run one English and one Hinglish generation check without making a payment.

## Technical details
- The current PalmMatch request, saved report table, client report data, and report type contain no language value.
- The current generation prompt requires at least three sentences per text field and English titles, with no structured response format or Hinglish compliance check.
- The implementation will reuse the existing single-palm report’s language sanitization, Roman-script validation, retry behavior, and recoverable error pattern rather than introducing a separate localization system.
