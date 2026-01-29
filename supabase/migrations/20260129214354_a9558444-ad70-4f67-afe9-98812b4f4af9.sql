-- Create payments table for tracking all payment transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  report_id UUID REFERENCES public.palm_reports(id),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('report99', 'unlimited999')),
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report_unlocks table for tracking which reports are unlocked for which users
CREATE TABLE public.report_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  report_id UUID NOT NULL REFERENCES public.palm_reports(id),
  payment_id UUID REFERENCES public.payments(id),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_email, report_id)
);

-- Create user_subscriptions table for unlimited plan subscribers
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'unlimited999' CHECK (plan = 'unlimited999'),
  payment_id UUID REFERENCES public.payments(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Payments policies: allow public read/insert (users identified by email for now)
CREATE POLICY "Anyone can create payments"
ON public.payments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read payments by email"
ON public.payments
FOR SELECT
USING (true);

CREATE POLICY "Service can update payments"
ON public.payments
FOR UPDATE
USING (true);

-- Report unlocks policies
CREATE POLICY "Anyone can create report unlocks"
ON public.report_unlocks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read report unlocks"
ON public.report_unlocks
FOR SELECT
USING (true);

-- User subscriptions policies
CREATE POLICY "Anyone can create subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (true);

-- Create indexes for common lookups
CREATE INDEX idx_payments_user_email ON public.payments(user_email);
CREATE INDEX idx_payments_razorpay_order ON public.payments(razorpay_order_id);
CREATE INDEX idx_report_unlocks_user_email ON public.report_unlocks(user_email);
CREATE INDEX idx_report_unlocks_report_id ON public.report_unlocks(report_id);
CREATE INDEX idx_user_subscriptions_email ON public.user_subscriptions(user_email);