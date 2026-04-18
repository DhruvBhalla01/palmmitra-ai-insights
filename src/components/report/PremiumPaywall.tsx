import { motion } from 'framer-motion';
import { Briefcase, Sparkles, Crown, Shield, Zap, Eye, Flame, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumPaywallProps {
  premiumInsights: {
    marriageTiming: string;
    careerBreakthrough: string;
  };
  onUnlockClick?: () => void;
}

const lockedItems = [
  {
    icon: Calendar,
    title: 'Marriage Timing Window',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: Briefcase,
    title: 'Exact Career Breakthrough Year',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

const valueItems = [
  'All 5 Palm Lines fully decoded',
  'Career turning point year + wealth accumulation style',
  'Love timing + emotional compatibility pattern',
  '3 life phase windows — growth, challenge, opportunity',
  'Personalised spiritual remedies',
  'Downloadable PDF + permanent access link',
];

export function PremiumPaywall({ premiumInsights, onUnlockClick }: PremiumPaywallProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="relative glass-premium rounded-3xl overflow-hidden border-2 border-accent/30 shadow-gold">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />

        <div className="p-6 md:p-8">
          {/* Social proof */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-medium text-foreground">
              <Flame className="w-4 h-4 text-accent" />
              87 people unlocked their reading this week
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
                Unlock Detailed Predictions
              </h2>
              <p className="text-sm text-muted-foreground">Premium insights based on your palm</p>
            </div>
          </div>

          {/* Locked content preview */}
          <div className="space-y-3 mb-6">
            {lockedItems.map(({ icon: Icon, title, color, bg }, index) => {
              const preview = index === 0
                ? premiumInsights.marriageTiming.slice(0, 20) + '...'
                : premiumInsights.careerBreakthrough.slice(0, 20) + '...';
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background/50 relative overflow-hidden"
                >
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground blur-sm select-none">{preview}</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-accent/40" />
                </motion.div>
              );
            })}
          </div>

          {/* Value stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 p-4 rounded-2xl bg-background/40">
            {valueItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-foreground/80">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mb-5">
            <span className="text-accent font-medium">Launch pricing</span> — price increases after 25,000 readings
          </p>

          {/* Trust signals */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-accent" />
              Secure with Razorpay
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="w-3.5 h-3.5 text-accent" />
              Image stored securely
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-accent" />
              Instant unlock
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-accent" />
              Private & safe
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onUnlockClick}
                className="w-full btn-gold rounded-2xl px-10 py-6 text-lg font-semibold gap-2 shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                Unlock Everything Now
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onUnlockClick}
                variant="outline"
                className="w-full rounded-2xl px-10 py-5 font-semibold gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent"
              >
                <Crown className="w-5 h-5 text-accent" />
                Monthly Plan — Unlimited @ ₹299/mo
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">Best Value</span>
              </Button>
            </motion.div>

            <p className="text-xs text-muted-foreground text-center mt-2">
              One-time payment · Instant access · UPI / Cards / Wallets
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Not satisfied? Email us within 24 hours for a full refund.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
