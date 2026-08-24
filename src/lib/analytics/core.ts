/**
 * Analytics transport + core API.
 * - Batches events, flushes on interval / size / page hide.
 * - Uses sendBeacon for terminal events so exits are never lost.
 * - Fully fail-safe: any error is swallowed, the app never breaks.
 */

import type { AnalyticsEventName, AnalyticsProps, InteractionType } from './events';
import {
  getAnonymousId, getSession, touchSession, getUserId, getUserEmail, setUser,
  getDeviceContext, getEnvironment, getFirstTouch, getLatestTouch, uuid,
} from './context';

const INGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-ingest`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const MAX_BATCH = 20;
const FLUSH_INTERVAL_MS = 5000;
const DEBUG = import.meta.env.DEV;

interface QueuedEvent extends Record<string, unknown> {
  event_id: string;
  event_name: string;
  occurred_at: string;
}

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let started = false;

/* ------------------------- last meaningful action ------------------------- */

interface LastInteraction {
  type: InteractionType | null;
  element: string | null;
  timestamp: string | null;
}
let lastInteraction: LastInteraction = { type: null, element: null, timestamp: null };

export function recordInteraction(type: InteractionType, element: string | null) {
  lastInteraction = { type, element, timestamp: new Date().toISOString() };
  touchSession();
}
export function getLastInteraction() { return lastInteraction; }
export function resetInteraction() {
  lastInteraction = { type: null, element: null, timestamp: null };
}

/* -------------------------------- context --------------------------------- */

let currentPageTitle = '';
let previousPage: string | null = null;

export function setPageContext(title: string, prev: string | null) {
  currentPageTitle = title;
  previousPage = prev;
}
export function getPreviousPage() { return previousPage; }

function baseContext() {
  const first = getFirstTouch();
  const latest = getLatestTouch();
  const session = getSession();
  return {
    environment: getEnvironment(),
    source: 'client',
    anonymous_id: getAnonymousId(),
    session_id: session.session_id,
    user_id: getUserId(),
    user_email: getUserEmail(),
    page_path: window.location.pathname,
    page_url: window.location.href.split('#')[0],
    page_title: currentPageTitle || document.title,
    referrer: document.referrer || '',
    landing_page: first.landing_page,
    previous_page: previousPage,
    ...getDeviceContext(),
    utm_source: latest.utm_source,
    utm_medium: latest.utm_medium,
    utm_campaign: latest.utm_campaign,
    utm_term: latest.utm_term,
    utm_content: latest.utm_content,
    first_touch: first,
    latest_touch: latest,
  };
}

/* -------------------------------- transport -------------------------------- */

function scheduleFlush() {
  if (timer) return;
  timer = setTimeout(() => { timer = null; void flush(); }, FLUSH_INTERVAL_MS);
}

async function flush() {
  if (!queue.length) return;
  const batch = queue;
  queue = [];
  try {
    await fetch(INGEST_URL, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
      body: JSON.stringify({ events: batch }),
    });
  } catch {
    // Never retry aggressively — analytics must not affect the app.
  }
}

/** Reliable delivery for terminal events (page hide / unload). */
function flushSync() {
  if (!queue.length) return;
  const batch = queue;
  queue = [];
  const body = JSON.stringify({ events: batch, apikey: ANON_KEY });
  try {
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(INGEST_URL, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
      if (ok) return;
    }
  } catch { /* fall through */ }
  try {
    void fetch(INGEST_URL, {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
      body: JSON.stringify({ events: batch }),
    });
  } catch { /* noop */ }
}

/* --------------------------------- public --------------------------------- */

function enqueue(name: AnalyticsEventName, props: AnalyticsProps = {}, immediate = false) {
  try {
    const event: QueuedEvent = {
      event_id: uuid(),
      event_name: name,
      occurred_at: new Date().toISOString(),
      ...baseContext(),
      properties: props,
    };
    queue.push(event);
    if (DEBUG) console.debug('[analytics]', name, props);
    if (immediate) flushSync();
    else if (queue.length >= MAX_BATCH) void flush();
    else scheduleFlush();
  } catch {
    // swallow — analytics never throws into product code
  }
}

export const analytics = {
  /** Track any registered product event. */
  track(name: AnalyticsEventName, props: AnalyticsProps = {}) {
    enqueue(name, props);
    touchSession();
  },
  /** Terminal events (page_exit, session_ended) — delivered via sendBeacon. */
  trackImmediate(name: AnalyticsEventName, props: AnalyticsProps = {}) {
    enqueue(name, props, true);
  },
  /** Page view — emitted by the router integration. */
  page(props: AnalyticsProps = {}) {
    enqueue('page_view', props);
    touchSession();
  },
  /** Associate the current anonymous_id with an authenticated user. */
  identify(id: string | null, traits: AnalyticsProps = {}, email?: string | null) {
    setUser(id, email ?? null);
    enqueue('identify', traits);
  },
  /** Attach durable traits to subsequent events. */
  setUserProperties(traits: AnalyticsProps = {}) {
    enqueue('identify', { ...traits, properties_only: true });
  },
  flush,
  flushSync,
};

export function startTransport() {
  if (started) return;
  started = true;
  window.addEventListener('pagehide', flushSync);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSync();
  });
}
