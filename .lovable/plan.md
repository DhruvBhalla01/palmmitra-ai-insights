# Make Hinglish the default language

## What changes

The language pickers on both reading flows currently default to English. They will default to **Hinglish** instead. Customers can still switch to English at any time — the picker itself is untouched.

1. **Upload Palm page** (`src/pages/UploadPalm.tsx`)
   - Change the form's initial language from `'english'` to `'hinglish'`.

2. **PalmMatch page** (`src/pages/PalmMatch.tsx`)
   - Change the initial language so a visitor with no saved choice gets Hinglish.
   - If a visitor previously picked a language, their saved choice still wins (existing `palmmitra:palmmatch-language` localStorage behavior is preserved).

## What does NOT change

- No prompt, pricing, payment, design, or reading-count changes.
- The backend already accepts and generates both languages, so no backend changes are needed.
- The language selector stays visible on both forms so users can switch to English.

## Verification

- Run the existing test suite (13 tests) and typecheck.
- Confirm both forms show "Hinglish" pre-selected on a fresh visit, and that a previously saved PalmMatch choice still takes precedence.
