-- Restrict INSERT policies - data should only be written via secure edge functions
-- Service role bypasses RLS, so edge functions can still insert data

-- Drop existing overly permissive INSERT policies
DROP POLICY IF EXISTS "Anyone can create palm reports" ON public.palm_reports;
DROP POLICY IF EXISTS "Anyone can create payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can create report unlocks" ON public.report_unlocks;
DROP POLICY IF EXISTS "Anyone can create subscriptions" ON public.user_subscriptions;

-- Also drop overly permissive UPDATE policy
DROP POLICY IF EXISTS "Service can update payments" ON public.payments;

-- Create restrictive INSERT policies - blocks client access, service role bypasses
CREATE POLICY "Insert via service role only"
ON public.palm_reports
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Insert via service role only"
ON public.payments
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Insert via service role only"
ON public.report_unlocks
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Insert via service role only"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (false);

-- Create restrictive UPDATE policy for payments
CREATE POLICY "Update via service role only"
ON public.payments
FOR UPDATE
USING (false);