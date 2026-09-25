# Score-locking recheck: findings and fixes

## What works correctly
- Both flows look up the earliest earlier reading and reuse its numbers.
- The numbers are forced back in after the AI replies, so they can't drift even if the AI changes them.
- PalmMatch matches names in either order (Rahul & Priya = Priya & Rahul).
- If the lookup fails, the reading still goes through as normal (it never blocks a customer).

## Problems found

1. **PalmMatch shares scores between strangers (serious).** A couple is matched only by names + relationship, not email. Every "Rahul & Priya, married" in India would get the first such couple's score and verdict. Common names make this likely.
2. **Single reading without email has the same risk.** It matches on name + age only, so two different "Rahul, 25" users get identical line strengths.
3. **Special characters in names act as wildcards.** A `%` or `_` in a name could match other people's readings.
4. **The promised stable score for new couples was never built.** A first-time couple using a new email gets a random score, so trying again with another email gives a different number.
5. **Verdict can disagree with score when language switches.** A Hinglish repeat of an English reading keeps the score but gets a new verdict, which could sound more or less positive than the number.

## Fixes
1. PalmMatch: first look for an earlier reading with the **same email + same couple (either order) + same relationship**. Only reuse scores from that match.
2. When there's no earlier match, generate a **stable starting score from the couple's details** (sorted names + relationship). The AI then has to use it. The same couple always gets the same number, even with a different email. Strangers only share a starting number, never someone else's written reading.
3. Single reading: reuse measurements only when **email + name** match. With no email, use **name + age + reading type + photo address**. Otherwise start fresh.
4. Make names safe before searching, so special characters are matched literally.
5. When the language differs, tell the AI to write a verdict that fits the locked score band (for example, 85+ = excellent).

## Verification
- Run a new couple twice with the same email: identical scores.
- Swap the names: identical scores.
- Same names, different email: same starting score, but no written reading is copied.
- Different couple: different score.
- Run a single reading twice with the same email: same line strengths and mount levels.
- Same name and age with a different email: nothing is reused.
- Delete the test readings afterwards, then redeploy both reading services.

## Technical details
- `analyze-palmmatch`: add `.eq("email", cleanEmail)` to `findLockedScores`. Add `deterministicScores(p1, p2, rel)`: an FNV hash of sorted normalized names + rel, giving an overall score of 68–92 with dimensions within ±8, clamped to 55–97. Pass it as `locked` when there's no earlier match. Escape `%`/`_`/`\` before `ilike`. Add a verdict-band instruction when `keepVerdict` is false.
- `analyze-palm`: tighten the fallback in `findLockedMetrics` and apply the same escaping.
