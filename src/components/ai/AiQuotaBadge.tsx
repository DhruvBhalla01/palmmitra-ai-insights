import type { AiEntitlement } from '@/hooks/useAiEntitlement';
import { Sparkles } from 'lucide-react';

interface Props {
  entitlement?: AiEntitlement;
  loading?: boolean;
}

export function AiQuotaBadge({ entitlement, loading }: Props) {
  if (loading || !entitlement) {
    return <span className="text-xs text-foreground/40">…</span>;
  }
  if (entitlement.has_active_subscription) {
    const used = entitlement.subscription_month_usage;
    const q = entitlement.monthly_quota;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--gold)/0.5)] bg-[hsl(var(--gold)/0.1)] px-3 py-1 text-[11px] font-medium text-[hsl(var(--gold-light))] shadow-[0_0_15px_-4px_hsl(var(--gold)/0.5)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))] shadow-[0_0_6px_hsl(var(--gold))]" />
        Elite · {Math.max(0, q - used)} left
      </span>
    );
  }
  const n = entitlement.total_remaining;
  const tone =
    n === 0 ? 'border-destructive/50 bg-destructive/10 text-destructive'
    : 'border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-light))]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium whitespace-nowrap ${tone}`}>
      <Sparkles className="w-3 h-3" />
      {n} Complimentary
    </span>
  );
}
