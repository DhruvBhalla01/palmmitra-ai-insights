import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const listPrice = listPriceOverride ?? (currency === 'INR' ? '₹299' : '$19.99');

  useEffect(() => {
    setIsDismissed(sessionStorage.getItem(DISMISSED_KEY) === 'true');
    const handleScroll = () => setIsVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, 'true');
  };

  if (isUnlocked || isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
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
            className="px-4 pt-3 pb-4 safe-area-bottom relative"
            style={{
              background: 'linear-gradient(180deg, hsl(245 58% 10% / 0.98), hsl(245 58% 7% / 0.99))',
              boxShadow: '0 -10px 40px hsl(42 87% 55% / 0.18)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Dismiss */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss unlock bar"
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/60 flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="text-accent text-[10px]">✦</span>
              <p className="text-[11px] text-muted-foreground">
                {socialProof ?? '23 unlocked in the last hour · launch price'}
              </p>
              <span className="text-accent text-[10px]">✦</span>
            </div>

            {/* Price + CTA row */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-2xl font-bold text-gradient-gold leading-none">{price}</span>
                  <span className="text-xs text-muted-foreground line-through">{listPrice}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{subLabel ?? 'One-time · forever'}</p>
              </div>

              <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
                <Button
                  onClick={onUnlockClick}
                  className="btn-gold w-full font-bold py-5 rounded-xl flex items-center justify-center gap-1.5 text-sm shadow-gold"
                  aria-label={`Unlock full report for ${price}`}
                >
                  <Sparkles className="w-4 h-4" />
                  {ctaLabel ?? `Unlock ${userName ? `${userName.split(' ')[0]}'s` : 'Full'} Report`}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            {/* Trust chips */}
            <div className="flex items-center justify-center gap-3 mt-2.5 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-accent" /> Razorpay
              </span>
              <span className="opacity-50">·</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-accent" /> Instant
              </span>
              <span className="opacity-50">·</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-accent" /> Private
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
