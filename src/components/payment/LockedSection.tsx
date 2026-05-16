import { motion } from 'framer-motion';
import { Lock, ArrowRight, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

type SectionKey = 'lines' | 'mounts' | 'personality' | 'career' | 'love' | 'phases' | 'remedies' | 'blessing' | 'palmmatch-communication' | 'palmmatch-goals' | 'palmmatch-romance' | 'palmmatch-spiritual';

interface LockedSectionProps {
  isUnlocked: boolean;
  sectionName: string;
  children?: ReactNode;
  onUnlockClick: () => void;
  previewContent?: ReactNode;
  sectionKey?: SectionKey;
  userName?: string;
}

const sectionTeasers: Record<SectionKey, { teaser: string; hook: string }> = {
  lines: {
    teaser: "Your Heart, Head & Fate Lines reveal the exact years your biggest decisions will land.",
    hook: "Most people's fate line holds a surprise turn they weren't expecting.",
  },
  mounts: {
    teaser: "Your palm mounts carry the energy behind every major move — including ones you haven't made yet.",
    hook: "The Mount of Jupiter tells you if leadership is already written in your palm.",
  },
  personality: {
    teaser: "4 more personality layers hidden in your palm — including your hidden emotional driver.",
    hook: "Your hidden emotional driver shapes every major relationship you'll ever have.",
  },
  career: {
    teaser: "Your career turning point age, peak earning period, and the industries built for your palm.",
    hook: "The Fate Line knows your career peak year — it's more specific than you'd expect.",
  },
  love: {
    teaser: "Your Heart Line shows your deepest compatibility pattern and when lasting love becomes possible.",
    hook: "Your love line has an age — the window when the deepest bond forms is encoded here.",
  },
  phases: {
    teaser: "Your growth window may be active right now. Your challenge phase and how to navigate it — revealed.",
    hook: "Your life phase timeline shows whether you're entering your peak window or still building to it.",
  },
  remedies: {
    teaser: "4 more spiritual practices calibrated specifically to your palm's energy patterns.",
    hook: "One of these remedies directly addresses your most persistent life obstacle.",
  },
  blessing: {
    teaser: "A personalised divine blessing drawn from your palm's unique destiny signature — yours to keep.",
    hook: "Every blessing is uniquely worded to your palm — no two are ever the same.",
  },
  'palmmatch-communication': {
    teaser: "Your communication styles decoded — where you naturally align and where friction hides.",
    hook: "Most relationship conflicts trace back to one palm incompatibility pattern.",
  },
  'palmmatch-goals': {
    teaser: "Your life timelines compared — when your ambitions converge and when they diverge.",
    hook: "Your goal alignment window is more specific than most couples realise.",
  },
  'palmmatch-romance': {
    teaser: "The romantic arc written in your combined palm lines — your peak connection window revealed.",
    hook: "Your palm reveals the exact phase when romantic energy peaks between you two.",
  },
  'palmmatch-spiritual': {
    teaser: "Your spiritual energies mapped — and the single practice that amplifies your bond.",
    hook: "One shared practice can powerfully strengthen what's already working between you.",
  },
};

export function LockedSection({
  isUnlocked,
  sectionName,
  children,
  onUnlockClick,
  previewContent,
  sectionKey,
  userName,
}: LockedSectionProps) {
  if (isUnlocked) {
    return <>{children}</>;
  }

  const teaserData = sectionKey
    ? sectionTeasers[sectionKey]
    : { teaser: 'Unlock your complete reading to reveal this section.', hook: '' };
  const personalizedName = userName ? `${userName}'s` : 'Your';

  return (
    <div className="relative mb-12">
      <div className="relative overflow-hidden rounded-2xl">
        {previewContent && (
          <div className="blur-md pointer-events-none select-none opacity-50" aria-hidden="true">
            {previewContent}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/78 to-background/96 backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-2xl border border-accent/25"
        >
          {/* Lock icon with glow */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 border border-accent/25"
          >
            <Lock className="w-7 h-7 text-accent" aria-hidden="true" />
            <div className="absolute inset-0 rounded-2xl bg-accent/10 blur-lg" />
          </motion.div>

          {/* Section title */}
          <h3 className="text-base font-serif font-bold text-foreground mb-1.5 text-center">
            {personalizedName} {sectionName}
          </h3>

          {/* Teaser text */}
          <p className="text-sm text-foreground/80 mb-2 text-center max-w-xs leading-relaxed">
            {teaserData.teaser}
          </p>

          {/* Hook */}
          {teaserData.hook && (
            <div className="flex items-start gap-2 mb-4 px-4 py-3 rounded-xl bg-accent/8 border border-accent/15 max-w-xs">
              <Eye className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-foreground/70 leading-relaxed italic">
                {teaserData.hook}
              </p>
            </div>
          )}

          {/* Social proof */}
          <p className="text-xs text-muted-foreground mb-5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-accent" aria-hidden="true" />
            2,847+ readings unlocked this month
          </p>

          <Button
            onClick={onUnlockClick}
            className="btn-gold rounded-xl px-7 py-3.5 gap-2 font-semibold"
          >
            Reveal {sectionName}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>

          <p className="text-xs text-muted-foreground/60 mt-3">One-time ₹99 · Unlocks entire report · PDF included</p>
        </motion.div>
      </div>
    </div>
  );
}
