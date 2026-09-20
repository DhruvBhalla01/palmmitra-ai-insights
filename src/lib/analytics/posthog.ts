import posthog from 'posthog-js';
import type { AnalyticsEventName, AnalyticsProps } from './events';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com';
let initialized = false;

const SENSITIVE_KEY = /(email|name|image|photo|report_json|message|token|secret|signature|authorization|apikey|key$)/i;

function safeProperties(properties: AnalyticsProps): Record<string, string | number | boolean | null> {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) =>
      !SENSITIVE_KEY.test(key) &&
      (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null),
    ),
  );
}

export function initPostHog() {
  if (initialized || !POSTHOG_KEY || typeof window === 'undefined') return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    person_profiles: 'identified_only',
    persistence: 'localStorage+cookie',
  });
  initialized = true;
}

export function capturePostHogEvent(
  name: AnalyticsEventName,
  properties: AnalyticsProps = {},
  context: AnalyticsProps = {},
) {
  if (!initialized) return;
  posthog.capture(name, {
    ...safeProperties(context),
    ...safeProperties(properties),
  });
}
