/**
 * Server-side analytics emitter (authoritative commerce events).
 * Idempotent: event_id is derived deterministically from a key, so a
 * duplicate Razorpay webhook cannot create a duplicate revenue event.
 */

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type ServerEventName =
  | 'order_created'
  | 'payment_success'
  | 'payment_failed'
  | 'payment_refunded'
  | 'report_unlocked'
  | 'ai_request_completed'
  | 'ai_request_failed'
  | 'palm_analysis_completed'
  | 'palm_analysis_failed';

/** Deterministic UUIDv5-ish id from a stable dedupe key (SHA-256 based). */
async function deterministicId(key: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  const b = Array.from(new Uint8Array(buf)).map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${b.slice(0, 8)}-${b.slice(8, 12)}-5${b.slice(13, 16)}-a${b.slice(17, 20)}-${b.slice(20, 32)}`;
}

const FORBIDDEN = /(password|otp|cvv|card|upi_pin|token|secret|signature|apikey|api_key)/i;

function sanitize(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (FORBIDDEN.test(k)) continue;
    if (v === null || v === undefined) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 500);
    else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
  }
  return out;
}

export interface ServerEventContext {
  dedupeKey: string;
  userId?: string | null;
  userEmail?: string | null;
  anonymousId?: string | null;
  sessionId?: string | null;
  pagePath?: string | null;
  environment?: string;
}

export async function emitServerEvent(
  client: SupabaseClient | null,
  name: ServerEventName,
  ctx: ServerEventContext,
  props: Record<string, unknown> = {},
): Promise<void> {
  try {
    const supabase = client ?? createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const event_id = await deterministicId(`${name}:${ctx.dedupeKey}`);
    await supabase.from('analytics_events').upsert({
      event_id,
      event_name: name,
      occurred_at: new Date().toISOString(),
      environment: ctx.environment ?? 'production',
      source: 'server',
      anonymous_id: ctx.anonymousId ?? null,
      session_id: ctx.sessionId ?? null,
      user_id: ctx.userId ?? null,
      user_email: ctx.userEmail ?? null,
      page_path: ctx.pagePath ?? null,
      properties: sanitize(props),
    }, { onConflict: 'event_id', ignoreDuplicates: true });
  } catch (e) {
    console.error('emitServerEvent failed:', (e as Error).message);
  }
}
