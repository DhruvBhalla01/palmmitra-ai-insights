import { m } from '@/lib/motion';
import { Sparkles, Calendar, Shield, Crown, Briefcase, Heart, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ReportHeaderProps {
  name: string;
  readingType: string;
  generatedAt: string;
  headlineSummary: string;
  palmImage?: string;
  isUnlocked?: boolean;
  hinglish?: boolean;
}

const readingTypeLabels: Record<string, string> = {
  full: 'Complete Destiny Reading',
  career: 'Career & Wealth Focus',
  love: 'Love & Relationship Focus',
  wealth: 'Prosperity Focus',
};

// Page title used for the report's top-level <h1> heading
export const reportTitles: Record<string, string> = {
  full: 'Destiny Report',
  career: 'Career & Wealth Report',
  love: 'Love & Relationship Report',
  wealth: 'Prosperity Report',
};

const readingTypeIcons: Record<string, LucideIcon> = {
  full: Crown,
  career: Briefcase,
  love: Heart,
  wealth: TrendingUp,
};

/** Single combined "passport" card: palm photo, identity, and the key insight. */
export function ReportHeader({
  name,
  readingType,
  generatedAt,
  headlineSummary,
  palmImage,
  isUnlocked,
  hinglish,
}: ReportHeaderProps) {
  const formattedDate = new Date(generatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const ReadingIcon = readingTypeIcons[readingType] || Crown;

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-6"
    >
      <div className="relative glass-premium rounded-3xl border border-accent/30 p-5 sm:p-8 overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <div aria-hidden="true" className="absolute -top-16 -right-16 w-56 h-56 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-4 sm:gap-6">
          {palmImage && (
            <div className="relative flex-shrink-0">
              <div aria-hidden="true" className="absolute -inset-1 bg-gradient-gold rounded-2xl blur opacity-30" />
              <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-accent/50 shadow-gold">
                <img
                  src={palmImage}
                  alt={`Your uploaded palm photograph, analyzed for this ${reportTitles[readingType] ?? 'palm reading'}`}
                  className="w-full h-full object-cover"
                />
                <m.div
                  aria-hidden="true"
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/70 to-transparent"
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-serif text-lg sm:text-2xl font-semibold text-foreground leading-tight truncate">
              <span className="text-gradient-gold">{name}</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-foreground/80">
              <ReadingIcon className="w-3.5 h-3.5 text-accent flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{readingTypeLabels[readingType] || 'Palm Reading'}</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {formattedDate}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary">
                <Shield className="w-3 h-3" aria-hidden="true" /> Verified
              </span>
              {isUnlocked && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/40 text-[11px] font-semibold text-accent">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  {hinglish ? 'Full reading unlocked' : 'Full reading unlocked'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="relative my-5 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        <div className="relative">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-accent uppercase tracking-[0.18em] mb-2">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Key Destiny Insight
          </p>
          <p className="font-serif text-base sm:text-xl text-foreground leading-relaxed">
            "{headlineSummary}"
          </p>
        </div>
      </div>
    </m.div>
  );
}
