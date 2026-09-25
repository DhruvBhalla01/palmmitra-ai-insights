import { Heart, ArrowRight } from 'lucide-react';
import { SmartLink } from '@/components/SmartLink';
import { Button } from '@/components/ui/button';
import { PRODUCTS } from '@/config/pricing';
import { useCurrency } from '@/hooks/useCurrency';
import { analytics } from '@/lib/analytics';

interface Props {
  hinglish?: boolean;
}

/** Cross-sell card shown after a report is unlocked — suggests PalmMatch compatibility. */
export function PalmMatchCrossSell({ hinglish }: Props) {
  const { currency } = useCurrency();
  const price = PRODUCTS.palmmatch.prices[currency].display;

  return (
    <section
      aria-label={hinglish ? 'PalmMatch compatibility' : 'PalmMatch compatibility'}
      className="glass-premium rounded-2xl border border-accent/25 p-5 sm:p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center flex-shrink-0">
        <Heart className="w-5 h-5 text-accent" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-serif font-bold text-foreground text-lg leading-snug">
          {hinglish ? 'Kisi ke saath compatibility jaan ni hai?' : 'Curious about compatibility with someone?'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {hinglish
            ? 'PalmMatch dono ke palm compare karke relationship timing, strengths aur challenges batata hai.'
            : 'PalmMatch compares both palms to reveal relationship timing, strengths and challenges.'}
        </p>
      </div>
      <SmartLink
        to="/palmmatch"
        onClick={() => analytics.track('cta_clicked', { cta: 'palmmatch_cross_sell', location: 'report_unlocked' })}
        className="w-full sm:w-auto flex-shrink-0"
      >
        <Button className="btn-gold rounded-xl min-h-12 px-6 gap-2 font-semibold w-full">
          {hinglish ? `PalmMatch try karein — ${price}` : `Try PalmMatch — ${price}`}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </SmartLink>
    </section>
  );
}
