# PostHog Audit Report

## Summary

This client-side React/Vite integration is fundamentally healthy: the SDK is current, initialization and identity handling are correct, and explicit event names are static. The main gaps are blocker-resistant ingestion, explicit auth-funnel events, and incomplete live-data coverage because the MCP connection lacks the error-tracking read scope.

**Counts**

- **Errors**: 0 (must fix)
- **Warnings**: 2 (should fix)
- **Suggestions**: 2 (nice to have)
- **Passes**: 10

**Problematic items**

| Severity | Area | Check | File | Details |
|----------|------|-------|------|---------|
| `warning` | Event Capture | Captures route through a reverse proxy | `src/lib/posthog.ts:14` | The browser SDK uses the default PostHog ingest host rather than a first-party reverse proxy, so blockers may drop captures. |
| `warning` | Event Capture | Key activation events captured | `src/hooks/useAuth.ts:28` | Explicit signup/signin capture is missing; activation and verified purchase completion are captured. |
| `suggestion` | Live Data | Open findings in PostHog | — | The full live-data sweep could not run because the MCP connection lacks `error_tracking:read`. |
| `suggestion` | Upload notebook | Write the report into a PostHog notebook | — | Notebook tools are disabled on this PostHog connection, so the local report remains the source of truth. |

## Recommended actions

