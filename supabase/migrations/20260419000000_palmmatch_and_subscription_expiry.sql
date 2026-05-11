-- PalmMatch reports table
CREATE TABLE IF NOT EXISTS palmmatch_reports (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id        TEXT        UNIQUE NOT NULL,
  person1_name     TEXT        NOT NULL,
  person1_age      INTEGER     NOT NULL,
  person2_name     TEXT        NOT NULL,
  person2_age      INTEGER     NOT NULL,
  relationship_type TEXT       NOT NULL,
  email            TEXT        NOT NULL,
  overall_score    INTEGER     NOT NULL,
  reading          JSONB       NOT NULL,
  is_unlocked      BOOLEAN     NOT NULL DEFAULT FALSE,
  payment_id       UUID        REFERENCES payments(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_palmmatch_reports_report_id ON palmmatch_reports(report_id);
CREATE INDEX idx_palmmatch_reports_email     ON palmmatch_reports(email);

ALTER TABLE palmmatch_reports ENABLE ROW LEVEL SECURITY;

-- Block all direct client access; edge functions use service role (bypasses RLS)
CREATE POLICY "block_anon_select" ON palmmatch_reports FOR SELECT USING (false);
CREATE POLICY "block_anon_insert" ON palmmatch_reports FOR INSERT WITH CHECK (false);
CREATE POLICY "block_anon_update" ON palmmatch_reports FOR UPDATE USING (false);

-- Add 30-day expiry tracking to monthly subscriptions
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Backfill: existing active subscriptions expire 30 days from when they started
UPDATE user_subscriptions
   SET expires_at = started_at + INTERVAL '30 days'
 WHERE expires_at IS NULL AND status = 'active';
