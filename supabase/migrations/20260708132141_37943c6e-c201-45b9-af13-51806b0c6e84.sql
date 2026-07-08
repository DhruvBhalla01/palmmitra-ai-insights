ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
UPDATE public.user_subscriptions SET expires_at = started_at + INTERVAL '30 days' WHERE expires_at IS NULL AND plan = 'monthly299';
UPDATE public.user_subscriptions SET expires_at = started_at + INTERVAL '100 years' WHERE expires_at IS NULL AND plan = 'unlimited999';
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_email_expires ON public.user_subscriptions(user_email, expires_at);