import { motion } from 'framer-motion';
import { Briefcase, Sparkles, Crown, Shield, Zap, Eye, Flame, Check, Calendar, Lock, Star, ArrowRight } from 'lucide-react';
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
    description: 'The exact age range when lasting love is written in your palm',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/15',
  },
  {
    icon: Briefcase,
    title: 'Career Breakthrough Year',
    description: 'Your specific career pivot age and peak wealth accumulation style',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/15',
  },
  {
    icon: Sparkles,
    title: '4 More Spiritual Remedies',
    description: 'Practices tailored to your specific palm energy patterns',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/15',
  },
];

const valueItems = [
  'All 5 major palm lines fully decoded',
  'Career turning point year + wealth style',
  'Love timing + compatibility pattern',
  '3 life phase windows — growth, challenge, peak',
  'All 5 personalised spiritual remedies',
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
      aria-labelledby="paywall-heading"
    >
      <div className="relative glass-premium rounded-3xl overflow-hidden border-2 border-accent/35 shadow-gold">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 shimmer pointer-events-none opacity-60" aria-hidden="true" />

        <div className="p-6 md:p-8 relative z-10">
          {/* Live social proof */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/12 border border-accent/20 text-sm font-medium text-foreground"
            >
              <Flame className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>87 people unlocked their reading this week</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-accent text-accent" aria-hidden="true" />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent/12 flex items-center justify-center mx-auto mb-4 border border-accent/20">
              <Lock className="w-7 h-7 text-accent" aria-hidden="true" />
            </div>
            <h2 id="paywall-heading" className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
              Your Reading Is <span className="text-gradient-gold">90% Complete</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              The most valuable sections of your destiny report are waiting. One payment. Yours forever.
            </p>
          </div>

          {/* Locked previews */}
          <div className="space-y-3 mb-6">
            {lockedItems.map(({ icon: Icon, title, description, color, bg, border }, index) => {
              const preview = index === 0
                ? premiumInsights.marriageTiming.slice(0, 28) + '...'
                : index === 1
                ? premiumInsights.careerBreakthrough.slice(0, 28) + '...'
                : 'Personalised to your palm energy...';
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className={`flex items-center gap-4 p-4 rounded-xl bg-background/50 border ${border} relative overflow-hidden`}
                >
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                    <p className="text-sm text-muted-foreground blur-[4px] select-none mt-0.5" aria-hidden="true">
                      {preview}
                    </p>
                  </div>
                  <Lock className="w-4 h-4 text-accent/40 flex-shrink-0" aria-hidden="true" />
                </motion.div>
              );
            })}
          </div>

          {/* Value stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 p-5 rounded-2xl bg-background/40 border border-border/30">
            <p className="col-span-full text-xs font-bold text-foreground mb-2 uppercase tracking-wide">Everything included at ₹99:</p>
            {valueItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-xs text-foreground/80">{item}</span>
              </div>
            ))}
          </div>

          {/* Urgency nudge */}
          <div className="text-center mb-5">
            <span className="text-xs text-muted-foreground">
              <span className="text-accent font-semibold">Launch pricing</span> — full price ₹299. Pay ₹99 today.
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onUnlockClick}
                className="w-full btn-gold rounded-2xl px-10 py-7 text-lg font-bold gap-2 shadow-gold-lg"
                aria-label="Unlock full report for ₹99"
              >
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                Unlock Full Report — ₹99
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onUnlockClick}
                variant="outline"
                className="w-full rounded-2xl px-10 py-5 font-semibold gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent"
                aria-label="Start unlimited monthly plan"
              >
                <Crown className="w-5 h-5 text-accent" aria-hidden="true" />
                Unlimited Monthly Plan — ₹299/mo
                <span className="ml-1.5 text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold">Best Value</span>
              </Button>
            </motion.div>

            {/* Trust grid */}
            <div className="grid grid-cols-2 gap-2 pt-3">
              {[
                { icon: Shield, text: 'Secured by Razorpay' },
                { icon: Zap, text: 'Instant unlock' },
                { icon: Eye, text: 'Report saved forever' },
                { icon: Check, text: 'Full refund if unhappy' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" aria-hidden="true" />
                  {text}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center pt-1">
              UPI · Credit/Debit Card · Wallets · Net Banking accepted
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
