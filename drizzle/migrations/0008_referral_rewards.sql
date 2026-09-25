CREATE TABLE public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sharer_report_id uuid NOT NULL REFERENCES public.palm_reports(id) ON DELETE CASCADE,
  new_report_id uuid NOT NULL REFERENCES public.palm_reports(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (new_report_id)
);

GRANT ALL ON public.referral_rewards TO service_role;

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;