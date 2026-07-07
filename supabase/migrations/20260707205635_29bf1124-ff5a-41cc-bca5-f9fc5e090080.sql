
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_plan_type_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_plan_type_check
  CHECK (plan_type = ANY (ARRAY[
    'report99','monthly299','palmmatch149','unlimited999',
    'ai_elite_monthly','ai_elite_annual',
    'ai_pack_10','ai_pack_30','ai_pack_100'
  ]));

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
