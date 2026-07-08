import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AI_SUBSCRIPTIONS, AI_PACKS, type AiPlanId } from '@/config/ai-pricing';
import { Check, Sparkles, ChevronDown } from 'lucide-react';
import { track } from '@/lib/analytics';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (plan: AiPlanId) => void;
  reason?: 'exhausted' | 'upsell';
}

const BENEFITS = [
  'Continue the same conversation',
  'AI remembers your full palm report',
  'Personalized life guidance any time',
  'Career, marriage & wealth advice on demand',
];

export function AiPaywall({ open, onOpenChange, onSelect, reason = 'exhausted' }: Props) {
  const [showElite, setShowElite] = useState(false);
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('annual');

  const pickPack = (id: AiPlanId) => {
    track('ai_pack_selected', { plan: id });
    onSelect(id);
  };
  const pickElite = (id: AiPlanId) => {
    track('ai_subscription_started', { plan: id });
    onSelect(id);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (v) track('ai_paywall_viewed', { reason }); onOpenChange(v); }}>
      <DialogContent className="max-w-lg bg-[#0a0705] border-amber-500/20 text-amber-50 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative p-6 sm:p-7">
          <div className="flex items-center gap-2 text-amber-300/80 text-xs uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5" /> Continue Your Conversation
          </div>
          <h2 className="mt-2 text-xl sm:text-2xl font-serif text-amber-100">
            {reason === 'exhausted' ? 'You\u2019ve used your complimentary questions.' : 'Add more PalmMitra AI questions.'}
          </h2>
          <p className="mt-2 text-amber-100/60 text-sm">
            Pick up right where you left off — same conversation, same context, more questions.
          </p>

          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {BENEFITS.map(b => (
              <li key={b} className="flex items-start gap-1.5 text-xs text-amber-50/80">
                <Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" /> {b}
              </li>
            ))}
          </ul>

          {/* Question packs — primary */}
          <div className="mt-6 space-y-2.5">
            <div className="text-[11px] uppercase tracking-[0.2em] text-amber-300/70">Question Packs</div>
            {AI_PACKS.map(p => (
              <PlanRow
                key={p.id}
                title={p.label}
                subtitle={p.badge ?? 'One-time · continues this conversation'}
                price={p.priceDisplay}
                badge={p.badge}
                onClick={() => pickPack(p.id)}
              />
            ))}
          </div>

          {/* Subtle Elite upgrade */}
          <div className="mt-5 border-t border-amber-500/10 pt-4">
            <button
              onClick={() => setShowElite(v => !v)}
              className="w-full flex items-center justify-between text-left text-amber-100/70 hover:text-amber-100 transition-colors group"
            >
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.18em] text-amber-300/60">Ask more often?</span>
                <span className="text-sm">PalmMitra AI Elite — from ₹799/mo</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showElite ? 'rotate-180' : ''}`} />
            </button>

            {showElite && (
              <div className="mt-3 space-y-2.5">
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
                    title="PalmMitra AI Elite"
                    subtitle="200 questions / month · conversation history · priority responses"
                    price={AI_SUBSCRIPTIONS.monthly.priceDisplay} period="/month"
                    onClick={() => pickElite(AI_SUBSCRIPTIONS.monthly.id)}
                  />
                ) : (
                  <PlanRow
                    title="PalmMitra AI Elite"
                    subtitle="200 questions / month · conversation history · priority responses"
                    badge="Best Value"
                    price={AI_SUBSCRIPTIONS.annual.priceDisplay} period="/year"
                    onClick={() => pickElite(AI_SUBSCRIPTIONS.annual.id)}
                  />
                )}
              </div>
            )}
          </div>
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
