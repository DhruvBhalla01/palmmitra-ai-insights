import { m } from '@/lib/motion';
import { Lock, ArrowRight, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';
import { PRODUCTS } from '@/config/pricing';
import { useCurrency } from '@/hooks/useCurrency';

type SectionKey = 'lines' | 'mounts' | 'personality' | 'career' | 'love' | 'phases' | 'remedies' | 'blessing' | 'palmmatch-communication' | 'palmmatch-goals' | 'palmmatch-romance' | 'palmmatch-spiritual';

interface LockedSectionProps {
  isUnlocked: boolean;
  sectionName: string;
  children?: ReactNode;
  onUnlockClick: (placement?: string) => void;
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

/** Vary the social-proof microcopy so each locked card feels distinct. */
const socialProofBySection: Partial<Record<SectionKey, string>> = {
  lines:       '1,284 people revealed their lines this week',
  mounts:      '892 mount analyses unlocked in the last 7 days',
  personality: 'Avg. reader unlocks within 2 minutes of reading this',
  career:      '76% of readers unlock after seeing their career preview',
  love:        '2,140 love timelines revealed this month',
  phases:      'Your growth window may already be active — check inside',
  remedies:    'Hand-matched remedies · not generic advice',
  blessing:    'A one-of-a-kind blessing written for your palm',
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
  const { currency } = useCurrency();
  const insightPrice = PRODUCTS.insight.prices[currency].display;

  if (isUnlocked) {
    return <>{children}</>;
  }

  const teaserData = sectionKey
    ? sectionTeasers[sectionKey]
    : { teaser: 'Unlock your complete reading to reveal this section.', hook: '' };
  const personalizedName = userName ? `${userName}'s` : 'Your';
  const socialProof = (sectionKey && socialProofBySection[sectionKey]) ||
    '2,847+ readings unlocked this month';

  return (
    <div className="relative mb-6 sm:mb-10">
      <m.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45 }}
        className="relative glass-premium rounded-3xl border border-accent/25 p-5 sm:p-8 overflow-hidden"
      >
        {previewContent && <div className="hidden" aria-hidden="true" />}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4.5 h-4.5 text-accent" aria-hidden="true" />
          </div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-foreground leading-snug text-balance">
            {personalizedName} {sectionName}
          </h3>
        </div>

        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          {teaserData.teaser}
        </p>

        {/* Redacted preview lines */}
        <div aria-hidden="true" className="space-y-2 mb-4">
          <span className="redacted-bar block" style={{ width: '92%' }} />
          <span className="redacted-bar block" style={{ width: '78%' }} />
          <span className="redacted-bar block" style={{ width: '54%' }} />
        </div>

        {teaserData.hook && (
          <p className="flex items-start gap-2 text-xs text-foreground/70 italic mb-4">
            <Eye className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
            {teaserData.hook}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
          <Button
            onClick={() => onUnlockClick(`section_${sectionKey ?? 'generic'}`)}
            className="btn-gold rounded-xl w-full sm:w-auto px-6 gap-2 font-semibold text-sm whitespace-normal h-auto min-h-12"
          >
            Unlock {personalizedName.toLowerCase() === 'your' ? 'your' : personalizedName} {sectionName}
            <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          </Button>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-accent flex-shrink-0" aria-hidden="true" />
            {insightPrice} · {socialProof}
          </p>
        </div>
      </m.div>
    </div>
  );
}

