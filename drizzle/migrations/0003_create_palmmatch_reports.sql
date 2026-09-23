CREATE TABLE IF NOT EXISTS public.palmmatch_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id TEXT UNIQUE NOT NULL,
  person1_name TEXT NOT NULL,
  person1_age INTEGER,
  person2_name TEXT NOT NULL,
  person2_age INTEGER,
  relationship_type TEXT NOT NULL,
  email TEXT NOT NULL,
  overall_score INTEGER NOT NULL DEFAULT 75,
  reading JSONB NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.palmmatch_reports TO service_role;
CREATE INDEX IF NOT EXISTS idx_palmmatch_reports_email ON public.palmmatch_reports(email);
ALTER TABLE public.palmmatch_reports ENABLE ROW LEVEL SECURITY;