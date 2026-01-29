-- Fix security vulnerabilities: Restrict public read access to sensitive tables
-- Data will be accessed through secure edge functions that use service role

-- Drop existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Anyone can read palm reports" ON public.palm_reports;
DROP POLICY IF EXISTS "Anyone can read payments by email" ON public.payments;
DROP POLICY IF EXISTS "Anyone can read report unlocks" ON public.report_unlocks;
DROP POLICY IF EXISTS "Anyone can read subscriptions" ON public.user_subscriptions;

-- Create restrictive SELECT policies - service role bypasses RLS
-- These block anon/authenticated direct access; data accessed via edge functions

CREATE POLICY "Data accessible via service role only"
ON public.palm_reports
FOR SELECT
USING (false);

CREATE POLICY "Data accessible via service role only"
ON public.payments
FOR SELECT
USING (false);

CREATE POLICY "Data accessible via service role only"
ON public.report_unlocks
FOR SELECT
USING (false);

CREATE POLICY "Data accessible via service role only"
ON public.user_subscriptions
FOR SELECT
USING (false);