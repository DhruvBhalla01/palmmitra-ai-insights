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
      .select('id,user_email,report_id,plan_type,amount,currency,created_at')
      .eq('status', 'pending').not('report_id', 'is', null)
      .in('plan_type', Object.keys(PLAN_NAMES))
      .lte('created_at', new Date(now - 3600_000).toISOString())
      .gte('created_at', new Date(now - 48 * 3600_000).toISOString())
      .order('created_at', { ascending: false }).limit(200);
    if (error) throw error;

    // One candidate per email+report (latest attempt).
    const seen = new Set<string>();
    const candidates = (pending ?? []).filter((p) => {
      const k = `${p.user_email.toLowerCase()}|${p.report_id}`;
      if (seen.has(k)) return false; seen.add(k); return true;
    });
    if (!candidates.length) return json({ sent: 0, skipped: 0 });

    const reportIds = [...new Set(candidates.map((c) => c.report_id))];
    const [{ data: paid }, { data: already }, { data: reports }] = await Promise.all([
      admin.from('payments').select('report_id,plan_type').eq('status', 'success').in('report_id', reportIds),
      admin.from('checkout_reminders').select('report_id,user_email,status').in('report_id', reportIds),
      admin.from('palm_reports').select('id,user_name').in('id', reportIds),
    ]);
    const paidSet = new Set((paid ?? []).map((p) => `${p.report_id}|${p.plan_type}`));
    const doneSet = new Set((already ?? []).filter((r) => r.status !== 'failed').map((r) => `${r.user_email.toLowerCase()}|${r.report_id}`));
    const names = new Map((reports ?? []).map((r) => [r.id, r.user_name]));

    let sent = 0, skipped = 0;
    for (const p of candidates) {
      const email = p.user_email.toLowerCase();
      if (paidSet.has(`${p.report_id}|${p.plan_type}`) || doneSet.has(`${email}|${p.report_id}`)) { skipped++; continue; }
      // Failed attempts (e.g. before the domain was verified) are retried.
      await admin.from('checkout_reminders').delete().eq('report_id', p.report_id).ilike('user_email', email).eq('status', 'failed');
      // Claim first so concurrent runs can't double-send (unique payment_id).
      const { error: claimErr } = await admin.from('checkout_reminders').insert({
        payment_id: p.id, user_email: email, report_id: p.report_id, plan_type: p.plan_type,
        amount: p.amount, currency: p.currency, status: 'sending',
      });
      if (claimErr) { skipped++; continue; }
      const first = String(names.get(p.report_id) ?? '').trim().split(/\s+/)[0]?.slice(0, 40) || undefined;
      try {
        const r = await sendTemplateEmail('payment-reminder', email, {
          // Hour-bucketed so a failed attempt (e.g. unverified domain) can retry next run;
          // the unique claim row above still prevents double-sends.
          idempotencyKey: `payment-reminder-${p.id}-${Math.floor(Date.now() / 3_600_000)}`,
          templateData: {
            name: first,
            planName: PLAN_NAMES[p.plan_type],
            price: price(p.amount, p.currency),
            reportUrl: `${SITE}/report/${p.report_id}?e=${b64url(email)}&utm_source=email&utm_medium=reminder&utm_campaign=checkout_recovery`,
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
