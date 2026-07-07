
REVOKE ALL ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.debit_ai_question(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_ai_question(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_report_free_questions(uuid, uuid, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tg_set_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.debit_ai_question(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_ai_question(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_report_free_questions(uuid, uuid, int) TO service_role;
