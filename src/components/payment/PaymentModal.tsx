import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Shield, CreditCard, Zap, Crown, Check, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type PlanType = "basic299" | "standard699" | "premium1499";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PlanType) => void;
  isProcessing: boolean;
  reportName?: string;
}

const plans: Array<{
  id: PlanType;
  name: string;
  price: string;
  priceNum: number;
  description: string;
  tags: string[];
  popular: boolean;
}> = [
  {
    id: "basic299",
    name: "Basic",
    price: "₹299",
    priceNum: 299,
    description: "1–2 page AI palm reading",
    tags: ["Personality", "Career Hint", "PDF"],
    popular: false,
  },
  {
    id: "standard699",
    name: "Standard",
    price: "₹699",
    priceNum: 699,
    description: "6–8 page detailed report",
    tags: ["Full Analysis", "12-Month Outlook", "PDF + Email"],
    popular: true,
  },
  {
    id: "premium1499",
    name: "Premium",
    price: "₹1,499",
    priceNum: 1499,
    description: "10–12 page extended report",
    tags: ["Priority AI", "Voice Notes", "Everything"],
    popular: false,
  },
];

export function PaymentModal({
  isOpen,
  onClose,
  onSelectPlan,
  isProcessing,
  reportName = "Your Palm Reading",
}: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("standard699");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleProceed = () => {
    onSelectPlan(selectedPlan);
  };

  const selected = plans.find((p) => p.id === selectedPlan)!;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg overflow-y-auto max-h-[90vh]"
            >
              <div className="glass-premium rounded-3xl p-6 md:p-8 border border-accent/30 shadow-gold-lg relative">
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
                <div className="space-y-3 mb-6">
                  {plans.map((plan) => (
                    <motion.button
                      key={plan.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                        selectedPlan === plan.id
                          ? "border-accent bg-accent/5 shadow-gold"
                          : "border-border bg-background/50 hover:border-accent/50"
                      }`}
                    >
                      {/* Popular / Best Value badge */}
                      {plan.popular && (
                        <div className="absolute -top-1 -right-1">
                          <div className="bg-gradient-gold px-3 py-1 rounded-bl-xl rounded-tr-xl text-xs font-bold text-foreground flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            RECOMMENDED
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                            selectedPlan === plan.id ? "border-accent bg-accent" : "border-muted-foreground"
                          }`}
                        >
                          {selectedPlan === plan.id && <Check className="w-4 h-4 text-foreground" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-foreground">{plan.name}</span>
                            <span className="text-2xl font-bold text-gradient-gold">{plan.price}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {plan.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  plan.popular ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Trust Signals */}
                <div className="flex items-center justify-center gap-6 mb-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-500" />
                    Secure Payment
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    UPI/Cards/Wallets
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Instant Unlock
                  </div>
                </div>

                {/* CTA */}
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
                      Pay {selected.price} with Razorpay
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-center text-muted-foreground mt-4 px-4">
                  By proceeding, you agree to our terms. PalmMitra provides AI-assisted palm reading for guidance purposes only. No guaranteed outcomes.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
