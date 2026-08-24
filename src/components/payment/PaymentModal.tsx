import { m, AnimatePresence } from '@/lib/motion';
import { X, Lock, Shield, Zap, Check, Eye, ShieldCheck, Gem, Sparkles, CreditCard, Star, Infinity as InfinityIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { PlanType } from "@/hooks/useReportUnlock";
import { PRODUCTS } from "@/config/pricing";
import { useCurrency } from "@/hooks/useCurrency";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PlanType) => void;
  isProcessing: boolean;
  reportName?: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSelectPlan,
  isProcessing,
  reportName = "Your Palm Reading",
}: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("report99");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleProceed = () => {
    onSelectPlan(selectedPlan);
  };

  const { currency } = useCurrency();
  const insightPrice = PRODUCTS.insight.prices[currency].display;
  const elitePrice = PRODUCTS.elite.prices[currency].display;
  const priceLabel = selectedPlan === "report99" ? insightPrice : elitePrice;
  const anchorPrice = currency === 'INR' ? '₹499' : '$19.99';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <m.div
              initial={{ opacity: 0, scale: 0.96, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 28 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="w-full sm:max-w-lg max-h-[94vh] sm:max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden glass-premium border border-accent/30 shadow-gold-lg relative"
            >
              {/* Ambient gold radiance */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  background:
                    'radial-gradient(520px 300px at 50% -10%, hsl(var(--accent) / 0.18), transparent 65%)',
                }}
              />

              {/* Scrollable body */}
              <div className="relative overflow-y-auto px-5 pt-6 pb-5 sm:px-8 sm:pt-8">
                {/* Close */}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background/60 border border-border/60 flex items-center justify-center hover:border-accent/50 transition-colors z-10"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 mb-4">
                    <Lock className="w-3 h-3 text-accent" />
                    <span className="text-[10px] uppercase tracking-[0.16em] text-accent font-semibold">
                      Report Ready · Locked
                    </span>
                  </div>
                  <h2 className="text-[26px] leading-tight sm:text-3xl font-serif font-bold text-foreground mb-2 text-balance">
                    Unlock Your Complete{' '}
                    <span className="text-gradient-gold">Destiny Report</span>
                  </h2>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {reportName} · analysed and waiting
                  </p>

                  {/* Rating strip */}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">4.9 · 2,100+ readings unlocked</span>
                  </div>
                </div>

                {/* Plan Selection */}
                <div className="space-y-3 mb-5">
                  {/* Insight — single report */}
                  <m.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPlan("report99")}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                      selectedPlan === "report99"
                        ? "border-accent bg-accent/5 shadow-gold"
                        : "border-border bg-background/50 hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        selectedPlan === "report99" ? "border-accent bg-accent" : "border-muted-foreground"
                      }`}>
                        {selectedPlan === "report99" && <Check className="w-3.5 h-3.5 text-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <span className="font-semibold text-foreground text-sm sm:text-base">PalmMitra Insight</span>
                          <div className="text-right leading-none">
                            <span className="text-xs text-muted-foreground/70 line-through mr-1.5">{anchorPrice}</span>
                            <span className="text-2xl font-bold text-gradient-gold">{insightPrice}</span>
                          </div>
                        </div>
                        <p className="text-[13px] text-muted-foreground">One-time unlock — your report, yours forever</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">Full Analysis</span>
                          <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">PDF Download</span>
                          <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">All Remedies</span>
                        </div>
                      </div>
                    </div>
                  </m.button>

                  {/* Elite — flagship lifetime */}
                  <m.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPlan("unlimited999")}
                    className={`w-full text-left p-4 sm:p-5 pt-7 sm:pt-7 rounded-2xl border-2 transition-all relative overflow-hidden ${
                      selectedPlan === "unlimited999"
                        ? "border-accent bg-accent/5 shadow-gold-lg"
                        : "border-border bg-background/50 hover:border-accent/50"
                    }`}
                    style={{
                      background: selectedPlan === "unlimited999"
                        ? 'linear-gradient(135deg, hsl(42 87% 55% / 0.10), hsl(260 50% 30% / 0.08))'
                        : undefined,
                    }}
                  >
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-gold px-3 py-1 rounded-bl-xl text-[10px] font-bold text-foreground flex items-center gap-1 tracking-wide">
                        <Gem className="w-3 h-3" />
                        BEST VALUE
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        selectedPlan === "unlimited999" ? "border-accent bg-accent" : "border-muted-foreground"
                      }`}>
                        {selectedPlan === "unlimited999" && <Check className="w-3.5 h-3.5 text-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <span className="font-semibold text-foreground text-sm sm:text-base">PalmMitra Elite</span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-gradient-gold leading-none">{elitePrice}</span>
                            <span className="text-[10px] text-muted-foreground block mt-1">lifetime · one payment</span>
                          </div>
                        </div>
                        <p className="text-[13px] text-muted-foreground">Unlimited readings forever · You & family</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-[11px] px-2 py-1 rounded-full bg-accent/20 text-accent flex items-center gap-1">
                            <InfinityIcon className="w-3 h-3" /> Unlimited
                          </span>
                          <span className="text-[11px] px-2 py-1 rounded-full bg-accent/20 text-accent flex items-center gap-1">
                            <Users className="w-3 h-3" /> Family Readings
                          </span>
                          <span className="text-[11px] px-2 py-1 rounded-full bg-accent/20 text-accent">Priority AI</span>
                        </div>
                      </div>
                    </div>
                  </m.button>
                </div>

                {/* Testimonial */}
                <div className="rounded-2xl border border-accent/15 bg-accent/[0.04] p-4 mb-5">
                  <p className="text-[13px] italic text-foreground/80 leading-relaxed">
                    “I unlocked mine expecting something generic. The career timing section described the exact year
                    my life changed. Worth every rupee.”
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2">— Ananya R., Bengaluru · Verified unlock</p>
                </div>

                {/* Trust Signals */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/50">
                    <Shield className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-[11px] text-muted-foreground">Secure via Razorpay</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/50">
                    <Eye className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-[11px] text-muted-foreground">Image stored securely</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/50">
                    <Zap className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-[11px] text-muted-foreground">Instant unlock</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/50">
                    <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-[11px] text-muted-foreground">100% private</span>
                  </div>
                </div>
              </div>

              {/* Sticky CTA footer */}
              <div className="relative border-t border-accent/20 bg-card/85 backdrop-blur-xl px-5 py-4 sm:px-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Button
                  onClick={handleProceed}
                  disabled={isProcessing}
                  className="w-full btn-gold rounded-2xl py-6 text-base sm:text-lg font-semibold gap-2 min-h-[54px]"
                >
                  {isProcessing ? (
                    <>
                      <m.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </m.div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Pay {priceLabel} — Unlock Now
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-2 mt-3">
                  <CreditCard className="w-3.5 h-3.5" />
                  UPI · Cards · Wallets · Net Banking
                </p>
                <p className="text-[10px] text-muted-foreground/70 text-center mt-1.5 px-2">
                  By proceeding you agree to our terms. PalmMitra provides AI-based spiritual guidance only.
                  No guaranteed medical, legal, or financial outcomes.
                </p>
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

