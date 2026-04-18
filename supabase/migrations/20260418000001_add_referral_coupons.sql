-- Referral/promo coupon codes
CREATE TABLE IF NOT EXISTS referral_codes (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percent')),
  discount_value INTEGER NOT NULL,  -- paise for flat; 0-100 for percent
  max_uses INTEGER DEFAULT NULL,    -- NULL = unlimited
  uses_count INTEGER NOT NULL DEFAULT 0,
  valid_until TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
-- No public read — codes are validated server-side only via service role

-- Seed two launch codes
INSERT INTO referral_codes (code, discount_type, discount_value, max_uses) VALUES
  ('PALMFRIEND', 'flat', 5000, 5000),   -- ₹50 off, up to 5000 uses
  ('FIRST50',    'percent', 50,  200)   -- 50% off, first 200 uses
ON CONFLICT (code) DO NOTHING;

-- Extend payments table to track applied coupons + final amounts
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount INTEGER NOT NULL DEFAULT 0;
