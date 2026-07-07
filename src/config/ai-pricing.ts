/**
 * PalmMitra AI — Central pricing/config.
 * Kept in sync with supabase/functions/_shared/ai-pricing.ts
 * and seeded into public.ai_pricing_config for runtime overrides.
 */

export const AI_CONFIG = {
  FREE_QUESTIONS_PER_REPORT: 3,
  MAX_MESSAGE_CHARS: 2000,
  HISTORY_WINDOW: 20,
} as const;

export const AI_SUBSCRIPTIONS = {
  monthly: {
    id: 'ai_elite_monthly' as const,
    label: 'Monthly',
    priceInr: 799,
    priceDisplay: '₹799',
    period: '/month',
    quota: 200,
    periodDays: 30,
  },
  annual: {
    id: 'ai_elite_annual' as const,
    label: 'Annual',
    priceInr: 5999,
    priceDisplay: '₹5,999',
    period: '/year',
    quota: 200,
    periodDays: 365,
    badge: 'Best Value',
    savingsDisplay: 'Save ₹3,589',
  },
} as const;

export interface AiPack {
  id: 'ai_pack_10' | 'ai_pack_30' | 'ai_pack_100';
  label: string;
  questions: number;
  priceInr: number;
  priceDisplay: string;
  badge?: string;
}

export const AI_PACKS: readonly AiPack[] = [
  { id: 'ai_pack_10',  label: '10 Questions',  questions: 10,  priceInr: 149, priceDisplay: '₹149' },
  { id: 'ai_pack_30',  label: '30 Questions',  questions: 30,  priceInr: 349, priceDisplay: '₹349', badge: 'Popular' },
  { id: 'ai_pack_100', label: '100 Questions', questions: 100, priceInr: 799, priceDisplay: '₹799' },
] as const;

export type AiPlanId =
  | typeof AI_SUBSCRIPTIONS.monthly.id
  | typeof AI_SUBSCRIPTIONS.annual.id
  | (typeof AI_PACKS)[number]['id'];

export const AI_SUGGESTIONS = [
  { key: 'career',      label: 'Career',        seed: 'What does my palm reveal about my career path and next 3 years?' },
  { key: 'marriage',    label: 'Marriage',      seed: 'What does my palm say about marriage — timing, partner, and compatibility?' },
  { key: 'money',       label: 'Money',         seed: 'What does my palm reveal about my wealth potential and financial future?' },
  { key: 'personality', label: 'Personality',   seed: 'Describe my personality strengths and blind spots based on my palm.' },
  { key: 'family',      label: 'Family',        seed: 'What does my palm say about my family life and relationships with parents?' },
  { key: 'business',    label: 'Business',      seed: 'Am I suited for entrepreneurship? What business path fits my palm?' },
  { key: 'health',      label: 'Health',        seed: 'What health tendencies does my palm indicate and how should I prepare?' },
  { key: 'purpose',     label: 'Life Purpose',  seed: 'What is my life purpose based on my palm reading?' },
] as const;
