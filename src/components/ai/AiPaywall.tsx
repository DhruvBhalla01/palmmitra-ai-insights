import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AI_SUBSCRIPTIONS, AI_PACKS, type AiPlanId } from '@/config/ai-pricing';
import { Check, Sparkles } from 'lucide-react';
import { track } from '@/lib/analytics';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (plan: AiPlanId) => void;
  reason?: 'exhausted' | 'upsell';
}

const BENEFITS = [
  'AI remembers your full palm report',
  'Personalized life guidance any time',
  'Career, marriage & wealth advice on demand',
  'Future insights as your report evolves',
  'Priority AI responses',
];

export function AiPaywall({ open, onOpenChange, onSelect, reason = 'exhausted' }: Props) {
  const [mode, setMode] = useState<'subscribe' | 'pack'>('subscribe');
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('annual');

  const handle = (id: AiPlanId) => {
    track(id.startsWith('ai_pack') ? 'ai_subscription_viewed' : 'ai_subscription_started', { plan: id });
    onSelect(id);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (v) track('ai_paywall_viewed', { reason }); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl bg-[#0a0705] border-amber-500/20 text-amber-50 p-0 overflow-hidden">
        <div className="relative p-6 sm:p-8">
          <div className="flex items-center gap-2 text-amber-300/80 text-xs uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5" /> Continue Your AI Guidance
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-serif text-amber-100">
            {reason === 'exhausted' ? 'Your complimentary questions are complete.' : 'Unlock unlimited PalmMitra AI.'}
          </h2>
          <p className="mt-2 text-amber-100/60 text-sm">
            Keep the conversation going with the AI that already knows your palm.
          </p>

          <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {BENEFITS.map(b => (
              <li key={b} className="flex items-start gap-2 text-sm text-amber-50/85">
                <Check className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" /> {b}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex rounded-xl border border-amber-500/20 p-1 bg-black/40 w-fit">
            {(['subscribe', 'pack'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                  mode === m ? 'bg-amber-400 text-black font-medium' : 'text-amber-100/70 hover:text-amber-100'
                }`}
              >
                {m === 'subscribe' ? 'Subscribe' : 'Question Pack'}
              </button>
            ))}
          </div>

          {mode === 'subscribe' ? (
            <div className="mt-5 space-y-3">
              <div className="flex rounded-lg border border-amber-500/15 p-1 w-fit text-xs">
                {(['monthly', 'annual'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setCycle(c)}
                    className={`px-3 py-1 rounded ${cycle === c ? 'bg-amber-500/20 text-amber-100' : 'text-amber-100/50'}`}
                  >
                    {c === 'monthly' ? 'Monthly' : 'Annual · Save ₹3,589'}
                  </button>
                ))}
              </div>
              {cycle === 'monthly' ? (
                <PlanRow
                  title="PalmMitra AI Elite" subtitle="200 AI conversations · every month"
                  price={AI_SUBSCRIPTIONS.monthly.priceDisplay} period="/month"
                  onClick={() => handle(AI_SUBSCRIPTIONS.monthly.id)}
                />
              ) : (
                <PlanRow
                  title="PalmMitra AI Elite" subtitle="200 AI conversations · every month · Best Value"
                  badge="⭐ Best Value"
                  price={AI_SUBSCRIPTIONS.annual.priceDisplay} period="/year"
                  onClick={() => handle(AI_SUBSCRIPTIONS.annual.id)}
                />
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {AI_PACKS.map(p => (
                <PlanRow
                  key={p.id}
                  title={p.label}
                  subtitle={p.badge ? p.badge : 'One-time purchase · never expires'}
                  price={p.priceDisplay}
                  onClick={() => handle(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlanRow({ title, subtitle, price, period, badge, onClick }: {
  title: string; subtitle: string; price: string; period?: string; badge?: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.05] to-transparent hover:border-amber-400/50 hover:from-amber-500/10 p-4 text-left transition-all group"
    >
      <div className="min-w-0">
        {badge && <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300 mb-1">{badge}</div>}
        <div className="text-amber-50 font-medium">{title}</div>
        <div className="text-xs text-amber-100/50 mt-0.5">{subtitle}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-amber-100 font-serif text-xl">{price}</div>
        {period && <div className="text-[10px] text-amber-100/50">{period}</div>}
      </div>
    </button>
  );
}
