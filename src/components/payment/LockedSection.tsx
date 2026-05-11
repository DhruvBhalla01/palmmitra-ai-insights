import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
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

const sectionTeasers: Record<SectionKey, string> = {
  lines: "Your Heart, Head & Fate Lines reveal the exact years your biggest decisions will land.",
  mounts: "Your palm mounts carry the energy behind every major move — including ones you haven't made yet.",
  personality: "4 more personality layers hidden in your palm — including your hidden emotional driver.",
  career: "Your career turning point age, peak earning period, and wealth accumulation style — decoded.",
  love: "Your love line shows your deepest compatibility pattern and when deep commitment becomes possible.",
  phases: "Your growth window may be active right now. Your challenge phase and how to navigate it — revealed.",
  remedies: "2 personalised spiritual practices calibrated to your specific palm energy — ready to use.",
  blessing: "A personalised divine blessing drawn from your palm's unique destiny signature — yours to keep.",
  'palmmatch-communication': "Your communication styles decoded — where you naturally align and where friction hides.",
  'palmmatch-goals': "Your life timelines compared — when your ambitions converge and when they diverge.",
  'palmmatch-romance': "The romantic arc written in your palm lines — your peak connection window revealed.",
  'palmmatch-spiritual': "Your spiritual energies mapped — and the single practice that amplifies your bond.",
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

  const teaser = sectionKey
    ? sectionTeasers[sectionKey]
    : 'Unlock your complete reading to reveal this section.';
  const personalizedName = userName ? `${userName}'s` : 'This';

  return (
    <div className="relative mb-12">
      <div className="relative overflow-hidden rounded-2xl">
        {previewContent && (
          <div className="blur-md pointer-events-none select-none opacity-60">
            {previewContent}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-2xl border border-accent/20"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4"
          >
            <Lock className="w-8 h-8 text-accent" />
          </motion.div>

          <h3 className="text-lg font-serif font-bold text-foreground mb-2 text-center">
            {personalizedName} {sectionName}
          </h3>
          <p className="text-sm text-foreground/80 mb-2 text-center max-w-xs leading-relaxed">
            {teaser}
          </p>
          <p className="text-xs text-muted-foreground mb-5">
            2,847+ readings unlocked this month
          </p>

          <Button
            onClick={onUnlockClick}
            className="btn-gold rounded-xl px-6 py-3 gap-2"
          >
            Reveal This Section
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
