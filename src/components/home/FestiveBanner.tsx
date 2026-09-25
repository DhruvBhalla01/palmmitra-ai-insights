import { Sparkles } from 'lucide-react';
import { SmartLink } from '@/components/SmartLink';
import { analytics } from '@/lib/analytics';

/**
 * Seasonal festive banner (Diwali / Karva Chauth / wedding season).
 * Switchable: set ENABLED to false to hide it everywhere after the season,
 * or edit the copy to re-theme it. No price changes, no countdowns.
 */
const ENABLED = true;

export const FestiveBanner = () => {
  if (!ENABLED) return null;

  return (
    <section aria-label="Festive season" className="container mx-auto px-4 mt-6 max-w-3xl">
      <SmartLink
        to="/palmmatch"
        className="block rounded-2xl border border-accent/40 bg-gradient-to-r from-accent/10 via-card/70 to-accent/10 backdrop-blur p-5 md:p-6 text-center hover:border-accent/70 transition-colors"
        onClick={() => analytics.track('cta_clicked', { placement: 'festive_banner', target: '/palmmatch' })}
      >
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-accent mb-2">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          Festive Season
        </p>
        <h2 className="font-serif text-lg md:text-xl text-foreground mb-1">
          This Diwali, discover what your palms say about the two of you
        </h2>
        <p className="text-sm text-muted-foreground mb-1">
          A PalmMatch compatibility reading makes a meaningful festive gift for couples.
        </p>
        <p className="text-xs text-muted-foreground/80 mb-3">
          Is Diwali, jaaniye aap dono ki hast rekhayein kya kehti hain — ek meaningful tyohar gift.
        </p>
        <span className="inline-flex items-center text-sm font-medium text-accent">
          Try PalmMatch for couples →
        </span>
      </SmartLink>
    </section>
  );
};
