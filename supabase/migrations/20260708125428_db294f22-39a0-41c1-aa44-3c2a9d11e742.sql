-- Update payments.plan_type check constraint to match new PalmMitra AI pack lineup.
-- Removes ai_pack_30 and ai_pack_100 (never sold); adds ai_pack_5 and ai_pack_15.
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_plan_type_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_plan_type_check CHECK (
  plan_type IN (
    'report99','monthly299','palmmatch149','unlimited999',
    'ai_elite_monthly','ai_elite_annual',
    'ai_pack_5','ai_pack_10','ai_pack_15'
  )
);

-- Refresh the runtime pricing config so any admin UI / edge lookup reflects the new lineup
UPDATE public.ai_pricing_config
SET value = '[{"id":"ai_pack_5","questions":5,"price_inr":149},{"id":"ai_pack_10","questions":10,"price_inr":249},{"id":"ai_pack_15","questions":15,"price_inr":349}]'::jsonb
WHERE key = 'question_packs';