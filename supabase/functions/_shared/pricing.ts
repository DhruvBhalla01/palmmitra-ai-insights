export type PaymentCurrency = 'INR' | 'USD' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'SGD';
export type PaymentPlan = 'report99' | 'palmmatch149' | 'monthly299' | 'unlimited999';

const CURRENCY_BY_COUNTRY: Record<string, PaymentCurrency> = {
  IN: 'INR', US: 'USD', GB: 'GBP', AE: 'AED', CA: 'CAD', AU: 'AUD', SG: 'SGD',
};

const PLAN_AMOUNTS: Record<PaymentPlan, Record<PaymentCurrency, number>> = {
  report99: { INR: 29900, USD: 999, GBP: 799, AED: 3900, CAD: 1400, AUD: 1500, SGD: 1400 },
  palmmatch149: { INR: 99900, USD: 2499, GBP: 1999, AED: 9900, CAD: 3400, AUD: 3900, SGD: 3400 },
  monthly299: { INR: 29900, USD: 999, GBP: 799, AED: 3900, CAD: 1400, AUD: 1500, SGD: 1400 },
  unlimited999: { INR: 499900, USD: 14900, GBP: 11900, AED: 54900, CAD: 19900, AUD: 21900, SGD: 19900 },
};

export function currencyForCountry(countryCode?: string): PaymentCurrency {
  return CURRENCY_BY_COUNTRY[countryCode?.toUpperCase() ?? ''] ?? 'USD';
}

export function amountForPlan(plan: PaymentPlan, currency: PaymentCurrency): number {
  return PLAN_AMOUNTS[plan][currency];
}
