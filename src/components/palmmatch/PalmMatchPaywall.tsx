import { motion } from 'framer-motion';
import { Check, Flame, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PalmMatchPlanType } from '@/hooks/usePalmMatchUnlock';

interface PalmMatchPaywallProps {
  person1Name: string;
  person2Name: string;
  onUnlockClick: (plan: PalmMatchPlanType) => void;
  isProcessing: boolean;
}

const valueItems = [
  'All 5 compatibility dimensions fully decoded',
  'Strengths & growth areas specific to your pair',
  'Best timing window for major decisions together',
  '2 personalised spiritual remedies for your bond',
  'Permanent report link + shareable result',
];

const teaserDimensions = [
  { label: 'Communication', icon: '💬' },
  { label: 'Life Goals', icon: '🎯' },
  { label: 'Romance', icon: '🌹' },
  { label: 'Spiritual', icon: '✨' },
];

export function PalmMatchPaywall({ person1Name, person2Name, onUnlockClick, isProcessing }: PalmMatchPaywallProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-premium rounded-3xl p-8 md:p-10 border border-accent/20 mb-12 relative overflow-hidden"
    >
      <div className="absolute inset-0 shimmer rounded-3xl pointer-events-none" />

      {/* Social proof badge */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-medium text-foreground">
          <Flame className="w-4 h-4 text-accent" />
          87 compatibility reports unlocked this week
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
          Reveal <span className="text-gradient-gold">{person1Name} & {person2Name}'s</span>
          <br />Full Compatibility
        </h2>
        <p className="text-muted-foreground text-sm">
          You've seen Emotional Bond. These 4 dimensions are still hidden:
        </p>
      </div>

      {/* Locked dimension teaser grid */}
      <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto mb-7">
        {teaserDimensions.map(({ label, icon }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center text-xl relative overflow-hidden">
              <span className="blur-[1px] opacity-60">{icon}</span>
              <Lock className="w-3 h-3 text-accent/60 absolute bottom-1 right-1" />
            </div>
            <span className="text-[10px] text-muted-foreground/70 text-center leading-tight">{label}</span>
            <span className="text-xs font-bold text-foreground/20">??%</span>
          </div>
        ))}
      </div>

      {/* Value stack */}
      <ul className="space-y-2.5 mb-6 max-w-sm mx-auto">
        {valueItems.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-foreground">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-accent" />
            </div>
            {item}
          </li>
        ))}
      </ul>

      {/* Pricing + urgency */}
      <p className="text-center text-xs text-muted-foreground mb-5">
        <span className="text-accent font-semibold">Launch pricing</span> — price increases after 10,000 reports
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
        <Button
          onClick={() => onUnlockClick('palmmatch149')}
          disabled={isProcessing}
          className="btn-gold text-foreground font-bold py-6 rounded-2xl flex-1 text-base"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex flex-col items-center gap-0.5">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Unlock Full Report
                <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-xs font-normal opacity-80">
                <span className="line-through opacity-60">₹499</span>
                {' '}₹149 today
              </span>
            </span>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => onUnlockClick('monthly299')}
          disabled={isProcessing}
          className="border-accent/30 text-foreground hover:bg-accent/10 py-6 rounded-2xl text-sm flex flex-col gap-0.5 h-auto"
        >
          <span>Monthly Plan</span>
          <span className="text-xs font-normal opacity-70">₹299/mo · unlimited</span>
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Not satisfied? Email us within 24 hours for a full refund.
      </p>
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
        <Lock className="w-3 h-3 text-accent" />
        Secure payment via Razorpay · UPI, Cards, Wallets
      </div>
    </motion.div>
  );
}
