ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR';

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_currency_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_currency_check
  CHECK (currency IN ('INR', 'USD', 'GBP', 'AED', 'CAD', 'AUD', 'SGD'));
