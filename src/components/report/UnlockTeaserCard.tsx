import { Lock, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS, formatCurrency } from '@/config/pricing';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  clue?: string;
  userName?: string;
  hinglish?: boolean;
  onUnlockClick: () => void;
}

/** First-screen personal clue + early price, shown under the report header when locked. */
export function UnlockTeaserCard({ clue, userName, hinglish, onUnlockClick }: Props) {
  const { currency } = useCurrency();
  const price = PRODUCTS.insight.prices[currency];
  const listPrice = formatCurrency(Math.round(price.minor * 499 / 299), currency);
  const words = (clue || '').trim().split(/\s+/).filter(Boolean);
  const visible = words.slice(0, Math.min(8, Math.ceil(words.length / 3))).join(' ');
  const hidden = words.slice(Math.min(8, Math.ceil(words.length / 3))).join(' ');

  return (
    <section aria-label="Unlock your full reading" className="glass-premium rounded-2xl border border-accent/30 p-5 sm:p-6 mb-8">
      <p className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold mb-2 flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
        {hinglish ? 'Aapke palm mein chhupa clue' : 'A clue hidden in your palm'}
      </p>
      {visible && (
        <p className="text-sm sm:text-base text-foreground leading-relaxed mb-4">
          {visible}{' '}
          <span className="blur-[5px] select-none" aria-hidden="true">{hidden || 'your full timing and details are inside'}</span>
        </p>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button onClick={onUnlockClick} className="btn-gold rounded-xl min-h-12 px-6 gap-2 font-semibold w-full sm:w-auto">
          {hinglish ? `${userName ? userName + ' ki' : 'Apni'} full reading dekhein` : `Reveal ${userName ? userName + "'s" : 'your'} full reading`}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="text-foreground font-semibold">{price.display}</span>
          <span className="line-through">{listPrice}</span>
          <span>· {hinglish ? 'ek baar · turant unlock' : 'one-time · instant unlock'}</span>
          <Shield className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
