import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts';

// Sends ONE payment reminder per abandoned checkout (pending 1–48h, never paid).
// Takes no input: recipients come only from the payments table, and each
// report/email pair is reminded at most once, so repeated calls are harmless.

const PLAN_NAMES: Record<string, string> = {
  report99: 'your Full Destiny Report',
  palmmatch149: 'your PalmMatch Compatibility Report',
  ai_pack_5: 'your PalmMitra AI questions',
  ai_pack_10: 'your PalmMitra AI questions',
  ai_pack_15: 'your PalmMitra AI questions',
};
const SITE = 'https://www.palmmitra.in';

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const price = (amt: number, cur: string) => {
  try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur, maximumFractionDigits: cur === 'INR' ? 0 : 2 }).format(amt / 100); }
  catch { return ''; }
};
const b64url = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const now = Date.now();
    const { data: pending, error } = await admin.from('payments')
      .select('id,user_email,report_id,palmmatch_report_id,plan_type,amount,currency,created_at')
      .eq('status', 'pending')
      .or('report_id.not.is.null,palmmatch_report_id.not.is.null')
      .in('plan_type', Object.keys(PLAN_NAMES))
      .lte('created_at', new Date(now - 3600_000).toISOString())
      .gte('created_at', new Date(now - 48 * 3600_000).toISOString())
      .order('created_at', { ascending: false }).limit(200);
    if (error) throw error;

    // A reference is either a palm report (uuid) or a PalmMatch report (pm_...).
    const refOf = (p: { report_id: string | null; palmmatch_report_id: string | null }) =>
      p.report_id ?? p.palmmatch_report_id;

    // One candidate per email+report (latest attempt).
    const seen = new Set<string>();
    const candidates = (pending ?? []).filter((p) => {
      const ref = refOf(p);
      if (!ref) return false;
      const k = `${p.user_email.toLowerCase()}|${ref}`;
      if (seen.has(k)) return false; seen.add(k); return true;
    });
    if (!candidates.length) return json({ sent: 0, skipped: 0 });

    const reportIds = [...new Set(candidates.map((c) => c.report_id).filter(Boolean))] as string[];
    const matchIds = [...new Set(candidates.map((c) => c.palmmatch_report_id).filter(Boolean))] as string[];
    const paymentIds = candidates.map((c) => c.id);
    const [{ data: paidReports }, { data: paidMatches }, { data: already }, { data: reports }, { data: matches }] = await Promise.all([
      reportIds.length
        ? admin.from('payments').select('report_id,plan_type').eq('status', 'success').in('report_id', reportIds)
        : Promise.resolve({ data: [] as { report_id: string; plan_type: string }[] }),
      matchIds.length
        ? admin.from('payments').select('palmmatch_report_id,plan_type').eq('status', 'success').in('palmmatch_report_id', matchIds)
        : Promise.resolve({ data: [] as { palmmatch_report_id: string; plan_type: string }[] }),
      // Prior reminders for the same checkouts, matched through their payment rows.
      admin.from('checkout_reminders').select('payment_id,user_email,status').in('payment_id', paymentIds),
      reportIds.length
        ? admin.from('palm_reports').select('id,user_name').in('id', reportIds)
        : Promise.resolve({ data: [] as { id: string; user_name: string }[] }),
      matchIds.length
        ? admin.from('palmmatch_reports').select('report_id,person1_name,person2_name').in('report_id', matchIds)
        : Promise.resolve({ data: [] as { report_id: string; person1_name: string; person2_name: string }[] }),
    ]);
    const paidSet = new Set([
      ...(paidReports ?? []).map((p) => `${p.report_id}|${p.plan_type}`),
      ...(paidMatches ?? []).map((p) => `${p.palmmatch_report_id}|${p.plan_type}`),
    ]);
    const doneSet = new Set((already ?? []).filter((r) => r.status !== 'failed').map((r) => r.payment_id));
    const failedIds = new Set((already ?? []).filter((r) => r.status === 'failed').map((r) => r.payment_id));
    const names = new Map<string, string>([
      ...(reports ?? []).map((r) => [r.id, r.user_name] as [string, string]),
      ...(matches ?? []).map((m) => [m.report_id, `${m.person1_name} & ${m.person2_name}`] as [string, string]),
    ]);

    let sent = 0, skipped = 0;
    for (const p of candidates) {
      const email = p.user_email.toLowerCase();
      const ref = refOf(p)!;
      const isMatch = !p.report_id;
      if (paidSet.has(`${ref}|${p.plan_type}`) || doneSet.has(p.id)) { skipped++; continue; }
      // Failed attempts (e.g. before the domain was verified) are retried.
      if (failedIds.has(p.id)) {
        await admin.from('checkout_reminders').delete().eq('payment_id', p.id).eq('status', 'failed');
      }
      // Claim first so concurrent runs can't double-send (unique payment_id).
      const { error: claimErr } = await admin.from('checkout_reminders').insert({
        payment_id: p.id, user_email: email, report_id: p.report_id, plan_type: p.plan_type,
        amount: p.amount, currency: p.currency, status: 'sending',
      });
      if (claimErr) { skipped++; continue; }
      const label = String(names.get(ref) ?? '').trim();
      const first = (isMatch ? label : label.split(/\s+/)[0] ?? '').slice(0, 60) || undefined;
      const path = isMatch ? 'palmmatch-report' : 'report';
      try {
        const r = await sendTemplateEmail('payment-reminder', email, {
          // Hour-bucketed so a failed attempt (e.g. unverified domain) can retry next run;
          // the unique claim row above still prevents double-sends.
          idempotencyKey: `payment-reminder-${p.id}-${Math.floor(Date.now() / 3_600_000)}`,
          templateData: {
            name: first,
            planName: PLAN_NAMES[p.plan_type],
            price: price(p.amount, p.currency),
            reportUrl: `${SITE}/${path}/${ref}?e=${b64url(email)}&utm_source=email&utm_medium=reminder&utm_campaign=checkout_recovery`,
          },
        });
        await admin.from('checkout_reminders').update({ status: r.sent ? 'sent' : 'suppressed' }).eq('payment_id', p.id);
        if (r.sent) sent++; else skipped++;
      } catch (e) {
        console.error('reminder send failed', p.id, e);
        await admin.from('checkout_reminders').update({ status: 'failed', error: String((e as Error)?.message ?? e).slice(0, 300) }).eq('payment_id', p.id);
      }
    }
    return json({ sent, skipped });
  } catch (e) {
    console.error('checkout-reminders error', e);
    return json({ error: 'server_error' }, 500);
  }
});
