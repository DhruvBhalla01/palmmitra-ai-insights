
-- =========================================================
-- PalmMitra AI: conversations, wallet, usage, config
-- =========================================================

-- Reusable updated_at trigger (idempotent)
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ---------------------------------------------------------
-- 1. ai_conversations (one per user per report)
-- ---------------------------------------------------------
CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id uuid NOT NULL REFERENCES public.palm_reports(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'My PalmMitra AI',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  message_count int NOT NULL DEFAULT 0,
  total_input_tokens int NOT NULL DEFAULT 0,
  total_output_tokens int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, report_id)
);
GRANT SELECT ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_conversations_select" ON public.ai_conversations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER tg_ai_conversations_updated
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------------------------------------------------------
-- 2. ai_messages
-- ---------------------------------------------------------
CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  input_tokens int NOT NULL DEFAULT 0,
  output_tokens int NOT NULL DEFAULT 0,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_messages_conv_created_idx
  ON public.ai_messages (conversation_id, created_at);
GRANT SELECT ON public.ai_messages TO authenticated;
GRANT ALL ON public.ai_messages TO service_role;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_messages_select" ON public.ai_messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- 3. ai_entitlements (wallet)
-- ---------------------------------------------------------
CREATE TABLE public.ai_entitlements (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  free_questions_remaining int NOT NULL DEFAULT 0 CHECK (free_questions_remaining >= 0),
  pack_questions_remaining int NOT NULL DEFAULT 0 CHECK (pack_questions_remaining >= 0),
  subscription_plan text CHECK (subscription_plan IN ('ai_elite_monthly','ai_elite_annual')),
  subscription_expires_at timestamptz,
  subscription_month_usage int NOT NULL DEFAULT 0 CHECK (subscription_month_usage >= 0),
  subscription_month_reset_at timestamptz,
  granted_report_ids uuid[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_entitlements TO authenticated;
GRANT ALL ON public.ai_entitlements TO service_role;
ALTER TABLE public.ai_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_entitlement_select" ON public.ai_entitlements
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER tg_ai_entitlements_updated
  BEFORE UPDATE ON public.ai_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------------------------------------------------------
-- 4. ai_usage_events (audit)
-- ---------------------------------------------------------
CREATE TABLE public.ai_usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conversation_id uuid,
  message_id uuid,
  source text NOT NULL CHECK (source IN ('free','pack','subscription','refund')),
  input_tokens int NOT NULL DEFAULT 0,
  output_tokens int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_usage_events_user_idx ON public.ai_usage_events(user_id, created_at DESC);
GRANT SELECT ON public.ai_usage_events TO authenticated;
GRANT ALL ON public.ai_usage_events TO service_role;
ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_usage_select" ON public.ai_usage_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ---------------------------------------------------------
-- 5. ai_pricing_config (admin editable)
-- ---------------------------------------------------------
CREATE TABLE public.ai_pricing_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_pricing_config TO authenticated, anon;
GRANT ALL ON public.ai_pricing_config TO service_role;
ALTER TABLE public.ai_pricing_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_pricing" ON public.ai_pricing_config
  FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER tg_ai_pricing_config_updated
  BEFORE UPDATE ON public.ai_pricing_config
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.ai_pricing_config(key, value) VALUES
  ('free_questions_per_report', '3'::jsonb),
  ('subscription_monthly',      '{"id":"ai_elite_monthly","price_inr":799,"quota":200,"period_days":30}'::jsonb),
  ('subscription_annual',       '{"id":"ai_elite_annual","price_inr":5999,"quota":200,"period_days":365,"badge":"Best Value","savings_inr":3589}'::jsonb),
  ('question_packs',            '[{"id":"ai_pack_10","questions":10,"price_inr":149},{"id":"ai_pack_30","questions":30,"price_inr":349},{"id":"ai_pack_100","questions":100,"price_inr":799}]'::jsonb),
  ('model',                     '"gpt-4o-mini"'::jsonb),
  ('rate_limit_per_min',        '10'::jsonb),
  ('history_window',            '20'::jsonb),
  ('max_message_chars',         '2000'::jsonb);

-- ---------------------------------------------------------
-- 6. Atomic quota debit (free → subscription → pack)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.debit_ai_question(_user_id uuid)
RETURNS TABLE(source text, ok boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ent public.ai_entitlements%ROWTYPE;
  sub jsonb;
  monthly_quota int;
BEGIN
  -- Lock row, insert default if missing
  INSERT INTO public.ai_entitlements(user_id) VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO ent FROM public.ai_entitlements
    WHERE user_id = _user_id FOR UPDATE;

  -- Reset monthly counter if window elapsed
  IF ent.subscription_expires_at IS NOT NULL
     AND ent.subscription_expires_at > now()
     AND (ent.subscription_month_reset_at IS NULL OR ent.subscription_month_reset_at < now()) THEN
    UPDATE public.ai_entitlements
      SET subscription_month_usage = 0,
          subscription_month_reset_at = now() + interval '30 days'
      WHERE user_id = _user_id
      RETURNING * INTO ent;
  END IF;

  -- 1) Free questions first
  IF ent.free_questions_remaining > 0 THEN
    UPDATE public.ai_entitlements
      SET free_questions_remaining = free_questions_remaining - 1
      WHERE user_id = _user_id;
    RETURN QUERY SELECT 'free'::text, true; RETURN;
  END IF;

  -- 2) Active subscription with remaining monthly quota
  IF ent.subscription_expires_at IS NOT NULL AND ent.subscription_expires_at > now() THEN
    SELECT value INTO sub FROM public.ai_pricing_config
      WHERE key = CASE ent.subscription_plan
        WHEN 'ai_elite_annual' THEN 'subscription_annual'
        ELSE 'subscription_monthly' END;
    monthly_quota := COALESCE((sub->>'quota')::int, 200);
    IF ent.subscription_month_usage < monthly_quota THEN
      UPDATE public.ai_entitlements
        SET subscription_month_usage = subscription_month_usage + 1
        WHERE user_id = _user_id;
      RETURN QUERY SELECT 'subscription'::text, true; RETURN;
    END IF;
  END IF;

  -- 3) Pack balance
  IF ent.pack_questions_remaining > 0 THEN
    UPDATE public.ai_entitlements
      SET pack_questions_remaining = pack_questions_remaining - 1
      WHERE user_id = _user_id;
    RETURN QUERY SELECT 'pack'::text, true; RETURN;
  END IF;

  RETURN QUERY SELECT 'none'::text, false;
