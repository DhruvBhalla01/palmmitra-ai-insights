/**
 * Lazy PostHog wrapper — the ~100 KB SDK loads only after the first
 * interaction (or 4 s). Calls made before then are queued and replayed.
 */
import type { PostHog } from 'posthog-js';
import { onFirstInteraction } from '@/lib/deferred';

const apiKey = import.meta.env.VITE_POSTHOG_KEY;
const apiHost = import.meta.env.VITE_POSTHOG_HOST;

type Call = (ph: PostHog) => void;
let instance: PostHog | null = null;
const queue: Call[] = [];

function run(call: Call) {
  if (instance) call(instance);
  else if (queue.length < 200) queue.push(call);
}

if (apiKey && apiHost && typeof window !== 'undefined') {
  onFirstInteraction(() => {
    void import('posthog-js').then(({ default: ph }) => {
      ph.init(apiKey, {
        api_host: apiHost,
        defaults: '2026-05-30',
        capture_exceptions: {
          capture_unhandled_errors: true,
          capture_unhandled_rejections: true,
          capture_console_errors: false,
        },
      });
      instance = ph;
      queue.splice(0).forEach((c) => c(ph));
    });
  });
} else if (import.meta.env.DEV) {
  console.warn('PostHog not configured (VITE_POSTHOG_KEY / VITE_POSTHOG_HOST missing)');
}

const posthog = {
  capture: (event: string, props?: Record<string, unknown>) => run((ph) => ph.capture(event, props)),
  identify: (id: string, props?: Record<string, unknown>) => run((ph) => ph.identify(id, props)),
  reset: () => run((ph) => ph.reset()),
};

export default posthog;
