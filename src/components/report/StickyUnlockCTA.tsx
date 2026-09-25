import { useState, useEffect } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { Sparkles, X, Shield, Zap, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS } from '@/config/pricing';
import { useCurrency } from '@/hooks/useCurrency';

interface StickyUnlockCTAProps {
  userName?: string;
  onUnlockClick: () => void;
  isUnlocked: boolean;
  ctaLabel?: string;
  subLabel?: string;
  priceOverride?: string;
  listPriceOverride?: string;
  socialProof?: string;
}

const DISMISSED_KEY = 'sticky_cta_dismissed';

export function StickyUnlockCTA({
  userName, onUnlockClick, isUnlocked,
  ctaLabel, subLabel, priceOverride, listPriceOverride, socialProof,
}: StickyUnlockCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { currency } = useCurrency();
  const price     = priceOverride ?? PRODUCTS.insight.prices[currency].display;
  const listPrice = listPriceOverride ?? PRODUCTS.insight.listPrices[currency];

  useEffect(() => {
    setIsDismissed(sessionStorage.getItem(DISMISSED_KEY) === 'true');
    // Show once the top teaser has scrolled past; hide while the bottom paywall is on screen.
    const update = () => {
      const teaser = document.getElementById('unlock-teaser');
      const paywall = document.getElementById('premium-paywall');
      const vh = window.innerHeight;
      const pastTeaser = teaser ? teaser.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
      const pr = paywall?.getBoundingClientRect();
      const paywallVisible = pr ? pr.top < vh && pr.bottom > 0 : false;
      setIsVisible(pastTeaser && !paywallVisible);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, 'true');
  };

  if (isUnlocked || isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        >
          {/* Gold gradient top hairline */}
          <div
            aria-hidden="true"
            className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(42 87% 55% / 0.7), transparent)' }}
          />
          <div
            className="pl-4 pr-9 py-3 safe-area-bottom relative"
            style={{
              background: 'linear-gradient(180deg, hsl(245 58% 10% / 0.98), hsl(245 58% 7% / 0.99))',
              boxShadow: '0 -10px 40px hsl(42 87% 55% / 0.18)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss unlock bar"
              className="absolute top-1/2 -translate-y-1/2 right-1.5 w-7 h-7 rounded-full flex items-center justify-center hover:bg-background/60 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 max-w-[42%] min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-xl font-bold text-gradient-gold leading-none">{price}</span>
                  <span className="text-[11px] text-muted-foreground line-through">{listPrice}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 min-w-0">
                  <Shield className="w-2.5 h-2.5 text-accent flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{subLabel ?? 'One-time · instant'}</span>
                </p>
              </div>

              <m.div whileTap={{ scale: 0.97 }} className="flex-1 min-w-0">
                <Button
                  onClick={onUnlockClick}
                  className="btn-gold w-full font-bold h-12 rounded-xl flex items-center justify-center gap-1.5 text-sm shadow-gold px-3"
                  aria-label={`Unlock full report for ${price}`}
                >
                  <Sparkles className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{ctaLabel ?? `Reveal ${userName ? `${userName.split(' ')[0]}'s` : 'My'} Report`}</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                </Button>
              </m.div>
            </div>
            {socialProof && <p className="sr-only">{socialProof}</p>}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
