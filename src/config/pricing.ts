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

export type Currency = 'INR' | 'USD';

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
      INR: { minor: 14900, major: 149,  display: '₹149'   },
      USD: { minor:   999, major: 9.99, display: '$9.99'  },
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
      USD: { minor:  2499, major: 24.99, display: '$24.99' },
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
      USD: { minor:  14900, major: 149,  display: '$149'   },
    },
  },
} as const satisfies Record<string, ProductPricing>;

export type ProductKey = keyof typeof PRODUCTS;

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

/** Razorpay amount (paise) — INR only */
export function razorpayAmount(planId: PlanId): number {
  const product = getProductByPlanId(planId);
  return product?.prices.INR.minor ?? 0;
}

/** Stripe-compatible amount (cents) — USD */
export function stripeAmount(planId: PlanId): number {
  const product = getProductByPlanId(planId);
  return product?.prices.USD.minor ?? 0;
}

/* ------------------------------------------------------------------ */
/*  Coupons                                                           */
/* ------------------------------------------------------------------ */

export const COUPONS = {
  PALMFRIEND: { discountDisplay: { INR: '₹50', USD: '$1' } },
} as const;
