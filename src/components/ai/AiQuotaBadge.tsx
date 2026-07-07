import type { AiEntitlement } from '@/hooks/useAiEntitlement';

interface Props {
  entitlement?: AiEntitlement;
  loading?: boolean;
}

export function AiQuotaBadge({ entitlement, loading }: Props) {
  if (loading || !entitlement) {
    return <span className="text-xs text-amber-100/40">…</span>;
  }
  if (entitlement.has_active_subscription) {
    const used = entitlement.subscription_month_usage;
    const q = entitlement.monthly_quota;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
        Elite · {Math.max(0, q - used)} left this month
      </span>
    );
  }
  const n = entitlement.total_remaining;
  const tone =
    n === 0 ? 'border-red-500/40 bg-red-500/10 text-red-200'
    : n === 1 ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
    : 'border-amber-500/30 bg-amber-500/5 text-amber-100';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${tone}`}>
      {n} {n === 1 ? 'Question' : 'Questions'} Remaining
    </span>
  );
}
