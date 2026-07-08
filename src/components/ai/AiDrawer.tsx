import { useEffect, useRef, useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AiComposer } from './AiComposer';
import { AiMessageList } from './AiMessageList';
import { AiSuggestionGrid } from './AiSuggestionGrid';
import { AiQuotaBadge } from './AiQuotaBadge';
import { AiPaywall } from './AiPaywall';
import { useAiChatStream, type UiMessage } from '@/hooks/useAiChatStream';
import { useAiEntitlement, useInvalidateEntitlement } from '@/hooks/useAiEntitlement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import logoImg from '@/assets/logo.webp';
import type { AiPlanId } from '@/config/ai-pricing';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reportId: string;
  userName?: string;
  userEmail: string;
  seedPrompt?: string | null;
  onSeedConsumed?: () => void;
  source?: string;
  reportGeneratedAt?: string | null;
}

export function AiDrawer({
  open, onOpenChange, reportId, userName, userEmail,
  seedPrompt, onSeedConsumed, source, reportGeneratedAt,
}: Props) {
  const { data: entitlement, isLoading: entLoading } = useAiEntitlement(reportId, userEmail, open);
  const invalidateEnt = useInvalidateEntitlement();
  const { toast } = useToast();

  const [showPaywall, setShowPaywall] = useState(false);
  const [paying, setPaying] = useState<AiPlanId | null>(null);
  const bootstrapped = useRef<string | null>(null);
  const seedFired = useRef(false);

  const chat = useAiChatStream({
    reportId,
    userEmail,
    onQuotaExhausted: () => setShowPaywall(true),
    onCompleted: () => { invalidateEnt(); track('ai_question_completed'); },
  });

  useEffect(() => {
    if (!open || !reportId || !userEmail) return;
    const key = `${reportId}:${userEmail}`;
    if (bootstrapped.current === key) return;
    bootstrapped.current = key;
    (async () => {
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        method: 'POST',
        body: { reportId, userEmail },
      });
      if (error) {
        toast({ title: 'Could not load conversation', description: error.message, variant: 'destructive' });
        return;
      }
      const rows = ((data?.messages ?? []) as Array<{ id: string; role: string; content: string }>)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content })) as UiMessage[];
      chat.hydrate(rows);
      if (rows.length === 1 && rows[0].role === 'assistant') track('ai_seed_shown', { reportId });
      track('ai_drawer_opened', { reportId, source: source ?? 'unknown' });
    })();
  }, [open, reportId, userEmail, chat, source, toast]);

  useEffect(() => {
    if (!open || !seedPrompt || seedFired.current) return;
    if (bootstrapped.current !== `${reportId}:${userEmail}`) return;
    if (chat.status !== 'idle') return;
    seedFired.current = true;
    chat.send(seedPrompt);
    track('ai_suggestion_clicked', { key: 'inline_seed', source: source ?? 'inline' });
    onSeedConsumed?.();
  }, [open, seedPrompt, reportId, userEmail, chat, source, onSeedConsumed]);

  useEffect(() => { if (!open) seedFired.current = false; }, [open]);

  const remaining = entitlement?.total_remaining ?? 0;
  const isElite = !!entitlement?.has_active_subscription;
  const canSend = isElite || remaining > 0;

  const handleSend = (text: string) => {
    if (!canSend) { setShowPaywall(true); return; }
    track('ai_question_asked', { seed: false });
    chat.send(text);
  };
  const handleSuggestion = (seed: string, key: string) => {
    if (!canSend) { setShowPaywall(true); return; }
    track('ai_suggestion_clicked', { key });
    chat.send(seed);
  };

  const handleBuy = async (plan: AiPlanId) => {
    setPaying(plan);
    try {
      const { data, error } = await supabase.functions.invoke('ai-purchase-create-order', {
        body: { plan, reportId, userEmail },
      });
      if (error || !data?.success) {
        toast({ title: 'Could not start payment', description: data?.error ?? error?.message ?? 'Try again', variant: 'destructive' });
        return;
      }
      await loadRazorpay();
      const rz = (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay;
      const opts = {
        key: data.key_id,
        order_id: data.order_id,
        amount: data.amount,
        currency: 'INR',
        name: 'PalmMitra AI',
        description: data.description,
        prefill: { email: userEmail },
        theme: { color: '#d4a256' },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verify = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              payment_id: data.payment_id,
            },
          });
          if (verify.data?.success) {
            toast({ title: 'Unlocked ✨', description: 'You can continue the conversation now.' });
            invalidateEnt();
            setShowPaywall(false);
            if (plan.startsWith('ai_elite')) track('ai_subscription_purchased', { plan });
            else track('ai_pack_purchased', { plan });
          } else {
            toast({ title: 'Payment could not be verified', variant: 'destructive' });
          }
        },
      };
      new rz(opts).open();
    } finally { setPaying(null); }
  };

  const isEmpty = chat.messages.length === 0;
  const firstName = userName ? userName.split(/\s+/)[0] : '';

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg md:max-w-xl p-0 border-l border-[hsl(var(--gold)/0.2)] text-foreground flex flex-col overflow-hidden
            bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,hsl(var(--gold)/0.08),transparent_60%),radial-gradient(ellipse_100%_60%_at_100%_100%,hsl(280_45%_25%/0.35),transparent_60%),linear-gradient(180deg,hsl(var(--indigo-deep)),hsl(245_58%_10%))]"
        >
          {/* Sacred geometry backdrop */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-screen"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, hsl(var(--gold)) 0.5px, transparent 1px), radial-gradient(circle at 70% 80%, hsl(var(--gold)) 0.5px, transparent 1px), radial-gradient(circle at 40% 90%, hsl(var(--gold)) 0.5px, transparent 1px)',
              backgroundSize: '180px 180px, 240px 240px, 300px 300px',
            }}
          />

          {/* Header */}
          <div className="relative shrink-0 px-6 pt-6 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-11 w-11 rounded-full overflow-hidden ring-1 ring-[hsl(var(--gold)/0.4)] shadow-[0_0_25px_hsl(var(--gold)/0.35)]">
                  <img src={logoImg} alt="PalmMitra" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="font-serif text-xl leading-tight text-foreground">
                    Palm<span className="text-gradient-gold">Mitra</span> AI
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--gold)/0.75)] mt-0.5">
                    Inspired by Ancient Indian Palmistry
                  </div>
                </div>
              </div>
              <AiQuotaBadge entitlement={entitlement} loading={entLoading} />
            </div>
            {/* Gold divider */}
            <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[hsl(var(--gold)/0.5)] to-transparent" />
          </div>

          {/* Body */}
          <div className="relative flex-1 overflow-y-auto px-5 sm:px-6 py-6">
            {isEmpty ? (
              <WelcomeCard firstName={firstName} onPick={handleSuggestion} disabled={chat.status !== 'idle'} reportGeneratedAt={reportGeneratedAt} />
            ) : (
              <div className="space-y-5">
                <ContextMemoryBanner date={reportGeneratedAt} />
                <AiMessageList messages={chat.messages} userInitial={userEmail?.[0]?.toUpperCase()} />
              </div>
            )}
          </div>


          {/* Composer */}
          <div className="relative shrink-0 border-t border-[hsl(var(--gold)/0.15)] bg-[linear-gradient(180deg,transparent,hsl(245_58%_6%/0.7))] px-4 sm:px-5 py-4">
            <AiComposer
              onSend={handleSend}
              onStop={chat.stop}
              disabled={chat.status !== 'idle'}
              streaming={chat.status === 'streaming'}
              placeholder={!canSend ? 'Unlock more questions to continue…' : 'Ask about your palm...'}
            />
            {!canSend && !entLoading && (
              <button
                onClick={() => setShowPaywall(true)}
                className="mt-2.5 w-full text-center text-xs font-medium tracking-wide text-[hsl(var(--gold-light))] hover:text-[hsl(var(--gold))] transition-colors"
              >
                Continue Your AI Guidance →
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AiPaywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        onSelect={handleBuy}
        reason="exhausted"
      />
      {paying && <div className="sr-only">Loading payment…</div>}
    </>
  );
}

