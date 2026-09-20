import { useEffect, useState } from 'react';
import { currencyForCountry, type Currency } from '@/config/pricing';
import { detectVisitorLocation } from '@/lib/location';

const STORAGE_KEY = 'palmmitra:currency';

/**
 * Detects user currency.
 * - India  → INR  (Razorpay)
 * - Starter international markets → local currency
 * - Else   → USD
 *
 * Detection order:
 *   1. Manual override stored in localStorage (set via `setCurrency`)
 *   2. Browser timezone / locale
 *   3. Best-effort network country lookup
 *   4. Fallback → USD
 *
 * The hook returns `{ currency, setCurrency, isIndia }` so any component
 * can later expose a manual switcher without refactoring.
 */
export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>(() => detectInitialCurrency());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, currency); } catch { /* ignore */ }
  }, [currency]);

  useEffect(() => {
    if (hasManualCurrency()) return;
    void detectVisitorLocation().then((location) => {
      setCurrencyState(currencyForCountry(location.countryCode));
    });
  }, []);

  const setCurrency = (c: Currency) => setCurrencyState(c);

  return { currency, setCurrency, isIndia: currency === 'INR' };
}

function detectInitialCurrency(): Currency {
  if (typeof window === 'undefined') return 'INR';

  // 1) Manual override
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (['INR', 'USD', 'GBP', 'AED', 'CAD', 'AUD', 'SGD'].includes(stored)) return stored as Currency;
  } catch { /* ignore */ }

  // 2) Timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/Asia\/(Kolkata|Calcutta)/i.test(tz)) return 'INR';
  } catch { /* ignore */ }

  // 3) Locale region
  try {
    const locale = navigator.language || '';
    if (/-IN$/i.test(locale)) return 'INR';
  } catch { /* ignore */ }

  // 4) Fallback
  return 'USD';
}

function hasManualCurrency(): boolean {
  try { return Boolean(localStorage.getItem(STORAGE_KEY)); } catch { return false; }
}
