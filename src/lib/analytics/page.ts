/**
 * Page lifecycle tracking: view, wall-clock time, ACTIVE time,
 * scroll depth milestones and exit (with reason).
 *
 * Active time definition:
 *   time accumulated only while document.visibilityState === 'visible'.
 *   Hidden tabs pause the counter; returning resumes it.
 */

import { analytics, getLastInteraction, resetInteraction, setPageContext, recordInteraction } from './core';
import { bumpPageIndex, getSession, getSessionDurationSeconds, getFirstTouch, touchSession } from './context';
import type { ExitType } from './events';

const SCROLL_MILESTONES = [25, 50, 75, 90, 100] as const;

interface PageState {
  path: string;
  url: string;
  title: string;
  previousPage: string | null;
  enteredAt: number;
  activeMs: number;
  lastVisibleAt: number | null;
  maxScroll: number;
  firedMilestones: Set<number>;
  pageIndex: number;
  exited: boolean;
  firedSections: Set<string>;
}

let page: PageState | null = null;
let lastPath: string | null = null;
let listenersBound = false;

/* ------------------------------- active time ------------------------------ */

function pauseActive() {
  if (!page || page.lastVisibleAt === null) return;
  page.activeMs += Date.now() - page.lastVisibleAt;
  page.lastVisibleAt = null;
}

function resumeActive() {
  if (!page || page.lastVisibleAt !== null) return;
  page.lastVisibleAt = Date.now();
}

function activeSeconds(): number {
  if (!page) return 0;
  const live = page.lastVisibleAt !== null ? Date.now() - page.lastVisibleAt : 0;
  return Math.round((page.activeMs + live) / 1000);
}

function wallClockSeconds(): number {
  if (!page) return 0;
  return Math.round((Date.now() - page.enteredAt) / 1000);
}

/* --------------------------------- scroll --------------------------------- */

function scrollPercent(): number {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 100;
  return Math.min(100, Math.round(((window.scrollY || doc.scrollTop) / scrollable) * 100));
}

let scrollRaf = 0;
function onScroll() {
  if (!page || scrollRaf) return;
  scrollRaf = window.requestAnimationFrame(() => {
    scrollRaf = 0;
    if (!page) return;
    const pct = scrollPercent();
    if (pct > page.maxScroll) page.maxScroll = pct;
    for (const m of SCROLL_MILESTONES) {
      if (pct >= m && !page.firedMilestones.has(m)) {
        page.firedMilestones.add(m);
        analytics.track('scroll_depth_reached', { depth_percent: m, page_path: page.path });
      }
    }
  });
}

/* ------------------------------ section views ----------------------------- */

export function markSectionViewed(sectionId: string, extra: Record<string, string | number> = {}) {
  if (!page || page.firedSections.has(sectionId)) return;
  page.firedSections.add(sectionId);
  const timeToSection = Math.round((Date.now() - page.enteredAt) / 1000);
  analytics.track('section_viewed', {
    section_id: sectionId,
    page_path: page.path,
    time_to_section_seconds: timeToSection,
    ...extra,
  });
  recordInteraction('section_viewed', sectionId);
}

/* ---------------------------------- exit ---------------------------------- */

export function endPage(exitType: ExitType) {
  if (!page || page.exited) return;
  page.exited = true;
  pauseActive();
  const last = getLastInteraction();
  const session = getSession();
  analytics.trackImmediate('page_exit', {
    page_path: page.path,
    page_url: page.url,
    page_title: page.title,
    previous_page: page.previousPage,
    time_on_page_seconds: wallClockSeconds(),
    active_time_on_page_seconds: activeSeconds(),
    max_scroll_depth_percent: page.maxScroll,
    last_interaction_type: last.type,
    last_interaction_element: last.element,
    last_interaction_timestamp: last.timestamp,
    session_duration_seconds: getSessionDurationSeconds(),
    pages_in_session: session.page_index,
    page_entered_at: new Date(page.enteredAt).toISOString(),
    page_exited_at: new Date().toISOString(),
    exit_type: exitType,
  });
}

/* --------------------------------- entry ---------------------------------- */

export function startPage(path: string, title: string) {
  // Guard against duplicate page views (hydration / double effects)
  if (page && !page.exited && page.path === path) return;
  if (page && !page.exited) endPage('internal_navigation');

  const previousPage = lastPath;
  const pageIndex = bumpPageIndex(previousPage);
  setPageContext(title, previousPage);

  page = {
    path,
    url: window.location.href.split('#')[0],
    title,
    previousPage,
    enteredAt: Date.now(),
    activeMs: 0,
    lastVisibleAt: document.visibilityState === 'visible' ? Date.now() : null,
    maxScroll: scrollPercent(),
    firedMilestones: new Set(),
    firedSections: new Set(),
    pageIndex,
    exited: false,
  };
  lastPath = path;
  resetInteraction();
  touchSession();

  analytics.page({
    page_path: path,
    page_url: page.url,
    page_title: title,
    previous_page: previousPage,
    landing_page: getFirstTouch().landing_page,
    page_index_in_session: pageIndex,
  });

  if (previousPage && previousPage !== path) {
    analytics.track('navigation', {
      from_page: previousPage,
      to_page: path,
      navigation_method: 'spa_route_change',
    });
  }

  bindLifecycle();
}

function bindLifecycle() {
  if (listenersBound) return;
  listenersBound = true;

  window.addEventListener('scroll', onScroll, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      pauseActive();
      endPage('tab_hidden');
    } else {
      // Returning to a page we already "exited" → start a fresh measurement window.
      if (page?.exited) startPageAfterReturn();
      else resumeActive();
    }
  });

  window.addEventListener('pagehide', (e) => {
    endPage(e.persisted ? 'pagehide' : 'browser_close');
  });
}

function startPageAfterReturn() {
  const path = window.location.pathname;
  const title = document.title;
  page = null;
  lastPath = path;
  startPage(path, title);
}

export function getCurrentPageStats() {
  if (!page) return null;
  return {
    page_path: page.path,
    time_on_page_seconds: wallClockSeconds(),
    active_time_on_page_seconds: activeSeconds(),
    max_scroll_depth_percent: page.maxScroll,
  };
}
