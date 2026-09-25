CREATE TABLE public.checkout_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL UNIQUE REFERENCES public.payments(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  report_id uuid,
  plan_type text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'sending',
  error text,
  sent_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.checkout_reminders TO service_role;
ALTER TABLE public.checkout_reminders ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX checkout_reminders_email_report_idx ON public.checkout_reminders (lower(user_email), report_id);
CREATE INDEX checkout_reminders_sent_at_idx ON public.checkout_reminders (sent_at DESC);

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'checkout-reminders-hourly',
  '0 * * * *',
  $$ SELECT net.http_post(
       url := 'https://wattznplwrigmjrottdy.supabase.co/functions/v1/checkout-reminders',
       headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdHR6bnBsd3JpZ21qcm90dGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDY1MDMsImV4cCI6MjA4NTI4MjUwM30.VrEVt0YlUeXBrxK92TbTV031Ta1cwtouv1YwMNajeDc"}'::jsonb,
       body := '{}'::jsonb
     ); $$
);