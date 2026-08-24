import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** Columns accepted from the client. Anything else is dropped. */
const ALLOWED = new Set([
  'event_id', 'event_name', 'occurred_at', 'environment', 'source',
  'anonymous_id', 'session_id', 'user_id', 'user_email',
  'page_path', 'page_url', 'page_title', 'referrer', 'landing_page', 'previous_page',
  'device_type', 'browser', 'os', 'screen_width', 'screen_height',
  'viewport_width', 'viewport_height', 'language', 'timezone',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'first_touch', 'latest_touch', 'properties',
]);

/** Never persist these keys, even if a caller sends them. */
const FORBIDDEN_PROPS = /(password|otp|cvv|card|upi_pin|pin|token|secret|apikey|api_key|authorization|signature)/i;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sanitizeProps(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out: Record<string, unknown> = {};
  let count = 0;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (count >= 60) break;
    if (FORBIDDEN_PROPS.test(k)) continue;
    if (v === null || v === undefined) { out[k] = null; count++; continue; }
    if (typeof v === 'string') { out[k] = v.slice(0, 500); count++; continue; }
    if (typeof v === 'number' || typeof v === 'boolean') { out[k] = v; count++; continue; }
  }
  return out;
}

function clampStr(v: unknown, max = 500): string | null {
  return typeof v === 'string' ? v.slice(0, max) : null;
}
function clampInt(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let payload: { events?: unknown[] };
  try {
    payload = JSON.parse(await req.text());
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const events = Array.isArray(payload.events) ? payload.events.slice(0, 50) : [];
  if (!events.length) {
    return new Response(JSON.stringify({ ok: true, inserted: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rows = events.flatMap((raw) => {
    if (!raw || typeof raw !== 'object') return [];
    const e = raw as Record<string, unknown>;
    if (typeof e.event_name !== 'string' || !e.event_name) return [];
    const row: Record<string, unknown> = {};
    for (const key of Object.keys(e)) {
      if (!ALLOWED.has(key)) continue;
      if (key === 'properties' || key === 'first_touch' || key === 'latest_touch') {
        row[key] = sanitizeProps(e[key]);
      } else if (key.endsWith('_width') || key.endsWith('_height')) {
        row[key] = clampInt(e[key]);
      } else if (key === 'user_id') {
        row[key] = typeof e[key] === 'string' && UUID_RE.test(e[key] as string) ? e[key] : null;
      } else {
        row[key] = clampStr(e[key], key === 'page_url' || key === 'landing_page' ? 1000 : 500);
      }
    }
    row.event_id = typeof e.event_id === 'string' && UUID_RE.test(e.event_id)
      ? e.event_id : crypto.randomUUID();
    row.occurred_at = clampStr(e.occurred_at, 40) ?? new Date().toISOString();
    row.source = 'client';
    row.received_at = new Date().toISOString();
    return [row];
  });

  if (!rows.length) {
    return new Response(JSON.stringify({ ok: true, inserted: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // event_id is UNIQUE → duplicate deliveries (beacon retries) are ignored.
  const { error } = await supabase
    .from('analytics_events')
    .upsert(rows, { onConflict: 'event_id', ignoreDuplicates: true });

  if (error) {
    console.error('analytics ingest failed:', error.message);
    return new Response(JSON.stringify({ ok: false }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true, inserted: rows.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
