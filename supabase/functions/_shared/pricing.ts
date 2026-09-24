export const CURRENCIES = ['INR', 'USD', 'GBP', 'AED', 'CAD', 'AUD', 'SGD'] as const;
export type Currency = typeof CURRENCIES[number];
export type PlanType = 'report99' | 'palmmatch149' | 'monthly299' | 'unlimited999';

export const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  IN: 'INR', US: 'USD', GB: 'GBP', AE: 'AED', CA: 'CAD', AU: 'AUD', SG: 'SGD',
};

export const PLAN_PRICES: Record<PlanType, Record<Currency, number>> = {
  report99: { INR: 29900, USD: 999, GBP: 799, AED: 3900, CAD: 1400, AUD: 1500, SGD: 1400 },
  palmmatch149: { INR: 99900, USD: 2499, GBP: 1999, AED: 9900, CAD: 3400, AUD: 3900, SGD: 3400 },
  monthly299: { INR: 29900, USD: 999, GBP: 799, AED: 3900, CAD: 1400, AUD: 1500, SGD: 1400 },
  unlimited999: { INR: 499900, USD: 14900, GBP: 11900, AED: 54900, CAD: 19900, AUD: 21900, SGD: 19900 },
};

export const PLAN_LABELS: Record<PlanType, string> = {
  report99: 'PalmMitra Insight — Full Palm Reading',
  palmmatch149: 'PalmMatch — Compatibility Report',
  monthly299: 'PalmMitra Monthly Plan',
  unlimited999: 'PalmMitra Elite — Lifetime Access',
};

export const PLAN_SHORT_NAMES: Record<PlanType, string> = {
  report99: 'PalmMitra Insight',
  palmmatch149: 'PalmMatch Compatibility Report',
  monthly299: 'PalmMitra Monthly Plan',
  unlimited999: 'PalmMitra Elite — Lifetime Access',
};

export const PLAN_RECEIPT_PREFIXES: Record<PlanType, string> = {
  report99: 'insight',
  palmmatch149: 'palmmatch',
  monthly299: 'monthly',
  unlimited999: 'elite',
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹', USD: '$', GBP: '£', AED: 'AED ', CAD: 'CA$', AUD: 'A$', SGD: 'S$',
};

/** Human-readable order description shown in the Razorpay dashboard. */
export function orderDescription(plan: PlanType, amount: number, currency: Currency): string {
  const major = (amount / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `${PLAN_LABELS[plan]} (${CURRENCY_SYMBOLS[currency]}${major} ${currency})`;
}

export function normalizeCountryCode(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

export function currencyForCountry(value: unknown): Currency {
  const code = normalizeCountryCode(value);
  return code ? COUNTRY_TO_CURRENCY[code] ?? 'USD' : 'USD';
}

export function isPlanType(value: unknown): value is PlanType {
  return typeof value === 'string' && value in PLAN_PRICES;
}