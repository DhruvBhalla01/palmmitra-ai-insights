import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles, Crown, Shield, Zap, Lock, ArrowRight, Check, Flame,
  Star, Heart, Briefcase, Activity, Calendar, Brain, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS } from '@/config/pricing';
import { useCurrency } from '@/hooks/useCurrency';

interface PremiumPaywallProps {
  premiumInsights: {
    marriageTiming: string;
    careerBreakthrough: string;
  };
  userName?: string;
  onUnlockClick?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const benefits = [
  { icon: Briefcase, label: 'Career',           hook: 'Breakthrough year + peak earning window' },
  { icon: Heart,     label: 'Marriage',         hook: 'Timing window + compatibility pattern'   },
  { icon: TrendingUp,label: 'Wealth',           hook: 'Money style + prosperity signals'        },
  { icon: Activity,  label: 'Health',           hook: 'Vitality markers + wellbeing cycles'     },
  { icon: Brain,     label: 'Personality',      hook: 'Mounts, temperament & hidden strengths'  },
  { icon: Calendar,  label: 'Future Guidance',  hook: '5-year timeline of your peak windows'    },
] as const;

const trustPills = [
  { icon: Shield, text: 'Razorpay secured' },
  { icon: Zap,    text: 'Instant unlock'   },
  { icon: Lock,   text: '100% private'     },
  { icon: Check,  text: 'Refund if unhappy'},
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PremiumPaywall({ premiumInsights, userName, onUnlockClick }: PremiumPaywallProps) {
  const { currency } = useCurrency();
  const insightPrice = PRODUCTS.insight.prices[currency].display;
  const elitePrice   = PRODUCTS.elite.prices[currency].display;
  const listPrice    = currency === 'INR' ? '₹299' : '$19.99';
  const reduce       = useReducedMotion();

  const teaserCards = [
    {
      badge: 'Marriage Timing',
      icon: Heart,
      preview: premiumInsights.marriageTiming,
    },
    {
      badge: 'Career Breakthrough',
      icon: Briefcase,
      preview: premiumInsights.careerBreakthrough,
    },
    {
      badge: 'Lucky Years 2026–2030',
      icon: Calendar,
      preview: 'Your 5-year peak window opens between the age of ██ and ██, with a decisive shift in ████.',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mb-14"
      aria-labelledby="paywall-heading"
    >
      <div className="relative rounded-[28px] overflow-hidden">
        {/* Outer gold glow */}
        <div
          aria-hidden="true"
          className="absolute -inset-[2px] rounded-[30px] opacity-70 blur-xl"
          style={{
            background:
              'conic-gradient(from 140deg at 50% 50%, hsl(42 87% 55% / 0.35), hsl(280 60% 55% / 0.15), hsl(42 87% 55% / 0.35))',
          }}
        />

        {/* Card */}
        <div
          className="relative rounded-[28px] border border-accent/40 backdrop-blur-2xl overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, hsl(245 58% 12% / 0.85) 0%, hsl(245 58% 8% / 0.95) 100%)',
            boxShadow: '0 30px 80px -20px hsl(42 87% 55% / 0.25), inset 0 1px 0 hsl(42 87% 55% / 0.2)',
          }}
        >
          {/* Aurora blob */}
          {!reduce && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full opacity-30 blur-3xl"
              style={{ background: 'radial-gradient(circle, hsl(42 87% 55% / 0.6), transparent 60%)' }}
              animate={{ x: ['-10%', '10%', '-10%'], y: [0, 20, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <div className="relative z-10 p-6 md:p-10">
            {/* Live pulse */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-xs md:text-sm font-medium text-foreground/90"
              >
                <Flame className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                <span>247 readings unlocked in the last 24 hours</span>
                <div className="flex" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Headline */}
            <div className="text-center mb-8 md:mb-10">
              <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-accent/80 font-semibold mb-3">
                PalmMitra Insight · Full Report
              </p>
              <h2
                id="paywall-heading"
                className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight tracking-tight"
              >
                Your Personalized Palm Analysis
                <br />
                <span className="text-gradient-gold">is Ready ✦</span>
              </h2>
              <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                A 12-page destiny report{userName ? ` crafted for ${userName}` : ''} —
                every line, mount, and life window decoded by PalmMitra AI.
              </p>
            </div>

            {/* Two-column: teaser stack + benefits */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Teaser preview stack */}
              <div className="space-y-3" aria-label="Locked preview of your report">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-1">
                  Locked in your report
                </p>
                {teaserCards.map(({ badge, icon: Icon, preview }, i) => (
                  <motion.div
                    key={badge}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    whileHover={reduce ? undefined : { y: -2, rotateX: 1.5 }}
                    className="relative rounded-2xl border border-border/50 bg-background/40 p-4 overflow-hidden group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-accent/12 border border-accent/25 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{badge}</span>
                      <Lock className="ml-auto w-3.5 h-3.5 text-accent/70" aria-hidden="true" />
                    </div>
                    <p
                      className="text-sm text-foreground/70 blur-[5px] select-none leading-relaxed"
                      aria-hidden="true"
                    >
                      {preview.slice(0, 140)}
                      {preview.length > 140 ? '…' : ''}
                    </p>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/70"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Benefits */}
              <div className="rounded-2xl border border-border/50 bg-background/30 p-5 md:p-6">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-4">
                  Everything you'll unlock
                </p>
                <ul className="space-y-3.5">
                  {benefits.map(({ icon: Icon, label, hook }, i) => (
                    <motion.li
                      key={label}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{hook}</p>
                      </div>
                      <Check className="w-4 h-4 text-accent/80 flex-shrink-0 mt-1" aria-hidden="true" />
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Primary CTA block */}
            <div className="relative rounded-2xl p-5 md:p-6 border border-accent/40 overflow-hidden"
                 style={{ background: 'linear-gradient(135deg, hsl(42 87% 55% / 0.08), hsl(42 87% 55% / 0.02))' }}>
              {!reduce && (
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    background:
                      'linear-gradient(110deg, transparent 30%, hsl(42 87% 55% / 0.25) 50%, transparent 70%)',
                    backgroundSize: '250% 100%',
                  }}
                  animate={{ backgroundPosition: ['200% 0%', '-100% 0%'] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                />
              )}

              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-4xl md:text-5xl font-bold text-gradient-gold leading-none">
                      {insightPrice}
                    </span>
                    <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/60">
                      {listPrice}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
                      Launch price
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    One-time payment · yours forever · downloadable PDF
                  </p>
                </div>
              </div>

              <motion.div
                whileHover={reduce ? undefined : { scale: 1.015 }}
                whileTap={reduce ? undefined : { scale: 0.985 }}
                className="relative"
              >
                <Button
                  onClick={onUnlockClick}
                  className="group relative w-full btn-gold rounded-2xl py-7 text-base md:text-lg font-bold gap-2 shadow-gold-lg"
                  aria-label={`Unlock full palm report for ${insightPrice}`}
                >
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                  Unlock Full Report — {insightPrice}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              </motion.div>

              {/* Trust pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {trustPills.map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 text-[11px] md:text-xs text-muted-foreground bg-background/40 border border-border/40 rounded-lg px-2.5 py-2"
                  >
                    <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{text}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground text-center mt-3">
                UPI · Credit/Debit Card · Wallets · Net Banking
              </p>
            </div>

            {/* Secondary upsell */}
            <button
              type="button"
              onClick={onUnlockClick}
              className="mt-5 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group"
            >
              <Crown className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>See what <b className="text-foreground">PalmMitra Elite</b> includes — {elitePrice} lifetime</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </button>

            {/* AI credibility */}
            <p className="text-center text-[11px] text-muted-foreground/80 mt-6">
              Analyzed by PalmMitra AI · trained on 10,000+ traditional readings ·
              private & never shared
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
