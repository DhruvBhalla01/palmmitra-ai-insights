ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR';

ALTER TABLE public.payments
  ADD CONSTRAINT payments_currency_allowed
  CHECK (currency IN ('INR', 'USD', 'GBP', 'AED', 'CAD', 'AUD', 'SGD')) NOT VALID;