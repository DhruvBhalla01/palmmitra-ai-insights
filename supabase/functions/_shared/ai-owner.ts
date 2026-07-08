// Shared ownership verification for PalmMitra AI.
// Identity model: a caller proves they own a report by supplying the email
// used to purchase/generate that report. No auth session required — the
// same trust boundary as get-report / get-unlock-status.
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface OwnerCheck {
  ok: boolean;
  status?: number;
  error?: string;
  report?: {
    id: string;
    user_name: string | null;
    user_age: number | null;
    user_email: string | null;
    report_json: unknown;
  };
  normalizedEmail?: string;
  source?: 'owner_email' | 'unlock' | 'subscription';
}

export async function verifyReportOwner(
  admin: SupabaseClient,
  reportIdRaw: string | undefined,
  userEmailRaw: string | undefined,
): Promise<OwnerCheck> {
  const reportId = (reportIdRaw ?? '').trim();
  const email = (userEmailRaw ?? '').trim().toLowerCase();

  if (!UUID_RE.test(reportId)) return { ok: false, status: 400, error: 'invalid_report_id' };
  if (!EMAIL_RE.test(email)) return { ok: false, status: 400, error: 'invalid_email' };

  const { data: report, error } = await admin
    .from('palm_reports')
    .select('id, user_name, user_age, user_email, report_json')
    .eq('id', reportId)
    .maybeSingle();
  if (error) return { ok: false, status: 500, error: 'db_error' };
  if (!report) return { ok: false, status: 404, error: 'report_not_found' };

  const owner = (report.user_email ?? '').toLowerCase();
  if (owner && owner === email) {
    return { ok: true, report, normalizedEmail: email, source: 'owner_email' };
  }

  const now = new Date().toISOString();
  const [{ data: unlock }, { data: sub }] = await Promise.all([
    admin.from('report_unlocks')
      .select('id').eq('report_id', reportId).eq('user_email', email).maybeSingle(),
    admin.from('user_subscriptions')
      .select('id').eq('user_email', email).eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${now}`).maybeSingle(),
  ]);

  if (unlock) return { ok: true, report, normalizedEmail: email, source: 'unlock' };
  if (sub) return { ok: true, report, normalizedEmail: email, source: 'subscription' };

  return { ok: false, status: 403, error: 'forbidden' };
}
