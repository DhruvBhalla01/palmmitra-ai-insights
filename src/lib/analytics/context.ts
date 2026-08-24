/**
 * Identity, session and attribution context.
 * All values are first-party, stored in localStorage/sessionStorage.
 * No IP-based identity, no PII beyond an optional hashed-free email tag.
 */

const LS = {
  anonymousId: 'pm_anon_id',
  firstSeen: 'pm_first_seen',
  lastSeen: 'pm_last_seen',
  sessionNumber: 'pm_session_number',
  firstTouch: 'pm_first_touch',
  latestTouch: 'pm_latest_touch',
  session: 'pm_session',
} as const;

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

export interface TouchAttribution {
  landing_page: string;
  landing_path: string;
  landing_timestamp: string;
  referrer: string;
  referrer_domain: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  fbclid: string | null;
}

interface SessionState {
  session_id: string;
  started_at: number;
  last_activity_at: number;
  page_index: number;
  previous_page: string | null;
  session_number: number;
  ended: boolean;
}

/* ------------------------------ storage safe ------------------------------ */

function read(store: Storage | null, key: string): string | null {
  try { return store?.getItem(key) ?? null; } catch { return null; }
}
function write(store: Storage | null, key: string, value: string) {
  try { store?.setItem(key, value); } catch { /* storage blocked */ }
}
const ls = () => { try { return window.localStorage; } catch { return null; } };
const ss = () => { try { return window.sessionStorage; } catch { return null; } };

