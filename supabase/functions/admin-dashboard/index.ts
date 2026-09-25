import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const ADMIN_EMAILS = ['thepalmmitra@gmail.com'];
const RANGES: Record<string, number | null> = { today: 0, '7d': 7, '30d': 30, all: null };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

function sinceIso(range: string): string | null {
  const days = RANGES[range];
  if (days === undefined || days === null) return null;
  const d = new Date();
  if (days === 0) { d.setUTCHours(0, 0, 0, 0); d.setUTCMinutes(d.getUTCMinutes() - 330); return d.toISOString(); } // IST midnight approx
  return new Date(Date.now() - days * 86400000).toISOString();
}

const clean = (s: unknown, max = 100) => (typeof s === 'string' ? s.replace(/[%,()*]/g, '').trim().slice(0, max) : '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') ?? '';
    if (!auth.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401);
    const url = Deno.env.get('SUPABASE_URL')!;
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: u, error: ue } = await admin.auth.getUser(auth.slice(7));
    if (ue || !u?.user) return json({ error: 'unauthorized' }, 401);
    const user = u.user;
    const email = (user.email ?? '').toLowerCase();

    // Bootstrap: verified allow-listed email gets the admin role server-side.
    if (ADMIN_EMAILS.includes(email) && user.email_confirmed_at) {
      await admin.from('user_roles').upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id,role', ignoreDuplicates: true });
    }
    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) return json({ error: 'forbidden' }, 403);

    const body = await req.json().catch(() => ({}));
    const action = clean(body.action, 20);
    const range = clean(body.range, 5) || 'today';
    const since = sinceIso(range);
    const page = Math.max(0, Math.min(1000, Number(body.page) || 0));
    const pageSize = 50;

    const countOf = async (table: string, col: string, filters: (q: any) => any = (q) => q) => {
      let q = admin.from(table).select('id', { count: 'exact', head: true });
      if (since) q = q.gte(col, since);
      const { count } = await filters(q);
      return count ?? 0;
    };
    const eventCount = (name: string) => countOf('analytics_events', 'occurred_at', (q) => q.eq('event_name', name).eq('environment', 'production'));

    if (action === 'summary') {
      const [visitors, uploads, palmmatch, checkouts, paid, pending] = await Promise.all([
        eventCount('session_started'),
        countOf('palm_reports', 'created_at'),
        countOf('palmmatch_reports', 'created_at'),
        eventCount('checkout_started'),
        countOf('payments', 'created_at', (q) => q.eq('status', 'success')),
        countOf('payments', 'created_at', (q) => q.eq('status', 'pending')),
      ]);
      let rq = admin.from('payments').select('amount,currency').eq('status', 'success').limit(10000);
      if (since) rq = rq.gte('created_at', since);
      const { data: rev } = await rq;
      const revenue: Record<string, number> = {};
      for (const r of rev ?? []) revenue[r.currency] = (revenue[r.currency] ?? 0) + r.amount;
      return json({ visitors, uploads, palmmatch, checkouts, paid, pending, revenue });
    }

    if (action === 'funnel') {
      const [visits, uploads, viewed, checkout, paid] = await Promise.all([
        eventCount('session_started'),
        countOf('palm_reports', 'created_at'),
        eventCount('reading_preview_viewed'),
        eventCount('checkout_started'),
        countOf('payments', 'created_at', (q) => q.eq('status', 'success')),
      ]);
      return json({ steps: [
        { label: 'Visits', value: visits }, { label: 'Uploads', value: uploads },
        { label: 'Report viewed', value: viewed }, { label: 'Checkout started', value: checkout },
        { label: 'Paid', value: paid },
      ] });
    }

    if (action === 'customers') {
      const search = clean(body.search);
      const paidFilter = clean(body.paid, 10);
      let q = admin.from('palm_reports')
        .select('id,user_name,user_email,user_age,country_name,country_code,language,reading_type,image_url,created_at', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (since) q = q.gte('created_at', since);
      if (search) q = q.or(`user_name.ilike.%${search}%,user_email.ilike.%${search}%`);
      const exportAll = body.export === true;
      q = exportAll ? q.limit(5000) : q.range(page * pageSize, page * pageSize + pageSize - 1);
      const { data: rows, count, error } = await q;
      if (error) throw error;
      const ids = (rows ?? []).map((r) => r.id);
      const { data: pays } = ids.length
        ? await admin.from('payments').select('id,report_id,plan_type,amount,currency,status,created_at,razorpay_payment_id').in('report_id', ids)
        : { data: [] as any[] };
      let customers = (rows ?? []).map((r) => {
        const p = (pays ?? []).filter((x) => x.report_id === r.id);
        return { ...r, payments: p, paid: p.some((x) => x.status === 'success') };
      });
      if (paidFilter === 'paid') customers = customers.filter((c) => c.paid);
      if (paidFilter === 'unpaid') customers = customers.filter((c) => !c.paid);
      return json({ customers, total: count ?? 0, pageSize });
    }

    if (action === 'health') {
      const day = new Date(Date.now() - 86400000).toISOString();
      const [apiErrors, aiFailures, payFailures, failedPayments, stalePending] = await Promise.all([
        admin.from('analytics_events').select('occurred_at,page_path,properties')
          .eq('event_name', 'api_error').eq('environment', 'production')
          .gte('occurred_at', day).order('occurred_at', { ascending: false }).limit(25),
        admin.from('analytics_events').select('occurred_at,page_path,properties')
          .in('event_name', ['ai_request_failed', 'palm_analysis_failed', 'palm_image_upload_failed']).eq('environment', 'production')
          .gte('occurred_at', day).order('occurred_at', { ascending: false }).limit(25),
        admin.from('analytics_events').select('occurred_at,page_path,properties')
          .eq('event_name', 'checkout_payment_failed').eq('environment', 'production')
          .gte('occurred_at', day).order('occurred_at', { ascending: false }).limit(25),
        admin.from('payments').select('id,created_at,user_email,plan_type,amount,currency')
          .eq('status', 'failed').gte('created_at', day).order('created_at', { ascending: false }).limit(25),
        admin.from('payments').select('id,created_at,user_email,plan_type,amount,currency')
          .eq('status', 'pending').lt('created_at', new Date(Date.now() - 3600000).toISOString())
          .order('created_at', { ascending: false }).limit(25),
      ]);
      for (const r of [apiErrors, aiFailures, payFailures, failedPayments, stalePending]) {
        if (r.error) throw r.error;
      }
      return json({
        apiErrors: apiErrors.data ?? [], aiFailures: aiFailures.data ?? [],
        payFailures: payFailures.data ?? [], failedPayments: failedPayments.data ?? [],
        stalePending: stalePending.data ?? [],
      });
    }

    if (action === 'recent_users') {
      const { data: rows, error } = await admin.from('palm_reports')
        .select('id,user_name,user_email,user_age,country_code,language,reading_type,created_at')
        .order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      const ids = (rows ?? []).map((r) => r.id);
      const emails = [...new Set((rows ?? []).map((r) => (r.user_email ?? '').toLowerCase()).filter(Boolean))];
      const [{ data: byReport }, { data: byEmail }] = await Promise.all([
        ids.length ? admin.from('payments').select('report_id,user_email,plan_type,status,amount,currency,created_at').in('report_id', ids) : Promise.resolve({ data: [] as any[] }),
        emails.length ? admin.from('payments').select('report_id,user_email,plan_type,status,amount,currency,created_at').in('user_email', emails) : Promise.resolve({ data: [] as any[] }),
      ]);
      const users = (rows ?? []).map((r) => {
        const em = (r.user_email ?? '').toLowerCase();
        const own = (byReport ?? []).filter((p) => p.report_id === r.id);
        const other = (byEmail ?? []).filter((p) => p.user_email?.toLowerCase() === em && p.report_id !== r.id);
        const all = [...own, ...other];
        const paid = all.find((p) => p.status === 'success');
        const stage = paid ? 'paid' : all.some((p) => p.status === 'pending') ? 'checkout_abandoned'
          : all.some((p) => p.status === 'failed') ? 'payment_failed' : 'report_only';
        return { ...r, stage, plan: paid?.plan_type ?? all[0]?.plan_type ?? '', amount: paid?.amount ?? null, currency: paid?.currency ?? '', attempts: all.length };
      });
      return json({ users });
    }

    if (action === 'reminders') {
      const { data, error } = await admin.from('checkout_reminders')
        .select('id,payment_id,user_email,report_id,palmmatch_report_id,plan_type,amount,currency,status,error,sent_at')
        .order('sent_at', { ascending: false }).limit(100);
      if (error) throw error;
      const rows = data ?? [];
      const ids = [...new Set(rows.map((r) => r.report_id).filter(Boolean))] as string[];
      const pmIds = [...new Set(rows.map((r) => r.palmmatch_report_id).filter(Boolean))] as string[];
      const [{ data: paid }, { data: paidPm }] = await Promise.all([
        ids.length
          ? admin.from('payments').select('report_id,created_at').eq('status', 'success').in('report_id', ids)
          : Promise.resolve({ data: [] as { report_id: string; created_at: string }[] }),
        pmIds.length
          ? admin.from('payments').select('palmmatch_report_id,created_at').eq('status', 'success').in('palmmatch_report_id', pmIds)
          : Promise.resolve({ data: [] as { palmmatch_report_id: string; created_at: string }[] }),
      ]);
      // Recovered = any successful payment on that same reading after the email
      // went out, whichever plan they ended up buying.
      const reminders = rows.map((r) => ({
        ...r,
        recovered: r.report_id
          ? (paid ?? []).some((p) => p.report_id === r.report_id && p.created_at > r.sent_at)
          : (paidPm ?? []).some((p) => p.palmmatch_report_id === r.palmmatch_report_id && p.created_at > r.sent_at),
      }));
      return json({ reminders });
    }

    if (action === 'send_reminders') {
      const res = await fetch(`${url}/functions/v1/checkout-reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`,
        },
        body: '{}',
      });
      return json(await res.json().catch(() => ({ error: 'failed' })), res.ok ? 200 : 500);
    }

    if (action === 'testimonials') {
      const op = clean(body.op, 10);
      if (op === 'approve' || op === 'delete') {
        const id = clean(body.id, 40);
        if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'bad_id' }, 400);
        const q = op === 'approve'
          ? admin.from('testimonials').update({ approved: true }).eq('id', id)
          : admin.from('testimonials').delete().eq('id', id);
        const { error } = await q;
        if (error) throw error;
        return json({ ok: true });
      }
      const { data, error } = await admin.from('testimonials')
        .select('id,name,quote,rating,source,approved,created_at')
        .order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return json({ testimonials: data ?? [] });
    }

    if (action === 'palmmatch') {
      const search = clean(body.search);
      const paidFilter = clean(body.paid, 10);
      let q = admin.from('palmmatch_reports')
        .select('id,report_id,person1_name,person1_age,person2_name,person2_age,relationship_type,email,overall_score,language,is_unlocked,reading,created_at', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (since) q = q.gte('created_at', since);
      if (search) q = q.or(`person1_name.ilike.%${search}%,person2_name.ilike.%${search}%,email.ilike.%${search}%`);
      if (paidFilter === 'paid') q = q.eq('is_unlocked', true);
      if (paidFilter === 'unpaid') q = q.eq('is_unlocked', false);
      q = body.export === true ? q.limit(5000) : q.range(page * pageSize, page * pageSize + pageSize - 1);
      const { data: rows, count, error } = await q;
      if (error) throw error;
      const rids = (rows ?? []).map((r) => r.report_id);
      const { data: pays } = rids.length
        ? await admin.from('payments').select('id,palmmatch_report_id,plan_type,amount,currency,status,created_at,razorpay_payment_id').in('palmmatch_report_id', rids)
        : { data: [] as any[] };
      const matches = (rows ?? []).map(({ reading, ...r }) => {
        const p = (pays ?? []).filter((x) => x.palmmatch_report_id === r.report_id);
        const rd = (reading ?? {}) as Record<string, unknown>;
        return {
          ...r, payments: p,
          paid: r.is_unlocked || p.some((x) => x.status === 'success'),
          verdict: typeof rd.compatibilityVerdict === 'string' ? rd.compatibilityVerdict : '',
          image1: typeof rd.image1Url === 'string' ? rd.image1Url : '',
          image2: typeof rd.image2Url === 'string' ? rd.image2Url : '',
        };
      });
      return json({ matches, total: count ?? 0, pageSize });
    }

    if (action === 'payments') {
      const status = clean(body.status, 20);
      const plan = clean(body.plan, 30);
      let q = admin.from('payments')
        .select('id,created_at,user_email,plan_type,amount,currency,status,razorpay_payment_id,razorpay_order_id,report_id,palmmatch_report_id', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (since) q = q.gte('created_at', since);
      if (status) q = q.eq('status', status);
      if (plan) q = q.eq('plan_type', plan);
      q = body.export === true ? q.limit(5000) : q.range(page * pageSize, page * pageSize + pageSize - 1);
      const { data, count, error } = await q;
      if (error) throw error;
      return json({ payments: data ?? [], total: count ?? 0, pageSize });
    }

    return json({ error: 'unknown_action' }, 400);
  } catch (e) {
    console.error('admin-dashboard error', e);
    return json({ error: 'server_error' }, 500);
  }
});
