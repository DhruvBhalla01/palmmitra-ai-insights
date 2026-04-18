-- Rate limiting table for edge function abuse prevention
-- Tracks requests per IP per endpoint per 1-hour window
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON api_rate_limits (identifier, endpoint, created_at);

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
-- Edge functions use the service role key and bypass RLS.
-- No public policies are intentionally defined.
