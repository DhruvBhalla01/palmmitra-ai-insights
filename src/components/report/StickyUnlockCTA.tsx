import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyUnlockCTAProps {
  userName?: string;
  onUnlockClick: () => void;
  isUnlocked: boolean;
}

const DISMISSED_KEY = 'sticky_cta_dismissed';

export function StickyUnlockCTA({ userName, onUnlockClick, isUnlocked }: StickyUnlockCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISSED_KEY) === 'true';
    setIsDismissed(dismissed);

    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, 'true');
  };

  if (isUnlocked || isDismissed) return null;

  const ctaText = userName
    ? `${userName}'s full reading is ready`
    : 'Your full reading is ready';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        >
          <div
            className="border-t border-accent/30 px-4 pt-3 pb-4 safe-area-bottom"
            style={{
              background: 'linear-gradient(180deg, hsl(245 58% 10% / 0.97), hsl(245 58% 8% / 0.99))',
              boxShadow: '0 -4px 30px hsl(42 87% 55% / 0.14)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Social proof row */}
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="text-accent text-xs">✦✦✦</span>
              <p className="text-[11px] text-muted-foreground">23 couples unlocked today · limited launch price</p>
              <span className="text-accent text-xs">✦✦✦</span>
            </div>

            <div className="flex items-center gap-2 mb-2.5">
              <p className="flex-1 text-sm font-medium text-foreground truncate">
                ✦ {ctaText}
              </p>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss"
                className="w-7 h-7 rounded-full bg-background/50 flex items-center justify-center flex-shrink-0 hover:bg-background transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <Button
              onClick={onUnlockClick}
              className="btn-gold w-full font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 text-base"
            >
              <Sparkles className="w-4 h-4" />
              Unlock Full Report — ₹149
            </Button>
            <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-accent" />
                Secure via Razorpay
              </span>
              <span>·</span>
              <span>Instant unlock</span>
              <span>·</span>
              <span>100% private</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
