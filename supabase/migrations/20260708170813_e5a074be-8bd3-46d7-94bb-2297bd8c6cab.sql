-- Replace partial unique index on ai_entitlements.report_id with a full UNIQUE
-- constraint so ON CONFLICT (report_id) works in RPCs and payment upserts.
-- Also backfill an entitlement row for any report that was silently missed.

DROP INDEX IF EXISTS public.ai_entitlements_report_id_uniq;

-- Deduplicate any accidental duplicate report_id rows (keep newest).
DELETE FROM public.ai_entitlements a
USING public.ai_entitlements b
WHERE a.report_id IS NOT NULL
  AND a.report_id = b.report_id
  AND a.updated_at < b.updated_at;

ALTER TABLE public.ai_entitlements
  ADD CONSTRAINT ai_entitlements_report_id_key UNIQUE (report_id);

-- Backfill: for every successful ai_pack_* payment, ensure entitlement exists
-- with the correct pack balance credited (idempotent by looking at existing row).
INSERT INTO public.ai_entitlements (report_id, pack_questions_remaining)
SELECT p.report_id,
       SUM(CASE p.plan_type
             WHEN 'ai_pack_5' THEN 5
             WHEN 'ai_pack_10' THEN 10
             WHEN 'ai_pack_15' THEN 15
             ELSE 0 END)::int
FROM public.payments p
WHERE p.status = 'success'
  AND p.plan_type LIKE 'ai_pack_%'
  AND p.report_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.ai_entitlements e WHERE e.report_id = p.report_id)
GROUP BY p.report_id;
