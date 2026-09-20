/**
 * PalmMitra — Centralised Pricing Configuration
 * --------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH for every price across the application.
 * Update this file → all UI, PDFs, edge functions stay consistent.
 *
 * NOTE: Edge functions (Deno) cannot import from /src — they have
 * their own constants in `supabase/functions/_shared/pricing.ts`.
 * Keep that file in sync whenever you change amounts here.
 */

export type Currency = 'INR' | 'USD' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'SGD';

/** Stable internal plan identifiers (DO NOT change — DB constraints depend on these) */
export type PlanId = 'report99' | 'palmmatch149' | 'monthly299' | 'unlimited999';

export interface PriceAmount {
  /** Smallest currency unit (paise for INR, cents for USD) */
  minor: number;
  /** Human readable amount in major units */
  major: number;
  /** Pre-formatted display string e.g. "₹299" or "$9.99" */
  display: string;
}

export interface ProductPricing {
  /** Product identifier used in UI / analytics */
  id: 'insight' | 'palmmatch' | 'elite';
  /** Internal plan id used by DB + Razorpay */
  planId: PlanId;
  /** Marketing name */
  name: string;
  /** Short tagline */
  tagline: string;
  /** Pricing per currency */
  prices: Record<Currency, PriceAmount>;
  /** Tier positioning */
  tier: 'standard' | 'hero' | 'flagship';
}

/* ------------------------------------------------------------------ */
/*  PRODUCTS                                                          */
/* ------------------------------------------------------------------ */

export const PRODUCTS = {
  insight: {
    id: 'insight',
    planId: 'report99',
    name: 'PalmMitra Insight',
    tagline: 'Your complete AI destiny report',
    tier: 'standard',
    prices: {
      INR: { minor: 29900, major: 299,  display: '₹299'   },
      USD: { minor: 999, major: 9.99, display: '$9.99' },
      GBP: { minor: 799, major: 7.99, display: '£7.99' },
      AED: { minor: 3900, major: 39, display: 'AED 39' },
      CAD: { minor: 1400, major: 14, display: 'C$14' },
      AUD: { minor: 1500, major: 15, display: 'A$15' },
      SGD: { minor: 1400, major: 14, display: 'S$14' },
    },
  },
  palmmatch: {
    id: 'palmmatch',
    planId: 'palmmatch149',
    name: 'PalmMatch',
    tagline: 'Compatibility reading for you & your partner',
    tier: 'hero',
    prices: {
      INR: { minor: 99900, major: 999,   display: '₹999'   },
      USD: { minor: 2499, major: 24.99, display: '$24.99' },
      GBP: { minor: 1999, major: 19.99, display: '£19.99' },
      AED: { minor: 9900, major: 99, display: 'AED 99' },
      CAD: { minor: 3400, major: 34, display: 'C$34' },
      AUD: { minor: 3900, major: 39, display: 'A$39' },
      SGD: { minor: 3400, major: 34, display: 'S$34' },
    },
  },
  elite: {
    id: 'elite',
    planId: 'unlimited999',
    name: 'PalmMitra Elite',
    tagline: 'Lifetime access · Family readings · Priority AI',
    tier: 'flagship',
    prices: {
      INR: { minor: 499900, major: 4999, display: '₹4,999' },
      USD: { minor: 14900, major: 149, display: '$149' },
      GBP: { minor: 11900, major: 119, display: '£119' },
      AED: { minor: 54900, major: 549, display: 'AED 549' },
      CAD: { minor: 19900, major: 199, display: 'C$199' },
      AUD: { minor: 21900, major: 219, display: 'A$219' },
      SGD: { minor: 19900, major: 199, display: 'S$199' },
    },
  },
} as const satisfies Record<string, ProductPricing>;

export type ProductKey = keyof typeof PRODUCTS;

export const CURRENCY_BY_COUNTRY: Record<string, Currency> = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  AE: 'AED',
  CA: 'CAD',
  AU: 'AUD',
  SG: 'SGD',
};

export function currencyForCountry(countryCode: string | null | undefined): Currency {
  return CURRENCY_BY_COUNTRY[countryCode?.toUpperCase() ?? ''] ?? 'USD';
}

/* ------------------------------------------------------------------ */
/*  Lookups                                                           */
/* ------------------------------------------------------------------ */

/** Get a product's pricing by internal plan id (used by payment logic) */
export function getProductByPlanId(planId: PlanId): ProductPricing | undefined {
  return Object.values(PRODUCTS).find(p => p.planId === planId);
}

/** Format a price for a product in the user's currency */
export function priceFor(productKey: ProductKey, currency: Currency = 'INR'): string {
  return PRODUCTS[productKey].prices[currency].display;
}

/** Legacy INR amount helper for callers that do not yet select a country. */
export function razorpayAmount(planId: PlanId): number {
  const product = getProductByPlanId(planId);
  return product?.prices.INR.minor ?? 0;
}

/** Stripe-compatible amount (cents) — USD */
export function stripeAmount(planId: PlanId): number {
  const product = getProductByPlanId(planId);
  return product?.prices.USD.minor ?? 0;
}
