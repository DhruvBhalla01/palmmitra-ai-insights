ALTER TABLE public.palm_reports
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'english',
  ADD COLUMN IF NOT EXISTS country_code TEXT NULL,
  ADD COLUMN IF NOT EXISTS country_name TEXT NULL;

ALTER TABLE public.palm_reports
  ADD CONSTRAINT palm_reports_language_allowed
  CHECK (language IN ('english', 'hinglish')) NOT VALID;

ALTER TABLE public.palm_reports
  ADD CONSTRAINT palm_reports_country_code_format
  CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$') NOT VALID;

ALTER TABLE public.palm_reports
  ADD CONSTRAINT palm_reports_country_name_length
  CHECK (country_name IS NULL OR char_length(country_name) <= 80) NOT VALID;