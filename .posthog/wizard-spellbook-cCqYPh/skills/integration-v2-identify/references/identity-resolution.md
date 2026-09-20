> AI agents: this is one page from PostHog's docs. Full index of Markdown docs for LLMs: https://posthog.com/llms.txt

# Identity resolution - Docs

Copy page

# Identity resolution - Docs

## TL;DR

-   [Identity resolution is your engineering problem](#identity-resolution-is-your-engineering-problem) – PostHog consumes what you give it. If your identity data is incoherent, every downstream feature inherits that incoherence.
-   [Think in layers](#the-identity-layer-model) – stable IDs, authentication IDs, and device IDs serve different purposes. Know which layer you're operating at.
-   [The golden path: assign a stable ID early and never change it](#choosing-your-identity-strategy) – mint it in one place, pass it to every environment. This eliminates an entire class of problems across Feature Flags, Experiments, Session Replay, and Product Analytics.
-   [Pass the ID across transitions explicitly](#golden-path-stable-id-from-first-touch) – web to mobile, marketing site to product, client to server. If two environments generate IDs independently, they will diverge.
-   [Link IDs explicitly](#linking-ids) – PostHog can merge what you tell it to merge. It can't infer that two IDs belong to the same person.
-   [Verify your implementation](#how-to-verify-identity-is-correct) – check person profiles, not assumptions.

 | --- | --- |
| Feature Flags | Different values before and after login | [Hash input changed](/docs/feature-flags/best-practices.md#resolve-identity-before-evaluating-flags) |
| Experiments | User in both control and test | Two unlinked persons, each assigned independently |
| Experiments | Exposure exists but conversion missing | Exposure on anonymous ID, conversion on identified ID |
| Session Replay | Recording breaks at login | distinct_id changed mid-session without linkage |
| Funnels | Conversion attributed to wrong user | Events split across unlinked persons |
| Error Tracking | Phantom users with one error each | Transient IDs creating a new person per error |

In every case, the fix is upstream: ensure the right identity strategy is in place and that IDs are linked before the events that need to be connected.

## Catch-all distinct IDs

Some applications send server-side events using a shared distinct ID like `"system"`, `"backend"`, or `"cron"` for events that aren't tied to a specific user – background jobs, system health checks, automated workflows, and similar.

This is a problem when person processing is enabled (the default). PostHog creates a single person profile for that distinct ID, and every event funnels into it. As this profile accumulates thousands or millions of events, it causes:

-   **Rate limiting** – PostHog applies a [per-distinct-ID rate limit](/docs/how-posthog-works/ingestion-pipeline.md#rate-limiting-high-volume-distinct-ids) to protect the ingestion pipeline. A catch-all ID that sustains a high volume of events crosses this limit, and its events are then processed without strict ordering and without person profile updates for the duration of the spike. Events are not dropped, but the person data for that ID becomes unreliable.
-   **Increased costs** – identified events (with person processing) cost up to 4x more per event than anonymous events. Sending high-volume system events as identified is an unnecessary expense.
-   **Unusable data** – a single person profile containing events from unrelated system processes has no analytical value.

To fix this, disable person processing for these events. Set `$process_person_profile` to `false` and PostHog skips the person lookup entirely. The event is ingested and stored without creating or updating a person profile.

JavaScript

PostHog AI

```javascript
posthog.capture('batch_job_completed', {
    job_name: 'nightly_sync',
    duration_ms: 4500,
    $process_person_profile: false
})
```

If you do need these events tied to a real user (e.g., a background job running on behalf of a specific user), use that user's actual distinct ID instead of a shared one.

## How to verify identity is correct

Pick any user in PostHog. Click into their person profile. You should see:

1.  **One person, not multiple** – search for their email. If you find two person records, they haven't been merged.
2.  **All expected distinct IDs on the same person** – check the Distinct IDs tab. Both anonymous and identified IDs should be listed.
3.  **Events from all SDKs** – browser events and server events should appear on the same person timeline.
4.  **The `$identify` event** – should appear with both the anonymous and identified distinct IDs, confirming the merge happened.

If you see two separate persons for the same real user, trace backwards: which `identify()` or `alias()` call is missing or happening too late?

**Watch for illegal distinct IDs**

PostHog silently rejects certain distinct IDs during person merges. Blocked values include: `null`, `undefined`, `None`, `0`, `anonymous`, `guest`, `distinct_id`, `id`, `email`, `true`, `false`, `[object Object]`, `NaN`, empty strings, and quoted variants of all of these.

If your application generates IDs that could collide with these values (e.g., the string `"null"` as a user ID), person merges will fail silently. You'll end up with split identities and no error message. Use UUIDs or validate IDs against the blocked list before sending.

## Further reading

-   [Production-ready Feature Flags](/docs/feature-flags/best-practices.md) – why identity matters for flags and Experiments (the pure function model)
-   [Keeping flag evaluations stable](/docs/feature-flags/stable-identity-for-flags.md) – flag-specific workarounds when you can't fully control the identity flow
-   [Identifying users](/docs/product-analytics/identify.md) – PostHog's `identify()` API reference

### Still have questions?

Ask PostHog AI

### Was this page useful?

HelpfulCould be better