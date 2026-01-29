-- Replace RESTRICTIVE policies with PERMISSIVE policies that block client access
-- Service role bypasses RLS entirely, so edge functions can still access data

-- Drop existing restrictive SELECT policies
DROP POLICY IF EXISTS "Data accessible via service role only" ON public.palm_reports;
DROP POLICY IF EXISTS "Data accessible via service role only" ON public.payments;
DROP POLICY IF EXISTS "Data accessible via service role only" ON public.report_unlocks;
DROP POLICY IF EXISTS "Data accessible via service role only" ON public.user_subscriptions;

-- Create PERMISSIVE SELECT policies that block all client access
-- USING (false) blocks all rows for anon/authenticated users
-- Service role bypasses RLS entirely
CREATE POLICY "Block client SELECT access"
ON public.palm_reports
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "Block client SELECT access"
ON public.payments
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "Block client SELECT access"
ON public.report_unlocks
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "Block client SELECT access"
ON public.user_subscriptions
FOR SELECT
TO anon, authenticated
USING (false);