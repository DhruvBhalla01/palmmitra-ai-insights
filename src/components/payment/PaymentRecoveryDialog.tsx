import { m, AnimatePresence } from '@/lib/motion';
import { X, RefreshCw, Smartphone, CreditCard, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export type RecoveryReason = 'cancelled' | 'failed';

interface PaymentRecoveryDialogProps {
  isOpen: boolean;
  reason: RecoveryReason;
  onRetry: () => void;
  onClose: () => void;
  hinglish?: boolean;
}

/**
 * Assisted retry shown when a Razorpay checkout is dismissed or fails.
 * Most drop-offs are UPI app hand-off problems, so we explain that first.
 */
export function PaymentRecoveryDialog({
  isOpen,
  reason,
  onRetry,
  onClose,
  hinglish,
}: PaymentRecoveryDialogProps) {
  useEffect(() => {
    if (isOpen) {
      analytics.track('checkout_recovery_shown', { reason });
    }
  }, [isOpen, reason]);

  const title = reason === 'failed'
    ? (hinglish ? 'Payment poora nahi hua' : "Payment didn't go through")
    : (hinglish ? 'Aapne payment chhod diya' : 'You left the payment');

  const subtitle = hinglish
    ? 'Sabse common wajah: UPI app khulne ke baad wapas is page par aana reh jata hai.'
    : 'The most common reason: the UPI app opens and the return to this page never completes.';

  const tips = hinglish
    ? [
        { icon: Smartphone, text: 'UPI se pay karein, phir apne UPI app se wapas is tab par aayein.' },
        { icon: CreditCard, text: 'UPI nahi chala? Card ya netbanking chunein — same page par option hai.' },
        { icon: Clock, text: 'Aapki reading 24 ghante ke liye safe hai. Paise sirf ek baar hi katenge.' },
      ]
    : [
        { icon: Smartphone, text: 'Approve in your UPI app, then switch back to this tab to finish.' },
        { icon: CreditCard, text: 'UPI not opening? Choose card or netbanking on the same screen.' },
        { icon: Clock, text: 'Your reading stays reserved for 24 hours. You are charged only once.' },
      ];

  const retryLabel = hinglish ? 'Dobara try karein' : 'Try the payment again';
  const laterLabel = hinglish ? 'Baad mein' : 'Maybe later';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <m.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.97 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="pointer-events-auto w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl glass-premium border border-accent/30 shadow-gold-lg p-5 sm:p-7 relative"
            >
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background/60 border border-border/60 flex items-center justify-center hover:border-accent/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground pr-8">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>

              <ul className="mt-4 space-y-3">
                {tips.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="mt-0.5 w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                    </span>
                    <span className="text-sm text-foreground/85 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-2">
                <Button className="btn-gold w-full h-12 text-base" onClick={onRetry}>
                  {retryLabel}
                </Button>
                <Button variant="ghost" className="w-full h-11 text-muted-foreground" onClick={onClose}>
                  {laterLabel}
                </Button>
              </div>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                {hinglish ? 'Secure Razorpay checkout' : 'Secure Razorpay checkout'}
              </p>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
