/**
 * Legacy shim — existing call sites (`track('ai_drawer_opened')`) keep working
 * while all data now flows through the centralized analytics service.
 */
import { analytics } from '@/lib/analytics/index';
import type { AnalyticsEventName } from '@/lib/analytics/events';

export type AiEvent =
  | 'ai_drawer_opened' | 'ai_seed_shown' | 'ai_suggestion_clicked'
  | 'ai_question_asked' | 'ai_question_completed' | 'ai_question_failed'
  | 'ai_free_exhausted' | 'ai_paywall_viewed'
  | 'ai_pack_selected' | 'ai_pack_purchased'
  | 'ai_subscription_viewed' | 'ai_subscription_started' | 'ai_subscription_purchased'
  | 'ai_conversation_length';

/** Map legacy AI event names onto the central registry. */
const MAP: Record<AiEvent, { name: AnalyticsEventName; props?: Record<string, string> }> = {
  ai_drawer_opened:           { name: 'ai_guide_opened' },
  ai_seed_shown:              { name: 'section_viewed', props: { section_id: 'ai_seed' } },
  ai_suggestion_clicked:      { name: 'cta_clicked', props: { element_id: 'ai_suggestion' } },
  ai_question_asked:          { name: 'ai_guide_message_sent' },
  ai_question_completed:      { name: 'ai_request_completed', props: { feature: 'ai_guide' } },
  ai_question_failed:         { name: 'ai_request_failed', props: { feature: 'ai_guide' } },
  ai_free_exhausted:          { name: 'report_locked_viewed', props: { context: 'ai_free_exhausted' } },
  ai_paywall_viewed:          { name: 'pricing_viewed', props: { context: 'ai_paywall' } },
  ai_pack_selected:           { name: 'pricing_plan_selected', props: { context: 'ai_pack' } },
  ai_pack_purchased:          { name: 'checkout_payment_success', props: { context: 'ai_pack' } },
  ai_subscription_viewed:     { name: 'pricing_viewed', props: { context: 'ai_subscription' } },
  ai_subscription_started:    { name: 'checkout_started', props: { context: 'ai_subscription' } },
  ai_subscription_purchased:  { name: 'checkout_payment_success', props: { context: 'ai_subscription' } },
  ai_conversation_length:     { name: 'ai_request_completed', props: { feature: 'ai_conversation_length' } },
};

export function track(event: AiEvent, props?: Record<string, unknown>) {
  const mapped = MAP[event];
  if (!mapped) return;
  const safe: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(props ?? {})) {
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') safe[k] = v;
    else if (v === null) safe[k] = null;
  }
  analytics.track(mapped.name, { legacy_event: event, ...mapped.props, ...safe });
}

export { analytics } from '@/lib/analytics/index';
export {
  AnalyticsProvider,
  useSectionView,
  useFormAnalytics,
  markSectionViewed,
  recordInteraction,
  trackApiError,
} from '@/lib/analytics/index';
export type { AnalyticsEventName } from '@/lib/analytics/events';
