export type ReportLanguage = 'english' | 'hinglish';

export interface VisitorLocation {
  countryCode: string;
  countryName: string;
  source: 'network' | 'browser';
}

const FALLBACK_LOCATION: VisitorLocation = {
  countryCode: 'IN',
  countryName: 'India',
  source: 'browser',
};

function browserLocation(): VisitorLocation {
  if (typeof window === 'undefined') return FALLBACK_LOCATION;
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const locale = navigator.language || '';
    if (/Asia\/(Kolkata|Calcutta)/i.test(timeZone) || /[-_]IN$/i.test(locale)) {
      return FALLBACK_LOCATION;
    }
    const region = locale.match(/[-_]([A-Z]{2})$/i)?.[1]?.toUpperCase();
    return region
      ? { countryCode: region, countryName: region, source: 'browser' }
      : FALLBACK_LOCATION;
  } catch {
    return FALLBACK_LOCATION;
  }
}

export async function detectVisitorLocation(): Promise<VisitorLocation> {
  const fallback = browserLocation();
  if (typeof window === 'undefined') return fallback;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? window.setTimeout(() => controller.abort(), 2500) : null;

  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: { Accept: 'application/json' },
      signal: controller?.signal,
    });
    if (!response.ok) return fallback;
    const data = await response.json() as { country_code?: string; country_name?: string };
    if (!data.country_code || !data.country_name) return fallback;
    return {
      countryCode: data.country_code.toUpperCase(),
      countryName: data.country_name,
      source: 'network',
    };
  } catch {
    return fallback;
  } finally {
    if (timeout !== null) window.clearTimeout(timeout);
  }
}

export function defaultReportLanguage(): ReportLanguage {
  if (typeof navigator !== 'undefined' && /^hi(?:-|$)/i.test(navigator.language || '')) {
    return 'hinglish';
  }
  return 'english';
}
