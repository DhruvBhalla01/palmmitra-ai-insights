ALTER TABLE public.checkout_reminders
  ADD COLUMN IF NOT EXISTS palmmatch_report_id text;

CREATE INDEX IF NOT EXISTS checkout_reminders_email_report_idx
  ON public.checkout_reminders (user_email, report_id);
CREATE INDEX IF NOT EXISTS checkout_reminders_email_palmmatch_idx
  ON public.checkout_reminders (user_email, palmmatch_report_id);