1. **Event Capture · Captures route through a reverse proxy** — Browser events are sent to the default PostHog ingest host instead of a first-party proxy. _Why it matters:_ Tracking blockers can prevent events from reaching PostHog, undercounting funnels, retention, and conversion metrics. _Fix:_ Configure a first-party reverse proxy and point the environment-sourced `api_host` used at `src/lib/posthog.ts:14` to it. See [reverse proxy docs](https://posthog.com/docs/advanced/proxy).

2. **Event Capture · Key activation events captured** — The auth flow does not explicitly capture successful signup or signin, although activation and verified purchase completion are tracked. _Why it matters:_ Without explicit auth milestones, acquisition and activation funnels cannot reliably distinguish anonymous activity from successful account conversion. _Fix:_ Add static, snake_case success events to the completed auth paths around `src/hooks/useAuth.ts:28`, without adding PII to event properties. See [event capture docs](https://posthog.com/docs/product-analytics/capture-events).

3. **Live Data · Open findings in PostHog** — The data-side sweep was incomplete because the MCP connection lacks the `error_tracking:read` scope. _Why it matters:_ Server-computed recommendations such as unresolved source maps may remain invisible to this audit. _Fix:_ Reauthorize the PostHog MCP connection with error-tracking read access, then rerun the audit. See [PostHog MCP docs](https://posthog.com/docs/model-context-protocol).

4. **Upload notebook · Write the report into a PostHog notebook** — The notebook mirror was skipped because notebook tools are disabled on this connection. _Why it matters:_ The audit remains available locally but cannot be shared or discussed from inside PostHog. _Fix:_ Enable the notebook MCP capabilities and rerun the audit if an in-PostHog copy is needed. See [PostHog MCP docs](https://posthog.com/docs/model-context-protocol).

## Full audit

### Installation

Whether the PostHog SDK is present, current, and initialized the way the framework expects. Everything downstream depends on this: a missing or stale SDK silently changes which events exist and which config options are honoured.

| Check | Status | File | Details |
|-------|--------|------|---------|
| PostHog SDK installed | `pass` | — | `posthog-js@1.434.2` |
| SDK version up to date | `pass` | — | Installed 1.434.2, latest 1.434.2. |
| Initialization is correct | `pass` | `src/lib/posthog.ts:14` | Browser SDK initializes once with `VITE_POSTHOG_KEY`; both token and host variables are configured in `.env`. |
| One initialization per runtime | `pass` | `src/lib/posthog.ts:14` | One browser-runtime initialization site found. |

#### Assumptions and blind spots

_No findings to qualify; the standard checks for this area passed cleanly._

### Identification

Whether the same human maps to one stable `distinct_id` across sessions, runtimes, and logins. Identity defects are the most expensive kind to fix after the fact, because they corrupt person counts, funnels, and retention retroactively rather than going forward.

| Check | Status | File | Details |
|-------|--------|------|---------|
| Stable distinct_id (not session UUID) | `pass` | `src/lib/analytics/react.tsx:136` | `identify()` uses the authenticated Supabase user ID, a stable account identifier. |
| identify() called before captures / flag evals | `pass` | `src/lib/analytics/react.tsx:136` | Identification runs during analytics startup and auth-state changes before user-triggered captures. |
| Same distinct_id across client and server | `pass` | `src/lib/posthog.ts:14` | Single runtime. |
| reset() called on logout / account switch | `pass` | `src/lib/analytics/react.tsx:139` | Auth logout resets PostHog, and account switches reset before identifying the new user. |

#### Assumptions and blind spots

_No findings to qualify; the standard checks for this area passed cleanly._

### Event Capture

Whether events are named consistently, reach PostHog reliably, and cover the moments the business actually reasons about. Gaps here don't break anything visibly; they just leave the questions you want to ask unanswerable.

| Check | Status | File | Details |
|-------|--------|------|---------|
| Event names are static and consistent | `pass` | `src/pages/UploadPalm.tsx:156` | All explicit capture calls use static string event names. |
| Captures route through a reverse proxy | `warning` | `src/lib/posthog.ts:14` | The browser SDK uses the default PostHog ingest host rather than a first-party reverse proxy, so blockers may drop captures. |
| Key activation events captured | `warning` | `src/hooks/useAuth.ts:28` | Explicit signup/signin capture is missing; activation and verified purchase completion are captured. |

#### Assumptions and blind spots

The static scan cannot measure the percentage of captures blocked in real browsers or prove that every successful auth branch executes as expected. A first-party network layer could exist outside this repository, although the configured host points to PostHog directly. Verify incoming auth events and compare client request success in the live PostHog project after adding the missing captures and any proxy.

### Live Data

What PostHog itself has already flagged for this project, read from its recommendations and health checks. These come from ingested data rather than source code, so they catch problems no static scan can see — stack frames that never resolve, syncs that keep failing, alerts nobody wired up.

| Check | Status | File | Details |
|-------|--------|------|---------|
| Open findings in PostHog | `suggestion` | — | Skipped: error-tracking recommendations require the `error_tracking:read` MCP scope. Source-tree checks are unaffected; the complete data-side audit was not covered. |

#### Assumptions and blind spots

These findings reflect what PostHog has observed in the recent lookback window, so a project that has just started sending data, or one whose findings haven't been recomputed yet, can show a clean area without being clean. One active authorized-URLs health issue was visible, but the skill requires the combined live-data sweep to be treated as incomplete when either required list is inaccessible. Reauthorize MCP access and rerun the audit to verify all current server-computed findings.

### Write report

Whether the local markdown audit artifact was created successfully.

| Check | Status | File | Details |
|-------|--------|------|---------|
| Create posthog-audit-report.md | `pass` | `posthog-audit-report.md` | The local markdown report was created successfully. |

#### Assumptions and blind spots

_No findings to qualify; the report file was created successfully._

### Upload notebook

Whether the local report was mirrored into a shareable PostHog notebook.

| Check | Status | File | Details |
|-------|--------|------|---------|
| Write the report into a PostHog notebook | `suggestion` | — | Skipped — notebook creation, append, and verification tools are disabled on this PostHog connection. |

#### Assumptions and blind spots

The local markdown report is complete, but no cloud notebook exists to verify or share.

## About this audit

The PostHog wizard runs this audit in stages: SDK installation → init correctness → identification → event capture → live data → this report. The early stages resolve checks against the project's source tree. The live-data stage reads what PostHog already computed from your ingested data — things no source scan can see, like whether stack frames actually resolve. Every result, pass or otherwise, is recorded in the ledger this report was generated from.

- `error` items break correctness now (events lost, identity broken). Fix first.
- `warning` items work today but cause subtle data-quality bugs. Fix when convenient.
- `suggestion` items are best-practice improvements with measurable upside.

Re-run `posthog-wizard audit` after applying fixes to refresh the ledger.
