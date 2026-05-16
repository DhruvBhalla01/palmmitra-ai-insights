import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Lock, Sparkles, ArrowRight, Quote, ShieldCheck } from 'lucide-react';
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
  { label: 'Communication', icon: '💬', from: 'hsl(200 85% 55%)', to: 'hsl(170 70% 50%)' },
  { label: 'Life Goals',    icon: '🎯', from: 'hsl(145 60% 50%)', to: 'hsl(42 87% 55%)' },
  { label: 'Romance',       icon: '🌹', from: 'hsl(320 70% 60%)', to: 'hsl(270 60% 65%)' },
  { label: 'Spiritual',     icon: '✨', from: 'hsl(270 60% 55%)', to: 'hsl(245 58% 45%)' },
];

const avatarStack = [
  { initial: 'P', color: 'hsl(350 80% 60%)' },
  { initial: 'A', color: 'hsl(200 85% 55%)' },
  { initial: 'M', color: 'hsl(145 60% 50%)' },
];

export function PalmMatchPaywall({ person1Name, person2Name, onUnlockClick, isProcessing }: PalmMatchPaywallProps) {
  const [unlockCount, setUnlockCount] = useState(84);

  // Animate count from 84 → 92 on mount
  useEffect(() => {
    let frame: number;
    const target = 92;
    const start = 84;
    const duration = 1200;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 2);
      setUnlockCount(Math.round(start + eased * (target - start)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => { frame = requestAnimationFrame(tick); }, 600);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-premium rounded-3xl border border-accent/20 mb-12 relative overflow-hidden"
    >
      {/* Atmospheric radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{
          background: `
            radial-gradient(ellipse 70% 40% at 50% 0%, hsl(42 87% 55% / 0.09), transparent),
            radial-gradient(ellipse 50% 60% at 0% 100%, hsl(270 60% 50% / 0.06), transparent),
            radial-gradient(ellipse 50% 60% at 100% 100%, hsl(245 58% 40% / 0.06), transparent)
          `,
        }}
      />
      <div className="absolute inset-0 shimmer rounded-3xl pointer-events-none" />

      {/* Gold-purple gradient top border */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(42 87% 55%), hsl(260 50% 55%), hsl(42 87% 55%), transparent)' }}
      />

      <div className="p-8 md:p-10">
        {/* Urgency pill with animated count */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-foreground"
            style={{
              background: 'linear-gradient(135deg, hsl(42 87% 55% / 0.18), hsl(42 87% 55% / 0.06))',
              border: '1px solid hsl(42 87% 55% / 0.40)',
              boxShadow: '0 0 30px hsl(42 87% 55% / 0.18), inset 0 1px 0 hsl(42 87% 55% / 0.2)',
            }}
          >
            <Flame className="w-4 h-4 text-accent animate-pulse" />
            <span>
              <motion.span
                key={unlockCount}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="inline-block tabular-nums text-accent font-bold"
              >
                {unlockCount}
              </motion.span>
              {' '}couples unlocked this week · Launch price ending soon
            </span>
          </motion.div>
        </div>

        <div className="text-center mb-7">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
            Reveal{' '}
            <span className="text-gradient-gold">
              {person1Name} & {person2Name}'s
            </span>
            <br />Full Compatibility
          </h2>
          <p className="text-muted-foreground text-sm">
            You've unlocked Emotional Bond. 4 deeper dimensions await:
          </p>
        </div>

        {/* Avatar stack social proof */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="flex -space-x-3">
            {avatarStack.map((av, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: `linear-gradient(135deg, ${av.color}40, ${av.color}20)`,
                  border: `2px solid ${av.color}60`,
                  zIndex: 3 - i,
                  position: 'relative',
                }}
              >
                {av.initial}
              </motion.div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground/90">Priya, Ananya & 90+ others</p>
            <div className="flex items-center gap-0.5">
              {Array(5).fill(0).map((_, i) => (
                <span key={i} className="text-accent text-xs">★</span>
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">this week</span>
            </div>
          </div>
        </div>

        {/* Testimonial card */}
        <div
          className="glass-premium rounded-2xl p-5 border border-accent/15 mb-7"
          style={{ boxShadow: '0 4px 24px hsl(42 87% 55% / 0.06)' }}
        >
          <Quote className="w-5 h-5 text-accent/60 mb-2 rotate-180" />
          <p className="text-sm text-foreground/85 leading-relaxed italic mb-3">
            "I was skeptical, but the emotional bond analysis was spot-on. We've been together 3 years and it described our connection better than we could ourselves. Totally worth it."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-xs font-bold text-accent border border-accent/20">P</div>
            <div>
              <p className="text-xs font-semibold text-foreground/80">Priya & Vikram</p>
              <p className="text-[10px] text-muted-foreground">Mumbai · Partner Compatibility</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {Array(5).fill(0).map((_, i) => (
                <span key={i} className="text-accent text-sm">★</span>
              ))}
            </div>
          </div>
        </div>

        {/* Locked dimension teaser grid — dimension colors */}
        <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto mb-8">
          {teaserDimensions.map(({ label, icon, from, to }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.08 }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="w-14 h-14 rounded-2xl relative overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${from}18, ${to}0a)`,
                  border: `1px solid ${from}30`,
                }}
              >
                <span className="text-xl blur-[1.5px] opacity-40">{icon}</span>
                <div
                  className="absolute bottom-0 left-0 right-0 h-5 flex items-center justify-center"
                  style={{ background: `linear-gradient(0deg, ${from}40, transparent)` }}
                >
                  <Lock className="w-2.5 h-2.5 opacity-80" style={{ color: from }} />
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground/80 text-center leading-tight">{label}</span>
              <span className="text-xs font-bold" style={{ color: `${from}55` }}>??%</span>
            </motion.div>
          ))}
        </div>

        {/* Value stack */}
        <ul className="space-y-2.5 mb-7 max-w-sm mx-auto">
          {valueItems.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="flex items-start gap-3 text-sm text-foreground"
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-accent" />
              </div>
              {item}
            </motion.li>
          ))}
        </ul>

        {/* Launch progress bar — scarcity signal */}
        <div className="mb-6 max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">Launch slots filled</span>
            <span className="text-[11px] font-bold text-accent">7,439 / 10,000</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(42 87% 55%), hsl(42 90% 72%))' }}
              initial={{ width: '0%' }}
              animate={{ width: '74%' }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          <p className="text-[10px] text-accent/60 italic mt-1 text-center">Price increases after 10,000 reports</p>
        </div>

        {/* Pricing block */}
        <div className="text-center mb-6">
          <div
            className="inline-block rounded-2xl px-6 py-4 border border-accent/25"
            style={{
              background: 'linear-gradient(135deg, hsl(42 87% 55% / 0.09), hsl(260 50% 55% / 0.06))',
              boxShadow: '0 0 32px hsl(42 87% 55% / 0.12)',
            }}
          >
            <p className="text-xs text-muted-foreground mb-1.5">One-time unlock · Keep forever</p>
            <div className="flex items-baseline justify-center gap-2 mb-1.5">
              <span className="text-4xl font-serif font-bold text-accent" style={{ textShadow: '0 0 20px hsl(42 87% 55% / 0.4)' }}>₹149</span>
              <span className="text-sm text-muted-foreground line-through">₹499</span>
              <motion.span
                animate={{
                  scale: [1, 1.08, 1],
                  boxShadow: ['0 0 0px hsl(142 72% 50% / 0)', '0 0 16px hsl(142 72% 50% / 0.5)', '0 0 0px hsl(142 72% 50% / 0)'],
                }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                className="text-xs bg-green-500/20 text-green-400 font-bold px-3 py-1.5 rounded-full border border-green-500/30"
              >
                Save ₹350
              </motion.span>
            </div>
            <p className="text-xs text-accent/70 font-medium">
              ✦ Launch pricing — increases after 10,000 reports
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
          {/* Heartbeat glow wrapper on primary CTA */}
          <motion.div
            animate={{
              boxShadow: [
                '0 4px 20px hsl(42 87% 55% / 0.4)',
                '0 8px 40px hsl(42 87% 55% / 0.75), 0 0 60px hsl(42 87% 55% / 0.3)',
                '0 4px 20px hsl(42 87% 55% / 0.4)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="rounded-2xl flex-1"
          >
            <Button
              onClick={() => onUnlockClick('palmmatch149')}
              disabled={isProcessing}
              className="btn-gold text-foreground font-bold py-6 rounded-2xl w-full text-base"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex flex-col items-center gap-0.5 w-full">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Unlock Full Report
                    <ArrowRight className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-normal opacity-80">One-time · ₹149</span>
                </span>
              )}
            </Button>
          </motion.div>

          <Button
            variant="outline"
            onClick={() => onUnlockClick('monthly299')}
            disabled={isProcessing}
            className="border-accent/30 text-foreground hover:bg-accent/10 py-6 rounded-2xl text-sm flex flex-col gap-0.5 h-auto"
          >
            <span className="font-semibold">Monthly Plan</span>
            <span className="text-xs font-normal opacity-70">₹299/mo · unlimited readings</span>
          </Button>
        </div>

        {/* Guarantee + security */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 glass-premium rounded-full px-4 py-2 border border-green-500/20">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <p className="text-xs font-medium text-foreground/70">
              24-hour money-back guarantee — no questions asked
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3 text-accent" />
            Secure via Razorpay · UPI, Cards, Wallets accepted
          </div>
        </div>
      </div>
    </motion.div>
  );
}
