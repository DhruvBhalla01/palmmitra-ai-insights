
ALTER TABLE public.payments DROP COLUMN IF EXISTS coupon_code;
ALTER TABLE public.payments DROP COLUMN IF EXISTS discount_amount;
DROP TABLE IF EXISTS public.referral_codes CASCADE;
