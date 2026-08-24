/**
 * PalmMitra — Central Event Registry
 * ---------------------------------------------------------------
 * Every analytics event in the product MUST be declared here.
 * `analytics.track()` only accepts names from this registry, so
 * no ad-hoc event names can leak into the codebase.
 */

export const ANALYTICS_EVENTS = [
  // Session / visitor lifecycle
  'session_started',
  'session_ended',
  'new_visitor',
  'returning_visitor',
  'identify',

  // Page lifecycle
  'page_view',
  'page_exit',
  'navigation',
  'external_link_clicked',

  // Engagement
  'scroll_depth_reached',
  'section_viewed',
  'cta_clicked',
  'button_clicked',
  'link_clicked',
  'faq_opened',

  // Forms
  'form_viewed',
  'form_started',
  'form_field_focused',
  'form_field_completed',
  'form_validation_error',
  'form_abandoned',
  'form_submitted',
  'form_submission_success',
  'form_submission_failed',

  // PalmMitra journey
  'palm_reading_started',
  'palm_image_upload_started',
  'palm_image_uploaded',
  'palm_image_upload_failed',
  'palm_analysis_started',
  'palm_analysis_completed',
  'palm_analysis_failed',
  'reading_preview_viewed',
  'report_locked_viewed',
  'report_section_viewed',
  'destiny_section_viewed',
  'ai_guide_opened',
  'ai_guide_message_sent',
  'pdf_download_clicked',

  // Pricing
  'pricing_viewed',
  'pricing_plan_selected',
  'pricing_cta_clicked',
  'unlock_report_clicked',

  // Checkout / payment (client-side intent signals)
  'checkout_viewed',
  'checkout_started',
  'checkout_plan_selected',
  'checkout_payment_method_selected',
  'checkout_payment_initiated',
  'checkout_payment_redirected',
  'checkout_payment_success',
  'checkout_payment_failed',
  'checkout_payment_cancelled',
  'checkout_payment_timeout',
  'checkout_completed',

  // Authoritative (server-generated) commerce events
  'order_created',
  'payment_success',
  'payment_failed',
  'payment_refunded',
  'report_unlocked',

  // Downloads
  'download_started',
  'download_completed',
  'download_failed',

  // AI
  'ai_request_started',
  'ai_request_completed',
  'ai_request_failed',
  'ai_response_rated',

  // Errors / performance
  'javascript_error',
  'unhandled_promise_rejection',
  'api_error',
  'network_error',
  'resource_load_error',
  'performance_metric',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

/** Meaningful interaction types recorded as "last action" before exit */
export type InteractionType =
  | 'cta_clicked'
  | 'button_clicked'
  | 'link_clicked'
  | 'form_started'
  | 'form_completed'
  | 'pricing_plan_selected'
  | 'checkout_started'
  | 'faq_opened'
  | 'section_viewed'
  | 'scroll';

export type ExitType =
  | 'internal_navigation'
  | 'external_navigation'
  | 'tab_hidden'
  | 'pagehide'
  | 'browser_close'
  | 'session_timeout'
  | 'unknown';

export type ErrorCategory =
  | 'user_cancelled'
  | 'provider_error'
  | 'network_error'
  | 'validation_error'
  | 'timeout'
  | 'unknown';

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;