function WelcomeCard({ firstName, onPick, disabled }: { firstName: string; onPick: (seed: string, key: string) => void; disabled: boolean }) {
  const highlights = [
    { label: 'Career Growth', key: 'career' },
    { label: 'Strong Leadership', key: 'leadership' },
    { label: 'Wealth Potential', key: 'wealth' },
    { label: 'Relationship Stability', key: 'relationships' },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative rounded-3xl border border-[hsl(var(--gold)/0.25)] bg-[linear-gradient(160deg,hsl(var(--gold)/0.08),hsl(245_58%_10%/0.6))] p-6 shadow-[0_20px_60px_-20px_hsl(var(--gold)/0.35),inset_0_1px_0_hsl(var(--gold)/0.15)] backdrop-blur-xl">
        <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold)/0.6)] to-transparent" />
        <div className="text-[10px] uppercase tracking-[0.24em] text-[hsl(var(--gold)/0.8)]">A Message from PalmMitra AI</div>
        <h3 className="mt-2 font-serif text-2xl sm:text-[26px] leading-tight text-foreground">
          {`Namaste${firstName ? `, ${firstName}` : ''}`}
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
          I've carefully studied your palm. Your strongest indications suggest:
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2.5">
          {highlights.map(h => (
            <li key={h.key} className="flex items-center gap-2 text-sm text-foreground/85">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))] shadow-[0_0_8px_hsl(var(--gold)/0.8)]" />
              {h.label}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-foreground/70">
          I'm here to help you understand every part of your reading. Ask me anything.
        </p>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--gold)/0.7)] mb-3 px-1">Explore</div>
        <AiSuggestionGrid onPick={onPick} disabled={disabled} />
      </div>
    </div>
  );
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve();
    const s = document.createElement('script');
    s.id = 'razorpay-sdk';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
}
