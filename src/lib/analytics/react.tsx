/**
 * React bindings: router integration, delegated CTA tracking,
 * section-visibility and form-lifecycle hooks.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics, recordInteraction, startTransport } from './core';
import { startPage, endPage, markSectionViewed } from './page';
import {
  initAttribution, getAnonymousId, getSession, getVisitorStatus, getVisitorMetrics,
  setSessionListener, setUser,
} from './context';
import { installMonitors } from './monitors';
import { supabase } from '@/integrations/supabase/client';

let booted = false;

function boot() {
  if (booted) return;
  booted = true;
  initAttribution();
  getAnonymousId();
  startTransport();

  setSessionListener(() => {
    analytics.track('session_started', getVisitorMetrics());
  });

  const session = getSession();
  analytics.track('session_started', { ...getVisitorMetrics(), session_id: session.session_id });
  analytics.track(getVisitorStatus(), getVisitorMetrics());
  installMonitors();
}

/* --------------------------- delegated CTA clicks -------------------------- */

function installClickDelegation() {
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-analytics-id], a[href]',
    );
    if (!target) return;

    const id = target.getAttribute('data-analytics-id');
    const anchor = target instanceof HTMLAnchorElement ? target : null;

    // Only track meaningful interactions: tagged elements or real links.
    if (!id && !anchor) return;

    if (anchor) {
      const href = anchor.getAttribute('href') || '';
      const isExternal = /^https?:\/\//i.test(href) && !href.includes(window.location.hostname);
      if (isExternal) {
        let domain = '';
        try { domain = new URL(href).hostname; } catch { /* ignore */ }
        analytics.track('external_link_clicked', {
          source_page: window.location.pathname,
          destination_domain: domain,
          element_id: id ?? null,
        });
        recordInteraction('link_clicked', id ?? domain);
        return;
      }
      if (!id) {
        analytics.track('link_clicked', {
          element_id: null,
          destination: href.split('?')[0],
          page_path: window.location.pathname,
        });
        recordInteraction('link_clicked', href.split('?')[0]);
        return;
      }
    }

    if (!id) return;
    const type = target.getAttribute('data-analytics-type') || 'cta_clicked';
    const destination =
      anchor?.getAttribute('href')?.split('?')[0] ??
      target.getAttribute('data-analytics-destination') ??
      null;

    analytics.track(type === 'button_clicked' ? 'button_clicked' : 'cta_clicked', {
      element_id: id,
      element_type: target.tagName.toLowerCase(),
      page_path: window.location.pathname,
      destination,
    });
    recordInteraction(type === 'button_clicked' ? 'button_clicked' : 'cta_clicked', id);
  }, true);
}

let clicksInstalled = false;

/* ------------------------------- the provider ------------------------------ */

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    boot();
    if (!clicksInstalled) { clicksInstalled = true; installClickDelegation(); }

    // Attach authenticated identity when available.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) analytics.identify(s.user.id, { auth: true }, s.user.email ?? null);
      else setUser(null, null);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        analytics.identify(data.session.user.id, { auth: true }, data.session.user.email ?? null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (lastTracked.current === path) return; // no duplicate page views
    lastTracked.current = path;
    // Let the route render so document.title is accurate.
    const t = window.setTimeout(() => startPage(path, document.title), 60);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => () => endPage('internal_navigation'), []);

  return <>{children}</>;
}

/* --------------------------------- hooks ---------------------------------- */

/** Fire `section_viewed` once when a section becomes meaningfully visible. */
export function useSectionView<T extends HTMLElement = HTMLDivElement>(
  sectionId: string,
  extra: Record<string, string | number> = {},
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          markSectionViewed(sectionId, extra);
          io.disconnect();
        }
      }
    }, { threshold: [0.4] });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]);
  return ref;
}

/** Full form lifecycle. Field VALUES are never sent — only field ids. */
export function useFormAnalytics(formId: string) {
  const started = useRef(false);
  const submitted = useRef(false);
  const fields = useRef<Set<string>>(new Set());

  useEffect(() => {
    analytics.track('form_viewed', { form_id: formId });
    return () => {
      if (started.current && !submitted.current) {
        analytics.track('form_abandoned', {
          form_id: formId,
          fields_completed: fields.current.size,
        });
      }
    };
  }, [formId]);

  const fieldFocused = useCallback((fieldId: string, step?: string | number) => {
    if (!started.current) {
      started.current = true;
      analytics.track('form_started', { form_id: formId, field_id: fieldId });
      recordInteraction('form_started', formId);
    }
    analytics.track('form_field_focused', { form_id: formId, field_id: fieldId, step: step ?? null });
  }, [formId]);

  const fieldCompleted = useCallback((fieldId: string, hasValue: boolean, step?: string | number) => {
    if (!hasValue) return;
    if (fields.current.has(fieldId)) return;
    fields.current.add(fieldId);
    analytics.track('form_field_completed', { form_id: formId, field_id: fieldId, step: step ?? null });
  }, [formId]);

  const validationError = useCallback((fieldId: string, errorType: string) => {
    analytics.track('form_validation_error', { form_id: formId, field_id: fieldId, error_type: errorType });
  }, [formId]);

  const submit = useCallback((step?: string | number) => {
    submitted.current = true;
    analytics.track('form_submitted', { form_id: formId, step: step ?? null });
    recordInteraction('form_completed', formId);
  }, [formId]);

  const success = useCallback((props: Record<string, string | number | boolean | null> = {}) => {
    analytics.track('form_submission_success', { form_id: formId, ...props });
  }, [formId]);

  const failure = useCallback((errorType: string, props: Record<string, string | number | boolean | null> = {}) => {
    submitted.current = false;
    analytics.track('form_submission_failed', { form_id: formId, error_type: errorType, ...props });
  }, [formId]);

  return { fieldFocused, fieldCompleted, validationError, submit, success, failure };
}