END; $$;

REVOKE ALL ON FUNCTION public.debit_ai_question(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.debit_ai_question(uuid) TO service_role;

-- Refund helper (called on stream failure)
CREATE OR REPLACE FUNCTION public.refund_ai_question(_user_id uuid, _source text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _source = 'free' THEN
    UPDATE public.ai_entitlements SET free_questions_remaining = free_questions_remaining + 1 WHERE user_id = _user_id;
  ELSIF _source = 'pack' THEN
    UPDATE public.ai_entitlements SET pack_questions_remaining = pack_questions_remaining + 1 WHERE user_id = _user_id;
  ELSIF _source = 'subscription' THEN
    UPDATE public.ai_entitlements SET subscription_month_usage = GREATEST(0, subscription_month_usage - 1) WHERE user_id = _user_id;
  END IF;
END; $$;
REVOKE ALL ON FUNCTION public.refund_ai_question(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refund_ai_question(uuid, text) TO service_role;

-- Grant N free questions on report unlock (idempotent by report_id)
CREATE OR REPLACE FUNCTION public.grant_report_free_questions(_user_id uuid, _report_id uuid, _n int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_entitlements(user_id) VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.ai_entitlements
    SET free_questions_remaining = free_questions_remaining + _n,
        granted_report_ids = granted_report_ids || _report_id
    WHERE user_id = _user_id
      AND NOT (_report_id = ANY(granted_report_ids));
END; $$;
REVOKE ALL ON FUNCTION public.grant_report_free_questions(uuid, uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_report_free_questions(uuid, uuid, int) TO service_role;
