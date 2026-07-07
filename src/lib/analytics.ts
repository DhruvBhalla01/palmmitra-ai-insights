// Thin analytics wrapper — swap for PostHog/GA later without touching call sites.
export type AiEvent =
  | 'ai_started' | 'ai_suggestion_clicked'
  | 'ai_question_asked' | 'ai_question_completed' | 'ai_question_failed'
  | 'ai_free_exhausted' | 'ai_paywall_viewed'
  | 'ai_subscription_viewed' | 'ai_subscription_started' | 'ai_subscription_purchased'
  | 'ai_pack_purchased' | 'ai_conversation_length';

export function track(event: AiEvent, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, props ?? {});
    (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({ event, ...props });
  } catch { /* noop */ }
}
