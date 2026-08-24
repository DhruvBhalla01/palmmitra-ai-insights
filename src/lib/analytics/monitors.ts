/**
 * Global error + performance monitors.
 * Safe context only — no secrets, tokens, or user content.
 */

import { analytics } from './core';
import type { ErrorCategory } from './events';

function safeMessage(input: unknown): string {
  const msg = typeof input === 'string' ? input : (input as Error)?.message ?? 'unknown';
  return msg
    .replace(/(bearer|apikey|api_key|token|secret|password|otp|cvv)[^\s,;]*/gi, '[redacted]')
    .slice(0, 300);
}

export function categorizeError(err: unknown): ErrorCategory {
  const m = safeMessage(err).toLowerCase();
  if (m.includes('abort') || m.includes('cancel')) return 'user_cancelled';
  if (m.includes('timeout') || m.includes('timed out')) return 'timeout';
  if (m.includes('network') || m.includes('failed to fetch')) return 'network_error';
  if (m.includes('invalid') || m.includes('required') || m.includes('validation')) return 'validation_error';
  if (m.includes('5') && m.includes('status')) return 'provider_error';
  return 'unknown';
}

/** Report an API / edge-function failure with safe context. */
export function trackApiError(feature: string, err: unknown, statusCode?: number) {
  analytics.track('api_error', {
    feature,
    page_path: window.location.pathname,
    error_category: categorizeError(err),
    error_message_safe: safeMessage(err),
    status_code: statusCode ?? null,
  });
}

let installed = false;

export function installMonitors() {
  if (installed) return;
  installed = true;

  window.addEventListener('error', (e) => {
    // Resource load failures surface as error events on the element
    const target = e.target as HTMLElement | null;
    if (target && target !== (window as unknown as HTMLElement) && 'tagName' in target) {
      analytics.track('resource_load_error', {
        page_path: window.location.pathname,
        resource_type: target.tagName.toLowerCase(),
        error_category: 'network_error',
      });
      return;
    }
    analytics.track('javascript_error', {
      page_path: window.location.pathname,
      error_message_safe: safeMessage(e.message),
      error_category: 'unknown',
      source_file: (e.filename || '').split('/').pop() ?? null,
      line_number: e.lineno ?? null,
    });
  }, true);

  window.addEventListener('unhandledrejection', (e) => {
    analytics.track('unhandled_promise_rejection', {
      page_path: window.location.pathname,
      error_message_safe: safeMessage(e.reason),
      error_category: categorizeError(e.reason),
    });
  });

  installPerformance();
}

function installPerformance() {
  try {
    // Navigation timing → page_load_time + TTFB
    const emitNav = () => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (!nav) return;
      analytics.track('performance_metric', {
        metric: 'page_load',
        page_path: window.location.pathname,
        page_load_time_ms: Math.round(nav.loadEventEnd - nav.startTime),
        ttfb_ms: Math.round(nav.responseStart - nav.startTime),
        dom_content_loaded_ms: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      });
    };
    if (document.readyState === 'complete') emitNav();
    else window.addEventListener('load', () => setTimeout(emitNav, 0), { once: true });

    if (typeof PerformanceObserver === 'undefined') return;

    let lcp = 0;
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      if (last) lcp = Math.round(last.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    let cls = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) cls += entry.value;
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    const report = () => {
      if (document.visibilityState !== 'hidden') return;
      analytics.track('performance_metric', {
        metric: 'web_vitals',
        page_path: window.location.pathname,
        lcp_ms: lcp || null,
        cls: Math.round(cls * 1000) / 1000,
      });
      document.removeEventListener('visibilitychange', report);
    };
    document.addEventListener('visibilitychange', report);
  } catch { /* performance APIs unsupported */ }
}
