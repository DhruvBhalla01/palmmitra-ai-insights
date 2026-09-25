import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

type Range = 'today' | '7d' | '30d' | 'all';
const REFRESH = 15000;

class AdminError extends Error { constructor(public status: number) { super(`admin_${status}`); } }

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/admin-dashboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new AdminError(res.status);
  return res.json();
}

const money = (amt: number, cur: string) => {
  try { return new Intl.NumberFormat('en', { style: 'currency', currency: cur }).format(amt / 100); }
  catch { return `${cur} ${(amt / 100).toFixed(2)}`; }
};
const when = (s: string) => new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

const StatusBadge = ({ s }: { s: string }) => (
  <Badge variant={s === 'success' ? 'default' : s === 'pending' ? 'secondary' : 'destructive'}>{s === 'success' ? 'paid' : s}</Badge>
);

function Login() {
  const { signInWithOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-primary/30 bg-card p-6 text-center">
      <h1 className="font-serif text-2xl text-primary">PalmMitra Admin</h1>
      {sent ? <p className="mt-4 text-muted-foreground">Check {email} for your sign-in link.</p> : (
        <form className="mt-4 space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await signInWithOtp(email.trim(), '/admin');
          if (error) setErr(error.message); else setSent(true);
        }}>
          <Input type="email" required placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="w-full">Send sign-in link</Button>
          {err && <p className="text-sm text-destructive">{err}</p>}
        </form>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

interface Summary { visitors: number; uploads: number; palmmatch: number; checkouts: number; paid: number; pending: number; revenue: Record<string, number> }

function Overview({ range }: { range: Range }) {
  const s = useQuery({ queryKey: ['admin', 'summary', range], queryFn: () => call<Summary>({ action: 'summary', range }), refetchInterval: REFRESH });
  const f = useQuery({ queryKey: ['admin', 'funnel', range], queryFn: () => call<{ steps: { label: string; value: number }[] }>({ action: 'funnel', range }), refetchInterval: REFRESH });
  const d = s.data;
  const steps = f.data?.steps ?? [];
  const max = Math.max(1, ...steps.map((x) => x.value));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Visitors" value={d?.visitors ?? '…'} />
        <Stat label="Uploads" value={d?.uploads ?? '…'} />
        <Stat label="PalmMatch" value={d?.palmmatch ?? '…'} />
        <Stat label="Checkouts" value={d?.checkouts ?? '…'} />
        <Stat label="Paid orders" value={d?.paid ?? '…'} />
        <Stat label="Pending orders" value={d?.pending ?? '…'} />
      </div>
      <div className="rounded-xl border border-primary/20 bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Revenue</p>
        <div className="mt-2 flex flex-wrap gap-4">
          {d && Object.keys(d.revenue).length === 0 && <span className="text-muted-foreground">No paid orders in this period</span>}
          {d && Object.entries(d.revenue).map(([c, a]) => <span key={c} className="text-xl font-semibold text-primary">{money(a, c)}</span>)}
        </div>
      </div>
      <div className="rounded-xl border border-primary/20 bg-card p-4">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Conversion funnel</p>
        <div className="space-y-3">
          {steps.map((st, i) => {
            const prev = i > 0 ? steps[i - 1].value : 0;
            const pct = i > 0 && prev > 0 ? Math.round((st.value / prev) * 100) : null;
            return (
              <div key={st.label}>
                <div className="flex justify-between text-sm"><span>{st.label}</span>
                  <span className="text-muted-foreground">{st.value}{pct !== null && ` · ${pct}% of previous`}</span></div>
                <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${(st.value / max) * 100}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Updates automatically every 15 seconds.</p>
    </div>
  );
}

interface Pay { id: string; created_at: string; user_email: string; plan_type: string; amount: number; currency: string; status: string; razorpay_payment_id: string | null; report_id?: string | null }
interface Customer { id: string; user_name: string; user_email: string | null; user_age: string | null; country_name: string | null; language: string; reading_type: string | null; image_url: string; created_at: string; paid: boolean; payments: Pay[] }

function Pager({ page, setPage, total, size }: { page: number; setPage: (n: number) => void; total: number; size: number }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{total} total</span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
        <span>{page + 1}/{pages}</span>
        <Button size="sm" variant="outline" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

function Customers({ range }: { range: Range }) {
  const [search, setSearch] = useState('');
  const [paid, setPaid] = useState('');
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<Customer | null>(null);
  const q = useQuery({
    queryKey: ['admin', 'customers', range, search, paid, page],
    queryFn: () => call<{ customers: Customer[]; total: number; pageSize: number }>({ action: 'customers', range, search, paid, page }),
    refetchInterval: REFRESH, placeholderData: keepPreviousData,
  });
  const exportCsv = async () => {
    const r = await call<{ customers: Customer[] }>({ action: 'customers', range, search, paid, export: true });
    downloadCsv('palmmitra-customers', r.customers.map((c) => ({
      date: c.created_at, name: c.user_name, email: c.user_email, age: c.user_age, country: c.country_name, language: c.language,
      reading_type: c.reading_type, paid: c.paid ? 'yes' : 'no',
      plans: c.payments.filter((p) => p.status === 'success').map((p) => `${p.plan_type} ${money(p.amount, p.currency)}`).join('; '),
      photo: c.image_url, report: `${window.location.origin}/report/${c.id}`,
    })));
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Search name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        {[['', 'All'], ['paid', 'Paid'], ['unpaid', 'Unpaid']].map(([v, l]) => (
          <Button key={v} size="sm" variant={paid === v ? 'default' : 'outline'} onClick={() => { setPaid(v); setPage(0); }}>{l}</Button>
        ))}
        <Button size="sm" variant="outline" className="ml-auto" onClick={exportCsv}>Export CSV</Button>
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-primary/20 bg-card">
        {q.data?.customers.map((c) => (
          <button key={c.id} onClick={() => setSel(c)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50">
            <img src={c.image_url} alt={`Palm photo from ${c.user_name}`} loading="lazy" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.user_name} {c.user_age && <span className="text-muted-foreground">· {c.user_age}</span>}</p>
              <p className="truncate text-xs text-muted-foreground">{c.user_email ?? 'no email'} · {c.country_name ?? '—'} · {c.language}</p>
              <p className="text-xs text-muted-foreground">{when(c.created_at)}</p>
            </div>
            {c.paid ? <Badge>paid</Badge> : <Badge variant="secondary">free</Badge>}
          </button>
        ))}
        {q.data && q.data.customers.length === 0 && <p className="p-4 text-muted-foreground">No customers found.</p>}
        {q.isLoading && <p className="p-4 text-muted-foreground">Loading…</p>}
      </div>
      {q.data && <Pager page={page} setPage={setPage} total={q.data.total} size={q.data.pageSize} />}
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {sel && (<>
            <DialogHeader><DialogTitle>{sel.user_name}</DialogTitle></DialogHeader>
            <img src={sel.image_url} alt={`Palm photo from ${sel.user_name}`} className="max-h-72 w-full rounded-lg object-contain" />
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Email</dt><dd className="break-all">{sel.user_email ?? '—'}</dd>
              <dt className="text-muted-foreground">Age</dt><dd>{sel.user_age ?? '—'}</dd>
              <dt className="text-muted-foreground">Country</dt><dd>{sel.country_name ?? '—'}</dd>
              <dt className="text-muted-foreground">Language</dt><dd>{sel.language}</dd>
              <dt className="text-muted-foreground">Reading</dt><dd>{sel.reading_type ?? '—'}</dd>
              <dt className="text-muted-foreground">Uploaded</dt><dd>{when(sel.created_at)}</dd>
            </dl>
            <a className="text-sm text-primary underline" href={`/report/${sel.id}`} target="_blank" rel="noreferrer">Open report</a>
            <div className="space-y-2">
              <p className="text-sm font-medium">Payments</p>
              {sel.payments.length === 0 && <p className="text-sm text-muted-foreground">No payments</p>}
              {sel.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.plan_type} · {money(p.amount, p.currency)}</span><StatusBadge s={p.status} />
                </div>
              ))}
            </div>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Payments({ range }: { range: Range }) {
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [page, setPage] = useState(0);
  const q = useQuery({
    queryKey: ['admin', 'payments', range, status, plan, page],
    queryFn: () => call<{ payments: Pay[]; total: number; pageSize: number }>({ action: 'payments', range, status, plan, page }),
    refetchInterval: REFRESH, placeholderData: keepPreviousData,
  });
  const exportCsv = async () => {
    const r = await call<{ payments: Pay[] }>({ action: 'payments', range, status, plan, export: true });
    downloadCsv('palmmitra-payments', r.payments.map((p) => ({ ...p, amount: (p.amount / 100).toFixed(2) })));
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[['', 'All'], ['success', 'Paid'], ['pending', 'Pending'], ['failed', 'Failed']].map(([v, l]) => (
          <Button key={v} size="sm" variant={status === v ? 'default' : 'outline'} onClick={() => { setStatus(v); setPage(0); }}>{l}</Button>
        ))}
        <select className="rounded-md border border-input bg-background px-2 text-sm" value={plan} onChange={(e) => { setPlan(e.target.value); setPage(0); }} aria-label="Plan filter">
          <option value="">All plans</option><option value="report99">Insight report</option><option value="palmmatch149">PalmMatch</option>
          <option value="unlimited999">Elite</option><option value="monthly299">Monthly</option>
        </select>
        <Button size="sm" variant="outline" className="ml-auto" onClick={exportCsv}>Export CSV</Button>
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-primary/20 bg-card">
        {q.data?.payments.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{money(p.amount, p.currency)} · {p.plan_type}</p>
              <p className="truncate text-xs text-muted-foreground">{p.user_email}</p>
              <p className="truncate text-xs text-muted-foreground">{when(p.created_at)}{p.razorpay_payment_id && ` · ${p.razorpay_payment_id}`}</p>
            </div>
            <StatusBadge s={p.status} />
          </div>
        ))}
        {q.data && q.data.payments.length === 0 && <p className="p-4 text-muted-foreground">No orders found.</p>}
        {q.isLoading && <p className="p-4 text-muted-foreground">Loading…</p>}
      </div>
      {q.data && <Pager page={page} setPage={setPage} total={q.data.total} size={q.data.pageSize} />}
    </div>
  );
}

export default function Admin() {
  const { user, loading, signOut } = useAuth();
  const [range, setRange] = useState<Range>('today');
  const probe = useQuery({
    queryKey: ['admin', 'probe', user?.id], enabled: !!user,
    queryFn: () => call({ action: 'summary', range: 'today' }), retry: false,
  });
  const forbidden = probe.error instanceof AdminError && [401, 403].includes(probe.error.status);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <SEO title="Admin | PalmMitra" description="PalmMitra admin dashboard" path="/admin" noindex />
      {loading ? <p className="text-center text-muted-foreground">Loading…</p>
        : !user ? <Login />
        : forbidden ? (
          <div className="mx-auto max-w-sm text-center">
            <h1 className="font-serif text-2xl text-primary">Not authorized</h1>
            <p className="mt-2 text-muted-foreground">{user.email} doesn't have admin access.</p>
            <Button className="mt-4" variant="outline" onClick={signOut}>Sign out</Button>
          </div>
        ) : probe.isLoading ? <p className="text-center text-muted-foreground">Checking access…</p>
        : probe.error ? <p className="text-center text-destructive">Couldn't load the dashboard. Please refresh.</p>
        : (
          <div className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-serif text-3xl text-primary">PalmMitra Admin</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['all', 'All time']] as [Range, string][]).map(([v, l]) => (
                  <Button key={v} size="sm" variant={range === v ? 'default' : 'outline'} onClick={() => setRange(v)}>{l}</Button>
                ))}
                <Button size="sm" variant="ghost" onClick={signOut}>Sign out</Button>
              </div>
            </header>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>
              <TabsContent value="overview"><Overview range={range} /></TabsContent>
              <TabsContent value="customers"><Customers range={range} /></TabsContent>
              <TabsContent value="payments"><Payments range={range} /></TabsContent>
            </Tabs>
          </div>
        )}
    </main>
  );
}
