
-- ai_entitlements: add id PK, drop user_id PK, allow null user_id, add report_id + unique
ALTER TABLE public.ai_entitlements ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.ai_entitlements DROP CONSTRAINT IF EXISTS ai_entitlements_pkey;
ALTER TABLE public.ai_entitlements ADD PRIMARY KEY (id);
ALTER TABLE public.ai_entitlements ALTER COLUMN user_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ai_entitlements_user_id_uniq ON public.ai_entitlements(user_id) WHERE user_id IS NOT NULL;
ALTER TABLE public.ai_entitlements ADD COLUMN IF NOT EXISTS report_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS ai_entitlements_report_id_uniq ON public.ai_entitlements(report_id) WHERE report_id IS NOT NULL;

-- ai_conversations
ALTER TABLE public.ai_conversations ALTER COLUMN user_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ai_conversations_report_only_uniq ON public.ai_conversations(report_id) WHERE user_id IS NULL;

-- ai_usage_events
ALTER TABLE public.ai_usage_events ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.ai_usage_events ADD COLUMN IF NOT EXISTS report_id uuid;

-- RPCs
CREATE OR REPLACE FUNCTION public.debit_ai_question_by_report(_report_id uuid)
RETURNS TABLE(source text, ok boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ent public.ai_entitlements%ROWTYPE;
  sub jsonb;
  monthly_quota int;
BEGIN
  INSERT INTO public.ai_entitlements(report_id) VALUES (_report_id)
    ON CONFLICT (report_id) DO NOTHING;
  SELECT * INTO ent FROM public.ai_entitlements WHERE report_id = _report_id FOR UPDATE;

  IF ent.subscription_expires_at IS NOT NULL
     AND ent.subscription_expires_at > now()
     AND (ent.subscription_month_reset_at IS NULL OR ent.subscription_month_reset_at < now()) THEN
    UPDATE public.ai_entitlements
      SET subscription_month_usage = 0,
          subscription_month_reset_at = now() + interval '30 days'
      WHERE report_id = _report_id
      RETURNING * INTO ent;
  END IF;

  IF ent.free_questions_remaining > 0 THEN
    UPDATE public.ai_entitlements SET free_questions_remaining = free_questions_remaining - 1
      WHERE report_id = _report_id;
    RETURN QUERY SELECT 'free'::text, true; RETURN;
  END IF;

  IF ent.subscription_expires_at IS NOT NULL AND ent.subscription_expires_at > now() THEN
    SELECT value INTO sub FROM public.ai_pricing_config
      WHERE key = CASE ent.subscription_plan
        WHEN 'ai_elite_annual' THEN 'subscription_annual'
        ELSE 'subscription_monthly' END;
    monthly_quota := COALESCE((sub->>'quota')::int, 200);
    IF ent.subscription_month_usage < monthly_quota THEN
      UPDATE public.ai_entitlements SET subscription_month_usage = subscription_month_usage + 1
        WHERE report_id = _report_id;
      RETURN QUERY SELECT 'subscription'::text, true; RETURN;
    END IF;
  END IF;

  IF ent.pack_questions_remaining > 0 THEN
    UPDATE public.ai_entitlements SET pack_questions_remaining = pack_questions_remaining - 1
      WHERE report_id = _report_id;
    RETURN QUERY SELECT 'pack'::text, true; RETURN;
  END IF;

  RETURN QUERY SELECT 'none'::text, false;
END; $$;

CREATE OR REPLACE FUNCTION public.refund_ai_question_by_report(_report_id uuid, _source text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _source = 'free' THEN
    UPDATE public.ai_entitlements SET free_questions_remaining = free_questions_remaining + 1 WHERE report_id = _report_id;
  ELSIF _source = 'pack' THEN
    UPDATE public.ai_entitlements SET pack_questions_remaining = pack_questions_remaining + 1 WHERE report_id = _report_id;
  ELSIF _source = 'subscription' THEN
    UPDATE public.ai_entitlements SET subscription_month_usage = GREATEST(0, subscription_month_usage - 1) WHERE report_id = _report_id;
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.grant_free_questions_by_report(_report_id uuid, _n integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.ai_entitlements(report_id, free_questions_remaining)
    VALUES (_report_id, _n)
    ON CONFLICT (report_id) DO NOTHING;
END; $$;
