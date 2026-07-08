
REVOKE EXECUTE ON FUNCTION public.debit_ai_question_by_report(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refund_ai_question_by_report(uuid, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_free_questions_by_report(uuid, integer) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.debit_ai_question_by_report(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_ai_question_by_report(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_free_questions_by_report(uuid, integer) TO service_role;
