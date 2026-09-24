ALTER TABLE public.palmmatch_reports
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'english';

ALTER TABLE public.palmmatch_reports
  DROP CONSTRAINT IF EXISTS palmmatch_reports_language_check;

ALTER TABLE public.palmmatch_reports
  ADD CONSTRAINT palmmatch_reports_language_check
  CHECK (language IN ('english', 'hinglish'));

COMMENT ON COLUMN public.palmmatch_reports.language IS 'Customer-selected report language: English or Roman-script Hinglish.';