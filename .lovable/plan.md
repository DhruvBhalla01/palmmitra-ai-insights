

# Implement Core PalmMitra AI Reading Logic

## Overview

The analyze-palm edge function already has the two-step pipeline (validate then generate), but the prompt has issues: duplicate rules, weak personalization, and missing "Next 6 Months Focus" section. This plan fixes the prompt end-to-end and resolves pre-existing build errors in test files.

---

## Part 1: Fix Build Errors (Test Files)

The test files have TypeScript import errors for `screen`, `fireEvent`, `waitFor` from `@testing-library/react`. These need to be imported from `@testing-library/dom` or the test setup needs adjustment.

**Files to fix:**
- `src/App.test.tsx` -- add missing `render` wrapper or fix import
- `src/components/report/ActionButtons.test.tsx` -- fix imports
- `src/hooks/useReportUnlock.test.tsx` -- fix imports
- `src/pages/Report.test.tsx` -- fix imports
- `src/pages/UploadPalm.test.tsx` -- fix imports
- `src/test/setup.ts` -- fix type cast on MockFileReader (line 99) and MotionProxy children type (line 31)

**Approach:** Add `@testing-library/dom` as a dev dependency and import `fireEvent`, `screen`, `waitFor` from there, keeping `render` from `@testing-library/react`. Alternatively, re-export them through `test-utils.tsx`.

---

## Part 2: Overhaul AI Prompt in Edge Function

**File:** `supabase/functions/analyze-palm/index.ts`

### Current Issues
1. Rules 6 and 7 are duplicated (rule 6 appears twice, rule 7 is out of order)
2. No explicit instruction to use the user's name and age throughout
3. Missing "Next 6 Months Focus" in the JSON output structure
4. Reading type focus additions are too brief
5. Fallback data doesn't include the new section

### Changes

**A. Clean up and restructure the prompt rules (8 numbered rules):**

1. PERSONALIZATION IS MANDATORY -- Address user by name, reference their age contextually
2. IMAGE-BASED ANALYSIS ONLY -- Analyze visible lines; reduce confidence if unclear; never hallucinate
3. FUTURE-ONLY TIMELINES -- Current year is 2026; no past years; exact month ranges
4. TRUST-SAFE LANGUAGE -- "may suggest", "indicates potential", "patterns reveal"; no guarantees
5. NO GEMSTONES -- Remedies must be meditation, journaling, temple/nature grounding only
6. PREMIUM TONE -- Warm, spiritual, Indian, calm, respectful, legally safe
7. READING TYPE FOCUS -- Emphasize relevant lines/mounts per the reading type
8. OUTPUT FORMAT -- Valid JSON only, no markdown

**B. Add `next6MonthsFocus` to the JSON structure in the prompt:**

```json
"next6MonthsFocus": {
  "period": "February 2026 - August 2026",
  "focusAreas": [
    {"area": "Area name", "action": "Specific action to take"},
    {"area": "Area name", "action": "Specific action to take"},
    {"area": "Area name", "action": "Specific action to take"}
  ],
  "avoidDuring": "What to be cautious about in this period"
}
```

**C. Enhance reading type focus additions** with specific line/mount emphasis instructions (3-4 sentences each instead of 1).

**D. Update the fallback data** to include `next6MonthsFocus` with dynamic month calculation.

**E. Strengthen the user message** sent to the AI:
```
Analyze this palm image for {name}, age {age}. 
Generate a deeply personalized {readingType} destiny report.
Address {name} by name throughout.
Return ONLY the JSON object.
```

---

## Part 3: Update TypeScript Types

**File:** `src/components/report/types.ts`

Add the new interface and field:

```typescript
export interface Next6MonthsFocus {
  period: string;
  focusAreas: { area: string; action: string }[];
  avoidDuring: string;
}
```

Add `next6MonthsFocus: Next6MonthsFocus` to the `PalmReading` interface.

---

## Part 4: Update Test Fixtures

**File:** `src/test/fixtures/palmReading.ts`

Add `next6MonthsFocus` sample data to match the updated type.

---

## Implementation Order

1. Fix test setup types (`setup.ts` -- 2 type casts)
2. Fix test file imports (5 files -- switch to proper imports)
3. Update `types.ts` with `Next6MonthsFocus`
4. Update `palmReading.ts` fixture
5. Overhaul `analyze-palm/index.ts` prompt + fallback + structure
6. Deploy the edge function

---

## Technical Notes

- The project already uses `OPENAI_API_KEY` with `gpt-4o-mini` for both validation and reading generation. This will be preserved since existing LLM implementations should not be changed unless explicitly requested.
- The validation step (Step 1) remains unchanged -- it correctly rejects non-palm images with 70% confidence threshold.
- The `next6MonthsFocus` section will dynamically calculate the 6-month window from the current date in the prompt text.

