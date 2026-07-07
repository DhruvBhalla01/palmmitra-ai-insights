// Keep in sync with src/config/ai-pricing.ts
export const AI_PLAN_AMOUNTS_PAISE: Record<string, number> = {
  ai_elite_monthly:  79900,
  ai_elite_annual:  599900,
  ai_pack_10:        14900,
  ai_pack_30:        34900,
  ai_pack_100:       79900,
};

export const AI_PACK_QUESTIONS: Record<string, number> = {
  ai_pack_10:  10,
  ai_pack_30:  30,
  ai_pack_100: 100,
};

export const AI_SUBSCRIPTION_DAYS: Record<string, number> = {
  ai_elite_monthly: 30,
  ai_elite_annual:  365,
};

export const AI_LABELS: Record<string, string> = {
  ai_elite_monthly: 'PalmMitra AI Elite — Monthly',
  ai_elite_annual:  'PalmMitra AI Elite — Annual',
  ai_pack_10:  '10 AI Question Pack',
  ai_pack_30:  '30 AI Question Pack',
  ai_pack_100: '100 AI Question Pack',
};

export const AI_MODEL = 'gpt-4o-mini';
export const AI_MAX_MESSAGE_CHARS = 2000;
export const AI_HISTORY_WINDOW = 20;
export const AI_RATE_LIMIT_PER_MIN = 10;
