import { Lock, ArrowRight, Shield, Zap, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS, formatCurrency } from '@/config/pricing';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  clue?: string;
  userName?: string;
  hinglish?: boolean;
  onUnlockClick: () => void;
}

/** Turns hidden words into gold redacted bars sized to each word. */
function Redacted({ words }: { words: string[] }) {
  const list = words.length ? words : ['your', 'full', 'timing', 'and', 'details', 'inside'];
  return (
    <span aria-hidden="true" className="select-none">
      {list.slice(0, 10).map((w, i) => (
        <span key={i} className="redacted-bar mr-1.5" style={{ width: `${Math.min(6, Math.max(1.4, w.length * 0.5))}em` }} />
      ))}
    </span>
  );
}

/** First-screen personal clue + early price, shown under the report header when locked. */
export function UnlockTeaserCard({ clue, userName, hinglish, onUnlockClick }: Props) {
  const { currency } = useCurrency();
  const price = PRODUCTS.insight.prices[currency];
  const listPrice = formatCurrency(Math.round(price.minor * 499 / 299), currency);
  const words = (clue || '').trim().split(/\s+/).filter(Boolean);
  const cut = Math.min(8, Math.ceil(words.length / 3));
  const visible = words.slice(0, cut).join(' ');
  const hidden = words.slice(cut);
  const first = userName?.split(' ')[0];

  return (
    <section
      id="unlock-teaser"
      aria-label="Unlock your full reading"
      className="relative glass-premium rounded-3xl border border-accent/35 p-5 sm:p-7 mb-6 overflow-hidden shadow-gold"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      <p className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold mb-2.5 flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
        {hinglish ? 'Aapke palm mein chhupa clue' : 'A clue hidden in your palm'}
      </p>
      {visible && (
        <p className="font-serif text-base sm:text-lg text-foreground leading-relaxed mb-5">
          {visible}{' '}<Redacted words={hidden} />
        </p>
      )}

      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-serif text-2xl font-bold text-gradient-gold leading-none">{price.display}</span>
        <span className="text-sm text-muted-foreground line-through">{listPrice}</span>
        <span className="text-xs text-muted-foreground">· {hinglish ? 'ek baar · turant unlock' : 'one-time · instant unlock'}</span>
      </div>

      <Button onClick={onUnlockClick} className="btn-gold w-full rounded-xl h-[52px] gap-2 font-semibold text-base">
        {hinglish ? `${first ? first + ' ki' : 'Apni'} full reading dekhein` : `Reveal ${first ? first + "'s" : 'your'} full reading`}
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Button>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-accent" aria-hidden="true" />Razorpay</span>
        <span className="opacity-40">·</span>
        <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-accent" aria-hidden="true" />UPI / Cards</span>
        <span className="opacity-40">·</span>
        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-accent" aria-hidden="true" />{hinglish ? 'Turant' : 'Instant'}</span>
        <span className="opacity-40">·</span>
        <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-accent" aria-hidden="true" />Private</span>
      </div>
    </section>
  );
}
