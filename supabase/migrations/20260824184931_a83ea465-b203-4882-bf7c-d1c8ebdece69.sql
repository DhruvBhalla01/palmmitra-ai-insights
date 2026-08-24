CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL UNIQUE,
  event_name text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz NOT NULL DEFAULT now(),
  environment text NOT NULL DEFAULT 'production',
  source text NOT NULL DEFAULT 'client',
  anonymous_id text,
  session_id text,
  user_id uuid,
  user_email text,
  page_path text,
  page_url text,
  page_title text,
  referrer text,
  landing_page text,
  previous_page text,
  device_type text,
  browser text,
  os text,
  screen_width int,
  screen_height int,
  viewport_width int,
  viewport_height int,
  language text,
  timezone text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  first_touch jsonb NOT NULL DEFAULT '{}'::jsonb,
  latest_touch jsonb NOT NULL DEFAULT '{}'::jsonb,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb
);

GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time ON public.analytics_events (event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events (session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_anon ON public.analytics_events (anonymous_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_time ON public.analytics_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_env ON public.analytics_events (environment);

-- Where users leave: one row per page_exit event
CREATE OR REPLACE VIEW public.analytics_page_exits AS
SELECT
  e.session_id,
  e.anonymous_id,
  e.user_id,
  e.occurred_at,
  e.environment,
  e.device_type,
  e.page_path,
  e.previous_page,
  (e.properties->>'exit_type')                     AS exit_type,
  (e.properties->>'time_on_page_seconds')::numeric AS time_on_page_seconds,
  (e.properties->>'active_time_on_page_seconds')::numeric AS active_time_on_page_seconds,
  (e.properties->>'max_scroll_depth_percent')::numeric    AS max_scroll_depth_percent,
  (e.properties->>'last_interaction_type')          AS last_interaction_type,
  (e.properties->>'last_interaction_element')       AS last_interaction_element,
  (e.properties->>'session_duration_seconds')::numeric AS session_duration_seconds,
  (e.properties->>'pages_in_session')::int          AS pages_in_session,
  e.first_touch, e.latest_touch, e.landing_page
FROM public.analytics_events e
WHERE e.event_name = 'page_exit';

-- Per-page engagement summary (the "where users leave" report)
CREATE OR REPLACE VIEW public.analytics_page_report AS
WITH exits AS (
  SELECT * FROM public.analytics_page_exits
),
last_exit AS (
  SELECT DISTINCT ON (session_id) session_id, page_path
  FROM exits ORDER BY session_id, occurred_at DESC
)
SELECT
  x.page_path,
  x.device_type,
  count(*)                                         AS page_visits,
  count(DISTINCT x.session_id)                     AS sessions,
  round(avg(x.time_on_page_seconds)::numeric, 1)   AS avg_time_on_page_seconds,
  round(avg(x.active_time_on_page_seconds)::numeric, 1) AS avg_active_time_seconds,
  round((percentile_cont(0.5) WITHIN GROUP (ORDER BY x.active_time_on_page_seconds))::numeric, 1) AS median_active_time_seconds,
  round(avg(x.max_scroll_depth_percent)::numeric, 1) AS avg_scroll_depth_percent,
  count(*) FILTER (WHERE x.last_interaction_type = 'cta_clicked')::numeric
    / NULLIF(count(*), 0)                          AS cta_rate,
  count(*) FILTER (WHERE le.session_id IS NOT NULL AND le.page_path = x.page_path)::numeric
    / NULLIF(count(*), 0)                          AS exit_rate
FROM exits x
LEFT JOIN last_exit le ON le.session_id = x.session_id AND le.page_path = x.page_path
GROUP BY x.page_path, x.device_type;

-- Chronological session journey
CREATE OR REPLACE VIEW public.analytics_session_journey AS
SELECT
  session_id, anonymous_id, user_id, occurred_at, event_name, page_path,
  device_type, properties, landing_page, first_touch, latest_touch
FROM public.analytics_events
ORDER BY session_id, occurred_at;

-- Funnel counts by stage
CREATE OR REPLACE VIEW public.analytics_funnel AS
SELECT
  environment,
  date_trunc('day', occurred_at) AS day,
  device_type,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'session_started')          AS visitors,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'palm_reading_started')     AS palm_reading_started,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'palm_image_uploaded')      AS palm_image_uploaded,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'palm_analysis_completed')  AS analysis_completed,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'reading_preview_viewed')   AS preview_viewed,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'pricing_viewed')           AS pricing_viewed,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'pricing_plan_selected')    AS plan_selected,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'checkout_started')         AS checkout_started,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'checkout_payment_initiated') AS payment_initiated,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'payment_success')          AS payment_success,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'report_unlocked')          AS report_unlocked,
  count(DISTINCT session_id) FILTER (WHERE event_name = 'download_completed')       AS pdf_downloaded
FROM public.analytics_events
GROUP BY environment, day, device_type;