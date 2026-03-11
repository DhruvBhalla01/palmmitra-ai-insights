import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Shield, CreditCard, Zap, Crown, Check, Sparkles, Eye, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: "report99" | "unlimited999") => void;
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
  const [selectedPlan, setSelectedPlan] = useState<"report99" | "unlimited999">("report99");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleProceed = () => {
    onSelectPlan(selectedPlan);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg overflow-y-auto max-h-[90vh]"
            >
            <div className="glass-premium rounded-3xl p-6 md:p-8 border border-accent/30 shadow-gold-lg relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/50 flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-accent/10 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <Lock className="w-10 h-10 text-accent" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
                  Unlock Your Complete
                  <br />
                  <span className="text-gradient-gold">Destiny Report</span>
                </h2>
                <p className="text-muted-foreground text-sm">{reportName}</p>
              </div>

              {/* Plan Selection */}
              <div className="space-y-4 mb-6">
                {/* Report Plan */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan("report99")}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    selectedPlan === "report99"
                      ? "border-accent bg-accent/5 shadow-gold"
                      : "border-border bg-background/50 hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        selectedPlan === "report99" ? "border-accent bg-accent" : "border-muted-foreground"
                      }`}
                    >
                      {selectedPlan === "report99" && <Check className="w-4 h-4 text-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground">Detailed Report</span>
                        <span className="text-2xl font-bold text-gradient-gold">₹99</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Unlock this report permanently</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Full Analysis</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">PDF Download</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">All Remedies</span>
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Unlimited Plan */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan("unlimited999")}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                    selectedPlan === "unlimited999"
                      ? "border-accent bg-accent/5 shadow-gold"
                      : "border-border bg-background/50 hover:border-accent/50"
                  }`}
                >
                  {/* Best Value Badge */}
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-gradient-gold px-3 py-1 rounded-bl-xl rounded-tr-xl text-xs font-bold text-foreground flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      BEST VALUE
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        selectedPlan === "unlimited999" ? "border-accent bg-accent" : "border-muted-foreground"
                      }`}
                    >
                      {selectedPlan === "unlimited999" && <Check className="w-4 h-4 text-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground">Unlimited Plan</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gradient-gold">₹999</span>
                          <span className="text-xs text-muted-foreground block">lifetime</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">All reports unlocked forever</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">♾️ Unlimited</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">Priority Access</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">All Features</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Trust Signals - Enhanced */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/50">
                  <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Secure payment via Razorpay</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/50">
                  <Eye className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Image not stored after scan</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/50">
                  <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Instant unlock after payment</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/50">
                  <ShieldCheck className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">100% private & confidential</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleProceed}
                disabled={isProcessing}
                className="w-full btn-gold rounded-2xl py-6 text-lg font-semibold gap-2"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Pay ₹{selectedPlan === "report99" ? "99" : "999"} — Unlock Now
                  </>
                )}
              </Button>

              {/* Payment methods + legal */}
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-2 mb-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  UPI • Cards • Wallets • Net Banking
                </p>
                <p className="text-[10px] text-muted-foreground px-4">
                  By proceeding, you agree to our terms. PalmMitra provides AI-based spiritual guidance only. No
                  guaranteed medical, legal, or financial outcomes.
                </p>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
