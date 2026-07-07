
CREATE TABLE public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX api_rate_limits_lookup_idx
  ON public.api_rate_limits (identifier, endpoint, created_at DESC);
GRANT ALL ON public.api_rate_limits TO service_role;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: fully locked from anon/authenticated; only service_role bypasses RLS.
