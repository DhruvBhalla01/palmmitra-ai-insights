import { useEffect, useState } from 'react';
import { CURRENCIES, COUNTRY_TO_CURRENCY, CURRENCY_TO_COUNTRY, type CountryCode, type Currency } from '@/config/pricing';

const STORAGE_KEY = 'palmmitra:currency';
const COUNTRY_KEY = 'palmmitra:country';
const CURRENCY_EVENT = 'palmmitra:currency-change';

/**
 * Detects user currency.
 * - India  → INR  (Razorpay)
 * - Else   → USD  (Stripe-ready)
 *
 * Detection order:
 *   1. Manual override stored in localStorage (set via `setCurrency`)
 *   2. Browser timezone (Asia/Kolkata, Asia/Calcutta) → INR
 *   3. Browser locale region (IN) → INR
 *   4. Fallback → USD
 *
 * The hook returns `{ currency, setCurrency, isIndia }` so any component
 * can later expose a manual switcher without refactoring.
 */
export function useCurrency() {
  const initial = detectInitialCurrency();
  const [currency, setCurrencyState] = useState<Currency>(initial.currency);
  const [countryCode, setCountryCode] = useState<CountryCode>(initial.countryCode);

  useEffect(() => {
    const sync = (event: Event) => {
      const detail = (event as CustomEvent<{ currency: Currency; countryCode: CountryCode }>).detail;
      if (detail) { setCurrencyState(detail.currency); setCountryCode(detail.countryCode); }
    };
    window.addEventListener(CURRENCY_EVENT, sync);
    return () => window.removeEventListener(CURRENCY_EVENT, sync);
  }, []);

  const setCurrency = (next: Currency) => {
    const nextCountry = CURRENCY_TO_COUNTRY[next];
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
      sessionStorage.setItem(COUNTRY_KEY, nextCountry);
    } catch { /* ignore */ }
    setCurrencyState(next);
    setCountryCode(nextCountry);
    window.dispatchEvent(new CustomEvent(CURRENCY_EVENT, { detail: { currency: next, countryCode: nextCountry } }));
  };

  return { currency, setCurrency, countryCode, countryName: countryNameFor(countryCode), isIndia: currency === 'INR' };
}

function detectInitialCurrency(): { currency: Currency; countryCode: CountryCode } {
  if (typeof window === 'undefined') return { currency: 'USD', countryCode: 'US' };

  // 1) Manual override
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY) as Currency | null;
    const storedCountry = sessionStorage.getItem(COUNTRY_KEY) as CountryCode | null;
    if (stored && CURRENCIES.includes(stored)) {
      return { currency: stored, countryCode: storedCountry && storedCountry in COUNTRY_TO_CURRENCY ? storedCountry : CURRENCY_TO_COUNTRY[stored] };
    }
  } catch { /* ignore */ }

  // 2) Timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const timezoneCountry: Record<string, CountryCode> = {
      'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Dubai': 'AE',
      'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Perth': 'AU',
      'Asia/Singapore': 'SG', 'Europe/London': 'GB', 'America/Toronto': 'CA',
      'America/Vancouver': 'CA', 'America/New_York': 'US', 'America/Chicago': 'US',
      'America/Denver': 'US', 'America/Los_Angeles': 'US',
    };
    const country = timezoneCountry[tz];
    if (country) return { currency: COUNTRY_TO_CURRENCY[country], countryCode: country };
  } catch { /* ignore */ }

  // 3) Locale region
  try {
    const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const locale of locales) {
      const region = locale.match(/[-_]([A-Za-z]{2})$/)?.[1]?.toUpperCase() as CountryCode | undefined;
      if (region && region in COUNTRY_TO_CURRENCY) return { currency: COUNTRY_TO_CURRENCY[region], countryCode: region };
    }
  } catch { /* ignore */ }

  // 4) Fallback
  return { currency: 'USD', countryCode: 'US' };
}

function countryNameFor(code: CountryCode): string {
  return ({ IN: 'India', US: 'United States', GB: 'United Kingdom', AE: 'United Arab Emirates', CA: 'Canada', AU: 'Australia', SG: 'Singapore' })[code];
}
