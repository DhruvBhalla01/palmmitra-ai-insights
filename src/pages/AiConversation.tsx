import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PremiumBackground } from '@/components/PremiumBackground';
import { Navbar } from '@/components/Navbar';
import { AiSuggestionGrid } from '@/components/ai/AiSuggestionGrid';
import { AiComposer } from '@/components/ai/AiComposer';
import { AiMessageList } from '@/components/ai/AiMessageList';
import { AiQuotaBadge } from '@/components/ai/AiQuotaBadge';
import { AiPaywall } from '@/components/ai/AiPaywall';
import { AiSignInModal } from '@/components/ai/AiSignInModal';
import { useAuth } from '@/hooks/useAuth';
import { useAiEntitlement, useInvalidateEntitlement } from '@/hooks/useAiEntitlement';
import { useAiChatStream, type UiMessage } from '@/hooks/useAiChatStream';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import type { AiPlanId } from '@/config/ai-pricing';

export default function AiConversationPage() {
  const { reportId = '' } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: entitlement, isLoading: entLoading } = useAiEntitlement(!!user);
  const invalidateEnt = useInvalidateEntitlement();
  const { toast } = useToast();

  const [showPaywall, setShowPaywall] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [paying, setPaying] = useState<AiPlanId | null>(null);
  const bootstrapped = useRef(false);

  const chat = useAiChatStream({
    reportId,
    onQuotaExhausted: () => setShowPaywall(true),
    onCompleted: () => { invalidateEnt(); track('ai_question_completed'); },
  });

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) setShowSignIn(true);
  }, [authLoading, user]);

  // Load prior conversation
  useEffect(() => {
    if (!user || !reportId || bootstrapped.current) return;
    bootstrapped.current = true;
    (async () => {
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        method: 'POST',
        body: { reportId },
      });
      if (error) return;
      const msgs = ((data?.messages ?? []) as Array<{ id: string; role: string; content: string }>)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content })) as UiMessage[];
      chat.hydrate(msgs);
      track('ai_started', { reportId });
    })();
  }, [user, reportId, chat]);

  const remaining = entitlement?.total_remaining ?? 0;
  const isElite = !!entitlement?.has_active_subscription;
  const canSend = isElite || remaining > 0;
  const isEmpty = chat.messages.length === 0;

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
    if (!user) { setShowSignIn(true); return; }
    setPaying(plan);
    try {
      const { data, error } = await supabase.functions.invoke('ai-purchase-create-order', {
        body: { plan },
      });
      if (error || !data?.success) {
        toast({ title: 'Could not start payment', description: data?.error ?? error?.message ?? 'Try again', variant: 'destructive' });
        return;
      }
      await loadRazorpay();
      const rz = (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay;
      const options = {
        key: data.key_id,
        order_id: data.order_id,
        amount: data.amount,
        currency: 'INR',
        name: 'PalmMitra AI',
        description: data.description,
        prefill: { email: user.email },
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
            toast({ title: 'You\u2019re unlocked ✨', description: 'PalmMitra AI Elite is now active.' });
            invalidateEnt();
            setShowPaywall(false);
            if (plan.startsWith('ai_elite')) track('ai_subscription_purchased', { plan });
            else track('ai_pack_purchased', { plan });
          } else {
            toast({ title: 'Payment could not be verified', variant: 'destructive' });
          }
        },
      };
      new rz(options).open();
    } finally {
      setPaying(null);
    }
  };

  // Suggested prompts (default when empty)
  const heading = useMemo(() => (
    isEmpty
      ? `Namaste${user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}. What would you like guidance on today?`
      : 'Your PalmMitra AI guide'
  ), [isEmpty, user]);

  return (
    <div className="min-h-screen relative bg-[#050302] text-amber-50">
      <PremiumBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-4 pb-40">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/report/${reportId}`)}
              className="inline-flex items-center gap-2 text-amber-100/70 hover:text-amber-100 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to report
            </button>
            <AiQuotaBadge entitlement={entitlement} loading={entLoading} />
          </div>

          {isEmpty ? (
            <div className="mt-10 sm:mt-14">
              <div className="text-[11px] uppercase tracking-[0.24em] text-amber-300/70">PalmMitra AI</div>
              <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-amber-100 leading-tight">
                {heading}
              </h1>
              <p className="mt-3 text-amber-100/60 max-w-xl">
                I already know your palm report. Ask me anything about your career, relationships, wealth, or life.
              </p>
              <div className="mt-8">
                <AiSuggestionGrid onPick={handleSuggestion} disabled={chat.status !== 'idle'} />
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <AiMessageList messages={chat.messages} userInitial={user?.email?.[0]?.toUpperCase()} />
            </div>
          )}
        </div>

        <div className="fixed bottom-0 inset-x-0 z-20 pointer-events-none">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-4 pointer-events-auto">
            <div className="bg-gradient-to-t from-[#050302] via-[#050302]/90 to-transparent pt-8 pb-2">
              <AiComposer
                onSend={handleSend}
                onStop={chat.stop}
                disabled={chat.status !== 'idle' || authLoading}
                streaming={chat.status === 'streaming'}
                placeholder={!canSend ? 'Unlock PalmMitra AI to continue…' : undefined}
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
          </div>
        </div>
      </div>

      <AiPaywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        onSelect={handleBuy}
        reason="exhausted"
      />
      <AiSignInModal
        open={showSignIn}
        onOpenChange={(v) => { setShowSignIn(v); if (!v && !user) navigate(`/ai/start/${reportId}`); }}
        returnTo={`/ai/${reportId}`}
        prefillEmail={typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('palm_data') || '{}').email ?? '') : ''}
      />
      {paying && <div className="sr-only">Loading payment…</div>}
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
