ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_plan_type_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_plan_type_check CHECK (plan_type IN ('report99', 'monthly299', 'palmmatch149', 'unlimited999'));

ALTER TABLE public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_check;
ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_plan_check CHECK (plan IN ('monthly299', 'unlimited999'));

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS palmmatch_report_id TEXT;
CREATE INDEX IF NOT EXISTS idx_payments_palmmatch_report_id ON public.payments(palmmatch_report_id);