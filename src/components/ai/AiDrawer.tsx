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
import { Sparkles } from 'lucide-react';
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
}

export function AiDrawer({
  open, onOpenChange, reportId, userName, userEmail,
  seedPrompt, onSeedConsumed, source,
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

  // Bootstrap conversation when drawer opens
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

  // Auto-send seed prompt if provided
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

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg md:max-w-xl p-0 border-l border-amber-500/20 bg-[#050302] text-amber-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-amber-500/15 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-black text-xs font-semibold flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.35)]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-amber-100 truncate">PalmMitra AI</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/60">Your Palm · Interactive</div>
              </div>
            </div>
            <AiQuotaBadge entitlement={entitlement} loading={entLoading} />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {isEmpty ? (
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-amber-300/70">PalmMitra AI</div>
                <h3 className="mt-1 font-serif text-2xl text-amber-100">
                  {`Namaste${userName ? `, ${userName.split(/\s+/)[0]}` : ''}.`}
                </h3>
                <p className="mt-2 text-sm text-amber-100/60">
                  I've studied your palm report. What would you like to explore?
                </p>
                <div className="mt-6">
                  <AiSuggestionGrid onPick={handleSuggestion} disabled={chat.status !== 'idle'} />
                </div>
              </div>
            ) : (
              <AiMessageList messages={chat.messages} userInitial={userEmail?.[0]?.toUpperCase()} />
            )}
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-amber-500/15 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
            <AiComposer
              onSend={handleSend}
              onStop={chat.stop}
              disabled={chat.status !== 'idle'}
              streaming={chat.status === 'streaming'}
              placeholder={!canSend ? 'Unlock more questions to continue…' : undefined}
            />
            {!canSend && !entLoading && (
              <button
                onClick={() => setShowPaywall(true)}
                className="mt-2 w-full text-center text-xs text-amber-300 hover:text-amber-200"
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