export function uuid(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch { /* fallthrough */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/* ------------------------------- anonymous -------------------------------- */

let visitorStatus: 'new_visitor' | 'returning_visitor' = 'returning_visitor';

export function getAnonymousId(): string {
  const store = ls();
  let id = read(store, LS.anonymousId);
  if (!id) {
    id = uuid();
    write(store, LS.anonymousId, id);
    write(store, LS.firstSeen, new Date().toISOString());
    visitorStatus = 'new_visitor';
  }
  return id;
}

export function getVisitorStatus() { return visitorStatus; }

export function getFirstSeen(): string {
  return read(ls(), LS.firstSeen) ?? new Date().toISOString();
}

function daysBetween(a: number, b: number) {
  return Math.max(0, Math.floor((a - b) / 86_400_000));
}

export function getVisitorMetrics() {
  const store = ls();
  const firstSeen = Date.parse(getFirstSeen());
  const lastSeenRaw = read(store, LS.lastSeen);
  const now = Date.now();
  return {
    session_number: getSession().session_number,
    days_since_first_visit: Number.isFinite(firstSeen) ? daysBetween(now, firstSeen) : 0,
    days_since_previous_session: lastSeenRaw ? daysBetween(now, Date.parse(lastSeenRaw)) : 0,
  };
}

/* ------------------------------ attribution ------------------------------- */

function domainOf(url: string): string {
  try { return url ? new URL(url).hostname : ''; } catch { return ''; }
}

function buildTouch(): TouchAttribution {
  const params = new URLSearchParams(window.location.search);
  const p = (k: string) => params.get(k) || null;
  return {
    landing_page: window.location.href.split('#')[0],
    landing_path: window.location.pathname,
    landing_timestamp: new Date().toISOString(),
    referrer: document.referrer || '',
    referrer_domain: domainOf(document.referrer || ''),
    utm_source: p('utm_source'),
    utm_medium: p('utm_medium'),
    utm_campaign: p('utm_campaign'),
    utm_term: p('utm_term'),
    utm_content: p('utm_content'),
    gclid: p('gclid'),
    fbclid: p('fbclid'),
  };
}

function hasCampaignSignal(t: TouchAttribution) {
  return Boolean(
    t.utm_source || t.utm_medium || t.utm_campaign || t.gclid || t.fbclid ||
    (t.referrer_domain && t.referrer_domain !== window.location.hostname),
  );
}

let firstTouch: TouchAttribution | null = null;
let latestTouch: TouchAttribution | null = null;

/** Called once on boot. First-touch is never overwritten. */
export function initAttribution() {
  const store = ls();
  const current = buildTouch();

  const storedFirst = read(store, LS.firstTouch);
  if (storedFirst) {
    try { firstTouch = JSON.parse(storedFirst); } catch { firstTouch = null; }
  }
  if (!firstTouch) {
    firstTouch = current;
    write(store, LS.firstTouch, JSON.stringify(current));
  }

  const storedLatest = read(store, LS.latestTouch);
  if (storedLatest) {
    try { latestTouch = JSON.parse(storedLatest); } catch { latestTouch = null; }
  }
  // Latest-touch only updates on a genuine new acquisition signal
  // (campaign params or an external referrer) — never on internal navigation.
  if (!latestTouch || hasCampaignSignal(current)) {
    latestTouch = current;
    write(store, LS.latestTouch, JSON.stringify(current));
  }
}

export function getFirstTouch(): TouchAttribution { return firstTouch ?? buildTouch(); }
export function getLatestTouch(): TouchAttribution { return latestTouch ?? getFirstTouch(); }

/* -------------------------------- session --------------------------------- */

let sessionState: SessionState | null = null;
let onNewSession: ((s: SessionState, previous: SessionState | null) => void) | null = null;

export function setSessionListener(fn: typeof onNewSession) { onNewSession = fn; }

function loadSession(): SessionState | null {
  const raw = read(ls(), LS.session);
  if (!raw) return null;
  try { return JSON.parse(raw) as SessionState; } catch { return null; }
}

function persistSession(s: SessionState) {
  write(ls(), LS.session, JSON.stringify(s));
}

function newSession(previous: SessionState | null): SessionState {
  const store = ls();
  const num = Number(read(store, LS.sessionNumber) ?? '0') + 1;
  write(store, LS.sessionNumber, String(num));
  const now = Date.now();
  const s: SessionState = {
    session_id: uuid(),
    started_at: now,
    last_activity_at: now,
    page_index: 0,
    previous_page: null,
    session_number: num,
    ended: false,
  };
  persistSession(s);
  return s;
}

/** Returns the live session, rotating it after 30 min of inactivity. */
export function getSession(): SessionState {
  const now = Date.now();
  if (!sessionState) {
    const stored = loadSession();
    if (stored && now - stored.last_activity_at < SESSION_TIMEOUT_MS && !stored.ended) {
      sessionState = stored;
    } else {
      const rotated = newSession(stored);
      sessionState = rotated;
      onNewSession?.(rotated, stored);
    }
  } else if (now - sessionState.last_activity_at >= SESSION_TIMEOUT_MS) {
    const previous = sessionState;
    const rotated = newSession(previous);
    sessionState = rotated;
    onNewSession?.(rotated, previous);
  }
  return sessionState;
}

export function touchSession() {
  const s = getSession();
  s.last_activity_at = Date.now();
  persistSession(s);
  write(ls(), LS.lastSeen, new Date().toISOString());
}

export function bumpPageIndex(previousPage: string | null): number {
  const s = getSession();
  s.page_index += 1;
  s.previous_page = previousPage;
  persistSession(s);
  return s.page_index;
}

export function getSessionDurationSeconds(): number {
  const s = getSession();
  return Math.round((Date.now() - s.started_at) / 1000);
}

export function endSession() {
  const s = getSession();
  s.ended = true;
  persistSession(s);
}

/* ------------------------------ user identity ----------------------------- */

let userId: string | null = null;
let userEmail: string | null = null;

export function setUser(id: string | null, email?: string | null) {
  userId = id;
  if (email !== undefined) userEmail = email;
}
export function getUserId() { return userId; }
export function getUserEmail() { return userEmail; }

/* --------------------------------- device --------------------------------- */

function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet';
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return 'mobile';
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\//.test(ua)) return 'Opera';
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  return 'Other';
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Win/i.test(ua)) return 'Windows';
  if (/Mac/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}

export function getDeviceContext() {
  return {
    device_type: detectDeviceType(),
    browser: detectBrowser(),
    os: detectOS(),
    screen_width: window.screen?.width ?? null,
    screen_height: window.screen?.height ?? null,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    language: navigator.language,
    timezone: (() => {
      try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return null; }
    })(),
  };
}

/* ------------------------------- environment ------------------------------ */

export function getEnvironment(): 'development' | 'staging' | 'production' {
  if (import.meta.env.DEV) return 'development';
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return 'development';
  if (host.includes('id-preview') || host.includes('lovableproject.com') || host.includes('sandbox')) return 'staging';
  return 'production';
}

export const SESSION_TIMEOUT = SESSION_TIMEOUT_MS;
