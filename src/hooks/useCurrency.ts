import { useEffect, useState } from 'react';
import type { Currency } from '@/config/pricing';

const STORAGE_KEY = 'palmmitra:currency';

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
  const [currency, setCurrencyState] = useState<Currency>(() => detectInitialCurrency());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, currency); } catch { /* ignore */ }
  }, [currency]);

  const setCurrency = (c: Currency) => setCurrencyState(c);

  return { currency, setCurrency, isIndia: currency === 'INR' };
}

function detectInitialCurrency(): Currency {
  if (typeof window === 'undefined') return 'INR';

  // 1) Manual override
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'INR' || stored === 'USD') return stored;
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
