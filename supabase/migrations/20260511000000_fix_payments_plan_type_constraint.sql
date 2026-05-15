-- Fix: payments.plan_type CHECK constraint was missing 'monthly299' and 'palmmatch149'
-- causing all subscription and PalmMatch payments to fail with a DB constraint violation.

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_plan_type_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_plan_type_check
    CHECK (plan_type IN ('report99', 'monthly299', 'palmmatch149', 'unlimited999'));

-- Also fix user_subscriptions.plan to accept monthly299 (was limited to unlimited999)
ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_plan_check;

ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_plan_check
    CHECK (plan IN ('monthly299', 'unlimited999'));
